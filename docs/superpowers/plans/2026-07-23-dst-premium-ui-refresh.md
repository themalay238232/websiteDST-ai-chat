# DST Premium UI Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Refresh the public DST home page and web chat into a premium agency experience without changing routes, data contracts, Worker APIs, or chat behavior.

**Architecture:** Recompose HomePage from existing data-backed project/service components and add scoped CSS in globals.css for the portfolio-led hero, visual hierarchy, responsive layout, and chat skin. Existing DstWebChat state, upload, API calls, and session storage remain unchanged.

**Tech Stack:** React, TypeScript, Vinext/Vite, CSS, Lucide icons, Node test runner.

## Global Constraints

- Reuse only current public/assets; add no external image, font, or CDN dependency.
- Keep current routes, AppLink destinations, Worker URLs, chat APIs, session storage, upload behavior, and accessibility labels.
- Do not add unverified client claims, metrics, prices, or services.
- Preserve keyboard focus, reduced-motion support, responsive behavior, and 44px primary chat controls.

---

### Task 1: Create the portfolio-led home hero

**Files:**
- Modify: app/pages/HomePage.tsx
- Modify: tests/rendered-html.test.mjs

**Interfaces:**
- Consumes: projects, services, AppLink, Reveal, ProjectCard, onNavigate, and onOpenChat.
- Produces: home-hero-contact-sheet, hero-proof-line, and featured-projects markup built from project data.

- [ ] **Step 1: Write the failing home assertion**

Add:

    assert.match(homeHtml, /home-hero-contact-sheet/);
    assert.match(homeHtml, /Dự án nổi bật/);
    assert.match(homeHtml, /Chat tư vấn/);

- [ ] **Step 2: Run it**

Run: node --test tests/rendered-html.test.mjs

Expected: FAIL because the contact-sheet class and featured-project label are absent.

- [ ] **Step 3: Implement the contact sheet and conversion order**

Replace the abstract logo-only hero stage with three existing project links. Use current image, imageAlt, industryLabel, title, and the existing /du-an/ + project.slug destination.

    <div className="home-hero-contact-sheet" aria-label="Một số dự án tiêu biểu của DST Group">
      {projects.slice(0, 3).map((project, index) => (
        <AppLink
          className={["hero-project", "hero-project-" + (index + 1)].join(" ")}
          key={project.slug}
          to={"/du-an/" + project.slug}
          onNavigate={onNavigate}
        >
          <img src={assetPath(project.image)} alt={project.imageAlt || project.title} />
          <span>{project.industryLabel}</span>
        </AppLink>
      ))}
    </div>

Place the existing project grid directly after the capability strip under “Dự án nổi bật”. Keep the services grid directly after it. Make the secondary hero action call onOpenChat() so it opens the current chat.

- [ ] **Step 4: Re-run the rendered test**

Run: node --test tests/rendered-html.test.mjs

Expected: PASS with all existing static-route assertions.

- [ ] **Step 5: Commit**

Run:
    git add app/pages/HomePage.tsx tests/rendered-html.test.mjs
    git commit -m "feat: lead DST homepage with project proof"

### Task 2: Apply the approved premium visual system

**Files:**
- Modify: app/components/Header.tsx
- Modify: app/components/CTASection.tsx
- Modify: app/components/ProjectCard.tsx
- Modify: app/globals.css

**Interfaces:**
- Consumes: existing navigation, AppLink, BrandLogo, headings, and project data.
- Produces: header-eyebrow and visual-only CSS for cards, contact-sheet geometry, header state, CTA, and mobile layout.

- [ ] **Step 1: Add navigation/CTA guard assertions**

Add:

    assert.match(homeHtml, /DST Group Marketing & Media/);
    assert.match(homeHtml, /Nhận tư vấn/);
    assert.doesNotMatch(homeHtml, /facebook\.com\/dialog/);

- [ ] **Step 2: Implement only presentational structure**

Add a non-interactive header-eyebrow reading “Marketing · Media · Branding” in the brand area. Preserve dropdown state, focus trap, CTA route, project text/data/order, and every AppLink destination.

- [ ] **Step 3: Implement the visual direction**

