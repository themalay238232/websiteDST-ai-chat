# Facebook Login Web Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay iframe Messenger bằng chat AI DST chạy trực tiếp trên website, bắt buộc xác thực Facebook và không đưa bất kỳ secret nào vào frontend.

**Architecture:** Facebook JavaScript SDK chỉ lấy access token tạm thời; Cloudflare Worker xác minh token bằng Graph API rồi phát hành web session HMAC trong 60 phút. Website dùng web session qua Bearer token để gọi pipeline `/api/web-chat` hiện có; webhook Messenger tiếp tục độc lập và không bị thay đổi hành vi.

**Tech Stack:** React 19, TypeScript 5.9, Vinext/Vite static GitHub Pages, Facebook JavaScript SDK/Graph API v23.0, Cloudflare Workers, Web Crypto HMAC-SHA256, Node test runner.

## Global Constraints

- Website production: `https://themalay238232.github.io/websiteDST-ai-chat/`.
- Worker production: `https://dst-group-messenger-ai.longv7393.workers.dev`.
- Meta App hiện có: `DST GROUP AI Chat`; App ID công khai cần xác nhận là `1047361974664451` từ URL bảng điều khiển trước khi deploy.
- Chỉ yêu cầu quyền `public_profile`; không yêu cầu email hoặc quyền Page bổ sung.
- Facebook access token không được ghi vào `localStorage`, `sessionStorage`, URL hoặc log.
- Web session được giữ trong `sessionStorage`, hết hạn tối đa sau 60 phút.
- `META_APP_SECRET`, `WEB_SESSION_SECRET`, `META_PAGE_ACCESS_TOKEN` và `GEMINI_API_KEY` chỉ tồn tại trong Cloudflare secrets.
- Tin nhắn web không được mô tả là Messenger và không xuất hiện trong Facebook Page Inbox.
- `/webhook` Messenger phải giữ nguyên hợp đồng và tiếp tục vượt qua toàn bộ test hiện tại.
- Không thêm dependency frontend mới; dùng React và `lucide-react` đã có.
- Repository Worker tại `C:/Users/Admin/Documents/nghich du an` đang có thay đổi của người dùng; chỉ stage đúng các file thuộc từng task và không reset thay đổi khác.

---

## File Structure

### Cloudflare Worker — `C:/Users/Admin/Documents/nghich du an`

- Create `src/web-auth.js`: xác minh Facebook token, ký/xác minh web session HMAC và đọc Bearer token.
- Create `test/web-auth.test.js`: unit test token Meta, chữ ký, hết hạn và sửa token.
- Modify `src/web-chat-api.js`: hợp đồng body chat không còn nhận `sessionId`; CORS cho phép header `Authorization`.
- Modify `src/messenger-page-worker.js`: thêm `/api/web-auth`, khóa `/api/web-chat` bằng web session và lấy khóa hội thoại từ app-scoped Facebook ID.
- Modify `test/web-chat-api.test.js`: test hợp đồng request/CORS mới.
- Modify `test/messenger-page-worker.test.js`: test tích hợp auth, 401, rate limit, pipeline AI và hồi quy webhook.
- Modify `wrangler.jsonc`: khai báo App ID công khai và ưu tiên Worker cho `/api/*`.
- Modify `.env.example`: chỉ thêm tên biến/giá trị mẫu không dùng được, không chứa secret thật.

### Website — `C:/Users/Admin/Documents/websiteDST-ai-chat`

- Create `app/lib/facebook-sdk.ts`: tải SDK một lần và trả Facebook access token từ `FB.login`.
- Create `app/lib/dst-web-chat.ts`: hợp đồng `/api/web-auth`, `/api/web-chat`, sessionStorage và chuẩn hóa lỗi.
- Create `app/FacebookWebChat.tsx`: state machine đăng nhập/chat/đăng xuất, render ảnh và xử lý 401/429.
- Modify `app/WebsiteApp.tsx`: thay `FacebookMessengerChat` bằng `FacebookWebChat`.
- Modify `app/components/FloatingContactButtons.tsx`: đổi nhãn từ Messenger thành tư vấn AI.
- Delete `app/FacebookMessengerChat.tsx`: loại bỏ Page Plugin iframe.
- Modify `app/globals.css`: thay style iframe bằng panel đăng nhập/chat responsive.
- Modify `tests/rendered-html.test.mjs`: kiểm tra SDK, API, Bearer token, sessionStorage và không có secret/iframe.

---

### Task 1: Web session và xác minh Facebook trong Worker

**Files:**
- Create: `C:/Users/Admin/Documents/nghich du an/src/web-auth.js`
- Create: `C:/Users/Admin/Documents/nghich du an/test/web-auth.test.js`

**Interfaces:**
- Consumes: `env.META_APP_ID`, `env.META_APP_SECRET`, `env.META_GRAPH_API_VERSION`, `env.WEB_SESSION_SECRET`, một Facebook user access token.
- Produces: `parseFacebookAuthRequest(body)`, `authenticateFacebookAccessToken({ accessToken, env, fetchImpl, now })`, `issueWebSession(profile, { secret, now })`, `verifyWebSession(token, { secret, now })`, `readBearerToken(request)`.
- `authenticateFacebookAccessToken` trả `{ id: string, name: string, picture: string }`.
- `issueWebSession` trả `{ sessionToken: string, expiresAt: number }`, trong đó `expiresAt` là epoch milliseconds.
- `verifyWebSession` trả `{ sub: string, name: string, picture: string, iat: number, exp: number }`.

- [ ] **Step 1: Viết test thất bại cho auth và web session**

