# DaFur Landing Page — Design Spec

- **Date:** 2026-10-07
- **Owner:** Kuro (personal project, not Backline)
- **Deadline:** live on Vercel by end of December 2026
- **Status:** approved direction ("pick the optimal approach"), sub-project 1 of the DaFur web

## 1. Purpose

DaFur is the furry fandom meetup in Đà Nẵng. The site will eventually sell tickets (login + payment). This first sub-project ships only the **public landing page**, prepared now for next year's event, built so login and payment can be added later in the same codebase without a rewrite.

Success = the landing page matches the mockup (`docs/design-assets/mockups/landing.png`), works in Vietnamese and English, looks right on phone and desktop, and Kuro can change all text by editing two JSON files and pushing to GitHub.

## 2. Scope

**In scope**
- Landing page: header/nav, hero ("Paws Of Summer"), announcement board, venue + map, rules, closing line, footer.
- Bilingual VI/EN with URL prefixes `/vi` and `/en`; language switcher keeps the current page.
- Nav items for unbuilt features (Vé/Tickets, Đăng ký tài năng/Talent sign-up, Ảnh/Gallery, Đăng nhập/Log in) stay visible with a **"Sắp ra mắt / Coming soon"** badge and lead to a coming-soon page.
- SEO/share metadata (title, description, hreflang alternates, Open Graph image).
- Unit, component and end-to-end tests. Deploy on Vercel.

**Out of scope (future sub-projects, each with its own spec → plan)**
1. Accounts/login (mockup `login.png`: email + password + forgot password, or social login).
2. Tickets + payment. Research done 2026-10-07: payOS accepts individuals with only a CCCD and no business license; SePay supports personal bank accounts (free tier 50 transactions/month, Startup 120.000 VND/month for 180). Choose when that sub-project starts.
3. Talent sign-up form. 4. Photo gallery. 5. QR check-in at the door.

**Hosting constraint to remember:** Vercel Hobby is non-commercial only; "any method of requesting or processing payment from visitors" counts as commercial. The landing page is fine on Hobby. Before ticket sales go live, move the project to Vercel Pro.

## 3. Technical decisions

| Decision | Choice | Why |
|---|---|---|
| Framework | Next.js 16.4 App Router, TypeScript, `src/` dir | Kuro already knows Next.js; login/payment later fit in the same app (route handlers, server actions). |
| i18n | Next.js native dictionaries (`src/content/vi.json`, `en.json`) + `[lang]` root segment | Next 16's own pattern; no library, no middleware/proxy. `next-intl` rejected as unnecessary weight. |
| Rendering | Fully static (SSG) via `generateStaticParams`; `dynamicParams = false` | Fast, free on Hobby, unknown URLs return a real HTTP 404. |
| Cache Components | **Off** (remove `cacheComponents` and `partialPrefetching` from the scaffolded `next.config.ts`) | With it on, `dynamicParams` is unavailable and an unknown feature URL rendered the 404 UI with HTTP 200 (verified in a probe). Not needed for a static site. |
| Root URL | `next.config.ts` redirect `/` → `/vi` (307, not permanent) | Vietnamese audience first; no proxy needed. |
| Styling | Tailwind CSS v4 with `@theme` tokens in `globals.css`; light theme only | The artwork is a sunny beach; no dark mode. |
| Font | Lexend, self-hosted via `@fontsource-variable/lexend` (has a Vietnamese subset) | Matches the mockup; no Google Fonts fetch at build time. |
| Map | Keyless Google Maps embed iframe + "Open in Google Maps" link | The supplied `map.png` is a screenshot of Google's place card (Google content, static). The embed is live and free. |
| Board | Pure CSS frame + SVG string/pin, not `board.png` | Text length changes per language; a CSS board grows with it. |
| Runtime | Node.js 22.13+ | Required by Vitest 5 and jsdom 29. |
| Tests | Vitest + Testing Library (jsdom) for units/components; Playwright for e2e against a production build | Covers logic, rendering and real routing/redirect/404 behaviour. |

## 4. Routes

| URL | Content |
|---|---|
| `/` | 307 → `/vi` |
| `/vi`, `/en` | Landing page |
| `/{vi,en}/tickets`, `/talent`, `/gallery`, `/login` | Coming-soon page titled with the feature name, `noindex` |
| `/{vi,en}#about` | Anchor on the announcement board (nav "Giới thiệu/About", hero "Thông tin sự kiện") |
| anything else (e.g. `/fr`, `/vi/foo`) | HTTP 404 |

When a real feature ships, add `src/app/[lang]/<feature>/page.tsx` (a static segment beats the dynamic `[feature]` route) and remove the feature from `comingSoonFeatures`.

## 5. Content model (what Kuro edits)

- `src/content/vi.json` and `src/content/en.json`: every visible string, same keys and list lengths in both. Sections: `meta`, `nav`, `hero`, `announcement`, `venue`, `rules`, `soon`, `footer`. Seeded with the 2026 "Paws Of Summer" text from the mockup; English is a translation.
- `src/content/event.ts`: language-independent values: `facebookUrl` (empty string hides the footer Facebook button) and `mapsQuery`.
- Images in `public/images/` and `public/og.png`. Swapping the theme next year = replace these files + edit JSON.
- A test fails if the two JSON files differ in keys, list lengths or types, or contain an empty string.

