const MODELS = [
  { id: "gemini-2.5-flash",      temp: 0.7 },
  { id: "groq/llama-3.3-70b-versatile", temp: 0.7 },
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

  const candidate = data.candidates?.[0];
  const finishReason = candidate?.finishReason;
  if (finishReason && finishReason !== "STOP") {
    console.warn(`Gemini finished with reason: ${finishReason}`, data);
    const error = new Error(`Gemini generation incomplete: ${finishReason}`);
    error.status = 400;
    throw error;
  }

  return candidate?.content?.parts?.[0]?.text ?? "";
}

async function tryModel(modelFn) {
  let modelIndex = 0;
  let lastError = null;
  while (modelIndex < MODELS.length) {
    const current = MODELS[modelIndex];
    try {
      console.log(`Using model: ${current.id}`);
      return await modelFn(current.id, current.temp);
    } catch (error) {
      lastError = error;
      console.warn(`${current.id} failed:`, error);
      modelIndex++;
      if (modelIndex < MODELS.length) {
        await sleep(1000);
        continue;
      }
    }
  }
  
  if (lastError && (lastError.message?.includes("quota") || lastError.message?.includes("Quota") || lastError.message?.includes("limit") || lastError.message?.includes("Rate") || lastError.message?.includes("exceeded"))) {
    throw new Error("AI Rate Limit/Quota Exceeded: You have exceeded the free tier limits. Please wait a few seconds and try again, or check your Gemini API key plan and billing details.");
  }
  throw lastError || new Error("AI is busy. Please try again.");
}

/** Try each model in order (for flaky parse / empty tokens); rotates on every failure */
async function tryEveryModel(modelFn) {
  let lastError = null;
  for (let i = 0; i < MODELS.length; i++) {
    const current = MODELS[i];
    try {
      console.log(`tryEveryModel using: ${current.id}`);
      return await modelFn(current.id, current.temp);
    } catch (error) {
      lastError = error;
      console.warn(`${current.id} failed (tryEveryModel):`, error);
      if (i + 1 < MODELS.length) await sleep(600);
    }
  }
  
  if (lastError && (lastError.message?.includes("quota") || lastError.message?.includes("Quota") || lastError.message?.includes("limit") || lastError.message?.includes("Rate") || lastError.message?.includes("exceeded"))) {
    throw new Error("AI Rate Limit/Quota Exceeded: You have exceeded the free tier limits. Please wait a few seconds and try again, or check your Gemini API key plan and billing details.");
  }
  throw lastError || new Error("AI is busy. Please try again.");
}

