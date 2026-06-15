export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { modelId, temperature, maxOutputTokens, contents, responseMimeType } = req.body;

  if (modelId && modelId.startsWith("groq/")) {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(500).json({ error: "Groq API key not configured" });
    }

    const groqModel = modelId.replace("groq/", "");
    const textPrompt = contents.map(part => {
      if (typeof part === "string") return part;
      if (part.text) return part.text;
      return "";
    }).filter(Boolean).join("\n\n");

    try {
      const groqUrl = "https://api.groq.com/openai/v1/chat/completions";
      const body = {
        model: groqModel,
        messages: [
          { role: "user", content: textPrompt }
        ],
        temperature: typeof temperature === "number" ? temperature : 0.7,
        max_tokens: typeof maxOutputTokens === "number" ? maxOutputTokens : 4000,
        ...(responseMimeType === "application/json" ? { response_format: { type: "json_object" } } : {})
      };

      const response = await fetch(groqUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqApiKey}`
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      const choice = data.choices?.[0];
      const resultText = choice?.message?.content || "";
      const finishReason = choice?.finish_reason === "stop" ? "STOP" : (choice?.finish_reason || "STOP");

      const geminiMappedResponse = {
        candidates: [
          {
            content: {
              parts: [
                { text: resultText }
              ]
            },
            finishReason: finishReason
          }
        ]
      };

      return res.status(200).json(geminiMappedResponse);

    } catch (error) {
      console.error("Groq API error:", error);
      return res.status(500).json({ error: "Internal server error calling Groq" });
    }
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

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
