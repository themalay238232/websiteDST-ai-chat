# Persistent Image Website Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve an anonymous website conversation for 30 days and let customers send one validated image per message for Gemini analysis, with complete image/history visibility in the customer chat and unified inbox.

**Architecture:** The signed guest token becomes a 30-day anonymous credential stored in browser `localStorage`. Cloudflare Worker endpoints restore only the authenticated guest's archived thread, validate/store image bytes in KV under an unguessable ID, and pass owned image bytes to the existing Gemini multimodal path. The React widget compresses/uploads images, sends text plus the server-issued upload ID, and restores history on return.

**Tech Stack:** React/TypeScript, Cloudflare Workers, Workers KV, Web Crypto, Gemini multimodal API, Node test runner, ESLint, Playwright CLI.

## Global Constraints

- Session and conversation retention is 30 days.
- One customer image per message.
- Maximum processed image size is 2 MB and maximum client dimension is 1600 px.
- Accepted image types are JPEG, PNG, and WebP.
- History remains anonymous and browser-specific; cross-device restoration is out of scope.
- Remote customer-supplied image URLs are rejected.
- No API key, Meta token, guest token, or admin token may appear in source, logs, archived messages, or image URLs.

---

### Task 1: Extend and restore anonymous guest sessions

**Files:**
- Modify: `C:/Users/Admin/Documents/nghich du an/src/web-auth.js`
- Modify: `C:/Users/Admin/Documents/nghich du an/src/messenger-page-worker.js`
- Modify: `C:/Users/Admin/Documents/nghich du an/test/web-auth.test.js`
- Modify: `C:/Users/Admin/Documents/nghich du an/test/messenger-page-worker.test.js`

**Interfaces:**
- Consumes: `issueGuestWebSession({ secret, now })`, `verifyWebSession(token, { secret, now })`, and archived thread storage.
- Produces: 30-day `sessionToken` claims, authenticated `GET /api/web-history -> { conversation }`, and ownership-derived `DELETE /api/web-history`.

- [ ] **Step 1: Write failing tests for 30-day expiry and ownership-derived history/deletion**

```js
assert.equal(issued.expiresAt, NOW + 30 * 24 * 60 * 60 * 1_000);
const response = await worker.fetch(webHistoryRequest({ sessionToken: session.sessionToken }), env);
assert.equal(response.status, 200);
assert.equal((await response.json()).conversation.id, verifiedClaims.sub);
const deleted = await worker.fetch(webHistoryDeleteRequest({ sessionToken: session.sessionToken }), env);
assert.equal(deleted.status, 204);
```

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `node --test test/web-auth.test.js test/messenger-page-worker.test.js`

Expected: expiry assertion and missing `/api/web-history` route fail.

- [ ] **Step 3: Implement 30-day claims and authenticated history/deletion**

```js
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

if (request.method === "GET" && url.pathname === "/api/web-history") {
  const identity = await verifyWebSession(readBearerToken(request), {
    secret: required(env, "WEB_SESSION_SECRET"),
    now,
  });
  const conversation = await readArchivedInboxThread(env.CONVERSATIONS, "web", identity.sub);
  return webJsonResponse({ conversation: conversation ?? null }, 200, origin);
}
```

The delete route derives the same `identity.sub`, removes only that archived web thread and its owned uploads, and never accepts a conversation ID from the browser.

- [ ] **Step 4: Run focused tests and confirm pass**

Run: `node --test test/web-auth.test.js test/messenger-page-worker.test.js`

Expected: all focused tests pass.

### Task 2: Add secure website image storage

**Files:**
- Create: `C:/Users/Admin/Documents/nghich du an/src/web-image-upload.js`
- Create: `C:/Users/Admin/Documents/nghich du an/test/web-image-upload.test.js`
- Modify: `C:/Users/Admin/Documents/nghich du an/src/messenger-page-worker.js`
- Modify: `C:/Users/Admin/Documents/nghich du an/wrangler.jsonc`

**Interfaces:**
- Produces: `validateWebImage(bytes, declaredType)`, `storeWebImage(namespace, { ownerId, bytes, mimeType, now })`, `readOwnedWebImage(namespace, uploadId, ownerId)`, and `GET /web-upload/:id`.
- Produces: authenticated `POST /api/web-upload -> { uploadId, image: { url, alt } }`.