export const generateLetter = async (userProfile, jobDescription, cvFilePart, settings) => {
  const { language, tone, length, level } = settings;

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

  const isExecutive = level === "Senior-Executive";
  const executiveInstructions = isExecutive ? `
══════════════════════════════════════════
EXECUTIVE MODE ACTIVE — STRATEGIC LEADER PROMPTING:
══════════════════════════════════════════
- This is a Senior/Executive-level role. The tone must be highly authoritative, visionary, strategic, and business-focused.
- Do NOT list tactical hard-skills (e.g. "I write React", "I use Jira"). Instead, focus on high-level strategic impact: business metrics, ROI, risk management, process optimization, revenue growth, team scaling, and budget management.
- Analyze the Job Description (JD) to identify the deep, systemic pain points and strategic challenges of the target company (e.g. scaling issues, architectural bottlenecks, process inefficiencies, market expansion).
- Frame the candidate as a strategic business partner and leader who is uniquely positioned to solve these specific systemic challenges.
- Emphasize leadership philosophy, cross-functional collaboration, cultural alignment, and long-term vision.
` : "";

  const promptText = `
You are a senior career coach who writes cover letters that sound like they were written by a thoughtful, confident human — not generated by AI.

TASK:
Write a cover letter in ${lang} for the candidate below. The letter must feel personal, specific, and alive — like a real person speaking directly to the hiring manager.
${executiveInstructions}
══════════════════════════════════════════
GENDER & GRAMMAR — CRITICAL:
══════════════════════════════════════════
- Infer the candidate's gender from their full name.
- Apply correct grammatical gender agreement throughout the ENTIRE letter in ANY language with grammatical gender (Ukrainian, Italian, German, French, Spanish, etc.).
- Examples:
  Ukrainian female: "досвідчена", "впевнена", "працювала" — not "досвідчений", "впевнений", "працював"
  Italian female: "esperta", "motivata", "sono stata" — not "esperto", "motivato", "sono stato"
- If gender cannot be determined — default to masculine grammatical forms.

══════════════════════════════════════════
SALUTATION:
══════════════════════════════════════════
- English / default: "Dear Hiring Manager,"
- Italian: "Gentile Hiring Manager,"
- German: "Sehr geehrte Damen und Herren,"
- Ukrainian: "Шановний менеджер з найму,"
- NEVER write "[Hiring Manager Name]" or any bracket placeholder.

══════════════════════════════════════════
VOICE & TONE — THE MOST IMPORTANT SECTION:
══════════════════════════════════════════
The letter must sound like a real person wrote it. Not a template. Not a robot.

✅ WHAT THIS MEANS:
- The "Bridge" Technique: Don't just state a skill. Build a bridge between the candidate's past action and the company's future need (e.g., "I noticed your team is migrating to a new CRM. Over the last year, I led a similar migration for 50+ users...").
- Conversational Cadence: Read the text out loud in your head. Does it sound like something a confident professional would say over coffee? Use phrasing like: "Here’s how I can help," "What interests me most about this role is...", "In my previous project, we faced a similar challenge."
- Vary sentence length. Mix short punchy sentences with longer ones.
- Show genuine curiosity about the company or role — reference something specific from the job description.
- Show Vulnerability/Authenticity: It's okay to sound intensely focused on one specific aspect of the job rather than trying to be perfect at everything. Let the candidate's personality come through. Confident but not arrogant. Direct but not cold.
- One moment of genuine connection: a line that shows the candidate actually read the job description and thought about why they want THIS role at THIS company.

❌ WHAT TO AVOID:
- Robotic transitions: "Furthermore,", "In addition,", "Moreover,", "In conclusion,"
- Generic self-praise without evidence: "I am a highly motivated professional", "I am passionate about..."
- Starting every sentence with "I"
- Listing skills like a CV — instead, show skills through what you actually did

══════════════════════════════════════════
OPENING SENTENCE PROTOCOL — CRITICAL:
══════════════════════════════════════════
The FIRST sentence after the salutation MUST NOT be a generic greeting. It must be a dynamic hook engineered strictly from the Job Description and Candidate Profile.

Analyze the candidate's data and CHOOSE ONE of the following three frameworks for the opening sentence. Fill in the brackets with highly specific details from the candidate's CV and target job description:

FRAMEWORK 1: THE "NUMBERS FIRST" HOOK (Use if CV has strong metrics)
Format: "[Metric 1], [Metric 2], and [Metric 3] — that is how I delivered [Result] at [Past Company], and it's the exact approach I want to bring to [Target Company]."
Example: "18 months, 170+ tasks, and a cross-functional team of 8 — that is the scale of project delivery I am ready to bring to Zobele."

FRAMEWORK 2: THE "DIRECT ADDRESS" HOOK (Use if JD emphasizes a specific pain point)
Format: "You need someone who can [Major JD Requirement] without [Common Risk/Pain point]. Over the past [X] years, I have built a track record of doing exactly that."
Example: "You need a Project Manager who can take a complex digital product from planning to final release without dropping a single deadline — that has been my daily reality for the past two years."

FRAMEWORK 3: THE "PHILOSOPHY" HOOK (Use for juniors or if CV lacks metrics)
Format: "Driving [Core Domain of the Job] isn't just about [Basic Task] — it requires [Advanced Skill from JD]. That has been the foundation of my work and studies."

FORBIDDEN OPENINGS (CRITICAL! NEVER USE):
- NO GERUNDS as the first word: "Managing...", "Successfully...", "Guiding...", "Leveraging..."
- NO WEAK INTROS: "I am writing to apply...", "I am pleased to submit...", "With my proven experience...", "Having [X] years of experience..."
- NEVER start the very first sentence with "I am" or "I have" as the first two words.

══════════════════════════════════════════
CONTENT RULES:
══════════════════════════════════════════
- DATA HIERARCHY RULE: You have received both a structured Candidate Profile and the original CV document. The structured CANDIDATE PROFILE is your absolute source of truth for facts, skills, metrics, and timeline. Use the attached CV document ONLY as supplementary context to capture the candidate's niche terminology or professional tone. NEVER extract new responsibilities or achievements from the document if they contradict or dilute the impact of the structured profile.
- SEAMLESS ATS INTEGRATION: When mirroring keywords from the Job Description, weave them naturally into the narrative. NEVER force a keyword if it disrupts the conversational flow. It is better to sound like a human and miss one keyword than to sound like a robot that matched them all.
- Use real metrics from the CV only. NEVER invent numbers or percentages.
- If no metrics exist — describe impact qualitatively and specifically.
- Do NOT invent degrees, companies, tools, or certifications not in the CV.
- Every claim must be grounded in the CV or job description.

FORBIDDEN SELF-ASSESSMENT PHRASES (all languages):
English: "I have significant experience", "results-driven", "team player", "dedicated professional", "I strongly believe", "I am highly skilled", "I am confident that I"
Ukrainian: "я маю значний досвід", "я є ідеальним кандидатом", "я глибоко впевнений", "результатоорієнтований", "я є відданим професіоналом"
Italian: "ho una significativa esperienza", "sono il candidato ideale", "professionista dedicato", "sono fortemente motivato"
German: "ich habe umfangreiche Erfahrung", "ich bin der ideale Kandidat", "ergebnisorientierter Profi", "ich bin hochmotiviert"

RULE: Replace any self-label with ONE concrete sentence about what you actually did.
BAD:  "I am experienced in team management"
GOOD: "Over three years, I coordinated a cross-functional team of 8 across two time zones to deliver 12 projects on schedule."

══════════════════════════════════════════
STRUCTURE:
══════════════════════════════════════════
- Salutation
- Opening paragraph: Strong hook + immediate connection to the role
- Body (1-2 paragraphs): 3-5 key JD requirements matched with real experience + specific achievements
- Closing: Find ONE hyper-specific detail from the job description (a tool they use, a project they are building, a specific market challenge) and connect it to the candidate's intrinsic motivation. Avoid generic praise like "innovative company" or "industry leader". End with a clear call to action for an interview.
- NO sign-off, NO "Sincerely,", NO name — the template adds these automatically

══════════════════════════════════════════
LENGTH & FORMAT:
══════════════════════════════════════════
- Approximately ${wordLimit} words. Concise and punchy.
- Tone: ${tone || "Professional, Confident, and Direct"}.
- PARAGRAPH PACING: Keep paragraphs short (maximum 3-4 sentences). Use single-sentence paragraphs occasionally to emphasize a key point or transition. This creates breathing room and mimics natural human writing.
- Plain text only. No markdown, no bullets, no headers, no asterisks.
- Blank line between paragraphs.
- No subject line, no meta-text, no explanations before or after the letter.

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

  return await tryEveryModel(async (modelId, temp) => {
    const text = await callGemini({
      modelId,
      temperature: typeof temp === "number" ? temp : 0.2,
      maxOutputTokens: 4000,
      contents: [promptText, cvFilePart],
    });
    const obj = parseJsonFromModel(text);
    if (!obj || typeof obj !== "object") throw new Error("Invalid CV parse shape");
    return obj;
  });
};

export const analyzeCVQuality = async (profile) => {
  if (!profile) return { isLackingDetail: true };
  
  const totalAchievementsLength = (profile.experience || [])
    .flatMap(e => e.achievements || [])
    .join(" ").length;
  const skillsLength = (profile.skills || []).join(" ").length;
  
  if (totalAchievementsLength + skillsLength < 120) {
    return { isLackingDetail: true };
  }
  
  const promptText = `Analyze this candidate profile and determine if it is too brief/laconic or lacks achievements/metrics for writing a personalized cover letter.
  Candidate profile:
  - Role: ${profile.profession || "Not specified"}
  - Skills: ${(profile.skills || []).join(", ")}
  - Experience: ${(profile.experience || []).map(e => `${e.title} at ${e.company}: ${(e.achievements || []).join("; ")}`).join(" | ")}
  
  If the profile lacks details, achievements, or has less than 2 jobs with bullet points, return JSON: { "isLackingDetail": true }.
  Otherwise, if it has good achievements and descriptions, return JSON: { "isLackingDetail": false }.
  Respond with JSON only.`;

  try {
    const result = await callGemini({
      modelId: "gemini-2.5-flash",
      temperature: 0.1,
      maxOutputTokens: 100,
      contents: [promptText],
      responseMimeType: "application/json"
    });
    const textCleaned = result.replace(/```json|```/g, "").trim();
    const obj = JSON.parse(textCleaned);
    return { isLackingDetail: !!obj.isLackingDetail };
  } catch (e) {
    return { isLackingDetail: totalAchievementsLength + skillsLength < 250 };
  }
};

export const parseVoiceCV = async (dictatedText) => {
  const promptText = `Analyze the following transcribed text from a user describing their professional profile. Extract details into valid JSON only.
Return ONLY raw JSON — no markdown, no backticks, no explanation.

{
  "fullName": "Name Surname (or empty string)",
  "email": "email@example.com (or empty string)",
  "phone": "+123... (or empty string)",
  "location": "City, Country (or empty string)",
  "linkedin": "url (or empty string)",
  "profession": "Current Job Title",
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Jan 2023 – Present (or estimate/empty string)",
      "achievements": ["Achievement/responsibility 1", "Achievement/responsibility 2"]
    }
  ],
  "education": "Degree, University, Year (or empty string)",
  "languages": ["Language 1", "Language 2"],
  "certifications": ["Cert 1", "Cert 2"]
}

