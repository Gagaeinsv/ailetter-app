// src/components/landing/HeroMockup.jsx
import React, { useState, useEffect, useRef } from 'react';

const LETTER_TEXT = `Dear Hiring Manager,

I am writing to express my strong interest in the Senior Product Designer position at Spotify. With 5+ years of experience creating user-centered digital products and a passion for music technology, I am confident I would be a valuable addition to your team.

At my current role at Figma, I led the redesign of our core editor interface, resulting in a 34% increase in user retention and a 28% reduction in onboarding time. I collaborated closely with engineering and product teams to ship features used by millions of designers worldwide.

What excites me most about Spotify is your commitment to democratizing music creation. Your recent launch of Spotify for Artists aligns perfectly with my experience building tools for creative professionals.

I would love the opportunity to discuss how my background in design systems and user research can contribute to Spotify's mission.

Best regards,
Alex Johnson`;

const IconMagic = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/>
  </svg>
);

const IconUpload = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const IconCheck = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M5 13l4 4L19 7"/>
  </svg>
);

const HeroMockup = () => {
  const [phase, setPhase] = useState('idle'); 
  // phases: idle → uploading → typing → done → pause → idle
  const [displayedText, setDisplayedText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [dots, setDots] = useState('');
  const timerRef = useRef(null);

  const runAnimation = () => {
    setPhase('uploading');
    setDisplayedText('');
    setCharIndex(0);

    // uploading → typing after 1.2s
    timerRef.current = setTimeout(() => {
      setPhase('typing');
    }, 1200);
  };

  // Start on mount, then loop
  useEffect(() => {
    const startDelay = setTimeout(runAnimation, 800);
    return () => { clearTimeout(startDelay); clearTimeout(timerRef.current); };
  }, []);

  // Typing animation
  useEffect(() => {
    if (phase !== 'typing') return;
    if (charIndex >= LETTER_TEXT.length) {
      timerRef.current = setTimeout(() => {
        setPhase('done');
        timerRef.current = setTimeout(() => {
          setPhase('pause');
          timerRef.current = setTimeout(runAnimation, 2000);
        }, 2500);
      }, 0);
      return;
    }
    const speed = LETTER_TEXT[charIndex] === '\n' ? 30 : 18;
    const t = setTimeout(() => {
      setDisplayedText(LETTER_TEXT.slice(0, charIndex + 1));
      setCharIndex(i => i + 1);
    }, speed);
    return () => clearTimeout(t);
  }, [phase, charIndex]);

  // Dots animation during uploading
  useEffect(() => {
    if (phase !== 'uploading') return;
    let i = 0;
    const t = setInterval(() => { i = (i + 1) % 4; setDots('.'.repeat(i)); }, 300);
    return () => clearInterval(t);
  }, [phase]);

  const progress = phase === 'typing' ? Math.round((charIndex / LETTER_TEXT.length) * 100) : phase === 'done' ? 100 : 0;

  return (
    <div style={{
      width: '100%',
      background: '#0f172a',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '16px',
      overflow: 'hidden',
      fontFamily: 'system-ui, sans-serif',
      userSelect: 'none',
    }}>
      {/* Window chrome */}
      <div style={{ background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 11, color: '#475569', fontWeight: 600 }}>AIletter — Dashboard</span>
      </div>

      {/* App layout */}
      <div style={{ display: 'flex', height: 420 }}>

        {/* Sidebar */}
        <div style={{ width: 160, background: '#0f172a', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            <span style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)', width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: 'white' }}>AI</span>
            <span style={{ fontSize: 12, fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>AILETTER</span>
          </div>
          {[
            { label: 'Dashboard', active: true },
            { label: 'Templates', active: false },
            { label: 'History', active: false },
            { label: 'Settings', active: false },
          ].map(item => (
            <div key={item.label} style={{
              padding: '8px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
              background: item.active ? '#6366f1' : 'transparent',
              color: item.active ? 'white' : '#475569',
            }}>
              {item.label}
            </div>
          ))}
          <div style={{ marginTop: 'auto', padding: '8px 10px', borderRadius: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Free Plan</div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>4/5 left</div>
          </div>
        </div>

        {/* Left panel — inputs */}
        <div style={{ width: 200, borderRight: '1px solid rgba(255,255,255,0.05)', padding: 16, display: 'flex', flexDirection: 'column', gap: 10, background: '#0f172a', flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: 'white' }}>1. Your Data</div>

          {/* CV upload */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 8, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>CV (PDF)</div>
            <div style={{
              border: `2px dashed ${phase === 'uploading' ? '#6366f1' : phase === 'idle' ? '#334155' : '#22c55e'}`,
              borderRadius: 8, padding: '10px 6px', textAlign: 'center', transition: 'all 0.3s',
              background: phase === 'uploading' ? 'rgba(99,102,241,0.05)' : 'transparent',
            }}>
              {phase === 'idle' ? (
                <>
                  <IconUpload />
                  <div style={{ fontSize: 9, color: '#475569', marginTop: 4 }}>Upload PDF</div>
                </>
              ) : phase === 'uploading' ? (
                <div style={{ fontSize: 9, color: '#6366f1', fontWeight: 700 }}>Uploading{dots}</div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 9, color: '#22c55e', fontWeight: 700 }}>
                  <IconCheck /> Alex_Johnson_CV.pdf
                </div>
              )}
            </div>
          </div>

          {/* Job description */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: 10, flex: 1 }}>
            <div style={{ fontSize: 8, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Job Description</div>
            <div style={{ fontSize: 9, color: '#475569', lineHeight: 1.6 }}>
              Senior Product Designer at Spotify. We are looking for a passionate designer to join our Creator Tools team...
            </div>
          </div>

          {/* Generate button */}
          <button style={{
            background: phase === 'typing' ? '#4338ca' : '#6366f1',
            border: 'none', borderRadius: 10, padding: '10px 0',
            color: 'white', fontWeight: 900, fontSize: 10,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            transition: 'background 0.2s',
          }}>
            {phase === 'typing' ? (
              <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Generating…</>
            ) : phase === 'done' ? (
              <><IconCheck /> Done!</>
            ) : (
              <><IconMagic /> Generate</>
            )}
          </button>
        </div>

        {/* Right panel — preview */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#111827' }}>
          {/* Toolbar */}
          <div style={{ padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 6 }}>
              Preview
              <span style={{ width: 6, height: 6, background: phase === 'typing' ? '#f59e0b' : phase === 'done' ? '#22c55e' : '#475569', borderRadius: '50%', boxShadow: phase === 'done' ? '0 0 6px #22c55e' : phase === 'typing' ? '0 0 6px #f59e0b' : 'none', transition: 'all 0.3s' }} />
            </div>

            {/* Progress bar */}
            {(phase === 'typing' || phase === 'done') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 80, height: 3, background: '#1e293b', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'linear-gradient(90deg,#6366f1,#a855f7)', width: `${progress}%`, transition: 'width 0.1s', borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 9, color: '#6366f1', fontWeight: 700 }}>{progress}%</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 4 }}>
              {['PDF', 'Copy', 'Save'].map(btn => (
                <div key={btn} style={{ padding: '4px 8px', borderRadius: 6, background: '#1e293b', fontSize: 9, color: '#475569', fontWeight: 700 }}>{btn}</div>
              ))}
            </div>
          </div>

          {/* Document area */}
          <div style={{ flex: 1, overflow: 'hidden', padding: '20px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 480, background: 'white', borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', overflow: 'hidden', position: 'relative' }}>
              {/* Letter header */}
              <div style={{ background: '#6366f1', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, color: 'white' }}>A</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: 'white' }}>Alex Johnson</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>Product Designer · alex@email.com</div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              {/* Letter body */}
              <div style={{ padding: '16px 20px', minHeight: 280, fontFamily: 'Georgia, serif', fontSize: 11, lineHeight: 1.8, color: '#1e293b', whiteSpace: 'pre-wrap', position: 'relative' }}>
                {phase === 'idle' || phase === 'pause' ? (
                  <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: 11 }}>Your cover letter will appear here...</div>
                ) : phase === 'uploading' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
                    {[90, 70, 85, 60, 75].map((w, i) => (
                      <div key={i} style={{ height: 10, background: '#f1f5f9', borderRadius: 4, width: `${w}%`, animation: 'pulse 1.5s ease infinite', animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                ) : (
                  <>
                    {displayedText}
                    {phase === 'typing' && (
                      <span style={{ display: 'inline-block', width: 2, height: 14, background: '#6366f1', marginLeft: 1, animation: 'blink 0.7s step-end infinite', verticalAlign: 'middle' }} />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:0.4; } 50% { opacity:0.8; } }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default HeroMockup;