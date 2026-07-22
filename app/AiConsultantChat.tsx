"use client";

import { Bot, MessageCircle, Minimize2, Phone, Send, User, X, Zap } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { company } from "../data/company";
import { services } from "../data/services";

type ChatRole = "assistant" | "user";
type ChatMessage = { id: string; role: ChatRole; text: string };
type LeadProfile = { name: string; phone: string; need: string };

type AiConsultantChatProps = {
  currentPath: string;
  openToken: number;
};

const storageKey = "dst-ai-chat-history-v2";

function getRuntimeApiUrl() {
  if (typeof window === "undefined") return "/api/chat";
  const config = (window as Window & { __DST_CHAT_CONFIG__?: { apiUrl?: string } }).__DST_CHAT_CONFIG__;
  return config?.apiUrl || "/api/chat";
}

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function serviceFromPath(path: string) {
  return services.find((service) => path.endsWith(`/dich-vu/${service.slug}`));
}

function greetingsFor(path: string) {
  const service = serviceFromPath(path);
  return service
    ? `Xin chào, tôi là trợ lý tư vấn DST Group. Bạn đang xem dịch vụ ${service.title}. Bạn muốn trao đổi về mục tiêu, hạng mục hay cách triển khai?`
    : "Xin chào, tôi là trợ lý tư vấn DST Group. Bạn có thể mô tả mục tiêu hoặc chọn một câu hỏi nhanh để tôi gợi ý dịch vụ phù hợp.";
}

function quickQuestionsFor(path: string) {
  const service = serviceFromPath(path);
  if (service) return [
    `Dịch vụ ${service.title} phù hợp khi nào?`,
    `Các hạng mục của ${service.title} gồm gì?`,
    "Tôi muốn nhận tư vấn theo mục tiêu kinh doanh",
  ];
  if (path.startsWith("/du-an")) return ["DST có dự án tương tự ngành của tôi không?", "Tôi muốn trao đổi về case study phù hợp", "Quy trình bắt đầu một dự án là gì?"];
  if (path.startsWith("/tuyen-dung")) return ["DST đang có vị trí nào?", "Tôi muốn hỏi về môi trường làm việc", "Tôi muốn ứng tuyển một vị trí phù hợp"];
  return ["Tôi muốn chạy quảng cáo", "Tư vấn TikTok Shop", "Cần thiết kế website", "Tôi cần Media hoặc Branding"];
}

function buildLocalAnswer(question: string, path: string) {
  const directService = serviceFromPath(path);
  const text = normalize(question);
  const matched = directService || services.find((service) => {
    const haystack = normalize([service.title, service.summary, ...service.tags].join(" "));
    return haystack.split(/\s+/).some((word) => word.length > 3 && text.includes(word));
  });

  if (!matched) {
    return "DST Group có thể trao đổi về Marketing, Media, Branding, Website, truyền thông và sự kiện. Bạn cho tôi biết ngành hàng, mục tiêu ưu tiên và thời gian dự kiến để tôi gợi ý hướng phù hợp. Nếu cần phản hồi nhanh, bạn có thể chuyển sang Zalo hoặc gọi trực tiếp.";
  }
  return [
    `Với nhu cầu này, ${matched.title} có thể phù hợp. ${matched.summary}`,
    `Hạng mục thường được trao đổi gồm: ${matched.deliverables.slice(0, 3).join(", ")}.`,
    "DST sẽ cần làm rõ ngành hàng, mục tiêu và phạm vi trước khi đề xuất phương án cụ thể. Bạn có thể để lại yêu cầu tư vấn hoặc liên hệ Zalo để trao đổi nhanh hơn.",
  ].join("\n\n");
}

async function requestAiAnswer(messages: ChatMessage[], lead: LeadProfile, currentPath: string) {
  const apiUrl = getRuntimeApiUrl();
  if (!apiUrl) throw new Error("CHAT_PROXY_MISSING");
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.slice(-8).map(({ role, text }) => ({ role, content: text })),
      lead,
      pageContext: currentPath,
      services: services.map(({ title, summary, tags, deliverables }) => ({ title, summary, tags, deliverables })),
    }),
  });
  if (!response.ok) throw new Error(`CHAT_PROXY_${response.status}`);
  const data = (await response.json()) as { answer?: string };
  if (!data.answer) throw new Error("CHAT_EMPTY_RESPONSE");
  return data.answer;
}

