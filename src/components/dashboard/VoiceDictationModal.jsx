// src/components/dashboard/VoiceDictationModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Sparkles, RotateCcw } from 'lucide-react';
import { parseVoiceCV } from '../../gemini';

const TRANSLATIONS = {
  en: {
    title: "🎙️ Voice Profile Dictation",
    subtitle: "Speak naturally about your role, skills, and experience.",
    unsupported: "Your browser does not support Speech Recognition. Please use Google Chrome or Microsoft Edge.",
    micPermissionDenied: "Microphone permission was denied. Please check your browser settings.",
    startRecord: "Start Recording",
    stopRecord: "Stop Recording",
    reset: "Reset",
    placeholder: "Your spoken profile will appear here in real-time...",
    statusIdle: "Ready to listen",
    statusListening: "Listening...",
    statusProcessing: "AI is structuring your profile...",
    confirmBtn: "Confirm & Structure",
    errorTryAgain: "Something went wrong. Please try again.",
    hint: "Tip: Say your name, current job title, skills, and mention recent companies with your role and achievements.",
  },
  uk: {
    title: "🎙️ Голосове надикторування профілю",
    subtitle: "Розкажіть у довільній формі про ваш досвід, навички та посаду.",
    unsupported: "Ваш браузер не підтримує розпізнавання мовлення. Будь ласка, скористайтеся Google Chrome або Microsoft Edge.",
    micPermissionDenied: "Доступ до мікрофона відхилено. Будь ласка, перевірте налаштування браузера.",
    startRecord: "Почати запис",
    stopRecord: "Зупинити запис",
    reset: "Скинути",
    placeholder: "Тут з'явиться ваш текст у реальному часі...",
    statusIdle: "Готово до запису",
    statusListening: "Слухаю...",
    statusProcessing: "ШІ структурує ваш профіль...",
    confirmBtn: "Обробити та заповнити",
    errorTryAgain: "Щось пішло не так. Спробуйте ще раз.",
    hint: "Порада: Назвіть своє ім'я, професію, навички, попередні компанії, посади та ваші досягнення.",
  },
  it: {
    title: "🎙️ Dettatura Vocale del Profilo",
    subtitle: "Parla liberamente del tuo ruolo, delle tue competenze ed esperienze.",
    unsupported: "Il tuo browser non supporta il riconoscimento vocale. Usa Google Chrome o Microsoft Edge.",
    micPermissionDenied: "Accesso al microfono negato. Controlla le impostazioni del browser.",
    startRecord: "Avvia Registrazione",
    stopRecord: "Ferma Registrazione",
    reset: "Azzera",
    placeholder: "Il testo pronunciato apparirà qui in tempo reale...",
    statusIdle: "Pronto ad ascoltare",
    statusListening: "In ascolto...",
    statusProcessing: "L'IA sta strutturando il tuo profilo...",
    confirmBtn: "Conferma e Struttura",
    errorTryAgain: "Qualcosa è andato storto. Riprova.",
    hint: "Suggerimento: Pronuncia il tuo nome, la tua professione, le tue competenze e menziona le ultime aziende con i tuoi ruoli.",
  },
  de: {
    title: "🎙️ Diktieren des Profils",
    subtitle: "Erzählen Sie frei über Ihre Rolle, Fähigkeiten und Erfahrungen.",
    unsupported: "Ihr Browser unterstützt keine Spracherkennung. Bitte verwenden Sie Google Chrome oder Microsoft Edge.",
    micPermissionDenied: "Mikrofonzugriff verweigert. Bitte überprüfen Sie Ihre Browsereinstellungen.",
    startRecord: "Aufnahme starten",
    stopRecord: "Aufnahme stoppen",
    reset: "Zurücksetzen",
    placeholder: "Ihr gesprochenes Profil wird hier in Echtzeit angezeigt...",
    statusIdle: "Bereit zum Zuhören",
    statusListening: "Zuhören...",
    statusProcessing: "KI strukturiert Ihr Profil...",
    confirmBtn: "Bestätigen & Strukturieren",
    errorTryAgain: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
    hint: "Tipp: Nennen Sie Ihren Namen, Beruf, Fähigkeiten und Ihre letzten Stationen mit Aufgaben.",
  }
};

