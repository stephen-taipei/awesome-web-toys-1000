const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const historyCount = document.getElementById('historyCount');

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let drawing = false;
let color = '#e17055';
let history = [];
let historyIndex = -1;
const maxHistory = 20;

function saveState() {
    historyIndex++;
    history = history.slice(0, historyIndex);
    history.push(canvas.toDataURL());
    if (history.length > maxHistory) {
        history.shift();
        historyIndex--;
    }
    updateButtons();
}

function updateButtons() {
    undoBtn.disabled = historyIndex <= 0;
    redoBtn.disabled = historyIndex >= history.length - 1;
    historyCount.textContent = `歷史: ${historyIndex + 1}/${history.length}`;
}

function restoreState(index) {
    const img = new Image();
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
    img.src = history[index];
}

// Initialize with blank canvas
ctx.fillStyle = '#fff';
ctx.fillRect(0, 0, canvas.width, canvas.height);
saveState();

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    return { x: x * canvas.width / rect.width, y: y * canvas.height / rect.height };
}

function startDraw(e) {
    drawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}

function draw(e) {
    if (!drawing) return;
    e.preventDefault();
    const pos = getPos(e);
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}

function endDraw() {
    if (drawing) {
        drawing = false;
        ctx.beginPath();
        saveState();
    }
}

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', endDraw);
canvas.addEventListener('mouseleave', endDraw);
canvas.addEventListener('touchstart', startDraw);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', endDraw);

undoBtn.addEventListener('click', () => {
    if (historyIndex > 0) {
        historyIndex--;
        restoreState(historyIndex);
        updateButtons();
    }
});

redoBtn.addEventListener('click', () => {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        restoreState(historyIndex);
        updateButtons();
    }
});

document.getElementById('colorPicker').addEventListener('input', (e) => color = e.target.value);
document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
});
