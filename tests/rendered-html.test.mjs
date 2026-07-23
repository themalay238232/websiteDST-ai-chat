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
  assert.match(apiSource, /\/api\/web-history/);
  assert.match(apiSource, /Authorization.*Bearer/is);
  assert.match(apiSource, /localStorage/);
  assert.doesNotMatch(apiSource, /sessionStorage/);
  assert.doesNotMatch(
    apiSource,
    /META_APP_SECRET|PAGE_ACCESS_TOKEN|GEMINI_API_KEY|WEB_SESSION_SECRET|c_user|xs=/,
  );
});

test("renders a public Messenger-style DST web chat without redirecting customers", async () => {
  const [chatSource, apiSource, imageSource, appSource, floatingSource] = await Promise.all([
    readFile(new URL("../app/DstWebChat.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/dst-web-chat.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/dst-image-upload.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/WebsiteApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/FloatingContactButtons.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(chatSource, /Bắt đầu chat ngay/);
  assert.match(chatSource, /createGuestSession/);
  assert.match(chatSource, /sendWebChat/);
  assert.match(chatSource, /loadWebHistory/);
  assert.match(chatSource, /Xóa cuộc trò chuyện/);
  assert.match(chatSource, /30 ngày/);
  assert.match(chatSource, /message\.images/);
  assert.match(chatSource, /\.jpg,\.jpeg,\.png,\.webp,image\/jpeg,image\/png,image\/webp/);
  assert.match(chatSource, /Chọn ảnh gửi cho trợ lý/);
  assert.match(chatSource, /Xóa ảnh đã chọn/);
  assert.match(apiSource, /\/api\/web-upload/);
  assert.match(apiSource, /uploadWebImage/);
  assert.match(imageSource, /1_600/);
  assert.match(imageSource, /2 \* 1024 \* 1024/);
  assert.match(imageSource, /canvas/);
  assert.match(chatSource, /Đang hoạt động/);
  assert.doesNotMatch(chatSource, /m\.me\/|Mở Messenger|Tiếp tục trên Messenger/);
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

test("leads the DST homepage with real project proof and a branded web-chat surface", async () => {
  const [homeSource, chatSource, headerSource] = await Promise.all([
    readFile(new URL("../app/pages/HomePage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/DstWebChat.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/Header.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(homeSource, /hero-project-sheet/);
  assert.match(homeSource, /Dự án nổi bật/);
  assert.match(homeSource, /Chat tư vấn/);
  assert.match(chatSource, /Trợ lý tư vấn trực tuyến/);
  assert.match(headerSource, /Marketing · Media · Branding/);
});

test("adds a protected unified inbox for website and real Messenger conversations", async () => {
  const [pageSource, apiSource, appSource] = await Promise.all([
    readFile(new URL("../app/pages/InboxPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/dst-inbox.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/WebsiteApp.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(pageSource, /Hộp thư DST/);
  assert.match(pageSource, /Cuộc trò chuyện Messenger thật/);
  assert.match(pageSource, /replyToMessenger/);
  assert.match(apiSource, /\/api\/admin\/inbox/);
  assert.match(apiSource, /\/api\/admin\/conversation/);
  assert.match(apiSource, /\/api\/admin\/reply/);
  assert.match(apiSource, /sessionStorage/);
  assert.match(appSource, /\/hop-thu/);
  assert.doesNotMatch(`${pageSource}\n${apiSource}`, /PAGE_ACCESS_TOKEN|META_APP_SECRET|ADMIN_INBOX_TOKEN/);
});
