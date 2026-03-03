import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';

export const PRICES = {
  monthly: 'price_1T5qR73mGGLWOr1rveS7lc2A',
  yearly:  'price_1T5qSg3mGGLWOr1rmmkQNJgu',
};

export const redirectToCheckout = async ({ priceId, promoCode }) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    alert('Please log in first.');
    return;
  }
  try {
    const functions = getFunctions();
    const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
    const result = await createCheckoutSession({
      priceId,
      promoCode: promoCode || null,
      uid: user.uid,
    });
    if (result.data?.url) {
      window.location.href = result.data.url;
    } else {
      throw new Error('No checkout URL returned');
    }
  } catch (err) {
    console.error('Checkout error:', err);
    alert('Payment error: ' + err.message);
  }
};