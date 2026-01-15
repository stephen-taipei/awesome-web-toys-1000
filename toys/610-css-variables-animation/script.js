const box = document.querySelector('.dynamic-box');
const hueSlider = document.getElementById('hueSlider');
const sizeSlider = document.getElementById('sizeSlider');
const radiusSlider = document.getElementById('radiusSlider');
const rotateSlider = document.getElementById('rotateSlider');
const hueVal = document.getElementById('hueVal');
const sizeVal = document.getElementById('sizeVal');
const radiusVal = document.getElementById('radiusVal');
const rotateVal = document.getElementById('rotateVal');
const animateBtn = document.getElementById('animateBtn');
const randomBtn = document.getElementById('randomBtn');

let isAnimating = false;

function updateBox() {
    box.style.setProperty('--hue', hueSlider.value);
    box.style.setProperty('--size', sizeSlider.value + 'px');
    box.style.setProperty('--radius', radiusSlider.value + 'px');
    box.style.setProperty('--rotate', rotateSlider.value + 'deg');

    hueVal.textContent = hueSlider.value;
    sizeVal.textContent = sizeSlider.value;
    radiusVal.textContent = radiusSlider.value;
    rotateVal.textContent = rotateSlider.value;
}

hueSlider.addEventListener('input', () => {
    if (isAnimating) toggleAnimation();
    updateBox();
});

sizeSlider.addEventListener('input', () => {
    if (isAnimating) toggleAnimation();
    updateBox();
});

radiusSlider.addEventListener('input', () => {
    if (isAnimating) toggleAnimation();
    updateBox();
});

rotateSlider.addEventListener('input', () => {
    if (isAnimating) toggleAnimation();
    updateBox();
});

function toggleAnimation() {
    isAnimating = !isAnimating;
    box.classList.toggle('animating', isAnimating);
    animateBtn.classList.toggle('active', isAnimating);
    animateBtn.textContent = isAnimating ? '停止動畫' : '自動動畫';
}

animateBtn.addEventListener('click', toggleAnimation);

randomBtn.addEventListener('click', () => {
    if (isAnimating) toggleAnimation();

    hueSlider.value = Math.floor(Math.random() * 360);
    sizeSlider.value = 30 + Math.floor(Math.random() * 70);
    radiusSlider.value = Math.floor(Math.random() * 50);
    rotateSlider.value = Math.floor(Math.random() * 360);

    updateBox();
});

updateBox();
