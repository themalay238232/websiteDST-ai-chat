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
  const [viteConfig, fallback, robots, sitemap, chatSource, staticIndex] = await Promise.all([
    readFile(new URL("../gh-pages-static/vite.config.mjs", import.meta.url), "utf8"),
    outputFile("404.html"),
    outputFile("robots.txt"),
    outputFile("sitemap.xml"),
    readFile(new URL("../app/AiConsultantChat.tsx", import.meta.url), "utf8"),
    readFile(new URL("../gh-pages-static/index.html", import.meta.url), "utf8"),
  ]);

  assert.match(viteConfig, /base:\s*["']\/websiteDST-ai-chat\/["']/);
  assert.match(fallback, /\?p=/);
  assert.match(robots, /websiteDST-ai-chat\/sitemap\.xml/);
  assert.match(sitemap, /dich-vu\/marketing/);
  assert.match(chatSource, /localStorage/);
  assert.match(chatSource, /pageContext/);
  assert.doesNotMatch(chatSource, /OPENAI_API_KEY|GEMINI_API_KEY/);
  assert.doesNotMatch(staticIndex, /api[_-]?key\s*[:=]\s*["'][^"']+/i);
});
