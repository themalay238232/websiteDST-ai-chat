"use client";

import {
  ArrowLeft,
  Bot,
  Globe2,
  Inbox,
  LoaderCircle,
  LogOut,
  MessageCircle,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrandLogo } from "../components/BrandLogo";
import {
  clearInboxToken,
  InboxApiError,
  type InboxConversation,
  type InboxSummary,
  listInbox,
  loadInboxToken,
  readInboxConversation,
  replyToMessenger,
  saveInboxToken,
} from "../lib/dst-inbox";

type InboxPageProps = { onExit: () => void };

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return new Intl.DateTimeFormat("vi-VN", sameDay
    ? { hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "2-digit" }).format(date);
}

function initial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "K";
}

export function InboxPage({ onExit }: InboxPageProps) {
  const [token, setToken] = useState(() => (
    typeof window === "undefined" ? "" : loadInboxToken()
  ));
  const [tokenInput, setTokenInput] = useState("");
  const [conversations, setConversations] = useState<InboxSummary[]>([]);
  const [selected, setSelected] = useState<InboxSummary | null>(null);
  const [thread, setThread] = useState<InboxConversation | null>(null);
  const [query, setQuery] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [threadLoading, setThreadLoading] = useState(false);
  const [replying, setReplying] = useState(false);
  const [error, setError] = useState("");
  const [messengerConnected, setMessengerConnected] = useState(true);
  const threadScrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<InboxSummary | null>(null);

  const openConversation = useCallback(async (item: InboxSummary, adminToken: string) => {
    setSelected(item);
    setThreadLoading(true);
    setError("");
    try {
      setThread(await readInboxConversation(adminToken, item));
    } catch {
      setThread(null);
      setError("Không tải được nội dung cuộc trò chuyện này.");
    } finally {
      setThreadLoading(false);
    }
  }, []);

  const refreshInbox = useCallback(async (adminToken: string, preserveSelection = true) => {
    if (!adminToken) return;
    setLoading(true);
    setError("");
    try {
      const result = await listInbox(adminToken);
      setConversations(result.conversations);
      setMessengerConnected(result.messengerStatus === "connected");
      const currentSelection = selectedRef.current;
      const nextSelected = preserveSelection && currentSelection
        ? result.conversations.find((item) => (
          item.channel === currentSelection.channel && item.id === currentSelection.id
        ))
        : result.conversations[0];
      if (nextSelected) await openConversation(nextSelected, adminToken);
      else {
        setSelected(null);
        setThread(null);
      }
    } catch (requestError) {
      if (requestError instanceof InboxApiError && requestError.status === 401) {
        clearInboxToken();
        setToken("");
        setError("Mã quản trị không đúng hoặc đã được thay đổi.");
      } else {
        setError("Hộp thư đang tạm gián đoạn. Hãy thử làm mới.");
      }
    } finally {
      setLoading(false);
    }
  }, [openConversation]);

  useEffect(() => {
    document.title = "Hộp thư hợp nhất | DST Group";
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const previousRobots = robots?.content;
    if (robots) robots.content = "noindex,nofollow";
    return () => {
      if (robots && previousRobots) robots.content = previousRobots;
    };
  }, []);

  useEffect(() => {
    if (!token) return;
    const initialLoad = window.setTimeout(() => void refreshInbox(token, false), 0);
    const timer = window.setInterval(() => void refreshInbox(token), 20_000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(timer);
    };
  }, [refreshInbox, token]);

  useEffect(() => {
    threadScrollRef.current?.scrollTo({
      top: threadScrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [thread, threadLoading]);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("vi");
    if (!needle) return conversations;
    return conversations.filter((item) => (
      `${item.name} ${item.lastMessage} ${item.channel}`
        .toLocaleLowerCase("vi")
        .includes(needle)
    ));
  }, [conversations, query]);

  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = tokenInput.trim();
    if (next.length < 24) {
      setError("Nhập mã quản trị đã được cấp cho DST.");
      return;
    }
    saveInboxToken(next);
    setToken(next);
    setTokenInput("");
  }

  function logout() {
    clearInboxToken();
    setToken("");
    setConversations([]);
    setSelected(null);
    setThread(null);
  }

  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = reply.trim();
    const participantId = thread?.participantId || selected?.participantId || "";
    if (!token || !text || !participantId || replying) return;
    setReplying(true);
    setError("");
    try {
      await replyToMessenger(token, participantId, text);
      setReply("");
      if (selected) await openConversation(selected, token);
    } catch {
      setError("Messenger chưa nhận được tin. Cuộc trò chuyện có thể đã ngoài thời hạn phản hồi 24 giờ.");
    } finally {
      setReplying(false);
    }
  }

  if (!token) {
    return (
      <main className="inbox-login-shell">
        <section className="inbox-login-card" aria-labelledby="inbox-login-title">
          <BrandLogo className="inbox-login-logo" />
          <div className="inbox-login-badge"><ShieldCheck size={16} /> Khu vực nội bộ</div>
          <h1 id="inbox-login-title">Hộp thư DST</h1>
          <p>Một nơi để theo dõi khách nhắn từ website và Messenger.</p>
          <form onSubmit={login}>
            <label htmlFor="inbox-token">Mã quản trị</label>
            <input
              id="inbox-token"
              type="password"
              value={tokenInput}
              onChange={(event) => setTokenInput(event.target.value)}
              placeholder="Dán mã quản trị"
              autoComplete="current-password"
            />
            <button type="submit">Mở hộp thư <Inbox size={18} /></button>
          </form>
          {error ? <p className="inbox-inline-error" role="alert">{error}</p> : null}
          <button type="button" className="inbox-back" onClick={onExit}>Quay lại website</button>
        </section>
      </main>
    );
  }

  return (
    <main className={`unified-inbox ${selected ? "has-thread" : ""}`} aria-label="Hộp thư hợp nhất DST Group">
      <aside className="inbox-rail">
        <BrandLogo className="inbox-rail-logo" />
        <button className="is-active" type="button" aria-label="Hộp thư"><Inbox size={21} /></button>
        <button type="button" onClick={onExit} aria-label="Về website"><Globe2 size={21} /></button>
        <button className="inbox-rail-logout" type="button" onClick={logout} aria-label="Đăng xuất">
          <LogOut size={20} />
        </button>
      </aside>

      <section className="inbox-list-panel">
        <header>
          <div>
            <p className="inbox-kicker">DST care desk</p>
            <h1>Hộp thư</h1>
          </div>
          <button
            type="button"
            onClick={() => void refreshInbox(token)}
            disabled={loading}
            aria-label="Làm mới hộp thư"
          >
            <RefreshCw size={18} className={loading ? "is-spinning" : ""} />
          </button>
        </header>
        <label className="inbox-search">
          <Search size={17} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm khách hàng hoặc nội dung"
          />
        </label>
        <div className="inbox-source-status">
          <span className="web"><Globe2 size={14} /> Website</span>
          <span className={messengerConnected ? "messenger" : "offline"}>
            <MessageCircle size={14} /> Messenger {messengerConnected ? "đã kết nối" : "tạm gián đoạn"}
          </span>
        </div>
        <div className="inbox-conversation-list">
          {filtered.map((item) => (
            <button
              type="button"
              className={selected?.id === item.id && selected.channel === item.channel ? "is-active" : ""}
              key={`${item.channel}:${item.id}`}
              onClick={() => void openConversation(item, token)}
            >
              <span className={`inbox-avatar ${item.channel}`}>
                {item.avatar ? <img src={item.avatar} alt="" /> : initial(item.name)}
                <i aria-label={item.channel === "messenger" ? "Messenger" : "Website"}>
                  {item.channel === "messenger" ? <MessageCircle size={11} /> : <Globe2 size={11} />}
                </i>
              </span>
              <span className="inbox-summary">
                <span><strong>{item.name}</strong><time>{formatTime(item.updatedAt)}</time></span>
                <small>{item.lastMessage}</small>
              </span>
            </button>
          ))}
          {!loading && !filtered.length ? (
            <div className="inbox-empty-list"><Inbox size={30} /><p>Chưa có cuộc trò chuyện phù hợp.</p></div>
          ) : null}
        </div>
      </section>

      <section className="inbox-thread-panel">
        {selected ? (
          <>
            <header className="inbox-thread-header">
              <button
                className="inbox-thread-back"
                type="button"
                onClick={() => { setSelected(null); setThread(null); }}
                aria-label="Quay lại danh sách cuộc trò chuyện"
              >
                <ArrowLeft size={20} />
              </button>
              <span className={`inbox-avatar ${selected.channel}`}>{initial(selected.name)}</span>
              <div>
                <strong>{selected.name}</strong>
                <small>
                  {selected.channel === "messenger"
                    ? "Cuộc trò chuyện Messenger thật"
                    : "Khách đang chat tại website DST"}
                </small>
              </div>
              <span className={`inbox-channel-pill ${selected.channel}`}>
                {selected.channel === "messenger" ? <MessageCircle size={14} /> : <Globe2 size={14} />}
                {selected.channel === "messenger" ? "Messenger" : "Website"}
              </span>
            </header>
            <div className="inbox-thread-messages" ref={threadScrollRef}>
              {threadLoading ? (
                <div className="inbox-thread-loading"><LoaderCircle className="is-spinning" /> Đang tải cuộc trò chuyện</div>
              ) : thread?.messages?.length ? thread.messages.map((message) => (
                <article className={`inbox-bubble ${message.role}`} key={message.id}>
                  {message.role === "user" ? <span className="bubble-avatar"><UserRound size={15} /></span> : null}
                  <div>
                    {message.text ? <p>{message.text}</p> : null}
                    {message.images?.map((image) => (
                      <img src={image.url} alt={image.alt} key={image.url} loading="lazy" />
                    ))}
                    <time>{formatTime(message.createdAt)}</time>
                  </div>
                </article>
              )) : (
                <div className="inbox-thread-empty"><Bot size={38} /><p>Chưa có nội dung để hiển thị.</p></div>
              )}
            </div>
            {error ? <p className="inbox-thread-error" role="alert">{error}</p> : null}
            {selected.channel === "messenger" ? (
              <form className="inbox-reply" onSubmit={sendReply}>
                <input
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  maxLength={2_000}
                  placeholder={`Nhắn với ${selected.name}`}
                  aria-label="Tin nhắn trả lời Messenger"
                />
                <button type="submit" disabled={!reply.trim() || replying} aria-label="Gửi tin nhắn">
                  {replying ? <LoaderCircle size={19} className="is-spinning" /> : <Send size={19} />}
                </button>
              </form>
            ) : (
              <footer className="inbox-web-note">
                <Bot size={17} /> Trợ lý AI đang trả lời khách website; toàn bộ nội dung được lưu tại đây.
              </footer>
            )}
          </>
        ) : (
          <div className="inbox-thread-placeholder">
            <span><MessageCircle size={34} /></span>
            <h2>Website và Messenger, cùng một nơi</h2>
            <p>Chọn một cuộc trò chuyện để xem đầy đủ lịch sử và phản hồi khách Messenger.</p>
          </div>
        )}
      </section>
    </main>
  );
}
