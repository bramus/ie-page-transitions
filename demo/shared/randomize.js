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

// Randomize page looks
const randomize = () => {
    const color = randomColor();
    const colorInverted = invertColor(color);
    const fontSize = Math.floor(16 + (Math.random() * 32)) * 2;

    document.documentElement.style.setProperty('background-color', color);
    document.documentElement.style.setProperty('color', colorInverted);
    document.documentElement.style.setProperty('font-size', `${fontSize}px`);
}