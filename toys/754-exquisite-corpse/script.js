const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const sectionEl = document.getElementById('section');

canvas.width = 370;
canvas.height = 240;

let currentSection = 1;
const sectionHeight = canvas.height / 3;
const overlapHeight = 20;

ctx.fillStyle = '#fff';
ctx.fillRect(0, 0, canvas.width, canvas.height);

let drawing = false;
let lastPos = null;

function updateView() {
    ctx.save();

    // Hide other sections
    ctx.fillStyle = '#f0f0f0';

    if (currentSection === 1) {
        ctx.fillRect(0, sectionHeight, canvas.width, canvas.height);
    } else if (currentSection === 2) {
        ctx.fillRect(0, 0, canvas.width, sectionHeight - overlapHeight);
        ctx.fillRect(0, sectionHeight * 2, canvas.width, sectionHeight);
    } else {
        ctx.fillRect(0, 0, canvas.width, sectionHeight * 2 - overlapHeight);
    }

    ctx.restore();
}

function draw(x, y) {
    // Check if within current section
    const minY = (currentSection - 1) * sectionHeight - (currentSection > 1 ? overlapHeight : 0);
    const maxY = currentSection * sectionHeight;

    if (y < minY || y > maxY) return;

    if (lastPos) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
    lastPos = { x, y };
    updateView();
}

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

canvas.addEventListener('mousedown', (e) => { drawing = true; lastPos = getPos(e); });
canvas.addEventListener('mousemove', (e) => { if (drawing) { const pos = getPos(e); draw(pos.x, pos.y); } });
canvas.addEventListener('mouseup', () => { drawing = false; lastPos = null; });
canvas.addEventListener('mouseleave', () => { drawing = false; lastPos = null; });

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); drawing = true; lastPos = getPos(e); });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (drawing) { const pos = getPos(e); draw(pos.x, pos.y); } });
canvas.addEventListener('touchend', () => { drawing = false; lastPos = null; });

document.getElementById('nextSection').addEventListener('click', () => {
    if (currentSection < 3) {
        currentSection++;
        sectionEl.textContent = currentSection;
        updateView();
    }
});

document.getElementById('reveal').addEventListener('click', () => {
    // Show complete drawing
    currentSection = 4; // Beyond sections
});

updateView();
