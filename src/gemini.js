const MODELS = [
  { id: "gemini-2.5-flash-preview-05-20", temp: 0.7 },
  { id: "gemini-2.5-flash", temp: 0.7 },
  { id: "gemini-2.0-flash-lite-001", temp: 0.6 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function callGemini({
  modelId,
  temperature,
  maxOutputTokens,
  contents,
  responseMimeType,
}) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      modelId,
      temperature,
      maxOutputTokens,
      contents,
      responseMimeType,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error?.message || "Gemini API error");
    error.status = response.status;
    throw error;
  }

  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

  if (!text || text.length < 30) {
    const error = new Error("Empty AI response");
    error.status = 500;
    throw error;
  }

  return text;
}

async function tryModel(modelFn) {
  let modelIndex = 0;

  while (modelIndex < MODELS.length) {
    const current = MODELS[modelIndex];

    try {
      console.log("Using model:", current.id);
      return await modelFn(current.id, current.temp);
    } catch (error) {
      console.warn(current.id, "failed:", error);

      const retryable =
        error.status === 429 ||
        error.status === 503 ||
        error.status === 500;

      if (retryable) {
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

/* ===========================
   SECOND PASS IMPROVEMENT
=========================== */

async function improveText(text) {

  const prompt = `
Improve the following cover letter.

Rules:
- Make sentences clearer and more human.
- Remove generic phrases and buzzwords.
- Keep all facts and achievements unchanged.
- Do NOT increase the length.
- Do NOT change the meaning.

Return ONLY the improved letter.

Text:
${text}
`;

  return await callGemini({
    modelId: "gemini-2.5-flash",
    temperature: 0.4,
    maxOutputTokens: 800,
    contents: [prompt],
  });

}

/* ===========================
   COVER LETTER GENERATION
=========================== */

export const generateLetter = async (
  userProfile,
  jobDescription,
  cvFilePart,
  settings
) => {

  const { language, tone, length } = settings;

  const wordLimit =
    length === "Short"
      ? "250-300"
      : length === "Detailed"
      ? "380-420"
      : "320-370";

  const lang =
    language === "Auto"
      ? "the same language as the job description"
      : language;

  const candidateProfile = `
Full Name: ${userProfile.fullName || "Not provided"}
Current Role: ${userProfile.profession || "Not provided"}
Location: ${userProfile.location || "Not specified"}
Skills: ${Array.isArray(userProfile.skills)
      ? userProfile.skills.join(", ")
      : userProfile.skills || "Not provided"}
Experience: ${
    Array.isArray(userProfile.experience)
      ? userProfile.experience
          .map(
            (e) =>
              `${e.title} at ${e.company} (${e.duration})`
          )
          .join(" | ")
      : userProfile.experience || "Not provided"
  }
Email: ${userProfile.email || ""}
LinkedIn: ${userProfile.linkedin || ""}
`.trim();

  const promptText = `
You are an expert career coach and professional copywriter.

Write a modern, high-impact cover letter.

Language: ${lang}

Length: ${wordLimit} words.

Rules:
- Start with "Dear Hiring Manager," (adapt language if needed).
- Hook the reader with a strong opening sentence.
- Use concrete achievements and numbers.
- Mirror keywords from the job description.
- Avoid generic phrases and clichés.
- Do NOT invent experience.

End strictly with:

Sincerely,
${userProfile.fullName}

Plain text only.

JOB DESCRIPTION:
${jobDescription.substring(0, 2000)}

CANDIDATE PROFILE:
${candidateProfile}
`.trim();

  const contents = [promptText, ...(cvFilePart ? [cvFilePart] : [])];

  return await tryModel(async (modelId, temp) => {

    let text = await callGemini({
      modelId,
      temperature: temp,
      maxOutputTokens: 1200,
      contents,
    });

    text = text
      .replace(/^(Subject:|Oggetto:|Betreff:|Тема:).*?\n+/gim, "")
      .replace(/```/g, "")
      .trim();

    if (!text.includes("Sincerely,")) {

      const continuationPrompt = `
Continue and finish the cover letter below.

Do NOT restart it.
Finish the final paragraph and end with:

Sincerely,
${userProfile.fullName}

Text:
${text}
`;

      const continuation = await callGemini({
        modelId,
        temperature: 0.6,
        maxOutputTokens: 400,
        contents: [continuationPrompt],
      });

      text = `${text}\n${continuation}`;
    }

    /* SECOND PASS IMPROVEMENT */

    try {
      const improved = await improveText(text);
      if (improved && improved.length > 50) {
        text = improved;
      }
    } catch {
      console.log("Improvement pass skipped");
    }

    return text.trim();
  });
};

/* ===========================
   CV PARSER
=========================== */

export const parseCV = async (cvFilePart) => {

  const promptText = `Extract CV data into JSON:

{
"fullName": "",
"email": "",
"phone": "",
"location": "",
"linkedin": "",
"profession": "",
"skills": [],
"experience": [],
"languages": [],
"education": "",
"certifications": []
}`;

  return await tryModel(async (modelId) => {

    const text = await callGemini({
      modelId,
      temperature: 0.2,
      maxOutputTokens: 4096,
      contents: [promptText, cvFilePart],
      responseMimeType: "application/json",
    });

    const cleaned = text
      .replace(/^```json/i, "")
      .replace(/```$/, "")
      .trim();

    return JSON.parse(cleaned);

  });

};

/* ===========================
   LINKEDIN MESSAGE
=========================== */

export const generateLinkedInVersion = async (
  coverLetter,
  jobDescription,
  contactInfo
) => {

  const promptText = `
Write a LinkedIn Easy Apply message.

Length: 150-200 words.

Rules:
- Start with a strong hook.
- Mention 2-3 relevant strengths.
- Sound human and direct.
- No "Dear..." and no subject line.

Candidate:
${contactInfo?.fullName || ""} ${contactInfo?.profession || ""}

Job Description:
${jobDescription.substring(0, 800)}

Context:
${coverLetter.substring(0, 1200)}
`;

  return await tryModel(async (modelId) => {

    return await callGemini({
      modelId,
      temperature: 0.65,
      maxOutputTokens: 400,
      contents: [promptText],
    });

  });

};