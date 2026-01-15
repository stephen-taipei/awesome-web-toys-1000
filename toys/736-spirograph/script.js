const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 250;

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function drawSpirograph() {
    const R = parseInt(document.getElementById('outerR').value);
    const r = parseInt(document.getElementById('innerR').value);
    const d = parseInt(document.getElementById('distance').value);

    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const diff = R - r;
    const rotations = r / gcd(R, r);
    const steps = rotations * 360;

    ctx.beginPath();
    ctx.strokeStyle = '#e91e63';
    ctx.lineWidth = 1.5;

    let hue = 0;

    for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * rotations * Math.PI * 2;
        const x = centerX + diff * Math.cos(t) + d * Math.cos((diff / r) * t);
        const y = centerY + diff * Math.sin(t) - d * Math.sin((diff / r) * t);

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.strokeStyle = `hsl(${hue}, 70%, 60%)`;
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
        hue = (hue + 0.5) % 360;
    }
}

document.getElementById('drawBtn').addEventListener('click', drawSpirograph);

drawSpirograph();
