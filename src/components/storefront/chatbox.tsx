"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChatbotApiRequest } from "@/api-request/chatbot";
import { BookApiRequest } from "@/api-request/book";
import type { ChatMessage, ChatBook } from "@/types/chatbot";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  BookOpen,
  Loader2,
} from "lucide-react";

const INITIAL_QUICK_QUESTIONS = [
  "Sách bán chạy nhất hiện tại",
  "Sách dưới 100k",
  "Gợi ý sách hay",
  "Sách của Nguyễn Nhật Ánh",
];

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currency === "VND" ? "VND" : "VND",
    maximumFractionDigits: 0,
  }).format(price);
}

function BookCard({
  book,
  onOpenBook,
}: {
  book: ChatBook;
  onOpenBook: (book: ChatBook) => void;
}) {
  const cardContent = (
    <div className="border border-border rounded-lg p-3 bg-card hover:bg-accent/30 transition-colors">
      <div className="flex items-start gap-2">
        <BookOpen className="w-4 h-4 mt-0.5 text-primary shrink-0" />
        <div className="min-w-0">
          <p className="font-medium text-sm leading-tight line-clamp-2">
            {book.title}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              {book.category}
            </Badge>
            <span className="text-xs font-semibold text-primary">
              {formatPrice(book.price, book.currency)}
            </span>
            {book.stockQuantity !== undefined && (
              <span
                className={`text-xs ${book.available ? "text-green-600" : "text-destructive"}`}
              >
                {book.available ? `Còn ${book.stockQuantity} cuốn` : "Hết hàng"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <button
      type="button"
      onClick={() => onOpenBook(book)}
      className="block w-full text-left"
    >
      {cardContent}
    </button>
  );
}

function MessageBubble({
  message,
  onOpenBook,
}: {
  message: ChatMessage;
  onOpenBook: (book: ChatBook) => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-amber-100 text-amber-700 border border-amber-200"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] space-y-2 ${isUser ? "items-end" : "items-start"} flex flex-col`}
      >
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted rounded-tl-sm"
          }`}
        >
          {message.content}
        </div>

        {/* Book results */}
        {message.books && message.books.length > 0 && (
          <div className="w-full space-y-2">
            {message.books.map((book, i) => (
              <BookCard key={i} book={book} onOpenBook={onOpenBook} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Xin chào! Tôi là trợ lý sách của Readify 📚 Tôi có thể giúp bạn tìm sách theo giá, tác giả, thể loại hoặc gợi ý sách hay. Bạn cần tìm gì hôm nay?",
      quickQuestions: INITIAL_QUICK_QUESTIONS,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => scrollToBottom(false), 50);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const distanceToBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldAutoScrollRef.current = distanceToBottom < 80;
  };

  const openBookDetail = useCallback(
    async (book: ChatBook) => {
      if (book.slug) {
        setIsOpen(false);
        router.push(`/book/${book.slug}`);
        return;
      }

      try {
        const suggestionRes = await BookApiRequest.getSuggestions({
          q: book.title,
          limit: 5,
        });

        const rawSuggestions = suggestionRes?.payload?.data;
        const suggestions = Array.isArray(rawSuggestions) ? rawSuggestions : [];
        const normalizedTitle = book.title.trim().toLowerCase();
        const matched =
          suggestions.find(
            (item: { title?: string }) =>
              item.title?.trim().toLowerCase() === normalizedTitle,
          ) ?? suggestions[0];

        if (matched?.slug) {
          setIsOpen(false);
          router.push(`/book/${matched.slug}`);
        }
      } catch (error) {
        console.error("Cannot open book detail", error);
      }
    },
    [router],
  );

  const lastQuickQuestions =
    [...messages].reverse().find((m) => m.quickQuestions)?.quickQuestions ??
    INITIAL_QUICK_QUESTIONS;

  const sendMessage = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || isLoading) return;

      shouldAutoScrollRef.current = true;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: question,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const data = await ChatbotApiRequest.chat(question);
        const botMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.answer,
          books: data.books,
          quickQuestions: data.quickQuestions,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau nhé! 🙏",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Đóng chatbot" : "Mở chatbot"}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-8rem)] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">
                Trợ lý Readify
              </p>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <p className="text-xs opacity-80">Luôn sẵn sàng hỗ trợ</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="ml-auto opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            onScroll={handleMessagesScroll}
            className="flex-1 px-4 py-3 overflow-y-auto overscroll-contain"
          >
            <div className="space-y-4">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onOpenBook={openBookDetail}
                />
              ))}

              {isLoading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick question chips */}
          {lastQuickQuestions &&
            lastQuickQuestions.length > 0 &&
            !isLoading && (
              <div className="px-3 pb-2 flex gap-2 flex-wrap shrink-0">
                {lastQuickQuestions.slice(0, 3).map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-2.5 py-1 rounded-full border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors line-clamp-1 max-w-[200px] text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-3 py-3 border-t border-border shrink-0"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              disabled={isLoading}
              className="flex-1 text-sm h-9"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="h-9 w-9 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
