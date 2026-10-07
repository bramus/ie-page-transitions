/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const randomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

// @ref: https://stackoverflow.com/a/35970186/2076595
const invertColor = (hex) => {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);

    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + r.padStart(2, '0') + g.padStart(2, '0') + b.padStart(2, '0');
}

let currentSlideIndex = -1;

const cycleContentSlide = (forceIndex = null) => {
    const slides = document.querySelectorAll('.content-slide');
    if (!slides.length) return;

    if (typeof forceIndex === 'number') {
        currentSlideIndex = ((forceIndex % slides.length) + slides.length) % slides.length;
    } else if (currentSlideIndex === -1) {
        currentSlideIndex = Math.floor(Math.random() * slides.length);
    } else {
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    }

    slides.forEach((slide, idx) => {
        slide.hidden = idx !== currentSlideIndex;
    });
}

// Persist the outgoing page’s background color on Cross-Document (MPA) navigations
window.addEventListener('pageswap', (e) => {
    if (e.viewTransition) {
        sessionStorage.setItem('prevBackgroundColor', getComputedStyle(document.body).getPropertyValue('background-color'));
    } else {
        sessionStorage.removeItem('prevBackgroundColor');
    }
});

// Randomize page looks (and cycle content slides if present)
const randomize = () => {
    const oldColor = sessionStorage.getItem('prevBackgroundColor') || getComputedStyle(document.body).getPropertyValue('background-color');
    sessionStorage.removeItem('prevBackgroundColor');

    document.documentElement.style.setProperty('--page-transitions-backdrop-color', oldColor);

    const newColor = randomColor();
    document.body.style.setProperty('background-color', newColor);

    cycleContentSlide();
}

export { randomize, cycleContentSlide }