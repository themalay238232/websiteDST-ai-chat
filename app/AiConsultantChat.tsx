"use client";

import { Bot, MessageCircle, Phone, Send, User, X, Zap } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { services } from "./site-data";

type ChatRole = "assistant" | "user";
type ChatImage = { id: string; url: string; alt: string; caption: string; sourceUrl?: string };
type ChatMessage = { id: string; role: ChatRole; text: string; images?: ChatImage[] };
type LeadProfile = { name: string; phone: string; need: string };

const CONTACT_PHONE = "0328247888";
const ZALO_URL = "https://zalo.me/0328247888";
const WEB_CHAT_ENDPOINT = "https://dst-group-messenger-ai.longv7393.workers.dev/api/web-chat";
const CHAT_HISTORY_KEY = "dst-ai-chat-history-v2";
const CHAT_SESSION_KEY = "dst-web-chat-session-v1";

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
  "Cho tôi xem ảnh dự án khách sạn",
];

const greetings =
  "Xin chào, tôi là trợ lý tư vấn DST Group. Bạn có thể chọn câu hỏi nhanh hoặc nhập nhu cầu để tôi gợi ý dịch vụ phù hợp.";

function getRuntimeApiUrl() {
  if (typeof window === "undefined") return WEB_CHAT_ENDPOINT;
  const config = (window as Window & { __DST_CHAT_CONFIG__?: { apiUrl?: string } }).__DST_CHAT_CONFIG__;
  return config?.apiUrl || WEB_CHAT_ENDPOINT;
}

function getSessionId() {
  const stored = window.localStorage.getItem(CHAT_SESSION_KEY);
  if (stored) return stored;
  const sessionId = crypto.randomUUID();
  window.localStorage.setItem(CHAT_SESSION_KEY, sessionId);
  return sessionId;
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

async function requestAiAnswer(message: string) {
  const response = await fetch(getRuntimeApiUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: getSessionId(),
      message,
      pageContext: window.location.pathname.slice(0, 160),
    }),
  });

  if (!response.ok) throw new Error(`CHAT_PROXY_${response.status}`);
  const data = (await response.json()) as { answer?: string; images?: ChatImage[] };
  if (!data.answer) throw new Error("CHAT_EMPTY_RESPONSE");
  return { answer: data.answer, images: Array.isArray(data.images) ? data.images.slice(0, 2) : [] };
}

