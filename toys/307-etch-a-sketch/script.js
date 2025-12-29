const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 280; canvas.height = 200;

let x = canvas.width / 2, y = canvas.height / 2;
let isShaking = false;

function init() {
    ctx.fillStyle = '#bdc3c7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    document.addEventListener('keydown', handleKey);
    document.getElementById('shakeBtn').addEventListener('click', shake);

    let leftDrag = false, rightDrag = false, startY = 0, startX = 0;

    document.getElementById('leftKnob').addEventListener('mousedown', e => { leftDrag = true; startX = e.clientX; });
    document.getElementById('rightKnob').addEventListener('mousedown', e => { rightDrag = true; startY = e.clientY; });

    document.addEventListener('mousemove', e => {
        if (leftDrag) {
            const dx = e.clientX - startX;
            if (Math.abs(dx) > 5) {
                movePen(dx > 0 ? 2 : -2, 0);
                startX = e.clientX;
            }
        }
        if (rightDrag) {
            const dy = e.clientY - startY;
            if (Math.abs(dy) > 5) {
                movePen(0, dy > 0 ? 2 : -2);
                startY = e.clientY;
            }
        }
    });

    document.addEventListener('mouseup', () => { leftDrag = false; rightDrag = false; });
}

function handleKey(e) {
    switch(e.key) {
        case 'ArrowUp': movePen(0, -3); break;
        case 'ArrowDown': movePen(0, 3); break;
        case 'ArrowLeft': movePen(-3, 0); break;
        case 'ArrowRight': movePen(3, 0); break;
    }
}

function movePen(dx, dy) {
    const newX = Math.max(0, Math.min(canvas.width, x + dx));
    const newY = Math.max(0, Math.min(canvas.height, y + dy));

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(newX, newY);
    ctx.stroke();

    x = newX;
    y = newY;
}

function shake() {
    if (isShaking) return;
    isShaking = true;

    const frame = document.querySelector('.etch-frame');
    let shakes = 0;

    const interval = setInterval(() => {
        shakes++;
        frame.style.transform = `translateX(${(shakes % 2 ? 5 : -5)}px) rotate(${(shakes % 2 ? 1 : -1)}deg)`;

        if (shakes > 10) {
            clearInterval(interval);
            frame.style.transform = '';
            ctx.fillStyle = '#bdc3c7';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            x = canvas.width / 2;
            y = canvas.height / 2;
            isShaking = false;
        }
    }, 50);
}

document.addEventListener('DOMContentLoaded', init);