const LANGS = [
  { code: 'uk', label: 'Українська' },
  { code: 'en', label: 'English' },
  { code: 'it', label: 'Italiano' },
  { code: 'de', label: 'Deutsch' }
];

const VoiceDictationModal = ({ uiLang, onClose, onParsed, showNotification }) => {
  const t = TRANSLATIONS[uiLang] || TRANSLATIONS.en;
  
  const [selectedLang, setSelectedLang] = useState(uiLang || 'en');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startSpeech = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setError('');
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    
    const langMap = { en: 'en-US', uk: 'uk-UA', it: 'it-IT', de: 'de-DE' };
    rec.lang = langMap[selectedLang] || 'en-US';

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (final) {
        setTranscript(prev => prev + final);
      }
      setInterimTranscript(interim);
    };

    rec.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError(t.micPermissionDenied);
      } else {
        setError(`${t.errorTryAgain} (${event.error})`);
      }
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
    rec.start();
  };

  const stopSpeech = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopSpeech();
    } else {
      startSpeech();
    }
  };

  const handleReset = () => {
    stopSpeech();
    setTranscript('');
    setInterimTranscript('');
    setError('');
  };

  const handleConfirm = async () => {
    const fullText = (transcript + ' ' + interimTranscript).trim();
    if (!fullText) return;

    stopSpeech();
    setLoading(true);
    setError('');

    try {
      const parsedData = await parseVoiceCV(fullText);
      onParsed(parsedData);
      showNotification('Profile generated from voice ✓');
      onClose();
    } catch (err) {
      console.error(err);
      setError(t.errorTryAgain);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
          <div>
            <h2 className="text-white font-bold text-sm flex items-center gap-2">
              {t.title}
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">
              {t.subtitle}
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {!isSupported ? (
            <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-sm text-red-400">
              {t.unsupported}
            </div>
          ) : (
            <>
              {/* Language Selector */}
              <div className="flex items-center gap-2 mb-3 bg-[#1e293b]/60 border border-[#334155]/50 p-2.5 rounded-xl">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Language to speak:</span>
                <div className="flex gap-1.5 flex-1 justify-end">
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setSelectedLang(l.code)}
                      disabled={isListening || loading}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                        selectedLang === l.code
                          ? 'bg-amber-500 border-amber-500 text-black shadow-sm'
                          : 'border-[#334155] text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-40'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transcript Display Box */}
              <div className="relative">
                <div 
                  className={`w-full h-44 bg-[#1e293b] border ${isListening ? 'border-amber-500/50' : 'border-[#334155]'} text-gray-200 text-sm rounded-xl p-4 overflow-y-auto leading-relaxed select-text`}
                >
                  {transcript || interimTranscript ? (
                    <p>
                      {transcript}
                      {interimTranscript && <span className="text-amber-400/80 italic">{interimTranscript}</span>}
                    </p>
                  ) : (
                    <span className="text-gray-500 italic">{t.placeholder}</span>
                  )}
                </div>
              </div>

              {/* Status or Error message */}
              {error ? (
                <p className="text-xs text-red-400 font-semibold">{error}</p>
              ) : (
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1.5 font-medium">
                    {isListening && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}
                    {isListening ? t.statusListening : loading ? t.statusProcessing : t.statusIdle}
                  </span>
                  {!isListening && !transcript && (
                    <span className="text-[10px] text-gray-600 max-w-[80%] text-right">{t.hint}</span>
                  )}
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleToggleListening}
                  disabled={loading}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-400 text-white border-red-500'
                      : 'bg-amber-500 hover:bg-amber-400 text-black border-amber-500'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      {t.stopRecord}
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      {t.startRecord}
                    </>
                  )}
                </button>

                {(transcript || interimTranscript) && (
                  <button
                    onClick={handleReset}
                    disabled={loading}
                    className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all"
                    title={t.reset}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Action Confirmation Button */}
              {(transcript || interimTranscript) && (
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t.statusProcessing}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {t.confirmBtn}
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceDictationModal;
