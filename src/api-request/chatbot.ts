import type { ChatResponse } from "@/types/chatbot";

export const ChatbotApiRequest = {
  async chat(question: string): Promise<ChatResponse> {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? `Error ${res.status}`);
    }

    return res.json() as Promise<ChatResponse>;
  },
};
