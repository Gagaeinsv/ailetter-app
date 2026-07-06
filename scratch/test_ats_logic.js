import { appearsInText, isBadATSKeyword } from '../src/gemini.js';

// We want to test these locally.
// Note that src/gemini.js is a ES module.
// Let's run some assertions.

const testCases = [
  // 1. isBadATSKeyword checks
  { fn: () => !isBadATSKeyword("Node.js"), name: "Node.js is not bad" },
  { fn: () => !isBadATSKeyword("Next.js"), name: "Next.js is not bad" },
  { fn: () => !isBadATSKeyword("CI/CD"), name: "CI/CD is not bad" },
  { fn: () => isBadATSKeyword("додати опис роботи"), name: "Ukrainian instruction is bad" },
  
  // 2. appearsInText checks (casing, synonyms, spacing)
  { fn: () => appearsInText("I am a React developer", "React.js"), name: "React matches React.js" },
  { fn: () => appearsInText("I use React.js in projects", "React"), name: "React.js matches React" },
  { fn: () => appearsInText("Strong skills in CICD pipelines", "CI/CD"), name: "CICD matches CI/CD" },
  { fn: () => appearsInText("We use TypeScript daily", "TS"), name: "TypeScript matches TS" },
  { fn: () => appearsInText("Familiar with PowerBI dashboards", "Power BI"), name: "PowerBI matches Power BI" },
  
  // 3. Cyrillic/Ukrainian inflections prefix checks
  { fn: () => appearsInText("Маю досвід в управлінні проектами", "управління"), name: "управлінні matches управління" },
  { fn: () => appearsInText("Працював над розробкою додатків", "розробка"), name: "розробкою matches розробка" },
  { fn: () => appearsInText("Займався тестуванням систем", "тестування"), name: "тестуванням matches тестування" },
  
  // 4. Negative matching checks (to avoid false positives)
  { fn: () => !appearsInText("We have cats", "TS"), name: "cats does not match TS" },
  { fn: () => !appearsInText("This is a proactive worker", "active"), name: "proactive does not match active" },
];

let failed = 0;
testCases.forEach((tc) => {
  try {
    const passed = tc.fn();
    if (passed) {
      console.log(`[PASS] ${tc.name}`);
    } else {
      console.error(`[FAIL] ${tc.name}`);
      failed++;
    }
  } catch (err) {
    console.error(`[ERROR] ${tc.name} threw:`, err);
    failed++;
  }
});

if (failed === 0) {
  console.log("\nALL TESTS PASSED SUCCESSFULLY! ✓");
  process.exit(0);
} else {
  console.error(`\n${failed} TESTS FAILED.`);
  process.exit(1);
}
