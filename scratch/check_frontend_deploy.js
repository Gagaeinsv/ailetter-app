// Use native fetch

async function check() {
  try {
    const htmlRes = await fetch("https://ailetter.pro/?cb=" + Date.now(), {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache"
      }
    });
    const html = await htmlRes.text();
    console.log("HTML length:", html.length);
    const headers = {};
    htmlRes.headers.forEach((val, key) => { headers[key] = val; });
    console.log("HTML Headers:", JSON.stringify(headers, null, 2));
    
    // Find script tags
    const scriptRegex = /src="(\/assets\/index-[a-zA-Z0-9_-]+\.js)"/g;
    let match;
    const scripts = [];
    while ((match = scriptRegex.exec(html)) !== null) {
      scripts.push(match[1]);
    }
    
    console.log("Found scripts:", scripts);
    
    for (const script of scripts) {
      const url = "https://ailetter.pro" + script;
      console.log("Checking script:", url);
      const res = await fetch(url);
      const js = await res.text();
      const containsGroq = js.includes("groq/llama");
      console.log(`Script contains "groq/llama":`, containsGroq);
    }
  } catch (err) {
    console.error(err);
  }
}

check();
