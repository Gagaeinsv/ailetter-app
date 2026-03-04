const MODELS = [
  { id: "gemini-2.0-flash",      temp: 0.7 },
  { id: "gemini-2.0-flash-lite", temp: 0.6 },
  { id: "gemini-2.5-flash",      temp: 0.7 },
];

let modelIndex = 0;

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Викликає наш Vercel API route замість Gemini напряму
async function callGemini({ modelId, temperature, maxOutputTokens, contents, responseMimeType }) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ modelId, temperature, maxOutputTokens, contents, responseMimeType }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error?.message || "Gemini API error");
    error.status = response.status;
    throw error;
  }

  // Повертаємо текст так само як раніше
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function tryModel(modelFn) {
  while (modelIndex < MODELS.length) {
    const current = MODELS[modelIndex];
    try {
      console.log(`🌟 Using model: ${current.id}`);
      return await modelFn(current.id, current.temp);
    } catch (error) {
      console.warn(`❌ ${current.id} failed:`, error);
      const isCritical = error.status === 429 || error.status === 404 || error.status === 503;

      if (isCritical) {
        modelIndex++;
        if (modelIndex < MODELS.length) {
          await sleep(1000);
          continue;
        }
      }
      throw error;
    }
  }
  throw new Error("AI is busy. Please try again.");
}

export const generateLetter = async (userProfile, jobDescription, cvFilePart, settings) => {
  const { language, tone, length } = settings;

  const wordLimit =
    length === "Short"    ? "150-200" :
    length === "Detailed" ? "300-400" :
                            "200-300";

  const lang = language === "Auto" ? "the same language as the job description" : language;

  const promptText = `
    Role: You are an expert career coach helping a candidate apply for a job.
    Task: Write a high-impact cover letter in ${lang}.
    
    STRICT CONSTRAINTS:
    1. Length: Keep it approximately ${wordLimit} words. Concise and punchy.
    2. Finish: You MUST include the sign-off "Sincerely, [Name]". NEVER cut off the text.
    3. Content: No fluff. No generic cliches like "I am writing to apply". Start immediately with value.
    
    Tone: ${tone || "Professional, Confident, and Direct"}.
    
    Structure:
    - Opening: Hook the reader immediately with why you fit.
    - Middle: Connect 1-2 key achievements from the CV directly to the Job Description problems.
    - Closing: Brief call to action (interview request) and sign-off.

    Job Description: 
    ${jobDescription.substring(0, 2000)} 
    
    Candidate Profile: 
    Name: ${userProfile.fullName}
    Role: ${userProfile.profession}
    Skills/Experience: ${JSON.stringify(userProfile)}
  `.trim();

  const contents = [promptText, ...(cvFilePart ? [cvFilePart] : [])];

  return await tryModel(async (modelId, temp) => {
    let text = await callGemini({
      modelId,
      temperature: temp,
      maxOutputTokens: 4000,
      contents,
    });

    text = text.replace(/^(Subject:|Oggetto:|RE:|Betreff:|Тема:).*?\n+/gmi, "").trim();
    text = text.replace(/```html|```/g, "");

    return text;
  });
};

export const parseCV = async (cvFilePart) => {
  const promptText = `Analyze this CV and extract details into valid JSON only:
{
  "fullName": "Name Surname",
  "email": "email@example.com",
  "phone": "+123...",
  "location": "City, Country",
  "linkedin": "url",
  "profession": "Current Job Title",
  "skills": "List of top 5 skills",
  "experience": "Summary of most recent role"
}`;

  return await tryModel(async (modelId) => {
    const text = await callGemini({
      modelId,
      temperature: 0.2,
      maxOutputTokens: 4000,
      contents: [promptText, cvFilePart],
      responseMimeType: "application/json",
    });

    return JSON.parse(text);
  });
};