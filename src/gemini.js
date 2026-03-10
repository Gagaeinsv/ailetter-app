const MODELS = [
  { id: "gemini-2.0-flash",      temp: 0.7 },
  { id: "gemini-2.0-flash-lite", temp: 0.6 },
  { id: "gemini-2.5-flash",      temp: 0.7 },
];

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

// ✅ FIX #1 — modelIndex локальний, не глобальний
async function tryModel(modelFn) {
  let modelIndex = 0;
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
    length === "Short"    ? "250-300" :
    length === "Detailed" ? "380-420" :
                            "320-370";

  const lang = language === "Auto" ? "the same language as the job description" : language;

  // ✅ FIX #3 — userProfile структурований, не JSON blob
  const candidateProfile = `
- Full Name: ${userProfile.fullName || "Not provided"}
- Current Role: ${userProfile.profession || "Not provided"}
- Location: ${userProfile.location || "Not specified"}
- Key Skills: ${Array.isArray(userProfile.skills) ? userProfile.skills.join(", ") : (userProfile.skills || "Not provided")}
- Recent Experience: ${userProfile.experience || "Not provided"}
- Email: ${userProfile.email || "Not provided"}
- LinkedIn: ${userProfile.linkedin || "Not provided"}
  `.trim();

  const promptText = `
You are an expert career coach and professional copywriter specializing in modern, ATS-friendly cover letters.

TASK: Write a highly personalized, concise, results-oriented cover letter in ${lang} for the candidate below.

══════════════════════════════════════════
SALUTATION — CRITICAL RULES:
══════════════════════════════════════════
- ALWAYS use "Dear Hiring Manager," as the salutation.
- NEVER write "[Hiring Manager Name]", "[Name]", or any bracket placeholder.
- In Italian: "Gentile Hiring Manager,"
- In German: "Sehr geehrte Damen und Herren,"
- In Ukrainian: "Шановний менеджер з найму,"

══════════════════════════════════════════
OPENING SENTENCE — CRITICAL RULES:
══════════════════════════════════════════
The FIRST sentence after the salutation MUST immediately hook the reader.

✅ GOOD openings — use one of these styles:
- Lead with a NUMBER or CONCRETE RESULT: "Eight team members, three languages, five years of delivery — that's what I bring to this role."
- Direct match to their need: "You need someone who can juggle multiple client projects without dropping a deadline — that's been my job description for the past five years."
- Bold statement of value: "Cross-functional teams, tight deadlines, demanding clients — I don't just manage these situations, I thrive in them."

❌ FORBIDDEN openings — NEVER use:
- "Con la mia comprovata esperienza..." / "With my proven experience..."
- "Mit meiner Erfahrung..." / "З моїм досвідом..."
- "I am writing to apply..." / "I am the ideal candidate..."
- "I am pleased to submit..." / "Having [X] years of experience..."
- Any gerund (-ing word) as the very first word (e.g. "Successfully...", "Managing...")
- Any sentence starting with "I am" or "I have" as the first words

══════════════════════════════════════════
ATS OPTIMIZATION:
══════════════════════════════════════════
- Mirror the EXACT keywords and phrases from the Job Description where relevant.
- Do NOT paraphrase: if the JD says "cross-functional collaboration", use those exact words.
- Do NOT keyword-stuff; use each key phrase at most once naturally.
- Include at least 2-3 quantified achievements (numbers, percentages, concrete results).

══════════════════════════════════════════
FULL LETTER RULES:
══════════════════════════════════════════
1. Length: Approximately ${wordLimit} words. Concise and punchy.
2. Tone: ${tone || "Professional, Confident, and Direct"}.
3. Finish: MUST end with "Sincerely," on one line, then "${userProfile.fullName}" on the next.
4. No fluff, no buzzwords, no hollow phrases not backed by evidence.
5. Do NOT invent degrees, certifications, or tools not mentioned in the CV or job description.

STRUCTURE:
- Salutation (adapted to language)
- Opening: Hook with result, number, or direct match to their need
- Body (1-2 paragraphs): Align 3-5 key requirements from JD with candidate experience + quantified achievements
- Closing: Reaffirm motivation + call to action for interview
- Sign-off: "Sincerely," + candidate name

OUTPUT FORMAT — STRICTLY:
- Plain text only. No markdown, no bullet points, no asterisks, no headers.
- Blank line between each paragraph.
- Do NOT add any comment, explanation, or meta-text before or after the letter.
- Do NOT output a subject line.

══════════════════════════════════════════
JOB DESCRIPTION:
══════════════════════════════════════════
${jobDescription.substring(0, 2000)}

══════════════════════════════════════════
CANDIDATE PROFILE:
══════════════════════════════════════════
${candidateProfile}
  `.trim();

  // ✅ FIX #2 — contents як правильний формат для Gemini
  const parts = [{ text: promptText }];
  if (cvFilePart) parts.push(cvFilePart);

  const contents = [{ role: "user", parts }];

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
  const promptText = `Analyze this CV and extract details into valid JSON only, no markdown, no backticks:
{
  "fullName": "Name Surname",
  "email": "email@example.com",
  "phone": "+123...",
  "location": "City, Country",
  "linkedin": "url or empty string",
  "profession": "Current Job Title",
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Jan 2023 – Present",
      "achievements": ["Achievement with metric if available", "Achievement 2"]
    }
  ],
  "education": "Degree, University, Year",
  "languages": ["Language 1", "Language 2"],
  "certifications": ["Cert 1"]
}`;

  return await tryModel(async (modelId) => {
    // ✅ FIX #2 — правильний формат contents
    const contents = [
      {
        role: "user",
        parts: [{ text: promptText }, cvFilePart],
      },
    ];

    const text = await callGemini({
      modelId,
      temperature: 0.2,
      maxOutputTokens: 4000,
      contents,
      responseMimeType: "application/json",
    });

    // ✅ FIX #8 — очищення JSON обгортки
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    return JSON.parse(cleaned);
  });
};

export const generateLinkedInVersion = async (coverLetter, jobDescription, contactInfo) => {
  const promptText = `
You are an expert career coach. Write a SHORT LinkedIn Easy Apply message.
This goes in the "Cover Letter" field when applying via LinkedIn Easy Apply.

STRICT CONSTRAINTS:
1. Length: 150-200 words. No more, no less. Count carefully.
2. Tone: Confident, direct, human. No buzzwords or hollow phrases.
3. FORBIDDEN first words: "With my experience", "Con la mia esperienza", "I am writing",
   "I am the ideal", "Having X years", "I am pleased", "Successfully". NEVER start with these.
4. START with a strong hook: a concrete result, a number, or a direct match to their specific need.
5. Highlight 2-3 key strengths that directly match the job description.
6. End with a clear, natural call to action (e.g. "Happy to share more — looking forward to connecting.")
7. Output ONLY the message body. No subject line, no "Dear...", no explanations.
8. Do NOT copy any sentence directly from the Full Cover Letter. Rephrase all achievements in a shorter, more conversational style.

Candidate: ${contactInfo?.fullName || contactInfo?.name || "the candidate"}, ${contactInfo?.profession || ""}

Job Description:
${jobDescription.substring(0, 800)}

Full Cover Letter (use for context and achievements only — do NOT copy sentences directly):
${coverLetter.substring(0, 1200)}
  `.trim();

  return await tryModel(async (modelId) => {
    return await callGemini({
      modelId,
      temperature: 0.65, // ✅ FIX #7 — фіксована температура для точного короткого тексту
      maxOutputTokens: 1000,
      contents: [{ role: "user", parts: [{ text: promptText }] }],
    });
  });
};