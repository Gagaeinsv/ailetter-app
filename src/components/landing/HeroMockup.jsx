// src/components/landing/HeroMockup.jsx
import React, { useState, useEffect, useRef } from 'react';

const LETTER_TEXT = `Dear Hiring Manager,

I am writing to express my strong interest in the Senior Product Designer position at Spotify. With 5+ years of experience in user-centered design and a passion for music technology, I am confident I would be a valuable addition to your team.

At Figma, I led the redesign of our core editor interface, resulting in a 34% increase in user retention. I collaborated closely with engineering and product teams to ship features used by millions worldwide.

What excites me most about Spotify is your commitment to democratizing music creation — this aligns perfectly with my experience building tools for creative professionals.

Best regards,
Alex Johnson`;

const TOTAL_H  = 420;
const CHROME_H = 33;
const BODY_H   = TOTAL_H - CHROME_H; // 387

const HeroMockup = () => {
  const [phase, setPhase] = useState('idle');
  const [displayedText, setDisplayedText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [dots, setDots] = useState('');
  const timerRef = useRef(null);

  const runAnimation = () => {
    setPhase('uploading');
    setDisplayedText('');
    setCharIndex(0);
    timerRef.current = setTimeout(() => setPhase('typing'), 1400);
  };

  useEffect(() => {
    const t = setTimeout(runAnimation, 600);
    return () => { clearTimeout(t); clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    if (phase !== 'typing') return;
    if (charIndex >= LETTER_TEXT.length) {
      setPhase('done');
      timerRef.current = setTimeout(runAnimation, 4000);
      return;
    }
    const speed = LETTER_TEXT[charIndex] === '\n' ? 20 : 12;
    const t = setTimeout(() => {
      setDisplayedText(LETTER_TEXT.slice(0, charIndex + 1));
      setCharIndex(i => i + 1);
    }, speed);
    return () => clearTimeout(t);
  }, [phase, charIndex]);

  useEffect(() => {
    if (phase !== 'uploading') return;
    let i = 0;
    const t = setInterval(() => { i = (i + 1) % 4; setDots('.'.repeat(i)); }, 350);
    return () => clearInterval(t);
  }, [phase]);

  const progress = phase === 'typing'
    ? Math.round((charIndex / LETTER_TEXT.length) * 100)
    : phase === 'done' ? 100 : 0;

  const isDone      = phase === 'done';
  const isTyping    = phase === 'typing';
  const isUploading = phase === 'uploading';
  const isActive    = isTyping || isDone;

  return (
    <div style={{
      background: '#0f172a',
      borderRadius: 14,
      overflow: 'hidden',
      fontFamily: 'system-ui,-apple-system,sans-serif',
      userSelect: 'none',
      height: TOTAL_H,
      maxHeight: TOTAL_H,
    }}>

      {/* Window chrome */}
      <div style={{
        background: '#1e293b',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '8px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        height: CHROME_H,
        boxSizing: 'border-box',
        flexShrink: 0,
      }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 10, color: '#475569', fontWeight: 600, letterSpacing: '0.04em' }}>AIletter — Dashboard</span>
      </div>

      {/* Desktop layout */}
      <div className="hidden sm:flex" style={{
        height: BODY_H,
        maxHeight: BODY_H,
        overflow: 'hidden',
      }}>

        {/* Sidebar */}
        <div style={{
          width: 130, flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.05)',
          padding: '14px 10px',
          display: 'flex', flexDirection: 'column', gap: 5,
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <span style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)', width: 22, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 900, color: 'white', flexShrink: 0 }}>AI</span>
            <span style={{ fontSize: 11, fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>AILETTER</span>
          </div>
          {['Dashboard', 'Templates', 'History', 'Settings'].map((item, idx) => (
            <div key={item} style={{ padding: '7px 9px', borderRadius: 7, fontSize: 10, fontWeight: 700, background: idx === 0 ? '#6366f1' : 'transparent', color: idx === 0 ? 'white' : '#475569' }}>{item}</div>
          ))}
          <div style={{ marginTop: 'auto', padding: '8px 9px', borderRadius: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div style={{ fontSize: 8, fontWeight: 900, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Free Plan</div>
            <div style={{ fontSize: 9, color: '#475569', marginTop: 1 }}>4/5 left</div>
          </div>
        </div>

        {/* Input panel */}
        <div style={{
          width: 175, flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.05)',
          padding: 12,
          display: 'flex', flexDirection: 'column', gap: 10,
          overflow: 'hidden',
        }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: 'white' }}>1. Your Data</div>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 9, padding: 10, flexShrink: 0 }}>
            <div style={{ fontSize: 7, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>CV (PDF)</div>
            <div style={{
              border: `2px dashed ${isUploading ? '#6366f1' : isActive ? '#22c55e' : '#334155'}`,
              borderRadius: 7, padding: '9px 6px', textAlign: 'center',
              transition: 'border-color 0.3s',
              background: isUploading ? 'rgba(99,102,241,0.05)' : 'transparent',
            }}>
              {phase === 'idle'
                ? <div style={{ fontSize: 9, color: '#475569' }}>Upload PDF</div>
                : isUploading
                  ? <div style={{ fontSize: 9, color: '#6366f1', fontWeight: 700 }}>Uploading{dots}</div>
                  : <div style={{ fontSize: 9, color: '#22c55e', fontWeight: 700 }}>✓ Alex_Johnson_CV.pdf</div>
              }
            </div>
          </div>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 9, padding: 10, flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 7, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Job Description</div>
            <div style={{ fontSize: 9, color: '#475569', lineHeight: 1.6 }}>Senior Product Designer at Spotify. We are looking for a passionate designer...</div>
          </div>
          <button style={{
            background: isTyping ? '#4338ca' : isDone ? '#059669' : '#6366f1',
            border: 'none', borderRadius: 9, padding: '9px 0',
            color: 'white', fontWeight: 900, fontSize: 9,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            cursor: 'pointer', transition: 'background 0.3s', flexShrink: 0,
          }}>
            {isTyping ? '⟳ Generating…' : isDone ? '✓ Done!' : '✦ Generate'}
          </button>
        </div>

        {/* Preview panel */}
        <div style={{
          flex: 1, minWidth: 0,
          display: 'flex', flexDirection: 'column',
          background: '#111827',
          overflow: 'hidden',
        }}>
          {/* Preview header bar */}
          <div style={{
            padding: '7px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', gap: 6,
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 8, fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Preview</span>
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: isTyping ? '#f59e0b' : isDone ? '#22c55e' : '#334155',
              boxShadow: isDone ? '0 0 5px #22c55e' : isTyping ? '0 0 5px #f59e0b' : 'none',
              transition: 'all 0.3s',
            }} />
            {isActive && (
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 55, height: 3, background: '#1e293b', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'linear-gradient(90deg,#6366f1,#a855f7)', width: `${progress}%`, transition: 'width 0.1s', borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 8, color: '#6366f1', fontWeight: 700 }}>{progress}%</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 3, marginLeft: isActive ? 0 : 'auto' }}>
              {['PDF', 'Copy'].map(b => (
                <div key={b} style={{ padding: '3px 7px', borderRadius: 5, background: '#1e293b', fontSize: 8, color: '#475569', fontWeight: 700 }}>{b}</div>
              ))}
            </div>
          </div>

          {/* ✅ LetterDoc wrapper — minHeight:0 критично для flex */}
          <div style={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
          }}>
            <LetterDoc phase={phase} displayedText={displayedText} isTyping={isTyping} isUploading={isUploading} />
          </div>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="sm:hidden" style={{ padding: 14, height: BODY_H, overflow: 'hidden', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)', width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: 'white', flexShrink: 0 }}>AI</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, color: 'white', letterSpacing: '-0.3px' }}>Cover Letter</div>
              <div style={{ fontSize: 9, color: '#64748b' }}>Senior Designer @ Spotify</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isActive && (
              <div style={{ width: 50, height: 3, background: '#1e293b', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg,#6366f1,#a855f7)', width: `${progress}%`, transition: 'width 0.15s', borderRadius: 2 }} />
              </div>
            )}
            <div style={{
              padding: '4px 10px', borderRadius: 20, fontSize: 9, fontWeight: 900,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              background: isTyping ? 'rgba(245,158,11,0.15)' : isDone ? 'rgba(34,197,94,0.15)' : isUploading ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
              color: isTyping ? '#f59e0b' : isDone ? '#22c55e' : isUploading ? '#818cf8' : '#475569',
              border: `1px solid ${isTyping ? 'rgba(245,158,11,0.3)' : isDone ? 'rgba(34,197,94,0.3)' : isUploading ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)'}`,
            }}>
              {isTyping ? 'Generating…' : isDone ? '✓ Done' : isUploading ? `Uploading${dots}` : 'Ready'}
            </div>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}>
          <div style={{ background: '#6366f1', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, color: 'white' }}>A</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, color: 'white' }}>Alex Johnson</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.65)' }}>Product Designer</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>Feb 2025</div>
          </div>
          <div style={{ height: 220, overflow: 'hidden', padding: '12px 14px', position: 'relative' }}>
            {isUploading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[85, 62, 78, 55, 70].map((w, i) => (
                  <div key={i} style={{ height: 8, background: '#f1f5f9', borderRadius: 3, width: `${w}%`, animation: 'mockupPulse 1.5s ease infinite', animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            ) : phase === 'idle' ? (
              <div style={{ color: '#cbd5e1', fontStyle: 'italic', fontSize: 11, fontFamily: 'Georgia,serif' }}>Your cover letter will appear here...</div>
            ) : (
              <div style={{ fontFamily: 'Georgia,serif', fontSize: 10.5, lineHeight: 1.85, color: '#1e293b', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {displayedText}
                {isTyping && <span style={{ display: 'inline-block', width: 2, height: 12, background: '#6366f1', marginLeft: 1, animation: 'mockupBlink 0.7s step-end infinite', verticalAlign: 'middle' }} />}
              </div>
            )}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, background: 'linear-gradient(to bottom, transparent, white)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes mockupPulse { 0%,100%{opacity:.35} 50%{opacity:.75} }
        @keyframes mockupBlink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
};

// ✅ height: 100% + minHeight: 0 — правильний flex підхід
const LetterDoc = ({ phase, displayedText, isTyping, isUploading }) => (
  <div style={{
    width: '100%',
    maxWidth: 400,
    background: 'white',
    borderRadius: 4,
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
    overflow: 'hidden',
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  }}>
    <div style={{ background: '#6366f1', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
      <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, color: 'white' }}>A</div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 900, color: 'white' }}>Alex Johnson</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)' }}>Product Designer</div>
      </div>
      <div style={{ marginLeft: 'auto', fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>Feb 2025</div>
    </div>
    <div style={{
      flex: 1,
      minHeight: 0,
      padding: '12px 16px',
      fontFamily: 'Georgia,serif',
      fontSize: 10,
      lineHeight: 1.9,
      color: '#1e293b',
      whiteSpace: 'pre-wrap',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {isUploading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, paddingTop: 4 }}>
          {[88, 65, 80, 55, 72, 60].map((w, i) => (
            <div key={i} style={{ height: 8, background: '#f1f5f9', borderRadius: 3, width: `${w}%`, animation: 'mockupPulse 1.5s ease infinite', animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      ) : (phase === 'idle' || phase === 'pause') ? (
        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Your cover letter will appear here...</span>
      ) : (
        <>
          {displayedText}
          {isTyping && <span style={{ display: 'inline-block', width: 2, height: 12, background: '#6366f1', marginLeft: 1, animation: 'mockupBlink 0.7s step-end infinite', verticalAlign: 'middle' }} />}
        </>
      )}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(to bottom, transparent, white)', pointerEvents: 'none' }} />
    </div>
  </div>
);

export default HeroMockup;