Transcribed text:
${dictatedText}`;

  return await tryEveryModel(async (modelId, temp) => {
    const text = await callGemini({
      modelId,
      temperature: typeof temp === "number" ? temp : 0.2,
      maxOutputTokens: 4000,
      contents: [promptText],
    });
    const obj = parseJsonFromModel(text);
    if (!obj || typeof obj !== "object") throw new Error("Invalid voice parse shape");
    return obj;
  });
};

export const extractCompanyName = async (jobDescription) => {
  if (!jobDescription || typeof jobDescription !== 'string') return 'Unknown';
  
  const text = jobDescription.trim();

  // Helper to clean up company name slug (e.g. "google-cloud" -> "Google Cloud")
  const cleanCompanySlug = (slug) => {
    if (!slug) return '';
    return slug
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();
  };

  // 1. Try URL Regex Matching (supports LinkedIn, Indeed, etc.)
  try {
    if (/^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/i.test(text)) {
      // Indeed Company Page URL: e.g. indeed.com/cmp/Google
      const indeedCmpMatch = text.match(/indeed\.com\/cmp\/([^/?#\s]+)/i);
      if (indeedCmpMatch && indeedCmpMatch[1]) {
        return cleanCompanySlug(decodeURIComponent(indeedCmpMatch[1]));
      }

      // LinkedIn Company Page URL: e.g. linkedin.com/company/google
      const linkedinCmpMatch = text.match(/linkedin\.com\/company\/([^/?#\s]+)/i);
      if (linkedinCmpMatch && linkedinCmpMatch[1]) {
        return cleanCompanySlug(decodeURIComponent(linkedinCmpMatch[1]));
      }

      // LinkedIn Jobs URL with company query param
      const linkedinJobCompany = text.match(/[?&]f_C=([^&]+)/i);
      if (linkedinJobCompany && linkedinJobCompany[1]) {
        return cleanCompanySlug(decodeURIComponent(linkedinJobCompany[1]));
      }
    }
  } catch (err) {
    console.warn("Regex URL company parsing failed:", err);
  }

  // 2. Try Text-based Regex Matching for common headers
  try {
    const patterns = [
      /^(?:company\s*name|company|employer|работодатель|компанія|firma|unternehmen)\s*:\s*([^\n]+)/im,
      /^(?:about|про|über)\s+([a-zA-Z0-9а-яіїєґ\s]+)\s*:/im,
      /^(?:join|приєднуйтесь\s+до|join\s+the)\s+([a-zA-Z0-9а-яіїєґ\s]+)\s+team/im,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const candidate = match[1].trim().replace(/["'.*]/g, '');
        if (candidate.length > 1 && candidate.length < 50) {
          return candidate;
        }
      }
    }
  } catch (err) {
    console.warn("Regex text company parsing failed:", err);
  }

  // 3. Fallback to LLM Prompt Extraction
  try {
    const promptText = `Extract the company name from this job description. Return ONLY the company name, nothing else. If you cannot find it, return "Unknown".

Job description:
${text.substring(0, 700)}`;

    return await tryModel(async (modelId) => {
      const responseText = await callGemini({
        modelId,
        temperature: 0.1,
        maxOutputTokens: 50,
        contents: [promptText],
      });
      return responseText.trim().replace(/["'.]/g, '') || "Unknown";
    });
  } catch (err) {
    console.warn("LLM company extraction failed:", err);
    return "Unknown";
  }
};

export const integrateKeyword = async (coverLetter, jobDescription, keyword) => {
  const promptText = `You are an expert career consultant and copywriter.
We have a cover letter and want to naturally integrate a missing keyword into one of its paragraphs.

Cover Letter:
"""
${coverLetter}
"""

Missing Keyword/Phrase: "${keyword}"
Job Description:
"""
${jobDescription}
"""

Instructions:
1. Choose the single most relevant paragraph of the cover letter where the keyword "${keyword}" fits naturally and professionally.
2. Rewrite ONLY that paragraph to weave in the keyword.
3. Return a JSON object with exactly two keys:
   - "originalParagraph": The exact text of the paragraph you chose to rewrite (must match the original text).
   - "updatedParagraph": The rewritten version of that paragraph.

Return ONLY valid JSON. No markdown code blocks (like \`\`\`json), no explanation.`;

  return await tryModel(async (modelId) => {
    const responseText = await callGemini({
      modelId,
      temperature: 0.3,
      maxOutputTokens: 1024,
      contents: [promptText],
    });
    
    // Clean JSON response
    const cleanJson = responseText.trim().replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(cleanJson);
    return parsed;
  });
};

const outputLangLine = (outputLanguage) =>
  outputLanguage
    ? `\nOUTPUT LANGUAGE: Write the entire message in ${outputLanguage} (not English unless that is the language requested).\n`
    : '';

export const generateLinkedInVersion = async (coverLetter, jobDescription, contactInfo, options = {}) => {
  const promptText = `
You are an expert career coach. Write a SHORT LinkedIn Easy Apply message.
This goes in the "Cover Letter" field when applying via LinkedIn Easy Apply.
${outputLangLine(options.outputLanguage)}

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

export const generateLinkedInStandalone = async (jobDescription, contactInfo, options = {}) => {
  const promptText = `
You are an expert career coach. The candidate does NOT have a full cover letter yet.
Write a SHORT LinkedIn Easy Apply message using ONLY the job description and any candidate hints below.
${outputLangLine(options.outputLanguage)}

STRICT CONSTRAINTS:
1. Length: 150–200 words.
2. Tone: Confident, direct, human. No buzzwords.
3. FORBIDDEN first words: "With my experience", "I am writing", "Having X years", "Successfully".
4. START with a strong hook tied to the role or company need from the JD.
5. Highlight 2–3 strengths that match the JD (infer reasonable professional strengths — do NOT invent specific employers, degrees, or metrics).
6. End with a clear call to action.
7. Output ONLY the message body. No "Dear...", no subject line.
8. Plain text only, no emoji.

Candidate hints: ${contactInfo?.fullName || "not provided"}, ${contactInfo?.profession || "role not provided"}

Job Description:
${jobDescription.substring(0, 1200)}
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
      maxOutputTokens: 1024,
      contents: [promptText],
    });
  });
};

