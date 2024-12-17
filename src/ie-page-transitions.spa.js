/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { extractParamsFromMetaTag, supportsViewTransitionsWithTypes } from './ie-page-transitions.shared.js';

const supportsPageReveal = () => {
    return window.PageRevealEvent !== undefined;
}

const startViewTransition = (update = () => {}) => {
    if (!supportsViewTransitionsWithTypes()) {
        update();
        return;
    };

    const $pageEnter = document.querySelector('meta[http-equiv="Page-Enter"]');
    const $pageExit = document.querySelector('meta[http-equiv="Page-Exit"]');
    const types = [];

    // @TODO: Do a better check than just checking if [content] is set.
    // A better check would check for the `revealTrans(Duration=XX,Transition=XX)` pattern
    if ($pageEnter && $pageEnter.getAttribute('content')) {
        const { duration, effect } = extractParamsFromMetaTag($pageEnter);
        types.push('page-enter');
        types.push(`page-enter-effect-${effect}`);
        types.push(`page-enter-duration-${duration}`);
    }

    if ($pageExit && $pageExit.getAttribute('content')) {
        const { duration, effect } = extractParamsFromMetaTag($pageExit);
        types.push('page-exit');
        types.push(`page-exit-effect-${effect}`);
        types.push(`page-exit-duration-${duration}`);
    }

    if (types.length > 0) {
        types.push('page-transition');
    }

    const t = document.startViewTransition({
        update,
        types,
    });

    return t;
};

const init = () => {
    if (!supportsViewTransitionsWithTypes()) return;
    if (!supportsPageReveal()) return;

    const $pageEnter = document.querySelector('meta[http-equiv="Page-Enter"]');

    if ($pageEnter) {
        // Hide body contents (old snapshot)
        document.documentElement.setAttribute('data-ie-page-transitions', '');

        // Extract values from meta tag
        const { duration, effect } = extractParamsFromMetaTag($pageEnter);

        // Manually start a View Transition
        window.addEventListener('pagereveal', (e) => {
            const t = document.startViewTransition({
                types: [
                    'page-transition',
                    'page-enter',
                    `page-enter-effect-${effect}`,
                    `page-enter-duration-${duration}`,
                ],
                update: () => {
                    // Show page contents again (new snapshot)
                    document.documentElement.removeAttribute('data-ie-page-transitions');
                }
            });
        });
    }
};
export { init, startViewTransition };