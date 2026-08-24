import React, { useState, useEffect, useRef } from "react";
import API from "../services/api";
import "./AIChatBot.css";

const SUGGESTED_PROMPTS = [
  "🪄 Rewrite my executive summary for maximum impact",
  "🎯 What specific skills should I add to reach 90+ ATS score?",
  "💼 Draft a cover letter tailored to my resume profile",
  "❓ What interview questions will recruiters ask me?",
  "📊 Analyze my resume weaknesses and recommend fixes"
];

function AIChatBot({ resumeContext = null, isDrawer = false, onCloseDrawer = null }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Welcome! I am your **Ollama AI Career Assistant**. I run 100% locally on your computer with Ollama.\n\n" +
        (resumeContext
          ? `I have loaded **${resumeContext.filename || "your resume"}** (ATS Score: **${resumeContext.analysis?.ats_score || "N/A"}**). Ask me anything about improving your resume, rewriting sections, or preparing for interviews!`
          : "Upload a PDF resume on the Analyzer tab for tailored insights, or ask me any career question below!"),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState({
    online: false,
    models: ["qwen2.5:0.5b"],
    active_model: "qwen2.5:0.5b"
  });
  const [selectedModel, setSelectedModel] = useState("qwen2.5:0.5b");
  const [copiedIndex, setCopiedIndex] = useState(null);

  const chatEndRef = useRef(null);

  // Check Ollama status on mount
  useEffect(() => {
    fetchOllamaStatus();
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const fetchOllamaStatus = async () => {
    const status = await API.checkOllamaStatus();
    setOllamaStatus(status);
    if (status.active_model) {
      setSelectedModel(status.active_model);
    }
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || input.trim();
    if (!query || loading) return;

    const userMessage = {
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const historyForBackend = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      const contextPayload = resumeContext
        ? {
            filename: resumeContext.filename,
            ats_score: resumeContext.analysis?.ats_score,
            candidate_profile: resumeContext.analysis?.candidate_profile,
            skills: resumeContext.analysis?.skills?.items || [],
            sections: resumeContext.analysis?.sections,
            previewText: resumeContext.previewText || resumeContext.full_text
          }
        : null;

      const res = await API.sendChatMessage({
        message: query,
        conversationHistory: historyForBackend,
        model: selectedModel,
        resumeContext: contextPayload
      });

      const assistantMessage = {
        role: "assistant",
        content: res.response || "No response received from Ollama.",
        modelUsed: res.model_used || selectedModel,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = {
        role: "assistant",
        content: `⚠️ Error contacting Ollama server: ${err.message || "Unreachable"}. Make sure Ollama is running locally.`,
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        role: "assistant",
        content: "Chat history cleared. How can I help you next?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  // Helper to format basic markdown (bold, lists, code blocks, linebreaks)
  const renderFormattedContent = (content) => {
    if (!content) return null;

    // Split code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, pIdx) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const codeText = part.slice(3, -3).replace(/^[a-z]+\n/i, "");
        return (
          <div key={pIdx} className="chat-code-block">
            <pre><code>{codeText}</code></pre>
            <button
              type="button"
              className="code-copy-btn"
              onClick={() => navigator.clipboard.writeText(codeText)}
            >
              📋 Copy Code
            </button>
          </div>
        );
      }

      // Format bullet points and bold text
      const lines = part.split("\n");
      return (
        <div key={pIdx}>
          {lines.map((line, lIdx) => {
            let formattedLine = line;

            // Simple bold replacer
            const boldRegex = /\*\*(.*?)\*\*/g;
            const segments = [];
            let lastIndex = 0;
            let match;

            while ((match = boldRegex.exec(formattedLine)) !== null) {
              if (match.index > lastIndex) {
                segments.push(formattedLine.substring(lastIndex, match.index));
              }
              segments.push(<strong key={match.index}>{match[1]}</strong>);
              lastIndex = boldRegex.lastIndex;
            }
            if (lastIndex < formattedLine.length) {
              segments.push(formattedLine.substring(lastIndex));
            }

            if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
              return (
                <div key={lIdx} className="chat-bullet-line">
                  <span className="bullet-dot">•</span>
                  <span>{segments.length ? segments : line.replace(/^[\s-•]+/, "")}</span>
                </div>
              );
            }

            return (
              <p key={lIdx} className="chat-para">
                {segments.length ? segments : line}
              </p>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className={`chat-container ${isDrawer ? "chat-drawer-mode" : "chat-inline-mode"}`}>
      {/* Top Header */}
      <header className="chat-header">
        <div className="chat-brand-info">
          <div className="chat-avatar-head">
            <span className="ai-icon">🤖</span>
            <span className="status-indicator-dot online" />
          </div>
          <div>
            <h3 className="chat-title">Ollama AI Assistant</h3>
            <div className="chat-status-sub">
              {ollamaStatus.online ? (
                <span className="status-badge-online">🟢 Ollama Active</span>
              ) : (
                <span className="status-badge-offline">🔴 Ollama Offline</span>
              )}
            </div>
          </div>
        </div>

        <div className="chat-header-actions">
          {/* Model Selector */}
          <div className="model-selector-wrapper">
            <label htmlFor="ollama-model-select" className="model-select-label">Model:</label>
            <select
              id="ollama-model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="model-select"
            >
              {ollamaStatus.models && ollamaStatus.models.length > 0 ? (
                ollamaStatus.models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))
              ) : (
                <option value="qwen2.5:0.5b">qwen2.5:0.5b</option>
              )}
            </select>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="icon-action-btn"
            title="Clear Chat"
          >
            🗑️
          </button>

          {isDrawer && (
            <button
              type="button"
              onClick={onCloseDrawer}
              className="icon-action-btn close-drawer-btn"
              aria-label="Close Chat Drawer"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      {/* Loaded Context Banner */}
      {resumeContext && (
        <div className="chat-context-banner">
          <span className="banner-icon">📄</span>
          <div className="banner-text">
            <strong>Loaded:</strong> {resumeContext.filename || "Resume PDF"} &nbsp;·&nbsp;
            <strong>ATS Score:</strong> {resumeContext.analysis?.ats_score || "N/A"}/100 &nbsp;·&nbsp;
            <strong>Profile:</strong> {resumeContext.analysis?.candidate_profile || "Fresh Candidate"}
          </div>
        </div>
      )}

      {/* Suggested Prompts Bar */}
      <div className="suggested-prompts-row">
        {SUGGESTED_PROMPTS.map((promptText) => (
          <button
            key={promptText}
            type="button"
            className="prompt-chip"
            onClick={() => handleSend(promptText.replace(/^[^\w]+/, ""))}
            disabled={loading}
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="chat-messages-area">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-message-row ${msg.role === "user" ? "user-row" : "assistant-row"}`}
          >
            <div className="chat-avatar">
              {msg.role === "user" ? "👤" : "🤖"}
            </div>
            <div className={`chat-bubble ${msg.role === "user" ? "user-bubble" : "assistant-bubble"} ${msg.isError ? "error-bubble" : ""}`}>
              <div className="bubble-content">
                {renderFormattedContent(msg.content)}
              </div>
              <div className="bubble-meta">
                <span className="bubble-time">{msg.timestamp}</span>
                {msg.modelUsed && <span className="bubble-model">{msg.modelUsed}</span>}
                {msg.role === "assistant" && !msg.isError && (
                  <button
                    type="button"
                    className="copy-bubble-btn"
                    onClick={() => handleCopy(msg.content, idx)}
                  >
                    {copiedIndex === idx ? "✓ Copied" : "📋 Copy"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-message-row assistant-row">
            <div className="chat-avatar">🤖</div>
            <div className="chat-bubble assistant-bubble loading-bubble">
              <div className="typing-indicator">
                <span /><span /><span />
              </div>
              <span className="typing-text">Ollama is thinking...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <footer className="chat-input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Ollama about your resume, ATS improvements, or interview prep..."
          className="chat-textarea"
          rows={2}
          disabled={loading}
        />
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="chat-send-btn"
        >
          {loading ? "..." : "Send ➔"}
        </button>
      </footer>
    </div>
  );
}

export default AIChatBot;