/** Parse JSON from model plain text — avoid responseMimeType (same pipeline as letter/LinkedIn). */
const parseJsonFromModel = (raw) => {
  if (!raw || typeof raw !== "string") {
    throw new Error("Empty response from AI");
  }
  const cleanedOuter = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
  const tryParse = (s) => {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  };
  let out = tryParse(cleanedOuter);
  if (out !== null) return out;
  const cleaned = cleanedOuter;
  const objStart = cleaned.indexOf("{");
  const arrStart = cleaned.indexOf("[");
  if (arrStart !== -1 && (objStart === -1 || arrStart < objStart)) {
    const end = cleaned.lastIndexOf("]");
    if (end > arrStart) out = tryParse(cleaned.slice(arrStart, end + 1));
    if (out !== null) return out;
  }
  if (objStart !== -1) {
    const end = cleaned.lastIndexOf("}");
    if (end > objStart) out = tryParse(cleaned.slice(objStart, end + 1));
    if (out !== null) return out;
  }
  throw new Error("Could not parse JSON from AI response");
};

const ATS_STOPWORDS = new Set([
  "the", "and", "for", "with", "you", "your", "our", "are", "will", "this", "that", "from",
  "have", "has", "been", "into", "about", "their", "they", "them", "who", "what", "when",
  "where", "which", "while", "would", "should", "could", "must", "may", "can", "all", "any",
  "job", "role", "team", "work", "company", "position", "candidate", "experience", "years",
  "year", "ability", "skills", "skill", "including", "such", "using", "use", "used",
]);

const ATS_GENERIC_FLUFF = new Set([
  "team player", "hard working", "hard-working", "communication skills", "problem solving",
  "problem-solving", "self motivated", "self-motivated", "detail oriented", "detail-oriented",
  "fast learner", "quick learner", "results driven", "results-driven", "proactive",
  "communication", "teamwork", "collaboration", "leadership", "time management",
  "multitasking", "multi-tasking", "flexibility", "adaptability", "creativity",
  "critical thinking", "problem-solving skills", "organizational", "management",
  "passion", "motivated", "enthusiasm", "reliable", "dedicated", "attention to detail",
  "strong work ethic", "highly organized", "written and verbal", "ability to", "proven ability",
  "proven track record", "interpersonal skills", "decision making"
]);

const cleanATSKeyword = (kw) => {
  let s = String(kw || "").trim().toLowerCase().replace(/\s+/g, " ");
  if (!s) return "";
  
  // Remove common prefix fluff patterns
  s = s.replace(/^(experience (with|in|of)|knowledge of|understanding of|familiarity with|ability to|proven ability to|skills (in|with)|hands-on |hands on )\s*/gi, "");
  s = s.replace(/^(strong|excellent|good|deep|proven|practical|demonstrated|expert)\s+/gi, "");
  
  // Remove common suffix fluff patterns
  s = s.replace(/\s+(experience|skills|knowledge|understanding|ability|abilities|competencies)$/gi, "");
  
  return s.trim();
};

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const getCaseSensitiveMatch = (text, lowercaseKeyword) => {
  const escaped = escapeRegExp(lowercaseKeyword);
  const regex = new RegExp(`(?:^|[^\\p{L}\\p{N}+#.])(${escaped})(?:$|[^\\p{L}\\p{N}+#.])`, 'iu');
  const match = text.match(regex);
  if (match && match[1]) return match[1];
  
  const index = text.toLowerCase().indexOf(lowercaseKeyword);
  if (index !== -1) {
    return text.substring(index, index + lowercaseKeyword.length);
  }
  return lowercaseKeyword;
};

