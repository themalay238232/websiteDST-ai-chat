interface Env {
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
}

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const ALLOWED_ORIGIN = "https://theluc205.github.io";

const DST_CONTEXT = `
Ban la tro ly tu van cua DST Group tai Ha Long, Quang Ninh.
Dich vu: Facebook Ads, Google Ads, TikTok Ads, YouTube Ads; TikTok Shop; thiet ke website va nhan dien; Content Marketing; quay chup, TVC, livestream, su kien; Branding; Booking va PR; setup nha hang - khach san; xay dung phong Marketing.
Lien he: 0328 247 888, info@dstgroup.vn, Zalo https://zalo.me/0328247888.
Tra loi bang tieng Viet, ngan gon, lich su va chi dua tren thong tin DST nay. Khong tu dua bao gia neu chua co du lieu. Khuyen khich lien he Zalo hoac dien thoai khi can tu van chi tiet. Khong yeu cau hoac luu ten, so dien thoai hay thong tin ca nhan trong cuoc tro chuyen.
`;

function corsHeaders(request: Request) {
  const origin = request.headers.get("Origin");
  return {
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function json(request: Request, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(request),
    },
  });
}

function normalizeMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(-8)
    .flatMap((item): ChatMessage[] => {
      if (!item || typeof item !== "object") return [];
      const message = item as Partial<ChatMessage>;
      if (typeof message.content !== "string" || !message.content.trim()) return [];
      return [{
        role: message.role === "assistant" ? "assistant" : "user",
        content: message.content.trim().slice(0, 1200),
      }];
    });
}

async function chat(request: Request, env: Env) {
  if (!env.GEMINI_API_KEY) return json(request, { error: "AI is not configured" }, 503);

  const body = (await request.json().catch(() => null)) as { messages?: unknown } | null;
  const messages = normalizeMessages(body?.messages);
  if (!messages.length) return json(request, { error: "Missing messages" }, 400);

  const model = env.GEMINI_MODEL || "gemini-2.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: DST_CONTEXT }] },
        contents: messages.map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        })),
        generationConfig: { temperature: 0.4, maxOutputTokens: 420 },
      }),
    },
  );

  if (!response.ok) {
    return json(request, { error: "AI provider failed" }, 502);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const answer = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();

  return answer
    ? json(request, { answer })
    : json(request, { error: "AI returned no answer" }, 502);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }
    if (url.pathname === "/api/chat" && request.method === "POST") return chat(request, env);
    return json(request, { error: "Not found" }, 404);
  },
};
