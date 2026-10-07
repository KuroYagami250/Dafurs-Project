# DaFur Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the bilingual (VI/EN) static DaFur "Paws Of Summer" landing page on Vercel, with coming-soon pages for tickets, talent sign-up, gallery and login.

**Architecture:** Next.js 16.4 App Router with a `[lang]` root segment, statically generated for `vi` and `en`. All copy lives in `src/content/{vi,en}.json` and is passed into small presentational components as props, so components are testable without Next's server runtime. Unbuilt features render through one dynamic `[lang]/[feature]` route that later real pages override.

**Tech Stack:** Next.js 16.4.0, React 19.3, TypeScript 5, Tailwind CSS 4, `@fontsource-variable/lexend`, Vitest 5 + Testing Library + jsdom, Playwright 1.63, Vercel.

**Spec:** `docs/superpowers/specs/2026-10-07-dafur-landing-design.md` (read it first; it explains every decision below).

## Global Constraints

- Node.js **22.13+** (Vitest 5 and jsdom 29 require it).
- Next.js **16.4.0** exactly (`create-next-app@16.4.0`). Next 16 differs from older training data: when unsure, read `node_modules/next/dist/docs/` (see the scaffolded `AGENTS.md`).
- **Do not** use `next-intl`, `middleware.ts` or `proxy.ts`. i18n = JSON dictionaries + `[lang]` segment.
- `next.config.ts` must **not** contain `cacheComponents` or `partialPrefetching`; `dynamicParams = false` in `src/app/[lang]/layout.tsx` and `src/app/[lang]/[feature]/page.tsx`.
- Locales: `["vi", "en"]`, default `vi`. `/` redirects (307) to `/vi`.
- Every user-visible string comes from `src/content/vi.json` / `en.json`; both files keep identical keys, list lengths and types.
- Font: `@fontsource-variable/lexend` (family `"Lexend Variable"`); never `next/font/google`.
- Colours only through the Tailwind tokens defined in `src/app/globals.css` (`sea-deep`, `sea`, `sea-light`, `aqua`, `aqua-soft`, `sand`, `sand-deep`, `board`, `board-frame`, `pin`, `shell`, `ink`). Light theme only.
- Images: only the files in `docs/design-assets/public/` copied to `public/`. Do not use `map.png` or `board.png`.
- Commit after every task with a conventional message (`feat:`, `test:`, `chore:`).

## Review Focus

1. **Unknown URLs** (`/fr`, `/vi/foo`, `/vi/tickets/x`) must return HTTP **404**, not a 200 page showing "not found". Pinned by the e2e test "unknown locales and features return a real 404" (Task 7).
2. **Language switch on a sub-page** must keep the page (`/vi/tickets` → `/en/tickets`), including odd paths (`/`, trailing slash). Pinned by `switchLocalePath` table test (Task 1) and e2e "switching language keeps the page" (Task 7).
3. **Kuro edits one JSON and forgets the other** (missing key, extra rule bullet, empty string). Pinned by `dictionaries.test.ts` (Task 2).
4. **Phone width 390 px**: no horizontal scroll, menu usable, closes on Escape and on link tap. Pinned by `header.test.tsx` (Task 4) and e2e mobile tests (Task 7).
5. **Vietnamese characters in the map query** (`Hải Châu, Đà Nẵng`, commas) must survive URL encoding. Pinned by `maps.test.ts` (Task 3).

---

## File Structure

```
docs/                                  # already present: spec, this plan, design-assets, EXECUTE-PROMPT.md
public/images/{beach-bg.webp,event-logo.png,dafur-logo.png}
public/og.png
src/app/globals.css                    # Tailwind import + colour/font tokens
src/app/[lang]/layout.tsx              # root layout: <html lang>, metadata, header, footer
src/app/[lang]/page.tsx                # landing page composition
src/app/[lang]/[feature]/page.tsx      # coming-soon pages
src/components/SoonBadge.tsx           # "Sắp ra mắt" pill
src/components/LanguageSwitcher.tsx    # client: VN/EN dropdown keeping the path
src/components/MobileMenu.tsx          # client: hamburger menu
src/components/SiteHeader.tsx          # logo, nav, switcher, login button
src/components/SiteFooter.tsx          # copyright + optional Facebook
src/components/Hero.tsx                # beach hero, h1 logo, CTAs
src/components/AnnouncementBoard.tsx   # #about board
src/components/VenueSection.tsx        # details + map embed
src/components/RulesSection.tsx        # rules + closing line
src/components/ComingSoon.tsx          # coming-soon body
src/content/vi.json, en.json           # all copy
src/content/event.ts                   # facebookUrl, mapsQuery
src/lib/i18n.ts                        # locales, hasLocale, labels
src/lib/locale-path.ts                 # switchLocalePath
src/lib/dictionaries.ts                # Dictionary type, getDictionary
src/lib/nav.ts                         # nav items, coming-soon features
src/lib/maps.ts                        # Google Maps URLs
src/lib/site.ts                        # metadataBase URL
tests/setup.ts, tests/unit/*.test.ts(x), tests/e2e/landing.spec.ts
vitest.config.mts, playwright.config.ts, next.config.ts
```

---

### Task 1: Scaffold the project and the locale core

**Files:**
- Create (scaffold): whole Next.js app in the repo root
- Modify: `next.config.ts`, `package.json` (scripts), `.gitignore`
- Create: `vitest.config.mts`, `tests/setup.ts`, `src/lib/i18n.ts`, `src/lib/locale-path.ts`
- Test: `tests/unit/i18n.test.ts`

**Interfaces:**
- Produces: `locales: readonly ["vi","en"]`, `type Locale = "vi" | "en"`, `defaultLocale: Locale`, `localeLabels: Record<Locale,{short:string;name:string}>`, `hasLocale(value: string): value is Locale`, `switchLocalePath(pathname: string, target: Locale): string`. Test runner: `npm test`.

- [ ] **Step 1: Scaffold Next.js into the current folder** (it only contains `docs/`, which create-next-app allows)

```bash
npx create-next-app@16.4.0 . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack --yes
git status || git init
```
Expected: "Success! Created ...". If create-next-app complains about conflicting files, move them into `docs/` and retry.

- [ ] **Step 2: Install dependencies**

```bash
npm i @fontsource-variable/lexend@^5.3.0
npm i -D @types/node@22 vitest@^5.0.3 @vitejs/plugin-react@^6.1.2 jsdom@^29.1.1 @testing-library/react@^16.3.3 @testing-library/jest-dom@^7.0.1 @playwright/test@^1.63.0
npm pkg set scripts.test="vitest run" scripts.test:watch="vitest" scripts.test:e2e="playwright test"
```
Note: `@types/node@22` is required; the scaffold's `@types/node@20` conflicts with Vitest 5's peer range.

- [ ] **Step 3: Replace `next.config.ts`** (drops `cacheComponents`/`partialPrefetching`, adds the root redirect, keeps the scaffold's Tailwind Turbopack loader)

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [{ source: "/", destination: "/vi", permanent: false }];
  },
};

