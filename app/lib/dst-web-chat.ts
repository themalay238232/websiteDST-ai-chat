const WORKER_URL = "https://dst-group-messenger-ai.longv7393.workers.dev";
const SESSION_KEY = "dst-guest-web-session-v3";

export type WebChatProfile = {
  name: string;
  picture: string;
};

export type WebSession = {
  sessionToken: string;
  expiresAt: number;
  profile: WebChatProfile;
};

export type WebChatImage = {
  id?: string;
  url: string;
  alt: string;
  caption?: string;
  sourceUrl?: string;
};

export type WebChatMessage = {
  id: string;
  role: "assistant" | "staff" | "user";
  text: string;
  images: WebChatImage[];
  createdAt: string;
};

export type WebChatReply = {
  answer: string;
  images: WebChatImage[];
};

export type WebImageUpload = {
  uploadId: string;
  image: WebChatImage;
};

export class WebChatError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

async function readJson<T>(response: Response): Promise<T> {
  const body: unknown = await response.json().catch(() => ({}));
  const error = typeof body === "object" && body !== null && "error" in body
    ? String((body as { error?: unknown }).error ?? "")
    : "";
  if (!response.ok) {
    throw new WebChatError(response.status, error || "REQUEST_FAILED");
  }
  return body as T;
}

export async function createGuestSession(): Promise<WebSession> {
  const response = await fetch(`${WORKER_URL}/api/guest-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const session = await readJson<Partial<WebSession>>(response);
  if (
    !session.sessionToken
    || typeof session.expiresAt !== "number"
    || !session.profile?.name
  ) {
    throw new WebChatError(502, "INVALID_SESSION_RESPONSE");
  }
  return session as WebSession;
}

export async function sendWebChat(
  sessionToken: string,
  message: string,
  pageContext: string,
  uploadId = "",
): Promise<WebChatReply> {
  const response = await fetch(`${WORKER_URL}/api/web-chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sessionToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      pageContext: pageContext.slice(0, 160),
      ...(uploadId ? { uploadId } : {}),
    }),
  });
  const data = await readJson<Partial<WebChatReply>>(response);
  if (!data.answer) throw new WebChatError(502, "EMPTY_CHAT_RESPONSE");
  return {
    answer: data.answer,
    images: Array.isArray(data.images) ? data.images.slice(0, 2) : [],
  };
}

export async function uploadWebImage(
  sessionToken: string,
  blob: Blob,
): Promise<WebImageUpload> {
  const response = await fetch(`${WORKER_URL}/api/web-upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sessionToken}`,
      "Content-Type": blob.type,
    },
    body: blob,
  });
  const data = await readJson<Partial<WebImageUpload>>(response);
  if (!data.uploadId || !data.image?.url || !data.image.alt) {
    throw new WebChatError(502, "INVALID_UPLOAD_RESPONSE");
  }
  return data as WebImageUpload;
}

export async function loadWebHistory(sessionToken: string): Promise<WebChatMessage[]> {
  const response = await fetch(`${WORKER_URL}/api/web-history`, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  const data = await readJson<{
    conversation?: { messages?: Partial<WebChatMessage>[] } | null;
  }>(response);
  if (!Array.isArray(data.conversation?.messages)) return [];
  return data.conversation.messages.slice(-100).flatMap((message) => {
    const role = message.role;
    if (role !== "assistant" && role !== "staff" && role !== "user") return [];
    const text = String(message.text ?? "").slice(0, 4_000);
    const images = Array.isArray(message.images) ? message.images.slice(0, 4) : [];
    if (!text && !images.length) return [];
    return [{
      id: String(message.id ?? `history-${crypto.randomUUID()}`),
      role,
      text,
      images,
      createdAt: String(message.createdAt ?? ""),
    }];
  });
}

export async function deleteWebHistory(sessionToken: string): Promise<void> {
  const response = await fetch(`${WORKER_URL}/api/web-history`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  if (!response.ok) {
    throw new WebChatError(response.status, "DELETE_HISTORY_FAILED");
  }
}

export function saveWebSession(session: WebSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function loadWebSession(): WebSession | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    const session = raw ? JSON.parse(raw) as WebSession : null;
    if (
      !session?.sessionToken
      || session.expiresAt <= Date.now()
      || !session.profile?.name
    ) {
      clearWebSession();
      return null;
    }
    return session;
  } catch {
    clearWebSession();
    return null;
  }
}

export function clearWebSession() {
  window.localStorage.removeItem(SESSION_KEY);
}
