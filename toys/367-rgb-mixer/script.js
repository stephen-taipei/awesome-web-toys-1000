const redSlider = document.getElementById('redSlider');
const greenSlider = document.getElementById('greenSlider');
const blueSlider = document.getElementById('blueSlider');
const redValue = document.getElementById('redValue');
const greenValue = document.getElementById('greenValue');
const blueValue = document.getElementById('blueValue');
const colorDisplay = document.getElementById('colorDisplay');
const hexDisplay = document.getElementById('hexDisplay');
const randomBtn = document.getElementById('randomBtn');

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0').toUpperCase()).join('');
}

function updateColor() {
    const r = parseInt(redSlider.value);
    const g = parseInt(greenSlider.value);
    const b = parseInt(blueSlider.value);

    redValue.textContent = r;
    greenValue.textContent = g;
    blueValue.textContent = b;

    const hex = rgbToHex(r, g, b);
    colorDisplay.style.backgroundColor = hex;
    hexDisplay.textContent = hex;
}

function randomColor() {
    redSlider.value = Math.floor(Math.random() * 256);
    greenSlider.value = Math.floor(Math.random() * 256);
    blueSlider.value = Math.floor(Math.random() * 256);
    updateColor();
}

redSlider.addEventListener('input', updateColor);
greenSlider.addEventListener('input', updateColor);
blueSlider.addEventListener('input', updateColor);
randomBtn.addEventListener('click', randomColor);

updateColor();
