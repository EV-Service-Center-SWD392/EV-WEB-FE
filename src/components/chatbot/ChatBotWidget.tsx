"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { chatBotService } from "@/services/chatBotService";
import { MessageSquare, X, Send } from "lucide-react";
import JsonRenderer from "./JsonRenderer";
import { AISparepartSuggestion } from "../admin/sparepart/AISparepartSuggestion";

/**
 * Lightweight ChatBot floating widget inspired by Next.js DevIndicator.
 * - Small pill indicator at bottom-right
 * - Click to expand minimal chat panel
 * - Sends messages via `chatBotService.ask()`
 */
export default function ChatBotWidget() {
  const [open, setOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  type UIMessage = {
    role: "user" | "assistant";
    content?: string;
    parsed?: any;
    timestamp: string;
  };

  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Count cards in a message
  const countCards = React.useCallback((data: any): number => {
    if (!data) return 0;
    
    // Count spare parts cards
    if (data.function === "get_spare_parts" && data.result?.data) {
      return data.result.data.length;
    }
    
    // Count forecast cards
    if (data.function === "forecast_demand" && data.result?.forecast_result?.spare_parts_forecasts) {
      return data.result.forecast_result.spare_parts_forecasts.length + 1; // +1 for summary card
    }
    
    // Count array items as cards
    if (Array.isArray(data)) {
      return data.length;
    }
    
    return 0;
  }, []);

  // Check if current messages need expansion
  const shouldExpand = React.useMemo(() => {
    return messages.some(message => {
      if (!message.parsed) return false;
      const cardCount = countCards(message.parsed);
      return cardCount > 20;
    });
  }, [messages, countCards]);

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
    if (!text || isSending) return;

    const userMsg: UIMessage = { role: "user", content: text, timestamp: new Date().toISOString() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      const res = await chatBotService.sendMessage({ message: text });

      // Extract function results or use parsed data
      let parsedData = res.parsed;
      if (res.function_results && res.function_results.length > 0) {
        parsedData = res.function_results[0]; // Use first function result
      }
      
      if (parsedData) {
        const botMsg: UIMessage = { role: "assistant", parsed: parsedData, timestamp: new Date().toISOString() };
        setMessages((m) => [...m, botMsg]);
      } else {
        const botMsg: UIMessage = { role: "assistant", content: res?.response || "", timestamp: new Date().toISOString() };
        setMessages((m) => [...m, botMsg]);
      }
    } catch (error) {
      console.error("ChatBot error:", error);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
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
            className={`${shouldExpand ? 'w-[50vw] h-[85vh]' : 'w-80 md:w-[360px] max-h-[60vh]'} bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col transition-all duration-300`}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-slate-700" />
                <span className="font-medium">ChatBot</span>
                <span className="text-xs text-slate-500">AI assistant</span>
              </div>
              <div className="flex items-center gap-2">
                {shouldExpand && (
                  <button
                    aria-label="Collapse chat"
                    onClick={() => {
                      // Clear messages to reset expansion
                      setMessages([]);
                    }}
                    className="p-1 rounded hover:bg-slate-100 text-xs"
                    title="Xóa tin nhắn"
                  >
                    🗑️
                  </button>
                )}
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
                  <div className="mb-2">👋 Xin chào! Tôi có thể giúp bạn:</div>
                  <div className="text-left space-y-1 bg-slate-100 p-2 rounded">
                    <div>• Tìm kiếm phụ tùng</div>
                    <div>• Kiểm tra tồn kho</div>
                    <div>• Thông tin giá cả</div>
                    <div>• Trạng thái đơn hàng</div>
                  </div>
                </div>
              )}

              {messages.map((m, idx) => {
                const isCreateSparepartResponse = m.parsed?.result?.action === "create_sparepart_form" || 
                  (m.parsed && typeof m.parsed === 'object' && 'function_results' in m.parsed && 
                   m.parsed.function_results?.[0]?.result?.action === "create_sparepart_form");
                
                return (
                  <div key={idx} className={`max-w-full break-words ${m.role === "user" ? "self-end" : "self-start"}`}>
                    {isCreateSparepartResponse ? (
                      <AISparepartSuggestion 
                        aiResponse={m.parsed.function_results ? m.parsed : { function_results: [{ result: m.parsed.result }] }}
                        onSuccess={() => {
                          // Sparepart created successfully
                        }}
                      />
                    ) : m.parsed ? (
                      <div className="mb-2">
                        <JsonRenderer data={m.parsed} />
                      </div>
                    ) : (
                      <div
                        className={`px-3 py-2 rounded-lg ${m.role === "user" ? "bg-white text-slate-900" : "bg-slate-100 text-slate-800"}`}
                      >
                        <div className="text-sm">{m.content}</div>
                        <div className="text-[10px] text-slate-400 mt-1 text-right">{new Date(m.timestamp).toLocaleTimeString()}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-3 border-t bg-white">
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onCompositionStart={() => setIsComposing(true)}
                  onCompositionEnd={() => setIsComposing(false)}
                  placeholder="Gõ tin nhắn..."
                  className="flex-1 min-h-[40px] max-h-[120px] resize-none border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={1}
                  style={{
                    height: "auto",
                    minHeight: "40px",
                    maxHeight: "120px",
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = Math.min(target.scrollHeight, 120) + "px";
                  }}
                />
                <Button 
                  onClick={send} 
                  disabled={isSending || input.trim() === ""}
                  className="h-10 w-10 p-0 flex-shrink-0"
                >
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
