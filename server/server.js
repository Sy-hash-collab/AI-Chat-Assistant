import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Corrected client initialization and variable name
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Added a route to handle GET requests to the root path
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the API!" });
});

// POST /api/chat { model, messages: [{role, content}, ...] }
app.post("/api/chat", async (req, res) => {
  try {
    // A standard model name like "gpt-4o-mini" is a good default.
    const { model = "gpt-4o-mini", messages = [] } = req.body || {};

    // Corrected the method name to chat.completions.create and the input format.
    const response = await client.chat.completions.create({
      model,
      messages: messages, // The messages array is passed directly
    });

    // Corrected how to access the generated text from the response
    const text = response.choices[0].message.content;
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err?.message || "Unknown error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(` API ready on http://localhost:${PORT}`));
