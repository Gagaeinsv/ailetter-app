const MODELS = [
  { id: "gemini-2.0-flash",      temp: 0.7 },
  { id: "gemini-2.0-flash-lite", temp: 0.6 },
  { id: "gemini-2.5-flash",      temp: 0.7 },
];

let modelIndex = 0;

const sleep = ms => new Promise(r => setTimeout(r, ms));

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

  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function tryModel(modelFn) {
  while (modelIndex < MODELS.length) {
    const current = MODELS[modelIndex];
    try {
      console.log(`Using model: ${current.id}`);
      return await modelFn(current.id, current.temp);
    } catch (error) {
      console.warn(`${current.id} failed:`, error);
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
    Role: You are an expert career coach writing a high-impact cover letter.
    Task: Write a cover letter in ${lang} for the candidate below.

    ══════════════════════════════════════════
    OPENING SENTENCE — CRITICAL RULES:
    ══════════════════════════════════════════
    The FIRST sentence is the most important. It MUST immediately hook the reader.

    ✅ GOOD openings (use this style):
    - Start with a specific achievement: "In my last role, I reduced delivery times by 30% managing a cross-functional team of 8 — exactly the kind of result [Company] needs."
    - Start with a direct connection to their need: "You need someone who can coordinate complex digital projects across multiple clients — that's been my day-to-day for the past [X] years."
    - Start with a bold, confident statement: "Three languages, five years of client-facing project management, and a track record of on-time delivery — I'm ready to bring this to [Company]."

    ❌ FORBIDDEN openings — NEVER use these or any variation:
    - "Con la mia comprovata esperienza..." / "With my proven experience..."
    - "Mit meiner Erfahrung..." / "Avec mon expérience..."
    - "З моїм досвідом..."
    - "I am writing to apply for..."
    - "I am the ideal candidate..."
    - "I am pleased to submit my application..."
    - "Having [X] years of experience..."
    - Any sentence starting with "I am" or "I have" as the first words

    ══════════════════════════════════════════
    FULL LETTER RULES:
    ══════════════════════════════════════════
    1. Length: Approximately ${wordLimit} words. Concise and punchy.
    2. Finish: MUST include sign-off "Sincerely, [Name]". NEVER cut off mid-sentence.
    3. No fluff, no buzzwords, no hollow phrases.
    4. Tone: ${tone || "Professional, Confident, and Direct"}.

    Structure:
    - Opening: Hook the reader with a specific achievement or direct connection to their need.
    - Middle: Connect 1-2 key achievements from the CV to the specific problems in the Job Description.
    - Closing: Brief, confident call to action (request for interview) + sign-off.

    ══════════════════════════════════════════
    JOB DESCRIPTION:
    ══════════════════════════════════════════
    ${jobDescription.substring(0, 2000)}

    ══════════════════════════════════════════
    CANDIDATE PROFILE:
    ══════════════════════════════════════════
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

export const generateLinkedInVersion = async (coverLetter, jobDescription, contactInfo) => {
  const promptText = `
    You are an expert career coach. Write a SHORT LinkedIn Easy Apply message.
    This goes in the "Cover Letter" field when applying via LinkedIn Easy Apply.

    STRICT CONSTRAINTS:
    1. Length: 150–200 words. No more.
    2. Tone: Confident, direct, human. No buzzwords or hollow phrases.
    3. FORBIDDEN first words: "With my experience", "Con la mia esperienza", "I am writing",
       "I am the ideal", "Having X years", "I am pleased". NEVER start with these.
    4. START with a strong hook: a concrete result, a direct match to their need, or a bold statement.
    5. Highlight 2–3 key strengths that directly match the job description.
    6. End with a clear, natural call to action (e.g. "Happy to share more — looking forward to connecting.")
    7. Output ONLY the message body. No subject line, no "Dear...", no explanations.

    Candidate: ${contactInfo?.fullName || contactInfo?.name || 'the candidate'}, ${contactInfo?.profession || ''}

    Job Description:
    ${jobDescription.substring(0, 800)}

    Full Cover Letter (use for context and achievements — do NOT copy sentences directly):
    ${coverLetter.substring(0, 1200)}
  `.trim();

  return await tryModel(async (modelId, temp) => {
    return await callGemini({
      modelId,
      temperature: temp + 0.05,
      maxOutputTokens: 350,
      contents: [promptText],
    });
  });
};