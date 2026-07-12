import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateLinkedInColdMessage } from '../gemini';
import { useLanguage } from '../context/LanguageContext';
import translations from '../locales/translations';
import { Loader2, Copy, Check, MessageSquare, Linkedin, Send } from 'lucide-react';

const UI_TO_PROMPT_LANG = { en: 'English', uk: 'Ukrainian', it: 'Italian', de: 'German' };

export default function LinkedInColdMessagesPage() {
  const { uiLang } = useLanguage();
  const dict = translations[uiLang] || translations.en;
  const navigate = useNavigate();

  const [activeTemplate, setActiveTemplate] = useState('direct');
  const [senderName, setSenderName] = useState('');
  const [senderRole, setSenderRole] = useState('');
  const [recipient, setRecipient] = useState('');
  const [company, setCompany] = useState('');
  const [tone, setTone] = useState('Professional');
  
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const schema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: dict.seoLinkedInColdTitle?.split('|')[0]?.trim() || 'LinkedIn Cold Message Templates',
    url: 'https://ailetter.pro/linkedin-cold-message-templates',
    description: dict.seoLinkedInColdDesc || '',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  }), [dict.seoLinkedInColdTitle, dict.seoLinkedInColdDesc]);

  useEffect(() => {
    let sd = document.querySelector('#ailetter-licold-schema');
    if (!sd) {
      sd = document.createElement('script');
      sd.id = 'ailetter-licold-schema';
      sd.type = 'application/ld+json';
      document.head.appendChild(sd);
    }
    sd.textContent = JSON.stringify(schema);
    return () => {
      try { document.head.removeChild(sd); } catch { /* ignore */ }
    };
  }, [schema]);

  const goToMain = () => {
    window.scrollTo(0, 0);
    navigate('/?from=linkedin-cold-messages');
  };

  const handleGenerate = async () => {
    if (!company.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const text = await generateLinkedInColdMessage(
        senderName,
        senderRole,
        recipient,
        company,
        `Template style is: ${activeTemplate}. Tone: ${tone}.`,
        { outputLanguage: UI_TO_PROMPT_LANG[uiLang] || 'English' }
      );
      setResult(text);
    } catch {
      setError(dict.liColdError || 'Failed to generate message.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenLinkedIn = () => {
    window.open('https://www.linkedin.com', '_blank');
  };

  // Base static templates for quick reference based on language
  const templatesData = useMemo(() => {
    if (uiLang === 'uk') {
      return {
        direct: {
          label: 'Прямий відгук',
          title: 'Стиль: Прямий відгук (Вакансія знайдена)',
          body: 'Привіт, [Ім’я рекрутера]! Сподіваюся, у Вас чудовий день. Я щойно подав відгук на вакансію [Посада] в [Компанія]. Маючи досвід роботи у [Ваша професія], я успішно вирішував завдання з [коротке досягнення]. Буду радий коротко обговорити, як мої навички відповідають цілям Вашої команди. Дякую за Ваш час! — [Ваше ім’я]'
        },
        networking: {
          label: 'Нетворкінг',
          title: 'Стиль: Нетворкінг / Інформаційна бесіда',
          body: 'Привіт, [Ім’я рекрутера]! З цікавістю стежу за розвитком [Компанія], особливо Вашими проектами у сфері [Сфера]. Я працюю як [Ваша професія] і хотів би дізнатися більше про те, як побудовані процеси у Вашій команді. Чи знайдеться у Вас 10 хвилин для короткої кави-дзвінка наступного тижня? Буду дуже вдячний. — [Ваше ім’я]'
        },
        referral: {
          label: 'Запит рефералу',
          title: 'Стиль: Запит рефералу (Рекомендація від колеги)',
          body: 'Привіт, [Ім’я колеги]! Сподіваюся, все добре. Я помітив вакансію [Посада] у вашій компанії [Компанія]. Оскільки мій досвід у [Ваша професія] тісно перетинається з вимогами цієї ролі, я хотів запитати, чи будеш ти проти порекомендувати (refer) мене всередині компанії? Додаю своє резюме. Буду радий допомогти у відповідь, якщо виникне потреба! Дякую. — [Ваше ім’я]'
        }
      };
    }
    // Default English
    return {
      direct: {
        label: 'Direct Apply',
        title: 'Style: Direct Application (Job Found)',
        body: 'Hi [Recipient Name], hope you are doing well. I recently applied for the [Position] role at [Company]. With my background as a [Your Profession], I specialize in [key skill/achievement]. I would love to connect and briefly share how my skills align with your current team goals. Thanks for your time! - [Your Name]'
      },
      networking: {
        label: 'Networking',
        title: 'Style: Networking / Informational Interview',
        body: 'Hi [Recipient Name], I hope you are having a great week. I have been following [Company] and admire your work in [industry/area]. As a [Your Profession], I am eager to learn more about the team culture and engineering processes at your company. Would you be open to a quick 10-minute virtual chat next week? Best - [Your Name]'
      },
      referral: {
        label: 'Referral Request',
        title: 'Style: Referral Request (Peer Outreach)',
        body: 'Hi [Recipient Name], hope you are well. I saw that [Company] is hiring for a [Position] role. Since my background as a [Your Profession] closely matches the job requirements, I was wondering if you would be open to referring me internally? I have attached my resume for reference. Let me know if you have a few minutes to connect! Thanks - [Your Name]'
      }
    };
  }, [uiLang]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center px-4 py-12 font-sans select-text">
      {/* Header */}
      <div className="max-w-2xl mb-8 text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent">
          {dict.liColdPageTitle}
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          {dict.liColdPageLead}
        </p>
        <p className="text-xs text-indigo-400/90 font-semibold">{dict.toolLangNote}</p>
      </div>

      {/* Selector & Form */}
      <div className="w-full max-w-2xl bg-[#1e293b]/50 border border-[#334155]/50 p-6 rounded-3xl space-y-6 shadow-2xl backdrop-blur-md">
        
        {/* Template Style Toggle */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            {dict.liColdTemplateLabel}
          </label>
          <div className="flex flex-wrap gap-2 bg-[#0f172a] p-1.5 rounded-2xl border border-[#334155]">
            {[
              { id: 'direct', label: templatesData.direct.label },
              { id: 'networking', label: templatesData.networking.label },
              { id: 'referral', label: templatesData.referral.label }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTemplate(item.id);
                  setResult(''); // Clear result on template switch
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all ${
                  activeTemplate === item.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {dict.liColdSenderName}
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder={dict.liColdSenderNamePh}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {dict.liColdSenderRole}
            </label>
            <input
              type="text"
              value={senderRole}
              onChange={(e) => setSenderRole(e.target.value)}
              placeholder={dict.liColdSenderRolePh}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {dict.liColdRecipient}
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={dict.liColdRecipientPh}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {dict.liColdCompany}
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder={dict.liColdCompanyPh}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all font-semibold"
            />
          </div>
        </div>

        {/* Tone Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            {dict.liColdTone}
          </label>
          <div className="flex flex-wrap gap-2 bg-[#0f172a] p-1.5 rounded-2xl border border-[#334155]">
            {[
              { id: 'Warm', label: dict.liColdToneWarm || 'Warm' },
              { id: 'Professional', label: dict.liColdToneProfessional || 'Professional' },
              { id: 'Short', label: dict.liColdToneShort || 'Short & Direct' }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTone(item.id)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all ${
                  tone === item.id 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/10' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !company.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] px-6 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-indigo-600/20"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {dict.liColdGenerating}
            </>
          ) : (
            <>
              <Send size={16} />
              {dict.liColdGenerate}
            </>
          )}
        </button>

        {error && <p className="text-xs text-rose-400 text-center font-bold">{error}</p>}
      </div>

      {/* Result Panel */}
      {result && (
        <div className="w-full max-w-2xl mt-8 space-y-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-3xl p-6 space-y-4 shadow-2xl relative">
            <p className="whitespace-pre-wrap text-slate-200 text-sm leading-relaxed font-medium">
              {result}
            </p>
            <div className="flex gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleCopy}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border border-white/5 flex items-center gap-2"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copied ? dict.liColdCopied : dict.liColdCopy}
              </button>
              <button
                type="button"
                onClick={handleOpenLinkedIn}
                className="bg-[#0077b5] hover:bg-[#006297] text-white transition-all px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2"
              >
                <Linkedin size={14} />
                Open LinkedIn
              </button>
            </div>
          </div>

          {/* Upsell Banner */}
          <div className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="space-y-0.5 text-center md:text-left">
              <p className="font-bold text-white text-sm">{dict.liColdUpsellTitle}</p>
              <p className="text-xs text-slate-400">Generate a custom formatted, print-ready PDF resume and cover letter in 1 click.</p>
            </div>
            <button
              type="button"
              onClick={goToMain}
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider whitespace-nowrap shadow-lg shadow-indigo-600/15"
            >
              {dict.liColdUpsellBtn}
            </button>
          </div>
        </div>
      )}

      {/* Guide Content (SEO-Rich) */}
      <div className="w-full max-w-2xl mt-16 border-t border-slate-800 pt-10 space-y-6">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
          <MessageSquare className="text-indigo-400 w-6 h-6" />
          {templatesData[activeTemplate].title}
        </h2>
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl font-serif text-slate-300 text-sm leading-relaxed italic relative">
          {templatesData[activeTemplate].body}
        </div>
      </div>
    </div>
  );
}
