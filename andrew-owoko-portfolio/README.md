# Andrew Owoko — Portfolio Website

Pure HTML/CSS/JS, no frameworks. Open `index.html` directly in a browser, or serve the folder with any static file server.

## Structure
```
index.html      Home
services.html   Services
products.html   Products
poa.html        POA — Pharmtalk by Andrew Owoko
profile.html    Profile (LinkedIn-style CV page)
css/style.css   Shared stylesheet (all pages)
js/script.js    Shared JavaScript (nav, reveal animations, counters,
                product/service modals, content tabs, chat widget, etc.)
images/         Drop real photos here (see below)
audio/          Unused — the podcast episode player was removed
```

## Replacing placeholders

**Avatar photo ("AO")** — every circular avatar across all five pages
(sidebar, mobile top bar, chat bubble, chat modal, and the large one on
Profile) now points at a generated placeholder image
(`https://placehold.co/200x200/...`) with the "AO" initials showing
underneath as a fallback if the image ever fails to load. To use a real
photo:
1. Add the image to `images/` (e.g. `images/andrew-owoko.jpg`).
2. Find and replace every occurrence of the placehold.co URL in each
   HTML file's `<img src="...">` inside `.avatar` with
   `images/andrew-owoko.jpg`. A simple find-and-replace across all five
   files works since the URL is identical everywhere.

**Profile banner** — the cover image at the top of `profile.html` is
also a placehold.co placeholder (`.li-cover img`). Replace its `src`
with a real banner photo the same way.

**Product image** — the Products page card and its "View More" modal
both pull from a single `data-image` attribute on the product card in
`products.html`. Update that one attribute to change both places at
once.

**Podcast audio / episodes** — removed. The Articles / Talks / Discover
tabs on `poa.html` replaced the old episode player entirely.

**Copy** — bio text, stats, service descriptions, product details, and
the Profile page's job description/achievements are a mix of realistic
placeholders and the real details you provided. Review each page and
adjust as needed.

**Social links** — social icons in the sidebar, footer, and the chat
bubble's "Socials" tab currently point to `#`. Replace with real
profile URLs.

**Contact numbers** — the phone/WhatsApp number used throughout
(chat bubble, product modal, service cards) is `+254715325834`, taken
from the Profile page. Update in one place per file if it changes —
search for `254715325834`.

## Notes
- Left-side fixed sidebar on desktop (≥901px); collapses to a top bar
  with a static bottom tab bar (Home / Services / Products / POA /
  Profile) on mobile.
- Category filtering on Products, and the Articles/Talks/Discover tabs
  on POA, are handled in `js/script.js` via `data-*` attributes — no
  page reload needed to extend either.
- Product and Service cards share a similar pattern: square tile with
  an eye-icon badge, click anywhere to open a details modal.
