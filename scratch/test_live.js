// Use native fetch

async function run() {
  const body = {
    modelId: "groq/llama-3.3-70b-versatile",
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
    const headers = {};
    res.headers.forEach((val, key) => { headers[key] = val; });
    console.log("Headers:", JSON.stringify(headers, null, 2));
    
    const text = await res.text();
    console.log("Body:", text);
  } catch (err) {
    console.error("Error making request:", err);
  }
}

run();
