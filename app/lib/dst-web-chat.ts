const WORKER_URL = "https://dst-group-messenger-ai.longv7393.workers.dev";
const SESSION_KEY = "dst-facebook-web-session-v1";

export type FacebookProfile = {
  name: string;
  picture: string;
};

export type WebSession = {
  sessionToken: string;
  expiresAt: number;
  profile: FacebookProfile;
};

export type WebChatImage = {
  id: string;
  url: string;
  alt: string;
  caption: string;
  sourceUrl?: string;
};

export type WebChatReply = {
  answer: string;
  images: WebChatImage[];
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

export async function exchangeFacebookToken(accessToken: string): Promise<WebSession> {
  const response = await fetch(`${WORKER_URL}/api/web-auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken }),
  });
  const session = await readJson<Partial<WebSession>>(response);
  if (
    !session.sessionToken
    || typeof session.expiresAt !== "number"
    || !session.profile?.name
  ) {
    throw new WebChatError(502, "INVALID_AUTH_RESPONSE");
  }
  return session as WebSession;
}

export async function sendWebChat(
  sessionToken: string,
  message: string,
  pageContext: string,
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
    }),
  });
  const data = await readJson<Partial<WebChatReply>>(response);
  if (!data.answer) throw new WebChatError(502, "EMPTY_CHAT_RESPONSE");
  return {
    answer: data.answer,
    images: Array.isArray(data.images) ? data.images.slice(0, 2) : [],
  };
}

export function saveWebSession(session: WebSession) {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function loadWebSession(): WebSession | null {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
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
  window.sessionStorage.removeItem(SESSION_KEY);
}
