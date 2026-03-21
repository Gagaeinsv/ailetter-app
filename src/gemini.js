const MODELS = [
  { id: "gemini-2.5-flash",      temp: 0.7 },
  { id: "gemini-2.5-flash-lite", temp: 0.6 },
  { id: "gemini-2.5-pro",        temp: 0.7 },
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

  const candidateProfile = `
- Full Name: ${userProfile.fullName || "Not provided"}
- Current Role: ${userProfile.profession || "Not provided"}
- Location: ${userProfile.location || "Not specified"}
- Key Skills: ${Array.isArray(userProfile.skills) ? userProfile.skills.join(", ") : (userProfile.skills || "Not provided")}
- Recent Experience: ${
    Array.isArray(userProfile.experience)
      ? userProfile.experience.map(e =>
          `${e.title} at ${e.company} (${e.duration}): ${(e.achievements || []).join("; ")}`
        ).join(" | ")
      : (userProfile.experience || "Not provided")
  }
- Education: ${userProfile.education || "Not specified"}
- Languages: ${Array.isArray(userProfile.languages) ? userProfile.languages.join(", ") : (userProfile.languages || "Not specified")}
- Certifications: ${Array.isArray(userProfile.certifications) ? userProfile.certifications.join(", ") : (userProfile.certifications || "None")}
- Email: ${userProfile.email || "Not provided"}
- LinkedIn: ${userProfile.linkedin || "Not provided"}
  `.trim();

  const promptText = `
You are an expert career coach and professional copywriter specializing in modern, ATS-friendly cover letters.

TASK:
Write a highly personalized, concise, results-oriented cover letter in ${lang} for the candidate below.

══════════════════════════════════════════
GENDER & GRAMMAR — CRITICAL:
══════════════════════════════════════════
- Infer the candidate's gender from their full name.
- Apply correct grammatical gender agreement throughout the ENTIRE letter, in ANY language that has grammatical gender (Ukrainian, Italian, German, French, Spanish, Portuguese, Polish, Czech, and others).
- Use the correct verb forms, adjective endings, past tense agreements, and pronouns that match the candidate's inferred gender.
- Examples:
  Ukrainian female: "досвідчена", "впевнена", "працювала" — not "досвідчений", "впевнений", "працював"
  Italian female: "esperta", "motivata", "sono stata" — not "esperto", "motivato", "sono stato"
  German female: "geehrte Bewerberin", "ich bin überzeugt" with feminine context
  French female: "motivée", "expérimentée" — not "motivé", "expérimenté"
- If gender cannot be determined from the name — default to masculine grammatical forms.
- This rule applies even if the language is set to "Auto".

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
- Any gerund (-ing) as the very first word (e.g. "Successfully...", "Managing...")
- Any sentence starting with "I am" or "I have" as the first words

══════════════════════════════════════════
ATS OPTIMIZATION:
══════════════════════════════════════════
- Mirror the EXACT keywords and phrases from the Job Description where relevant.
- Do NOT paraphrase: if the JD says "cross-functional collaboration", use those exact words.
- Do NOT keyword-stuff; use each key phrase at most once naturally.
- Use quantified achievements ONLY if they exist in the CV. Never invent numbers or percentages.

══════════════════════════════════════════
FULL LETTER RULES:
══════════════════════════════════════════
1. Length: Approximately ${wordLimit} words. Concise and punchy.
2. Tone: ${tone || "Professional, Confident, and Direct"}.
3. Do NOT include any closing signature or sign-off. The template will add it automatically.
4. No fluff, no buzzwords, no hollow phrases not backed by evidence.
5. Do NOT invent ANY facts: no degrees, certifications, tools, company names, OR metrics/percentages that are not explicitly stated in the CV or job description. If no metrics exist in the CV — describe achievements qualitatively, never fabricate numbers.

Structure:
- Salutation (adapted to language — see rules above)
- Opening: Hook with result, number, or direct match to their need
- Body (1-2 paragraphs): Align 3-5 key requirements from JD with candidate experience + quantified achievements (only if real)
- Closing: Reaffirm motivation + call to action for interview
- NO sign-off, NO "Sincerely,", NO candidate name at the end

══════════════════════════════════════════
OUTPUT FORMAT — STRICTLY:
══════════════════════════════════════════
- Plain text only. No markdown, no bullet points, no asterisks, no headers.
- Blank line between each paragraph.
- Do NOT add any comment, explanation, or meta-text before or after the letter.
- Do NOT output a subject line.
- Do NOT end with a signature or name.

══════════════════════════════════════════
JOB DESCRIPTION:
══════════════════════════════════════════
${jobDescription.substring(0, 2000)}

══════════════════════════════════════════
CANDIDATE PROFILE:
══════════════════════════════════════════
${candidateProfile}
  `.trim();

  const contents = [promptText, ...(cvFilePart ? [cvFilePart] : [])];

  return await tryModel(async (modelId, temp) => {
    let text = await callGemini({
      modelId,
      temperature: temp,
      maxOutputTokens: 8192,
      contents,
    });

    text = text.replace(/^(Subject:|Oggetto:|RE:|Betreff:|Тема:).*?\n+/gmi, "").trim();
    text = text.replace(/```html|```/g, "");

    // Remove closing signature — template adds it automatically
    text = text.replace(/\n{0,2}(sincerely|best regards|kind regards|yours faithfully|cordiali saluti|met vriendelijke groet|mit freundlichen grüßen|з повагою|щиро ваш)[,.]?\s*\n[\w\s\-'.]+$/gi, "").trim();

    return text;
  });
};

export const parseCV = async (cvFilePart) => {
  const promptText = `Analyze this CV and extract details into valid JSON only.
Return ONLY raw JSON — no markdown, no backticks, no explanation.

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
  "certifications": ["Cert 1", "Cert 2"]
}`;

  return await tryModel(async (modelId) => {
    const text = await callGemini({
      modelId,
      temperature: 0.2,
      maxOutputTokens: 4000,
      contents: [promptText, cvFilePart],
      responseMimeType: "application/json",
    });

    const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    return JSON.parse(cleaned);
  });
};

export const generateLinkedInVersion = async (coverLetter, jobDescription, contactInfo) => {
  const promptText = `
You are an expert career coach. Write a SHORT LinkedIn Easy Apply message.
This goes in the "Cover Letter" field when applying via LinkedIn Easy Apply.

STRICT CONSTRAINTS:
1. Length: 150–200 words. No more, no less. Count carefully.
2. Tone: Confident, direct, human. No buzzwords or hollow phrases.
3. FORBIDDEN first words: "With my experience", "Con la mia esperienza", "I am writing",
   "I am the ideal", "Having X years", "I am pleased", "Successfully". NEVER start with these.
4. START with a strong hook: a concrete result, a number, or a direct match to their specific need.
5. Highlight 2–3 key strengths that directly match the job description.
6. End with a clear, natural call to action (e.g. "Happy to share more — looking forward to connecting.")
7. Output ONLY the message body. No subject line, no "Dear...", no explanations.
8. Do NOT copy any sentence directly from the Full Cover Letter — rephrase all achievements in a shorter, more conversational style.
9. Do NOT use any emoji or special symbols. Plain text only.
10. Write the COMPLETE message — never cut off mid-sentence. Finish properly.
11. Do NOT invent metrics or percentages not present in the cover letter or job description.

Candidate: ${contactInfo?.fullName || contactInfo?.name || "the candidate"}, ${contactInfo?.profession || ""}

Job Description:
${jobDescription.substring(0, 800)}

Full Cover Letter (context and achievements only — do NOT copy sentences):
${coverLetter.substring(0, 1200)}
  `.trim();

  return await tryModel(async (modelId) => {
    return await callGemini({
      modelId,
      temperature: 0.65,
      maxOutputTokens: 2048,
      contents: [promptText],
    });
  });
};

export const generateSuggestions = async (coverLetter, jobDescription) => {
  const promptText = `
You are a senior career coach reviewing a cover letter.

Analyze the cover letter against the job description and give exactly 3 short, specific, actionable suggestions to strengthen the application.

RULES:
- Each suggestion must be max 20 words.
- Be specific: reference actual skills, tools, or phrases from the job description.
- Focus on what is MISSING or WEAK — not what is already good.
- Do NOT rewrite the letter, only advise what to change or add.
- Do NOT number the suggestions, do NOT use bullet symbols.

OUTPUT FORMAT — exactly 3 lines, each on its own line, no prefix, no numbering:
Suggestion one here
Suggestion two here
Suggestion three here

Job Description:
${jobDescription.substring(0, 1000)}

Cover Letter:
${coverLetter.substring(0, 1200)}
  `.trim();

  return await tryModel(async (modelId) => {
    return await callGemini({
      modelId,
      temperature: 0.4,
      maxOutputTokens: 500,
      contents: [promptText],
    });
  });
};