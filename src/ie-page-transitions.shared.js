// Generate random number between min and max
const randomInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a random transition effect number
const randomTransition = () => {
    const candidates = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 13, 14, 17, 18, 19, 20];
    return candidates[randomInteger(0, candidates.length-1)];
}

// Extract the duration and transition effect number from a meta tag element
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
export { extractParamsFromMetaTag };