```js
// test/web-auth.test.js
import test from "node:test";
import assert from "node:assert/strict";
import {
  authenticateFacebookAccessToken,
  issueWebSession,
  parseFacebookAuthRequest,
  readBearerToken,
  verifyWebSession,
} from "../src/web-auth.js";

const ENV = {
  META_APP_ID: "1047361974664451",
  META_APP_SECRET: "meta-test-secret-value-not-for-production",
  META_GRAPH_API_VERSION: "v23.0",
  WEB_SESSION_SECRET: "web-session-test-secret-at-least-32-bytes",
};
const NOW = 1_800_000_000_000;

test("parses only a bounded Facebook access token", () => {
  assert.deepEqual(parseFacebookAuthRequest({ accessToken: "  token-123  " }), {
    accessToken: "token-123",
  });
  assert.throws(() => parseFacebookAuthRequest({}), /invalid facebook auth request/iu);
  assert.throws(
    () => parseFacebookAuthRequest({ accessToken: "x".repeat(4097) }),
    /invalid facebook auth request/iu,
  );
});

test("validates the token app and returns a minimal profile", async () => {
  const calls = [];
  const profile = await authenticateFacebookAccessToken({
    accessToken: "user-token",
    env: ENV,
    now: () => NOW,
    fetchImpl: async (url, options = {}) => {
      calls.push({ url: String(url), options });
      if (String(url).includes("/debug_token")) {
        return Response.json({ data: {
          is_valid: true,
          app_id: ENV.META_APP_ID,
          user_id: "fb-user-1",
          expires_at: Math.floor(NOW / 1000) + 600,
        } });
      }
      return Response.json({
        id: "fb-user-1",
        name: "Nguyễn Long",
        picture: { data: { url: "https://platform-lookaside.fbsbx.com/avatar.jpg" } },
      });
    },
  });

  assert.deepEqual(profile, {
    id: "fb-user-1",
    name: "Nguyễn Long",
    picture: "https://platform-lookaside.fbsbx.com/avatar.jpg",
  });
  assert.equal(calls.length, 2);
  assert.match(calls[0].url, /debug_token/);
  assert.equal(calls[1].options.headers.authorization, "Bearer user-token");
});

test("rejects a token from another Meta app", async () => {
  await assert.rejects(() => authenticateFacebookAccessToken({
    accessToken: "wrong-app-token",
    env: ENV,
    now: () => NOW,
    fetchImpl: async () => Response.json({ data: {
      is_valid: true,
      app_id: "another-app",
      user_id: "fb-user-1",
      expires_at: Math.floor(NOW / 1000) + 600,
    } }),
  }), /facebook token rejected/iu);
});

test("rejects an expired Facebook token and a Graph API failure", async () => {
  await assert.rejects(() => authenticateFacebookAccessToken({
    accessToken: "expired-token",
    env: ENV,
    now: () => NOW,
    fetchImpl: async () => Response.json({ data: {
      is_valid: true,
      app_id: ENV.META_APP_ID,
      user_id: "fb-user-1",
      expires_at: Math.floor(NOW / 1000) - 1,
    } }),
  }), /facebook token rejected/iu);
  await assert.rejects(() => authenticateFacebookAccessToken({
    accessToken: "graph-error-token",
    env: ENV,
    now: () => NOW,
    fetchImpl: async () => Response.json({ error: { code: 2 } }, { status: 503 }),
  }), /facebook token rejected/iu);
});

test("signs, verifies, expires, and detects a modified web session", async () => {
  const issued = await issueWebSession({
    id: "fb-user-1",
    name: "Nguyễn Long",
    picture: "https://example.com/avatar.jpg",
  }, { secret: ENV.WEB_SESSION_SECRET, now: () => NOW });

  const claims = await verifyWebSession(issued.sessionToken, {
    secret: ENV.WEB_SESSION_SECRET,
    now: () => NOW + 1_000,
  });
  assert.equal(claims.sub, "fb-user-1");
  assert.equal(issued.expiresAt, NOW + 3_600_000);
  await assert.rejects(() => verifyWebSession(`${issued.sessionToken}x`, {
    secret: ENV.WEB_SESSION_SECRET,
    now: () => NOW,
  }), /invalid web session/iu);
  await assert.rejects(() => verifyWebSession(issued.sessionToken, {
    secret: ENV.WEB_SESSION_SECRET,
    now: () => NOW + 3_600_001,
  }), /expired web session/iu);
});

test("reads only a Bearer authorization token", () => {
  assert.equal(readBearerToken(new Request("https://example.com", {
    headers: { authorization: "Bearer signed-token" },
  })), "signed-token");
  assert.throws(
    () => readBearerToken(new Request("https://example.com")),
    /missing bearer token/iu,
  );
});
```

- [ ] **Step 2: Chạy test và xác nhận thất bại đúng lý do**

Run: `node --test test/web-auth.test.js`

Expected: FAIL với `ERR_MODULE_NOT_FOUND` cho `src/web-auth.js`.

- [ ] **Step 3: Viết implementation tối thiểu bằng Web Crypto**

```js
// src/web-auth.js
const SESSION_TTL_SECONDS = 60 * 60;
const encoder = new TextEncoder();

function required(value, name) {
  const normalized = String(value ?? "").trim();
  if (!normalized) throw new Error(`Missing ${name}`);
  return normalized;
}

function safeHttpsUrl(value) {
  try {
    const url = new URL(String(value ?? ""));
    if (url.protocol !== "https:" || url.searchParams.has("access_token")) return "";
    return url.toString();
  } catch {
    return "";
  }
}

function encodeBase64Url(value) {
  const bytes = typeof value === "string" ? encoder.encode(value) : value;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

function decodeBase64Url(value) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

async function hmacKey(secret) {
  if (String(secret ?? "").length < 32) throw new Error("Invalid web session secret");
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export function parseFacebookAuthRequest(body) {
  const accessToken = String(body?.accessToken ?? "").trim();
  if (!accessToken || accessToken.length > 4096) {
    throw new TypeError("Invalid Facebook auth request");
  }
  return { accessToken };
}

export function readBearerToken(request) {
  const match = request.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/iu);
  if (!match) throw new TypeError("Missing bearer token");
  return match[1];
}

export async function authenticateFacebookAccessToken({
  accessToken,
  env,
  fetchImpl = globalThis.fetch,
  now = () => Date.now(),
}) {
  const appId = required(env.META_APP_ID, "META_APP_ID");
  const appSecret = required(env.META_APP_SECRET, "META_APP_SECRET");
  const version = required(env.META_GRAPH_API_VERSION || "v23.0", "META_GRAPH_API_VERSION");
  const debugUrl = new URL(`https://graph.facebook.com/${version}/debug_token`);
  debugUrl.searchParams.set("input_token", accessToken);
  debugUrl.searchParams.set("access_token", `${appId}|${appSecret}`);
  const debugResponse = await fetchImpl(debugUrl);
  if (!debugResponse.ok) throw new Error("Facebook token rejected");
  const debug = await debugResponse.json();
  const data = debug?.data;
  if (
    data?.is_valid !== true
    || String(data.app_id) !== appId
    || !String(data.user_id ?? "")
    || Number(data.expires_at) * 1000 <= now()
  ) {
    throw new Error("Facebook token rejected");
  }

  const profileUrl = new URL(`https://graph.facebook.com/${version}/me`);
  profileUrl.searchParams.set("fields", "id,name,picture.type(normal)");
  const profileResponse = await fetchImpl(profileUrl, {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!profileResponse.ok) throw new Error("Facebook profile rejected");
  const profile = await profileResponse.json();
  if (String(profile?.id) !== String(data.user_id) || !String(profile?.name ?? "").trim()) {
    throw new Error("Facebook profile rejected");
  }
  return {
    id: String(profile.id),
    name: String(profile.name).trim().slice(0, 100),
    picture: safeHttpsUrl(profile.picture?.data?.url),
  };
}

export async function issueWebSession(profile, { secret, now = () => Date.now() }) {
  const issuedAt = Math.floor(now() / 1000);
  const claims = {
    sub: String(profile.id),
    name: String(profile.name).slice(0, 100),
    picture: safeHttpsUrl(profile.picture),
    iat: issuedAt,
    exp: issuedAt + SESSION_TTL_SECONDS,
  };
  const payload = encodeBase64Url(JSON.stringify(claims));
  const signature = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(secret),
    encoder.encode(payload),
  );
  return {
    sessionToken: `${payload}.${encodeBase64Url(new Uint8Array(signature))}`,
    expiresAt: claims.exp * 1000,
  };
}

