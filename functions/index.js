const { onRequest, onCall } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();
setGlobalOptions({ region: "us-central1" });

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");
const GROQ_API_KEY = defineSecret("GROQ_API_KEY");
const geminiGenerateHttp = require("./geminiGenerate");
const parseJobHttp = require("./parseJob");

/** Gemini proxy for Hosting rewrite /api/generate. Run: firebase functions:secrets:set GEMINI_API_KEY */
exports.geminiGenerate = onRequest(
  { cors: true, secrets: [GEMINI_API_KEY, GROQ_API_KEY] },
  (req, res) => {
    process.env.GEMINI_API_KEY = GEMINI_API_KEY.value();
    process.env.GROQ_API_KEY = GROQ_API_KEY.value();
    return geminiGenerateHttp(req, res);
  }
);

exports.parseJob = onRequest({ cors: true }, parseJobHttp);

/* ─────────────── STRIPE INIT ─────────────── */
const getStripe = () => {
  const secret = (process.env.STRIPE_SECRET || "").trim();
  console.log("STRIPE_SECRET length:", secret.length, "first 10:", secret.substring(0, 10));
  if (!secret) throw new Error("STRIPE_SECRET not set");
  return require("stripe")(secret);
};

const ALLOWED_PRICES = [
  "price_1T5qR73mGGLWOr1rveS7lc2A", // monthly
  "price_1T5qSg3mGGLWOr1rmmkQNJgu", // yearly
];

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://my-ai-project-93644.web.app",
  "https://my-ai-project-93644.firebaseapp.com",
  "https://my-cv-ai.vercel.app",
  "https://myailetter.vercel.app", 
  "https://ailetter.pro",
  "https://www.ailetter.pro",
];


/* ─────────────── WEBHOOK ─────────────── */
exports.stripeWebhook = onRequest(
  {
    secrets: ["STRIPE_SECRET", "STRIPE_WEBHOOK_SECRET"],
    rawBody: true,
  },
  async (req, res) => {

    const stripe = getStripe();
    const sig = req.headers["stripe-signature"];
    const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || "").trim();

    if (!sig) return res.status(400).send("No signature");
    if (!webhookSecret) return res.status(500).send("Webhook secret missing");

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature failed:", err.message);
      return res.status(400).send("Signature error");
    }

    console.log("Webhook received:", event.type);
    const obj = event.data.object;

    /* ───────── CHECKOUT COMPLETE ───────── */
    if (event.type === "checkout.session.completed") {
      const session = obj;
      let uid = session.metadata?.firebaseUID;

      if (!uid && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        uid = sub.metadata?.firebaseUID;
      }

      console.log("UID resolved:", uid);

      if (!uid) {
        console.error("No firebaseUID found");
        return res.json({ received: true });
      }

      const subscription = await stripe.subscriptions.retrieve(session.subscription);

      if (subscription.status !== "active") {
        console.error("Subscription not active:", subscription.status);
        return res.json({ received: true });
      }

      const periodEnd = Number(subscription.current_period_end);

      await db.collection("users").doc(uid).set({
        plan: "pro",
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        planStarted: admin.firestore.FieldValue.serverTimestamp(),
        planExpiry: Number.isFinite(periodEnd)
          ? admin.firestore.Timestamp.fromMillis(periodEnd * 1000)
          : null,
      }, { merge: true });

      console.log("✅ Pro activated for uid:", uid);
    }

    /* ───────── SUBSCRIPTION DELETED ───────── */
    if (event.type === "customer.subscription.deleted") {
      const snap = await db.collection("users")
        .where("stripeCustomerId", "==", obj.customer)
        .limit(1)
        .get();

      if (!snap.empty) {
        await snap.docs[0].ref.update({
          plan: "free",
          stripeSubscriptionId: null,
          planExpiry: admin.firestore.FieldValue.delete(),
        });
        console.log("⬇️ Downgraded:", obj.customer);
      }
    }

    /* ───────── SUBSCRIPTION UPDATED ───────── */
    if (event.type === "customer.subscription.updated") {
      const snap = await db.collection("users")
        .where("stripeCustomerId", "==", obj.customer)
        .limit(1)
        .get();

      if (!snap.empty) {
        const isActive = obj.status === "active";
        await snap.docs[0].ref.update({
          plan: isActive ? "pro" : "free",
          planExpiry: isActive
            ? admin.firestore.Timestamp.fromMillis(obj.current_period_end * 1000)
            : admin.firestore.FieldValue.delete(),
        });
        console.log("Subscription status updated:", obj.status);
      }
    }

    res.json({ received: true });
  }
);


/* ─────────────── CHECKOUT SESSION ─────────────── */
exports.createCheckoutSession = onCall(
  { secrets: ["STRIPE_SECRET"] },
  async (request) => {

    console.log("createCheckoutSession called");

    if (!request.auth) throw new Error("unauthenticated");

    const stripe = getStripe();
    const { priceId, coupon } = request.data;
    const uid   = request.auth.uid;
    const email = request.auth.token.email;

    if (!ALLOWED_PRICES.includes(priceId))
      throw new Error("invalid-price-id");

    const referer = request.rawRequest?.headers?.referer || "";
    const origin  = ALLOWED_ORIGINS.find(o => referer.startsWith(o)) || "https://ailetter.pro";

    const params = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?success=true`,
      cancel_url:  `${origin}/dashboard?canceled=true`,
      customer_email: email,
      metadata: { firebaseUID: uid },
      subscription_data: { metadata: { firebaseUID: uid } },
      allow_promotion_codes: true,
    };

    if (coupon) {
      try {
        await stripe.coupons.retrieve(coupon);
        params.discounts = [{ coupon }];
      } catch {
        console.warn("Invalid coupon ignored:", coupon);
      }
    }

    const session = await stripe.checkout.sessions.create(params);
    console.log("Session created:", session.id);

    return { url: session.url };
  }
);


/* ─────────────── VERIFY PLAN ─────────────── */
exports.verifyPlan = onCall(async (request) => {

  if (!request.auth) throw new Error("unauthenticated");

  const uid     = request.auth.uid;
  const userDoc = await db.collection("users").doc(uid).get();

  if (!userDoc.exists()) return { isPro: false };

  const data = userDoc.data();
  const expiry =
    data.planExpiry?.toDate?.() ||
    (data.planExpiry ? new Date(data.planExpiry) : null);

  const isPro = data.plan === "pro" && (!expiry || expiry > new Date());

  return { isPro, plan: data.plan };
});


/* ─────────────── CUSTOMER PORTAL ─────────────── */
exports.createPortalSession = onCall(
  { secrets: ["STRIPE_SECRET"] },
  async (request) => {
    if (!request.auth) throw new Error("unauthenticated");

    const stripe = getStripe();
    const uid = request.auth.uid;

    const userDoc = await db.collection("users").doc(uid).get();
    const customerId = userDoc.data()?.stripeCustomerId;

    if (!customerId) throw new Error("no-customer");

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: "https://ailetter.pro/dashboard",
    });

    return { url: session.url };
  }
);