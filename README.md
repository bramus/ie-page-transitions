# ie-page-transitions.css

Bringing back Internet Explorer’s Page Transitions Effects thanks to the View Transition API

## Internet Explorer’s Page Transition Effect

The "Page Transition Effect" was a proprietary feature for Microsoft Internet Explorer 5.5 and above, where you could specify a transition between one page and another, similar to those found in slideshow presentations created with PowerPoint. The feature was deprecated as of Windows Internet Explorer 9.

Transitions were specified using a meta tag in the `<head>` of a web page, for example:

```html
<meta http-equiv="Page-Enter" content="revealTrans(Duration=0.5,Transition=7)">
```

Under the hood, this meta tag created [a `DXImageTransform.Microsoft.RevealTrans` filter](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/ms533085(v=vs.85)) applied to the document.

This library brings back these effects to the Modern Web, thanks to the View Transition API.

## Requirements

For these effects to run, a browser with support for the View Transition API is required.

In browsers with no support, no effects will be run. The presence of `ie-page-transitions.css` won’t affect these browsers.

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

    *Note: The script must be loaded as a module and must be set to block rendering.*
   
3. Populate your pages with the meta tag(s) to define which effect(s) you want. _(See [Effect Configuration](#effect-configuration))_

    ```html
    <meta http-equiv="Page-Enter" content="revealTrans(Duration=0.5,Transition=23)">
    <meta http-equiv="Page-Exit" content="revealTrans(Duration=0.5,Transition=23)">
    ```


Browser Support: Chrome 126+

### SPA

@TODO: Check and fix this

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

    *Note: There is no harm in adding this code when you don’t have an entry effect.*

4. Instead of calling `document.startViewTransition(callback)` call `PageTransitions.startViewTransition(callback)`.

    ```js
    import { startViewTransition } from '/dist/ie-page-transitions.spa.js';

    // Randomize page layout (wrapped in a startViewTransition)
    $linkToNextPage.addEventListener('click', (e) => {
        e.preventDefault();
        startViewTransition(updateTheDOMSomehow);
    });
    ```

Browser Support: Chrome 125+

Note: Safari Technology Preview is not supported as this library relies on [Selective View Transitions with Active Types](https://drafts.csswg.org/css-view-transitions-2/#selective-vt).

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

- Visit the exposed dev server in IE8, using something like browserstack or https://copy.sh/v86/?profile=windows2000