export default nextConfig;
```

- [ ] **Step 4: Append test output folders to `.gitignore`**

```bash
printf '\n# tests\n/test-results/\n/playwright-report/\n/playwright/.cache/\n' >> .gitignore
```

- [ ] **Step 5: Create the Vitest config and setup**

`vitest.config.mts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
  },
});
```

`tests/setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => cleanup());
```

- [ ] **Step 6: Write the failing test** `tests/unit/i18n.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { defaultLocale, hasLocale, locales } from "@/lib/i18n";
import { switchLocalePath } from "@/lib/locale-path";

describe("hasLocale", () => {
  it("accepts supported locales", () => {
    expect(hasLocale("vi")).toBe(true);
    expect(hasLocale("en")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(hasLocale("fr")).toBe(false);
    expect(hasLocale("")).toBe(false);
    expect(hasLocale("VI")).toBe(false);
  });

  it("has vi as default and first locale", () => {
    expect(defaultLocale).toBe("vi");
    expect(locales[0]).toBe("vi");
  });
});

describe("switchLocalePath", () => {
  it.each([
    ["/vi", "en", "/en"],
    ["/en", "vi", "/vi"],
    ["/vi/tickets", "en", "/en/tickets"],
    ["/vi/", "en", "/en"],
    ["/", "en", "/en"],
    ["", "en", "/en"],
    ["/tickets", "en", "/en/tickets"],
    ["/en/tickets", "en", "/en/tickets"],
  ] as const)("%s -> %s gives %s", (pathname, target, expected) => {
    expect(switchLocalePath(pathname, target)).toBe(expected);
  });
});
```

- [ ] **Step 7: Run it to verify it fails**

Run: `npx vitest run tests/unit/i18n.test.ts`
Expected: FAIL, cannot resolve `@/lib/i18n`.

- [ ] **Step 8: Implement** `src/lib/i18n.ts`

```ts
export const locales = ["vi", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "vi";

export const localeLabels: Record<Locale, { short: string; name: string }> = {
  vi: { short: "VN", name: "Tiếng Việt" },
  en: { short: "EN", name: "English" },
};

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
```

and `src/lib/locale-path.ts`

```ts
import { hasLocale, type Locale } from "./i18n";

/**
 * Swap (or insert) the locale segment of a pathname.
 * "/vi/tickets" -> "/en/tickets", "/" -> "/en", "/tickets" -> "/en/tickets"
 */
export function switchLocalePath(pathname: string, target: Locale): string {
  const segments = pathname.split("/");
  if (segments.length > 1 && hasLocale(segments[1])) {
    segments[1] = target;
  } else {
    segments.splice(1, 0, target);
  }
  const joined = segments.join("/").replace(/\/+$/, "");
  return joined === "" ? `/${target}` : joined;
}
```

- [ ] **Step 9: Run tests to verify they pass**

Run: `npx vitest run tests/unit/i18n.test.ts`
Expected: PASS (11 tests).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 16.4 app with vitest and locale helpers"
```

---

### Task 2: Content dictionaries

**Files:**
- Create: `src/content/vi.json`, `src/content/en.json`, `src/content/event.ts`, `src/lib/dictionaries.ts`
- Test: `tests/unit/dictionaries.test.ts`

**Interfaces:**
- Consumes: `Locale` from `@/lib/i18n`.
- Produces: `type Dictionary = typeof vi.json` with sections `meta`, `nav`, `hero`, `announcement`, `venue`, `rules`, `soon`, `footer`; `getDictionary(locale: Locale): Dictionary` (synchronous); `eventConfig: { facebookUrl: string; mapsQuery: string }`.

- [ ] **Step 1: Write the failing test** `tests/unit/dictionaries.test.ts`

```ts
import { describe, expect, it } from "vitest";
import vi from "@/content/vi.json";
import en from "@/content/en.json";
import { eventConfig } from "@/content/event";
import { getDictionary } from "@/lib/dictionaries";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

// Describe the shape of a JSON value: object keys, array lengths and leaf types.
function shape(value: Json, path = "$"): string[] {
  if (Array.isArray(value)) {
    return [`${path}[len=${value.length}]`, ...value.flatMap((item, i) => shape(item, `${path}[${i}]`))];
  }
  if (value !== null && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .flatMap((key) => shape(value[key], `${path}.${key}`));
  }
  return [`${path}:${typeof value}`];
}

function emptyStrings(value: Json, path = "$"): string[] {
  if (typeof value === "string") return value.trim() === "" ? [path] : [];
  if (Array.isArray(value)) return value.flatMap((item, i) => emptyStrings(item, `${path}[${i}]`));
  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) => emptyStrings(item, `${path}.${key}`));
  }
  return [];
}

describe("content dictionaries", () => {
  it("vi.json and en.json have exactly the same keys, list lengths and types", () => {
    expect(shape(en as Json)).toEqual(shape(vi as Json));
  });

  it("has no empty text in either language", () => {
    expect(emptyStrings(vi as Json)).toEqual([]);
    expect(emptyStrings(en as Json)).toEqual([]);
  });

  it("getDictionary returns the matching language", () => {
    expect(getDictionary("vi").nav.tickets).toBe("Vé");
    expect(getDictionary("en").nav.tickets).toBe("Tickets");
  });
});

describe("eventConfig", () => {
  it("facebookUrl is empty or an https URL", () => {
    const url: string = eventConfig.facebookUrl;
    if (url !== "") expect(url).toMatch(/^https:\/\//);
  });

  it("has a maps query", () => {
    expect(eventConfig.mapsQuery.trim()).not.toBe("");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/unit/dictionaries.test.ts`
Expected: FAIL, cannot resolve `@/content/vi.json`.

- [ ] **Step 3: Create** `src/content/vi.json` (copy exactly; this is the mockup text)

```json
{
  "meta": {
    "title": "DaFur 2026 · Paws Of Summer",
    "description": "Offline của fandom furry Đà Nẵng. 14h - 18h, Chủ Nhật 30/08/2026 tại Angel Coffee, 87 Quang Trung, Đà Nẵng."
  },
  "nav": {
    "tickets": "Vé",
    "talent": "Đăng ký tài năng",
    "gallery": "Ảnh",
    "about": "Giới thiệu",
    "login": "Đăng nhập",
    "mainNav": "Điều hướng chính",
    "home": "DaFur, về trang chủ",
    "openMenu": "Mở menu",
    "closeMenu": "Đóng menu",
    "language": "Ngôn ngữ",
    "soonBadge": "Sắp ra mắt"
  },
  "hero": {
    "date": "Ngày 30 Tháng 8 Năm 2026",
    "venue": "Angel Coffee, 87 Quang Trung, Đà Nẵng, Việt Nam",
    "logoAlt": "Paws Of Summer, DaFur 2026",
    "buyTicket": "Mua vé",
    "eventInfo": "Thông tin sự kiện"
  },
  "announcement": {
    "kicker": "☀️ LOA LOA LOA!",
    "title": "Tiếng sóng biển đã gọi tên fandom furry Đà Nẵng!!",
    "paragraphs": [
      "Ban Tổ Chức DAFUR xin chính thức phát lệnh \"giải nhiệt\" cho toàn thể các bạn furry mùa hè này!",
      "Tiếng ve kêu râm ran, cái nắng vàng ươm rót xuống phố biển Đà Nẵng... tức là tới lúc chúng mình phải lên đồ rủ nhau \"đi trốn\" rồi đó! Và mùa hè năm nay, DAFUR 2026 sẽ đưa tất cả bước vào hành trình mang tên \"Paws Of Summer\"! 🌊✨",
      "Lấy cảm hứng từ những ngày hè ngợp nắng, tiếng sóng biển vỗ về và ly nước mát lạnh tan trên đầu lưỡi, DAFUR muốn mang đến một không gian rực rỡ, phóng khoáng, nơi các bạn furry có thể vứt hết deadline sang một bên, xỏ dép xốp, khoác lên bộ suit rực rỡ nhất và tha hồ \"quẩy\" tưng bừng cùng hội bạn thân!",
      "Mùa hè này, BTC mong sẽ được thấy những nụ cười tỏa nắng, những cái ôm ấm áp và thật nhiều khoảnh khắc bùng nổ của mọi người dưới cái nắng dịu dàng của chiều tháng 8 Đà Nẵng."
    ]
  },
  "venue": {
    "heading": "Địa điểm",
    "intro": "Địa điểm của chúng mình đã sẵn sàng, các bạn chỉ cần đặt báo thức và chuẩn bị một tâm hồn đẹp thôi nha!",
    "details": [
      {
        "label": "Thời gian",
        "value": "14h - 18h, Chủ Nhật, ngày 30/08/2026"
      },
      {
        "label": "Tọa độ gặp gỡ",
        "value": "Angel Coffee (Tầng 2) – 87 Quang Trung, Q. Hải Châu, Đà Nẵng"
      },
      {
        "label": "Vé vào cổng thiên đường mùa hè",
        "value": "28.000 VNĐ / người"
      }
    ],
    "mapTitle": "Bản đồ đường tới Angel Coffee, 87 Quang Trung",
    "openInMaps": "Mở trong Google Maps"
  },
  "rules": {
    "heading": "Nội quy bờ biển từ Ban Tổ Chức",
    "intro": "Để chuyến dã ngoại mùa hè của chúng ta diễn ra thật trọn vẹn, trôi chảy và tràn ngập niềm vui, các \"cư dân mùa hè\" nhớ nằm lòng vài điều sau nhé:",
    "items": [
      "Nhớ theo dõi bài viết trên Fanpage DAFUR - Furry Đà Nẵng thường xuyên để không bỏ lỡ những thông báo \"nóng hổi\" tiếp theo từ BTC!",
      "Hãy dừng chân tại quầy order (Tầng 1) để sắm cho mình một ly nước thiệt mát lạnh trước khi tiến thẳng lên \"vùng trời mùa hè\" ở Tầng 2 nha.",
      "Sự kiện của chúng mình sẽ diễn ra trọn vẹn tại phòng lớn Tầng 2. Bạn có thể tự do di chuyển, nhưng nhớ giữ thái độ lịch sự, không gây ảnh hưởng hay làm phiền đến các vị khách khác của quán nhé (Lưu ý nhẹ: BTC xin phép không chịu trách nhiệm đối với các sự cố phát sinh do cá nhân vi phạm quy định).",
      "Luôn giữ một nụ cười rạng rỡ, thân thiện với mọi người xung quanh, cùng nhau bảo vệ tài sản của quán và gom gọn rác tại chỗ ngồi trước khi chào tạm biệt nha!"
    ],
    "closing": "Hẹn gặp lại tất cả các bạn tại DAFUR 2026! Hãy cùng nhau tạo nên một chiều cuối tháng 8 thật rực rỡ và đong đầy kỷ niệm nhé! 🐾☀️🏖️"
  },
  "soon": {
    "body": "Phần này đang được BTC chuẩn bị, các bạn quay lại sau nha!",
    "back": "Về trang chủ"
  },
  "footer": {
    "copyright": "(C) DaFur 2026",
    "facebook": "Fanpage DaFur trên Facebook"
  }
}
```

- [ ] **Step 4: Create** `src/content/en.json`

```json
{
  "meta": {
    "title": "DaFur 2026 · Paws Of Summer",
    "description": "The Da Nang furry fandom meetup. 2 PM - 6 PM, Sunday 30 August 2026 at Angel Coffee, 87 Quang Trung, Da Nang."
  },
  "nav": {
    "tickets": "Tickets",
    "talent": "Talent sign-up",
    "gallery": "Gallery",
    "about": "About",
    "login": "Log in",
    "mainNav": "Main navigation",
    "home": "DaFur, back to home",
    "openMenu": "Open menu",
    "closeMenu": "Close menu",
    "language": "Language",
    "soonBadge": "Coming soon"
  },
  "hero": {
    "date": "30 August 2026",
    "venue": "Angel Coffee, 87 Quang Trung, Da Nang, Vietnam",
    "logoAlt": "Paws Of Summer, DaFur 2026",
    "buyTicket": "Get tickets",
    "eventInfo": "Event info"
  },
  "announcement": {
    "kicker": "☀️ HEAR YE, HEAR YE!",
    "title": "The waves are calling the Da Nang furry fandom!!",
    "paragraphs": [
      "The DAFUR organizing team hereby officially declares a summer \"cool-down\" for every furry out there!",
      "Cicadas buzzing, golden sunshine pouring over the seaside streets of Da Nang... that means it's time to dress up and \"run away\" together! This summer, DAFUR 2026 takes everyone on a journey called \"Paws Of Summer\"! 🌊✨",
      "Inspired by sun-soaked days, the hush of the waves and an ice-cold drink melting on your tongue, DAFUR wants to bring you a bright, carefree space where you can toss your deadlines aside, slip on your flip-flops, put on your brightest suit and party all afternoon with your besties!",
      "This summer, we hope to see sunny smiles, warm hugs and plenty of unforgettable moments under the gentle sun of a Da Nang August afternoon."
    ]
  },
  "venue": {
    "heading": "Venue",
    "intro": "The venue is all set. All you need to do is set an alarm and bring good vibes!",
    "details": [
      {
        "label": "Time",
        "value": "2 PM - 6 PM, Sunday, 30/08/2026"
      },
      {
        "label": "Meeting point",
        "value": "Angel Coffee (2nd floor) – 87 Quang Trung, Hai Chau, Da Nang"
      },
      {
        "label": "Ticket to summer paradise",
        "value": "28,000 VND / person"
      }
    ],
    "mapTitle": "Map to Angel Coffee, 87 Quang Trung",
    "openInMaps": "Open in Google Maps"
  },
  "rules": {
    "heading": "Beach rules from the organizers",
    "intro": "To keep our summer outing smooth, complete and full of joy, all \"summer residents\" please keep these in mind:",
    "items": [
      "Follow the DAFUR - Furry Đà Nẵng fanpage so you don't miss any \"hot\" updates from the organizers!",
      "Stop by the order counter (1st floor) and grab an ice-cold drink before heading up to the \"summer sky\" on the 2nd floor.",
      "The event takes place in the big room on the 2nd floor. Feel free to move around, but please stay polite and don't disturb the café's other guests (Gentle note: the organizers are not responsible for incidents caused by individuals who break the rules).",
      "Keep a bright smile, be friendly to everyone around you, help protect the café's property and tidy up your table before saying goodbye!"
    ],
    "closing": "See you all at DAFUR 2026! Let's make the last afternoon of August bright and full of memories! 🐾☀️🏖️"
  },
  "soon": {
    "body": "The organizers are still preparing this part. Check back soon!",
    "back": "Back to home"
  },
  "footer": {
    "copyright": "(C) DaFur 2026",
    "facebook": "DaFur fanpage on Facebook"
  }
}
```

- [ ] **Step 5: Create** `src/content/event.ts` (if the user gave a fanpage URL in the execution prompt, put it in `facebookUrl`; otherwise leave `""`)

```ts
// Values that are the same in every language. Edit these when the event changes.
export const eventConfig = {
  // Full URL of the DaFur fanpage. Leave "" to hide the Facebook button in the footer.
  facebookUrl: "",
  // What Google Maps should search for to show the venue.
  mapsQuery: "Angel Coffee, 87 Quang Trung, Hải Châu, Đà Nẵng",
} as const;
```

- [ ] **Step 6: Create** `src/lib/dictionaries.ts`

```ts
import vi from "@/content/vi.json";
import en from "@/content/en.json";
import type { Locale } from "./i18n";

export type Dictionary = typeof vi;

// Typing `en` as Dictionary makes the build fail if en.json is missing a key from vi.json.
const dictionaries: Record<Locale, Dictionary> = { vi, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npx vitest run tests/unit/dictionaries.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 8: Commit**

```bash
git add src/content src/lib/dictionaries.ts tests/unit/dictionaries.test.ts
git commit -m "feat: add vi/en content dictionaries and event config"
```

---

### Task 3: Navigation model and map URLs

**Files:**
- Create: `src/lib/nav.ts`, `src/lib/maps.ts`
- Test: `tests/unit/nav.test.ts`, `tests/unit/maps.test.ts`

**Interfaces:**
- Consumes: `Locale`, `Dictionary`.
- Produces: `comingSoonFeatures = ["tickets","talent","gallery","login"] as const`, `type ComingSoonFeature`, `isComingSoonFeature(value: string): value is ComingSoonFeature`, `type NavItem = { key: "tickets"|"talent"|"gallery"|"about"; label: string; href: string; soon: boolean }`, `getNavItems(locale, nav): NavItem[]`, `featureLabel(feature, nav): string`, `mapsEmbedUrl(query: string): string`, `mapsLinkUrl(query: string): string`.

- [ ] **Step 1: Write the failing tests**

`tests/unit/nav.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { getDictionary } from "@/lib/dictionaries";
import { comingSoonFeatures, featureLabel, getNavItems, isComingSoonFeature } from "@/lib/nav";

describe("getNavItems", () => {
  it("builds locale-prefixed links and marks unbuilt features as soon", () => {
    const items = getNavItems("en", getDictionary("en").nav);
    expect(items).toEqual([
      { key: "tickets", label: "Tickets", href: "/en/tickets", soon: true },
      { key: "talent", label: "Talent sign-up", href: "/en/talent", soon: true },
      { key: "gallery", label: "Gallery", href: "/en/gallery", soon: true },
      { key: "about", label: "About", href: "/en#about", soon: false },
    ]);
  });
});

describe("coming soon features", () => {
  it("lists the four unbuilt features", () => {
    expect(comingSoonFeatures).toEqual(["tickets", "talent", "gallery", "login"]);
  });

  it("recognises only those features", () => {
    expect(isComingSoonFeature("login")).toBe(true);
    expect(isComingSoonFeature("about")).toBe(false);
    expect(isComingSoonFeature("Tickets")).toBe(false);
  });

  it("labels each feature from the nav dictionary", () => {
    const nav = getDictionary("vi").nav;
    expect(comingSoonFeatures.map((f) => featureLabel(f, nav))).toEqual(["Vé", "Đăng ký tài năng", "Ảnh", "Đăng nhập"]);
  });
});
```

`tests/unit/maps.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { mapsEmbedUrl, mapsLinkUrl } from "@/lib/maps";

describe("maps urls", () => {
  const query = "Angel Coffee, 87 Quang Trung, Hải Châu, Đà Nẵng";

  it("encodes Vietnamese text and commas in the embed url", () => {
    const url = new URL(mapsEmbedUrl(query));
    expect(url.origin).toBe("https://www.google.com");
    expect(url.searchParams.get("q")).toBe(query);
    expect(url.searchParams.get("output")).toBe("embed");
  });

  it("builds a Google Maps search link", () => {
    const url = new URL(mapsLinkUrl(query));
    expect(url.searchParams.get("api")).toBe("1");
    expect(url.searchParams.get("query")).toBe(query);
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run tests/unit/nav.test.ts tests/unit/maps.test.ts`
Expected: FAIL, cannot resolve `@/lib/nav` and `@/lib/maps`.

- [ ] **Step 3: Implement** `src/lib/nav.ts`

```ts
import type { Locale } from "./i18n";
import type { Dictionary } from "./dictionaries";

export const comingSoonFeatures = ["tickets", "talent", "gallery", "login"] as const;

export type ComingSoonFeature = (typeof comingSoonFeatures)[number];

export function isComingSoonFeature(value: string): value is ComingSoonFeature {
  return (comingSoonFeatures as readonly string[]).includes(value);
}

export type NavItem = {
  key: "tickets" | "talent" | "gallery" | "about";
  label: string;
  href: string;
  soon: boolean;
};

export function getNavItems(locale: Locale, nav: Dictionary["nav"]): NavItem[] {
  return [
    { key: "tickets", label: nav.tickets, href: `/${locale}/tickets`, soon: true },
    { key: "talent", label: nav.talent, href: `/${locale}/talent`, soon: true },
    { key: "gallery", label: nav.gallery, href: `/${locale}/gallery`, soon: true },
    { key: "about", label: nav.about, href: `/${locale}#about`, soon: false },
  ];
}

export function featureLabel(feature: ComingSoonFeature, nav: Dictionary["nav"]): string {
  return nav[feature];
}
```

and `src/lib/maps.ts`

```ts
export function mapsEmbedUrl(query: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

export function mapsLinkUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/nav.test.ts tests/unit/maps.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/nav.ts src/lib/maps.ts tests/unit/nav.test.ts tests/unit/maps.test.ts
git commit -m "feat: add nav model, coming-soon features and map urls"
```

---

### Task 4: Theme, assets, root layout, header and footer

**Files:**
- Delete: `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/favicon.ico`, `public/*.svg`
- Create: `public/images/*`, `public/og.png` (copied), `src/lib/site.ts`, `src/components/SoonBadge.tsx`, `src/components/LanguageSwitcher.tsx`, `src/components/MobileMenu.tsx`, `src/components/SiteHeader.tsx`, `src/components/SiteFooter.tsx`, `src/app/[lang]/layout.tsx`, `src/app/[lang]/page.tsx` (temporary)
- Modify: `src/app/globals.css`
- Test: `tests/unit/header.test.tsx`

**Interfaces:**
- Consumes: everything from Tasks 1-3.
- Produces: `SiteHeader({ locale: Locale; nav: Dictionary["nav"] })`, `SiteFooter({ footer: Dictionary["footer"]; facebookUrl: string })`, `SoonBadge({ label: string })`, `LanguageSwitcher({ locale: Locale; label: string })`, `MobileMenu({ items: NavItem[]; loginHref: string; labels: { openMenu; closeMenu; login; soonBadge } })`, `getSiteUrl(): URL`. Root layout at `src/app/[lang]/layout.tsx`.

- [ ] **Step 1: Write the failing test** `tests/unit/header.test.tsx`

```tsx
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MobileMenu } from "@/components/MobileMenu";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getDictionary } from "@/lib/dictionaries";
import { getNavItems } from "@/lib/nav";

const pathname = vi.hoisted(() => ({ current: "/vi/tickets" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

const viDict = getDictionary("vi");
const enDict = getDictionary("en");

describe("SiteHeader", () => {
  it("shows the four nav links with coming-soon badges on unbuilt ones", () => {
    render(<SiteHeader locale="vi" nav={viDict.nav} />);
    const nav = screen.getByRole("navigation", { name: "Điều hướng chính" });
    expect(within(nav).getByRole("link", { name: "Vé" })).toHaveAttribute("href", "/vi/tickets");
    expect(within(nav).getByRole("link", { name: "Giới thiệu" })).toHaveAttribute("href", "/vi#about");
    expect(within(nav).getAllByText("Sắp ra mắt")).toHaveLength(3);
  });

  it("links the logo home and the login button to the login page", () => {
    render(<SiteHeader locale="en" nav={enDict.nav} />);
    expect(screen.getByRole("link", { name: "DaFur, back to home" })).toHaveAttribute("href", "/en");
    expect(screen.getAllByRole("link", { name: /Log in/ })[0]).toHaveAttribute("href", "/en/login");
  });
});

describe("LanguageSwitcher", () => {
  it("keeps the current page when switching language", () => {
    pathname.current = "/vi/tickets";
    render(<LanguageSwitcher locale="vi" label="Ngôn ngữ" />);
    expect(screen.getByRole("link", { name: "English" })).toHaveAttribute("href", "/en/tickets");
    expect(screen.getByRole("link", { name: "Tiếng Việt" })).toHaveAttribute("aria-current", "true");
  });
});

describe("MobileMenu", () => {
  const labels = { openMenu: "Mở menu", closeMenu: "Đóng menu", login: "Đăng nhập", soonBadge: "Sắp ra mắt" };

  it("opens, closes with Escape and closes after choosing a link", () => {
    render(<MobileMenu items={getNavItems("vi", viDict.nav)} loginHref="/vi/login" labels={labels} />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Mở menu" }));
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Đóng menu" })).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Mở menu" }));
    fireEvent.click(screen.getByRole("link", { name: /Giới thiệu/ }));
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});

describe("SiteFooter", () => {
  it("hides the Facebook button when no URL is configured", () => {
    render(<SiteFooter footer={viDict.footer} facebookUrl="" />);
    expect(screen.getByText("(C) DaFur 2026")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("shows the Facebook button when a URL is configured", () => {
    render(<SiteFooter footer={viDict.footer} facebookUrl="https://www.facebook.com/example" />);
    expect(screen.getByRole("link", { name: viDict.footer.facebook })).toHaveAttribute(
      "href",
      "https://www.facebook.com/example",
    );
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/unit/header.test.tsx`
Expected: FAIL, cannot resolve `@/components/LanguageSwitcher`.

- [ ] **Step 3: Copy assets and remove scaffold files**

```bash
mkdir -p public/images
cp docs/design-assets/public/images/* public/images/
cp docs/design-assets/public/og.png public/og.png
rm -f src/app/page.tsx src/app/layout.tsx src/app/favicon.ico public/*.svg
```

- [ ] **Step 4: Replace** `src/app/globals.css`

```css
@import "tailwindcss";

/* Palette sampled from the Paws Of Summer artwork. Light theme only: the art is a sunny beach. */
@theme {
  --color-sea-deep: #2f6a6b;
  --color-sea: #1c8f8f;
  --color-sea-light: #7bcfd3;
  --color-aqua: #5ce1e6;
  --color-aqua-soft: #76ebed;
  --color-sand: #fde5ab;
  --color-sand-deep: #f1c98a;
  --color-board: #4b5c57;
  --color-board-frame: #ebc49f;
  --color-pin: #d37676;
  --color-shell: #fcad90;
  --color-ink: #1d2b2a;

  --font-sans: "Lexend Variable", ui-sans-serif, system-ui, sans-serif;
}

html {
  scroll-behavior: smooth;
}

body {
  background: #ffffff;
  color: var(--color-ink);
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

- [ ] **Step 5: Create the components**

`src/components/SoonBadge.tsx`:
```tsx
export function SoonBadge({ label }: { label: string }) {
  return (
    <span className="ml-1 inline-block rounded-full bg-shell px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-ink no-underline">
      {label}
    </span>
  );
}
```

`src/components/LanguageSwitcher.tsx`:
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeLabels, type Locale } from "@/lib/i18n";
import { switchLocalePath } from "@/lib/locale-path";

type Props = { locale: Locale; label: string };

export function LanguageSwitcher({ locale, label }: Props) {
  const pathname = usePathname() ?? `/${locale}`;

  return (
    <details className="group relative">
      <summary
        aria-label={label}
        className="flex cursor-pointer list-none items-center gap-1 rounded-full px-3 py-2 font-semibold text-white [&::-webkit-details-marker]:hidden"
      >
        {localeLabels[locale].short}
        <span aria-hidden className="text-xs transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <ul className="absolute right-0 z-20 mt-2 min-w-36 overflow-hidden rounded-xl bg-white py-1 text-ink shadow-lg">
        {locales.map((target) => (
          <li key={target}>
            <Link
              href={switchLocalePath(pathname, target)}
              hrefLang={target}
              aria-current={target === locale ? "true" : undefined}
              className="block px-4 py-2 hover:bg-sand aria-[current=true]:font-bold"
            >
              {localeLabels[target].name}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
```

`src/components/MobileMenu.tsx`:
```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { NavItem } from "@/lib/nav";
import { SoonBadge } from "./SoonBadge";

type Props = {
  items: NavItem[];
  loginHref: string;
  labels: { openMenu: string; closeMenu: string; login: string; soonBadge: string };
};

export function MobileMenu({ items, loginHref, labels }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? labels.closeMenu : labels.openMenu}
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 w-11 items-center justify-center rounded-full text-2xl text-white"
      >
        <span aria-hidden>{open ? "✕" : "☰"}</span>
      </button>
      {open && (
        <nav
          id="mobile-menu"
          className="absolute inset-x-4 top-full z-30 mt-2 rounded-2xl bg-white p-4 text-ink shadow-xl"
        >
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.key}>
                <Link href={item.href} onClick={close} className="block rounded-lg px-3 py-3 font-semibold hover:bg-sand">
                  {item.label}
                  {item.soon && <SoonBadge label={labels.soonBadge} />}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={loginHref}
                onClick={close}
                className="mt-2 block rounded-full bg-aqua px-4 py-3 text-center font-bold text-ink"
              >
                {labels.login} →
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
```

`src/components/SiteHeader.tsx`:
```tsx
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import { getNavItems } from "@/lib/nav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import { SoonBadge } from "./SoonBadge";

type Props = { locale: Locale; nav: Dictionary["nav"] };

export function SiteHeader({ locale, nav }: Props) {
  const items = getNavItems(locale, nav);
  const loginHref = `/${locale}/login`;

  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <Link href={`/${locale}`} aria-label={nav.home} className="shrink-0">
          <Image src="/images/dafur-logo.png" alt="" width={119} height={82} priority className="h-12 w-auto md:h-16" />
        </Link>

        <nav aria-label={nav.mainNav} className="hidden md:block">
          <ul className="flex items-center gap-6 lg:gap-10">
            {items.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="font-semibold uppercase text-white underline decoration-2 underline-offset-8 drop-shadow hover:text-aqua-soft"
                >
                  {item.label}
                </Link>
                {item.soon && <SoonBadge label={nav.soonBadge} />}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} label={nav.language} />
          <Link
            href={loginHref}
            className="hidden rounded-full bg-aqua px-5 py-2.5 font-bold text-ink shadow hover:bg-aqua-soft md:inline-block"
          >
            {nav.login} →
          </Link>
          <MobileMenu
            items={items}
            loginHref={loginHref}
            labels={{ openMenu: nav.openMenu, closeMenu: nav.closeMenu, login: nav.login, soonBadge: nav.soonBadge }}
          />
        </div>
      </div>
    </header>
  );
}
```

`src/components/SiteFooter.tsx`:
```tsx
import type { Dictionary } from "@/lib/dictionaries";

type Props = { footer: Dictionary["footer"]; facebookUrl: string };

export function SiteFooter({ footer, facebookUrl }: Props) {
  return (
    <footer className="bg-sea text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-6 md:px-8">
        <p className="font-semibold">{footer.copyright}</p>
        {facebookUrl !== "" && (
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={footer.facebook}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-sea hover:bg-sand"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
              <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z" />
            </svg>
          </a>
        )}
      </div>
    </footer>
  );
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run tests/unit/header.test.tsx`
Expected: PASS (6 tests). The jsdom message "Not implemented: navigation to another Document" is harmless.

- [ ] **Step 7: Create** `src/lib/site.ts`

```ts
export function getSiteUrl(): URL {
  if (process.env.NEXT_PUBLIC_SITE_URL) return new URL(process.env.NEXT_PUBLIC_SITE_URL);
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }
  return new URL("http://localhost:3000");
}
```

- [ ] **Step 8: Create the root layout** `src/app/[lang]/layout.tsx`

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@fontsource-variable/lexend";
import "../globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { eventConfig } from "@/content/event";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale, locales } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/site";

// Only the params returned below exist; anything else is a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { meta } = getDictionary(lang);
  return {
    metadataBase: getSiteUrl(),
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      locale: lang === "vi" ? "vi_VN" : "en_US",
      type: "website",
      images: [{ url: "/og.png", width: 1200, height: 630 }],
    },
    icons: { icon: "/images/dafur-logo.png" },
  };
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <html lang={lang} className="antialiased">
      <body className="flex min-h-screen flex-col font-sans">
        <div className="relative flex-1">
          <SiteHeader locale={lang} nav={dict.nav} />
          <main>{children}</main>
        </div>
        <SiteFooter footer={dict.footer} facebookUrl={eventConfig.facebookUrl} />
      </body>
    </html>
  );
}
```

- [ ] **Step 9: Create a temporary page** `src/app/[lang]/page.tsx` (replaced in Task 5)

```tsx
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";

export default async function LandingPage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return <h1 className="px-4 pt-32">{getDictionary(lang).meta.title}</h1>;
}
```

- [ ] **Step 10: Verify the build**

Run: `npm run build`
Expected: success; route list shows `● /vi` and `● /en` (SSG). No "Failed to fetch ... Google Fonts".

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: add theme, root [lang] layout, header and footer"
```

---

### Task 5: Landing page sections

**Files:**
- Create: `src/components/Hero.tsx`, `src/components/AnnouncementBoard.tsx`, `src/components/VenueSection.tsx`, `src/components/RulesSection.tsx`
- Modify: `src/app/[lang]/page.tsx` (replace the temporary page)
- Test: `tests/unit/sections.test.tsx`

**Interfaces:**
- Consumes: `Dictionary`, `Locale`, `mapsEmbedUrl`, `mapsLinkUrl`, `eventConfig`.
- Produces: `Hero({ locale; hero })`, `AnnouncementBoard({ announcement })` (renders `section#about`), `VenueSection({ venue; mapsQuery })`, `RulesSection({ rules })`.

- [ ] **Step 1: Write the failing test** `tests/unit/sections.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnnouncementBoard } from "@/components/AnnouncementBoard";
import { Hero } from "@/components/Hero";
import { RulesSection } from "@/components/RulesSection";
import { VenueSection } from "@/components/VenueSection";
import { getDictionary } from "@/lib/dictionaries";

const viDict = getDictionary("vi");
const enDict = getDictionary("en");

describe("landing sections", () => {
  it("Hero shows the date, the logo as the page heading and both CTAs", () => {
    render(<Hero locale="vi" hero={viDict.hero} />);
    expect(screen.getByText("Ngày 30 Tháng 8 Năm 2026")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toContainElement(screen.getByAltText("Paws Of Summer, DaFur 2026"));
    expect(screen.getByRole("link", { name: /Mua vé/ })).toHaveAttribute("href", "/vi/tickets");
    expect(screen.getByRole("link", { name: "Thông tin sự kiện" })).toHaveAttribute("href", "/vi#about");
  });

  it("AnnouncementBoard is the #about target and renders every paragraph", () => {
    const { container } = render(<AnnouncementBoard announcement={viDict.announcement} />);
    expect(container.querySelector("section#about")).not.toBeNull();
    for (const paragraph of viDict.announcement.paragraphs) expect(screen.getByText(paragraph)).toBeInTheDocument();
  });

  it("VenueSection lists details and embeds the map for the query", () => {
    render(<VenueSection venue={viDict.venue} mapsQuery="Angel Coffee" />);
    expect(screen.getByText("28.000 VNĐ / người")).toBeInTheDocument();
    expect(screen.getByTitle(viDict.venue.mapTitle)).toHaveAttribute(
      "src",
      "https://www.google.com/maps?q=Angel%20Coffee&output=embed",
    );
    expect(screen.getByRole("link", { name: /Mở trong Google Maps/ })).toHaveAttribute("target", "_blank");
  });

  it("RulesSection renders every rule and the closing line", () => {
    render(<RulesSection rules={enDict.rules} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(enDict.rules.items.length);
    expect(screen.getByText(enDict.rules.closing)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/unit/sections.test.tsx`
Expected: FAIL, cannot resolve `@/components/AnnouncementBoard`.

- [ ] **Step 3: Create the sections**

`src/components/Hero.tsx`:
```tsx
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";

type Props = { locale: Locale; hero: Dictionary["hero"] };

export function Hero({ locale, hero }: Props) {
  return (
    <section className="relative isolate flex min-h-[580px] flex-col items-center overflow-hidden bg-sand px-4 pb-16 pt-28 text-center md:min-h-[760px] md:pb-24 md:pt-32">
      <Image
        src="/images/beach-bg.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover object-top"
      />
      <p className="font-semibold text-white drop-shadow md:text-lg">{hero.date}</p>
      <p className="mt-1 text-sm text-white drop-shadow md:text-base">{hero.venue}</p>

      <h1 className="mt-6 w-full max-w-[640px]">
        <Image
          src="/images/event-logo.png"
          alt={hero.logoAlt}
          width={615}
          height={372}
          priority
          sizes="(min-width: 768px) 640px, 92vw"
          className="h-auto w-full"
        />
      </h1>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={`/${locale}/tickets`}
          className="rounded-full bg-aqua px-8 py-3 font-bold text-ink shadow-md hover:bg-aqua-soft"
        >
          {hero.buyTicket} →
        </Link>
        <Link
          href={`/${locale}#about`}
          className="rounded-full bg-white px-6 py-3 font-bold text-ink shadow-md hover:bg-sand"
        >
          {hero.eventInfo}
        </Link>
      </div>
    </section>
  );
}
```

`src/components/AnnouncementBoard.tsx`:
```tsx
import type { Dictionary } from "@/lib/dictionaries";

type Props = { announcement: Dictionary["announcement"] };

export function AnnouncementBoard({ announcement }: Props) {
  return (
    <section id="about" aria-labelledby="about-title" className="scroll-mt-6 bg-sand px-4 pb-16 pt-4">
      <div className="relative mx-auto max-w-5xl pt-20">
        {/* Hanging string and pin, drawn in SVG so the board can grow with its text. */}
        <svg
          aria-hidden
          viewBox="0 0 400 80"
          preserveAspectRatio="none"
          className="absolute inset-x-[20%] top-0 h-20 w-[60%]"
        >
          <polyline points="0,80 200,6 400,80" fill="none" stroke="#1f2a27" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          <circle cx="200" cy="6" r="6" fill="var(--color-pin)" />
        </svg>
        <div className="rounded-3xl bg-board-frame p-3 shadow-lg md:p-4">
          <div className="rounded-2xl bg-board px-6 py-8 text-white md:px-12 md:py-12">
            <p className="text-3xl font-extrabold text-aqua-soft md:text-5xl">{announcement.kicker}</p>
            <h2 id="about-title" className="mt-2 text-xl font-bold uppercase text-aqua-soft md:text-2xl">
              {announcement.title}
            </h2>
            <div className="mt-6 space-y-4 leading-relaxed text-white/95">
              {announcement.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

`src/components/VenueSection.tsx`:
```tsx
import type { Dictionary } from "@/lib/dictionaries";
import { mapsEmbedUrl, mapsLinkUrl } from "@/lib/maps";

type Props = { venue: Dictionary["venue"]; mapsQuery: string };

export function VenueSection({ venue, mapsQuery }: Props) {
  return (
    <section aria-labelledby="venue-title" className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-2 md:px-8">
      <div>
        <h2 id="venue-title" className="text-3xl font-extrabold uppercase text-sea md:text-4xl">
          {venue.heading}
        </h2>
        <p className="mt-4 font-medium">{venue.intro}</p>
        <ul className="mt-4 list-disc space-y-1 pl-6">
          {venue.details.map((detail) => (
            <li key={detail.label}>
              <span className="font-semibold">{detail.label}:</span> {detail.value}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <iframe
          title={venue.mapTitle}
          src={mapsEmbedUrl(mapsQuery)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="aspect-[4/3] w-full rounded-2xl border-0 shadow-md"
        />
        <a
          href={mapsLinkUrl(mapsQuery)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block font-semibold text-sea underline underline-offset-4"
        >
          {venue.openInMaps} ↗
        </a>
      </div>
    </section>
  );
}
```

`src/components/RulesSection.tsx`:
```tsx
import type { Dictionary } from "@/lib/dictionaries";

type Props = { rules: Dictionary["rules"] };

export function RulesSection({ rules }: Props) {
  return (
    <section aria-labelledby="rules-title" className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
      <h2 id="rules-title" className="text-3xl font-extrabold uppercase text-sea md:text-4xl">
        {rules.heading}
      </h2>
      <p className="mt-4 font-medium">{rules.intro}</p>
      <ul className="mt-6 list-disc space-y-3 pl-6 leading-relaxed">
        {rules.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-10 text-2xl font-bold leading-snug text-sea md:text-3xl">{rules.closing}</p>
    </section>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/sections.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Replace** `src/app/[lang]/page.tsx`

```tsx
import { notFound } from "next/navigation";
import { AnnouncementBoard } from "@/components/AnnouncementBoard";
import { Hero } from "@/components/Hero";
import { RulesSection } from "@/components/RulesSection";
import { VenueSection } from "@/components/VenueSection";
import { eventConfig } from "@/content/event";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";

export default async function LandingPage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <>
      <Hero locale={lang} hero={dict.hero} />
      <AnnouncementBoard announcement={dict.announcement} />
      <VenueSection venue={dict.venue} mapsQuery={eventConfig.mapsQuery} />
      <RulesSection rules={dict.rules} />
    </>
  );
}
```

- [ ] **Step 6: Build and look at it**

Run: `npm run build && npm run start -- -p 3000`, open `http://localhost:3000/vi` at 1366 px and 390 px wide and compare with `docs/design-assets/mockups/landing.png`. Expected: sky visible behind the header, logo centred, two CTAs, board on sand, venue with map, rules, teal footer. Stop the server afterwards.

- [ ] **Step 7: Commit**

```bash
git add src/components src/app/[lang]/page.tsx tests/unit/sections.test.tsx
git commit -m "feat: build landing page sections"
```

---

### Task 6: Coming-soon pages

**Files:**
- Create: `src/components/ComingSoon.tsx`, `src/app/[lang]/[feature]/page.tsx`
- Test: `tests/unit/coming-soon.test.tsx`

**Interfaces:**
- Consumes: `comingSoonFeatures`, `isComingSoonFeature`, `featureLabel`, `Dictionary`.
- Produces: `ComingSoon({ locale: Locale; title: string; soon: Dictionary["soon"]; badge: string })`; static routes `/{vi,en}/{tickets,talent,gallery,login}`.

- [ ] **Step 1: Write the failing test** `tests/unit/coming-soon.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ComingSoon } from "@/components/ComingSoon";
import { getDictionary } from "@/lib/dictionaries";

const enDict = getDictionary("en");

describe("ComingSoon", () => {
  it("shows the feature title and a link back home", () => {
    render(<ComingSoon locale="en" title="Tickets" soon={enDict.soon} badge={enDict.nav.soonBadge} />);
    expect(screen.getByRole("heading", { level: 1, name: "Tickets" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Back to home/ })).toHaveAttribute("href", "/en");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/unit/coming-soon.test.tsx`
Expected: FAIL, cannot resolve `@/components/ComingSoon`.

- [ ] **Step 3: Implement** `src/components/ComingSoon.tsx`

```tsx
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import { SoonBadge } from "./SoonBadge";

type Props = { locale: Locale; title: string; soon: Dictionary["soon"]; badge: string };

export function ComingSoon({ locale, title, soon, badge }: Props) {
  return (
    <section className="flex min-h-[calc(100svh-5.5rem)] flex-col items-center justify-center bg-gradient-to-b from-sea-deep via-sea-light to-sand px-4 pb-16 pt-32 text-center">
      <SoonBadge label={badge} />
      <h1 className="mt-4 text-4xl font-extrabold text-white drop-shadow md:text-5xl">{title}</h1>
      <p className="mt-4 max-w-md text-lg text-ink">{soon.body}</p>
      <Link href={`/${locale}`} className="mt-8 rounded-full bg-aqua px-8 py-3 font-bold text-ink shadow-md hover:bg-aqua-soft">
        ← {soon.back}
      </Link>
    </section>
  );
}
```

and `src/app/[lang]/[feature]/page.tsx`

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/ComingSoon";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";
import { comingSoonFeatures, featureLabel, isComingSoonFeature } from "@/lib/nav";

// Temporary pages for features that are not built yet.
// When a real feature ships, create app/[lang]/<feature>/page.tsx: a static
// segment wins over this dynamic one. Then remove it from comingSoonFeatures.
// Only the params returned below exist; anything else is a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return comingSoonFeatures.map((feature) => ({ feature }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[feature]">): Promise<Metadata> {
  const { lang, feature } = await params;
  if (!hasLocale(lang) || !isComingSoonFeature(feature)) return {};
  const dict = getDictionary(lang);
  return { title: `${featureLabel(feature, dict.nav)} · ${dict.meta.title}`, robots: { index: false } };
}

export default async function ComingSoonPage({ params }: PageProps<"/[lang]/[feature]">) {
  const { lang, feature } = await params;
  if (!hasLocale(lang) || !isComingSoonFeature(feature)) notFound();
  const dict = getDictionary(lang);

  return <ComingSoon locale={lang} title={featureLabel(feature, dict.nav)} soon={dict.soon} badge={dict.nav.soonBadge} />;
}
```

- [ ] **Step 4: Run all unit tests and the build**

Run: `npm test && npm run build`
Expected: 7 test files, 33 tests pass; route list shows `/vi/tickets`, `/vi/talent`, `/vi/gallery` and "+5 more paths" as `●` SSG.

- [ ] **Step 5: Commit**

```bash
git add src/components/ComingSoon.tsx "src/app/[lang]/[feature]" tests/unit/coming-soon.test.tsx
git commit -m "feat: add coming-soon pages for unbuilt features"
```

---

### Task 7: End-to-end tests and final verification

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/landing.spec.ts`

**Interfaces:**
- Consumes: the whole app via `npm run build && npm run start`.
- Produces: `npm run test:e2e`.

- [ ] **Step 1: Install the Playwright browser** (once per machine)

```bash
npx playwright install chromium
```
If a Chromium is already installed elsewhere, skip this and set `PW_CHROMIUM_PATH=/path/to/chrome` when running tests.

- [ ] **Step 2: Create** `playwright.config.ts`

```ts
import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
// Optional: point at an already-installed Chromium instead of `npx playwright install chromium`.
const executablePath = process.env.PW_CHROMIUM_PATH;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}/vi`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
```

- [ ] **Step 3: Create** `tests/e2e/landing.spec.ts`

```ts
import { expect, test } from "@playwright/test";

test("root redirects to the Vietnamese landing page", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/vi$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Địa điểm" })).toBeVisible();
});

test("switching language keeps the page and translates it", async ({ page }) => {
  await page.goto("/vi/tickets");
  await page.getByLabel("Ngôn ngữ").click();
  await page.getByRole("link", { name: "English" }).click();
  await expect(page).toHaveURL(/\/en\/tickets$/);
  await expect(page.getByRole("heading", { level: 1, name: "Tickets" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("buy ticket CTA leads to the coming soon page", async ({ page }) => {
  await page.goto("/vi");
  await page.getByRole("link", { name: /Mua vé/ }).click();
  await expect(page).toHaveURL(/\/vi\/tickets$/);
  await expect(page.getByText("Phần này đang được BTC chuẩn bị, các bạn quay lại sau nha!")).toBeVisible();
});

test("unknown locales and features return a real 404", async ({ request }) => {
  expect((await request.get("/fr")).status()).toBe(404);
  expect((await request.get("/vi/not-a-feature")).status()).toBe(404);
});

test("page has share metadata for both languages", async ({ page }) => {
  await page.goto("/en");
  await expect(page).toHaveTitle("DaFur 2026 · Paws Of Summer");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/og\.png$/);
  await expect(page.locator('link[rel="alternate"][hreflang="vi"]')).toHaveAttribute("href", /\/vi$/);
});

test("mobile menu opens and navigates", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await page.goto("/vi");
  await page.getByRole("button", { name: "Mở menu" }).click();
  await page.getByRole("navigation").getByRole("link", { name: /Giới thiệu/ }).click();
  await expect(page).toHaveURL(/\/vi#about$/);
  await expect(page.getByRole("button", { name: "Mở menu" })).toBeVisible();
});

test("no horizontal scroll on the landing page", async ({ page }) => {
  await page.goto("/vi");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
```

- [ ] **Step 4: Run e2e**

Run: `npm run test:e2e`
Expected: 13 passed, 1 skipped (the mobile-menu test is skipped on the desktop project).

- [ ] **Step 5: Full verification**

Run: `npm run lint && npx tsc --noEmit && npm test && npm run build`
Expected: all clean. Then take 1366 px and 390 px full-page screenshots of `/vi` and `/en/tickets` and compare with the mockup; fix only real visual bugs.

- [ ] **Step 6: Commit**

```bash
git add playwright.config.ts tests/e2e .gitignore
git commit -m "test: add playwright e2e for routing, i18n and mobile menu"
```

---

### Task 8: Deploy to Vercel

This task needs the user's GitHub and Vercel accounts. Do the steps the tools allow; hand the rest to the user as a checklist.

- [ ] **Step 1: Push to GitHub**

```bash
gh repo create dafur-web --private --source=. --push
```
If `gh` is not logged in, ask the user to create an empty private repo and run `git remote add origin <url> && git push -u origin main`.

- [ ] **Step 2: Import in Vercel** (user, in the browser): vercel.com → Add New → Project → import `dafur-web` → Framework "Next.js" auto-detected → Deploy. No environment variables are needed. Plan: Hobby (landing page is non-commercial; switch to Pro before selling tickets, see spec §2).

- [ ] **Step 3: Smoke-test production**: open `https://<project>.vercel.app/` → lands on `/vi`; switch to English; open `/vi/tickets`; check the link preview with any Open Graph debugger.

- [ ] **Step 4: Optional domain**: add it in Vercel → Settings → Domains, then set `NEXT_PUBLIC_SITE_URL=https://<domain>` and redeploy.
