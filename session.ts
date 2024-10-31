import { $ } from "bun";
import { chromium } from "playwright";

// ===============================================================================================================
// This file generates a long playwright trace by visiting wikipedia and clicking through links for 10 minutes.
// This will generate a pretty sizable session zip file that demonstrates that the performance of such large
// files in the official playwright trace viewer (https://trace.playwright.dev)
// ===============================================================================================================

await $`mkdir -p ./context`;
const browser = await chromium.launchPersistentContext(
  "./context/performance",
  { headless: false },
);

const page = await browser.newPage();

await browser.tracing.start({
  name: "tracing-performance",
  screenshots: true,
  snapshots: true,
  sources: true,
});

const MIN_MS = 1000 * 60;
const DURATION = 1.5 * MIN_MS;
const start = Date.now();
while (true) {
  const diff = Date.now() - start;
  console.log(`Time left: ${formatTime(DURATION - diff)} (mm:ss)`);
  if (diff >= DURATION) break;

  await page.goto("https://en.wikipedia.org/wiki/Special:Random");
  await page.waitForLoadState();

  await Bun.sleep(1000);
}

await browser.tracing.stop({ path: "./SESSION.zip" });

await browser.close();

// Thank You Claude
function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = seconds.toString().padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}
