import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from .env file
dotenv.config();

const app = express();

// Define __filename and __dirname for ES modules to mimic CommonJS behavior,
// which is useful for correctly resolving file paths.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enable all CORS requests
// This allows your React client (running on a different port) to communicate with the server.
app.use(cors());
app.use(express.json());

// Initialize the Google Generative AI client with the API key from environment variables.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Health check endpoint to ensure the API is running
app.get("/api/health", (req, res) => res.json({ ok: true }));

// POST /api/chat
// This endpoint handles chat messages by forwarding them to the Gemini API.
app.post("/api/chat", async (req, res) => {
  try {
    const { model = "gemini-1.5-flash", messages = [] } = req.body || {};
    const chatModel = genAI.getGenerativeModel({ model });

    // The last message in the array is the user's new query
    const userQuery = messages[messages.length - 1].content;

    // Filter out the last message and map the remaining history to the correct format for the API
    // The filter ensures the first message is from the user, as required by the API
    const chatHistory = messages
      .slice(0, messages.length - 1)
      .map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }))
      .filter((msg, index) => index > 0 || msg.role === 'user');

    // Start a new chat session with the provided history
    const chat = chatModel.startChat({ history: chatHistory });

    // Send the user's new query and get a response
    const result = await chat.sendMessage(userQuery);
    const text = result.response.text();

    // Respond to the client with the AI's message
    res.json({ text });
  } catch (err) {
    console.error("Error during chat request:", err);
    res.status(500).json({ error: err?.message || "Unknown error" });
  }
});

// Serve static files from the React build directory.
// The key fix is here: we've corrected the path to 'client/dist'
// based on your project structure. This must be placed before the
// catch-all route to ensure static assets (JS, CSS, images) are served first.
app.use(express.static(path.join(__dirname, "../client/dist")));

// Handle all other routes by serving the React app's index.html for client-side routing.
// This acts as a fallback for any path that isn't a static file or an API endpoint.
// For example, if a user navigates directly to /dashboard, the server will
// send them the index.html file, and the React app will handle the routing.
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ API ready on http://localhost:${PORT}`));