const editor = document.getElementById('fontEditor');
const ctx = editor.getContext('2d');
const preview = document.getElementById('preview');
const previewCtx = preview.getContext('2d');

const charWidth = 5;
const charHeight = 7;
editor.width = charWidth;
editor.height = charHeight;
preview.width = 60;
preview.height = 7;

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
let charIndex = 0;
const fontData = {};

chars.split('').forEach(c => {
    fontData[c] = new Array(charWidth * charHeight).fill(0);
});

function loadChar() {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, charWidth, charHeight);
    ctx.fillStyle = '#3498db';
    const data = fontData[chars[charIndex]];
    for (let i = 0; i < data.length; i++) {
        if (data[i]) {
            const x = i % charWidth;
            const y = Math.floor(i / charWidth);
            ctx.fillRect(x, y, 1, 1);
        }
    }
    document.getElementById('currentChar').textContent = chars[charIndex];
    updatePreview();
}

function updatePreview() {
    const text = document.getElementById('previewText').value.toUpperCase();
    previewCtx.fillStyle = '#222';
    previewCtx.fillRect(0, 0, preview.width, preview.height);
    previewCtx.fillStyle = '#3498db';

    for (let i = 0; i < text.length && i < 10; i++) {
        const char = text[i];
        if (fontData[char]) {
            const data = fontData[char];
            for (let j = 0; j < data.length; j++) {
                if (data[j]) {
                    const x = (j % charWidth) + i * (charWidth + 1);
                    const y = Math.floor(j / charWidth);
                    previewCtx.fillRect(x, y, 1, 1);
                }
            }
        }
    }
}

function getPixel(e) {
    const rect = editor.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / rect.width * charWidth);
    const y = Math.floor((e.clientY - rect.top) / rect.height * charHeight);
    return { x, y };
}

let drawing = false;

editor.addEventListener('mousedown', (e) => {
    drawing = true;
    const { x, y } = getPixel(e);
    const idx = y * charWidth + x;
    fontData[chars[charIndex]][idx] = 1 - fontData[chars[charIndex]][idx];
    loadChar();
});

editor.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    const { x, y } = getPixel(e);
    const idx = y * charWidth + x;
    fontData[chars[charIndex]][idx] = 1;
    loadChar();
});

editor.addEventListener('mouseup', () => drawing = false);

document.getElementById('prevChar').addEventListener('click', () => {
    charIndex = (charIndex - 1 + chars.length) % chars.length;
    loadChar();
});

document.getElementById('nextChar').addEventListener('click', () => {
    charIndex = (charIndex + 1) % chars.length;
    loadChar();
});

document.getElementById('previewText').addEventListener('input', updatePreview);

loadChar();
