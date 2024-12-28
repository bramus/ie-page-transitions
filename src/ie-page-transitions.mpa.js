/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { extractParamsFromMetaTag, supportsViewTransitionsWithTypes } from './ie-page-transitions.shared.js';

// Configure the View Transition on PageReveal
// If none exists, manually create one if the author specified a Page-Enter effect
window.addEventListener('pagereveal', async (e) => {
    // Get Page-Enter Effect Meta Tag
    const $pageEnter = document.querySelector('meta[http-equiv="Page-Enter"]');

    // This implementation needs View Transition Types
    if (!supportsViewTransitionsWithTypes()) return;

    // View Transition is about to happen!
    if (e.viewTransition) {

        // Page-Exit Effect: Get Duration and Effect
        const prevPageExitEffect = sessionStorage.getItem('prevPageExitEffect');
        const prevPageExitDuration = sessionStorage.getItem('prevPageExitDuration');

        // Page-Exit Effect: Set proper types
        if (prevPageExitDuration && prevPageExitEffect) {
            e.viewTransition.types.add('page-exit');
            e.viewTransition.types.add(`page-exit-effect-${prevPageExitEffect}`);
            e.viewTransition.types.add(`page-exit-duration-${prevPageExitDuration}`);
        }
        
        // Page-Enter Effect
        if ($pageEnter && $pageEnter.getAttribute('content')) {
            const { duration, effect } = extractParamsFromMetaTag($pageEnter);

            // Set proper types
            e.viewTransition.types.add('page-enter');
            e.viewTransition.types.add(`page-enter-effect-${effect}`);
            e.viewTransition.types.add(`page-enter-duration-${duration}`);
        }

        // Stop right here if no types determined or let the VT run
        if (e.viewTransition.types.size > 0) {
            e.viewTransition.types.add('page-transition');
        } else {
            e.viewTransition.skipTransition();
        }
    }
    
    // Page got accessed not coming from the same-origin or a reload or the like …
    else {
        if ($pageEnter && $pageEnter.getAttribute('content')) {
            // Hide body contents (old snapshot)
            document.documentElement.setAttribute('data-ie-page-transitions', '');

            // Extract values
            const { duration, effect } = extractParamsFromMetaTag($pageEnter);

            // Manually start a View Transition
            const t = document.startViewTransition({
                types: [
                    'page-transition',
                    'page-enter',
                    `page-enter-effect-${effect}`,
                    `page-enter-duration-${duration}`,
                ],
                update: () => {
                    // Show body contents again (new snapshot)
                    document.documentElement.removeAttribute('data-ie-page-transitions');
                }
            });
        } else {
            // For some reason Safari doesn’t render the page contents on load.
            // The line below enforces Safari to re-render.
            document.documentElement.style.setProperty('--safari', 'bugfix');
        }
    }
});

// Communicate exit effect+duration from old page to new page on PageSwap
window.addEventListener('pageswap', async (e) => {
    const $pageExit = document.querySelector('meta[http-equiv="Page-Exit"]');

    // Page-Exit effect was set and VT is about to happen
    if (e.viewTransition && $pageExit && $pageExit.getAttribute('content')) {
        const { duration, effect } = extractParamsFromMetaTag($pageExit);

        // Persist in storage
        sessionStorage.setItem('prevPageExitDuration', duration);
        sessionStorage.setItem('prevPageExitEffect', effect);
    }

    // No Page-Exit
    else {
        sessionStorage.removeItem('prevPageExitDuration');
        sessionStorage.removeItem('prevPageExitEffect');
    }
});