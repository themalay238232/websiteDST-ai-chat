"use client";

import {
  Bot,
  LogOut,
  MessageCircle,
  Minimize2,
  Send,
  User,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BrandLogo } from "./components/BrandLogo";
import {
  clearWebSession,
  createGuestSession,
  loadWebSession,
  saveWebSession,
  sendWebChat,
  WebChatError,
  type WebChatImage,
  type WebSession,
} from "./lib/dst-web-chat";

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
  images?: WebChatImage[];
};

const WELCOME =
  "Xin chào, tôi là trợ lý tư vấn DST Group. Anh/chị cần hỗ trợ dịch vụ nào ạ?";
const QUICK_QUESTIONS = [
  "DST Group có những dịch vụ nào?",
  "Cho tôi xem dự án khách sạn",
  "Tư vấn quản trị Fanpage",
];

function safeHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function welcomeMessage(): ChatMessage {
  return { id: 0, role: "assistant", text: WELCOME };
}

type DstWebChatProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DstWebChat({ open, onOpenChange }: DstWebChatProps) {
  const [session, setSession] = useState<WebSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionBusy, setSessionBusy] = useState(false);
  const [sendBusy, setSendBusy] = useState(false);
  const [error, setError] = useState("");
  const nextId = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      const restored = loadWebSession();
      setSession(restored);
      if (restored) setMessages([welcomeMessage()]);
    }, 0);
    return () => window.clearTimeout(restoreTimer);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sendBusy]);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onOpenChange, open]);

  function append(
    role: ChatMessage["role"],
    text: string,
    images: WebChatImage[] = [],
  ) {
    nextId.current += 1;
    setMessages((current) => [...current, {
      id: nextId.current,
      role,
      text,
      ...(images.length ? { images } : {}),
    }]);
  }

  async function startChat() {
    if (sessionBusy) return;
    setSessionBusy(true);
    setError("");
    try {
      const nextSession = await createGuestSession();
      try {
        saveWebSession(nextSession);
      } catch {
        // The in-memory session still works when browser storage is unavailable.
      }
      nextId.current = 0;
      setSession(nextSession);
      setMessages([welcomeMessage()]);
    } catch (requestError) {
      setError(
        requestError instanceof WebChatError && requestError.status === 429
          ? "Anh/chị đang kết nối quá nhanh. Vui lòng chờ một phút rồi thử lại."
          : "Chưa thể kết nối trợ lý DST. Anh/chị vui lòng thử lại.",
      );
    } finally {
      setSessionBusy(false);
    }
  }

  function endChat() {
    try {
      clearWebSession();
    } catch {
      // State is still cleared when browser storage is unavailable.
    }
    setSession(null);
    setMessages([]);
    setInput("");
    setError("");
  }

  async function submitQuestion(raw: string) {
    const question = raw.trim();
    if (!session || !question || sendBusy) return;
    append("user", question);
    setInput("");
    setError("");
    setSendBusy(true);
    try {
      const reply = await sendWebChat(
        session.sessionToken,
        question,
        window.location.pathname,
      );
      append(
        "assistant",
        reply.answer,
        reply.images.filter((image) => safeHttpsUrl(image.url)),
      );
    } catch (requestError) {
      if (requestError instanceof WebChatError && requestError.status === 401) {
        endChat();
        setError("Phiên tư vấn đã hết hạn. Anh/chị vui lòng kết nối lại.");
      } else if (requestError instanceof WebChatError && requestError.status === 429) {
        setError("Anh/chị đang gửi quá nhanh. Vui lòng chờ một phút rồi thử lại.");
      } else {
        setError("Kết nối tư vấn đang gián đoạn. Anh/chị vui lòng thử lại.");
      }
    } finally {
      setSendBusy(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitQuestion(input);
  }

  return (
    <section className={`web-chat ${open ? "is-open" : ""}`} aria-label="Trợ lý DST Group">
      {open ? (
        <div
          className="web-chat-panel"
          role="dialog"
          aria-modal="false"
          aria-label="Chat tư vấn DST Group"
        >
          <header className="web-chat-header">
            <div className="web-chat-brand">
              <span className="web-chat-brand-logo"><BrandLogo /></span>
              <span>
                <strong>DST Group</strong>
                <small><i /> Đang hoạt động</small>
              </span>
            </div>
            <div className="web-chat-actions">
              <button type="button" onClick={() => onOpenChange(false)} aria-label="Thu nhỏ chat">
                <Minimize2 size={18} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => onOpenChange(false)} aria-label="Đóng chat">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          </header>

          {!session ? (
            <div className="web-chat-login">
              <Bot size={42} aria-hidden="true" />
              <h2>Tư vấn cùng DST Group</h2>
              <p>
                Chat trực tiếp trên website, không cần tài khoản. Trợ lý sử dụng cùng dữ liệu tư vấn với bot Messenger của DST.
              </p>
              <button type="button" onClick={() => void startChat()} disabled={sessionBusy}>
                <MessageCircle size={18} aria-hidden="true" />
                {sessionBusy ? "Đang kết nối..." : "Bắt đầu chat ngay"}
              </button>
              {error ? <p className="web-chat-error" role="alert">{error}</p> : null}
            </div>
          ) : (
            <>
              <div className="web-chat-profile">
                {safeHttpsUrl(session.profile.picture)
                  ? <img src={session.profile.picture} alt="" />
                  : <User size={24} aria-hidden="true" />}
                <span>
                  <small>Đang tư vấn với</small>
                  <strong>{session.profile.name}</strong>
                </span>
                <button type="button" onClick={endChat} title="Kết thúc phiên chat">
                  <LogOut size={17} aria-hidden="true" /> Kết thúc
                </button>
              </div>
              <div className="web-chat-messages" ref={scrollRef} aria-live="polite">
                {messages.map((message) => (
                  <article className={`web-chat-message ${message.role}`} key={message.id}>
                    {message.role === "assistant" ? (
                      <span className="web-chat-message-avatar"><BrandLogo /></span>
                    ) : null}
                    <div>
                      <p>{message.text}</p>
                      {message.images?.length ? (
                        <div className="web-chat-images" aria-label="Ảnh tư vấn phù hợp">
                          {message.images.map((image) => (
                            <figure key={image.id}>
                              <img src={image.url} alt={image.alt} loading="lazy" />
                              <figcaption>{image.caption}</figcaption>
                              {image.sourceUrl && safeHttpsUrl(image.sourceUrl) ? (
                                <a href={image.sourceUrl} target="_blank" rel="noreferrer">
                                  Xem nguồn ảnh
                                </a>
                              ) : null}
                            </figure>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </article>
                ))}
                {sendBusy ? (
                  <div className="web-chat-typing" role="status" aria-label="DST đang trả lời">
                    <span /><span /><span />
                  </div>
                ) : null}
              </div>
              {error ? <p className="web-chat-error" role="alert">{error}</p> : null}
              <div className="web-chat-quick" aria-label="Câu hỏi nhanh">
                {QUICK_QUESTIONS.map((question) => (
                  <button
                    type="button"
                    key={question}
                    disabled={sendBusy}
                    onClick={() => void submitQuestion(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
              <form className="web-chat-input" onSubmit={onSubmit}>
                <input
                  value={input}
                  maxLength={800}
                  onChange={(event) => setInput(event.target.value)}
                  aria-label="Nhập câu hỏi tư vấn"
                  placeholder="Nhập câu hỏi…"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sendBusy}
                  aria-label="Gửi câu hỏi"
                >
                  <Send size={18} aria-hidden="true" />
                </button>
              </form>
            </>
          )}
        </div>
      ) : null}
      <button
        type="button"
        className="web-chat-toggle"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-label={open ? "Thu nhỏ chat DST Group" : "Mở chat tư vấn DST Group"}
      >
        <MessageCircle size={22} aria-hidden="true" />
        <span>
          <strong>Chat với DST Group</strong>
          <small>Trả lời ngay trên website</small>
        </span>
      </button>
    </section>
  );
}
