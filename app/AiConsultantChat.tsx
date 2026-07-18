"use client";

import { Bot, MessageCircle, Phone, Send, User, X, Zap } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { services } from "./site-data";

type ChatRole = "assistant" | "user";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

type LeadProfile = {
  name: string;
  phone: string;
  need: string;
};

const CONTACT_PHONE = "0328247888";
const ZALO_URL = "https://zalo.me/0328247888";

const serviceKnowledge = services.map((service) => ({
  title: service.title,
  summary: service.text,
  fit: service.fit,
  deliverables: service.deliverables,
  tags: service.tags,
}));

const quickQuestions = [
  "Tôi muốn chạy quảng cáo",
  "Tư vấn TikTok Shop",
  "Cần thiết kế website",
  "Báo giá media/branding",
];

const greetings =
  "Xin chào, tôi là trợ lý tư vấn DST Group. Bạn có thể chọn câu hỏi nhanh hoặc nhập nhu cầu để tôi gợi ý dịch vụ phù hợp.";

function getRuntimeApiUrl() {
  if (typeof window === "undefined") return "/api/chat";
  const config = (window as Window & { __DST_CHAT_CONFIG__?: { apiUrl?: string } }).__DST_CHAT_CONFIG__;
  return config?.apiUrl ?? "/api/chat";
}

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function buildLocalAnswer(question: string, lead: LeadProfile) {
  const text = normalize(`${question} ${lead.need}`);
  const matched =
    serviceKnowledge.find((service) => {
      const haystack = normalize([service.title, service.summary, service.tags.join(" ")].join(" "));
      return haystack.split(/\s+/).some((word) => word.length > 3 && text.includes(word));
    }) ??
    serviceKnowledge.find((service) =>
      service.tags.some((tag) => text.includes(normalize(tag).split(/\s+/)[0])),
    );

  if (!matched) {
    return [
      "DST Group có thể tư vấn tổng thể về Marketing, Media, Branding, TikTok Shop, website, content và quảng cáo đa nền tảng.",
      "Bạn cho tôi biết ngành hàng, mục tiêu và ngân sách dự kiến. Nếu cần xử lý nhanh, hãy liên hệ Zalo hoặc gọi trực tiếp để được tư vấn chi tiết hơn.",
    ].join("\n\n");
  }

  return [
    `Với nhu cầu này, dịch vụ phù hợp nhất là ${matched.title}. ${matched.summary}`,
    `Phù hợp với: ${matched.fit}`,
    `Hạng mục thường bàn giao: ${matched.deliverables.slice(0, 3).join(", ")}.`,
    "Nếu bạn muốn tư vấn nhanh hơn theo ngành hàng, mục tiêu và ngân sách, hãy chọn Chat Zalo hoặc gọi trực tiếp cho DST.",
  ].join("\n\n");
}

async function requestAiAnswer(messages: ChatMessage[], lead: LeadProfile) {
  const apiUrl = getRuntimeApiUrl();
  if (!apiUrl) throw new Error("Chat proxy is not configured");
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.slice(-8).map(({ role, text }) => ({ role, content: text })),
      lead,
      services: serviceKnowledge,
    }),
  });

  if (!response.ok) throw new Error(`Chat proxy failed: ${response.status}`);
  const data = (await response.json()) as { answer?: string };
  if (!data.answer) throw new Error("Chat proxy returned no answer");
  return data.answer;
}

export function AiConsultantChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "assistant", text: greetings },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messageIdRef = useRef(0);

  function pushMessage(role: ChatRole, text: string) {
    messageIdRef.current += 1;
    const message = { id: `${role}-${messageIdRef.current}`, role, text };
    setMessages((current) => [...current, message]);
    return message;
  }

  async function sendQuestion(rawQuestion: string) {
    const question = rawQuestion.trim();
    if (!question || loading) return;

    const userMessage = pushMessage("user", question);
    setInput("");
    setLoading(true);

    const nextMessages = [...messages, userMessage];

    try {
      const aiAnswer = await requestAiAnswer(nextMessages, { name: "", phone: "", need: question });
      pushMessage("assistant", aiAnswer);
    } catch {
      pushMessage("assistant", buildLocalAnswer(question, { name: "", phone: "", need: question }));
    } finally {
      setLoading(false);
      window.setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendQuestion(input);
  }

  return (
    <section className={`ai-chat ${open ? "is-open" : ""}`} aria-label="Trợ lý tư vấn DST Group">
      {open ? (
        <div className="ai-chat-panel" role="dialog" aria-modal="false" aria-label="Chat tư vấn DST Group">
          <header className="ai-chat-header">
            <div>
              <span>
                <Bot size={17} /> AI tư vấn DST
              </span>
              <p>Marketing, Media, Branding</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Đóng chat tư vấn">
              <X size={18} />
            </button>
          </header>

          <div className="ai-chat-messages" aria-live="polite">
            {messages.map((message) => (
              <article className={`ai-message ${message.role}`} key={message.id}>
                <span>{message.role === "assistant" ? <Bot size={15} /> : <User size={15} />}</span>
                <p>{message.text}</p>
              </article>
            ))}
            {loading ? (
              <article className="ai-message assistant">
                <span>
                  <Bot size={15} />
                </span>
                <p>Đang kiểm tra nhu cầu và dữ liệu dịch vụ...</p>
              </article>
            ) : null}
          </div>

          <div className="ai-quick-list" aria-label="Câu hỏi nhanh">
            {quickQuestions.map((question) => (
              <button key={question} onClick={() => sendQuestion(question)}>
                {question}
              </button>
            ))}
          </div>

          <form className="ai-chat-input" onSubmit={onSubmit}>
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Nhập câu hỏi tư vấn..."
              aria-label="Nhập câu hỏi tư vấn"
            />
            <button type="submit" disabled={!input.trim() || loading} aria-label="Gửi câu hỏi">
              <Send size={17} />
            </button>
          </form>

          <div className="ai-chat-fallback">
            <a href={ZALO_URL} target="_blank" rel="noreferrer">
              Chat Zalo
            </a>
            <a href={`tel:${CONTACT_PHONE}`}>
              <Phone size={15} /> {CONTACT_PHONE}
            </a>
          </div>
        </div>
      ) : null}

      <button className="ai-chat-toggle" onClick={() => setOpen((current) => !current)} aria-expanded={open}>
        <MessageCircle size={22} />
        <span>
          <strong>Tư vấn AI</strong>
          <small>Phản hồi nhanh</small>
        </span>
        <Zap size={16} />
      </button>
    </section>
  );
}
