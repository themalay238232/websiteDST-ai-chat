interface Env {
  AI: {
    run(model: string, input: { messages: Array<{ role: string; content: string }> }): Promise<{
      response?: string;
      choices?: Array<{ message?: { content?: string } }>;
    }>;
  };
}

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const PRODUCTION_ORIGIN = "https://theluc205.github.io";

const DST_CONTEXT = `
Ban la tro ly tu van cua DST Group tai Ha Long, Quang Ninh.
Dich vu: Facebook Ads, Google Ads, TikTok Ads, YouTube Ads; TikTok Shop; thiet ke website va nhan dien; Content Marketing; quay chup, TVC, livestream, su kien; Branding; Booking va PR; setup nha hang - khach san; xay dung phong Marketing.
Lien he: 0328 247 888, info@dstgroup.vn, Zalo https://zalo.me/0328247888.
Tra loi bang tieng Viet, ngan gon, lich su va chi dua tren thong tin DST nay. Khong tu dua bao gia neu chua co du lieu. Khuyen khich lien he Zalo hoac dien thoai khi can tu van chi tiet. Khong yeu cau hoac luu ten, so dien thoai hay thong tin ca nhan trong cuoc tro chuyen.
`;

function corsHeaders(request: Request) {
  const origin = request.headers.get("Origin");
  const allowedOrigin = origin && (origin === PRODUCTION_ORIGIN || /^http:\/\/localhost(?::\d+)?$/.test(origin))
    ? origin
    : PRODUCTION_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
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
  const body = (await request.json().catch(() => null)) as { messages?: unknown; pageContext?: unknown } | null;
  const messages = normalizeMessages(body?.messages);
  const pageContext = typeof body?.pageContext === "string" ? body.pageContext.slice(0, 160) : "";
  if (!messages.length) return json(request, { error: "Missing messages" }, 400);

  try {
    const context = pageContext ? `\nNguoi dung dang xem: ${pageContext}. Uu tien tu van theo ngu canh nay.` : "";
    const conversation = [{ role: "system", content: DST_CONTEXT + context }, ...messages];
    let result = await env.AI.run("@cf/zai-org/glm-4.7-flash", { messages: conversation });
    let answer = result.response?.trim() ?? result.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      result = await env.AI.run("@cf/zai-org/glm-4.7-flash", { messages: conversation });
      answer = result.response?.trim() ?? result.choices?.[0]?.message?.content?.trim();
    }

    return answer
      ? json(request, { answer })
      : json(request, { error: "AI returned no answer" }, 502);
  } catch {
    return json(request, { error: "AI provider failed" }, 502);
  }
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }
    if (url.pathname === "/api/chat" && request.method === "POST") return chat(request, env);
    return json(request, { error: "Not found" }, 404);
  },
};

export default worker;