export function AiConsultantChat({ currentPath, openToken }: AiConsultantChatProps) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: "welcome", role: "assistant", text: greetingsFor(currentPath) }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fallbackNotice, setFallbackNotice] = useState("");
  const [historyReady, setHistoryReady] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const messageCounter = useRef(0);
  const quickQuestions = useMemo(() => quickQuestionsFor(currentPath), [currentPath]);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(storageKey);
        const parsed = saved ? JSON.parse(saved) as ChatMessage[] : [];
        if (Array.isArray(parsed) && parsed.length) {
          messageCounter.current = parsed.length;
          setMessages(parsed.slice(-20));
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      } finally {
        setHistoryReady(true);
      }
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    if (!historyReady) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(messages.slice(-20)));
    } catch {
      // Local persistence is optional; chat still works without it.
    }
  }, [historyReady, messages]);

  useEffect(() => {
    if (!openToken) return;
    const frame = window.requestAnimationFrame(() => {
      setDismissed(false);
      setOpen(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [openToken]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(timer);
    };
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  function appendMessage(role: ChatRole, text: string) {
    messageCounter.current += 1;
    const message = { id: `${role}-${messageCounter.current}`, role, text };
    setMessages((current) => [...current, message]);
    return message;
  }

  async function sendQuestion(rawQuestion: string) {
    const question = rawQuestion.trim();
    if (!question || loading) return;
    setFallbackNotice("");
    const userMessage = appendMessage("user", question);
    setInput("");
    setLoading(true);
    const nextMessages = [...messages, userMessage];
    try {
      const answer = await requestAiAnswer(nextMessages, { name: "", phone: "", need: question }, currentPath);
      appendMessage("assistant", answer);
    } catch {
      appendMessage("assistant", buildLocalAnswer(question, currentPath));
      setFallbackNotice("AI trực tuyến đang không khả dụng; trợ lý đang dùng thông tin dịch vụ có sẵn để hỗ trợ bạn.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendQuestion(input);
  }

  if (dismissed) {
    return <button className="ai-chat-restore" type="button" onClick={() => { setDismissed(false); setOpen(true); }} aria-label="Mở lại AI Chat"><Bot size={20} aria-hidden="true" /></button>;
  }

  return (
    <section className={`ai-chat ${open ? "is-open" : ""}`} aria-label="Trợ lý tư vấn DST Group">
      {open ? (
        <div className="ai-chat-panel" role="dialog" aria-modal="false" aria-label="AI Chat tư vấn DST Group">
          <header className="ai-chat-header">
            <div><span><Bot size={17} aria-hidden="true" />AI tư vấn DST</span><p>Marketing, Media, Branding</p></div>
            <div className="ai-chat-actions">
              <button type="button" onClick={() => setOpen(false)} aria-label="Thu nhỏ chat" title="Thu nhỏ"><Minimize2 size={18} aria-hidden="true" /></button>
              <button type="button" onClick={() => setDismissed(true)} aria-label="Đóng chat" title="Đóng chat"><X size={18} aria-hidden="true" /></button>
            </div>
          </header>
          <div className="ai-chat-messages" aria-live="polite" ref={scrollRef}>
            {messages.map((message) => <article className={`ai-message ${message.role}`} key={message.id}><span>{message.role === "assistant" ? <Bot size={15} /> : <User size={15} />}</span><p>{message.text}</p></article>)}
            {loading ? <article className="ai-message assistant"><span><Bot size={15} /></span><p>Đang xem lại nhu cầu của bạn...</p></article> : null}
          </div>
          {fallbackNotice ? <p className="ai-fallback-notice" role="status">{fallbackNotice}</p> : null}
          <div className="ai-quick-list" aria-label="Câu hỏi nhanh">{quickQuestions.map((question) => <button type="button" key={question} onClick={() => void sendQuestion(question)}>{question}</button>)}</div>
          <form className="ai-chat-input" onSubmit={onSubmit}>
            <input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Nhập câu hỏi tư vấn..." aria-label="Nhập câu hỏi tư vấn" maxLength={800} />
            <button type="submit" disabled={!input.trim() || loading} aria-label="Gửi câu hỏi"><Send size={17} aria-hidden="true" /></button>
          </form>
          <div className="ai-chat-fallback"><a href={company.zaloUrl} target="_blank" rel="noreferrer">Chat Zalo</a><a href={`tel:${company.phone}`}><Phone size={15} aria-hidden="true" />{company.phoneDisplay}</a></div>
        </div>
      ) : null}
      <button className="ai-chat-toggle" type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-label={open ? "Thu nhỏ AI Chat" : "Mở AI Chat"}>
        <MessageCircle size={22} aria-hidden="true" /><span><strong>Tư vấn AI</strong><small>Phản hồi nhanh</small></span><Zap size={16} aria-hidden="true" />
      </button>
    </section>
  );
}