const normalizeForCompare = (str) => {
  return String(str || "")
    .toLowerCase()
    .replace(/node\.?js/g, "nodejs")
    .replace(/react\.?js/g, "react")
    .replace(/vue\.?js/g, "vue")
    .replace(/next\.?js/g, "nextjs")
    .replace(/nuxt\.?js/g, "nuxtjs")
    .replace(/three\.?js/g, "threejs")
    .replace(/nest\.?js/g, "nestjs")
    .replace(/express\.?js/g, "express")
    .replace(/chart\.?js/g, "chartjs")
    .replace(/ci\s*[\/-]?\s*cd/g, "cicd")
    .replace(/typescript/g, "ts")
    .replace(/javascript/g, "js")
    .replace(/c\s*\+\+/g, "c++")
    .replace(/c\s*#/g, "c#")
    .replace(/css\s*3?/g, "css")
    .replace(/html\s*5?/g, "html")
    .replace(/power\s*bi/g, "powerbi")
    .replace(/ms\s*excel/g, "excel")
    .replace(/microsoft\s*excel/g, "excel")
    .replace(/ms\s*word/g, "word")
    .replace(/microsoft\s*word/g, "word")
    .replace(/project\s*management/g, "projectmanagement")
    .replace(/project\s*manager/g, "projectmanagement");
};

export const appearsInText = (haystack, needle) => {
  const h = String(haystack || "").toLowerCase();
  const n = String(needle || "").toLowerCase().trim();
  if (!n || n.length < 2) return false;

  // 1. Try a direct normalized token comparison for common synonyms
  const normH = normalizeForCompare(h);
  const normN = normalizeForCompare(n);
  
  // Split into tokens based on non-alphanumeric characters (keeping + and #)
  const tokens = normH.split(/[^a-z0-9а-яіїєґ+#]+/i).filter(Boolean);
  if (tokens.includes(normN)) {
    return true;
  }

  // 2. Fallback to a regex check with unicode-aware boundaries
  const escapedNeedle = escapeRegExp(normN);
  const regex = new RegExp(`(?:^|[^\\p{L}\\p{N}+#.])${escapedNeedle}(?:$|[^\\p{L}\\p{N}+#.])`, 'iu');
  if (regex.test(normH)) {
    return true;
  }
  
  const escapedOriginal = escapeRegExp(n);
  const regexOrig = new RegExp(`(?:^|[^\\p{L}\\p{N}+#.])${escapedOriginal}(?:$|[^\\p{L}\\p{N}+#.])`, 'iu');
  if (regexOrig.test(h)) {
    return true;
  }

  // 3. For Ukrainian / Cyrillic inflections, check prefix matching on words of length >= 4
  const isCyrillic = /[а-яіїєґ]/i.test(n);
  if (isCyrillic && n.length >= 4) {
    const len = n.length;
    // For length 4-5, prefix is len - 1. For length >= 6, prefix is len - 3.
    const prefixLen = len <= 5 ? len - 1 : len - 3;
    const prefix = n.substring(0, prefixLen);
    
    // Check if any token in the haystack starts with this prefix
    if (tokens.some(t => t.startsWith(prefix))) {
      return true;
    }
  }

  return false;
};

export const isBadATSKeyword = (kw) => {
  const s = String(kw || "").trim().replace(/\s+/g, " ");
  if (!s || s.length < 2 || s.length > 42) return true;
  if (/[!?]/.test(s) || /\.\s/.test(s)) return true;
  if (s.split(/\s+/).length > 4) return true;

  const firstWord = s.toLowerCase().split(/\s+/)[0];
  const badStarts = ["tip", "note", "add", "include", "mention", "try", "consider", "make", "додати", "включити", "згадати", "спробувати", "вкажіть", "вказати"];
  if (badStarts.includes(firstWord)) return true;

  if (ATS_GENERIC_FLUFF.has(s.toLowerCase())) return true;
  return false;
};

/** Pull short skill/requirement phrases from JD when the model returns junk. */
const extractJDCandidateTerms = (jobDescription) => {
  const jd = String(jobDescription || "");
  const terms = new Set();

  const sectionMatch = jd.match(
    /(?:requirements?|qualifications?|skills?|must[\s-]have|nice[\s-]to[\s-]have|what you(?:'ll| will) bring|we(?:'re| are) looking for)[:\s]*([\s\S]{0,900})/i
  );
  const focus = sectionMatch ? sectionMatch[1] : jd;

  const splitParts = focus.split(/[\n,;•·|/]+/);
  for (const part of splitParts) {
    let s = part.trim().replace(/^[-*•\d.)]+\s*/, "");
    if (!s || s.length < 2 || s.length > 42) continue;
    if (/\b(responsibilities|benefits|salary|apply|equal opportunity)\b/i.test(s)) continue;
    
    const cleaned = cleanATSKeyword(s);
    if (!cleaned || cleaned.length < 2 || cleaned.length > 40) continue;
    
    const words = cleaned.split(/\s+/).filter((w) => w && !ATS_STOPWORDS.has(w));
    if (words.length === 0 || words.length > 4) continue;
    
    if (!isBadATSKeyword(cleaned)) {
      const originalCase = getCaseSensitiveMatch(jd, cleaned);
      terms.add(originalCase);
    }
  }

  const techHits = jd.match(
    /\b(?:Python|JavaScript|TypeScript|React|Node\.?js|SQL|AWS|Azure|GCP|Docker|Kubernetes|Figma|Excel|SAP|CRM|SEO|B2B|B2C|Agile|Scrum|Jira|Git|CI\/CD|machine learning|data analysis|project management|stakeholder management|customer success|sales|marketing|UX|UI|HR|finance|accounting|English|German|Ukrainian|Italian)\b/gi
  );
  if (techHits) {
    for (const t of techHits) {
      const phrase = t.trim();
      const cleaned = cleanATSKeyword(phrase);
      if (cleaned && !isBadATSKeyword(cleaned)) {
        const originalCase = getCaseSensitiveMatch(jd, cleaned);
        terms.add(originalCase);
      }
    }
  }

  return [...terms];
};

const refineATSLists = (matched, missing, jobDescription, coverLetter) => {
  const jd = String(jobDescription || "");
  const letter = String(coverLetter || "");

  const filterList = (list, mode) => {
    const seen = new Set();
    const out = [];
    for (const raw of list) {
      const cleaned = cleanATSKeyword(raw);
      if (!cleaned || isBadATSKeyword(cleaned)) continue;
      
      const key = cleaned.toLowerCase();
      if (seen.has(key)) continue;

      const inJd = appearsInText(jd, cleaned);
      const inLetter = appearsInText(letter, cleaned);
      if (!inJd) continue;
      if (mode === "matched" && !inLetter) continue;
      if (mode === "missing" && inLetter) continue;

      seen.add(key);
      const originalCase = getCaseSensitiveMatch(jd, cleaned);
      out.push(originalCase);
      if (out.length >= 6) break;
    }
    return out;
  };

  let refinedMatched = filterList(matched, "matched");
  let refinedMissing = filterList(missing, "missing");

  if (refinedMissing.length < 2) {
    const backup = extractJDCandidateTerms(jd)
      .filter((kw) => !appearsInText(letter, kw) && !refinedMatched.some((m) => m.toLowerCase() === kw.toLowerCase()));
    for (const kw of backup) {
      if (refinedMissing.length >= 5) break;
      if (!refinedMissing.some((m) => m.toLowerCase() === kw.toLowerCase())) {
        refinedMissing.push(kw);
      }
    }
  }

  refinedMissing = refinedMissing.filter((kw) => !refinedMatched.some((m) => m.toLowerCase() === kw.toLowerCase())).slice(0, 5);

  return { matched: refinedMatched, missing: refinedMissing };
};

const normalizeATSPayload = (raw, jobDescription, coverLetter) => {
  let score = Number(raw?.score ?? raw?.atsScore ?? raw?.matchScore);
  if (!Number.isFinite(score)) score = 0;
  score = Math.max(0, Math.min(100, Math.round(score)));

  const collectList = (...candidates) => {
    for (const c of candidates) {
      if (Array.isArray(c)) {
        const out = c.map((x) => String(x ?? "").trim()).filter(Boolean);
        if (out.length) return out;
      }
      if (typeof c === "string" && c.trim()) {
        const out = c.split(/[,;/|]/).map((s) => s.trim()).filter(Boolean);
        if (out.length) return out;
      }
      if (c && typeof c === "object" && !Array.isArray(c)) {
        for (const k of ["keywords", "items", "list", "values"]) {
          if (!Array.isArray(c[k])) continue;
          const out = c[k].map((x) => String(x ?? "").trim()).filter(Boolean);
          if (out.length) return out;
        }
      }
    }
    return [];
  };

  let matched = collectList(raw?.matched, raw?.matchedKeywords, raw?.found, raw?.matches);
  let missing = collectList(raw?.missing, raw?.missingKeywords, raw?.gaps, raw?.toAdd, raw?.missingSkills);

  if (jobDescription && coverLetter) {
    const refined = refineATSLists(matched, missing, jobDescription, coverLetter);
    matched = refined.matched;
    missing = refined.missing;
    
    // Recalculate match score dynamically based on actual matched vs missing keywords ratio (50% weight)
    let keywordScore = 50;
    if (matched.length + missing.length > 0) {
      const ratio = matched.length / (matched.length + missing.length);
      // Non-linear mapping: base of 40% if there is at least one match, plus up to 60% based on the ratio
      keywordScore = 40 + Math.round(ratio * 60);
    }
    score = Math.round((score * 0.5) + (keywordScore * 0.5));
    
    if (matched.length === 0) {
      score = Math.min(score, 20);
    }
    if (missing.length === 0 && matched.length > 0) {
      score = Math.max(score, 85);
    }
  } else {
    matched = matched.filter((k) => !isBadATSKeyword(cleanATSKeyword(k))).slice(0, 6);
    missing = missing.filter((k) => !isBadATSKeyword(cleanATSKeyword(k))).slice(0, 5);
  }

  const tipRaw = raw?.tip ?? raw?.suggestion ?? raw?.advice ?? raw?.recommendation;
  let tip = typeof tipRaw === "string" ? tipRaw.trim().replace(/\s+/g, " ") : "";
  if (tip.length > 120 || (tip && isBadATSKeyword(cleanATSKeyword(tip)))) tip = "";
  if (!tip && missing.length > 0) {
    tip = `Mention "${missing[0]}" naturally in one sentence.`;
  }

  return {
    score,
    matchedKeywords: matched,
    matched,
    missingKeywords: missing,
    missing,
    tip,
  };
};

export const analyzeATSScore = async (coverLetter, jobDescription) => {
  const jd = String(jobDescription || "").trim();
  const letter = String(coverLetter || "").trim();

  const promptText = `
You are an ATS analyst. Compare the cover letter to the job description.

Return ONLY valid JSON (no markdown):
{
  "score": <integer 0-100>,
  "matched": ["term1", "term2"],
  "missing": ["term1", "term2"],
  "tip": "<max 12 words>"
}

SCORING (score):
- 75-100: most concrete JD requirements/skills appear in the letter
- 50-74: partial overlap
- below 50: weak overlap

MATCHED (max 6 items):
- Short noun phrases (1-4 words) copied from the Job Description
- Each MUST appear in the Job Description AND in the Cover Letter (case-insensitive)

MISSING (max 5 items) — CRITICAL:
- Short noun phrases (1-4 words) that appear in the Job Description but NOT in the Cover Letter
- Only skills, tools, certifications, languages, methodologies, or hard requirements from the JD
- Do NOT invent terms not in the JD
- Do NOT put sentences, advice, tips, benefits, salary, company slogans, or generic traits ("team player", "communication")
- Do NOT duplicate anything already in "matched"

TIP:
- One concrete edit: reference the top missing term and how to weave it in (max 12 words)

Job Description:
${jd.substring(0, 1400)}

Cover Letter:
${letter.substring(0, 1400)}
  `.trim();

  return await tryEveryModel(async (modelId, temp) => {
    const text = await callGemini({
      modelId,
      temperature: typeof temp === "number" ? temp : 0.15,
      maxOutputTokens: 1024,
      contents: [promptText],
    });
    return normalizeATSPayload(parseJsonFromModel(text), jd, letter);
  });
};

export const generateFollowUp = async (originalLetter, jobDescription, contactInfo, daysSince) => {
  const name = (contactInfo?.fullName || contactInfo?.name || '').trim() || 'The candidate';

  const basePrompt = `
You are an expert career coach. Write a polished follow-up email for a job application.

CONTEXT:
- The candidate applied ${daysSince} days ago and has not heard back.
- Goal: show genuine continued interest + make it easy to respond.

OUTPUT REQUIREMENTS:
- Plain text only. No markdown. No bullets.
- Output ONLY the email body (no subject line).
- Write in the same language as the Job Description (unless it is clearly bilingual; then default to English).

STYLE:
- Warm, confident, professional. Never desperate. Never apologetic.
- Avoid vague filler. Include ONE concrete fit detail (rephrased) from the original letter.

STRUCTURE (must follow exactly):
1) Greeting line (e.g., "Hi [Name]," or "Hello," if unknown).
2) Paragraph 1 (2–3 sentences): remind role + when applied + a specific connection to the role/company.
3) Paragraph 2 (1–2 sentences): gentle call-to-action asking about next steps and offering extra info.
4) Sign-off on its own line ("Best regards," or localized equivalent) + the candidate name on the last line.

LENGTH:
- Target 140–190 words. Do not exceed 220 words.
- Ensure the email is complete, with a proper sign-off and the candidate's name at the very end.

Candidate name: ${name}
Job Description (context):
${String(jobDescription || '').substring(0, 900)}

Original Cover Letter (context only; do NOT copy sentences):
${String(originalLetter || '').substring(0, 1200)}
  `.trim();

  return await tryEveryModel(async (modelId, temp) => {
    const text = await callGemini({
      modelId,
      temperature: typeof temp === 'number' ? temp : 0.6,
      maxOutputTokens: 2048,
      contents: [basePrompt],
    });
    
    // Strip markdown blocks if the model wrapped it in code blocks
    let cleaned = String(text || '').replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/g, '').trim();
    
    // If the model returned a subject line like "Subject: ...", strip it
    cleaned = cleaned.replace(/^(Subject:|Oggetto:|RE:|Betreff:|Тема:).*?\n+/gmi, "").trim();
    
    return cleaned;
  });
};

export const generateInterviewQA = async (coverLetter, jobDescription, contactInfo, options = {}) => {
  const name = contactInfo?.fullName || contactInfo?.name || "the candidate";
  const langRule = options.outputLanguage
    ? `Output language: ${options.outputLanguage} for every question and answer VALUE. JSON keys must stay exactly "q" and "a" (English).`
    : "Match the language of the job description when possible.";

  const basePrompt = (attempt = 1) => `
You are a senior hiring manager and interview coach.

Based on the job description and candidate's cover letter, generate exactly 8 likely interview questions and ideal short answers.

Return ONLY valid JSON, no markdown:
[
  { "q": "Question text?", "a": "Answer in STAR format with labels." },
  ...
]

Rules:
- Mix behavioral (Tell me about a time...), situational, and role-specific questions
- Answers should reference the candidate's background from the cover letter
- Use the STAR methodology for EVERY answer:
  - S (Situation): 1 sentence
  - T (Task): 1 sentence
  - A (Action): 2–3 sentences (be specific)
  - R (Result): 1 sentence (use a metric if it exists in the cover letter; otherwise qualitative)
- Output the answer as a single string with line breaks exactly like:
  "S: ...\nT: ...\nA: ...\nR: ..."
- Every answer MUST contain all four labels in this order: S:, T:, A:, R:
- Never invent metrics, employers, tools, or achievements not present in the cover letter or job description
- Make questions realistic and specific to the role
- ${langRule}

Candidate name: ${name}

Job Description:
${jobDescription.substring(0, 1200)}

Cover Letter:
${coverLetter.substring(0, 1000)}
${attempt >= 2 ? '\nIMPORTANT: You must return ONLY the JSON array. No prose. Ensure every "a" has 4 lines with S:/T:/A:/R: labels.' : ''}
  `.trim();

  const isStarAnswer = (a) => {
    const s = String(a || '').trim();
    if (!s) return false;
    const normalized = s.replace(/\\n/g, '\n');
    return /(^|\n)S:\s*\S/.test(normalized)
      && /(^|\n)T:\s*\S/.test(normalized)
      && /(^|\n)A:\s*\S/.test(normalized)
      && /(^|\n)R:\s*\S/.test(normalized);
  };

  const normalizeStarText = (a) => {
    const s = String(a || '').trim();
    if (!s) return '';
    return s
      .replace(/\s+(T:)/g, '\n$1')
      .replace(/\s+(A:)/g, '\n$1')
      .replace(/\s+(R:)/g, '\n$1')
      .replace(/\\n/g, '\n')
      .trim();
  };

  return await tryEveryModel(async (modelId, temp) => {
    const text1 = await callGemini({
      modelId,
      temperature: typeof temp === 'number' ? temp : 0.55,
      maxOutputTokens: 3000,
      contents: [basePrompt(1)],
    });
    let data1;
    try {
      data1 = parseJsonFromModel(text1);
    } catch {
      data1 = null;
    }
    const list1 = Array.isArray(data1) ? data1 : [];
    const ok1 = list1.length === 8 && list1.every((row) => isStarAnswer(row?.a) || isStarAnswer(row?.answer));
    if (ok1) {
      return list1.map((row) => ({ ...row, a: normalizeStarText(row?.a ?? row?.answer ?? '') }));
    }

    const text2 = await callGemini({
      modelId,
      temperature: 0.35,
      maxOutputTokens: 3000,
      contents: [basePrompt(2)],
    });
    const data2 = parseJsonFromModel(text2);
    const list2 = Array.isArray(data2) ? data2 : [];
    const normalized2 = list2.map((row) => ({ ...row, a: normalizeStarText(row?.a ?? row?.answer ?? '') }));
    const ok2 = normalized2.length === 8 && normalized2.every((row) => row?.q && isStarAnswer(row?.a));
    if (!ok2) throw new Error('Invalid interview output');
    return normalized2;
  });
};

export const generateSubjectLines = async (coverLetter, jobDescription, contactInfo, options = {}) => {
  const name = contactInfo?.fullName || contactInfo?.name || "the candidate";
  const langRule = options.outputLanguage
    ? `Output language: ${options.outputLanguage} for the TEXT values only. JSON keys must stay exactly "style" and "subject" (English). The "style" VALUE must be one of: "Formal", "Direct", "Creative".`
    : "Match the language of the job description when possible.";

  const promptText = `
You are an expert at writing compelling email subject lines for job applications.

Generate exactly 3 subject line options: one formal, one direct/bold, one creative.

Return ONLY valid JSON, no markdown:
[
  { "style": "Formal",   "subject": "..." },
  { "style": "Direct",   "subject": "..." },
  { "style": "Creative", "subject": "..." }
]

Rules:
- Each under 60 characters
- No generic "I am applying for..." phrasing
- Reference the actual role from the job description
- Use the candidate's name where appropriate
- Make each distinctly different in style
- ${langRule}

Candidate: ${name}
Job Description: ${jobDescription.substring(0, 600)}
Cover Letter snippet: ${(coverLetter || "").substring(0, 400)}
  `.trim();

  return await tryModel(async (modelId) => {
    const text = await callGemini({
      modelId,
      temperature: 0.7,
      maxOutputTokens: 1024,
      contents: [promptText],
    });
    return parseJsonFromModel(text);
  });
};

const normalizeCVPayload = (raw, profile, jobDescription) => {
  let score = Number(raw?.atsScore ?? raw?.score ?? 0);
  if (!Number.isFinite(score)) score = 0;
  score = Math.max(0, Math.min(100, Math.round(score)));

  let keywords = Number(raw?.atsBreakdown?.keywords ?? raw?.atsBreakdown?.keywordsScore ?? 50);
  let metrics = Number(raw?.atsBreakdown?.metrics ?? raw?.atsBreakdown?.metricsScore ?? 50);
  let structure = Number(raw?.atsBreakdown?.structure ?? raw?.atsBreakdown?.structureScore ?? 50);

  const matchedRaw = Array.isArray(raw?.matchedKeywords) ? raw.matchedKeywords.map(k => String(k || "").trim()).filter(Boolean) : [];
  const missingRaw = Array.isArray(raw?.missingKeywords) ? raw.missingKeywords.map(k => String(k || "").trim()).filter(Boolean) : [];

  let matched = matchedRaw;
  let missing = missingRaw;

  if (jobDescription && profile) {
    const cvText = `
Profession: ${profile?.profession || ""}
Skills: ${Array.isArray(profile?.skills) ? profile.skills.join(", ") : (profile?.skills || "")}
Experience: ${
      Array.isArray(profile?.experience)
        ? profile.experience.map(e =>
            `${e.title} at ${e.company}: ${(e.achievements || []).join("; ")}`
          ).join(" | ")
        : (profile?.experience || "")
    }
Education: ${profile?.education || ""}
Certifications: ${Array.isArray(profile?.certifications) ? profile.certifications.join(", ") : (profile?.certifications || "")}
    `.trim();

    const refined = refineATSLists(matchedRaw, missingRaw, jobDescription, cvText);
    matched = refined.matched;
    missing = refined.missing;

    // Recalculate score based on actual matched vs missing keywords ratio (50% weight)
    let keywordScore = 50;
    if (matched.length + missing.length > 0) {
      const ratio = matched.length / (matched.length + missing.length);
      keywordScore = 40 + Math.round(ratio * 60);
    }
    keywords = Math.round((keywords * 0.5) + (keywordScore * 0.5));
    score = Math.round((score * 0.5) + (keywordScore * 0.5));

    if (matched.length === 0) {
      score = Math.min(score, 20);
    }
    if (missing.length === 0 && matched.length > 0) {
      score = Math.max(score, 85);
    }
  } else {
    matched = matched.filter((k) => !isBadATSKeyword(cleanATSKeyword(k))).slice(0, 6);
    missing = missing.filter((k) => !isBadATSKeyword(cleanATSKeyword(k))).slice(0, 5);
  }

  const tips = Array.isArray(raw?.tips) ? raw.tips.map(t => String(t || "").trim()).filter(Boolean).slice(0, 3) : [];
  const bulletPoints = Array.isArray(raw?.bulletPoints)
    ? raw.bulletPoints.map(bp => ({
        original: String(bp?.original || "").trim(),
        optimized: String(bp?.optimized || "").trim(),
      })).filter(bp => bp.original && bp.optimized).slice(0, 4)
    : [];

  return {
    atsScore: score,
    atsBreakdown: {
      keywords: Math.max(0, Math.min(100, Math.round(keywords))),
      metrics: Math.max(0, Math.min(100, Math.round(metrics))),
      structure: Math.max(0, Math.min(100, Math.round(structure))),
    },
    matchedKeywords: matched,
    missingKeywords: missing,
    tips,
    bulletPoints,
  };
};

export const analyzeCV = async (userProfile, jobDescription, options = {}) => {
  const jd = String(jobDescription || "").trim();
  
  const candidateProfile = `
- Profession: ${userProfile?.profession || "Not provided"}
- Skills: ${Array.isArray(userProfile?.skills) ? userProfile.skills.join(", ") : (userProfile?.skills || "Not provided")}
- Experience achievements: ${
    Array.isArray(userProfile?.experience)
      ? userProfile.experience.map(e =>
          `${e.title} at ${e.company}: ${(e.achievements || []).join("; ")}`
        ).join(" | ")
      : (userProfile?.experience || "Not provided")
  }
- Education: ${userProfile?.education || "Not specified"}
- Certifications: ${Array.isArray(userProfile?.certifications) ? userProfile.certifications.join(", ") : (userProfile?.certifications || "None")}
  `.trim();

  const langRule = options.outputLanguage
    ? `Output language: ${options.outputLanguage} for all descriptive string values (tips, bulletPoints optimized strings). JSON keys must remain in English.`
    : "Match the language of the job description for the tips and optimized text.";

  const promptText = `
You are an expert ATS (Applicant Tracking System) CV Auditor. Compare the candidate's CV Profile against the Job Description.

Return ONLY a valid JSON object matching this structure (no markdown, no backticks, no prose):
{
  "atsScore": <integer 0-100>,
  "atsBreakdown": {
    "keywords": <integer 0-100>,
    "metrics": <integer 0-100>,
    "structure": <integer 0-100>
  },
  "matchedKeywords": ["keyword1", "keyword2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "tips": [
    "Tip 1...",
    "Tip 2..."
  ],
  "bulletPoints": [
    {
      "original": "Original achievement sentence",
      "optimized": "Optimized achievement sentence with keywords and quantifiable metrics"
    }
  ]
}

SCORING RULES (atsScore, keywords, metrics, structure):
- atsScore: combined average based on keyword overlap, presence of quantifiable metrics, and overall professional structure.
- keywords: percentage of essential hard skills, tools, and methodologies from the JD matched in the CV.
- metrics: score on how well the CV quantifies results (uses percentages, numbers, timeframes, or dollar amounts).
- structure: score on CV clarity, professional summaries, and action-verb usage.

KEYWORDS (matchedKeywords, missingKeywords):
- matchedKeywords: up to 6 hard skills or requirements present in both CV and JD.
- missingKeywords: up to 5 critical skills or requirements present in the JD but missing from the CV. Do NOT include soft skills or generic traits.

TIPS (tips):
- Exactly 2-3 specific, actionable recommendations (max 15 words each) on how the candidate can edit their CV to fit the JD better.

BULLET POINTS OPTIMIZATION (bulletPoints):
- Take exactly 2-3 of the candidate's achievements and optimize them.
- If achievements are weak, rewrite them to weave in top missing keywords and introduce realistic metrics/numbers (e.g. increase by X%, reduce time by Y, manage Z stakeholders).
- Keep each optimized bullet point concise and action-oriented.

${langRule}

Candidate CV Profile:
${candidateProfile.substring(0, 1500)}

Job Description:
${jd.substring(0, 1500)}
  `.trim();

  return await tryEveryModel(async (modelId, temp) => {
    const text = await callGemini({
      modelId,
      temperature: typeof temp === "number" ? temp : 0.15,
      maxOutputTokens: 2500,
      contents: [promptText],
    });
    const parsed = parseJsonFromModel(text);
    return normalizeCVPayload(parsed, userProfile, jd);
  });
};

export const enhanceAchievement = async (text, jobTitle) => {
  const prompt = `You are an expert resume writer. Rewrite the following resume bullet point to make it more professional, impactful, and outcome-oriented.
Use strong action verbs and imply or include realistic metrics if appropriate, matching the context of a ${jobTitle || 'professional'}.
Keep it to one concise sentence (bullet point style). Do not include any quotes, markdown, or extra explanations. Just output the rewritten sentence.

Original: "${text}"`;

  return await tryEveryModel(async (modelId) => {
    return await callGemini({
      modelId,
      temperature: 0.7,
      contents: [prompt]
    });
  });
};

export const generateAIDevHook = async (fullName, skills, experienceYears, jobDescription, options = {}) => {
  const lang = options.outputLanguage || 'English';
  const prompt = `You are a professional technical recruiter and CV writer. Generate 2 strong, attention-grabbing opening hooks (intro paragraphs) for an AI Developer cover letter.
One hook should be bold and metric-driven, and the second should be tech-focused highlighting deep expertise in AI/ML (LLMs, RAG, Neural Networks, Python, PyTorch/TensorFlow, Agentic workflows).
Apply formatting to match a high-end application.
Output language must be ${lang}.
Return a JSON array with exactly two strings:
[
  "Bold opening...",
  "Tech-focused opening..."
]
Do not return any markdown formatting outside the JSON array. Output ONLY valid JSON.
Candidate: ${fullName || 'Candidate'}
Experience: ${experienceYears || 'some'} years
Skills: ${skills || 'Python, PyTorch, Deep Learning'}
Job: ${jobDescription || 'AI Engineer'}`;

  return await tryEveryModel(async (modelId) => {
    const text = await callGemini({
      modelId,
      temperature: 0.7,
      contents: [prompt]
    });
    try {
      return parseJsonFromModel(text);
    } catch {
      // fallback if json parsing fails
      return [
        text,
        text
      ];
    }
  });
};

export const generateLinkedInColdMessage = async (fullName, senderProfession, recipientName, company, tone, options = {}) => {
  const lang = options.outputLanguage || 'English';
  const prompt = `You are a career coach. Write a highly personalized, high-converting LinkedIn cold message to a recruiter or hiring manager.
The message should be short, concise (under 150 words), and structured with a clear hook and call-to-action.
Tone: ${tone || 'Professional & Warm'}
Output language must be ${lang}.
Recipient Name: ${recipientName || 'Hiring Manager'}
Company: ${company || 'Target Company'}
Sender Name: ${fullName || 'Candidate'}
Sender Profession: ${senderProfession || 'Software Engineer'}

Output ONLY the final cold message text. Do not include subject lines, placeholders like [Date], quotes, markdown, or extra explanations.`;

  return await tryEveryModel(async (modelId) => {
    return await callGemini({
      modelId,
      temperature: 0.7,
      contents: [prompt]
    });
  });
};

export const generateFreelancerProposal = async (fullName, niche, clientProject, experience, options = {}) => {
  const lang = options.outputLanguage || 'English';
  const prompt = `You are a successful top-rated freelancer. Generate a high-converting project proposal/pitch for a client project.
The proposal should address the client's needs immediately, explain your relevant experience in ${niche || 'freelancing'}, outline your proposed solution/action plan, and end with a strong call-to-action.
Keep it under 250 words and format with clean spacing.
Output language must be ${lang}.
Freelancer Name: ${fullName || 'Freelancer'}
Niche: ${niche || 'Web Developer'}
Experience: ${experience || '3 years'}
Client Project Description: ${clientProject || 'Build a website'}

Output ONLY the proposal text. Do not include placeholders like [Price], quotes, markdown, or extra explanations.`;

  return await tryEveryModel(async (modelId) => {
    return await callGemini({
      modelId,
      temperature: 0.7,
      contents: [prompt]
    });
  });
};