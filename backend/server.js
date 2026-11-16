import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const PORT = Number(process.env.PORT || 3001);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "NOVA backend",
    aiConfigured: Boolean(GEMINI_API_KEY)
  });
});

app.post("/api/chat", async (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";

  if (!message) {
    return res.status(400).json({ error: "Please enter a message." });
  }

  if (message.length > 6000) {
    return res.status(413).json({ error: "Please keep messages under 6,000 characters." });
  }

  if (!GEMINI_API_KEY) {
    return res.status(503).json({
      error: "The NOVA backend is running, but its AI connection is not configured yet. We will connect the free-tier Gemini API after setting up your private environment key."
    });
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: "You are NOVA, a helpful AI automation assistant. Be clear and practical. At this stage you can answer questions, plan workflows, and explain actions, but do not claim to have performed external actions or accessed services unless a connected tool actually confirms it. Ask for approval before consequential actions."
          }]
        },
        contents: [{ role: "user", parts: [{ text: message }] }],
        generationConfig: { temperature: 0.6, maxOutputTokens: 1200 }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const apiMessage = data?.error?.message || "The AI provider returned an error.";
      return res.status(502).json({ error: apiMessage });
    }

    const reply = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!reply) {
      return res.status(502).json({ error: "The AI provider returned an empty response. Please try again." });
    }

    return res.json({ reply, model: GEMINI_MODEL });
  } catch (error) {
    console.error("NOVA chat request failed:", error.message);
    return res.status(500).json({ error: "NOVA could not complete that request. Please try again." });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`NOVA backend listening on http://localhost:${PORT}`);
});
