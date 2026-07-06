"use client";
import React, { useEffect, useRef, useState } from "react";
import { useChat } from "ai/react";
import MessageBubble from "./MessageBubble.jsx";
import { SendIcon } from "./Icons.jsx";

export default function Chat() {
  const [model, setModel] = useState("models/gemini-1.5-flash");
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages } = useChat({
    api: '/api/chat',
    body: { model },
    initialMessages: [
      { id: '1', role: "assistant", content: "Hi! I’m your AI assistant. Ask me anything. 🧠💬" }
    ]
  });

  const listRef = useRef(null);

  useEffect(() => {
    const el = listRef.current; 
    if (!el) return; 
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { 
      e.preventDefault(); 
      handleSubmit(e); 
    }
  }

  function clearChat() {
    setMessages([{ id: crypto.randomUUID(), role: "assistant", content: "Chat cleared. How can I help now?" }]);
  }

  const canSend = input.trim().length > 0 && !isLoading;

  return (
    <div className="chat">
      <div ref={listRef} className="chat__list">
        {messages.map(m => (<MessageBubble key={m.id} role={m.role} text={m.content} />))}
        {isLoading && (
          <div className="small" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="spinner" /> Thinking…
          </div>
        )}
        {error && (
          <div className="small" style={{ color: '#ef4444' }}>
            Error: {error.message}
          </div>
        )}
      </div>

      <div className="composer">
        <form className="composer__inner" onSubmit={handleSubmit}>
          <div className="box">
            <textarea
              className="input"
              rows={1}
              placeholder="Ask me anything…"
              value={input}
              onChange={handleInputChange}
              onKeyDown={onKeyDown}
            />
            <div className="toolbar">
              <div className="small"></div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select value={model} onChange={(e) => setModel(e.target.value)} className="ghost">
                  <option value="models/gemini-1.5-flash">gemini-1.5-flash</option>
                  <option value="models/gemini-1.5-pro">gemini-1.5-pro</option>
                </select>
                <button type="submit" className="btn" disabled={!canSend}>
                  <SendIcon /> {isLoading ? "Sending…" : "Send"}
                </button>
                <button type="button" className="btn ghost" onClick={clearChat}>Clear</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
