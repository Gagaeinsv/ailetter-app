# Chrome Web Store Submission Kit — AI-Letter

## 1. Store Listing Copy (English — Primary)

- **Name:** `AI-Letter — 1-Click ATS Resume Checker & Cover Letter`
- **Short description (max 132 chars):**
  `Extract any job from LinkedIn, Indeed, StepStone, or Djinni in 1 click for a free ATS resume check or tailored cover letter.`
- **Category:** `Productivity` (or `Workflow & Planning`)
- **Language:** English (add German / Ukrainian / Italian later in Store Listing localizations)
- **Website:** `https://ailetter.pro`
- **Privacy Policy URL:** `https://ailetter.pro/privacy`

### Detailed Description (copy-paste into Chrome Web Store)
```text
Stop copying and pasting job descriptions between tabs.

AI-Letter adds a lightweight 1-click clipper to LinkedIn, Indeed, StepStone, Xing, Glassdoor, Djinni, DOU, and Work.ua — plus works on any company careers page (Greenhouse, Lever, Workday, Ashby) via the toolbar icon.

What you can do in 1 click:
• Free ATS Resume Check (No Sign-Up): Instantly compare your CV against the open job posting to get your ATS match score (0–100), missing hard-skill keywords, and actionable bullet fixes.
• Brutal 6-Second Recruiter Roast: Skip generic HR advice and get direct, honest feedback on what weakens your CV — with a downloadable score card.
• Tailored Cover Letter & Anschreiben Generator: Open AI-Letter with the job description pre-filled and generate a customized cover letter in English, German (Anschreiben), Italian, or Ukrainian in under 30 seconds.

Built for speed and privacy:
• Only reads page text when you click a button on a job posting.
• Never tracks your browsing history or sells data.
• Dismissible floating widget — zero clutter on non-job pages.
```

---

## 2. Privacy Practices Tab (Required by Chrome Web Store Review)

- **Single Purpose Description:**
  `Extracts job description text from the active job listing tab when triggered by the user and opens ailetter.pro with the job description pre-filled for ATS resume checking or cover letter generation.`

- **Justification for `activeTab`:**
  `Used only when the user clicks the extension toolbar icon on a company careers page to read the currently visible job posting text.`

- **Justification for `scripting`:**
  `Used exclusively to run the bundled local extractor.js script inside the active tab upon user click so job descriptions can be extracted on any careers website without requesting broad <all_urls> host permissions.`

- **Host permissions justification (Content Scripts):**
  `Limited strictly to supported job boards (LinkedIn Jobs, Indeed, StepStone, Xing, Glassdoor, Djinni, DOU, Work.ua, Robota.ua) to display a dismissible 1-click ATS Check / Cover Letter button.`

- **Remote code:** `No, I am not using remote code.`
- **Data usage checkboxes:** Select **No user data is collected, stored, or sold by the extension** (text is passed directly to `ailetter.pro` only when the user clicks an action button).

---

## 3. How to Test Locally & Publish (5 minutes)

1. **Test locally right now:**
   - Open `chrome://extensions` in Chrome.
   - Enable **Developer mode** (top-right toggle).
   - Click **Load unpacked** -> select the `chrome-extension` folder in this repository.
   - Open any job on LinkedIn, StepStone, Indeed, or Djinni -> click **📊 Free ATS Check** or **✉️ Cover Letter**.
2. **Publish to Chrome Web Store:**
   - Go to https://chrome.google.com/webstore/devconsole (one-time $5 Google developer fee).
   - Click **New Item** -> upload `dist-extension/ailetter-chrome-extension-v1.0.0.zip`.
   - Paste the texts above, add 2–3 screenshots (1280×800), and click **Submit for Review** (typically approved in 1–3 days).
