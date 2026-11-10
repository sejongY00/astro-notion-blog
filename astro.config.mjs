import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import { CUSTOM_DOMAIN, BASE_PATH } from './src/server-constants';
import CoverImageDownloader from './src/integrations/cover-image-downloader';
import CustomIconDownloader from './src/integrations/custom-icon-downloader';
import FeaturedImageDownloader from './src/integrations/featured-image-downloader';
import PublicNotionCopier from './src/integrations/public-notion-copier';

const getSite = function () {
  if (CUSTOM_DOMAIN) {
    return new URL(BASE_PATH, `https://${CUSTOM_DOMAIN}`).toString();
  }

  if (process.env.VERCEL && process.env.VERCEL_URL) {
    return new URL(BASE_PATH, `https://${process.env.VERCEL_URL}`).toString();
  }

  if (process.env.CF_PAGES) {
    if (process.env.CF_PAGES_BRANCH !== 'main') {
      return new URL(BASE_PATH, process.env.CF_PAGES_URL).toString();
    }

    return new URL(
      BASE_PATH,
      `https://${new URL(process.env.CF_PAGES_URL).host
        .split('.')
        .slice(1)
        .join('.')}`
    ).toString();
  }

  return new URL(BASE_PATH, 'http://localhost:4321').toString();
};

// 예전 Ghost 블로그 주소(/slug/)를 새 주소(/posts/slug/)로 보낸다.
// GitHub Pages는 서버 리다이렉트를 지원하지 않아 Astro가 자동 이동 HTML을 만든다.
const ghostSlugs = [
  'wol-direct-link',
  'hermes-opencode-go-telegram',
  'mudfish-decky',
  'steamdeck-moonlight-tailscale',
  'claude-code-on-nas',
  'sejong-office',
  'netbird-to-headscale',
  'npmplus-to-caddy',
];
// Astro는 이동할 주소 앞에 base를 붙여주지 않으므로 직접 붙인다.
const base = BASE_PATH.replace(/\/$/, '');
const redirects = Object.fromEntries([
  ...ghostSlugs.map((slug) => [`/${slug}`, `${base}/posts/${slug}`]),
  ['/rss', `${base}/feed`],
]);

// https://astro.build/config
export default defineConfig({
  site: getSite(),
  base: BASE_PATH,
  redirects,
  integrations: [
    icon(),
    CoverImageDownloader(),
    CustomIconDownloader(),
    FeaturedImageDownloader(),
    PublicNotionCopier(),
  ],
});
