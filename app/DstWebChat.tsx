"use client";

import {
  Bot,
  ImagePlus,
  LogOut,
  MessageCircle,
  Minimize2,
  Send,
  User,
  X,
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { BrandLogo } from "./components/BrandLogo";
import {
  prepareChatImage,
  type PreparedChatImage,
} from "./lib/dst-image-upload";
import {
  clearWebSession,
  createGuestSession,
  deleteWebHistory,
  loadWebHistory,
  loadWebSession,
  saveWebSession,
  sendWebChat,
  uploadWebImage,
  WebChatError,
  type WebChatImage,
  type WebSession,
} from "./lib/dst-web-chat";

type ChatMessage = {
  id: string;
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
  return { id: "welcome", role: "assistant", text: WELCOME };
}

type DstWebChatProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DstWebChat({ open, onOpenChange }: DstWebChatProps) {
  const [session, setSession] = useState<WebSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<PreparedChatImage | null>(null);
  const [imageBusy, setImageBusy] = useState(false);
  const [sessionBusy, setSessionBusy] = useState(false);
  const [historyBusy, setHistoryBusy] = useState(false);
  const [sendBusy, setSendBusy] = useState(false);
  const [error, setError] = useState("");
  const nextId = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (pendingImage?.previewUrl) URL.revokeObjectURL(pendingImage.previewUrl);
  }, [pendingImage]);

  useEffect(() => {
    let active = true;
    const restoreTimer = window.setTimeout(async () => {
      const restored = loadWebSession();
      if (!active || !restored) return;
      setSession(restored);
      setHistoryBusy(true);
      try {
        const history = await loadWebHistory(restored.sessionToken);
        if (!active) return;
        setMessages(history.length ? history.map((message) => ({
          id: message.id,
          role: message.role === "user" ? "user" : "assistant",
          text: message.text,
          images: message.images.filter((image) => safeHttpsUrl(image.url)),
        })) : [welcomeMessage()]);
      } catch (requestError) {
        if (!active) return;
        if (requestError instanceof WebChatError && requestError.status === 401) {
          clearWebSession();
          setSession(null);
          setMessages([]);
        } else {
          setMessages([welcomeMessage()]);
          setError("Chưa tải được lịch sử cũ, nhưng anh/chị vẫn có thể tiếp tục chat.");
        }
      } finally {
        if (active) setHistoryBusy(false);
      }
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(restoreTimer);
    };
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
    const id = `local-${nextId.current}`;
    setMessages((current) => [...current, {
      id,
      role,
      text,
      ...(images.length ? { images } : {}),
    }]);
    return id;
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

  async function endChat() {
    if (!session || !window.confirm("Xóa toàn bộ cuộc trò chuyện này?")) return;
    setSessionBusy(true);
    setError("");
    try {
      await deleteWebHistory(session.sessionToken);
      clearWebSession();
      setSession(null);
      setMessages([]);
      setInput("");
      setPendingImage(null);
    } catch (requestError) {
      if (requestError instanceof WebChatError && requestError.status === 401) {
        clearWebSession();
        setSession(null);
        setMessages([]);
      } else {
        setError("Chưa thể xóa cuộc trò chuyện. Anh/chị vui lòng thử lại.");
      }
    } finally {
      setSessionBusy(false);
    }
  }

  async function submitQuestion(raw: string) {
    const question = raw.trim();
    const selectedImage = pendingImage;
    if (!session || (!question && !selectedImage) || sendBusy || imageBusy) return;
    setError("");
    setSendBusy(true);
    let optimisticId = "";
    try {
      const uploaded = selectedImage
        ? await uploadWebImage(session.sessionToken, selectedImage.blob)
        : null;
      optimisticId = append(
        "user",
        question,
        uploaded ? [uploaded.image] : [],
      );
      const reply = await sendWebChat(
        session.sessionToken,
        question,
        window.location.pathname,
        uploaded?.uploadId,
      );
      setInput("");
      setPendingImage(null);
      append(
        "assistant",
        reply.answer,
        reply.images.filter((image) => safeHttpsUrl(image.url)),
      );
    } catch (requestError) {
      if (optimisticId) {
        setMessages((current) => current.filter(({ id }) => id !== optimisticId));
      }
      if (requestError instanceof WebChatError && requestError.status === 401) {
        clearWebSession();
        setSession(null);
        setMessages([]);
        setPendingImage(null);
        setError("Phiên tư vấn đã hết hạn. Anh/chị vui lòng kết nối lại.");
      } else if (requestError instanceof WebChatError && requestError.status === 429) {
        setError("Anh/chị đang gửi quá nhanh. Vui lòng chờ một phút rồi thử lại.");
      } else if (requestError instanceof WebChatError && requestError.status === 413) {
        setError("Ảnh vẫn còn quá lớn. Anh/chị vui lòng chọn ảnh khác.");
      } else {
        setError("Chưa gửi được nội dung. Ảnh và câu hỏi vẫn được giữ để anh/chị thử lại.");
      }
    } finally {
      setSendBusy(false);
    }
  }

  async function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file || imageBusy || sendBusy) return;
    setImageBusy(true);
    setError("");
    try {
      setPendingImage(await prepareChatImage(file));
    } catch (imageError) {
      const code = imageError instanceof Error ? imageError.message : "";
      setError(code === "SOURCE_IMAGE_TOO_LARGE"
        ? "Ảnh gốc quá lớn. Anh/chị vui lòng chọn ảnh dưới 15 MB."
        : "Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP hợp lệ.");
    } finally {
      setImageBusy(false);
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
                <span className="web-chat-service-line">Trợ lý tư vấn trực tuyến</span>
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
                Chat trực tiếp trên website, không cần tài khoản. Lịch sử được giữ trên trình duyệt này trong 30 ngày.
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
                <button
                  type="button"
                  onClick={() => void endChat()}
                  disabled={sessionBusy}
                  title="Xóa cuộc trò chuyện"
                >
                  <LogOut size={17} aria-hidden="true" /> Xóa cuộc trò chuyện
                </button>
              </div>
              <div className="web-chat-messages" ref={scrollRef} aria-live="polite">
                {historyBusy ? (
                  <div className="web-chat-typing" role="status">Đang tải lịch sử…</div>
                ) : null}
                {messages.map((message) => (
                  <article className={`web-chat-message ${message.role}`} key={message.id}>
                    {message.role === "assistant" ? (
                      <span className="web-chat-message-avatar"><BrandLogo /></span>
                    ) : null}
                    <div>
                      {message.text ? <p>{message.text}</p> : null}
                      {message.images?.length ? (
                        <div className="web-chat-images" aria-label="Ảnh tư vấn phù hợp">
                          {message.images.map((image) => (
                            <figure key={image.id ?? image.url}>
                              <img src={image.url} alt={image.alt} loading="lazy" />
                              {image.caption ? <figcaption>{image.caption}</figcaption> : null}
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
              {pendingImage ? (
                <div className="web-chat-attachment-preview" aria-label="Ảnh đính kèm">
                  <img src={pendingImage.previewUrl} alt={pendingImage.alt} />
                  <span>
                    <strong>Ảnh đã chọn</strong>
                    <small>{pendingImage.originalName}</small>
                  </span>
                  <button
                    type="button"
                    onClick={() => setPendingImage(null)}
                    aria-label="Xóa ảnh đã chọn"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                </div>
              ) : null}
              <form className="web-chat-input" onSubmit={onSubmit}>
                <input
                  ref={fileInputRef}
                  className="web-chat-file-input"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={(event) => void selectImage(event)}
                  tabIndex={-1}
                  aria-hidden="true"
                />
                <button
                  className="web-chat-attach"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sendBusy || imageBusy}
                  aria-label="Chọn ảnh gửi cho trợ lý"
                  title="Gửi ảnh để trợ lý phân tích"
                >
                  <ImagePlus size={19} aria-hidden="true" />
                </button>
                <input
                  className="web-chat-text"
                  value={input}
                  maxLength={800}
                  onChange={(event) => setInput(event.target.value)}
                  aria-label="Nhập câu hỏi tư vấn"
                  placeholder="Nhập câu hỏi…"
                />
                <button
                  className="web-chat-send"
                  type="submit"
                  disabled={(!input.trim() && !pendingImage) || sendBusy || imageBusy}
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
