import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const PORT = Number(process.env.PORT || 3001);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

app.use(cors({ origin: [ "http://localhost:5173", "http://127.0.0.1:5173" ] }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "NOVA backend",
    aiConfigured: Boolean(GEMINI_API_KEY),
    model: GEMINI_MODEL
  });
});

app.post("/api/chat", async (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!message) return res.status(400).json({ error: "Please enter a message." });
  if (message.length > 6000) return res.status(413).json({ error: "Please keep messages under 6,000 characters." });

  if (!GEMINI_API_KEY) {
    return res.status(503).json({
      error: "NOVA's server is running, but the AI provider key has not been configured. Add the key privately to the backend environment to enable AI replies."
    });
  }

  const history = Array.isArray(req.body?.history) ? req.body.history.slice(-12) : [];
  const contents = [];
  for (const item of history) {
    if (!item || !["user", "assistant"].includes(item.role) || typeof item.content !== "string") continue;
    const content = item.content.trim().slice(0, 6000);
    if (!content) continue;
    contents.push({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text: content }]
    });
  }
  contents.push({ role: "user", parts: [{ text: message }] });

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: "You are NOVA, a thoughtful and capable AI assistant. Give accurate, clear, practical answers. You can converse, explain, brainstorm, and plan workflows. Do not claim to have searched the live web, read an unavailable file, remembered something permanently, or performed an external action unless a connected tool actually confirms it. Be transparent about limitations. Ask for confirmation before consequential external actions. Never request passwords or secret API keys in chat."
          }]
        },
        contents,
        generationConfig: { temperature: 0.65, maxOutputTokens: 1600 }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      const providerMessage = data?.error?.message || "The AI provider returned an error.";
      console.error("Gemini API error:", response.status, providerMessage);
      return res.status(502).json({ error: "The AI service could not complete that request. Check the provider configuration and try again." });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
    if (!reply) return res.status(502).json({ error: "The AI service returned an empty response. Please try again." });
    return res.json({ reply, model: GEMINI_MODEL });
  } catch (error) {
    console.error("NOVA chat request failed:", error.message);
    return res.status(500).json({ error: "NOVA could not complete that request. Please try again." });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`NOVA backend listening on port ${PORT}`);
});