- [ ] **Step 1: Write validation/storage tests**

```js
assert.equal(validateWebImage(jpegBytes, "image/jpeg").mimeType, "image/jpeg");
assert.throws(() => validateWebImage(new Uint8Array([1, 2, 3]), "image/jpeg"));
await assert.rejects(() => readOwnedWebImage(kv, uploadId, "another-owner"));
```

Cover JPEG/PNG/WebP magic bytes, unsupported MIME, 2 MB limit, random IDs, 30-day TTL, owner mismatch, and missing objects.

- [ ] **Step 2: Run upload tests and confirm failure**

Run: `node --test test/web-image-upload.test.js`

Expected: module is missing.

- [ ] **Step 3: Implement upload validation and KV storage**

```js
export const MAX_WEB_IMAGE_BYTES = 2 * 1024 * 1024;
export const WEB_IMAGE_TTL_SECONDS = 30 * 24 * 60 * 60;

export function validateWebImage(bytes, declaredType) {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength === 0 || bytes.byteLength > MAX_WEB_IMAGE_BYTES) {
    throw new TypeError("Invalid image size");
  }
  const detected = detectMagicMime(bytes);
  if (!detected || detected !== declaredType) throw new TypeError("Invalid image type");
  return { bytes, mimeType: detected };
}
```

Store bytes at `web-image:v1:<random UUID>` and JSON ownership metadata at `web-image-meta:v1:<UUID>` with the same TTL. Never include owner or token in the public URL.

- [ ] **Step 4: Add authenticated upload and safe image-serving routes**

`POST /api/web-upload` verifies the bearer session, rate-limits by guest/IP, checks `Content-Length`, validates magic bytes, stores the upload, and returns an HTTPS Worker URL. `GET /web-upload/:id` returns only stored validated bytes with `Content-Type`, `Cache-Control: private, max-age=3600`, and `X-Content-Type-Options: nosniff`.

- [ ] **Step 5: Run upload and Worker tests**

Run: `node --test test/web-image-upload.test.js test/messenger-page-worker.test.js`

Expected: all tests pass.

### Task 3: Send customer images through Gemini and archive them

**Files:**
- Modify: `C:/Users/Admin/Documents/nghich du an/src/web-chat-api.js`
- Modify: `C:/Users/Admin/Documents/nghich du an/src/messenger-page-worker.js`
- Modify: `C:/Users/Admin/Documents/nghich du an/test/web-chat-api.test.js`
- Modify: `C:/Users/Admin/Documents/nghich du an/test/messenger-page-worker.test.js`

**Interfaces:**
- `parseWebChatRequest(body) -> { message, pageContext, uploadId }` where either `message` or `uploadId` is required.
- `readOwnedWebImage(...) -> { bytes, mimeType, publicUrl }` feeds `{ mimeType, data }` to `handleWebMessage`.

- [ ] **Step 1: Write failing parsing and multimodal integration tests**

```js
assert.deepEqual(parseWebChatRequest({ message: "", pageContext: "/", uploadId: validId }), {
  message: "",
  pageContext: "/",
  uploadId: validId,
});
assert.deepEqual(geminiCalls[0].image, { mimeType: "image/jpeg", data: expectedBase64 });
```

Also assert owner mismatch returns 400/403 and the archived user message contains the safe image URL.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `node --test test/web-chat-api.test.js test/messenger-page-worker.test.js`

Expected: upload ID is rejected or ignored and Gemini receives no image.

- [ ] **Step 3: Implement owned image lookup, Gemini inline data, and archiving**

Load only a server-issued upload ID owned by `identity.sub`; convert bytes to base64; pass `data.image`; archive the customer image as `{ url, alt: "Ảnh khách hàng gửi" }`; keep bot image behavior unchanged.

- [ ] **Step 4: Run focused and full backend tests**

Run: `npm test`

Expected: all backend tests pass with no secret in fixtures or snapshots.

### Task 4: Persist browser session and restore history

**Files:**
- Modify: `app/lib/dst-web-chat.ts`
- Modify: `app/DstWebChat.tsx`
- Modify: `tests/rendered-html.test.mjs`

**Interfaces:**
- Produces: `loadWebHistory(sessionToken): Promise<WebChatMessage[]>`.
- Changes session storage key implementation from `window.sessionStorage` to `window.localStorage`.
- Produces: `deleteWebHistory(sessionToken)` for the explicit confirmed deletion action.