## 6. Visual design (from the mockup)

**Palette** (sampled from the artwork): sea-deep `#2f6a6b`, sea `#1c8f8f` (headings, footer), sea-light `#7bcfd3`, aqua `#5ce1e6` (primary buttons), aqua-soft `#76ebed` (board headings, hovers), sand `#fde5ab`, sand-deep `#f1c98a`, board `#4b5c57`, board-frame `#ebc49f`, pin `#d37676`, shell `#fcad90` (soon badge), ink `#1d2b2a` (text).

**Sections, top to bottom**
1. **Header** overlays the hero: DaFur logo (home link) left; nav (uppercase, white, underlined) centre; language dropdown ("VN ▾") + aqua "Đăng nhập →" pill right. Below `md`: logo, language, hamburger; hamburger opens a white card menu (closes on Escape and on link click).
2. **Hero**: `beach-bg.webp` covers the section anchored to the top (sky stays visible behind the header), sand background below. Date line + venue line in white, the "Paws Of Summer" logo as the page `<h1>` (image with alt text), then "Mua vé →" (aqua, → `/{lang}/tickets`) and "Thông tin sự kiện" (white, → `#about`).
3. **Announcement board** on sand: hanging string + pin, frame, dark green board, "☀️ LOA LOA LOA!" kicker, uppercase title, four paragraphs.
4. **Venue**: teal uppercase heading, intro, three detail bullets (bold labels); map iframe + external link. Two columns from `md`, stacked on mobile.
5. **Rules**: heading, intro, four bullets, large teal closing line.
6. **Footer**: teal band, "(C) DaFur 2026", round white Facebook button when `facebookUrl` is set.
7. **Coming-soon page**: teal-to-sand gradient filling the viewport, badge, feature title (`h1`), short note, "← Về trang chủ" button.

**Assets** (prepared from the supplied zip, in `docs/design-assets/public/`): `images/beach-bg.webp` (bg.png as WebP), `images/event-logo.png` (title + characters cropped from "event logo.png"; the loose paw prints in that layer were dropped because the background already has paw prints), `images/dafur-logo.png` (logo.png trimmed, 119×82), `og.png` (1200×630 from "bg + event logo.png").

**Accessibility:** one `h1` per page; decorative images `alt=""`; nav landmarks labelled; mobile menu button has `aria-expanded`/`aria-controls`; language links use `hrefLang` and `aria-current`; smooth scrolling disabled under `prefers-reduced-motion`; no horizontal scroll at 390 px.

## 7. SEO / sharing

Per locale: `<html lang>`, title + description from `meta`, canonical `/{lang}`, `alternates.languages` for vi/en, Open Graph (`vi_VN`/`en_US`, `/og.png` 1200×630). `metadataBase` comes from `NEXT_PUBLIC_SITE_URL`, else `https://$VERCEL_PROJECT_PRODUCTION_URL`, else `http://localhost:3000`. Coming-soon pages are `noindex`.

## 8. Testing

- **Unit:** `hasLocale`, `switchLocalePath` (incl. `/`, trailing slash, missing locale), dictionary parity + no empty strings, `eventConfig` validity, `getNavItems`, coming-soon feature list/labels, maps URL encoding of Vietnamese text.
- **Component:** header links + 3 soon badges, logo/login hrefs, language switcher keeps the page, mobile menu open/Escape/close-on-click, hero CTAs + `h1`, board `#about`, venue iframe src, rules count, footer Facebook on/off, coming-soon heading/back link.
- **E2E (desktop + Pixel 7):** `/` → `/vi`; language switch on `/vi/tickets` → `/en/tickets`; CTA → coming soon; `/fr` and `/vi/not-a-feature` return 404; title/OG/hreflang present; mobile menu navigates to `#about`; no horizontal overflow.

All of the above were run green in a throwaway probe on 2026-10-07 (33 unit/component tests, 13 e2e tests, clean `eslint` and `tsc`).

## 9. Deployment

GitHub repo → import into Vercel (framework auto-detected, no env vars required). Every push to `main` deploys. Set `NEXT_PUBLIC_SITE_URL` once a custom domain exists. Hobby plan until ticket sales (see §2).

## 10. Inputs Kuro still needs to supply (site works without them)

1. DaFur fanpage URL → `src/content/event.ts` `facebookUrl` (footer button stays hidden until set).
2. A higher-resolution DaFur logo (current file is 132×102 px, slightly soft on retina screens).
3. Next year's date, venue, theme, text and price → JSON files + images.
4. Custom domain (optional) → Vercel + `NEXT_PUBLIC_SITE_URL`.

## 11. Acceptance criteria

- `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run test:e2e` and `npm run build` all pass; build output lists `/vi`, `/en` and the 8 coming-soon paths as SSG.
- Side-by-side with `mockups/landing.png` at 1366 px wide, section order, colours and hierarchy match.
- At 390 px: no horizontal scroll, menu works, text readable.
- Changing a string in `vi.json` and pushing updates the live site.
