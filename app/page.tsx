"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send,
  Loader2,
  Minimize2,
  Maximize2,
  User,
  Bot,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCcw,
  Check,
} from "lucide-react";

export default function Page() {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string; id: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  // Handle message submission
  const handleSubmit = async (e: React.FormEvent, regenerateMsg?: string) => {
    e.preventDefault();
    const query = regenerateMsg || input;
    if (!query.trim()) return;
    
    const userMessage = {
      role: "user",
      content: query,
      id: Date.now().toString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    if (!regenerateMsg) setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value);
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== "assistant-temp"),
          { role: "assistant", content: assistantContent, id: "assistant-temp" },
        ]);
      }

      // Finalize assistant message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === "assistant-temp"
            ? { ...m, id: Date.now().toString() }
            : m
        )
      );
    } catch (err) {
      console.error("Error fetching AI response:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };
  // Main render
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-gray-200 overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent" />
      {/* Main container */}
      <main className="relative min-h-screen flex flex-col items-center justify-center p-4">
        {/* Chat Interface */}
        <div
          className={`relative w-full max-w-5xl transition-all duration-500 ease-in-out ${
            isExpanded ? "h-[80vh]" : "h-[60vh]"
          }`}
        >
          {/* Glass Effect */}
          <div className="absolute inset-0 backdrop-blur-2xl bg-white/5 rounded-3xl border border-white/10 shadow-[0_0_100px_-15px] shadow-purple-500/20" />

          {/* Header */}
          <div className="relative p-6 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
              <h1 className="text-lg font-light tracking-wider">My ChatApp</h1>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
          </div>

          {/* Chat Window */}
          <div className="relative h-[calc(100%-8rem)] overflow-y-auto overscroll-contain p-6 pb-20 space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
                <p className="max-w-md text-gray-400">
                  Welcome to My ChatApp! Start the conversation by typing a message below.
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className="space-y-1">
                <div
                  className={`flex items-start gap-3 ${
                    message.role === "assistant" ? "justify-start" : "justify-end"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex flex-col items-center">
                      <div className="p-2 bg-purple-500/20 rounded-full">
                        <Bot size={18} className="text-purple-400" />
                      </div>
                      <span className="text-xs text-gray-400 mt-1">MYBOT</span>
                    </div>
                  )}

                  <div
                    className={`p-4 rounded-3xl max-w-[70%] ${
                      message.role === "assistant"
                        ? "bg-purple-500/10 rounded-tl-sm text-left"
                        : "bg-white/5 rounded-tr-sm text-right"
                    }`}
                  >
                    {message.content}
                  </div>

                  {message.role === "user" && (
                    <div className="flex flex-col items-center">
                      <div className="p-2 bg-white/10 rounded-full">
                        <User size={18} className="text-gray-300" />
                      </div>
                      <span className="text-xs text-gray-400 mt-1">You</span>
                    </div>
                  )}
                </div>

                {/* Actions only for assistant messages */}
                {message.role === "assistant" && (
                  <div className="flex gap-3 ml-10 text-gray-400 text-sm opacity-70 hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(message.id, message.content)}
                      className="flex items-center gap-1 hover:text-white"
                    >
                      {copiedId === message.id ? (
                        <Check size={14} />
                      ) : (
                        <Copy size={14} />
                      )}
                      {copiedId === message.id ? "Copied" : "Copy"}
                    </button>
                    <button className="flex items-center gap-1 hover:text-white">
                      <ThumbsUp size={14} /> Like
                    </button>
                    <button className="flex items-center gap-1 hover:text-white">
                      <ThumbsDown size={14} /> Dislike
                    </button>
                    <button
                      onClick={(e) => handleSubmit(e, message.content)}
                      className="flex items-center gap-1 hover:text-white"
                    >
                      <RefreshCcw size={14} /> Regenerate
                    </button>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="p-2 bg-purple-500/20 rounded-full">
                    <Bot size={18} className="text-purple-400 animate-pulse" />
                  </div>
                  <span className="text-xs text-gray-400 mt-1">MyBot</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 size={16} className="animate-spin text-purple-500" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10 bg-gray-950/80 backdrop-blur-md z-10"
          >
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-gray-500"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-white/5 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

