interface ChatMessage {
  role?: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

interface ChatRequest {
  message: string;
}

interface FunctionResult {
  args: Record<string, any>;
  function: string;
  result: {
    count?: number;
    data?: any[];
    source?: string;
    [key: string]: any;
  };
}

interface ChatResponse {
  conversation_id?: string;
  function_call_count?: number;
  function_calls?: string[];
  function_results?: FunctionResult[];
  response: string;
  // legacy alias used by some callers
  reply?: string;
  success: boolean;
  timestamp: string;
  user_id?: string;
  error?: string;
  // parsed version for UI consumption
  parsed?: any;
}

class ChatBotService {
  private baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  private async apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // Try absolute backend URL first (if configured), then fall back to same-origin `/api` route.
    const candidates: string[] = [];
    if (this.baseUrl && this.baseUrl.startsWith("http")) {
      candidates.push(`${this.baseUrl}/api${endpoint}`);
    }
    // Always try same-origin API route as a fallback. This is useful in dev when backend is proxied
    // through Next.js or when NEXT_PUBLIC_API_URL is not set.
    candidates.push(`/api${endpoint}`);

    let lastErr: any = null;
    let response: Response | null = null;

    for (const candidate of candidates) {
      try {
        response = await fetch(candidate, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...((options && (options as any).headers) || {}),
          },
          ...options,
        });

        // If fetch succeeded (even if 4xx/5xx), stop trying other candidates
        break;
      } catch (err: any) {
        // record and try next candidate
        lastErr = err;
        // continue to next candidate
      }
    }

    if (!response) {
      throw new Error(`Network request failed: ${lastErr?.message || String(lastErr)}`);
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP error! status: ${response.status}`);
    }

    // Some endpoints may return empty body
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      // @ts-ignore
      return (await response.text()) as T;
    }

    return response.json() as Promise<T>;
  }

  /**
   * Send a single chat message to the chatbot endpoint.
   * Endpoint: POST /api/ChatBot/chat
   */
  async sendMessage(req: ChatRequest): Promise<ChatResponse> {
    try {
      const payload = {
        message: req.message,
      };

      const res = await this.apiRequest<ChatResponse>(`/ChatBot/chat`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // Extract data from function_results for UI consumption
      if (res && res.function_results && res.function_results.length > 0) {
        const firstResult = res.function_results[0];
        (res as any).parsed = firstResult;
      }

      // Provide a backwards-compatible alias `reply` for callers expecting it
      try {
        if (res && typeof (res as any).reply === "undefined") {
          (res as any).reply = res.response;
        }
      } catch (e) {
        // ignore
      }

      return res;
    } catch (error: any) {
      console.error("ChatBot sendMessage error:", error);
      return {
        response: "Xin lỗi, chatbot tạm thời không phản hồi. Vui lòng thử lại sau.",
        success: false,
        timestamp: new Date().toISOString(),
        error: error?.message || String(error),
      };
    }
  }

  /**
   * Convenience method to send a user message and receive the assistant reply string directly.
   */
  async ask(message: string): Promise<{ reply: string; conversationId?: string; parsed?: any }> {
    const resp = await this.sendMessage({ message });
    return { 
      reply: resp.response, 
      conversationId: resp.conversation_id, 
      parsed: (resp as any).parsed 
    };
  }

  // Add more helper methods if your backend supports them (history, streaming, etc.)
}

export const chatBotService = new ChatBotService();
export type { ChatRequest, ChatResponse, ChatMessage };
