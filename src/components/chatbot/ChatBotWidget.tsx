"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { chatBotService } from "@/services/chatBotService";
import { MessageSquare, X, Send } from "lucide-react";

/**
 * Lightweight ChatBot floating widget inspired by Next.js DevIndicator.
 * - Small pill indicator at bottom-right
 * - Click to expand minimal chat panel
 * - Sends messages via `chatBotService.ask()`
 */
export default function ChatBotWidget() {
  const [open, setOpen] = useState(false);
  type UIMessage = {
    role: "user" | "assistant";
    content?: string;
    parsed?: any;
    timestamp: string;
  };

  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        // close only if open and click outside the panel and not on the indicator
        // keep it simple: don't auto-close for now
      }
    }

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggle = () => setOpen((v) => !v);

  const send = async () => {
    const text = input.trim();
    if (!text) return;

  const userMsg: UIMessage = { role: "user", content: text, timestamp: new Date().toISOString() };
  setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      const res = await chatBotService.sendMessage({ message: text });

      // If backend returned parsed data attach as parsed; otherwise return response string
      if (res && res.parsed) {
        const botMsg: UIMessage = { role: "assistant", parsed: res.parsed, timestamp: new Date().toISOString() };
        setMessages((m) => [...m, botMsg]);
      } else {
        const botMsg: UIMessage = { role: "assistant", content: res?.response || "", timestamp: new Date().toISOString() };
        setMessages((m) => [...m, botMsg]);
      }
    } catch (err) {
      const errMsg: UIMessage = {
        role: "assistant",
        content: "Xin lỗi, chatbot hiện đang gặp lỗi. Vui lòng thử lại sau.",
        timestamp: new Date().toISOString(),
      };
      setMessages((m) => [...m, errMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="pointer-events-none">
      {/* Floating indicator */}
      <div className="fixed right-4 bottom-4 z-[9999] flex items-center pointer-events-auto">
        {!open && (
          <button
            aria-label="Open chatbot"
            onClick={toggle}
            className="group flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-full shadow-lg hover:scale-105 transition-transform pointer-events-auto"
            title="ChatBot"
          >
            <span className="relative">
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <MessageSquare className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium">ChatBot</span>
          </button>
        )}

        {/* Panel */}
        {open && (
          <div
            ref={panelRef}
            className="w-80 md:w-[360px] max-h-[60vh] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-slate-700" />
                <span className="font-medium">ChatBot</span>
                <span className="text-xs text-slate-500">AI assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  aria-label="Close chat"
                  onClick={() => setOpen(false)}
                  className="p-1 rounded hover:bg-slate-100"
                >
                  <X className="h-4 w-4 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-3 space-y-3 bg-slate-50">
              {messages.length === 0 && (
                <div className="text-xs text-slate-500 text-center mt-6">
                  Xin chào! Hỏi tôi về tồn kho hoặc ghi chú nhanh về phụ tùng.
                </div>
              )}

              {messages.map((m, idx) => (
                <div key={idx} className={`max-w-full break-words ${m.role === "user" ? "self-end" : "self-start"}`}>
                  {m.parsed ? (
                    // Render parsed JSON as one or more cards
                    Array.isArray(m.parsed) ? (
                      m.parsed.map((item: any, i: number) => (
                        <Card key={i} className="mb-2">
                          <CardHeader>
                            <CardTitle className="text-sm">{item.name || item.title || `Item ${i + 1}`}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <pre className="whitespace-pre-wrap text-xs text-slate-700">{JSON.stringify(item, null, 2)}</pre>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card className="mb-2">
                        <CardHeader>
                          <CardTitle className="text-sm">{m.parsed?.name || m.parsed?.title || "Result"}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className="whitespace-pre-wrap text-xs text-slate-700">{JSON.stringify(m.parsed, null, 2)}</pre>
                        </CardContent>
                      </Card>
                    )
                  ) : (
                    <div
                      className={`px-3 py-2 rounded-lg ${m.role === "user" ? "bg-white text-slate-900" : "bg-slate-100 text-slate-800"}`}
                    >
                      <div className="text-sm">{m.content}</div>
                      <div className="text-[10px] text-slate-400 mt-1 text-right">{new Date(m.timestamp).toLocaleTimeString()}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 border-t bg-white">
              <div className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Gõ tin nhắn..."
                  className="flex-1"
                />
                <Button onClick={send} disabled={isSending || input.trim() === ""}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
