import React, { useState } from "react";
import { generateLinkedInVersion } from "../gemini";
import { Loader2, Copy, Check, Linkedin } from "lucide-react";

export default function LinkedInGeneratorPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!jobDescription.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const text = await generateLinkedInVersion("", jobDescription, {
        fullName: "",
        profession: "",
      });
      setResult(text);
    } catch (e) {
      setError("Something went wrong. Please try again.");
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
    window.open("https://www.linkedin.com/jobs", "_blank");
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center px-4 py-12">

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-[#6366f1] p-2 rounded-lg">
          <Linkedin size={24} className="text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold">LinkedIn Easy Apply Message Generator</h1>
      </div>

      <p className="text-gray-400 text-center max-w-xl mb-2">
        Generate a short, personalized LinkedIn Easy Apply message in seconds.
        Paste the job description — get a ready-to-send message.
      </p>

      {/* Subtle CTA вгорі */}
      <p className="text-xs text-gray-500 mb-10 text-center">
        Free · No sign-up required · Powered by AI ·{" "}
        <a href="/" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
          Need a full cover letter? →
        </a>
      </p>

      {/* Input */}
      <div className="w-full max-w-2xl">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Job Description
        </label>
        <textarea
          className="w-full bg-[#1e293b] border border-[#334155] rounded-xl p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-[#6366f1] transition-colors"
          rows={7}
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />

        <button
          onClick={handleGenerate}
          disabled={loading || !jobDescription.trim()}
          className="mt-3 w-full bg-[#6366f1] hover:bg-[#5458ee] disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Linkedin size={18} />
              Generate Message
            </>
          )}
        </button>

        {error && (
          <p className="mt-3 text-sm text-red-400 text-center">{error}</p>
        )}
      </div>

      {/* Result */}
      {result && (
        <>
          <div className="w-full max-w-2xl mt-8 bg-[#1e293b] border border-[#334155] rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-3 text-white">
              Your LinkedIn Easy Apply Message
            </h2>
            <p className="whitespace-pre-wrap text-gray-200 text-sm leading-relaxed mb-5">
              {result}
            </p>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 bg-[#334155] hover:bg-[#475569] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
                {copied ? "Copied!" : "Copy Message"}
              </button>

              <button
                onClick={handleOpenLinkedIn}
                className="flex items-center gap-2 bg-[#0077b5] hover:bg-[#006097] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Linkedin size={15} />
                Open LinkedIn Jobs
              </button>
            </div>

            <p className="text-xs text-gray-600 mt-4">
              Paste this in the "Cover Letter" field when applying via LinkedIn Easy Apply.
            </p>
            <p className="text-xs text-gray-700 mt-1">
              Generated with <a href="/" className="underline hover:text-gray-500">AIletter</a>
            </p>
          </div>

          {/* ✅ CTA одразу після результату */}
          <div className="w-full max-w-2xl mt-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-white text-sm">Need a full cover letter?</p>
              <p className="text-xs text-gray-400 mt-0.5">Upload your CV + job description → get a tailored letter in 30 seconds.</p>
            </div>
            <a
              href="/"
              className="shrink-0 bg-[#6366f1] hover:bg-[#5458ee] px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap"
            >
              Try AIletter →
            </a>
          </div>
        </>
      )}

      {/* How it works */}
      <div className="w-full max-w-2xl mt-16">
        <h2 className="text-xl font-semibold mb-6 text-center">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: "1", title: "Paste job description", desc: "Copy the job posting text and paste it above." },
            { step: "2", title: "Generate message", desc: "AI writes a 150–200 word personalized Easy Apply message." },
            { step: "3", title: "Copy & apply", desc: "Paste directly into LinkedIn Easy Apply cover letter field." },
          ].map((item) => (
            <div key={item.step} className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 text-center">
              <div className="w-8 h-8 rounded-full bg-[#6366f1] flex items-center justify-center text-sm font-bold mx-auto mb-3">
                {item.step}
              </div>
              <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA внизу — для тих хто не генерував */}
      <div className="mt-12 text-center">
        <p className="text-gray-500 text-sm mb-4">Want a complete, ATS-optimized cover letter?</p>
        <a
          href="/"
          className="inline-block bg-[#6366f1] hover:bg-[#5458ee] px-8 py-3 rounded-xl font-semibold transition-colors"
        >
          Try AI Cover Letter Generator →
        </a>
      </div>

    </div>
  );
}
