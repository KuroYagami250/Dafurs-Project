# Cách chạy (cho Kuro)

1. Tạo folder trống, vd `dafur-web`, giải nén kit vào sao cho trong folder **chỉ có** thư mục `docs/` (create-next-app chỉ chịu scaffold khi folder chỉ có `docs/`).
2. Mở terminal ở folder đó, chạy `claude`.
3. Điền 1 dòng Facebook URL bên dưới (ko có thì để trống), rồi copy nguyên block prompt dán vào Claude Code.
4. Lúc nó hỏi đăng nhập GitHub/Vercel ở Task 8 thì làm theo checklist nó đưa.

Cần sẵn trên máy: **Node 22.13 trở lên** (Vitest 5 đòi Node 22.12+, jsdom đòi 22.13+; Node 20 sẽ ko chạy test), git, (tuỳ chọn) `gh` CLI đã login. Check bằng `node -v`.

---

## Prompt (copy từ đây)

```
We are building the DaFur event landing page from a finished spec and plan. Everything you need is in docs/.

Read first, fully, in this order:
1. docs/superpowers/specs/2026-10-07-dafur-landing-design.md  (the spec, explains every decision)
2. docs/superpowers/plans/2026-10-07-dafur-landing.md         (the plan, 8 tasks with exact code)
3. docs/design-assets/mockups/landing.png                      (visual target)

Then execute the plan task by task using the superpowers:executing-plans skill (native, in this session).
Skills to use along the way:
- superpowers:test-driven-development   - for every task: write the test, see it fail, implement, see it pass
- superpowers:systematic-debugging      - whenever a test, build or e2e run fails unexpectedly; find root cause before changing code
- superpowers:verification-before-completion - before ticking any task or claiming done: run the commands and show the output
- superpowers:requesting-code-review    - after Task 7, dispatch one fresh reviewer on the whole branch against the spec
- superpowers:finishing-a-development-branch - after the review is addressed, before Task 8
- frontend-design (or ui-ux-pro-max)    - ONLY in Task 5 Step 6 and Task 7 Step 5 to judge screenshots vs the mockup; do not redesign, only fix real visual bugs

Rules:
- Follow the plan's Global Constraints exactly (Next.js 16.4.0, no next-intl, no middleware/proxy, no cacheComponents, Lexend via @fontsource-variable, dictionaries in src/content).
- The plan's code was verified on 2026-10-07 (33 unit tests, 13 e2e tests, lint and tsc clean). Use it as written. If something fails on this machine, debug the root cause and explain the deviation; do not swap libraries or approaches.
- Next 16 differs from your training data. When unsure about a Next API, read node_modules/next/dist/docs/ as AGENTS.md says.
- Keep the Vietnamese copy exactly as in the plan.
- Commit after each task as the plan says.
- Talk to me in Vietnamese, casual, short updates only when a task finishes or something blocks.

Facebook fanpage URL for src/content/event.ts facebookUrl (leave "" if blank): 

Task 8 (deploy) needs my GitHub/Vercel accounts: do what the CLI allows, then give me a short checklist for the rest.
```

---

## Muốn kỹ hơn (tốn token hơn)

Thay dòng "Then execute the plan ... using the superpowers:executing-plans skill (native, in this session)." bằng:

```
Then execute the plan with the superpowers:subagent-driven-development skill: a fresh subagent per task, a fresh reviewer per task, then a whole-branch review.
```
