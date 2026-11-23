import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const PORT = Number(process.env.PORT || 3001);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "NOVA AI", aiConfigured: Boolean(GEMINI_API_KEY), model: GEMINI_MODEL });
});

app.post("/api/chat", async (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!message) return res.status(400).json({ error: "Please enter a message." });
  if (message.length > 8000) return res.status(413).json({ error: "Please keep your message under 8,000 characters." });
  if (!GEMINI_API_KEY) {
    return res.status(503).json({ error: "NOVA's AI connection is not configured yet. The website is ready, but its private AI provider key and backend hosting still need to be set up." });
  }

  const history = Array.isArray(req.body?.history) ? req.body.history.slice(-16) : [];
  const contents = [];
  for (const item of history) {
    if (!item || !["user", "assistant"].includes(item.role) || typeof item.content !== "string") continue;
    const content = item.content.trim().slice(0, 8000);
    if (!content) continue;
    contents.push({ role: item.role === "assistant" ? "model" : "user", parts: [{ text: content }] });
  }
  contents.push({ role: "user", parts: [{ text: message }] });

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: "You are NOVA, a friendly, capable general-purpose AI assistant. Answer a wide range of questions like a helpful conversational AI. Explain clearly, adapt detail to the user's needs, help with learning, writing, reasoning, brainstorming, mathematics and programming. Be honest when uncertain and distinguish facts from guesses. Do not claim to browse the live web, access files, remember information permanently, or perform external actions unless those capabilities are actually connected and confirm success. Never ask users to share passwords or secret API keys." }]
        },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 3000 }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Gemini API error:", response.status, data?.error?.message || "Unknown provider error");
      return res.status(502).json({ error: "NOVA couldn't get a response from its AI service. Please check the AI connection and try again." });
    }
    const reply = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
    if (!reply) return res.status(502).json({ error: "The AI service returned an empty answer. Please try again." });
    return res.json({ reply, model: GEMINI_MODEL });
  } catch (error) {
    console.error("NOVA request failed:", error.message);
    return res.status(500).json({ error: "NOVA couldn't complete that request. Please try again." });
  }
});

app.listen(PORT, "0.0.0.0", () => console.log(`NOVA AI backend listening on port ${PORT}`));
