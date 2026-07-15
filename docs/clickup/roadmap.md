# AI-Letter: Future Roadmap & Next Steps

This roadmap outlines strategic marketing and product development tasks for AI-Letter.

---

## Phase 1: SEO, Indexing & Growth (Q3 2026)

### 1. Organic Link Building (Backlinks)
* Build authority for the new domain `ailetter.pro` (DA/DR = 0) by listing on directories:
  * **AI Directories**: TheresAnAIForThat, Futurepedia, AI Hunter.
  * **Software Directories**: AlternativeTo, Product Hunt (reviews/launches).
* Write articles on Medium, dev.to, Dou, and Habr sharing "how to optimize CV for ATS using AI-Letter", pointing back to our templates.

### 2. Manual Search Console Crawling
* Inspect `/cover-letter-ai-developer`, `/linkedin-cold-message-templates`, and `/freelancer-self-introduction` using the URL Inspection tool in Google Search Console and click "Request Indexing" to force Googlebot to parse the new footer-linked pages.

---

## Phase 2: PDF Page Break Calculations (Q4 2026)

### 1. Programmatic Height Offsets
* Improve the layout rendering by adding a height-check listener before PDF canvas export.
* Iterate through all section elements. If the cumulative height of sections exceeds 1123px (A4 page height), inject a `<div className="html2pdf__page-break" style={{ pageBreakBefore: 'always', height: 0 }} />` spacer to force clean page splits and prevent cutting text lines in half.

---

## Phase 3: Modular Layouts & Custom Sections (2027)

### 1. Custom Sections Support
* Allow users to click "+ Custom Section" (similar to FlowCV).
* Let users define custom titles (e.g. "Military Service", "Hobbies", "Volunteer Work") and input text/bullet lists.
* Sync custom sections dynamically via the useProfile hook by storing them inside a `customSections` array of objects.

### 2. Multi-column Selection
* Expand CV Maker design controls to let users toggle the sidebar column layout (Left sidebar vs. Right sidebar) or switch standard templates to 2-column grids dynamically.
