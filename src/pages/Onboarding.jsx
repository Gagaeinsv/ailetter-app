import React, { useMemo, useState } from 'react';
import { db, auth } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import translations from '../locales/translations';
import { useProfile } from '../hooks/useProfile';

const inputClass = "w-full bg-[#0f172a] border border-[#334155] rounded-xl p-3.5 text-sm text-white outline-none focus:border-indigo-500 transition-all placeholder-[#475569]";
const labelClass = "block text-[10px] font-black uppercase tracking-widest text-[#64748b] mb-2";

const Onboarding = () => {
  const [bio, setBio]           = useState({ profession: '', experience: '', skills: '' });
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading]   = useState(false);
  const navigate                = useNavigate();
  const { setIsNewUser }        = useAuth();
  const { uiLang } = useLanguage();
  const dict = translations[uiLang] || translations.en;
  const { setProfile } = useProfile(auth.currentUser);

  const STEPS = useMemo(() => ([
    { key: 'profession', label: dict?.obProfessionLabel || 'What is your role?', placeholder: dict?.obProfessionPh || 'Python Developer', type: 'text' },
    { key: 'experience', label: dict?.obExperienceLabel || 'Years of experience', placeholder: dict?.obExperiencePh || '2', type: 'number' },
    { key: 'skills', label: dict?.obSkillsLabel || 'Key skills', placeholder: dict?.obSkillsPh || 'React, AWS, Machine Learning…', type: 'textarea' },
  ]), [dict]);

  const handleNext = () => {
    const step = STEPS[currentStep];
    if (!bio[step.key]) return;
    if (currentStep < STEPS.length - 1) setCurrentStep(s => s + 1);
  };

  const handleSkip = async () => {
    // Mark setup as complete even if skipped
    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          setupComplete: true,
        }, { merge: true });
      }
    } catch (e) {}
    setIsNewUser(false);
    navigate('/dashboard');
  };

  const handleSubmit = async () => {
    if (!bio.skills) return;
    setLoading(true);
    try {
      // Save rich profile locally (used by dashboard generation); Firestore user doc is restricted by rules.
      const existingRaw = localStorage.getItem('userProfile');
      let existing = {};
      try { existing = existingRaw ? JSON.parse(existingRaw) : {}; } catch { existing = {}; }

      const skills = String(bio.skills || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 30);

      const updatedLocal = {
        ...existing,
        profession: bio.profession,
        skills,
        experience: bio.experience,
      };
      localStorage.setItem('userProfile', JSON.stringify(updatedLocal));
      await setProfile(updatedLocal);

      // Only write allowed fields to users/{uid}
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        setupComplete: true,
      }, { merge: true });

      setIsNewUser(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(dict?.obSaveError || 'Could not save. Check console.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && currentStep < STEPS.length - 1) handleNext();
  };

  const step     = STEPS[currentStep];
  const isLast   = currentStep === STEPS.length - 1;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 text-white font-sans relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 md:w-[500px] md:h-[500px] bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Logo */}
      <div className="mb-8 flex items-center gap-2 text-lg font-black tracking-tighter relative z-10">
        <span className="bg-indigo-600 w-7 h-7 rounded-lg flex items-center justify-center text-white text-[9px]">AI</span>
        AILETTER
      </div>

      <div className="w-full max-w-sm md:max-w-md relative z-10">

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">
              {(dict?.obStepCounter || 'Step {n} of {total}')
                .replace('{n}', String(currentStep + 1))
                .replace('{total}', String(STEPS.length))}
            </span>
            <span className="text-[10px] font-black text-indigo-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-1 bg-[#1e293b] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl">

          <h2 className="text-2xl md:text-3xl font-black text-indigo-400 mb-1 text-center">{dict?.obTitle || 'Your profile'}</h2>
          <p className="text-[#64748b] text-xs text-center mb-7">{dict?.obDesc || 'This helps AI write in your voice.'}</p>

          {/* Current step input */}
          <div className="space-y-5">
            <div>
              <label className={labelClass}>{step.label}</label>
              {step.type === 'textarea' ? (
                <textarea
                  value={bio[step.key]}
                  onChange={e => setBio({ ...bio, [step.key]: e.target.value })}
                  placeholder={step.placeholder}
                  className={`${inputClass} h-28 resize-none`}
                  autoFocus
                />
              ) : (
                <input
                  type={step.type}
                  value={bio[step.key]}
                  onChange={e => setBio({ ...bio, [step.key]: e.target.value })}
                  placeholder={step.placeholder}
                  className={inputClass}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              )}
            </div>

            {/* Summary of filled steps */}
            {currentStep > 0 && (
              <div className="space-y-2 pt-3 border-t border-[#334155]">
                {STEPS.slice(0, currentStep).map(s => (
                  <div key={s.key} className="flex items-start gap-2">
                    <span className="text-green-400 text-xs shrink-0 mt-0.5">✓</span>
                    <div className="min-w-0">
                      <span className="text-[9px] font-black text-[#475569] uppercase tracking-widest block">{s.label}</span>
                      <span className="text-xs text-[#94a3b8] truncate block">{bio[s.key]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(s => s - 1)}
                className="px-5 py-3.5 border border-[#334155] text-[#64748b] rounded-xl font-semibold text-sm transition-all hover:text-white hover:border-[#475569]"
              >
                ←
              </button>
            )}
            <button
              onClick={isLast ? handleSubmit : handleNext}
              disabled={!bio[step.key] || loading}
              className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
            >
              {loading
                ? (dict?.obSaving || 'Saving…')
                : isLast
                  ? (dict?.obFinish || 'Finish')
                  : (dict?.obNext || 'Next →')}
            </button>
          </div>
        </div>

        {/* Skip */}
        <div className="mt-4 text-center">
          <button
            onClick={handleSkip}
            className="text-xs text-[#475569] hover:text-[#94a3b8] transition-colors"
          >
            {dict?.obSkip || 'Skip →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;