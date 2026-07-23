# DST premium website UI refresh

## Goal

Make the DST Group website feel like a credible, premium marketing and media studio while making the next customer action obvious: view relevant work or begin a consultation. The existing routes, content model, Worker APIs, and web-chat behavior remain unchanged.

## Audience and page job

Visitors are prospective Vietnamese SME clients who need proof of capability before they contact DST. The home page must quickly establish what DST does, show real project work, and make the AI consultation available without competing with the page content.

## Visual direction

- **Ink green** `#123C3B`: brand authority and primary navigation.
- **Harbor green** `#205A58`: surfaces and chat identity.
- **Signal amber** `#E89B2E`: high-intent actions and small accents.
- **Paper** `#FAF7F0`: warm reading surface.
- **Slate** `#1B292B`: display text and high-contrast details.
- **Mist** `#E7EEEA`: dividers and quiet secondary panels.

The typography keeps the existing brand pairings, but uses a tighter editorial hierarchy: display type only for headlines, practical sans serif for scanning and utility text.

The distinctive element is a **portfolio contact sheet** in the hero: a staged, asymmetrical composition of real DST project imagery, service labels, and a thin amber route line. It replaces the generic logo-only hero panel and gives visitors visual proof immediately.

## Layout and component changes

### Header

- Make the header visually lighter and more deliberate through a slim utility line, stronger active-state indicator, and an amber consultation action.
- Preserve all current navigation behavior, accessible mobile drawer, and service menu.

### Home hero

- Keep the current headline and destination links, with concise supporting copy.
- Replace abstract logo decoration with a responsive contact-sheet composition driven by existing project image assets.
- Add a small proof line (services and practical response promise) rather than invented numerical claims.
- Keep two actions: browse services and start consultation/chat.

### Proof and conversion order

1. Hero and project imagery.
2. Fast capability strip.
3. Selected project cards before the full service grid.
4. Service grid, working approach, process and existing supporting content.
5. A direct consultation close with chat as a first-class action.

No company statistics, client claims, or testimonials are changed; the refresh only changes hierarchy and presentation.

### Chat assistant

- Retain all functions: guest session, 30-day history, upload, image analysis, delete conversation and accessibility labels.
- Strengthen the visual identity with a compact agent header, clear online status, improved quick-question chips, and an amber image attachment affordance.
- On desktop it remains a contained panel. On mobile it uses full-width safe spacing so the composer and attachment controls remain reachable.

## Motion and accessibility

- Preserve the existing reveal behavior; add only one staged hero entrance and subtle project-card hover motion.
- Respect `prefers-reduced-motion`.
- Maintain keyboard focus, touch targets of at least 44px for primary interactive controls, readable contrast, and alt text from existing data.

## Technical boundaries

- Modify the homepage, header, chat component styles, and shared CSS only as needed.
- Reuse existing assets and React components; do not add new external image/CDN or font dependencies.
- Do not change routes, Worker URLs, API contracts, session storage, or data structures.

## Verification

- Run typecheck, lint, build and rendered HTML tests.
- Inspect the home page and open chat at desktop and mobile widths.
- Confirm chat open/close, attachment controls, and page navigation still work.
