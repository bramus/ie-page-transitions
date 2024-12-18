# ie-page-transitions

Bringing back Internet Explorer’s Page Transitions thanks to the View Transition API

[![Source](https://img.shields.io/badge/Source-GitHub-2dba4e)](https://github.com/bramus/ie-page-transitions)
[![npm](https://img.shields.io/npm/v/ie-page-transitions)](https://www.npmjs.com/package/ie-page-transitions)
[![NPM](https://img.shields.io/npm/l/ie-page-transitions)](./LICENSE)
[![Demo](https://img.shields.io/badge/demo-_Website-hotpink)](https://page-transitions.style/)

## Internet Explorer’s Page Transitions

Microsoft Internet Explorer 4.0 and above featured a proprietary feature called [Interpage Transitions](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/ms532847(v=vs.85)?redirectedfrom=MSDN#interpage-transitions). It allowed you to specify [a transition effect](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/ms532853(v=vs.85)#transitions) to apply to the entire window as a Web page was loaded or exited.

The feature worked best as of Microsoft Internet Explorer 5.5 which had a richer variety of optimized filters. The feature was eventually deprecated with the release of Windows Internet Explorer 9.

Transitions were specified using a meta tag in the `<head>` of a web page. For example, the following snippet caused the [`Blinds` transition](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/ms532976(v=vs.85)) to play when the user loaded the page and caused a [`Slide` transition](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/ms533087(v=vs.85)) to play when the user exited the page.

```html
<meta http-equiv="Page-Enter" content="progid:DXImageTransform.Microsoft.Blinds(Duration=4)" />
<meta http-equiv="Page-Exit" content="progid:DXImageTransform.Microsoft.Slide(Duration=2.500,slidestyle='HIDE')" />
```

Four events could create instances of interpage transitions: `Page-Enter`, `Page-Exit`, `Site-Enter`, and `Site-Exit`.

### The `RevealTrans` Filter

The Page Transitions feature also came with a shorthand [the `DXImageTransform.Microsoft.RevealTrans` Filter](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/ms533085(v=vs.85)), which offered 23 predefined transitions mirrored from the effects found in Microsoft PowerPoint.

Using one of these predefined effects was as easy as referring to its number – ranging from 0 to 22 – in the `revealTrans`’s filter `Transition` property. Using the value `23` randomly selected one of the 23 available effects.

For example, using the following snippet caused Transition Effect number `7` – a vertical wipe from right to left – to play when the page was loaded.

```html
<meta http-equiv="Page-Enter" content="revealTrans(Duration=0.5,Transition=7)">
```

Under the hood the `revealTrans(Transition=7)` mapped to a `DXImageTransform.Microsoft.Blinds(direction='left', bands=1)` effect.

## Requirements

For Page Transitions to run, a browser with built-in Page Transitions support or a browser with support for the View Transition API + [Selective View Transitions with Active Types](https://drafts.csswg.org/css-view-transitions-2/#selective-vt) is required.

- SPA
  - Chrome 125+
  - Safari 18.2

- MPA
  - IE 5.5 - 8.0 _(built-in)_
  - Chrome 126+
  - Safari 18.2 _(buggy)_

In browsers with no support for View Transitions, no effects will be run. The presence of `ie-page-transitions.css` won’t affect these browsers.

## Usage

### MPA

1. Enable Cross-Document View Transitions between two same-origin pages

    ```html
    <style>
        @view-transition {
            navigation: auto;
        }
    </style>
    ```

2. Include `ie-page-transitions.css` and `ie-page-transitions.mpa.js` on your pages.

    ```html
    <link rel="stylesheet" href="/dist/ie-page-transitions.css">
    <script src="/dist/ie-page-transitions.mpa.js" type="module" blocking="render"></script>
    ```

    *Note: The script **must** be loaded as a module and **must** be set to block rendering.*

3. Populate your pages with the meta tag(s) to define which effect(s) you want. _(See [Effect Configuration](#effect-configuration))_

    ```html
    <meta http-equiv="Page-Enter" content="revealTrans(Duration=0.5,Transition=23)">
    <meta http-equiv="Page-Exit" content="revealTrans(Duration=0.5,Transition=23)">
    ```

### SPA

1. Include `ie-page-transitions.css`

    ```html
    <link rel="stylesheet" href="/dist/ie-page-transitions.css">
    ```

2. Inject the meta tags to define which effect you want. _(See [Effect Configuration](#effect-configuration))_

3. If you have an entry effect on the first load, add the following render-blocking script to your page:

    ```html
    <script type="module" blocking="render">
        import { init } from '/dist/ie-page-transitions.spa.js';
        init();
    </script>
    ```

    *Note: There is no real harm in adding this code when you don’t have an entry effect.*

4. Instead of calling `document.startViewTransition(callback)` call `PageTransitions.startViewTransition(callback)`.

    ```js
    import { startViewTransition } from '/dist/ie-page-transitions.spa.js';

    // Randomize page layout (wrapped in a startViewTransition)
    $linkToNextPage.addEventListener('click', (e) => {
        e.preventDefault();
        startViewTransition(updateTheDOMSomehow);
    });
    ```

## Effect Configuration

Just like IE, the transition can be configured by setting the proper values in the meta tag:

- Set `http-equiv` to either `Page-Enter` or `Page-Exit` to define whether this is a page entry or page exit animation
- Set the `Duration` to any number (double) to define the duration in seconds for the effect, eg. `2.0`
  - The duration values are limited to `0.5`, `1.0`, `1.5`, and `2.0`
- Set the `Transition` to a number (int) to define which transition effect to use. There are 23 effects, from `0` to `22`. Using the value `23` randomly selects one of the 23 available effects.

For example, to perform a pixel fade (aka. random dissolve) transition for 2 seconds upon entering a page, this markup is needed:

```html
<meta http-equiv="Page-Enter" content="revealTrans(Duration=2.0,Transition=12)">
```

## The Effects

@TODO: Video

| Status | Number | Name                   | Description                                                            | DXImageTransform                                                        |
|--------|--------|------------------------|------------------------------------------------------------------------|-------------------------------------------------------------------------|
| ✅      | 0      | Box in                 | Rectangle towards centre                                               | DXImageTransform.Microsoft.Iris(irisstyle='SQUARE', motion='in')        |
| ✅      | 1      | Box out                | Rectangle from centre outwards                                         | DXImageTransform.Microsoft.Iris(irisstyle='SQUARE', motion='out')       |
| ✅      | 2      | Circle in              | Circle towards centre                                                  | DXImageTransform.Microsoft.Iris(irisstyle='CIRCLE', motion='in')        |
| ✅      | 3      | Circle out             | Circle from centre outwards                                            | DXImageTransform.Microsoft.Iris(irisstyle='CIRCLE', motion='out')       |
| ✅      | 4      | Wipe up                | Horizontal wipe from bottom to top                                     | DXImageTransform.Microsoft.Blinds(direction='up', bands=1)              |
| ✅      | 5      | Wipe down              | Horizontal wipe from top to bottom                                     | DXImageTransform.Microsoft.Blinds(direction='down', bands=1)            |
| ✅      | 6      | Wipe right             | Vertical wipe from left to right                                       | DXImageTransform.Microsoft.Blinds(direction='right', bands=1)           |
| ✅      | 7      | Wipe left              | Vertical wipe from right to left                                       | DXImageTransform.Microsoft.Blinds(direction='left', bands=1)            |
| ✅      | 8      | Vertical blinds        | Vertical Blinds from left to right                                     | DXImageTransform.Microsoft.Blinds(direction='right')                    |
| ✅      | 9      | Horizontal blinds      | Horizontal blinds from top to bottom                                   | DXImageTransform.Microsoft.Blinds(direction='down')                     |
| ❌      | 10     | Checkerboard across    | Box Blinds from left to right                                          | DXImageTransform.Microsoft.CheckerBoard(direction='right')              |
| ❌      | 11     | Checkerboard down      | Box Blinds from top to bottom                                          | DXImageTransform.Microsoft.CheckerBoard(direction='down')               |
| ❌      | 12     | Random dissolve        | Pixel Fade                                                             | DXImageTransform.Microsoft.RandomDissolve                               |
| ✅      | 13     | Split vertical in      | Vertical Window Opening from middle to sides                           | DXImageTransform.Microsoft.Barn(orientation='vertical', motion='in')    |
| ✅      | 14     | Split vertical out     | Vertical Window Closing from sides to middle                           | DXImageTransform.Microsoft.Barn(orientation='vertical', motion='out')   |
| ❌      | 15     | Split horizontal in    | Horizontal Window Opening from middle to top/bottom                    | DXImageTransform.Microsoft.Barn(orientation='horizontal', motion='in')  |
| ❌      | 16     | Split horizontal out   | Horizontal Window Closing from top/bottom to middle                    | DXImageTransform.Microsoft.Barn(orientation='horizontal', motion='out') |
| ✅      | 17     | Strips left down       | New content is revealed from the upper left corner to the lower right. | DXImageTransform.Microsoft.Strips(motion='leftdown')                    |
| ✅      | 18     | Strips left up         | New content is revealed from the lower left corner to the upper right. | DXImageTransform.Microsoft.Strips(motion='leftup')                      |
| ✅      | 19     | Strips right down      | New content is revealed from the upper right corner to the lower left. | DXImageTransform.Microsoft.Strips(motion='rightdown')                   |
| ✅      | 20     | Strips right up        | New content is revealed from the lower right corner to the upper left. | DXImageTransform.Microsoft.Strips(motion='rightup')                     |
| ❌      | 21     | Random bars horizontal | Vertical Line Fade                                                     | DXImageTransform.Microsoft.RandomBars(orientation='horizontal')         |
| ❌      | 22     | Random bars vertical   | Horizontal Line Fade                                                   | DXImageTransform.Microsoft.RandomBars(orientation='vertical')           |
| ✅      | 23     | Random                 | Random                                                                 |                                                                         |

## Differences

In Internet Explorer it was not possible to have one page define an exit transition and the other page an entry transition. When having both an exit and entry effect, the two would conflict, resulting in no transition happening at all.

This library does not have the limitation. When both an exit and entry effect are set, these will run sequentially.

## References

- https://www.simplehtmlguide.com/pagetransitions.php
- https://web.archive.org/web/20111111015459/https://standardista.com/html5/http-equiv-the-meta-attribute-explained/
- https://force4u.cocolog-nifty.com/skywalker/ie/index.html
- https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/ms532942(v=vs.85)
- https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/ms533085(v=vs.85)
- http://www.influentialcomputers.com/meta-reveal-demo.asp
- Checkerboard: https://codepen.io/t_afif/pen/ZEZyemJ?editors=0110 
- http://www.csgnetwork.com/pagetransitiongen.html

## Try it out in an actual IE8

- Start the local dev server

    ```
    npm run start
    ```

- Expose the dev server to the public over HTTP, for example using [bore](http://bore.pub)

    ```
    brew install bore-cli
    bore local 3000 --to bore.pub
    ```

- Visit the exposed dev server in IE, using something like BrowserLing or https://copy.sh/v86/

## License

See enclosed [LICENSE](./LICENSE)

## Disclaimer

 This is not an officially supported Google product.
 
