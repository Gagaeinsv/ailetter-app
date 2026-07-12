// Use native fetch to test gemini-2.5-flash-lite

async function run() {
  const body = {
    modelId: "gemini-2.5-flash-lite",
    temperature: 0.7,
    maxOutputTokens: 100,
    contents: ["Hi, who are you? Please reply with exactly one sentence."]
  };

  try {
    const res = await fetch("https://ailetter.pro/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    console.log("Status:", res.status);
    console.log("Status Text:", res.statusText);
    const text = await res.text();
    console.log("Body:", text);
  } catch (err) {
    console.error("Error making request:", err);
  }
}

run();
