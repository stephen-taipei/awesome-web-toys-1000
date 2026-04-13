const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let styleIndex = 0;
let time = 0;

function changeStyle() {
    styleIndex = (styleIndex + 1) % 4;
}

function draw() {
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = 120;

    ctx.fillStyle = 'rgba(124, 77, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#7C4DFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    const layers = 5;
    const sides = 6 + styleIndex;

    for (let layer = 0; layer < layers; layer++) {
        const layerRadius = radius * (1 - Math.pow(0.6, layer + 1));
        const numPolygons = sides * Math.pow(2, layer);

        for (let i = 0; i < numPolygons; i++) {
            const angle = (i / numPolygons) * Math.PI * 2 + time * 0.01 * (layer % 2 === 0 ? 1 : -1);
            const polyRadius = radius * Math.pow(0.5, layer + 1);

            const px = cx + Math.cos(angle) * layerRadius;
            const py = cy + Math.sin(angle) * layerRadius;

            drawPolygon(px, py, polyRadius, sides, angle, layer);
        }
    }

    drawInfo();
}

function drawPolygon(x, y, r, sides, rotation, layer) {
    const hue = 260 + layer * 20;
    ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${0.8 - layer * 0.15})`;
    ctx.fillStyle = `hsla(${hue}, 80%, 30%, ${0.3 - layer * 0.05})`;
    ctx.lineWidth = 2 - layer * 0.3;

    ctx.beginPath();
    for (let i = 0; i <= sides; i++) {
        const angle = rotation + (i / sides) * Math.PI * 2;
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#7C4DFF';
    ctx.font = '11px Arial';
    ctx.fillText(`{${6 + styleIndex}, 3} 鑲嵌`, 20, 28);
}

function animate() {
    time++;
    draw();
    requestAnimationFrame(animate);
}

document.getElementById('tilingBtn').addEventListener('click', changeStyle);

animate();