export async function verifyWebSession(token, { secret, now = () => Date.now() }) {
  try {
    const [payload, signature, extra] = String(token ?? "").split(".");
    if (!payload || !signature || extra) throw new Error("Invalid web session");
    const valid = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(secret),
      decodeBase64Url(signature),
      encoder.encode(payload),
    );
    if (!valid) throw new Error("Invalid web session");
    const claims = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload)));
    if (!claims.sub || !claims.name || !Number.isInteger(claims.exp)) {
      throw new Error("Invalid web session");
    }
    if (claims.exp * 1000 <= now()) throw new Error("Expired web session");
    return claims;
  } catch (error) {
    if (/expired web session/iu.test(String(error?.message))) throw error;
    throw new Error("Invalid web session");
  }
}
```

- [ ] **Step 4: Chạy unit test auth**

Run: `node --test test/web-auth.test.js`

Expected: PASS toàn bộ test trong file.

- [ ] **Step 5: Commit riêng module auth**

```powershell
git add -- src/web-auth.js test/web-auth.test.js
git commit -m "feat: add Facebook web session authentication"
```

Expected: commit chỉ chứa hai file trên.

---

### Task 2: Khóa Web Chat và thêm endpoint đổi Facebook token

**Files:**
- Modify: `C:/Users/Admin/Documents/nghich du an/src/web-chat-api.js`
- Modify: `C:/Users/Admin/Documents/nghich du an/src/messenger-page-worker.js`
- Modify: `C:/Users/Admin/Documents/nghich du an/test/web-chat-api.test.js`
- Modify: `C:/Users/Admin/Documents/nghich du an/test/messenger-page-worker.test.js`
- Modify: `C:/Users/Admin/Documents/nghich du an/wrangler.jsonc`
- Modify: `C:/Users/Admin/Documents/nghich du an/.env.example`

**Interfaces:**
- Consumes: các hàm từ Task 1 và pipeline `createMessageHandler` hiện tại.
- Produces: `POST /api/web-auth` trả `{ sessionToken, expiresAt, profile }`; `POST /api/web-chat` bắt buộc Bearer token và nhận `{ message, pageContext }`.
- `profile` trả ra frontend là `{ name: string, picture: string }`; không trả Facebook ID.

- [ ] **Step 1: Sửa test helper để mọi Web Chat request có session hợp lệ**

Thêm vào `test/messenger-page-worker.test.js`:

```js
import { issueWebSession } from "../src/web-auth.js";

Object.assign(ENV, {
  META_APP_ID: "1047361974664451",
  WEB_SESSION_SECRET: "web-session-test-secret-at-least-32-bytes",
});

const WEB_SESSION = await issueWebSession({
  id: "fb-web-user-1",
  name: "Khách DST",
  picture: "https://example.com/avatar.jpg",
}, { secret: ENV.WEB_SESSION_SECRET, now: () => 1_800_000_000_000 });
```

Đổi helper `webChatRequest` thành:

```js
function webChatRequest({
  message = "Tôi cần tư vấn Fanpage",
  pageContext = "/dich-vu/marketing",
  origin = "https://themalay238232.github.io",
  ipAddress = "",
  sessionToken = WEB_SESSION.sessionToken,
} = {}) {
  return new Request("https://dst-chatbot.example/api/web-chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin,
      ...(sessionToken ? { authorization: `Bearer ${sessionToken}` } : {}),
      ...(ipAddress ? { "cf-connecting-ip": ipAddress } : {}),
    },
    body: JSON.stringify({ message, pageContext }),
  });
}
```

Thay test cách ly lịch sử theo browser session bằng test dùng hai Facebook ID đã
ký khác nhau:

```js
test("keeps Web Chat histories isolated by Facebook app-scoped user", async () => {
  const geminiBodies = [];
  const worker = createMessengerPageWorker({
    fetchImpl: async (url, options) => {
      if (String(url).includes("generativelanguage.googleapis.com")) {
        geminiBodies.push(JSON.parse(options.body));
        return Response.json({
          candidates: [{ content: { parts: [{ text: `Phản hồi ${geminiBodies.length}` }] } }],
        });
      }
      throw new Error("Web Chat must not call Meta");
    },
  });
  const secondSession = await issueWebSession({
    id: "fb-web-user-2",
    name: "Khách thứ hai",
    picture: "",
  }, { secret: ENV.WEB_SESSION_SECRET, now: () => 1_800_000_000_000 });

  await worker.fetch(webChatRequest({ message: "Tôi tên Long" }), ENV, createContext());
  await worker.fetch(webChatRequest({ message: "Tôi vừa nói tên gì?" }), ENV, createContext());
  await worker.fetch(webChatRequest({
    sessionToken: secondSession.sessionToken,
    message: "Tôi vừa nói tên gì?",
  }), ENV, createContext());

  assert.deepEqual(geminiBodies[1].contents.slice(0, 2), [
    { role: "user", parts: [{ text: "Tôi tên Long" }] },
    { role: "model", parts: [{ text: "Phản hồi 1" }] },
  ]);
  assert.equal(geminiBodies[2].contents.length, 1);
});
```

Thay test giới hạn IP bằng 30 Facebook identity khác nhau để phép giới hạn theo
user không che mất phép giới hạn theo IP:

```js
test("limits one source address even when it rotates Facebook identities", async () => {
  const worker = createMessengerPageWorker({
    fetchImpl: async () => Response.json({
      candidates: [{ content: { parts: [{ text: "DST đã ghi nhận yêu cầu." }] } }],
    }),
  });
  for (let index = 0; index < 30; index += 1) {
    const session = await issueWebSession({
      id: `fb-rotated-${index}`,
      name: `Khách ${index}`,
      picture: "",
    }, { secret: ENV.WEB_SESSION_SECRET, now: () => 1_800_000_000_000 });
    const response = await worker.fetch(webChatRequest({
      sessionToken: session.sessionToken,
      ipAddress: "203.0.113.10",
    }), ENV, createContext());
    assert.equal(response.status, 200);
  }
  const finalSession = await issueWebSession({
    id: "fb-rotated-final",
    name: "Khách cuối",
    picture: "",
  }, { secret: ENV.WEB_SESSION_SECRET, now: () => 1_800_000_000_000 });
  const limited = await worker.fetch(webChatRequest({
    sessionToken: finalSession.sessionToken,
    ipAddress: "203.0.113.10",
  }), ENV, createContext());
  assert.equal(limited.status, 429);
});
```

Xóa mọi `sessionId` khỏi body và thêm test auth route:

```js
test("exchanges a valid Facebook token and rejects unauthenticated Web Chat", async () => {
  const worker = createMessengerPageWorker({
    now: () => 1_800_000_000_000,
    fetchImpl: async (url) => {
      if (String(url).includes("/debug_token")) return Response.json({ data: {
        is_valid: true,
        app_id: ENV.META_APP_ID,
        user_id: "fb-user-auth",
        expires_at: 1_800_000_600,
      } });
      if (String(url).includes("/me")) return Response.json({
        id: "fb-user-auth",
        name: "Khách Facebook",
        picture: { data: { url: "https://example.com/avatar.jpg" } },
      });
      throw new Error(`Unexpected URL ${url}`);
    },
  });
  const authResponse = await worker.fetch(new Request(
    "https://dst-chatbot.example/api/web-auth",
    {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://themalay238232.github.io" },
      body: JSON.stringify({ accessToken: "facebook-user-token" }),
    },
  ), ENV, createContext());
  const authBody = await authResponse.json();
  assert.equal(authResponse.status, 200);
  assert.equal(authBody.profile.name, "Khách Facebook");
  assert.ok(authBody.sessionToken);
  assert.equal(authBody.profile.id, undefined);

  const denied = await worker.fetch(webChatRequest({ sessionToken: "" }), ENV, createContext());
  assert.equal(denied.status, 401);
  assert.deepEqual(await denied.json(), { error: "Authentication required" });
});
```

- [ ] **Step 2: Sửa unit test hợp đồng request và CORS**

Trong `test/web-chat-api.test.js`, đổi expected của request hợp lệ thành:

```js
assert.deepEqual(parseWebChatRequest({
  message: "  Tư vấn Fanpage  ",
  pageContext: "  /dich-vu/marketing  ",
}), {
  message: "Tư vấn Fanpage",
  pageContext: "/dich-vu/marketing",
});
```

Xóa case `sessionId` sai và thêm:

```js
assert.equal(
  webChatCorsHeaders("https://themalay238232.github.io")["Access-Control-Allow-Headers"],
  "Authorization, Content-Type",
);
```

- [ ] **Step 3: Chạy test để xác nhận đang thất bại**

Run: `node --test test/web-auth.test.js test/web-chat-api.test.js test/messenger-page-worker.test.js`

Expected: FAIL vì route `/api/web-auth` chưa tồn tại, body chat vẫn đòi `sessionId` và Web Chat chưa kiểm tra Bearer token.

- [ ] **Step 4: Cập nhật hợp đồng Web Chat và CORS**

Trong `src/web-chat-api.js`, xóa `SESSION_ID`, bỏ `sessionId` khỏi parser và đổi header CORS:

```js
export function parseWebChatRequest(body) {
  const message = String(body?.message ?? "").trim();
  const pageContext = String(body?.pageContext ?? "").trim();
  if (
    !message
    || message.length > 800
    || pageContext.length > 160
    || (pageContext && !PAGE_CONTEXT.test(pageContext))
  ) {
    throw new TypeError("Invalid web chat request");
  }
  return { message, pageContext };
}

