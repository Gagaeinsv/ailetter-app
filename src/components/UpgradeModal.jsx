import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { redirectToCheckout, PRICES } from '../stripe';
import { db } from '../firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

const T = {
  en: {
    title: 'Upgrade to AIletter Pro',
    sub: 'Unlimited generations · No watermark · All templates',
    monthly: 'Monthly', yearly: 'Yearly', save: 'Save 46%',
    warning: (price) => `You will be automatically charged ${price} each billing period unless you cancel before renewal. You can cancel anytime.`,
    btn: (price) => `✦ Upgrade — ${price}`,
    loading: '⏳ Redirecting to Stripe...',
    secure: 'Secure payment via Stripe · Cancel anytime',
    viralTitle: 'Option B: Get +2 free generations',
    viralDesc: 'Help us spread the word or invite a friend to receive bonus credits instantly.',
    shareLinkedIn: 'Share on LinkedIn',
    shareTwitter: 'Share on Twitter (X)',
    copyLink: 'Copy Referral Link',
    copied: 'Copied!',
    claimed: '✓ Reward claimed!',
  },
  uk: {
    title: 'Перейти на AIletter Pro',
    sub: 'Необмежені генерації · Без водяного знаку · Всі шаблони',
    monthly: 'Щомісяця', yearly: 'Щороку', save: 'Знижка 46%',
    warning: (price) => `З вас автоматично списуватиметься ${price} щокожного розрахункового періоду, якщо ви не скасуєте підписку до оновлення. Скасувати можна будьколи.`,
    btn: (price) => `✦ Оновити — ${price}`,
    loading: '⏳ Перенаправлення на Stripe...',
    secure: 'Безпечна оплата через Stripe · Скасувати будьколи',
    viralTitle: 'Варіант Б: Отримай +2 безкоштовні генерації',
    viralDesc: 'Допоможи розповісти про AILetter або запроси друга, щоб миттєво отримати додаткові ліміти.',
    shareLinkedIn: 'Поділитися в LinkedIn',
    shareTwitter: 'Поділитися в Twitter (X)',
    copyLink: 'Копіювати посилання',
    copied: 'Скопійовано!',
    claimed: '✓ Бонус нараховано!',
  },
  it: {
    title: 'Passa ad AIletter Pro',
    sub: 'Generazioni illimitate · Nessuna filigrana · Tutti i template',
    monthly: 'Mensile', yearly: 'Annuale', save: 'Risparmia 46%',
    warning: (price) => `Ti verrà addebitato automaticamente ${price} a ogni periodo di fatturazione a meno che tu non annulli prima del rinnovo. Puoi annullare in qualsiasi momento.`,
    btn: (price) => `✦ Aggiorna — ${price}`,
    loading: '⏳ Reindirizzamento a Stripe...',
    secure: 'Pagamento sicuro via Stripe · Annulla quando vuoi',
    viralTitle: 'Opzione B: Ottieni +2 generazioni gratuite',
    viralDesc: 'Aiutaci a spargere la voce o invita un amico per ricevere crediti bonus all\'istante.',
    shareLinkedIn: 'Condividi su LinkedIn',
    shareTwitter: 'Condividi su Twitter (X)',
    copyLink: 'Copia link di invito',
    copied: 'Copiato!',
    claimed: '✓ Bonus accreditato!',
  },
  de: {
    title: 'Auf AIletter Pro upgraden',
    sub: 'Unbegrenzte Generierungen · Kein Wasserzeichen · Alle Vorlagen',
    monthly: 'Monatlich', yearly: 'Jährlich', save: '46% sparen',
    warning: (price) => `Es wird automatisch ${price} pro Abrechnungszeitraum abgebucht, sofern Sie nicht vor der Verlängerung kündigen. Sie können jederzeit kündigen.`,
    btn: (price) => `✦ Upgraden — ${price}`,
    loading: '⏳ Weiterleitung zu Stripe...',
    secure: 'Sichere Zahlung über Stripe · Jederzeit kündigen',
    viralTitle: 'Option B: Holen Sie sich +2 freie Generierungen',
    viralDesc: 'Helfen Sie uns, die Nachricht zu verbreiten, oder laden Sie einen Freund ein, um sofort Bonus-Credits zu erhalten.',
    shareLinkedIn: 'Auf LinkedIn teilen',
    shareTwitter: 'Auf Twitter (X) teilen',
    copyLink: 'Referral-Link kopieren',
    copied: 'Kopiert!',
    claimed: '✓ Bonus gutgeschrieben!',
  },
};

