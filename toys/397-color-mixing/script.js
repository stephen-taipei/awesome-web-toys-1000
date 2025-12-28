const targetEl = document.getElementById('target');
const mixedEl = document.getElementById('mixed');
const scoreEl = document.getElementById('score');
const matchEl = document.getElementById('match');

const rSlider = document.getElementById('r');
const gSlider = document.getElementById('g');
const bSlider = document.getElementById('b');
const rVal = document.getElementById('rVal');
const gVal = document.getElementById('gVal');
const bVal = document.getElementById('bVal');

let targetColor = { r: 0, g: 0, b: 0 };
let score = 0;

function generateTarget() {
    targetColor = {
        r: Math.floor(Math.random() * 256),
        g: Math.floor(Math.random() * 256),
        b: Math.floor(Math.random() * 256)
    };
    targetEl.style.backgroundColor = `rgb(${targetColor.r}, ${targetColor.g}, ${targetColor.b})`;

    // Reset sliders
    rSlider.value = 128;
    gSlider.value = 128;
    bSlider.value = 128;
    updateMixed();
}

function updateMixed() {
    const r = parseInt(rSlider.value);
    const g = parseInt(gSlider.value);
    const b = parseInt(bSlider.value);

    rVal.textContent = r;
    gVal.textContent = g;
    bVal.textContent = b;

    mixedEl.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;

    // Calculate match percentage
    const diff = Math.abs(r - targetColor.r) + Math.abs(g - targetColor.g) + Math.abs(b - targetColor.b);
    const maxDiff = 255 * 3;
    const match = Math.round((1 - diff / maxDiff) * 100);

    matchEl.textContent = `相似度: ${match}%`;
}

function submit() {
    const r = parseInt(rSlider.value);
    const g = parseInt(gSlider.value);
    const b = parseInt(bSlider.value);

    const diff = Math.abs(r - targetColor.r) + Math.abs(g - targetColor.g) + Math.abs(b - targetColor.b);
    const maxDiff = 255 * 3;
    const match = Math.round((1 - diff / maxDiff) * 100);

    if (match >= 95) {
        score += 100;
        matchEl.textContent = '🎉 完美配對! +100分';
    } else if (match >= 85) {
        score += 50;
        matchEl.textContent = '👍 很接近! +50分';
    } else if (match >= 70) {
        score += 20;
        matchEl.textContent = '😊 不錯! +20分';
    } else {
        matchEl.textContent = `😅 再試試! 相似度: ${match}%`;
    }

    scoreEl.textContent = score;

    if (match >= 70) {
        setTimeout(generateTarget, 1500);
    }
}

rSlider.addEventListener('input', updateMixed);
gSlider.addEventListener('input', updateMixed);
bSlider.addEventListener('input', updateMixed);
document.getElementById('submit').addEventListener('click', submit);

generateTarget();
