# Andrew Owoko — Portfolio Website

Pure HTML/CSS/JS, no frameworks. Open `index.html` directly in a browser, or serve the folder with any static file server.

## Structure
```
index.html      Home
services.html   Services
products.html   Products
poa.html        POA — Pharmtalk by Andrew Owoko
css/style.css   Shared stylesheet (all pages)
js/script.js    Shared JavaScript (nav, reveal animations, counters,
                product filter, podcast player, back-to-top)
images/         Add real photos here (see below)
audio/          Add real episode audio here (see below)
```

## Replacing placeholders

**Profile photo** — the site currently uses a circular initials avatar ("AO")
instead of a photo, styled with `.avatar`. To use a real photo:
1. Add the image to `images/` (e.g. `images/andrew-owoko.jpg`).
2. Replace `<div class="avatar">AO</div>` with
   `<div class="avatar"><img src="images/andrew-owoko.jpg" alt="Andrew Owoko"></div>`
   in each page's sidebar, mobile bar, and the hero portrait on `index.html`.

**Podcast audio** — each episode card on `poa.html` already points at
`audio/episode-01.mp3`, `episode-02.mp3`, etc. Drop real MP3 files into
`audio/` with matching filenames and the play buttons, progress bars and
pause/resume logic in `js/script.js` will work with no further changes.

**Product images** — product cards currently use an icon on a tinted
background (`.product-media`). Swap in `<img>` tags the same way as the
avatar once real product photography is available.

**Copy** — bio text, stats, service descriptions, and product details in
all four HTML files are realistic placeholders. Replace with Andrew's
actual biography, achievements, and product/episode details.

**Social links** — all social icons in the sidebar and footer currently
point to `#`. Replace with real profile URLs.

## Notes
- Right-side fixed sidebar on desktop (≥901px); collapses to a top bar
  with a slide-in panel on tablet/mobile.
- Category filtering on the Products page is handled entirely in
  `js/script.js` via `data-category` attributes on each card.
- The heartbeat/waveform line motif ties the pharma hero (home) and the
  podcast brand (POA) together visually.
