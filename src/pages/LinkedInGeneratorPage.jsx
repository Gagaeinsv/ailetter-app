import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generateLinkedInVersion } from "../gemini";
import { Loader2, Copy, Check, Linkedin } from "lucide-react";

const LINKEDIN_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'LinkedIn Easy Apply Message Generator',
  url: 'https://ailetter.pro/linkedin-message',
  description: 'Generate a short, professional LinkedIn Easy Apply message tailored to any job description in seconds. Free, no sign-up required.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};

export default function LinkedInGeneratorPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    let sd = document.querySelector('#ailetter-linkedin-schema');
    if (!sd) { sd = document.createElement('script'); sd.id = 'ailetter-linkedin-schema'; sd.type = 'application/ld+json'; document.head.appendChild(sd); }
    sd.textContent = JSON.stringify(LINKEDIN_SCHEMA);
    return () => { try { document.head.removeChild(sd); } catch(e) {} };
  }, []);

  const goToMain = () => {
    window.scrollTo(0, 0);
    navigate("/?from=linkedin");
  };

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

      {/* HEADER */}
      <div className="max-w-2xl mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          LinkedIn Easy Apply Message Generator
        </h1>

        <p className="text-gray-400 mb-3">
          Not sure what to write in LinkedIn Easy Apply? Generate a short,
          professional message tailored to your job description in seconds.
        </p>

        <p className="text-gray-500 text-sm">
          Paste the job description → generate → copy → apply.
        </p>

        {/* CTA зверху */}
        <p className="text-xs text-gray-500 mt-4">
          Free · No sign-up ·{" "}
          <button
            onClick={goToMain}
            className="text-indigo-400 hover:text-indigo-300 underline"
          >
            Need a full cover letter? →
          </button>
        </p>
      </div>

      {/* INPUT */}
      <div className="w-full max-w-2xl">
        <textarea
          className="w-full bg-[#1e293b] border border-[#334155] rounded-xl p-4 text-white resize-none"
          rows={7}
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />

        <button
          onClick={handleGenerate}
          disabled={loading || !jobDescription.trim()}
          className="mt-3 w-full bg-[#6366f1] hover:bg-[#5458ee] px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
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

      {/* RESULT */}
      {result && (
        <>
          <div className="w-full max-w-2xl mt-8 bg-[#1e293b] border border-[#334155] rounded-xl p-5">
            <p className="whitespace-pre-wrap text-gray-200 text-sm mb-4">
              {result}
            </p>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleCopy}
                className="bg-[#334155] px-4 py-2 rounded-lg text-sm flex items-center gap-2"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? "Copied!" : "Copy"}
              </button>

              <button
                onClick={handleOpenLinkedIn}
                className="bg-[#0077b5] px-4 py-2 rounded-lg text-sm flex items-center gap-2"
              >
                <Linkedin size={15} />
                Open LinkedIn
              </button>
            </div>

            <p className="text-xs text-gray-600 mt-4">
              Paste this into the "Cover Letter" field on LinkedIn Easy Apply.
            </p>

            <p className="text-xs text-gray-700 mt-1">
              Generated with AIletter
            </p>
          </div>

          {/* CTA після результату */}
          <div className="w-full max-w-2xl mt-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-white text-sm">
                Need a full cover letter?
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Upload your CV + job description → get a tailored letter in 30 seconds.
              </p>
            </div>

            <button
              onClick={goToMain}
              className="bg-[#6366f1] hover:bg-[#5458ee] px-5 py-2.5 rounded-xl font-semibold text-sm"
            >
              Try AIletter →
            </button>
          </div>

          {/* 💰 FREE vs PRO */}
          <div className="w-full max-w-2xl mt-4 bg-[#1e293b] border border-[#334155] rounded-xl p-5">

            <div className="text-center mb-4">
              <p className="text-sm font-semibold text-white">
                Unlock full job application toolkit
              </p>
              <p className="text-xs text-gray-400">
                Go beyond LinkedIn messages
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">

              <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-3">
                <p className="font-semibold text-gray-300 mb-2">Free</p>
                <ul className="space-y-1 text-gray-500">
                  <li>✔ LinkedIn message generator</li>
                  <li>✔ Unlimited usage</li>
                </ul>
              </div>

              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 relative">
                <div className="absolute -top-2 right-2 text-[10px] bg-indigo-500 px-2 py-0.5 rounded">
                  PRO
                </div>

                <p className="font-semibold text-white mb-2">Pro</p>
                <ul className="space-y-1 text-gray-300">
                  <li>✔ Full cover letters</li>
                  <li>✔ CV parsing</li>
                  <li>✔ Templates</li>
                  <li>✔ PDF export</li>
                </ul>
              </div>

            </div>

            <div className="mt-5 text-center">
              <button
                onClick={goToMain}
                className="bg-[#6366f1] hover:bg-[#5458ee] px-6 py-2.5 rounded-xl font-semibold text-sm"
              >
                Upgrade to Pro →
              </button>
            </div>

          </div>
        </>
      )}

      {/* SEO EXAMPLES */}
      <div className="w-full max-w-2xl mt-16">
        <h2 className="text-xl font-semibold mb-6 text-center">
          LinkedIn Easy Apply Message Examples
        </h2>

        <div className="space-y-4 text-sm text-gray-300">
          <div className="bg-[#1e293b] p-4 rounded-xl">
            Managing cross-functional teams and tight deadlines has been my daily work for the past 3 years...
          </div>
          <div className="bg-[#1e293b] p-4 rounded-xl">
            You’re looking for someone who can handle multiple stakeholders...
          </div>
        </div>
      </div>

    </div>
  );
}