- [ ] **Step 1: Extend rendered contract tests**

Assert the built client contains `/api/web-history`, `localStorage`, and 30-day restoration copy while continuing to exclude secrets.

- [ ] **Step 2: Run the rendered test and confirm failure**

Run: `npm run build:github-pages && node --test tests/rendered-html.test.mjs`

Expected: history/localStorage assertions fail.

- [ ] **Step 3: Implement local persistence and history loading**

```ts
export async function loadWebHistory(sessionToken: string): Promise<WebChatMessage[]> {
  const response = await fetch(`${WORKER_URL}/api/web-history`, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  const data = await readJson<{ conversation: { messages?: WebChatMessage[] } | null }>(response);
  return Array.isArray(data.conversation?.messages) ? data.conversation.messages : [];
}
```

On mount, validate the local token then restore history. Explicit deletion calls the authenticated delete endpoint before clearing local state; closing/minimizing does not.

- [ ] **Step 4: Run typecheck and rendered tests**

Run: `npm run typecheck && npm run build:github-pages && node --test tests/rendered-html.test.mjs`

Expected: all pass.

### Task 5: Add customer image composition UI

**Files:**
- Create: `app/lib/dst-image-upload.ts`
- Modify: `app/lib/dst-web-chat.ts`
- Modify: `app/DstWebChat.tsx`
- Modify: `app/globals.css`
- Modify: `tests/rendered-html.test.mjs`

**Interfaces:**
- `prepareChatImage(file: File): Promise<{ blob: Blob; previewUrl: string; alt: string }>`.
- `uploadWebImage(sessionToken: string, blob: Blob): Promise<{ uploadId: string; image: WebChatImage }>`.
- `sendWebChat(sessionToken, message, pageContext, uploadId?)`.

- [ ] **Step 1: Add failing UI/build contract tests**

Assert the built widget has an image input accepting `.jpg,.jpeg,.png,.webp`, image preview/removal controls, upload endpoint, and accessible Vietnamese labels.

- [ ] **Step 2: Run tests and confirm failure**

Run: `npm run build:github-pages && node --test tests/rendered-html.test.mjs`

Expected: upload UI assertions fail.

- [ ] **Step 3: Implement safe client image preparation**

Validate the original browser MIME/type, decode with `createImageBitmap` or `HTMLImageElement`, resize to fit 1600x1600, encode JPEG/WebP at controlled quality, and reject output over 2 MB. Revoke every preview object URL on remove/unmount.

- [ ] **Step 4: Implement upload/send states and rendering**

Add attachment button, hidden file input, preview card, remove action, disabled/progress states, retry-safe errors, image-only send, and user-image bubbles. Change `Kết thúc` to a confirmed `Xóa cuộc trò chuyện` action.

- [ ] **Step 5: Run frontend checks**

Run: `npm run typecheck && npm run lint && npm test`

Expected: typecheck, lint, build, and all rendered tests pass.

### Task 6: Security and production verification

**Files:**
- Modify only files required by failures found during verification.

**Interfaces:**
- Production endpoints and deployed GitHub Pages/Worker.

- [ ] **Step 1: Run full backend and frontend suites**

Backend: `npm test` in `C:/Users/Admin/Documents/nghich du an`.

Frontend: `npm run typecheck && npm run lint && npm test` in `C:/Users/Admin/Documents/websiteDST-ai-chat`.

Expected: every test passes.

- [ ] **Step 2: Run security checks**

Verify unauthenticated history/upload requests return 401, invalid MIME/magic/oversize return 400/413, another session cannot use an upload ID, CORS allows only approved website origins, and `rg` finds no new hardcoded key/token.

- [ ] **Step 3: Deploy backend and push frontend**

Deploy Worker with the existing Wrangler configuration. Commit only task-owned backend files, preserving unrelated dirty-worktree changes. Push the website branch and `main` to the `personal` remote.

- [ ] **Step 4: Validate production in a real browser**

Test desktop and mobile flows for text-only, image-only, text-plus-image, page reload, browser reopen, explicit deletion, bot-sent image rendering, and unified inbox rendering. Confirm GitHub Pages workflow succeeds and production console has no errors.
