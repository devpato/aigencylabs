# AIgency Labs

Marketing site for AIgency Labs, a studio building custom software, designing AI automations, and training teams to build their own AI skills. Studios in New York City, México City, and Madrid.

Two hand-written static pages, no build step, no dependencies:

| File | Page |
| --- | --- |
| [`index.html`](index.html) | Home: practice, approach, studios, contact |
| [`academy.html`](academy.html) | Academy: audience, curriculum, formats, FAQ |

## Running it

Open either file directly in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Design system

Both pages carry the same self-contained system in a `<style>` block: CSS custom properties, no framework, no preprocessor.

- **Type**: SF Pro via the system font stack, with Inter (Google Fonts) as the cross-platform fallback
- **Theme**: light and dark. Follows `prefers-color-scheme` by default; the nav toggle pins an explicit choice as `data-theme` on `<html>`, remembered in `localStorage` and applied by an inline head script so there's no flash of the wrong theme on load. Switching cross-fades via the View Transitions API where supported. Every colour is a token on `:root`
- **Colour**: `#1d1d1f` ink on white, `#f5f5f7` panels, `#0071e3` accent, plus a blue → violet → orange gradient used for emphasis text and accents

### Effects

- Frosted glass nav with a hairline that appears on scroll, and a glass sheet menu on mobile
- Word-by-word blur-in for hero headlines
- Scroll-driven hero fade/scale and scroll-progress bar via native `animation-timeline: scroll()`, behind `@supports`
- Animated gradient mesh backdrops (drifting blurred blobs)
- Pointer-tracked specular sheen and hover lift on cards
- Animated conic-gradient borders using `@property --ang` and mask compositing
- Stacked sticky panels, `view()`-timeline zoom-in panels, and an `::details-content` FAQ accordion

Reveal-on-scroll uses `IntersectionObserver`, gated on a `js` class plus a `load` fallback so content is never stranded invisible if scripting is unavailable. Everything animated is disabled under `prefers-reduced-motion: reduce`.

## Contact form

The form on the home page posts JSON to [`api/contact.js`](api/contact.js), a Vercel serverless function that validates the submission and sends it as an email through [Resend](https://resend.com). It has a honeypot field, client-side and server-side required-field checks, length caps, and HTML escaping on everything that reaches the email body. Replies go to the sender, because the message sets `reply_to`.

Set these environment variables in Vercel (Settings, Environment Variables):

| Variable | Required | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | yes | API key from the Resend dashboard |
| `CONTACT_TO` | yes | Where submissions are delivered |
| `CONTACT_FROM` | no | Sender address, on a domain verified in Resend. Defaults to `AIgency Labs <noreply@theaigencylab.com>` |

The sending domain must be verified in Resend, which means adding its DNS records at your registrar. Without that, mail either fails or lands in spam.

## SEO and AI discoverability

Both pages carry a canonical URL, a robots meta tag, Open Graph and Twitter card tags, and JSON-LD structured data. The home page describes the organization, the website, and a catalog of the five services; the academy page adds a `Course` with its three formats and prices, a `FAQPage` built from the questions on the page, and a breadcrumb.

Supporting files at the root:

| File | Purpose |
| --- | --- |
| [`robots.txt`](robots.txt) | Allows search crawlers and explicitly allows the AI crawlers (OpenAI, Anthropic, Google-Extended, Perplexity, Applebot, CCBot), disallows `/api/`, points at the sitemap |
| [`sitemap.xml`](sitemap.xml) | Both pages, with `lastmod`. Update the dates when content changes |
| [`llms.txt`](llms.txt) | A plain-language summary of the business, services, academy details, and contact info, for assistants that read it |
| `og.jpg` | 1200x630 share card. Regenerate from [`og.svg`](og.svg) if the positioning changes |

The pages are static HTML with no client-side rendering, so crawlers that don't execute JavaScript still see every word. The reveal-on-scroll animation is gated behind a `js` class for exactly this reason.

## Deploying

Static hosting of any kind works. For GitHub Pages: Settings → Pages → deploy from `main`, root folder, and `index.html` becomes the site root.

## License

[MIT](LICENSE) © AIgency Labs S.L.
