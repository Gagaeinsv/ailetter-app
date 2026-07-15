# AI-Letter: AI Engine & Multimodal CV Parser Specification

## Models & Failover Architecture

AI-Letter integrates with both Google Gemini and Groq (Llama 3.3) APIs through an automated fallback model list:

1. **`gemini-2.5-flash`** (Default model - high speed, multimodal).
2. **`groq/llama-3.3-70b-versatile`** (First fallback - excellent text reasoning).
3. **`gemini-2.5-flash-lite`** (Second fallback - lightweight speed).
4. **`gemini-2.5-pro`** (Third fallback - heavy-duty reasoning).

### Model Rotation Logic (`tryEveryModel`)
* When an API call fails or encounters Google quota/rate limits, the generator catches the error, waits 1 second, and rotates to the next model in the list.
* If all models fail and a quota limit is detected, a custom user-friendly error is thrown: *“AI Rate Limit/Quota Exceeded: Please wait a few seconds and try again, or check your API key plan billing details.”*
* Enforces `finishReason` validation to prevent truncated/half-generated cover letters or interview preps.

---

## Multimodal CV Parser (`parseCV`)

Takes a base64 encoded PDF file part and feeds it directly into the Gemini model with strict JSON extraction directives.

### Key Normalization Flow
To handle the non-deterministic output shapes of LLMs, the parser implements a normalization layer immediately after parsing the JSON text:
* **Name**: Extracts `fullName`, falling back to `name` or `fullname`.
* **Profession**: Extracts `profession`, falling back to `jobTitle` or `title`.
* **Summary/Bio**: Maps `summary`, `aboutMe`, `about`, `profile`, or `bio` keys automatically to `summary`.
* **Lists Safety**: Validates that experience, projects, skills, languages, certifications, courses, awards, publications, and interests are returned as valid arrays.

---

## Custom Verification Protocols

### 1. Opening Sentence Protocol
* Enforces that the cover letter must immediately jump into the candidate's core metric/value proposition.
* Strictly forbids generic openings like: *“Dear Hiring Manager,”*, *“I am writing to express my interest...”*, or *“Thank you for this opportunity...”*.

### 2. STAR Interview Prep
* Guarantees that generated preparation answers are structured with explicit:
  * **S**ituation (1-2 sentences)
  * **T**ask (1 sentence)
  * **A**ction (2-3 sentences)
  * **R**esult (1-2 sentences with metrics)

---

## Voice Dictation & Speech API
* Utilizes the browser's native `webkitSpeechRecognition` API.
* Implements an explicit language selector (defaults to system UI language) to avoid phonetic mismatch and transcription errors (e.g. trying to parse Ukrainian speech as English phonemes).