const UpgradeModal = ({ onClose, isLimitReached }) => {
  const { user } = useAuth();
  const { uiLang } = useLanguage();
  const t = T[uiLang] || T.en;
  const [billing, setBilling] = useState('yearly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareClaimed, setShareClaimed] = useState(false);

  const handleUpgrade = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      await redirectToCheckout({
        priceId: billing === 'yearly' ? PRICES.yearly : PRICES.monthly,
      });
    } catch (e) {
      console.error(e);
      setError('Payment initialization failed. Please try again.');
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!user) return;
    const refLink = `https://ailetter.pro/?ref=${user.uid}`;
    navigator.clipboard.writeText(refLink);
    setCopiedLink(true);
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
    } catch (err) {
      console.error('Error crediting share reward:', err);
    }
  };

  const proFeatures = [
    '∞  Unlimited generations',
    '🎨  All 16 templates',
    '📄  DOCX + PDF export',
    '🕐  Unlimited history',
    '⚡  Priority AI model',
    '🔗  LinkedIn note generator',
    '🚫  No watermark on PDF',
  ];

  const price = billing === 'yearly' ? '€39/year' : '€6/month';

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
    >
      <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '24px', width: '100%', maxWidth: '520px', overflowY: 'auto', maxHeight: '95vh', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', padding: '28px 32px 24px', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', fontSize: 18, lineHeight: '30px', textAlign: 'center' }}>×</button>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em' }}>PRO</span>
          <h2 style={{ color: 'white', fontSize: 24, fontWeight: 900, margin: '8px 0 4px' }}>{t.title}</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0 }}>{t.sub}</p>
        </div>

        <div style={{ padding: '24px 32px 28px' }}>

          {/* Billing toggle */}
          <div style={{ display: 'flex', background: '#1e293b', borderRadius: 12, padding: 4, border: '1px solid #334155', marginBottom: 20 }}>
            {[
              { key: 'monthly', label: t.monthly, price: '€6/mo' },
              { key: 'yearly',  label: t.yearly,  price: '€39/yr', badge: t.save },
            ].map(opt => (
              <button key={opt.key} onClick={() => setBilling(opt.key)}
                style={{ flex: 1, padding: '10px 8px', borderRadius: 9, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s',
                  background: billing === opt.key ? '#6366f1' : 'transparent',
                  color: billing === opt.key ? 'white' : '#64748b' }}>
                <span style={{ fontWeight: 900, fontSize: 14 }}>{opt.price}</span>
                <span style={{ fontSize: 11 }}>{opt.label}</span>
                {opt.badge && <span style={{ background: '#22c55e', color: 'white', fontSize: 9, fontWeight: 900, padding: '2px 5px', borderRadius: 5 }}>{opt.badge}</span>}
              </button>
            ))}
          </div>

          {/* Features */}
          <div style={{ background: '#1e293b', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
            {proFeatures.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', fontSize: 13, color: '#e2e8f0' }}>
                <span style={{ color: '#22c55e', fontWeight: 900 }}>✓</span> {f}
              </div>
            ))}
          </div>

          {/* Auto-billing notice — always visible */}
          <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>ℹ️</span>
            <p style={{ margin: 0, fontSize: 11, color: '#a5b4fc', lineHeight: 1.5 }}>
              {t.warning(price)}
            </p>
          </div>

          {error && <p style={{ color: '#f87171', fontSize: 12, marginBottom: 10, textAlign: 'center' }}>{error}</p>}

          {/* Upgrade button */}
          <button onClick={handleUpgrade} disabled={loading}
            style={{ width: '100%', padding: 16, background: 'linear-gradient(135deg, #6366f1, #7c3aed)', border: 'none', borderRadius: 14, color: 'white', fontWeight: 900, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 8px 24px rgba(99,102,241,0.35)', transition: 'transform 0.1s' }}
            onMouseDown={e => !loading && (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={e => !loading && (e.currentTarget.style.transform = 'scale(1)')}
          >
            {loading ? t.loading : t.btn(price)}
          </button>

          <p style={{ textAlign: 'center', fontSize: 11, color: '#475569', marginTop: 10, marginBottom: isLimitReached ? 0 : 0 }}>
            {t.secure}
          </p>

          {isLimitReached && (
            <>
              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: '#334155' }} />
                <span style={{ fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>OR</span>
                <div style={{ flex: 1, height: 1, background: '#334155' }} />
              </div>

              {/* Option B: Viral Rewards */}
              <div style={{ background: 'rgba(99,102,241,0.05)', border: '1px dashed rgba(99,102,241,0.3)', borderRadius: 18, padding: 20 }}>
                <span style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', padding: '3px 8px', borderRadius: 20, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>BONUS</span>
                <h3 style={{ color: 'white', fontSize: 16, fontWeight: 900, margin: '6px 0 4px' }}>{t.viralTitle}</h3>
                <p style={{ color: '#94a3b8', fontSize: 11, margin: '0 0 16px', lineHeight: 1.4 }}>{t.viralDesc}</p>

                {/* Social Sharing Buttons */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                  <button onClick={() => handleShareClick('linkedin')}
                    style={{ flex: 1, padding: '12px 8px', background: '#0a66c2', border: 'none', borderRadius: 10, color: 'white', fontWeight: 700, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <span>🔗</span> {t.shareLinkedIn}
                  </button>
                  <button onClick={() => handleShareClick('twitter')}
                    style={{ flex: 1, padding: '12px 8px', background: '#1d9bf0', border: 'none', borderRadius: 10, color: 'white', fontWeight: 700, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <span>𝕏</span> {t.shareTwitter}
                  </button>
                </div>

                {shareClaimed && (
                  <p style={{ color: '#22c55e', fontSize: 11, fontWeight: 700, textAlign: 'center', margin: '0 0 14px' }}>
                    {t.claimed}
                  </p>
                )}

                {/* Referral Link Copy */}
                <div style={{ display: 'flex', gap: 8, background: '#0f172a', border: '1px solid #334155', borderRadius: 10, padding: 4 }}>
                  <input readOnly value={user ? `https://ailetter.pro/?ref=${user.uid}` : ''}
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#64748b', fontSize: 10, paddingLeft: 8, fontFamily: 'monospace' }} />
                  <button onClick={handleCopyLink}
                    style={{ padding: '8px 14px', background: copiedLink ? '#22c55e' : '#6366f1', border: 'none', borderRadius: 8, color: 'white', fontWeight: 700, fontSize: 10, cursor: 'pointer', minWidth: 70, textAlign: 'center' }}>
                    {copiedLink ? t.copied : t.copyLink}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;