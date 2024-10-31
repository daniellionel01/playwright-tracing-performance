# Playwright Tracing Performance

This is a repository serves to reproduce an issue with very large trace files that are loaded into the official playwright trace viewer (https://trace.playwright.dev)

---

- Install dependencies: `bun install`
- Install chromium: `bunx playwright install`
- Generate trace file: `bun run session.ts`
- Open trace file in trace viewer: `bunx playwright show-trace SESSION.zip`
