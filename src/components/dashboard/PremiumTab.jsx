import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { redirectToCheckout, PRICES } from '../../stripe';
import { UpgradeTranslations } from '../UpgradeModal';
import { db } from '../../firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

export default function PremiumTab({ isPro, planLoading, bonusGenerations = 0, getMonthlyCount, showNotification }) {
  const { user } = useAuth();
  const { uiLang } = useLanguage();
  const t = UpgradeTranslations[uiLang] || UpgradeTranslations.en;
  
  const [billing, setBilling] = useState('yearly');
  const [stripeLoading, setStripeLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareClaimed, setShareClaimed] = useState(false);

  const usageCount = getMonthlyCount ? getMonthlyCount() : 0;
  const totalLimit = 5 + (bonusGenerations || 0);

  const handleUpgrade = async () => {
    if (!user) return;
    setStripeLoading(true);
    setError('');
    try {
      await redirectToCheckout({
        priceId: billing === 'yearly' ? PRICES.yearly : PRICES.monthly,
      });
    } catch (e) {
      console.error(e);
      setError('Payment initialization failed. Please try again.');
      setStripeLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!user) return;
    const refLink = `https://ailetter.pro/?ref=${user.uid}`;
    navigator.clipboard.writeText(refLink);
    setCopiedLink(true);
    showNotification && showNotification(uiLang === 'uk' ? 'Посилання скопійовано! ✓' : 'Referral link copied! ✓');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleShareClick = async (platform) => {
    if (!user) return;
    
    const shareUrl = "https://ailetter.pro";
    const shareText = "Write professional, highly personalized cover letters in seconds with AI! Try @AIletter";
    
    let url = "";
    if (platform === "linkedin") {
      url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    } else {
      url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    }
    
    window.open(url, '_blank', 'width=600,height=400');

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        bonusGenerations: increment(2)
      });
      setShareClaimed(true);
      showNotification && showNotification(uiLang === 'uk' ? '+2 додаткові генерації нараховано! ✓' : '+2 bonus generations credited! ✓');
    } catch (err) {
      console.error('Error crediting share reward:', err);
    }
  };

  const proFeatures = [
    '∞  Unlimited generations',
    '🎨  All 9 CV & 16 cover letter templates',
    '📄  DOCX + PDF export without delays',
    '🕐  Unlimited history save & sync',
    '⚡  Priority AI model (Gemini Pro)',
    '🔗  LinkedIn connection note generator',
    '🚫  No watermark on generated PDFs',
  ];

  const priceVal = billing === 'yearly' ? '€39/year' : '€6/month';

  const labels = {
    en: {
      statusTitle: 'Active Subscription',
      freePlan: 'Free Plan',
      proPlan: '✦ Pro Member',
      usage: 'Monthly Usage',
      generations: 'Generations',
      bonuses: 'Bonus generations earned',
      unlimited: 'Unlimited',
      featuresTitle: 'Pro Plan Features',
      shareSectionTitle: '🎁 Referral Program (Get Free Credits)',
      shareSectionDesc: 'Share AIletter on social media or invite friends to receive permanent bonus generation credits instantly!',
    },
    uk: {
      statusTitle: 'Поточний тарифний план',
      freePlan: 'Безкоштовний тариф',
      proPlan: '✦ Учасник Pro',
      usage: 'Використання за місяць',
      generations: 'Генерацій',
      bonuses: 'Отримано бонусних генерацій',
      unlimited: 'Безлімітно',
      featuresTitle: 'Переваги підписки Pro',
      shareSectionTitle: '🎁 Реферальна програма (Отримай бонуси)',
      shareSectionDesc: 'Поділіться AIletter у соцмережах або запросіть друзів, щоб миттєво отримати додаткові ліміти на генерації!',
    },
    it: {
      statusTitle: 'Abbonamento Attivo',
      freePlan: 'Piano Gratuito',
      proPlan: '✦ Membro Pro',
      usage: 'Utilizzo Mensile',
      generations: 'Generazioni',
      bonuses: 'Generazioni bonus guadagnate',
      unlimited: 'Illimitato',
      featuresTitle: 'Vantaggi del Piano Pro',
      shareSectionTitle: '🎁 Programma di Invito (Crediti Gratis)',
      shareSectionDesc: 'Condividi AIletter sui social o invita un amico per ricevere crediti bonus istantanei!',
    },
    de: {
      statusTitle: 'Aktives Abonnement',
      freePlan: 'Kostenloser Plan',
      proPlan: '✦ Pro-Mitglied',
      usage: 'Monatliche Nutzung',
      generations: 'Generierungen',
      bonuses: 'Verdiente Bonus-Generierungen',
      unlimited: 'Unbegrenzt',
      featuresTitle: 'Vorteile des Pro-Plans',
      shareSectionTitle: '🎁 Empfehlungsprogramm (Gratis-Credits)',
      shareSectionDesc: 'Teilen Sie AIletter in den sozialen Medien oder laden Sie Freunde ein, um sofort Bonus-Generierungen zu erhalten!',
    }
  };

  const l = labels[uiLang] || labels.en;

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-[#0f172a] text-slate-100 custom-scrollbar">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          {uiLang === 'uk' ? '✦ Premium та Бонуси' : '✦ Pro & Rewards'}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {uiLang === 'uk' ? 'Керуйте вашою підпискою, переглядайте ліміти та отримуйте бонуси за запрошення друзів.' : 'Manage your subscription, check generation usage, and invite friends for free credits.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Plan Status & Upgrades (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Plan Status Card */}
          <div className={`p-6 rounded-3xl border ${
            isPro 
              ? 'bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-900 border-emerald-500/30 shadow-[0_20px_50px_rgba(16,185,129,0.05)]' 
              : 'bg-slate-900/60 border-slate-800'
          }`}>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{l.statusTitle}</span>
            <div className="flex items-center justify-between mt-3">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  {isPro ? (
                    <>
                      <span className="text-emerald-400">✦</span> {l.proPlan}
                    </>
                  ) : (
                    <>
                      <span className="text-indigo-400">⚡</span> {l.freePlan}
                    </>
                  )}
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  {isPro ? (uiLang === 'uk' ? 'Ваш преміум-доступ активовано. Дякуємо за підтримку!' : 'Premium features unlocked. Thank you for supporting AIletter!') : (uiLang === 'uk' ? 'Базові ліміти та безкоштовні шаблони.' : 'Basic generation limits and templates.')}
                </p>
              </div>
              {isPro && (
                <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full shrink-0">
                  Active
                </div>
              )}
            </div>

            {/* Usage indicators */}
            <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{l.usage}</span>
                <p className="text-lg font-black text-white mt-1">
                  {isPro ? l.unlimited : `${usageCount} / ${totalLimit} ${l.generations}`}
                </p>
              </div>
              {!isPro && (
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{l.bonuses}</span>
                  <p className="text-lg font-black text-indigo-400 mt-1">
                    +{bonusGenerations}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Checkout Block (Only for Free users) */}
          {!isPro && (
            <div className="bg-slate-900 border border-[#334155] rounded-3xl p-6 space-y-6">
              
              {/* Billing toggle */}
              <div className="flex bg-[#0f172a] rounded-2xl p-1 border border-slate-800">
                {[
                  { key: 'monthly', label: t.monthly, price: '€6/mo' },
                  { key: 'yearly',  label: t.yearly,  price: '€39/yr', badge: t.save },
                ].map(opt => (
                  <button 
                    key={opt.key} 
                    onClick={() => setBilling(opt.key)}
                    className={`flex-1 py-3 px-2 rounded-xl border-none cursor-pointer flex items-center justify-center gap-2 transition-all font-black ${
                      billing === opt.key 
                        ? 'bg-[#6366f1] text-white shadow-lg shadow-indigo-500/20' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <span className="text-sm">{opt.price}</span>
                    <span className="text-[10px] font-medium opacity-80">{opt.label}</span>
                    {opt.badge && <span className="background bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">{opt.badge}</span>}
                  </button>
                ))}
              </div>

              {/* Warning Notice */}
              <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 flex gap-3 items-start">
                <span className="text-base shrink-0">ℹ️</span>
                <p className="margin-0 text-xs text-indigo-300/90 leading-relaxed">
                  {t.warning(priceVal)}
                </p>
              </div>

              {error && <p className="text-rose-400 text-xs text-center">{error}</p>}

              {/* Stripe Button */}
              <button 
                onClick={handleUpgrade} 
                disabled={stripeLoading}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {stripeLoading ? t.loading : t.btn(priceVal)}
              </button>

              <p className="text-center text-[10px] text-slate-500">
                {t.secure}
              </p>
            </div>
          )}

          {/* Features Checkbox Grid */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-base font-bold text-white mb-4">{l.featuresTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {proFeatures.map((f, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Referral & Share Options (5 cols) */}
        <div className="lg:col-span-5">
          
          <div className="bg-slate-900 border border-[#334155] rounded-3xl p-6 space-y-6">
            
            <div>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0">
                Bonus Generations
              </span>
              <h3 className="text-lg font-black text-white mt-3">{l.shareSectionTitle}</h3>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                {l.shareSectionDesc}
              </p>
            </div>

            {/* Referral Link Copy Field */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{uiLang === 'uk' ? 'Ваше запрошувальне посилання' : 'Your Invite Link'}</span>
              <div className="flex gap-2 bg-[#0f172a] border border-slate-800 rounded-2xl p-1.5 pl-3.5">
                <input 
                  readOnly 
                  value={user ? `https://ailetter.pro/?ref=${user.uid}` : ''}
                  className="flex-1 bg-transparent border-none outline-none text-slate-400 text-xs font-mono select-all" 
                />
                <button 
                  onClick={handleCopyLink}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all whitespace-nowrap active:scale-95 ${
                    copiedLink ? 'bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/10'
                  }`}
                >
                  {copiedLink ? t.copied : t.copyLink}
                </button>
              </div>
            </div>

            {/* Social Sharing Buttons */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{uiLang === 'uk' ? 'Швидкий шеринг' : 'Quick Social Share'}</span>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => handleShareClick('linkedin')}
                  className="flex-1 py-3 px-4 bg-[#0a66c2] hover:bg-[#09549f] border-none rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-lg shadow-[#0a66c2]/10"
                >
                  <span className="text-sm">🔗</span> {t.shareLinkedIn}
                </button>
                <button 
                  onClick={() => handleShareClick('twitter')}
                  className="flex-1 py-3 px-4 bg-[#1e293b] hover:bg-slate-900 border border-slate-800 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-lg shadow-black/10"
                >
                  <span className="text-sm">𝕏</span> {t.shareTwitter}
                </button>
              </div>
            </div>

            {shareClaimed && (
              <div className="text-emerald-400 text-xs font-bold text-center bg-emerald-500/5 border border-emerald-500/10 py-2.5 rounded-xl">
                {t.claimed}
              </div>
            )}

            {/* How it works details */}
            <div className="pt-4 border-t border-slate-800 space-y-3 text-slate-400 text-xs">
              <div className="flex gap-2">
                <span className="text-indigo-400 font-bold">1.</span>
                <p>{uiLang === 'uk' ? 'Копіюйте посилання та відправляйте друзям.' : 'Copy your referral link and share with your colleagues.'}</p>
              </div>
              <div className="flex gap-2">
                <span className="text-indigo-400 font-bold">2.</span>
                <p>{uiLang === 'uk' ? 'Отримуйте +2 генерації на місяць за кожного друга, хто зареєструється.' : 'Get +2 generations per month instantly for each sign up.'}</p>
              </div>
              <div className="flex gap-2">
                <span className="text-indigo-400 font-bold">3.</span>
                <p>{uiLang === 'uk' ? 'Також отримайте миттєві бонуси за шеринг у LinkedIn чи Twitter (X).' : 'Get immediate credits for sharing on LinkedIn or Twitter.'}</p>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