Use ink green #123C3B, harbor green #205A58, signal amber #E89B2E, paper #FAF7F0, slate #1B292B, and mist #E7EEEA.

Add contact-sheet geometry and restrained hover motion:

    .home-hero-contact-sheet { position: relative; min-height: 460px; }
    .hero-project { position: absolute; overflow: hidden; border: 1px solid rgba(18, 60, 59, .18); }
    .hero-project img { width: 100%; height: 100%; object-fit: cover; transition: transform 360ms ease; }
    .hero-project:hover img { transform: scale(1.04); }
    @media (prefers-reduced-motion: reduce) { .hero-project img { transition: none; } }

Replace the generic hero-stage rules with this geometry. Add a one-column contact sheet below 860px, improve the amber CTA and active nav indicator, and make project cards lift only on hover/focus.

- [ ] **Step 4: Run static checks**

Run: npm run typecheck && npm run lint && node --test tests/rendered-html.test.mjs

Expected: Exit code 0, no TypeScript or ESLint errors, all rendered assertions pass.

- [ ] **Step 5: Commit**

Run:
    git add app/components/Header.tsx app/components/CTASection.tsx app/components/ProjectCard.tsx app/globals.css tests/rendered-html.test.mjs
    git commit -m "feat: refine DST premium visual system"

### Task 3: Refresh the chat surface without changing behavior

**Files:**
- Modify: app/DstWebChat.tsx
- Modify: app/globals.css
- Modify: tests/rendered-html.test.mjs

**Interfaces:**
- Consumes: existing DstWebChat state and createGuestSession, loadWebHistory, uploadWebImage, sendWebChat, and deleteWebHistory calls.
- Produces: presentation-only chat classes while retaining the labels “Mở chat tư vấn DST Group”, “Chọn ảnh gửi cho trợ lý”, “Gửi câu hỏi”, and “Xóa cuộc trò chuyện”.

- [ ] **Step 1: Protect chat behavior with assertions**

Add:

    assert.match(chatSource, /Chọn ảnh gửi cho trợ lý/);
    assert.match(chatSource, /Xóa cuộc trò chuyện/);
    assert.match(chatSource, /30 ngày/);
    assert.match(chatSource, /uploadWebImage/);

- [ ] **Step 2: Add presentational chat markup only**

Add classes/wrappers for an assistant identity line, quick-question label, and attachment hint. Do not change state declarations, API invocations, form behavior, button labels, URL validation, or deletion confirmation.

- [ ] **Step 3: Apply DST chat CSS and mobile rules**

Replace platform-blue styling with harbor green, ink green, paper, and amber while retaining high contrast:

    @media (max-width: 640px) {
      .web-chat { inset: auto 0 0; }
      .web-chat-panel { width: 100vw; height: min(100dvh - 12px, 720px); }
      .web-chat-input button { width: 44px; height: 44px; }
    }

Do not prevent message scrolling or hide the composer.

- [ ] **Step 4: Run full validation**

Run: npm run typecheck && npm run lint && npm test

Expected: Exit code 0; app build, GitHub Pages build, and all rendered tests pass.

- [ ] **Step 5: Commit**

Run:
    git add app/DstWebChat.tsx app/globals.css tests/rendered-html.test.mjs
    git commit -m "feat: refine DST assistant visual experience"

### Task 4: Inspect and release

**Files:**
- Modify: none unless browser inspection finds a regression.

- [ ] **Step 1: Inspect desktop and mobile with a browser**

At desktop and 390px widths verify header navigation, consultation CTA, project image alt text, chat open/close, image attachment, send input, and delete conversation remain reachable.

- [ ] **Step 2: Check repository and release**

Run:
    git diff --check
    git status --short
    git push personal codex/facebook-login-web-chat
    git push personal codex/facebook-login-web-chat:main

Expected: no whitespace errors and personal main moves to the release commit.

- [ ] **Step 3: Confirm GitHub Pages and production**

Run: gh run list --repo themalay238232/websiteDST-ai-chat --limit 1

Expected: latest Deploy GitHub Pages reports success, followed by HTTP 200 at https://themalay238232.github.io/websiteDST-ai-chat/

