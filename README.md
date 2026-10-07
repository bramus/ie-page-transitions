# ie-page-transitions

Bringing back Internet Explorer’s Page Transitions thanks to the View Transition API

[![Source](https://img.shields.io/badge/Source-GitHub-2dba4e)](https://github.com/bramus/ie-page-transitions)
[![npm](https://img.shields.io/npm/v/ie-page-transitions)](https://www.npmjs.com/package/ie-page-transitions)
[![NPM](https://img.shields.io/npm/l/ie-page-transitions)](./LICENSE)
[![Demo](https://img.shields.io/badge/demo-_Website-hotpink)](https://page-transitions.style/)

**`ie-page-transitions`** is a CSS + JS library that brings back Microsoft Internet Explorer’s proprietary [“Interpage Transitions”](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/ms532847(v=vs.85)?redirectedfrom=MSDN#interpage-transitions) (`RevealTrans` effects `0`–`23`) to modern browsers. It works by reading the original `<meta http-equiv="Page-Enter">` and `<meta http-equiv="Page-Exit">` tags and executing the transitions using the [View Transition API](https://developer.chrome.com/docs/web-platform/view-transitions).

👉 **Full Documentation, Effect Previews & Live Demos:** [https://page-transitions.style](https://page-transitions.style)

## Installation

Install from NPM:

```bash
npm install ie-page-transitions
```

Or load directly from a CDN:

- unpkg: `https://unpkg.com/ie-page-transitions/` + `path/to/file.ext`
- jsDelivr: `https://cdn.jsdelivr.net/npm/ie-page-transitions/` + `path/to/file.ext`
- Skypack: `https://cdn.skypack.dev/ie-page-transitions/` + `path/to/file.ext`
- esm.sh: `https://esm.sh/ie-page-transitions/` + `path/to/file.ext`

## Quick Start

### MPA (Cross-Document)

```html
<!-- 1. Enable Cross-Document View Transitions -->
<style>
	@view-transition {
		navigation: auto;
	}
</style>

<!-- 2. Include Stylesheet and Render-Blocking Script -->
<link rel="stylesheet" href="https://unpkg.com/ie-page-transitions/ie-page-transitions.css">
<script src="https://unpkg.com/ie-page-transitions/ie-page-transitions.mpa.js" type="module" blocking="render"></script>

<!-- 3. Configure IE Page Transitions Effect(s) -->
<meta http-equiv="Page-Enter" content="revealTrans(Duration=0.5,Transition=23)">
<meta http-equiv="Page-Exit" content="revealTrans(Duration=0.5,Transition=23)">
```

### SPA (Same-Document)

```html
<link rel="stylesheet" href="https://unpkg.com/ie-page-transitions/ie-page-transitions.css">
<meta http-equiv="Page-Enter" content="revealTrans(Duration=0.5,Transition=23)">
<meta http-equiv="Page-Exit" content="revealTrans(Duration=0.5,Transition=23)">

<!-- Optional: Run Page-Enter transition on initial page load -->
<script type="module" blocking="render">
	import { init } from 'https://unpkg.com/ie-page-transitions/ie-page-transitions.spa.js';
	init();
</script>
```

Then wrap your DOM updates in `startViewTransition` from `ie-page-transitions.spa.js`:

```js
import { startViewTransition } from 'https://unpkg.com/ie-page-transitions/ie-page-transitions.spa.js';

$linkToNextPage.addEventListener('click', (e) => {
	e.preventDefault();
	startViewTransition(updateTheDOMSomehow);
});
```

## Configuration

Configure transitions via the `<meta>` tag attributes:

- `http-equiv`: `Page-Enter` or `Page-Exit`
- `Duration`: `0.5`, `1.0`, `1.5`, or `2.0` (in seconds)
- `Transition`: `0`–`22` for a specific effect, or `23` for a random effect. See [page-transitions.style/#revealtrans](https://page-transitions.style/#revealtrans) for the full list of effects and interactive previews.

### CSS Custom Properties

Customize effects on `:root`:

- `--page-transitions-backdrop-color`: Backdrop color between sequential exit and entry effects (default: `transparent`)
- `--page-transitions-blinds-bands`: Number of blind bands for effects `8` & `9` (default: `6`)
- `--page-transitions-checkerboard-columns`: Columns across for effects `10` & `11` (default: `10`)
- `--page-transitions-checkerboard-rows`: Rows down for effects `10` & `11` (default: `10`)
- `--page-transitions-random-dissolve-size`: Pixel size for effect `12` (default: `4px`)
- `--page-transitions-random-bars-size`: Bar thickness for effects `21` & `22` (default: `4px`)

## Browser Support

Requires built-in Page Transitions support or support for the View Transition API + [Selective View Transitions with Active Types](https://drafts.csswg.org/css-view-transitions-2/#selective-vt):

- **SPA:** Chrome 125+, Safari 18.2+, Firefox 147+
- **MPA:** IE 5.5 – 8.0 _(built-in)_, Chrome 126+, Safari 18.2+

## License

`ie-page-transitions` is released under the MIT public license. See the enclosed [LICENSE](./LICENSE) for details.

## Disclaimer

This is not an officially supported Google product. I just happen to work there.