export function AiConsultantChat() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "assistant", text: greetings },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fallbackNotice, setFallbackNotice] = useState("");
  const [failedQuestion, setFailedQuestion] = useState("");
  const [historyReady, setHistoryReady] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const messageIdRef = useRef(0);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(CHAT_HISTORY_KEY);
        const parsed = saved ? (JSON.parse(saved) as ChatMessage[]) : [];
        if (Array.isArray(parsed) && parsed.length) {
          messageIdRef.current = parsed.length;
          setMessages(parsed.slice(-20));
        }
      } catch {
        window.localStorage.removeItem(CHAT_HISTORY_KEY);
      } finally {
        setHistoryReady(true);
      }
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    if (!historyReady) return;
    try {
      window.localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages.slice(-20)));
    } catch {
      // Chat vẫn hoạt động nếu trình duyệt không cho lưu lịch sử cục bộ.
    }
  }, [historyReady, messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  function pushMessage(role: ChatRole, text: string, images: ChatImage[] = []) {
    messageIdRef.current += 1;
    const message: ChatMessage = {
      id: `${role}-${messageIdRef.current}`,
      role,
      text,
      ...(images.length ? { images } : {}),
    };
    setMessages((current) => [...current, message]);
  }

  async function sendQuestion(rawQuestion: string, appendUser = true) {
    const question = rawQuestion.trim();
    if (!question || loading) return;
    setFallbackNotice("");
    setFailedQuestion("");
    if (appendUser) pushMessage("user", question);
    setInput("");
    setLoading(true);

    try {
      const result = await requestAiAnswer(question);
      pushMessage("assistant", result.answer, result.images);
    } catch {
      pushMessage("assistant", buildLocalAnswer(question, { name: "", phone: "", need: question }));
      setFailedQuestion(question);
      setFallbackNotice("Kết nối AI đang gián đoạn. Bạn có thể thử lại hoặc tiếp tục bằng thông tin dịch vụ có sẵn.");
    } finally {
      setLoading(false);
      window.setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendQuestion(input);
  }

  return (
    <section className={`ai-chat ${open ? "is-open" : ""}`} aria-label="Trợ lý tư vấn DST Group">
      <AnimatePresence>
        {open ? (
          <motion.div
            className="ai-chat-panel"
            role="dialog"
            aria-modal="false"
            aria-label="Chat tư vấn DST Group"
            initial={reduce ? false : { opacity: 0, y: 28, rotateX: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 18, rotateX: 8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.65 }}
            style={{ transformPerspective: 1200, transformOrigin: "bottom right" }}
          >
            <header className="ai-chat-header">
              <div>
                <span><Bot size={17} /> AI tư vấn DST</span>
                <p>Marketing, Media, Branding</p>
                <div className="ai-status"><i aria-hidden="true" /> Trực tuyến</div>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Đóng chat tư vấn"><X size={18} /></button>
            </header>

            <div className="ai-chat-messages" aria-live="polite" ref={scrollRef}>
              {messages.map((message) => (
                <motion.article
                  className={`ai-message ${message.role}`}
                  key={message.id}
                  initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span>{message.role === "assistant" ? <Bot size={15} /> : <User size={15} />}</span>
                  <div className="ai-message-body">
                    <p>{message.text}</p>
                    {message.images?.length ? (
                      <div className="ai-message-images" aria-label="Ảnh tư vấn phù hợp">
                        {message.images.map((image) => (
                          <figure key={image.id}>
                            <img src={image.url} alt={image.alt} loading="lazy" />
                            <figcaption>{image.caption}</figcaption>
                            {image.sourceUrl ? <a href={image.sourceUrl} target="_blank" rel="noreferrer">Xem nguồn ảnh</a> : null}
                          </figure>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </motion.article>
              ))}
              {loading ? (
                <article className="ai-message assistant">
                  <span><Bot size={15} /></span>
                  <p><span className="ai-typing" aria-label="Đang soạn trả lời"><i /><i /><i /></span></p>
                </article>
              ) : null}
            </div>

            {fallbackNotice ? (
              <div className="ai-fallback-notice" role="status">
                <span>{fallbackNotice}</span>
                {failedQuestion ? <button type="button" onClick={() => void sendQuestion(failedQuestion, false)}>Thử lại</button> : null}
              </div>
            ) : null}

            <div className="ai-quick-list" aria-label="Câu hỏi nhanh">
              {quickQuestions.map((question) => (
                <button type="button" key={question} onClick={() => void sendQuestion(question)}>{question}</button>
              ))}
            </div>

            <form className="ai-chat-input" onSubmit={onSubmit}>
              <input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Nhập câu hỏi tư vấn..." aria-label="Nhập câu hỏi tư vấn" maxLength={800} />
              <button type="submit" disabled={!input.trim() || loading} aria-label="Gửi câu hỏi"><Send size={17} /></button>
            </form>

            <div className="ai-chat-fallback">
              <a href={ZALO_URL} target="_blank" rel="noreferrer">Chat Zalo</a>
              <a href={`tel:${CONTACT_PHONE}`}><Phone size={15} /> {CONTACT_PHONE}</a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        className="ai-chat-toggle"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        whileHover={reduce ? undefined : { y: -3, rotateX: 6, rotateY: -4, scale: 1.02 }}
        whileTap={reduce ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 360, damping: 22 }}
        style={{ transformPerspective: 800 }}
      >
        <MessageCircle size={22} />
        <span><strong>Tư vấn AI</strong><small>Phản hồi nhanh</small></span>
        <Zap size={16} />
      </motion.button>
    </section>
  );
}
