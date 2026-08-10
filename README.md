# AIgency Labs

Marketing site for AIgency Labs — a studio building custom software, designing AI automations, and training teams to build their own AI skills. Studios in New York City, México City, and Madrid.

Two hand-written static pages, no build step, no dependencies:

| File | Page |
| --- | --- |
| [`index.html`](index.html) | Home — practice, approach, studios, contact |
| [`academy.html`](academy.html) | Academy — audience, curriculum, formats, FAQ |

## Running it

Open either file directly in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Design system

Both pages carry the same self-contained system in a `<style>` block — CSS custom properties, no framework, no preprocessor.

- **Type** — SF Pro via the system font stack, with Inter (Google Fonts) as the cross-platform fallback
- **Theme** — light and dark, driven by `prefers-color-scheme`; every colour is a token on `:root`
- **Colour** — `#1d1d1f` ink on white, `#f5f5f7` panels, `#0071e3` accent, plus a blue → violet → orange gradient used for emphasis text and accents

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

The form on the home page posts to [FormSubmit](https://formsubmit.co) over AJAX, with a honeypot field and client-side required-field validation. To change where submissions land, edit the form's `action` in [`index.html`](index.html).

## Deploying

Static hosting of any kind works. For GitHub Pages: Settings → Pages → deploy from `main`, root folder — `index.html` becomes the site root.

## License

[MIT](LICENSE) © AIgency Labs S.L.
