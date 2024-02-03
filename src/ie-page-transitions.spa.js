// Util functions
const randomInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const randomTransition = () => {
    const candidates = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 13, 14, 17, 18, 19, 20];
    return candidates[randomInteger(0, candidates.length-1)];
}
const extractParamsFromMetaTag = ($metaTagElement) => {
    let duration, effect;

    duration = /duration=(?<duration>\d+[\.\d+]*)/gmi.exec($metaTagElement.getAttribute('content'))?.groups?.duration ?? 1.0;
    duration = parseFloat(duration).toFixed(1).replace('.','_');

    effect = /transition=(?<transition>\d+)/gmi.exec($metaTagElement.getAttribute('content'))?.groups?.transition ?? 0;
    if (effect == 23) effect = randomTransition();

    return {
        duration,
        effect,
    };
}

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

const init = async () => {
    const $pageEnter = document.querySelector('meta[http-equiv="Page-Enter"]');

    if ($pageEnter) {
        // Extract values from meta tag
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
        document.documentElement.removeAttribute('data-ie-page-transitions');
    }
};
export { init, startViewTransition };