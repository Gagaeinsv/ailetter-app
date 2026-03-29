export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { modelId, temperature, maxOutputTokens, contents, responseMimeType } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/${modelId}:generateContent?key=${apiKey}`;

    const body = {
      contents: [
        {
          role: "user",
          parts: contents.map(part =>
            typeof part === "string" ? { text: part } : part
          ),
        },
      ],
      generationConfig: {
        temperature,
        maxOutputTokens,
        ...(responseMimeType ? { responseMimeType } : {}),
      },
      safetySettings: [
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ],
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);

  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}