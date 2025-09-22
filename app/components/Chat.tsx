"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useState, useRef, useEffect } from "react"
import {
  Send,
  Loader2,
  Minimize2,
  Maximize2,
  User,
  Bot,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Search,
  Cloud,
  Wind,
  Droplets,
} from "lucide-react"

export default function Chat() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  const [input, setInput] = useState("")
  const [isExpanded, setIsExpanded] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const renderContent = (message: any) => {
    if (!message.parts) return ""

    return message.parts.map((part: any, index: number) => {
      switch (part.type) {
        case "text":
          return <span key={index}>{part.text}</span>

        case "tool-search":
          if (part.state === "input-available") {
            return (
              <div key={index} className="flex items-center gap-2 text-blue-400 text-sm mb-2">
                <Search size={16} className="animate-pulse" />
                Searching for: <span className="font-medium">{part.input.query}</span>
              </div>
            )
          }
          if (part.state === "output-available") {
            return (
              <div key={index} className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg text-sm mb-2">
                <div className="flex items-center gap-2 text-blue-400 mb-3">
                  <Search size={16} />
                  <span className="font-medium">Search Results</span>
                </div>
                <pre className="whitespace-pre-wrap text-gray-300 leading-relaxed">{part.output.results}</pre>
                <div className="text-xs text-gray-500 mt-2">
                  Searched at {new Date(part.output.timestamp).toLocaleTimeString()}
                </div>
              </div>
            )
          }
          break

        case "tool-weather":
          if (part.state === "input-available") {
            return (
              <div key={index} className="flex items-center gap-2 text-green-400 text-sm mb-2">
                <Cloud size={16} className="animate-pulse" />
                Getting weather for: <span className="font-medium">{part.input.location}</span>
              </div>
            )
          }
          if (part.state === "output-available") {
            return (
              <div key={index} className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg text-sm mb-2">
                <div className="flex items-center gap-2 text-green-400 mb-3">
                  <Cloud size={16} />
                  <span className="font-medium">Weather Information</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Location:</span>
                    <span className="font-medium">{part.output.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Temperature:</span>
                    <span className="font-medium">{part.output.temperature}°C</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Condition:</span>
                    <span className="font-medium capitalize">{part.output.condition}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets size={14} className="text-blue-400" />
                    <span className="text-gray-400">Humidity:</span>
                    <span className="font-medium">{part.output.humidity}%</span>
                  </div>
                  {part.output.windSpeed && (
                    <div className="flex items-center gap-2 col-span-2">
                      <Wind size={14} className="text-gray-400" />
                      <span className="text-gray-400">Wind Speed:</span>
                      <span className="font-medium">{part.output.windSpeed} km/h</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-3">
                  Updated at {new Date(part.output.timestamp).toLocaleTimeString()}
                </div>
              </div>
            )
          }
          break

        default:
          return null
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || status === "streaming") return

    sendMessage({ text: input })
    setInput("")
  }

  // Copy functionality
  const handleCopy = (id: string, content: any) => {
    const textContent =
      content.parts
        ?.filter((p: any) => p.type === "text")
        ?.map((p: any) => p.text)
        ?.join(" ") || ""

    navigator.clipboard.writeText(textContent)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-gray-200 overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent" />

      <main className="relative min-h-screen flex flex-col items-center justify-center p-4">
        <div
          className={`relative w-full max-w-5xl transition-all duration-500 ease-in-out ${
            isExpanded ? "h-[80vh]" : "h-[60vh]"
          }`}
        >
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
                  Welcome to AI Chat! I can help you search the internet, get weather information, and answer questions.
                  Try asking me something!
                </p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="px-3 py-1 bg-blue-500/20 rounded-full text-blue-300">Web Search</span>
                  <span className="px-3 py-1 bg-green-500/20 rounded-full text-green-300">Get Weather</span>
                  <span className="px-3 py-1 bg-purple-500/20 rounded-full text-purple-300">Ask Questions</span>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className="space-y-1">
                <div
                  className={`flex items-start gap-3 ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                >
                  {/* Assistant avatar */}
                  {message.role === "assistant" && (
                    <div className="flex flex-col items-center">
                      <div className="p-2 bg-purple-500/20 rounded-full">
                        <Bot size={18} className="text-purple-400" />
                      </div>
                      <span className="text-xs text-gray-400 mt-1">MyBot</span>
                    </div>
                  )}

                  {/* Message bubble */}
                  <div
                    className={`p-4 rounded-3xl max-w-[70%] ${
                      message.role === "assistant"
                        ? "bg-purple-500/10 rounded-tl-sm text-left"
                        : "bg-white/5 rounded-tr-sm text-right"
                    }`}
                  >
                    <div className="space-y-2">{renderContent(message)}</div>
                  </div>

                  {/* User avatar */}
                  {message.role === "user" && (
                    <div className="flex flex-col items-center">
                      <div className="p-2 bg-white/10 rounded-full">
                        <User size={18} className="text-gray-300" />
                      </div>
                      <span className="text-xs text-gray-400 mt-1">You</span>
                    </div>
                  )}
                </div>

                {/* Actions (assistant only) */}
                {message.role === "assistant" && (
                  <div className="flex gap-3 ml-10 text-gray-400 text-sm opacity-70 hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(message.id, message)}
                      className="flex items-center gap-1 hover:text-white"
                    >
                      {copiedId === message.id ? <Check size={14} /> : <Copy size={14} />}
                      {copiedId === message.id ? "Copied" : "Copy"}
                    </button>
                    <button className="flex items-center gap-1 hover:text-white">
                      <ThumbsUp size={14} /> Like
                    </button>
                    <button className="flex items-center gap-1 hover:text-white">
                      <ThumbsDown size={14} /> Dislike
                    </button>
                  </div>
                )}
              </div>
            ))}

            {status === "streaming" && (
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
                placeholder="Ask me anything... Try 'search for latest AI news' or 'weather in Tokyo'"
                onChange={(e) => setInput(e.currentTarget.value)}
                disabled={status === "streaming"}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-gray-500 disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={status === "streaming" || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-white/5 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
