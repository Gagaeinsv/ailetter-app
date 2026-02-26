import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { redirectToCheckout, PRICES } from '../stripe'; // Імпорт налаштувань Stripe

const UpgradeModal = ({ onClose }) => {
  const { user } = useAuth();
  const [billing, setBilling] = useState('yearly');
  const [promo, setPromo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpgrade = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    
    try {
      // Виклик Stripe Checkout
      await redirectToCheckout({
        priceId: billing === 'yearly' ? PRICES.yearly : PRICES.monthly,
        promoCode: promo || null,
      });
    } catch (e) {
      console.error(e);
      setError('Payment initialization failed. Please try again.');
      setLoading(false);
    }
  };

  const proFeatures = [
    '∞  Unlimited generations',
    '🎨  All 5 templates',
    '📄  DOCX + PDF export',
    '🕐  Unlimited history',
    '⚡  Priority AI model',
    '🔗  LinkedIn version generator',
    '🚫  No watermark on PDF',
  ];

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
          <h2 style={{ color: 'white', fontSize: 24, fontWeight: 900, margin: '8px 0 4px' }}>Upgrade to AIletter Pro</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0 }}>Unlimited generations · No watermark · All templates</p>
        </div>

        <div style={{ padding: '24px 32px 28px' }}>

          {/* Billing toggle */}
          <div style={{ display: 'flex', background: '#1e293b', borderRadius: 12, padding: 4, border: '1px solid #334155', marginBottom: 20 }}>
            {[
              { key: 'monthly', label: 'Monthly', price: '€6/mo' },
              { key: 'yearly',  label: 'Yearly',  price: '€39/yr', badge: 'Save 46%' },
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

          {/* Features List */}
          <div style={{ background: '#1e293b', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
            {proFeatures.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', fontSize: 13, color: '#e2e8f0' }}>
                <span style={{ color: '#22c55e', fontWeight: 900 }}>✓</span> {f}
              </div>
            ))}
          </div>

          {/* Promo code Input */}
          <input
            value={promo}
            onChange={e => setPromo(e.target.value.toUpperCase())}
            placeholder="Promo code (optional)"
            style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: 'white', outline: 'none', marginBottom: 14, boxSizing: 'border-box', fontFamily: 'inherit' }}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = '#334155'}
          />

          {/* Error Message */}
          {error && <p style={{ color: '#f87171', fontSize: 12, marginBottom: 10, textAlign: 'center' }}>{error}</p>}

          {/* Upgrade Button */}
          <button onClick={handleUpgrade} disabled={loading}
            style={{ width: '100%', padding: 16, background: 'linear-gradient(135deg, #6366f1, #7c3aed)', border: 'none', borderRadius: 14, color: 'white', fontWeight: 900, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 8px 24px rgba(99,102,241,0.35)', transition: 'transform 0.1s' }}
            onMouseDown={e => !loading && (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={e => !loading && (e.currentTarget.style.transform = 'scale(1)')}
          >
            {loading ? '⏳ Redirecting to Stripe...' : `✦ Upgrade — ${billing === 'yearly' ? '€39/year' : '€6/month'}`}
          </button>

          <p style={{ textAlign: 'center', fontSize: 11, color: '#475569', marginTop: 10 }}>
            Secure payment via Stripe · Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;