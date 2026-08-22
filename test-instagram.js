import { chromium } from 'playwright';
import fs from 'fs';

const username = 'matsudatoukouen1630';
const url = `https://www.instagram.com/${username}/`;

const browser = await chromium.launch({
  headless: true
});

const context = await browser.newContext({
  locale: 'ja-JP',
  viewport: {
    width: 1920,
    height: 1080
  }
});

const page = await context.newPage();

try {
  const response = await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  // 少しだけ待つ
  await page.waitForTimeout(5000);

  const html = await page.content();

  fs.writeFileSync(
    'instagram.html',
    html,
    'utf8'
  );

  const result = {
    status: response ? response.status() : null,
    finalUrl: page.url(),
    length: html.length,

    hasRelayPrefetch:
      html.includes('RelayPrefetchedStreamCache'),

    hasPolarisPreloader:
      html.includes(
        'PolarisLoggedOutDesktopWWWProfilePostsTabContentQueryRelayPreloader'
      ),

    hasTimeline:
      html.includes('polaris_ordered_timeline_connection'),

    hasCaption:
      html.includes('"caption":{"text"'),

    hasDisplayUri:
      html.includes('"display_uri"'),

    hasKnownPost:
      html.includes('DcTiHdGps8q')
  };

  console.log(JSON.stringify(result, null, 2));

  fs.writeFileSync(
    'result.json',
    JSON.stringify(result, null, 2),
    'utf8'
  );

} catch (e) {
  const result = {
    error: String(e)
  };

  console.error(result);

  fs.writeFileSync(
    'result.json',
    JSON.stringify(result, null, 2),
    'utf8'
  );
}

await browser.close();