export function webChatCorsHeaders(origin) {
  const allowed = PRODUCTION_ORIGINS.has(String(origin ?? ""))
    || /^http:\/\/localhost(?::\d+)?$/u.test(String(origin ?? ""));
  return {
    ...(allowed ? { "Access-Control-Allow-Origin": origin } : {}),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    Vary: "Origin",
  };
}
```

- [ ] **Step 5: Thêm auth route và khóa chat trong Worker**

Thêm import vào `src/messenger-page-worker.js`:

```js
import {
  authenticateFacebookAccessToken,
  issueWebSession,
  parseFacebookAuthRequest,
  readBearerToken,
  verifyWebSession,
} from "./web-auth.js";
```

Đổi `allowWebRequest(sessionId, ipAddress)` thành nhận `facebookUserId`; đổi
`processWebChat(input, env, origin)` thành `processWebChat(input, identity, env, origin)`
và tạo `userId` như sau:

```js
function allowWebRequest(facebookUserId, ipAddress) {
  const userAllowed = consumeWebLimit(`facebook:${facebookUserId}`, 10);
  const ipAllowed = consumeWebLimit(`ip:${ipAddress || "unknown"}`, 30);
  return userAllowed && ipAllowed;
}

function processWebChat(input, identity, env, origin) {
  const userId = `web:facebook:${identity.sub}`;
  const previous = webQueues.get(userId) ?? Promise.resolve();
  const current = previous
    .catch(() => undefined)
    .then(async () => {
      const {
        aiClient,
        store,
        locationClient,
        imageSearchClient,
      } = getRuntime(env);
      const replies = [];
      const handleWebMessage = createMessageHandler({
        aiClient,
        store,
        sendMessage: async (text) => replies.push(text),
        userThreadType: USER_THREAD,
        locationClient,
        imageSearchClient,
        autoHandoff: false,
        logger,
      });
      const result = await handleWebMessage({
        type: USER_THREAD,
        threadId: userId,
        isSelf: false,
        data: {
          content: input.message,
          pageContext: input.pageContext,
        },
      });
      const images = (result?.outboundImages ?? [])
        .map((descriptor) => toWebImage(descriptor, origin))
        .filter(Boolean)
        .slice(0, 2);
      if (images.length && typeof store?.setState === "function") {
        const latestState = await store.getState(userId);
        await store.setState(
          userId,
          addShownPortfolio(latestState, images.map(({ id }) => id)),
        );
      }
      const answer = replies.at(-1);
      if (!answer) throw new Error("Web Chat produced no answer");
      return { answer, images };
    });

  webQueues.set(userId, current);
  void current
    .finally(() => {
      if (webQueues.get(userId) === current) webQueues.delete(userId);
    })
    .catch(() => undefined);
  return current;
}
```

Ngay trước block `/api/web-chat`, thêm route hoàn chỉnh:

```js
if (url.pathname === "/api/web-auth") {
  const origin = request.headers.get("origin") ?? "";
  const cors = webChatCorsHeaders(origin);
  if (!cors["Access-Control-Allow-Origin"]) {
    return webJsonResponse({ error: "Origin not allowed" }, 403, origin);
  }
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }
  if (request.method !== "POST") {
    return webJsonResponse({ error: "Method not allowed" }, 405, origin);
  }
  if (!consumeWebLimit(
    `auth-ip:${request.headers.get("cf-connecting-ip") || "unknown"}`,
    10,
  )) {
    return webJsonResponse({ error: "Too many requests" }, 429, origin);
  }
  try {
    const rawBody = await request.text();
    if (rawBody.length > 4_096) throw new TypeError("Request too large");
    const { accessToken } = parseFacebookAuthRequest(JSON.parse(rawBody));
    const profile = await authenticateFacebookAccessToken({
      accessToken,
      env,
      fetchImpl,
      now,
    });
    const session = await issueWebSession(profile, {
      secret: required(env, "WEB_SESSION_SECRET"),
      now,
    });
    return webJsonResponse({
      ...session,
      profile: { name: profile.name, picture: profile.picture },
    }, 200, origin);
  } catch (error) {
    logger.warn?.("Web authentication rejected", {
      name: error?.name ?? "UnknownError",
    });
    return webJsonResponse({ error: "Facebook authentication failed" }, 401, origin);
  }
}
```

Trong route `/api/web-chat`, sau kiểm tra method và trước parse body, thêm:

```js
let identity;
try {
  identity = await verifyWebSession(readBearerToken(request), {
    secret: required(env, "WEB_SESSION_SECRET"),
    now,
  });
} catch {
  return webJsonResponse({ error: "Authentication required" }, 401, origin);
}
```

Đổi rate limit và lời gọi xử lý thành:

```js
if (!allowWebRequest(
  identity.sub,
  request.headers.get("cf-connecting-ip") ?? "",
)) {
  return webJsonResponse({ error: "Too many requests" }, 429, origin);
}

