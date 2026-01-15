const editor = document.getElementById('editor');
const ctx = editor.getContext('2d');
const preview1 = document.getElementById('preview1');
const preview2 = document.getElementById('preview2');
const preview4 = document.getElementById('preview4');

const gridSize = 16;
editor.width = gridSize;
editor.height = gridSize;

let color = '#2ecc71';
let drawing = false;

function updatePreviews() {
    [preview1, preview2, preview4].forEach(canvas => {
        const pCtx = canvas.getContext('2d');
        pCtx.imageSmoothingEnabled = false;
        pCtx.clearRect(0, 0, canvas.width, canvas.height);
        pCtx.drawImage(editor, 0, 0, canvas.width, canvas.height);
    });
}

function getPixel(e) {
    const rect = editor.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / rect.width * gridSize);
    const y = Math.floor((e.clientY - rect.top) / rect.height * gridSize);
    return { x, y };
}

function paint(e) {
    const { x, y } = getPixel(e);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
    updatePreviews();
}

editor.addEventListener('mousedown', (e) => { drawing = true; paint(e); });
editor.addEventListener('mousemove', (e) => { if (drawing) paint(e); });
editor.addEventListener('mouseup', () => drawing = false);
editor.addEventListener('mouseleave', () => drawing = false);

editor.addEventListener('touchstart', (e) => { e.preventDefault(); drawing = true; paint(e.touches[0]); });
editor.addEventListener('touchmove', (e) => { e.preventDefault(); if (drawing) paint(e.touches[0]); });
editor.addEventListener('touchend', () => drawing = false);

document.getElementById('colorPicker').addEventListener('input', (e) => color = e.target.value);
document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.clearRect(0, 0, gridSize, gridSize);
    updatePreviews();
});
