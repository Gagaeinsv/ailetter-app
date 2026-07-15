# AI-Letter: Version 1.0.0 Release Logs

This document tracks all completed features, bug fixes, and optimization tasks from the first push to the current stable build.

---

## [1.0.0] - Stable Release

### Added
* **Interactive CV Maker**: Core tab with visual theme selections, contact details forms, experience items editor, and markdown output.
* **10-Section Template Layout**: Unified rendering of Profile, Bio/Summary, Work Experience, Projects, Education, Skills, Languages, Certifications, Courses, Awards, Publications, and Interests.
* **Section Reordering (Drag/Drop)**: Implemented move blocks up/down controls that dynamically adjust rendering order in both single and double-column templates.
* **Voice Dictation (Speech Recognition)**: System-language voice dictation modal on Dashboard and profile onboarding tabs to speak resume details directly.
* **ATS Reviewer & Score Optimizer**: Side-by-side original-to-optimized bullet comparison, counting missing keywords against vacancy text.
* **Stripe Subscriptions & Rewards**: ✦ Pro & Rewards tab containing monthly/yearly toggles, Stripe checkouts, and free generations earned by sharing to LinkedIn/Twitter.
* **Dynamic Pre-rendered SEO Templates**: Low-frequency keywords target pages (AI Developer, LinkedIn Cold Messages, Freelancer Introduction) with Vite static output routing.

### Fixed
* **iOS Safari Compatibility**: Lowered compilation build target to `['es2020', 'safari14']` resolving blank white screen issues on older iOS devices.
* **PDF Export OKLCH Rendering**: Upgraded `html2canvas` to `html2canvas-pro` globally to correctly parse Tailwind CSS v4 OKLCH colors and prevent black box PDF exports.
* **CV Parser summary key normalization**: Normalized return keys from LLM (e.g. mapping `aboutMe`, `about`, `profile`, `bio` -> `summary`) to prevent data truncation.
* **Double-column layout vertical reordering**: Fixed blocks layout filtering to maintain vertical flow when sorting experience/education inside column grids.
* **Section Order Localization**: Localized Section Order pills and template headers dynamically for English, Ukrainian, German, and Italian languages.
* **SEO Footer Links**: Linked all new deep pages inside the footer of `Landing.jsx` to resolve orphan page crawling issues and improve Google Search Console indexing.
