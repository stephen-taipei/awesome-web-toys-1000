const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const complexityInput = document.getElementById('complexity');
const compVal = document.getElementById('compVal');

canvas.width = 370;
canvas.height = 280;

let complexity = 3;

function drawKnot() {
    ctx.fillStyle = '#1a0a00';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;
    const loops = complexity * 2;
    const points = [];

    // Generate points
    for (let i = 0; i < loops; i++) {
        const angle = (i / loops) * Math.PI * 2;
        const r = radius + Math.sin(angle * complexity) * 30;
        points.push({
            x: centerX + Math.cos(angle) * r,
            y: centerY + Math.sin(angle) * r
        });
    }

    // Draw outer glow
    ctx.shadowColor = '#d4af37';
    ctx.shadowBlur = 15;

    // Draw background stroke
    ctx.strokeStyle = '#2a1a00';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let layer = 0; layer < 2; layer++) {
        ctx.beginPath();
        for (let i = 0; i <= loops; i++) {
            const p = points[i % loops];
            const next = points[(i + 1) % loops];
            const ctrl = points[(i + Math.floor(loops / 2)) % loops];

            if (i === 0) {
                ctx.moveTo(p.x, p.y);
            } else {
                const midX = (p.x + next.x) / 2 + (ctrl.x - centerX) * 0.2;
                const midY = (p.y + next.y) / 2 + (ctrl.y - centerY) * 0.2;
                ctx.quadraticCurveTo(p.x, p.y, midX, midY);
            }
        }
        ctx.stroke();

        if (layer === 0) {
            ctx.strokeStyle = '#d4af37';
            ctx.lineWidth = 8;
        }
    }

    // Inner pattern
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ffdf80';
    ctx.lineWidth = 2;

    for (let ring = 1; ring <= complexity; ring++) {
        const innerR = radius * ring / (complexity + 1);
        ctx.beginPath();

        for (let i = 0; i <= loops * 2; i++) {
            const angle = (i / (loops * 2)) * Math.PI * 2;
            const wobble = Math.sin(angle * complexity * 2) * 10;
            const x = centerX + Math.cos(angle) * (innerR + wobble);
            const y = centerY + Math.sin(angle) * (innerR + wobble);

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    // Center decoration
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fill();
}

complexityInput.addEventListener('input', () => {
    complexity = parseInt(complexityInput.value);
    compVal.textContent = complexity;
});

document.getElementById('generateBtn').addEventListener('click', drawKnot);

drawKnot();
