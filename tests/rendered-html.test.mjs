import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const outputRoot = new URL("../outputs/gh-pages-dist/", import.meta.url);

async function outputFile(relativePath) {
  return readFile(new URL(relativePath, outputRoot), "utf8");
}

test("exports every required public route with individual metadata", async () => {
  const routes = [
    "index.html",
    "gioi-thieu/index.html",
    "dich-vu/index.html",
    "dich-vu/marketing/index.html",
    "dich-vu/media/index.html",
    "dich-vu/branding/index.html",
    "dich-vu/thiet-ke-website/index.html",
    "dich-vu/truyen-thong/index.html",
    "dich-vu/to-chuc-su-kien/index.html",
    "du-an/index.html",
    "tin-tuc/index.html",
    "tuyen-dung/index.html",
    "lien-he/index.html",
    "chinh-sach-bao-mat/index.html",
    "dieu-khoan-su-dung/index.html",
  ];

  await Promise.all(routes.map((route) => access(new URL(route, outputRoot))));
  const [home, marketing, article] = await Promise.all([
    outputFile("index.html"),
    outputFile("dich-vu/marketing/index.html"),
    outputFile("tin-tuc/xay-dung-ke-hoach-marketing-tu-muc-tieu-kinh-doanh/index.html"),
  ]);

  assert.match(home, /<meta charset="UTF-8"/i);
  assert.match(home, /DST Group \| Marketing, Media &amp; Branding/);
  assert.match(marketing, /Marketing &amp; Quảng cáo/);
  assert.match(article, /Xây dựng kế hoạch marketing/);
});

test("keeps GitHub Pages base paths, fallback routing, SEO files, and no frontend secret", async () => {
  const [viteConfig, fallback, robots, sitemap, staticIndex] = await Promise.all([
    readFile(new URL("../gh-pages-static/vite.config.mjs", import.meta.url), "utf8"),
    outputFile("404.html"),
    outputFile("robots.txt"),
    outputFile("sitemap.xml"),
    readFile(new URL("../gh-pages-static/index.html", import.meta.url), "utf8"),
  ]);

  assert.match(viteConfig, /base:\s*["']\/websiteDST-ai-chat\/["']/);
  assert.match(fallback, /\?p=/);
  assert.match(robots, /websiteDST-ai-chat\/sitemap\.xml/);
  assert.match(sitemap, /dich-vu\/marketing/);
  assert.doesNotMatch(staticIndex, /api[_-]?key\s*[:=]\s*["'][^"']+/i);
});

test("creates protected guest sessions for website chat", async () => {
  const apiSource = await readFile(new URL("../app/lib/dst-web-chat.ts", import.meta.url), "utf8");

  assert.match(apiSource, /\/api\/guest-session/);
  assert.match(apiSource, /\/api\/web-chat/);
  assert.match(apiSource, /Authorization.*Bearer/is);
  assert.match(apiSource, /sessionStorage/);
  assert.doesNotMatch(apiSource, /localStorage/);
  assert.doesNotMatch(
    apiSource,
    /META_APP_SECRET|PAGE_ACCESS_TOKEN|GEMINI_API_KEY|WEB_SESSION_SECRET|c_user|xs=/,
  );
});

test("renders public DST web chat with Messenger handoff", async () => {
  const [chatSource, appSource, floatingSource] = await Promise.all([
    readFile(new URL("../app/DstWebChat.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/WebsiteApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/FloatingContactButtons.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(chatSource, /Bắt đầu tư vấn/);
  assert.match(chatSource, /createGuestSession/);
  assert.match(chatSource, /sendWebChat/);
  assert.match(chatSource, /message\.images/);
  assert.match(chatSource, /Tiếp tục trên Messenger/);
  assert.match(chatSource, /m\.me\/61592072642755/);
  assert.match(appSource, /DstWebChat/);
  assert.doesNotMatch(appSource, /FacebookMessengerChat/);
  assert.doesNotMatch(appSource, /AiConsultantChat/);
  assert.doesNotMatch(appSource, /FacebookWebChat/);
  assert.match(floatingSource, /tư vấn AI/iu);
  assert.doesNotMatch(chatSource, /facebook\.com\/plugins\/page\.php|<iframe|loginWithFacebook/);
  assert.doesNotMatch(
    `${chatSource}\n${appSource}\n${floatingSource}`,
    /PAGE_ACCESS_TOKEN|APP_SECRET|GEMINI_API_KEY|c_user|xs=/,
  );
});
