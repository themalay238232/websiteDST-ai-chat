import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the DST landing page and AI chat launcher", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /DST Group \| Marketing, Media và Branding toàn diện/i);
  assert.match(html, /Tư vấn AI/);
  assert.match(html, /Phản hồi nhanh/);
  assert.doesNotMatch(html, /Your site is taking shape|Codex is working/);
});

test("connects the website chat to the shared Messenger AI safely", async () => {
  const [chatSource, staticIndex, css] = await Promise.all([
    readFile(new URL("../app/AiConsultantChat.tsx", import.meta.url), "utf8"),
    readFile(new URL("../gh-pages-static/index.html", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(chatSource, /crypto\.randomUUID/);
  assert.match(chatSource, /dst-web-chat-session-v1/);
  assert.match(chatSource, /pageContext/);
  assert.match(chatSource, /message\.images/);
  assert.match(chatSource, /loading="lazy"/);
  assert.match(css, /\.ai-message-images/);
  assert.match(staticIndex, /dst-group-messenger-ai\.longv7393\.workers\.dev\/api\/web-chat/);
  assert.doesNotMatch(chatSource, /OPENAI_API_KEY|GEMINI_API_KEY/);
  assert.doesNotMatch(staticIndex, /api[_-]?key\s*[:=]\s*["'][^"']+/i);
});
