import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// ✅ Актуальні моделі (лютий 2026)
// ❌ gemini-1.5-* — ВІДКЛЮЧЕНІ Google, повертають 404
// ❌ gemini-2.0-flash-exp — прибрана з v1beta API
const MODELS = [
  { id: "gemini-2.0-flash",      temp: 0.7 }, // основна стабільна
  { id: "gemini-2.0-flash-lite", temp: 0.6 }, // легша резервна
  { id: "gemini-2.5-flash",      temp: 0.7 }, // найновіша (якщо є доступ)
];

let modelIndex = 0;

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function tryModel(modelFn) {
  while (modelIndex < MODELS.length) {
    const current = MODELS[modelIndex];
    try {
      console.log(`🌟 Using model: ${current.id} (${modelIndex + 1}/${MODELS.length})`);
      return await modelFn(current.id, current.temp);
    } catch (error) {
      console.warn(`❌ ${current.id} failed:`, error);

      const is429 = error.status === 429 || error.message?.includes('429');
      const is404 = error.status === 404 || error.message?.includes('404');

      if (is429 || is404) {
        modelIndex++;
        if (modelIndex < MODELS.length) {
          const wait = is429
            ? parseFloat(error.message?.match(/in ([\d.]+)s/)?.[1] || 10) * 1000
            : 500;
          console.log(`⏳ Switching to ${MODELS[modelIndex].id}...`);
          await sleep(wait);
          continue;
        }
      }

      throw error;
    }
  }
  throw new Error("All models exhausted");
}

export const generateLetter = async (userProfile, jobDescription, cvFilePart, settings) => {
  const { language, tone, length } = settings;

  const paragraphCount =
    length === 'Short'    ? 3 :
    length === 'Detailed' ? 6 :
                            4;

  const lang = language === 'Auto' ? 'the same language as the job description' : language;

  const promptText = `Write a cover letter in ${lang} with exactly ${paragraphCount} paragraphs and ${tone || 'professional'} tone.

Paragraph 1: Express interest in the specific role and company.
Paragraph 2: Highlight the most relevant experience from the candidate profile.
Paragraph 3: Explain why this candidate fits this specific job.
${paragraphCount >= 4 ? 'Paragraph 4: Closing — express enthusiasm, mention availability for interview.' : ''}
${paragraphCount >= 5 ? 'Paragraph 5: Additional value the candidate brings.' : ''}
${paragraphCount >= 6 ? 'Paragraph 6: Strong final closing statement.' : ''}

Start with: Dear Hiring Manager,
End with: Sincerely, [candidate full name]

Do not add a subject line. Do not use markdown. Write full complete sentences.

JOB: ${jobDescription}

CANDIDATE: Name: ${userProfile.fullName}, Role: ${userProfile.profession}, Location: ${userProfile.location}, Email: ${userProfile.email}
  `.trim();

  const contents = [promptText, ...(cvFilePart ? [cvFilePart] : [])];

  return await tryModel(async (modelId, temp) => {
    const m = genAI.getGenerativeModel({
      model: modelId,
      generationConfig: { temperature: temp, maxOutputTokens: 3000 },
    });
    const response = await m.generateContent(contents);
    const text = response.response.text();
    // Прибрати Subject рядок якщо модель все одно додала
    return text.replace(/^(Subject:|Oggetto:|RE:|Betreff:|Тема:).*?\n+/gmi, "").trim();
  });
};

export const parseCV = async (cvFilePart) => {
  const promptText = `Extract details from this CV. Return ONLY valid JSON, no markdown, no explanation:
{
  "fullName": "",
  "email": "",
  "phone": "",
  "location": "",
  "linkedin": "",
  "profession": "",
  "skills": "",
  "experience": ""
}`;

  return await tryModel(async (modelId) => {
    const m = genAI.getGenerativeModel({
      model: modelId,
      generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
    });
    const response = await m.generateContent([promptText, cvFilePart]);
    const clean = response.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  });
};

// Скинути fallback індекс (викликай з консолі браузера якщо треба)
if (typeof window !== "undefined") {
  window.resetGeminiModels = () => {
    modelIndex = 0;
    console.log("🔄 Gemini models reset to", MODELS[0].id);
  };
}