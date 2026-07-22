"use client";

import { ExternalLink, MessageCircle, Minimize2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const PAGE_URL = "https://www.facebook.com/profile.php?id=61592072642755";
const MESSENGER_URL = "https://m.me/61592072642755";

function createPluginUrl() {
  const query = new URLSearchParams({
    href: PAGE_URL,
    tabs: "messages",
    width: "500",
    height: "590",
    small_header: "true",
    adapt_container_width: "true",
    hide_cover: "false",
    show_facepile: "false",
  });

  return `https://www.facebook.com/plugins/page.php?${query.toString()}`;
}

type FacebookMessengerChatProps = {
  openToken: number;
};

export function FacebookMessengerChat({ openToken }: FacebookMessengerChatProps) {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const pluginUrl = useMemo(() => createPluginUrl(), []);

  function showChat() {
    setHasOpened(true);
    setOpen(true);
  }

  useEffect(() => {
    if (!openToken) return;
    const frame = window.requestAnimationFrame(() => {
      setHasOpened(true);
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
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <section className={`messenger-chat ${open ? "is-open" : ""}`} aria-label="Messenger DST Group">
      {hasOpened ? (
        <div
          className="messenger-chat-panel"
          hidden={!open}
          role="dialog"
          aria-modal="false"
          aria-label="Chat Messenger với DST Group"
        >
          <header className="messenger-chat-header">
            <div className="messenger-chat-title">
              <span><MessageCircle size={18} aria-hidden="true" />DST Group</span>
              <p><i aria-hidden="true" />Trò chuyện trực tiếp trên Facebook</p>
            </div>
            <div className="messenger-chat-actions">
              <button type="button" onClick={() => setOpen(false)} aria-label="Thu nhỏ Messenger" title="Thu nhỏ">
                <Minimize2 size={18} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Đóng Messenger" title="Đóng">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          </header>

          <iframe
            className="messenger-chat-frame"
            src={pluginUrl}
            title="Tin nhắn Facebook của DST Group"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="encrypted-media; clipboard-write; web-share"
          />

          <div className="messenger-chat-fallback">
            <p>Cần đăng nhập Facebook để nhắn ngay trong website.</p>
            <a href={MESSENGER_URL} target="_blank" rel="noreferrer">
              Mở trong Messenger <ExternalLink size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="messenger-chat-toggle"
        onClick={() => open ? setOpen(false) : showChat()}
        aria-expanded={open}
        aria-label={open ? "Thu nhỏ Messenger DST Group" : "Mở Messenger DST Group"}
      >
        <MessageCircle size={22} aria-hidden="true" />
        <span><strong>Chat Messenger</strong><small>Bot DST phản hồi</small></span>
      </button>
    </section>
  );
}
