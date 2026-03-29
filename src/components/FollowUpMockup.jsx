// src/components/FollowUpMockup.jsx
import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const TRANSLATIONS = {
  en: {
    badge: "NEW",
    title: "Smart Follow-up Reminders",
    subtitle: "AIletter remembers every application. After 7 days with no reply, we remind you to send a follow-up — and generate it for you.",
    step1: "Cover letter created",
    step1sub: "Google — Senior Product Manager",
    step1time: "Mon, Mar 17",
    step2: "Waiting for reply...",
    step2sub: "AIletter is tracking your application",
    step3: "Time to follow up!",
    step3sub: "7 days have passed. Want us to generate a follow-up message?",
    step3time: "Mon, Mar 24",
    btnGenerate: "Generate follow-up",
    btnSkip: "Remind later",
    notification: "You have 2 applications ready for follow-up",
  },
  uk: {
    badge: "НОВЕ",
    title: "Розумні нагадування про follow-up",
    subtitle: "AIletter запам'ятовує кожну заявку. Через 7 днів без відповіді — нагадує та генерує follow-up лист за вас.",
    step1: "Лист створено",
    step1sub: "Google — Senior Product Manager",
    step1time: "Пн, 17 бер",
    step2: "Очікуємо відповіді...",
    step2sub: "AIletter відстежує вашу заявку",
    step3: "Час для follow-up!",
    step3sub: "Минуло 7 днів. Згенерувати follow-up повідомлення?",
    step3time: "Пн, 24 бер",
    btnGenerate: "Згенерувати follow-up",
    btnSkip: "Нагадати пізніше",
    notification: "2 заявки готові до follow-up",
  },
  it: {
    badge: "NUOVO",
    title: "Promemoria follow-up intelligenti",
    subtitle: "AIletter ricorda ogni candidatura. Dopo 7 giorni senza risposta, ti avvisa e genera il follow-up per te.",
    step1: "Lettera creata",
    step1sub: "Google — Senior Product Manager",
    step1time: "Lun, 17 mar",
    step2: "In attesa di risposta...",
    step2sub: "AIletter sta monitorando la tua candidatura",
    step3: "È ora del follow-up!",
    step3sub: "Sono passati 7 giorni. Vuoi generare un messaggio di follow-up?",
    step3time: "Lun, 24 mar",
    btnGenerate: "Genera follow-up",
    btnSkip: "Ricordamelo dopo",
    notification: "2 candidature pronte per il follow-up",
  },
  de: {
    badge: "NEU",
    title: "Intelligente Follow-up Erinnerungen",
    subtitle: "AIletter merkt sich jede Bewerbung. Nach 7 Tagen ohne Antwort erinnert es dich und generiert das Follow-up.",
    step1: "Anschreiben erstellt",
    step1sub: "Google — Senior Product Manager",
    step1time: "Mo, 17. Mär",
    step2: "Warte auf Antwort...",
    step2sub: "AIletter verfolgt deine Bewerbung",
    step3: "Zeit für Follow-up!",
    step3sub: "7 Tage sind vergangen. Follow-up Nachricht generieren?",
    step3time: "Mo, 24. Mär",
    btnGenerate: "Follow-up generieren",
    btnSkip: "Später erinnern",
    notification: "2 Bewerbungen bereit für Follow-up",
  },
};

const FollowUpMockup = () => {
  const { uiLang } = useLanguage();
  const f = TRANSLATIONS[uiLang] || TRANSLATIONS.en;

  return (
    <section className="py-16 md:py-20 px-4 md:px-6 relative z-10 bg-[#1e293b]/20">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            {f.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4">{f.title}</h2>
          <p className="text-gray-400 text-base max-w-xl mx-auto">{f.subtitle}</p>
        </div>

        {/* Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* Left — timeline */}
          <div className="bg-[rgba(30,41,59,0.5)] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-5">
              Application tracker
            </p>

            {/* Step 1 */}
            <div className="flex gap-4 mb-1">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div className="w-px flex-1 bg-gray-700/60 my-1" />
              </div>
              <div className="pb-5">
                <p className="text-white text-sm font-semibold">{f.step1}</p>
                <p className="text-indigo-400 text-xs mt-0.5">{f.step1sub}</p>
                <p className="text-gray-600 text-xs mt-1">{f.step1time}</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 mb-1">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                </div>
                <div className="w-px flex-1 bg-gray-700/60 my-1" />
              </div>
              <div className="pb-5">
                <p className="text-gray-300 text-sm font-semibold">{f.step2}</p>
                <p className="text-gray-500 text-xs mt-0.5">{f.step2sub}</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{f.step3}</p>
                <p className="text-gray-400 text-xs mt-0.5 mb-3">{f.step3sub}</p>
                <p className="text-gray-600 text-xs mb-3">{f.step3time}</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all">
                    {f.btnGenerate}
                  </button>
                  <button className="px-3 py-1.5 bg-white/5 text-gray-400 rounded-lg text-xs hover:bg-white/10 transition-all">
                    {f.btnSkip}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right — notification + list */}
          <div className="flex flex-col gap-4">

            {/* Banner */}
            <div className="bg-[rgba(30,41,59,0.5)] backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white text-sm font-bold">AIletter</p>
                    <span className="text-[10px] text-gray-500">now</span>
                  </div>
                  <p className="text-gray-300 text-xs leading-relaxed">{f.notification}</p>
                </div>
              </div>
            </div>

            {/* Application cards */}
            {[
              { company: 'Google', role: 'Senior PM', days: 7, color: 'from-blue-500 to-indigo-500' },
              { company: 'Spotify', role: 'Product Designer', days: 9, color: 'from-green-500 to-teal-500' },
            ].map((item, i) => (
              <div key={i} className="bg-[rgba(30,41,59,0.5)] backdrop-blur-xl border border-white/[0.06] rounded-xl p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-black text-xs shrink-0`}>
                  {item.company[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{item.company}</p>
                  <p className="text-gray-500 text-xs truncate">{item.role}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    <span className="text-orange-400 text-[10px] font-bold">{item.days}d</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FollowUpMockup;
