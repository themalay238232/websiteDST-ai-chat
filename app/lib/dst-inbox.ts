const WORKER_URL = "https://dst-group-messenger-ai.longv7393.workers.dev";
const ADMIN_KEY = "dst-unified-inbox-admin-v1";

export type InboxChannel = "web" | "messenger";

export type InboxSummary = {
  id: string;
  channel: InboxChannel;
  participantId?: string;
  name: string;
  avatar: string;
  updatedAt: string;
  lastMessage: string;
};

export type InboxMessage = {
  id: string;
  role: "user" | "assistant" | "staff";
  text: string;
  createdAt: string;
  images?: Array<{ url: string; alt: string }>;
};

export type InboxConversation = InboxSummary & {
  messages: InboxMessage[];
};

export class InboxApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

async function readJson<T>(response: Response): Promise<T> {
  const body: unknown = await response.json().catch(() => ({}));
  const error = typeof body === "object" && body !== null && "error" in body
    ? String((body as { error?: unknown }).error ?? "")
    : "";
  if (!response.ok) throw new InboxApiError(response.status, error || "REQUEST_FAILED");
  return body as T;
}

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function listInbox(token: string) {
  const response = await fetch(`${WORKER_URL}/api/admin/inbox`, {
    headers: headers(token),
  });
  return readJson<{
    conversations: InboxSummary[];
    messengerStatus: "connected" | "unavailable";
  }>(response);
}

export async function readInboxConversation(token: string, item: InboxSummary) {
  const url = new URL(`${WORKER_URL}/api/admin/conversation`);
  url.searchParams.set("channel", item.channel);
  url.searchParams.set("id", item.id);
  const response = await fetch(url, { headers: headers(token) });
  const payload = await readJson<{ conversation: InboxConversation }>(response);
  return payload.conversation;
}

export async function replyToMessenger(token: string, participantId: string, text: string) {
  const response = await fetch(`${WORKER_URL}/api/admin/reply`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ participantId, text }),
  });
  return readJson<{ ok: true; messageId: string }>(response);
}

export function saveInboxToken(token: string) {
  window.sessionStorage.setItem(ADMIN_KEY, token);
}

export function loadInboxToken() {
  return window.sessionStorage.getItem(ADMIN_KEY) || "";
}

export function clearInboxToken() {
  window.sessionStorage.removeItem(ADMIN_KEY);
}

