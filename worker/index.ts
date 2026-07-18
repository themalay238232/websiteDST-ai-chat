/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const DST_SERVICE_CONTEXT = `
DST Group la cong ty marketing va media tai Ha Long, Quang Ninh.
Thong tin lien he: 0328 247 888, info@dstgroup.vn, Zalo https://zalo.me/0328247888.
Dich vu: Digital Advertising Facebook Ads, Google Ads, TikTok Ads, YouTube Ads; TikTok Shop Partner setup gian hang, livestream, KOC/KOL; Design & Website; Content Marketing; Studio & Media quay chup, TVC, livestream, su kien; Branding; Booking & PR; Setup Restaurant - Hotel; Xay dung phong Marketing.
Quy trinh: tiep nhan yeu cau, tu van muc tieu, khao sat thi truong, thong nhat phuong an va bao gia, lap ke hoach, ky hop dong, trien khai, bao cao va nghiem thu.
Chi tra loi dua tren thong tin dich vu DST. Khong bao gia cu the neu chua co du lieu, hay de nghi chuyen Zalo/dien thoai de tu van.
`;

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS_HEADERS,
      ...init?.headers,
    },
  });
}

function normalizeMessages(input: unknown) {
  if (!Array.isArray(input)) return [];
  return input
    .slice(-10)
    .map((message) => {
      if (!message || typeof message !== "object") return null;
      const record = message as { role?: unknown; content?: unknown };
      const role = record.role === "assistant" ? "assistant" : "user";
      const content = typeof record.content === "string" ? record.content.slice(0, 1200) : "";
      return content ? { role, content } : null;
    })
    .filter(Boolean);
}

async function callOpenAI(env: Env, messages: Array<{ role: string; content: string }>, lead: unknown) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "Ban la tro ly tu van khach hang cua DST Group. Tra loi tieng Viet ngan gon, lich su, uu tien thu thap ten, so dien thoai, nhu cau. Neu khong chac, moi khach lien he Zalo/dien thoai. Khong noi ve API key hoac cau hinh noi bo.\n\n" +
            DST_SERVICE_CONTEXT,
        },
        {
          role: "user",
          content: `Thong tin lead hien co: ${JSON.stringify(lead ?? {})}`,
        },
        ...messages,
      ],
      temperature: 0.4,
      max_output_tokens: 420,
    }),
  });

  if (!response.ok) throw new Error(`OpenAI failed: ${response.status}`);
  const data = (await response.json()) as { output_text?: string };
  return data.output_text;
}

async function callGemini(env: Env, messages: Array<{ role: string; content: string }>, lead: unknown) {
  const model = env.GEMINI_MODEL || "gemini-1.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text:
                "Ban la tro ly tu van khach hang cua DST Group. Tra loi tieng Viet ngan gon, lich su, uu tien thu thap ten, so dien thoai, nhu cau. Neu khong chac, moi khach lien he Zalo/dien thoai. Khong noi ve API key hoac cau hinh noi bo.\n\n" +
                DST_SERVICE_CONTEXT,
            },
          ],
        },
        contents: [
          { role: "user", parts: [{ text: `Thong tin lead hien co: ${JSON.stringify(lead ?? {})}` }] },
          ...messages.map((message) => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [{ text: message.content }],
          })),
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 420,
        },
      }),
    },
  );

  if (!response.ok) throw new Error(`Gemini failed: ${response.status}`);
  const data = (await response.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  return data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("");
}

async function handleChatProxy(request: Request, env: Env) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });

  const body = (await request.json().catch(() => null)) as { messages?: unknown; lead?: unknown } | null;
  const messages = normalizeMessages(body?.messages) as Array<{ role: string; content: string }>;
  const lead = body?.lead ?? {};

  if (!messages.length) {
    return json({ error: "Missing messages" }, { status: 400 });
  }

  try {
    const answer = env.OPENAI_API_KEY
      ? await callOpenAI(env, messages, lead)
      : env.GEMINI_API_KEY
        ? await callGemini(env, messages, lead)
        : null;

    if (!answer) return json({ error: "AI provider is not configured" }, { status: 503 });
    return json({ answer });
  } catch (error) {
    return json(
      {
        error: "AI provider failed",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 },
    );
  }
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    if (url.pathname === "/api/chat") {
      return handleChatProxy(request, env);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