return webJsonResponse(
  await processWebChat(input, identity, env, url.origin),
  200,
  origin,
);
```

- [ ] **Step 6: Cập nhật cấu hình Worker mà không ghi secret thật**

Trong `wrangler.jsonc`:

```jsonc
"assets": {
  "directory": "./public",
  "binding": "ASSETS",
  "run_worker_first": ["/api/*", "/webhook*", "/health*", "/reference-image/*"]
},
"vars": {
  "GEMINI_MODEL": "gemini-3.5-flash-lite",
  "GEMINI_FALLBACK_MODEL": "gemini-3.1-flash-lite",
  "META_GRAPH_API_VERSION": "v23.0",
  "META_APP_ID": "1047361974664451"
}
```

Thêm vào `.env.example` đúng các dòng mẫu:

```dotenv
META_APP_ID=your_meta_app_id
META_APP_SECRET=replace_with_cloudflare_secret
WEB_SESSION_SECRET=replace_with_random_32_byte_secret
```

- [ ] **Step 7: Chạy test Worker liên quan rồi chạy toàn bộ**

Run: `node --test test/web-auth.test.js test/web-chat-api.test.js test/messenger-page-worker.test.js`

Expected: PASS.

Run: `npm test`

Expected: PASS toàn bộ suite; đặc biệt test webhook chữ ký và Send API vẫn PASS.

- [ ] **Step 8: Commit route và hợp đồng API**

```powershell
git add -- .env.example wrangler.jsonc src/web-chat-api.js src/messenger-page-worker.js test/web-chat-api.test.js test/messenger-page-worker.test.js
git commit -m "feat: require Facebook login for web chat"
```

Expected: commit không chứa `.env`, token, cookie hoặc giá trị secret production.

---

### Task 3: Facebook SDK và Web Chat client trên website

**Files:**
- Create: `app/lib/facebook-sdk.ts`
- Create: `app/lib/dst-web-chat.ts`
- Modify: `tests/rendered-html.test.mjs`

**Interfaces:**
- Produces: `loginWithFacebook(): Promise<string>` trả access token chỉ trong bộ nhớ.
- Produces: `exchangeFacebookToken(accessToken): Promise<WebSession>`.
- Produces: `sendWebChat(sessionToken, message, pageContext): Promise<WebChatReply>`.
- Produces: `loadWebSession()`, `saveWebSession(session)`, `clearWebSession()`.
- `WebSession = { sessionToken: string; expiresAt: number; profile: { name: string; picture: string } }`.
- `WebChatReply = { answer: string; images: WebChatImage[] }`.

- [ ] **Step 1: Viết source-contract test thất bại**

Thêm test vào `tests/rendered-html.test.mjs`:

```js
test("uses Facebook Login only to create a protected DST web chat session", async () => {
  const [sdkSource, apiSource] = await Promise.all([
    readFile(new URL("../app/lib/facebook-sdk.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/dst-web-chat.ts", import.meta.url), "utf8"),
  ]);
  assert.match(sdkSource, /connect\.facebook\.net\/vi_VN\/sdk\.js/);
  assert.match(sdkSource, /FB\.login/);
  assert.match(sdkSource, /public_profile/);
  assert.match(apiSource, /\/api\/web-auth/);
  assert.match(apiSource, /\/api\/web-chat/);
  assert.match(apiSource, /Authorization.*Bearer/is);
  assert.match(apiSource, /sessionStorage/);
  assert.doesNotMatch(apiSource, /localStorage/);
  assert.doesNotMatch(
    `${sdkSource}\n${apiSource}`,
    /META_APP_SECRET|PAGE_ACCESS_TOKEN|GEMINI_API_KEY|WEB_SESSION_SECRET|c_user|xs=/,
  );
});
```

- [ ] **Step 2: Chạy test và xác nhận thiếu module**

Run: `node --test --test-name-pattern="Facebook Login" tests/rendered-html.test.mjs`

Expected: FAIL với `ENOENT` cho `app/lib/facebook-sdk.ts`.

- [ ] **Step 3: Tạo Facebook SDK loader không lưu access token**

```ts
// app/lib/facebook-sdk.ts
const META_APP_ID = "1047361974664451";
const SDK_ID = "facebook-jssdk";
const SDK_URL = "https://connect.facebook.net/vi_VN/sdk.js";

type LoginResponse = {
  authResponse?: { accessToken?: string };
  status?: string;
};

type FacebookSdk = {
  init(options: { appId: string; cookie: boolean; xfbml: boolean; version: string }): void;
  login(callback: (response: LoginResponse) => void, options: { scope: string }): void;
};

declare global {
  interface Window {
    FB?: FacebookSdk;
    fbAsyncInit?: () => void;
  }
}

let sdkPromise: Promise<FacebookSdk> | undefined;

export function loadFacebookSdk(): Promise<FacebookSdk> {
  if (window.FB) return Promise.resolve(window.FB);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const timeout = window.setTimeout(
      () => reject(new Error("FACEBOOK_SDK_TIMEOUT")),
      15_000,
    );
    window.fbAsyncInit = () => {
      if (!window.FB) {
        reject(new Error("FACEBOOK_SDK_UNAVAILABLE"));
        return;
      }
      window.clearTimeout(timeout);
      window.FB.init({
        appId: META_APP_ID,
        cookie: false,
        xfbml: false,
        version: "v23.0",
      });
      resolve(window.FB);
    };
    if (!document.getElementById(SDK_ID)) {
      const script = document.createElement("script");
      script.id = SDK_ID;
      script.src = SDK_URL;
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.onerror = () => reject(new Error("FACEBOOK_SDK_LOAD_FAILED"));
      document.head.append(script);
    }
  }).catch((error) => {
    document.getElementById(SDK_ID)?.remove();
    sdkPromise = undefined;
    throw error;
  });
  return sdkPromise;
}

export async function loginWithFacebook(): Promise<string> {
  const sdk = await loadFacebookSdk();
  return new Promise((resolve, reject) => {
    sdk.login((response) => {
      const accessToken = response.authResponse?.accessToken;
      if (!accessToken) {
        reject(new Error(response.status === "not_authorized"
          ? "FACEBOOK_NOT_AUTHORIZED"
          : "FACEBOOK_LOGIN_CANCELLED"));
        return;
      }
      resolve(accessToken);
    }, { scope: "public_profile" });
  });
}
```

- [ ] **Step 4: Tạo API client và sessionStorage contract**

```ts
// app/lib/dst-web-chat.ts
const WORKER_URL = "https://dst-group-messenger-ai.longv7393.workers.dev";
const SESSION_KEY = "dst-facebook-web-session-v1";

export type FacebookProfile = { name: string; picture: string };
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
export type WebChatReply = { answer: string; images: WebChatImage[] };

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
  if (!response.ok) throw new WebChatError(response.status, error || "REQUEST_FAILED");
  return body as T;
}

