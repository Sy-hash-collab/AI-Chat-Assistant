import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

// POST /api/chat { model, messages: [{role, content}, ...] }
app.post("/api/chat", async (req, res) => {
  try {
    const { model = "gemini-1.5-flash", messages = [] } = req.body || {};
    const chatModel = genAI.getGenerativeModel({ model });

    const userQuery = messages[messages.length - 1].content;

    const chatHistory = messages
      .slice(0, messages.length - 1)
      .map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }))
      .filter((msg, index) => index > 0 || msg.role === 'user');

    const chat = chatModel.startChat({ history: chatHistory });

    const result = await chat.sendMessage(userQuery);
    const text = result.response.text();

    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err?.message || "Unknown error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ API ready on http://localhost:${PORT}`));