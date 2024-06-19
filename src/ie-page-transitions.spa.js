import { extractParamsFromMetaTag } from './ie-page-transitions.shared.js';

const startViewTransition = (update = () => {}) => {
    const $pageEnter = document.querySelector('meta[http-equiv="Page-Enter"]');
    const $pageExit = document.querySelector('meta[http-equiv="Page-Exit"]');
    const types = [];

    if ($pageEnter) {
        const { duration, effect } = extractParamsFromMetaTag($pageEnter);
        types.push('page-enter');
        types.push(`page-enter-effect-${effect}`);
        types.push(`page-enter-duration-${duration}`);
    }

    if ($pageExit) {
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