export async function exchangeFacebookToken(accessToken: string): Promise<WebSession> {
  const response = await fetch(`${WORKER_URL}/api/web-auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken }),
  });
  return readJson<WebSession>(response);
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
    body: JSON.stringify({ message, pageContext: pageContext.slice(0, 160) }),
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
    if (!session?.sessionToken || session.expiresAt <= Date.now() || !session.profile?.name) {
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
```

- [ ] **Step 5: Chạy source-contract test, typecheck và commit**

Run: `node --test --test-name-pattern="Facebook Login" tests/rendered-html.test.mjs`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

```powershell
git add -- app/lib/facebook-sdk.ts app/lib/dst-web-chat.ts tests/rendered-html.test.mjs
git commit -m "feat: add Facebook login web chat client"
```

---

### Task 4: Giao diện đăng nhập và chat DST trên website

**Files:**
- Create: `app/FacebookWebChat.tsx`
- Modify: `app/WebsiteApp.tsx`
- Modify: `app/components/FloatingContactButtons.tsx`
- Modify: `app/globals.css`
- Modify: `tests/rendered-html.test.mjs`
- Delete: `app/FacebookMessengerChat.tsx`

**Interfaces:**
- Consumes: `loginWithFacebook`, `exchangeFacebookToken`, `sendWebChat`, session helpers từ Task 3.
- Produces: `FacebookWebChat({ openToken }: { openToken: number })`.
- UI có các trạng thái: panel đóng, chưa đăng nhập, đang đăng nhập, đã đăng nhập, đang gửi, lỗi và session hết hạn.

- [ ] **Step 1: Đổi test giao diện từ iframe sang custom authenticated chat**

Thay test `embeds the real DST Facebook Messenger interface safely` trong
`tests/rendered-html.test.mjs` bằng:

```js
test("renders the authenticated DST web chat without a Facebook iframe", async () => {
  const [chatSource, appSource, floatingSource] = await Promise.all([
    readFile(new URL("../app/FacebookWebChat.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/WebsiteApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/FloatingContactButtons.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(chatSource, /Đăng nhập bằng Facebook/);
  assert.match(chatSource, /loginWithFacebook/);
  assert.match(chatSource, /sendWebChat/);
  assert.match(chatSource, /message\.images/);
  assert.match(chatSource, /Đăng xuất khỏi chat/);
  assert.match(appSource, /FacebookWebChat/);
  assert.doesNotMatch(appSource, /FacebookMessengerChat/);
  assert.match(floatingSource, /tư vấn AI/iu);
  assert.doesNotMatch(chatSource, /facebook\.com\/plugins\/page\.php|<iframe/);
  assert.doesNotMatch(
    `${chatSource}\n${appSource}\n${floatingSource}`,
    /META_APP_SECRET|PAGE_ACCESS_TOKEN|GEMINI_API_KEY|WEB_SESSION_SECRET|c_user|xs=/,
  );
});
```

- [ ] **Step 2: Chạy test và xác nhận component chưa tồn tại**

Run: `node --test --test-name-pattern="authenticated DST web chat" tests/rendered-html.test.mjs`

Expected: FAIL với `ENOENT` cho `app/FacebookWebChat.tsx`.

- [ ] **Step 3: Tạo component chat với state machine xác thực**

Tạo `app/FacebookWebChat.tsx` với các kiểu và state chính xác:

```tsx
"use client";

import { Bot, LogIn, LogOut, MessageCircle, Minimize2, Send, User, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { loadFacebookSdk, loginWithFacebook } from "./lib/facebook-sdk";
import {
  clearWebSession,
  exchangeFacebookToken,
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

const WELCOME = "Xin chào, tôi là trợ lý tư vấn DST Group. Anh/chị cần hỗ trợ dịch vụ nào ạ?";
const QUICK_QUESTIONS = [
  "DST Group có những dịch vụ nào?",
  "Cho tôi xem dự án khách sạn",
  "Tư vấn quản trị Fanpage",
];

function safeImageUrl(value: string) {
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}

export function FacebookWebChat({ openToken }: { openToken: number }) {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<WebSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [sendBusy, setSendBusy] = useState(false);
  const [error, setError] = useState("");
  const nextId = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const restored = loadWebSession();
    setSession(restored);
    if (restored) setMessages([{ id: 0, role: "assistant", text: WELCOME }]);
  }, []);
  useEffect(() => { if (openToken) setOpen(true); }, [openToken]);
  useEffect(() => {
    if (open && !session) void loadFacebookSdk().catch(() => undefined);
  }, [open, session]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sendBusy]);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  function append(role: ChatMessage["role"], text: string, images: WebChatImage[] = []) {
    nextId.current += 1;
    setMessages((current) => [...current, {
      id: nextId.current,
      role,
      text,
      ...(images.length ? { images } : {}),
    }]);
  }

  async function signIn() {
    if (authBusy) return;
    setAuthBusy(true);
    setError("");
    try {
      const facebookAccessToken = await loginWithFacebook();
      const nextSession = await exchangeFacebookToken(facebookAccessToken);
      saveWebSession(nextSession);
      setSession(nextSession);
      setMessages([{ id: 0, role: "assistant", text: WELCOME }]);
    } catch {
      setError("Không thể đăng nhập Facebook. Anh/chị hãy cho phép popup rồi thử lại.");
    } finally {
      setAuthBusy(false);
    }
  }

  function signOut() {
    clearWebSession();
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
      const reply = await sendWebChat(session.sessionToken, question, window.location.pathname);
      append("assistant", reply.answer, reply.images.filter((image) => safeImageUrl(image.url)));
    } catch (requestError) {
      if (requestError instanceof WebChatError && requestError.status === 401) {
        signOut();
        setError("Phiên đăng nhập đã hết hạn. Anh/chị vui lòng đăng nhập lại.");
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
        <div className="web-chat-panel" role="dialog" aria-modal="false" aria-label="Chat tư vấn DST Group">
          <header className="web-chat-header">
            <div><strong><MessageCircle size={18} /> DST Group</strong><small>Trợ lý AI tư vấn trực tuyến</small></div>
            <div className="web-chat-actions">
              <button type="button" onClick={() => setOpen(false)} aria-label="Thu nhỏ chat"><Minimize2 size={18} /></button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Đóng chat"><X size={18} /></button>
            </div>
          </header>

          {!session ? (
            <div className="web-chat-login">
              <Bot size={42} aria-hidden="true" />
              <h2>Tư vấn cùng DST Group</h2>
              <p>Đăng nhập Facebook để bắt đầu cuộc trò chuyện bảo mật ngay trên website.</p>
              <button type="button" onClick={() => void signIn()} disabled={authBusy}>
                <LogIn size={18} /> {authBusy ? "Đang đăng nhập..." : "Đăng nhập bằng Facebook"}
              </button>
              {error ? <p className="web-chat-error" role="alert">{error}</p> : null}
            </div>
          ) : (
            <>
              <div className="web-chat-profile">
                {safeImageUrl(session.profile.picture) ? <img src={session.profile.picture} alt="" /> : <User size={24} />}
                <span><small>Đang tư vấn với</small><strong>{session.profile.name}</strong></span>
                <button type="button" onClick={signOut} title="Đăng xuất khỏi chat"><LogOut size={17} /> Đăng xuất khỏi chat</button>
              </div>
              <div className="web-chat-messages" ref={scrollRef} aria-live="polite">
                {messages.map((message) => (
                  <article className={`web-chat-message ${message.role}`} key={message.id}>
                    <p>{message.text}</p>
                    {message.images?.length ? <div className="web-chat-images">{message.images.map((image) => (
                      <figure key={image.id}>
                        <img src={image.url} alt={image.alt} loading="lazy" />
                        <figcaption>{image.caption}</figcaption>
                        {image.sourceUrl ? <a href={image.sourceUrl} target="_blank" rel="noreferrer">Xem nguồn ảnh</a> : null}
                      </figure>
                    ))}</div> : null}
                  </article>
                ))}
                {sendBusy ? <p className="web-chat-typing">DST đang soạn câu trả lời…</p> : null}
              </div>
              {error ? <p className="web-chat-error" role="alert">{error}</p> : null}
              <div className="web-chat-quick">{QUICK_QUESTIONS.map((question) => (
                <button type="button" key={question} disabled={sendBusy} onClick={() => void submitQuestion(question)}>{question}</button>
              ))}</div>
              <form className="web-chat-input" onSubmit={onSubmit}>
                <input value={input} maxLength={800} onChange={(event) => setInput(event.target.value)} aria-label="Nhập câu hỏi tư vấn" placeholder="Nhập câu hỏi…" />
                <button type="submit" disabled={!input.trim() || sendBusy} aria-label="Gửi câu hỏi"><Send size={18} /></button>
              </form>
            </>
          )}
        </div>
      ) : null}
      <button type="button" className="web-chat-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <MessageCircle size={22} /><span><strong>Chat tư vấn AI</strong><small>Đăng nhập bằng Facebook</small></span>
      </button>
    </section>
  );
}
```

- [ ] **Step 4: Kết nối component mới và xóa iframe cũ**

Trong `app/WebsiteApp.tsx`:

```tsx
// Thay đúng dòng import cũ:
import { FacebookWebChat } from "./FacebookWebChat";

// Thay đúng phần tử chat ở cuối return:
<FacebookWebChat openToken={chatToken} />
```

Xóa import/render `FacebookMessengerChat`. Trong
`app/components/FloatingContactButtons.tsx`, đổi nút chat thành:

```tsx
<button type="button" onClick={onOpenChat} aria-label="Mở tư vấn AI DST Group" title="Chat tư vấn AI">
  <MessageCircle size={19} aria-hidden="true" />
</button>
```

Xóa file `app/FacebookMessengerChat.tsx` bằng patch để không còn Page Plugin.

- [ ] **Step 5: Thay CSS iframe bằng panel responsive**

Xóa block `.messenger-chat*` hiện tại và thêm vào `app/globals.css`:

```css
.web-chat { position: fixed; z-index: 95; right: 20px; bottom: 20px; color: var(--dst-ink); }
.web-chat-panel { display: grid; width: min(420px, calc(100vw - 40px)); max-height: min(720px, calc(100vh - 100px)); margin-bottom: 10px; overflow: hidden; border: 1px solid var(--dst-line-strong); border-radius: 12px; background: var(--dst-paper); box-shadow: 0 24px 64px rgba(20,59,61,.24); }
.web-chat-header { display: flex; min-height: 66px; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; background: var(--dst-deep); color: white; }
.web-chat-header strong, .web-chat-header small, .web-chat-profile span { display: flex; align-items: center; gap: 8px; }
.web-chat-header strong { color: var(--dst-gold); }
.web-chat-header small { margin-top: 3px; color: #d5e5e1; font-size: .78rem; }
.web-chat-actions { display: flex; gap: 6px; }
.web-chat-actions button { display: grid; width: 32px; height: 32px; place-items: center; border: 1px solid rgba(255,255,255,.3); border-radius: 6px; background: transparent; color: white; }
.web-chat-login { display: grid; min-height: 430px; place-items: center; align-content: center; gap: 14px; padding: 36px; text-align: center; }
.web-chat-login h2 { font-size: 1.45rem; }
.web-chat-login p { color: var(--dst-muted); }
.web-chat-login > button { display: inline-flex; min-height: 46px; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 8px; background: #0866ff; color: white; font-weight: 800; }
.web-chat-profile { display: flex; align-items: center; gap: 9px; padding: 9px 12px; border-bottom: 1px solid var(--dst-line); }
.web-chat-profile img { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; }
.web-chat-profile span { display: grid; flex: 1; gap: 0; }
.web-chat-profile small { color: var(--dst-muted); }
.web-chat-profile button { display: inline-flex; align-items: center; gap: 5px; padding: 6px; background: transparent; color: var(--dst-muted); font-size: .74rem; }
.web-chat-messages { display: grid; min-height: 240px; max-height: 330px; gap: 10px; overflow-y: auto; padding: 14px; background: #f4f7f6; }
.web-chat-message { width: fit-content; max-width: 86%; padding: 10px 12px; border-radius: 12px; background: white; box-shadow: 0 3px 10px rgba(20,59,61,.07); white-space: pre-wrap; }
.web-chat-message.user { margin-left: auto; background: var(--dst-deep); color: white; }
.web-chat-images { display: grid; gap: 8px; margin-top: 9px; }
.web-chat-images figure { margin: 0; overflow: hidden; border-radius: 8px; background: white; }
.web-chat-images img { width: 100%; max-height: 210px; object-fit: cover; }
.web-chat-images figcaption, .web-chat-images a { display: block; padding: 5px 7px; color: var(--dst-muted); font-size: .72rem; }
.web-chat-typing, .web-chat-error { padding: 8px 12px; color: var(--dst-muted); font-size: .8rem; }
.web-chat-error { color: #a12b2b; background: #fff2f2; }
.web-chat-quick { display: flex; gap: 6px; overflow-x: auto; padding: 8px 10px; border-top: 1px solid var(--dst-line); }
.web-chat-quick button { flex: 0 0 auto; padding: 6px 9px; border: 1px solid var(--dst-line); border-radius: 999px; background: white; color: var(--dst-deep); font-size: .75rem; }
.web-chat-input { display: grid; grid-template-columns: 1fr 44px; gap: 7px; padding: 10px; border-top: 1px solid var(--dst-line); }
.web-chat-input input { min-width: 0; height: 42px; padding: 0 11px; border: 1px solid var(--dst-line-strong); border-radius: 8px; }
.web-chat-input button { display: grid; place-items: center; border-radius: 8px; background: var(--dst-orange); color: var(--dst-ink); }
.web-chat-input button:disabled, .web-chat-login button:disabled { cursor: not-allowed; opacity: .55; }
.web-chat-toggle { display: flex; min-height: 54px; align-items: center; gap: 9px; margin-left: auto; padding: 8px 13px; border: 1px solid rgba(31,77,80,.24); border-radius: var(--radius); background: var(--dst-deep); box-shadow: var(--dst-shadow); color: var(--dst-cream); }
.web-chat-toggle span { display: grid; text-align: left; }
.web-chat-toggle strong { font-size: .88rem; }
.web-chat-toggle small { color: #c6dbd8; font-size: .72rem; }
.web-chat-toggle > svg { color: var(--dst-gold); }

@media (max-width: 640px) {
  .web-chat { right: 10px; bottom: 10px; }
  .web-chat-panel { width: calc(100vw - 20px); max-height: calc(100vh - 86px); }
  .web-chat-login { min-height: 360px; padding: 24px; }
  .web-chat-messages { max-height: calc(100vh - 360px); }
  .web-chat-profile button { font-size: 0; }
  .web-chat-toggle { width: 54px; justify-content: center; padding: 0; }
  .web-chat-toggle span { display: none; }
}
```

- [ ] **Step 6: Chạy test, typecheck, lint và hai build**

Run: `npm run typecheck`

Expected: PASS.

Run: `npm run lint`

Expected: PASS không có lỗi mới.

Run: `npm run build`

Expected: Vinext build PASS.

Run: `npm run build:github-pages`

Expected: static build PASS và tạo `outputs/gh-pages-dist/index.html`.

Run: `node --test tests/rendered-html.test.mjs`

Expected: PASS toàn bộ test; test xác nhận không còn iframe Page Plugin.

- [ ] **Step 7: Commit giao diện**

```powershell
git add -- app/FacebookWebChat.tsx app/WebsiteApp.tsx app/components/FloatingContactButtons.tsx app/globals.css tests/rendered-html.test.mjs
git rm -- app/FacebookMessengerChat.tsx
git commit -m "feat: add authenticated DST website chat"
```

---

### Task 5: Cấu hình secret, phát hành và kiểm tra tích hợp

**Files:**
- Verify only: `C:/Users/Admin/Documents/nghich du an/wrangler.jsonc`
- Verify only: `C:/Users/Admin/Documents/websiteDST-ai-chat/outputs/gh-pages-dist/`

**Interfaces:**
- Consumes: Worker và website đã vượt test ở Tasks 1–4; tài khoản Cloudflare/Meta đang đăng nhập.
- Produces: Worker auth/chat live và GitHub Pages có giao diện đăng nhập Facebook.

- [ ] **Step 1: Quét secret trước khi deploy**

Run tại Worker repo:

```powershell
git diff --check
rg -n "AQ\.|c_user=|xs=|GEMINI_API_KEY\s*=\s*[^y]|META_APP_SECRET\s*=\s*[^r]|WEB_SESSION_SECRET\s*=\s*[^r]" src test wrangler.jsonc .env.example
```

Expected: `git diff --check` không có output; lệnh `rg` không tìm thấy secret thật.

Run tại website repo:

```powershell
rg -n "META_APP_SECRET|PAGE_ACCESS_TOKEN|GEMINI_API_KEY|WEB_SESSION_SECRET|c_user|xs=" app gh-pages-static outputs/gh-pages-dist
```

Expected: không có match.

- [ ] **Step 2: Tạo và đặt web session secret mà không in ra màn hình**

Run tại Worker repo:

```powershell
$secretNames = npx wrangler secret list
$secretNames
$secretBytes = New-Object byte[] 48
[Security.Cryptography.RandomNumberGenerator]::Fill($secretBytes)
$generatedWebSessionSecret = [Convert]::ToBase64String($secretBytes)
$generatedWebSessionSecret | npx wrangler secret put WEB_SESSION_SECRET
$generatedWebSessionSecret = $null
```

Expected: danh sách ban đầu có `GEMINI_API_KEY`, `META_APP_SECRET`,
`META_PAGE_ACCESS_TOKEN`, `META_VERIFY_TOKEN`; Wrangler xác nhận secret
`WEB_SESSION_SECRET` đã được lưu và terminal không in giá trị secret.

`META_APP_SECRET` đã được Worker dùng để xác minh webhook; không đọc hoặc ghi lại giá trị. Nếu Wrangler báo secret này chưa tồn tại, dừng deploy và yêu cầu chủ app nhập lại qua `npx wrangler secret put META_APP_SECRET`.

- [ ] **Step 3: Deploy Worker và probe endpoint**

Run:

```powershell
npm run deploy:messenger-page
curl.exe -sS https://dst-group-messenger-ai.longv7393.workers.dev/health
curl.exe -sS -i -X POST https://dst-group-messenger-ai.longv7393.workers.dev/api/web-chat -H "Origin: https://themalay238232.github.io" -H "Content-Type: application/json" --data "{\"message\":\"xin chào\",\"pageContext\":\"/\"}"
```

Expected: health trả `200` với `"ok":true`; Web Chat không Bearer token trả `401` với `Authentication required` và đúng CORS origin.

- [ ] **Step 4: Cấu hình Meta App bằng đúng production domain**

Trong Meta for Developers, mở app ID `1047361974664451` và đặt:

```text
App Domains: themalay238232.github.io
Website Site URL: https://themalay238232.github.io/websiteDST-ai-chat/
Facebook Login for Web: Enabled
Valid OAuth Redirect URI: https://themalay238232.github.io/websiteDST-ai-chat/
```

Expected: Meta lưu cấu hình không báo domain/redirect không hợp lệ. Khi test với người ngoài vai trò app, chuyển app sang Live và hoàn thành mục `Hành động cần thực hiện` mà Meta hiển thị.

- [ ] **Step 5: Push website lên personal main và đợi GitHub Pages**

Run tại website repo:

```powershell
git status --short
git push -u personal codex/facebook-login-web-chat
git push personal codex/facebook-login-web-chat:main
```

Expected: cả hai push thành công; GitHub Pages workflow trên personal repo chạy từ `main`.

- [ ] **Step 6: Kiểm tra live bằng trình duyệt ở desktop và mobile**

Mở `https://themalay238232.github.io/websiteDST-ai-chat/` và xác nhận:

```text
1. Nút “Chat tư vấn AI” mở panel, không có iframe trắng.
2. “Đăng nhập bằng Facebook” mở popup Meta, không chuyển trang chính.
3. Sau login, tên/ảnh khách hiển thị và access token không xuất hiện trong URL/localStorage.
4. Câu “DST Group có những dịch vụ nào?” nhận đúng một phản hồi.
5. Câu “Cho tôi xem ảnh dự án khách sạn” hiển thị tối đa hai ảnh HTTPS có chú thích.
6. Câu “Khách sạn ở Vân Đồn nằm ở đâu?” nhận văn bản/link bản đồ phù hợp, không ghép rác từ tin trước.
7. Thu nhỏ/mở lại giữ phiên trong cùng tab; đăng xuất xóa sessionStorage và khóa form chat.
8. Màn hình 390×844 không che nút gửi, tin nhắn không bị cắt và panel cuộn được.
```

- [ ] **Step 7: Kiểm tra tài khoản công khai và hồi quy Messenger**

Đăng nhập bằng một Facebook account không có vai trò trong Meta App. Expected:
login và chat thành công khi app Live; nếu chỉ account có vai trò app dùng được thì
ghi nhận blocker cấu hình Meta, không báo code hoàn thành công khai.

Gửi `xin chào` vào Page DST Group qua Messenger. Expected: webhook hiện tại vẫn
trả lời trong Messenger, độc lập với lịch sử website.

- [ ] **Step 8: Ghi nhận trạng thái phát hành**

Run tại cả hai repo:

```powershell
git status --short --branch
```

Expected: website sạch; Worker không có thay đổi mới ngoài những file người dùng
đã có trước task. Báo rõ URL live, test/build đã chạy, trạng thái Meta Live và bất
kỳ bước cấu hình ngoài code nào chưa thể xác minh.
