import { $ } from "bun";
import { chromium } from "playwright";

// ===============================================================================================================
// This file generates a long playwright trace by visiting random youtube videos for a fixed duration.
// This will generate a pretty sizable session zip file that demonstrates that the performance of such large
// files in the official playwright trace viewer (https://trace.playwright.dev)
// ===============================================================================================================

await $`mkdir -p ./context`;
const browser = await chromium.launchPersistentContext(
  "./context/performance",
  {
    headless: false,
    viewport: {
      width: 1920,
      height: 1080,
    },
  },
);

const page = await browser.newPage();

await browser.tracing.start({
  name: "tracing-performance",
  screenshots: true,
  snapshots: true,
});

await page.goto("https://www.youtube.com/watch?v=swXWUfufu2w");

const MIN_MS = 1000 * 60;
const DURATION = 15 * MIN_MS;
const start = Date.now();
while (true) {
  const diff = Date.now() - start;
  console.log(`Time left: ${formatTime(DURATION - diff)} (mm:ss)`);
  if (diff >= DURATION) break;

  await page.waitForLoadState();

  // => noise to fill up the trace file with data
  await page.waitForSelector("#above-the-fold #description");
  await page.click("#above-the-fold #description");

  // => load some comments
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollBy(0, 500));
    await Bun.sleep(1000);
  }
  await page.evaluate(() => window.scrollTo(0, 0));

  // => play the next video
  await page.click("#items a#thumbnail:not([href*='shorts'])");
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
