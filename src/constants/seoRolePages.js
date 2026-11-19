// src/constants/seoRolePages.js

export const SUPPORTED_SEO_LANGS = ['en', 'uk', 'de', 'it'];
export const PREFIXED_LANGS = ['uk', 'de', 'it'];

export const SEO_ROLE_PAGES = [
  {
    slug: 'cover-letter-project-manager',
    path: '/cover-letter-project-manager',
    locales: {
      en: {
        roleName: 'Project Manager / Scrum Master',
        title: 'Project Manager Cover Letter Generator & Examples | AI-Letter',
        description: 'Write a high-converting Project Manager or Scrum Master cover letter. Highlight Agile delivery, Sprint Velocity, Jira, RACI, and budget ownership with AI.',
        h1: 'Project Manager & Scrum Master Cover Letter Guide & AI Generator',
        lead: 'Stand out to hiring managers by turning your delivery track record, Sprint Velocity gains, and stakeholder alignment into a sharp opening hook.',
        skillsPlaceholder: 'e.g. Agile, Scrum, Jira, ClickUp, RACI, Risk Management, Stakeholder Alignment',
        jdPlaceholder: 'Paste the Project Manager or Scrum Master job description here...',
        ruleTitle: '3 Golden Rules for a Project Manager Cover Letter:',
        rules: [
          'Quantify delivery predictability: mention sprint velocity improvements, on-time release rates (e.g. 96% milestone delivery), and team size led.',
          'Show methodology & tooling mastery in context: Agile/Scrum ceremonies, Kanban flow, RACI accountability, MoSCoW prioritization, and Jira/ClickUp workflows.',
          'Frame yourself as a blocker-remover and servant leader who connects engineering execution with business ROI and budget control.',
        ],
        exampleTitle: 'Example of a High-Converting PM Opening:',
        exampleText: '"Your engineering roadmap demands predictable cross-team delivery without sacrificing release quality. Over the past 4 years as an Agile Project Manager, I orchestrated 3 distributed squads (22 engineers & QA) in Jira and ClickUp, boosting Sprint Velocity by 28% and cutting critical release blockers in half."',
        fullExampleTitle: 'Full Project Manager Cover Letter Sample (Copy & Customize):',
        fullExampleLetter: `Dear Hiring Manager,

Your engineering roadmap demands predictable cross-team delivery without sacrificing release quality. Over the past four years as an Agile Project Manager, I have led three distributed squads (22 engineers, designers, and QA specialists) using Jira and ClickUp, boosting Sprint Velocity by 28% and delivering 96% of quarterly milestones on schedule.

In my previous role at FinCore Systems, our mobile banking rewrite stalled due to unclear ownership and scope creep. I introduced a lightweight RACI accountability matrix across product, backend, and compliance stakeholders, split epics strictly into sub-12-hour sprint tasks, and ran focused 15-minute Daily Scrums paired with PDCA retrospectives. Within two quarters, release cycle times dropped from 6 weeks to 10 days while keeping the €420k annual budget 7% under target.

What draws me to your team right now is your upcoming multi-region API migration. Coordinating complex dependencies across time zones without overloading engineers is where structured risk planning (SWOT) and servant leadership make the biggest difference.

I would welcome a brief conversation to discuss how I can remove delivery blockers for your squads in Q1.`,
      },
      uk: {
        roleName: 'Project Manager / Scrum Master',
        title: 'Супровідний лист для Project Manager — Приклади та ШІ-генератор | AI-Letter',
        description: 'Як написати сильний супровідний лист (Cover Letter) для Project Manager або Scrum Master. Методології Agile, Velocity, RACI, MoSCoW та безкоштовний генератор.',
        h1: 'Супровідний лист для Project Manager та Scrum Master: гайд і генератор',
        lead: 'Покажіть рекрутеру не загальні фрази про комунікацію, а вимірні результати: швидкість спринтів (Velocity), дотримання бюджету та усунення блокерів команди.',
        skillsPlaceholder: 'напр. Agile, Scrum, Jira, ClickUp, RACI, MoSCoW, Risk Management',
        jdPlaceholder: 'Вставте опис вакансії Project Manager або Scrum Master сюди...',
        ruleTitle: '3 золотих правила супровідного листа для PM:',
        rules: [
          'Оцифруйте результати доставки проєктів: вкажіть розмір команд, бюджет, відсоток вчасних релізів та зростання Sprint Velocity.',
          'Покажіть володіння фреймворками на практиці: пріоритизація за MoSCoW, розподіл відповідальності через матриці RACI/DACI, цикл PDCA, управління ризиками (SWOT).',
          'Підкресліть роль Servant Leader: як ви знімаєте блокери для розробників та синхронізуєте очікування стейкхолдерів із бізнес-цілями.',
        ],
        exampleTitle: 'Приклад сильного вступу для PM:',
        exampleText: '«Вам потрібен Project Manager, який забезпечить прогнозований реліз продукту без вигорання команди та зриву дедлайнів. За останні 4 роки я керував двома крос-функціональними командами (18 спеціалістів) у Jira та ClickUp, підвищивши Sprint Velocity на 30% і скоротивши Time-to-Market на 3 тижні.»',
        fullExampleTitle: 'Повний приклад супровідного листа Project Manager:',
        fullExampleLetter: `Шановний менеджер з найму,

Вам потрібен Project Manager, який забезпечить прогнозований реліз продукту без вигорання команди та зриву дедлайнів. За останні чотири роки я керував двома крос-функціональними командами (18 спеціалістів: розробники, QA, дизайнери) у Jira та ClickUp, підвищивши Sprint Velocity на 30% і забезпечивши вчасне закриття 95% спринтів.

На попередньому проєкті в SaaS-компанії релізи постійно затримувалися через розмиту відповідальність між командами та неконтрольовані зміни скоупу. Я впровадив матрицю RACI, розбив великі задачі на чіткі підзадачі тривалістю до 12 годин та налагодив щоденні 15-хвилинні синхронізації з регулярними ретроспективами за циклом PDCA. За два квартали Time-to-Market скоротився на 3 тижні, а бюджет розробки залишився в межах плану.

Мене особливо зацікавив ваш фокус на масштабуванні платіжної інфраструктури на ринок ЄС. Уміння заздалегідь прораховувати ризики та знімати блокери для технічної команди допоможе пройти цей етап максимально ритмічно.

Буду радий короткій розмові, щоб обговорити актуальні задачі вашого беклогу.`,
      },
      de: {
        roleName: 'Project Manager / Scrum Master',
        title: 'Anschreiben für Project Manager — Vorlagen & KI-Generator | AI-Letter',
        description: 'Überzeugendes Anschreiben als Project Manager oder Scrum Master erstellen. Agile, Scrum, Sprint Velocity, Jira & Budgetverantwortung mit KI hervorheben.',
        h1: 'Anschreiben für Project Manager & Scrum Master: Leitfaden & KI-Generator',
        lead: 'Überzeugen Sie Recruiter mit messbaren Lieferergebnissen, souveränem Stakeholder-Management und klarer Agile-Methodik.',
        skillsPlaceholder: 'z.B. Agile, Scrum, Jira, ClickUp, RACI, Risikomanagement, Budgetplanung',
        jdPlaceholder: 'Stellenbeschreibung für Project Manager / Scrum Master hier einfügen...',
        ruleTitle: '3 goldene Regeln für das Project-Manager-Anschreiben:',
        rules: [
          'Belegen Sie Ihren Erfolg mit Kennzahlen: Teamgröße, Projektbudget, Termintreue und gesteigerte Sprint Velocity.',
          'Nennen Sie praxiserprobte Frameworks wie Scrum, Kanban, RACI-Matrizen, MoSCoW-Priorisierung sowie Tools wie Jira oder ClickUp.',
          'Positionieren Sie sich als lösungsorientierter Servant Leader, der Risiken früh erkennt und Business-Ziele mit technischer Umsetzung verbindet.',
        ],
        exampleTitle: 'Beispiel für einen starken Einstieg:',
        exampleText: '"Sie suchen einen Project Manager, der komplexe digitale Roadmaps termingerecht und im Budgetrahmen ins Ziel bringt. In den letzten 4 Jahren habe ich drei verteilte Agile-Teams (20 Entwickler) mit Jira und RACI-Strukturen gesteuert und die Release-Geschwindigkeit um 28 % erhöht."',
        fullExampleTitle: 'Vollständiges Muster-Anschreiben für Project Manager:',
        fullExampleLetter: `Sehr geehrte Damen und Herren,

Sie suchen einen Project Manager, der komplexe digitale Roadmaps termingerecht und im Budgetrahmen ins Ziel bringt. In den letzten vier Jahren habe ich drei verteilte Agile-Teams (20 Entwickler, QA und Produktdesign) mit Jira und ClickUp gesteuert, die Sprint Velocity um 28 % erhöht und 96 % aller Quartalsziele pünktlich geliefert.

In meiner bisherigen Position bei FinCore standen mehrere Produkt-Releases aufgrund unklarer Zuständigkeiten still. Durch Einführung einer klaren RACI-Matrix, konsequentes MoSCoW-Backlog-Management und strukturierte 15-Minuten-Daily-Scrums nach PDCA-Prinzip verkürzte sich der Release-Zyklus innerhalb von sechs Monaten von sechs Wochen auf zehn Tage — bei 7 % Budgeteinsparung.

Besonders reizt mich Ihr geplanter Ausbau der Plattform-Schnittstellen im DACH-Raum. Gerne unterstütze ich Ihre Teams dabei, technische Abhängigkeiten frühzeitig abzusichern und Hindernisse aus dem Weg zu räumen.

Über ein kurzes Kennenlerngespräch freue ich mich sehr.`,
      },
      it: {
        roleName: 'Project Manager / Scrum Master',
        title: 'Lettera di Presentazione Project Manager — Esempi & AI | AI-Letter',
        description: 'Scrivi una lettera di presentazione efficace per Project Manager e Scrum Master. Metti in risalto Agile, Sprint Velocity, Jira, RACI e budget con l\'IA.',
        h1: 'Lettera di Presentazione per Project Manager & Scrum Master',
        lead: 'Distinguiti subito trasformando i risultati di delivery, la gestione degli stakeholder e la metodologia Agile in un\'apertura ad alto impatto.',
        skillsPlaceholder: 'es. Agile, Scrum, Jira, ClickUp, RACI, Gestione Rischi, Budget',
        jdPlaceholder: 'Incolla qui la descrizione della posizione di Project Manager...',
        ruleTitle: '3 regole d\'oro per il ruolo di Project Manager:',
        rules: [
          'Quantifica l\'affidabilità di delivery: indica dimensione dei team, budget gestiti, rispetto delle scadenze e crescita della Sprint Velocity.',
          'Cita strumenti e framework concreti: cerimonie Agile/Scrum, matrici RACI, priorità MoSCoW e flussi operativi su Jira o ClickUp.',
          'Dimostra leadership orientata alla rimozione dei blocchi e all\'allineamento tra team tecnici e obiettivi di business.',
        ],
        exampleTitle: 'Esempio di apertura efficace:',
        exampleText: '"Cercate un Project Manager capace di trasformare roadmap complesse in rilasci puntuali. Negli ultimi 4 anni ho guidato 3 team cross-funzionali (22 persone) su Jira e ClickUp, aumentando la Sprint Velocity del 28% e riducendo i ritardi di rilascio."',
        fullExampleTitle: 'Esempio Completo di Lettera per Project Manager:',
        fullExampleLetter: `Gentile Hiring Manager,

Cercate un Project Manager capace di trasformare roadmap complesse in rilasci puntuali senza compromettere la qualità tecnica. Negli ultimi quattro anni ho guidato tre team cross-funzionali (22 tra sviluppatori, QA e designer) su Jira e ClickUp, aumentando la Sprint Velocity del 28% e rispettando il 96% delle scadenze trimestrali.

Nel mio precedente ruolo in FinCore, i rilasci rallentavano a causa di priorità poco chiare tra prodotto e ingegneria. Ho introdotto una matrice RACI condivisa, suddiviso le attività con il metodo MoSCoW e ottimizzato i cicli Scrum con retrospettive PDCA. In due trimestri il tempo di rilascio è sceso da sei settimane a dieci giorni, restando sotto il budget previsto.

Seguo con interesse l'espansione dei vostri servizi cloud e sarei lieto di portare un metodo pratico per rimuovere i colli di bottiglia operativi fin dal primo mese.

Resto a disposizione per un breve colloquio conoscitivo.`,
      },
    },
  },
  {
    slug: 'cover-letter-product-manager',
    path: '/cover-letter-product-manager',
    locales: {
      en: {
        roleName: 'Product Manager / Product Owner',
        title: 'Product Manager Cover Letter Generator & Examples | AI-Letter',
        description: 'Craft an outcome-driven Product Manager or Product Owner cover letter. Showcase retention, conversion lift, MoSCoW prioritization, and discovery with AI.',
        h1: 'Product Manager & Product Owner Cover Letter Guide & AI Generator',
        lead: 'Recruiters want product builders who move KPIs, not backlog clerks. Generate a tailored hook focused on retention, conversion, and product discovery.',
        skillsPlaceholder: 'e.g. Product Strategy, MoSCoW, User Stories, A/B Testing, SQL, Retention, SaaS ARR',
        jdPlaceholder: 'Paste the Product Manager or Product Owner job description here...',
        ruleTitle: '3 Golden Rules for a Product Manager Cover Letter:',
        rules: [
          'Lead with business & user outcomes: ARR/MRR growth, activation lift, churn reduction, or funnel conversion improvements.',
          'Demonstrate structured discovery & prioritization: customer interviews, Customer Journey Mapping, SWOT/MECE analysis, and MoSCoW roadmapping.',
          'Connect a specific product challenge in the target company with a concrete feature or growth experiment you shipped.',
        ],
        exampleTitle: 'Example of a High-Converting Product Manager Opening:',
        exampleText: '"Increasing activation without adding onboarding friction is one of the toughest levers in B2B SaaS. At FinFlow, I redesigned our self-serve onboarding funnel using cohort analytics and A/B experiments, lifting Day-7 retention by 19% and adding €180k in net-new ARR."',
        fullExampleTitle: 'Full Product Manager Cover Letter Sample (Copy & Customize):',
        fullExampleLetter: `Dear Hiring Manager,

Increasing user activation without adding onboarding friction is one of the toughest levers in B2B SaaS. At FinFlow, I redesigned our self-serve onboarding funnel using SQL cohort analytics and A/B experiments, lifting Day-7 retention by 19% and adding €180k in net-new ARR within two quarters.

Rather than shipping features based on opinions, I partner closely with engineering and design from discovery through launch. When customer interviews showed 40% of new sign-ups stalled before connecting their billing workspace, I mapped the Customer Journey (CJM), prioritized quick fixes via MoSCoW, and wrote clear User Stories with testable Acceptance Criteria. That single release cut time-to-first-value from 18 minutes to under 3 minutes.

Your recent push into self-serve mid-market teams aligns directly with the discovery and pricing experimentation work I enjoy most. I would love to apply that same product rigor to accelerate conversion across your core funnel.

Let us schedule a 20-minute call to walk through how I would approach your upcoming roadmap goals.`,
      },
      uk: {
        roleName: 'Product Manager / Product Owner',
        title: 'Супровідний лист для Product Manager / Product Owner | AI-Letter',
        description: 'Як написати супровідний лист для Product Manager або Product Owner. Приклади з метриками Retention, Conversion, ARR, MoSCoW та ШІ-генератор.',
        h1: 'Супровідний лист для Product Manager та Product Owner',
        lead: 'Покажіть бізнес-мислення з першого речення: зростання конверсії, утримання користувачів (Retention), пріоритизація беклогу та продуктові гіпотези.',
        skillsPlaceholder: 'напр. Product Strategy, User Stories, MoSCoW, CJM, A/B тести, SQL, Retention',
        jdPlaceholder: 'Вставте опис вакансії Product Manager або Product Owner сюди...',
        ruleTitle: '3 золотих правила листа для Product Manager / PO:',
        rules: [
          'Фокусуйтеся на продуктових метриках (Outcome, а не Output): конверсія воронки, LTV, Retention, ARPU, скорочення Churn.',
          'Покажіть інструментарій прийняття рішень: User Stories з Acceptance Criteria, Customer Journey Map, пріоритизація MoSCoW, SWOT-аналіз та A/B тестування.',
          'Прив’яжіть свій досвід до конкретної болі продукту компанії, у яку подаєтеся — покажіть, що ви вже вивчили їхній ринок.',
        ],
        exampleTitle: 'Приклад сильного вступу для Product Owner / PM:',
        exampleText: '«Масштабування SaaS-продукту вимагає балансу між швидкістю гіпотез та утриманням користувачів. На попередній позиції Product Owner я перебудував воронку онбордингу через A/B тести та CJM-аудит, що підняло активацію нових юзерів на 24% та принесло +18% до MRR за два квартали.»',
        fullExampleTitle: 'Повний приклад супровідного листа Product Manager / PO:',
        fullExampleLetter: `Шановний менеджер з найму,

Масштабування SaaS-продукту вимагає балансу між швидкістю перевірки гіпотез та реальним утриманням користувачів. На попередній позиції Product Owner у FinFlow я перебудував воронку онбордингу на базі когортного SQL-аналізу та A/B тестів, що підняло активацію нових юзерів на 24% та принесло +18% до MRR за два квартали.

Замість того щоб просто «наповнювати беклог», я веду фічі від інтерв’ю з користувачами до вимірювання ефекту після релізу. Коли аудит Customer Journey Map показав масовий відтік на кроці налаштування профілю, я провів пріоритизацію змін за MoSCoW, деталізував User Stories із чіткими Acceptance Criteria і разом із командою скоротив шлях до першої цінності продукту з 15 до 3 хвилин.

Ваш фокус на виході в self-serve сегмент малого бізнесу ідеально збігається з моїм досвідом продуктового зростання та монетизації.

Готовий обговорити ваші продуктові метрики та ідеї для першого кварталу на короткій співбесіді.`,
      },
      de: {
        roleName: 'Product Manager / Product Owner',
        title: 'Anschreiben für Product Manager & Product Owner | AI-Letter',
        description: 'Erstellen Sie ein wirkungsvolles Anschreiben als Product Manager / Product Owner. Fokus auf KPIs, Retention, Discovery, A/B-Tests und MoSCoW.',
        h1: 'Anschreiben für Product Manager & Product Owner: Beispiele & KI-Generator',
        lead: 'Zeigen Sie messbaren Business-Impact durch datengetriebene Product Discovery, klare Priorisierung und Nutzerzentrierung.',
        skillsPlaceholder: 'z.B. Produktstrategie, User Stories, A/B-Testing, MoSCoW, SQL, Retention',
        jdPlaceholder: 'Stellenbeschreibung für Product Manager / Product Owner einfügen...',
        ruleTitle: '3 goldene Regeln für Product Manager:',
        rules: [
          'Nennen Sie harte Produkt-KPIs: Conversion-Steigerung, Retention-Verbesserung, Churn-Reduktion oder Umsatzwachstum.',
          'Belegen Sie strukturiertes Arbeiten mit User Stories, Acceptance Criteria, MoSCoW-Priorisierung und Customer Journey Maps.',
          'Gehen Sie auf eine konkrete Produkt-Herausforderung des Zielunternehmens statt generischer Floskeln.',
        ],
        exampleTitle: 'Beispiel für einen starken Einstieg:',
        exampleText: '"Wachstum entsteht dort, wo Nutzerbedürfnisse auf klare Geschäftsziele treffen. In meiner letzten Rolle als Product Manager habe ich das Self-Serve-Onboarding mittels A/B-Tests neu aufgesetzt, die Aktivierung um 22 % gesteigert und den Churn spürbar gesenkt."',
        fullExampleTitle: 'Vollständiges Muster-Anschreiben für Product Manager:',
        fullExampleLetter: `Sehr geehrte Damen und Herren,

nachhaltiges Produktwachstum entsteht dort, wo echte Nutzerbedürfnisse auf messbare Geschäftsziele treffen. In meiner letzten Position als Product Manager bei FinFlow habe ich das Self-Serve-Onboarding auf Basis von SQL-Kohorten und A/B-Tests neu strukturiert und die Aktivierung um 22 % gesteigert.

Als Product Owner begleite ich Themen von der Discovery bis zum Release. Nachdem Nutzerinterviews zeigten, dass fast 40 % der Testkunden vor der ersten Integration abbrachen, erstellte ich eine aktualisierte Customer Journey Map, priorisierte Maßnahmen nach MoSCoW und formulierte präzise User Stories mit klaren Acceptance Criteria. So sank die Time-to-Value von 18 auf unter 3 Minuten.

Ihre geplante Expansion im B2B-Self-Serve-Bereich passt hervorragend zu meiner Erfahrung mit datengetriebenen Produkt-Experimenten.

Gerne bespreche ich in einem kurzen Gespräch, wie ich Ihre Produkt-KPIs im kommenden Quartal voranbringen kann.`,
      },
      it: {
        roleName: 'Product Manager / Product Owner',
        title: 'Lettera di Presentazione Product Manager & Product Owner | AI-Letter',
        description: 'Scrivi una lettera di presentazione vincente per Product Manager. Metti in luce metriche di crescita, retention, discovery e A/B testing con l\'IA.',
        h1: 'Lettera di Presentazione per Product Manager & Product Owner',
        lead: 'Dimostra visione strategica e impatto sui KPI di prodotto fin dalle prime righe grazie al generatore AI.',
        skillsPlaceholder: 'es. Product Strategy, User Stories, A/B Testing, MoSCoW, SQL, Retention',
        jdPlaceholder: 'Incolla la job description per Product Manager o Product Owner...',
        ruleTitle: '3 regole d\'oro per Product Manager:',
        rules: [
          'Parti dai risultati misurabili: incremento della conversione, retention, riduzione del churn o crescita dell\'ARR.',
          'Mostra padronanza di discovery e backlog: Customer Journey Map, User Stories con Acceptance Criteria e priorità MoSCoW.',
          'Collega una tua iniziativa passata a una sfida reale del prodotto dell\'azienda target.',
        ],
        exampleTitle: 'Esempio di apertura efficace:',
        exampleText: '"Aumentare la retention senza complicare l\'esperienza utente è la chiave dello scaling SaaS. Nel mio ultimo ruolo da Product Manager ho riprogettato il flusso di onboarding tramite A/B test, aumentando l\'attivazione del 21% in un trimestre."',
        fullExampleTitle: 'Esempio Completo di Lettera per Product Manager:',
        fullExampleLetter: `Gentile Hiring Manager,

Aumentare la retention senza aggiungere attrito all'esperienza utente è una delle leve più importanti nello scaling SaaS. Nel mio ultimo ruolo da Product Manager in FinFlow ho riprogettato l'onboarding self-serve tramite analisi SQL per coorti e A/B test, portando l'attivazione al settimo giorno a crescere del 21% e aggiungendo €180k di nuovo ARR.

Invece di gestire solo ticket, affianco ingegneria e design dalla discovery al rilascio. Quando le interviste agli utenti hanno rivelato un calo del 40% al primo setup, ho mappato la Customer Journey Map, ridefinito le priorità con il metodo MoSCoW e scritto User Stories con Acceptance Criteria verificabili, riducendo il time-to-value sotto i tre minuti.

La vostra espansione verso il segmento PMI self-serve rispecchia perfettamente i progetti di crescita su cui ho ottenuto i risultati migliori.

Sarei felice di confrontarmi in una breve call sui vostri obiettivi di roadmap.`,
      },
    },
  },
  {
    slug: 'cover-letter-qa-engineer',
    path: '/cover-letter-qa-engineer',
    locales: {
      en: {
        roleName: 'QA Engineer / SDET',
        title: 'QA Engineer & Automation Tester Cover Letter Generator | AI-Letter',
        description: 'Generate a standout QA Engineer or SDET cover letter. Highlight Playwright, Cypress, API testing, CI/CD pipelines, and bug-escape reduction.',
        h1: 'QA Engineer & SDET Cover Letter Guide & AI Generator',
        lead: 'Show engineering leaders how you speed up safe releases, cut regression time, and protect production quality across web, mobile, and API layers.',
        skillsPlaceholder: 'e.g. Playwright, Cypress, TypeScript, Postman, REST API, CI/CD, SQL, TestRail',
        jdPlaceholder: 'Paste the QA Engineer or QA Automation job description here...',
        ruleTitle: '3 Golden Rules for a QA Engineer Cover Letter:',
        rules: [
          'Highlight automation ROI: how many hours of manual regression your Playwright/Cypress suite saved or how fast CI feedback runs.',
          'Cover your full testing pyramid: API contract testing (Postman/RestAssured), E2E UI automation, SQL database checks, and CI/CD integration.',
          'Emphasize quality metrics like reduced production bug-escape rate and proactive defect prevention during sprint planning.',
        ],
        exampleTitle: 'Example of a High-Converting QA Opening:',
        exampleText: '"Fast CI/CD releases fall apart when regression testing takes two days. Over the last 3 years as a QA Automation Engineer, I architected a parallel Playwright + TypeScript test suite integrated into GitHub Actions, slashing regression cycles from 14 hours to 22 minutes with 94% critical-path coverage."',
        fullExampleTitle: 'Full QA Engineer Cover Letter Sample (Copy & Customize):',
        fullExampleLetter: `Dear Hiring Manager,

Fast CI/CD releases fall apart when manual regression takes two full days. Over the last three years as a QA Automation Engineer, I built a parallel Playwright and TypeScript test suite integrated into GitHub Actions, slashing regression cycles from 14 hours to 22 minutes while covering 94% of checkout and auth flows.

Beyond UI automation, I inspect quality across the entire stack. In my current role at CloudPay, I automated REST API contract validation in Postman/Newman, wrote SQL integrity checks for billing edge cases, and partnered with developers during sprint grooming to catch requirement gaps before a single line of code was written. Together, those practices reduced our production bug-escape rate by 60% over one year.

I noticed your engineering job listing highlights scaling automated end-to-end coverage without flaking pipelines. Cleaning up brittle selectors and stabilizing parallel CI test runs is something I genuinely enjoy solving.

I would appreciate the chance to discuss how I can help your team ship daily releases with confidence.`,
      },
      uk: {
        roleName: 'QA Engineer / SDET',
        title: 'Супровідний лист для QA Engineer (Manual & Automation) | AI-Letter',
        description: 'Приклади супровідного листа для QA Engineer та SDET. Покажіть навички у Playwright, Cypress, тестуванні API, CI/CD та оптимізації регресії за допомогою ШІ.',
        h1: 'Супровідний лист для QA Engineer та Automation Tester',
        lead: 'Доведіть, що ви не просто шукаєте баги, а економите час розробників, прискорюєте релізи та страхуєте бізнес від критичних помилок у продакшені.',
        skillsPlaceholder: 'напр. Playwright, Cypress, Postman, REST API, SQL, Jira, GitHub Actions, TypeScript',
        jdPlaceholder: 'Вставте опис вакансії QA Engineer або QA Automation сюди...',
        ruleTitle: '3 золотих правила листа для QA-інженера:',
        rules: [
          'Покажіть економію часу та якість релізів: на скільки годин скоротився час регресії та на скільки впала кількість багів у проді.',
          'Назвіть конкретний стек: автоматизація на Playwright/Cypress/Selenium, тестування API через Postman/Swagger, перевірка БД через SQL та інтеграція з CI/CD.',
          'Підкресліть залученість на етапі аналізу вимог — профілактика дефектів ще до написання коду цінується найвище.',
        ],
        exampleTitle: 'Приклад сильного вступу для QA Engineer:',
        exampleText: '«Швидкі релізи неможливі, якщо ручна регресія гальмує команду на два дні. За останні 3 роки на позиції QA Engineer я побудував автотести на Playwright + Postman у GitHub Actions, що скоротило цикл регресії з 12 годин до 20 хвилин і знизило кількість критичних багів у продакшені на 65%.»',
        fullExampleTitle: 'Повний приклад супровідного листа QA Engineer:',
        fullExampleLetter: `Шановний менеджер з найму,

Швидкі релізи неможливі, якщо ручна регресія щоразу гальмує команду на два дні. За останні три роки на позиції QA Automation Engineer я побудував паралельний набір E2E автотестів на Playwright + TypeScript у GitHub Actions, що скоротив цикл регресії з 12 годин до 20 хвилин і покрив 94% критичних бізнес-сценаріїв.

Окрім UI-тестування, я працюю з усією пірамідою якості. У поточній компанії CloudPay я налаштував автоматичну перевірку REST API через Postman, впровадив SQL-перевірки цілісності транзакцій і почав брати участь у рев’ю вимог ще до старту розробки. Це дозволило скоротити кількість багів у продакшені на 65% за рік.

У вашій вакансії окремий акцент зроблено на стабільності пайплайнів і зменшенні нестабільних (flaky) тестів. Саме оптимізація локаторів та ізоляція тестових даних у CI/CD — моя сильна сторона.

Буду радий познайомитися на інтерв’ю й обговорити процеси тестування у вашій команді.`,
      },
      de: {
        roleName: 'QA Engineer / SDET',
        title: 'Anschreiben für QA Engineer & Testautomatisierung | AI-Letter',
        description: 'Erstellen Sie ein überzeugendes QA Engineer / SDET Anschreiben. Fokus auf Playwright, Cypress, API-Tests, CI/CD und Fehlerreduktion.',
        h1: 'Anschreiben für QA Engineer & SDET: Vorlagen & KI-Generator',
        lead: 'Zeigen Sie Entwicklungsleitern, wie Sie Regressionszeiten verkürzen, Testabdeckung steigern und sichere Deployments garantieren.',
        skillsPlaceholder: 'z.B. Playwright, Cypress, Postman, REST API, CI/CD, SQL, TypeScript',
        jdPlaceholder: 'Stellenbeschreibung für QA Engineer / Testautomatisierung einfügen...',
        ruleTitle: '3 goldene Regeln für QA-Anschreiben:',
        rules: [
          'Quantifizieren Sie Ihren Mehrwert: Zeitersparnis in der Regression, höhere Testabdeckung und weniger Bugs in Produktion.',
          'Nennen Sie Ihren exakten Tech-Stack: Playwright, Cypress, Postman, SQL und CI/CD-Integration (GitHub Actions, GitLab CI).',
          'Betonen Sie Ihre proaktive Rolle bei Shift-Left-Testing und Anforderungsprüfung schon vor dem Coding.',
        ],
        exampleTitle: 'Beispiel für einen starken Einstieg:',
        exampleText: '"Schnelle Release-Zyklen scheitern oft an langsamen Regressionstests. In meinen letzten drei Jahren als QA Automation Engineer habe ich eine parallele Playwright-Suite in GitHub Actions aufgebaut und die Testlaufzeit von 10 Stunden auf 18 Minuten gesenkt."',
        fullExampleTitle: 'Vollständiges Muster-Anschreiben für QA Engineers:',
        fullExampleLetter: `Sehr geehrte Damen und Herren,

schnelle Release-Zyklen scheitern häufig an manuellen Regressionstests, die ganze Entwicklerteams ausbremsen. In den letzten drei Jahren als QA Automation Engineer habe ich eine parallele Playwright- und TypeScript-Suite direkt in GitHub Actions integriert und die Regressionszeit von 12 Stunden auf 20 Minuten verkürzt.

Neben der UI-Automatisierung decke ich API-Vertragstests mit Postman/Newman sowie SQL-Datenbankprüfungen ab. Durch konsequentes Shift-Left-Testing bereits im Sprint-Refinement konnten wir in meiner bisherigen Rolle bei CloudPay die Fehlerquote in Produktion innerhalb eines Jahres um 60 % senken.

Besonders spannend finde ich Ihren Fokus auf stabile, flakiness-freie CI/CD-Pipelines. Gerne unterstütze ich Ihr Engineering-Team dabei, tägliche Deployments zuverlässig abzusichern.

Ich freue mich auf ein kurzes Gespräch über Ihre aktuelle Teststrategie.`,
      },
      it: {
        roleName: 'QA Engineer / SDET',
        title: 'Lettera di Presentazione QA Engineer & Automation | AI-Letter',
        description: 'Crea una lettera di presentazione efficace per QA Engineer o SDET. Metti in risalto Playwright, Cypress, API testing, CI/CD e riduzione bug.',
        h1: 'Lettera di Presentazione per QA Engineer & Automation Tester',
        lead: 'Mostra come acceleri i rilasci in sicurezza riducendo i tempi di regressione e prevenendo i bug in produzione.',
        skillsPlaceholder: 'es. Playwright, Cypress, Postman, REST API, SQL, GitHub Actions',
        jdPlaceholder: 'Incolla la descrizione della posizione QA Engineer...',
        ruleTitle: '3 regole d\'oro per QA Engineer:',
        rules: [
          'Evidenzia i numeri: riduzione delle ore di regressione e calo dei difetti in produzione.',
          'Specifica lo stack tecnico: Playwright, Cypress, test API con Postman, query SQL e pipeline CI/CD.',
          'Valorizza la prevenzione dei bug in fase di analisi dei requisiti e la collaborazione con il team dev.',
        ],
        exampleTitle: 'Esempio di apertura efficace:',
        exampleText: '"Rilasci rapidi e qualità stabile richiedono test automatici affidabili. Negli ultimi 3 anni come QA Automation Engineer ho realizzato una suite Playwright integrata in CI/CD che ha ridotto i tempi di regressione da 12 ore a 25 minuti."',
        fullExampleTitle: 'Esempio Completo di Lettera per QA Engineer:',
        fullExampleLetter: `Gentile Hiring Manager,

Rilasci rapidi e qualità costante richiedono test automatici affidabili. Negli ultimi tre anni come QA Automation Engineer ho progettato una suite parallela in Playwright e TypeScript integrata in GitHub Actions, riducendo i cicli di regressione da 12 ore a 22 minuti con una copertura del 94% sui flussi critici.

Oltre all'automazione UI, seguo l'intera piramide di test: validazione delle API REST con Postman, controlli di integrità su database SQL e analisi preventiva dei requisiti insieme agli sviluppatori prima dello sviluppo. In CloudPay questo approccio ha ridotto i bug in produzione del 60% in un anno.

Ho notato che cercate esperienza nella stabilizzazione dei test E2E su pipeline CI/CD veloci, un ambito in cui posso portare valore immediato.

Resto volentieri disponibile per un colloquio tecnico.`,
      },
    },
  },
  {
    slug: 'cover-letter-frontend-developer',
    path: '/cover-letter-frontend-developer',
    locales: {
      en: {
        roleName: 'Frontend / React Developer',
        title: 'Frontend Developer Cover Letter Generator & Examples | AI-Letter',
        description: 'Write a job-winning Frontend or React Developer cover letter. Highlight TypeScript, Next.js, Core Web Vitals, accessibility, and UX performance with AI.',
        h1: 'Frontend & React Developer Cover Letter Guide & AI Generator',
        lead: 'Go beyond listing React and Tailwind. Showcase Core Web Vitals gains, clean component architecture, and measurable UX conversion lift.',
        skillsPlaceholder: 'e.g. React, TypeScript, Next.js, Tailwind CSS, Vite, Core Web Vitals, Testing Library',
        jdPlaceholder: 'Paste the Frontend or React Developer job description here...',
        ruleTitle: '3 Golden Rules for a Frontend Developer Cover Letter:',
        rules: [
          'Tie UI engineering to performance & product metrics: faster LCP/INP, smaller JS bundle size, higher checkout conversion, or WCAG accessibility.',
          'Demonstrate architectural ownership: reusable design systems, strict TypeScript safety, state management, and automated UI/E2E testing.',
          'Mention a specific user-facing detail from the hiring company website or product you want to improve.',
        ],
        exampleTitle: 'Example of a High-Converting Frontend Opening:',
        exampleText: '"Slow bundle loads quietly kill user conversion before your product gets a fair chance. In my previous role as a Senior Frontend Developer, I migrated a legacy React dashboard to TypeScript + code-split Vite chunks, cutting LCP by 48% and boosting mobile sign-up completion by 17%."',
        fullExampleTitle: 'Full Frontend Developer Cover Letter Sample (Copy & Customize):',
        fullExampleLetter: `Dear Hiring Manager,

Slow bundle loads quietly kill user conversion before your product gets a fair chance. In my previous role as a Frontend Developer, I migrated a legacy React dashboard to strict TypeScript with route-level code splitting in Vite, cutting Largest Contentful Paint (LCP) by 48% and boosting mobile sign-up completion by 17%.

Clean frontend architecture means both fast users and fast engineering teams. At ShopPulse, I built a shared accessible component library (React, Tailwind CSS, WCAG AA) backed by React Testing Library and Playwright smoke checks, reducing UI regressions across four product squads while doubling feature delivery speed.

Testing your public web app earlier this week, I noticed a clear opportunity to speed up initial hydration and refine mobile filter responsiveness — both areas I have tackled directly in production.

I would love to speak with your engineering lead about how I can help elevate your React + TypeScript codebase.`,
      },
      uk: {
        roleName: 'Frontend / React Developer',
        title: 'Супровідний лист для Frontend / React Developer | AI-Letter',
        description: 'Як написати ефективний супровідний лист для Frontend або React розробника. TypeScript, Next.js, Core Web Vitals, дизайн-системи та ШІ-генератор.',
        h1: 'Супровідний лист для Frontend та React розробника',
        lead: 'Виділіться серед сотень відгуків: покажіть, як ваш код прискорює завантаження сторінок (Core Web Vitals), масштабує UI та піднімає конверсію продукту.',
        skillsPlaceholder: 'напр. React, TypeScript, Next.js, Tailwind CSS, Vite, Redux, Core Web Vitals',
        jdPlaceholder: 'Вставте опис вакансії Frontend або React Developer сюди...',
        ruleTitle: '3 золотих правила листа для Frontend-розробника:',
        rules: [
          'Прив’язуйте верстку та JS до цифр: оптимізація Core Web Vitals (LCP/CLS), зменшення розміру бандлу, зростання швидкості інтерфейсу та конверсії.',
          'Покажіть інженерну зрілість: побудова UI-kit / дизайн-системи, сувора типізація на TypeScript, code splitting та покриття тестами.',
          'Уникайте шаблонів «обожнюю красиві інтерфейси» — напишіть, яку конкретну технічну задачу компанії ви готові вирішити.',
        ],
        exampleTitle: 'Приклад сильного вступу для Frontend Developer:',
        exampleText: '«Повільний інтерфейс знижує конверсію ще до того, як користувач оцінить продукт. На останньому проєкті я перевів спадкову адмін-панель на React + TypeScript і впровадив code splitting у Vite, що прискорило LCP на 45% та зменшило кількість UI-багів на 40%.»',
        fullExampleTitle: 'Повний приклад супровідного листа Frontend Developer:',
        fullExampleLetter: `Шановний менеджер з найму,

Повільний інтерфейс знижує конверсію ще до того, як користувач оцінить можливості продукту. На попередній позиції Frontend Developer у ShopPulse я перевів спадкову панель керування на React + TypeScript та впровадив code splitting у Vite, що прискорило LCP на 45% і збільшило кількість завершених реєстрацій із мобільних пристроїв на 17%.

Для мене якісний фронтенд — це баланс між UX для користувача та зручною архітектурою для команди. Я створив спільну бібліотеку доступних UI-компонентів на React та Tailwind CSS із покриттям тестами, що скоротило час розробки нових сторінок удвічі та прибрало дублювання коду між трьома продуктовими командами.

Я протестував ваш вебдодаток перед подачею й побачив кілька точок оптимізації початкового рендерингу та мобільної адаптивності, які зможу закрити в перші ж тижні роботи.

Буду радий обговорити ваш стек і технічні задачі на співбесіді.`,
      },
      de: {
        roleName: 'Frontend / React Developer',
        title: 'Anschreiben für Frontend & React Entwickler | AI-Letter',
        description: 'Überzeugendes Anschreiben für Frontend-Entwickler erstellen. React, TypeScript, Next.js, Core Web Vitals und UI-Architektur mit KI hervorheben.',
        h1: 'Anschreiben für Frontend & React Entwickler: Vorlagen & KI-Generator',
        lead: 'Zeigen Sie messbare Performance-Verbesserungen, saubere Komponenten-Architektur und UX-Verständnis.',
        skillsPlaceholder: 'z.B. React, TypeScript, Next.js, Tailwind CSS, Vite, Core Web Vitals',
        jdPlaceholder: 'Stellenbeschreibung für Frontend / React Developer einfügen...',
        ruleTitle: '3 goldene Regeln für Frontend-Entwickler:',
        rules: [
          'Verbinden Sie UI-Code mit messbaren Effekten: bessere Core Web Vitals (LCP/INP), kleinere Bundles oder höhere Conversion.',
          'Betonen Sie Wartbarkeit: Design-Systeme, TypeScript, Barrierefreiheit (WCAG) und automatisierte UI-Tests.',
          'Beziehen Sie sich kurz auf das Produkt oder das Frontend-Erlebnis des Zielunternehmens.',
        ],
        exampleTitle: 'Beispiel für einen starken Einstieg:',
        exampleText: '"Langsame Ladezeiten kosten Nutzer, noch bevor das Produkt überzeugt. Als Frontend Developer habe ich ein bestehendes React-Dashboard auf TypeScript und modulares Vite-Chunking umgestellt und dabei den LCP um 46 % beschleunigt."',
        fullExampleTitle: 'Vollständiges Muster-Anschreiben für Frontend Developer:',
        fullExampleLetter: `Sehr geehrte Damen und Herren,

lange Ladezeiten kosten wertvolle Nutzer, noch bevor ein Produkt überzeugen kann. In meiner letzten Rolle als Frontend Developer habe ich ein bestehendes React-Dashboard auf striktes TypeScript und modulares Vite-Code-Splitting umgestellt — dadurch sank der LCP um 46 % und die mobile Abschlussrate stieg um 17 %.

Bei ShopPulse habe ich zudem eine wiederverwendbare UI-Komponentenbibliothek (React, Tailwind CSS, WCAG-konform) aufgebaut und mit automatisierten UI-Tests abgesichert. So konnten vier Produkt-Teams neue Features doppelt so schnell und mit deutlich weniger UI-Fehlern ausliefern.

Beim Testen Ihrer Web-Plattform ist mir aufgefallen, wie viel Potenzial noch in der Optimierung der mobilen Performance und Initial-Bundles steckt — genau meine Stärke.

Ich freue mich auf ein technisches Gespräch mit Ihrem Frontend-Lead.`,
      },
      it: {
        roleName: 'Frontend / React Developer',
        title: 'Lettera di Presentazione Frontend & React Developer | AI-Letter',
        description: 'Genera una lettera di presentazione per Frontend o React Developer. Metti in evidenza TypeScript, Next.js, Core Web Vitals e design system.',
        h1: 'Lettera di Presentazione per Frontend & React Developer',
        lead: 'Vai oltre il semplice elenco di framework: mostra miglioramenti concreti di velocità, architettura UI e conversione utente.',
        skillsPlaceholder: 'es. React, TypeScript, Next.js, Tailwind CSS, Core Web Vitals',
        jdPlaceholder: 'Incolla la descrizione per Frontend o React Developer...',
        ruleTitle: '3 regole d\'oro per Frontend Developer:',
        rules: [
          'Collega il codice frontend ai risultati: ottimizzazione Core Web Vitals, riduzione del bundle JS e miglioramento dell\'accessibilità.',
          'Evidenzia solide basi architetturali: TypeScript, design system riutilizzabili, state management e test automatici.',
          'Cita un dettaglio concreto dell\'esperienza utente o del prodotto dell\'azienda a cui ti candidi.',
        ],
        exampleTitle: 'Esempio di apertura efficace:',
        exampleText: '"Interfacce lente penalizzano sia la SEO che la conversione. Nel mio ultimo ruolo come Frontend Developer ho migrato una dashboard React a TypeScript con code splitting su Vite, riducendo l\'LCP del 45% e migliorando il completamento delle registrazioni su mobile."',
        fullExampleTitle: 'Esempio Completo di Lettera per Frontend Developer:',
        fullExampleLetter: `Gentile Hiring Manager,

Interfacce lente penalizzano sia il posizionamento SEO che la conversione degli utenti. Nel mio ultimo ruolo come Frontend Developer in ShopPulse ho migrato una dashboard React legacy a TypeScript con code splitting su Vite, riducendo l'LCP del 46% e aumentando del 17% il completamento delle registrazioni su mobile.

Per garantire velocità di sviluppo a lungo termine ho progettato una libreria di componenti accessibili in React e Tailwind CSS, riducendo le regressioni visive tra quattro team di prodotto e velocizzando il rilascio delle nuove funzionalità.

Provando la vostra applicazione web questa settimana, ho notato opportunità concrete per ottimizzare l'idratazione iniziale e la fluidità su mobile.

Sarei lieto di confrontarmi con il vostro Tech Lead su come contribuire al vostro codebase React.`,
      },
    },
  },
  {
    slug: 'cover-letter-data-analyst',
    path: '/cover-letter-data-analyst',
    locales: {
      en: {
        roleName: 'Data Analyst / BI Specialist',
        title: 'Data Analyst Cover Letter Generator & Examples | AI-Letter',
        description: 'Build a persuasive Data Analyst or BI Specialist cover letter. Highlight SQL, Python, Power BI, Tableau, ETL pipelines, and revenue-impact insights.',
        h1: 'Data Analyst & BI Specialist Cover Letter Guide & AI Generator',
        lead: 'Hiring managers want analysts who turn messy datasets into profitable business decisions, not just dashboard builders.',
        skillsPlaceholder: 'e.g. SQL, Python, Power BI, Tableau, BigQuery, dbt, Cohort Analysis, A/B Testing',
        jdPlaceholder: 'Paste the Data Analyst or Business Intelligence job description here...',
        ruleTitle: '3 Golden Rules for a Data Analyst Cover Letter:',
        rules: [
          'Show business impact of your insights: saved reporting hours, uncovered churn drivers, optimized ad spend, or increased revenue.',
          'Be concrete about your data stack: advanced SQL window functions, Python (pandas), BigQuery/Snowflake, dbt, Power BI, or Tableau.',
          'Highlight your ability to communicate complex statistical findings clearly to non-technical executives and stakeholders.',
        ],
        exampleTitle: 'Example of a High-Converting Data Analyst Opening:',
        exampleText: '"Dashboards only create value when they change a business decision. Over the past 3 years as a Product Data Analyst, I built automated SQL + BigQuery cohort models and Power BI executive views that exposed a 22% churn drop-off and helped save €140k in annual marketing spend."',
        fullExampleTitle: 'Full Data Analyst Cover Letter Sample (Copy & Customize):',
        fullExampleLetter: `Dear Hiring Manager,

Dashboards only create value when they change a business decision. Over the past three years as a Product Data Analyst, I built automated SQL and BigQuery cohort models alongside Power BI executive views that exposed a 22% trial drop-off and helped save €140k in annual acquisition spend.

At RetailMetrics, finance and marketing teams spent 25 hours each week reconciling conflicting spreadsheets. I unified our event tracking in dbt and Python (pandas), built a single source of truth in BigQuery, and delivered clean self-serve Tableau reports that executives could read without SQL knowledge. Reporting latency dropped from 5 days to real-time daily refreshes.

Your job description mentions uniting subscription retention metrics with marketing attribution. Translating noisy cross-channel data into actionable unit economics is where I do my best work.

I look forward to discussing how I can turn your raw data into faster revenue decisions.`,
      },
      uk: {
        roleName: 'Data Analyst / BI Specialist',
        title: 'Супровідний лист для Data Analyst / BI аналітика | AI-Letter',
        description: 'Як написати супровідний лист для Data Analyst або BI-спеціаліста. Приклади з SQL, Python, Power BI, Tableau, когортним аналізом та бізнес-результатами.',
        h1: 'Супровідний лист для Data Analyst та BI-аналітика',
        lead: 'Бізнес шукає аналітиків, які перетворюють сирі дані у рішення, що економлять бюджет або збільшують прибуток — підкресліть це у першому абзаці.',
        skillsPlaceholder: 'напр. SQL, Python, Power BI, Tableau, BigQuery, Google Analytics, когортний аналіз',
        jdPlaceholder: 'Вставте опис вакансії Data Analyst або BI аналітика сюди...',
        ruleTitle: '3 золотих правила листа для Data Analyst:',
        rules: [
          'Наводьте бізнес-ефект від аналізу: скільки годин ручної звітності автоматизовано, яку точку втрати прибутку знайдено, на скільки оптимізовано маркетинг.',
          'Вказуйте точний стек: складний SQL, Python (pandas/numpy), BigQuery/ClickHouse, візуалізація у Power BI, Looker або Tableau.',
          'Підкресліть навичку перекладати мову цифр і статистики на зрозумілі рекомендації для менеджменту.',
        ],
        exampleTitle: 'Приклад сильного вступу для Data Analyst:',
        exampleText: '«Дашборд має цінність лише тоді, коли допомагає прийняти вигідніше рішення. За 3 роки роботи Data Analyst я автоматизував ETL-звітність на SQL і BigQuery та побудував когортні звіти в Power BI, що виявили вузьке місце у воронці та заощадили компанії 18% рекламного бюджету.»',
        fullExampleTitle: 'Повний приклад супровідного листа Data Analyst:',
        fullExampleLetter: `Шановний менеджер з найму,

Дашборд має цінність лише тоді, коли допомагає бізнесу прийняти вигідніше рішення. За три роки роботи Data Analyst я автоматизував когортну аналітику на SQL і BigQuery та побудував управлінські звіти в Power BI, що виявили точку втрати 22% користувачів і допомогли заощадити 18% річного маркетингового бюджету.

На попередньому місці роботи фінансовий і маркетинговий відділи щотижня витрачали по 20 годин на ручне зведення суперечливих Excel-таблиць. Я об’єднав джерела подій за допомогою Python (pandas) та SQL-вітрин, створив єдине джерело правди в BigQuery і налаштував прозорі BI-звіти для керівників без технічного бекграунду.

У вашій вакансії згадується потреба поєднати продуктові метрики утримання з маркетинговою атрибуцією — саме на побудові такої наскрізної аналітики я спеціалізуюся останні роки.

Буду радий обговорити ваші задачі з даними на співбесіді.`,
      },
      de: {
        roleName: 'Data Analyst / BI Specialist',
        title: 'Anschreiben für Data Analyst & BI Specialist | AI-Letter',
        description: 'Erstellen Sie ein überzeugendes Data Analyst Anschreiben. Fokus auf SQL, Python, Power BI, Tableau, BigQuery und datengetriebene Entscheidungen.',
        h1: 'Anschreiben für Data Analyst & BI Specialist: Tipps & KI-Generator',
        lead: 'Zeigen Sie, wie Ihre Analysen komplexe Daten in konkrete Umsatz- oder Effizienzgewinne übersetzen.',
        skillsPlaceholder: 'z.B. SQL, Python, Power BI, Tableau, BigQuery, dbt, A/B-Testing',
        jdPlaceholder: 'Stellenbeschreibung für Data Analyst / BI hier einfügen...',
        ruleTitle: '3 goldene Regeln für Data-Analyst-Anschreiben:',
        rules: [
          'Stellen Sie den wirtschaftlichen Nutzen in den Vordergrund: eingesparte Report-Stunden, reduzierte Abwanderung oder optimierte Budgets.',
          'Nennen Sie Ihren technischen Stack präzise: SQL, Python (pandas), Power BI, Tableau, BigQuery oder Snowflake.',
          'Zeigen Sie, dass Sie komplexe Zahlen verständlich für Management und Fachabteilungen aufbereiten können.',
        ],
        exampleTitle: 'Beispiel für einen starken Einstieg:',
        exampleText: '"Daten stiften erst dann Wert, wenn sie bessere Entscheidungen ermöglichen. In den letzten 3 Jahren als Data Analyst habe ich automatisierte SQL- und Power-BI-Modelle aufgebaut, die monatlich 25 Stunden manuelles Reporting eingespart und die Marketing-Effizienz um 16 % gesteigert haben."',
        fullExampleTitle: 'Vollständiges Muster-Anschreiben für Data Analysts:',
        fullExampleLetter: `Sehr geehrte Damen und Herren,

Dashboards stiften erst dann Wert, wenn sie zu besseren Geschäftsentscheidungen führen. In den letzten drei Jahren als Data Analyst habe ich automatisierte SQL- und BigQuery-Kohortenmodelle sowie Power-BI-Reports entwickelt, die einen 22-prozentigen Trial-Drop-off aufdeckten und 140.000 € an jährlichen Akquisekosten einsparten.

Bei RetailMetrics verbrachten Fachabteilungen jede Woche über 20 Stunden mit widersprüchlichen Excel-Tabellen. Durch saubere Datenmodellierung mit Python (pandas) und SQL schuf ich eine einheitliche Datenbasis und intuitive Self-Service-Berichte für das Management — statt fünf Tagen Wartezeit standen Kennzahlen täglich aktuell bereit.

Ihre Ausschreibung legt großen Wert auf die Verknüpfung von Retention-Daten und Marketing-Attribution — genau dieses Zusammenspiel reizt mich besonders.

Gerne zeige ich im Gespräch, wie ich Ihre Datenlandschaft gezielt weiterentwickeln kann.`,
      },
      it: {
        roleName: 'Data Analyst / BI Specialist',
        title: 'Lettera di Presentazione Data Analyst & BI Specialist | AI-Letter',
        description: 'Scrivi una lettera di presentazione per Data Analyst o Business Intelligence. Evidenzia SQL, Python, Power BI, Tableau e decisioni data-driven.',
        h1: 'Lettera di Presentazione per Data Analyst & BI Specialist',
        lead: 'Mostra come trasformi dati grezzi in decisioni strategiche misurabili per il business.',
        skillsPlaceholder: 'es. SQL, Python, Power BI, Tableau, BigQuery, Analisi Coorti',
        jdPlaceholder: 'Incolla la job description per Data Analyst o BI Specialist...',
        ruleTitle: '3 regole d\'oro per Data Analyst:',
        rules: [
          'Evidenzia l\'impatto aziendale delle tue analisi: ore di reporting risparmiate, riduzione del churn o ottimizzazione del budget.',
          'Specifica lo stack dati: SQL avanzato, Python (pandas), BigQuery, Power BI o Tableau.',
          'Dimostra capacità di tradurre insight statistici in raccomandazioni chiare per gli stakeholder.',
        ],
        exampleTitle: 'Esempio di apertura efficace:',
        exampleText: '"Una dashboard crea valore solo quando guida una decisione concreta. Negli ultimi 3 anni come Data Analyst ho progettato pipeline SQL e report Power BI che hanno ridotto di 20 ore mensili il reporting manuale e migliorato il ROI delle campagne del 15%."',
        fullExampleTitle: 'Esempio Completo di Lettera per Data Analyst:',
        fullExampleLetter: `Gentile Hiring Manager,

Una dashboard crea valore solo quando guida una decisione concreta di business. Negli ultimi tre anni come Product Data Analyst ho costruito modelli di coorte automatizzati in SQL e BigQuery con vista esecutiva in Power BI, individuando un abbandono del 22% nel funnel e ottimizzando il budget marketing del 16%.

In RetailMetrics i team dedicavano oltre 20 ore settimanali a riconciliare fogli di calcolo disallineati. Ho unificato i flussi dati con Python (pandas) e query SQL strutturate, offrendo al management report affidabili e aggiornati ogni mattina senza dipendere da estrazioni manuali.

La vostra ricerca di un profilo capace di unire metriche di retention e attribuzione marketing rispecchia esattamente il tipo di analisi su cui lavoro quotidianamente.

Resto a disposizione per un colloquio conoscitivo.`,
      },
    },
  },
];
