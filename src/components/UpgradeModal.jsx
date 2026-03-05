import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { redirectToCheckout, PRICES } from '../stripe';

const T = {
  en: {
    title: 'Upgrade to AIletter Pro',
    sub: 'Unlimited generations · No watermark · All templates',
    monthly: 'Monthly', yearly: 'Yearly', save: 'Save 46%',
    warning: (price) => `You will be automatically charged ${price} each billing period unless you cancel before renewal. You can cancel anytime.`,
    btn: (price) => `✦ Upgrade — ${price}`,
    loading: '⏳ Redirecting to Stripe...',
    secure: 'Secure payment via Stripe · Cancel anytime',
  },
  uk: {
    title: 'Перейти на AIletter Pro',
    sub: 'Необмежені генерації · Без водяного знаку · Всі шаблони',
    monthly: 'Щомісяця', yearly: 'Щороку', save: 'Знижка 46%',
    warning: (price) => `З вас автоматично списуватиметься ${price} щокожного розрахункового періоду, якщо ви не скасуєте підписку до оновлення. Скасувати можна будь-коли.`,
    btn: (price) => `✦ Оновити — ${price}`,
    loading: '⏳ Перенаправлення на Stripe...',
    secure: 'Безпечна оплата через Stripe · Скасувати будь-коли',
  },
  it: {
    title: 'Passa ad AIletter Pro',
    sub: 'Generazioni illimitate · Nessuna filigrana · Tutti i template',
    monthly: 'Mensile', yearly: 'Annuale', save: 'Risparmia 46%',
    warning: (price) => `Ti verrà addebitato automaticamente ${price} a ogni periodo di fatturazione a meno che tu non annulli prima del rinnovo. Puoi annullare in qualsiasi momento.`,
    btn: (price) => `✦ Aggiorna — ${price}`,
    loading: '⏳ Reindirizzamento a Stripe...',
    secure: 'Pagamento sicuro via Stripe · Annulla quando vuoi',
  },
  de: {
    title: 'Auf AIletter Pro upgraden',
    sub: 'Unbegrenzte Generierungen · Kein Wasserzeichen · Alle Vorlagen',
    monthly: 'Monatlich', yearly: 'Jährlich', save: '46% sparen',
    warning: (price) => `Es wird automatisch ${price} pro Abrechnungszeitraum abgebucht, sofern Sie nicht vor der Verlängerung kündigen. Sie können jederzeit kündigen.`,
    btn: (price) => `✦ Upgraden — ${price}`,
    loading: '⏳ Weiterleitung zu Stripe...',
    secure: 'Sichere Zahlung über Stripe · Jederzeit kündigen',
  },
};

const UpgradeModal = ({ onClose }) => {
  const { user } = useAuth();
  const { uiLang } = useLanguage();
  const t = T[uiLang] || T.en;
  const [billing, setBilling] = useState('yearly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '24px', width: '100%', maxWidth: '520px', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>

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

          <p style={{ textAlign: 'center', fontSize: 11, color: '#475569', marginTop: 10 }}>
            {t.secure}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;