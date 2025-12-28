const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const PADDING = 40;
const names = ['Apple', 'Google', 'Meta', 'Amazon', 'Tesla', 'Netflix', 'Microsoft', 'Samsung'];
const colors = ['#e74c3c', '#3498db', '#9b59b6', '#f39c12', '#1abc9c', '#e91e63', '#2ecc71', '#34495e'];

let bubbles = [];
let hoveredBubble = null;

function generateData() {
    bubbles = names.map((name, i) => ({
        name,
        color: colors[i],
        x: Math.random() * 80 + 10,  // Revenue %
        y: Math.random() * 80 + 10,  // Growth %
        size: Math.random() * 30 + 10, // Market cap
        targetX: 0,
        targetY: 0,
        targetSize: 0
    }));

    bubbles.forEach(b => {
        b.targetX = b.x;
        b.targetY = b.y;
        b.targetSize = b.size;
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const chartWidth = canvas.width - PADDING * 2;
    const chartHeight = canvas.height - PADDING * 2;

    // Draw axes
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PADDING, PADDING);
    ctx.lineTo(PADDING, canvas.height - PADDING);
    ctx.lineTo(canvas.width - PADDING, canvas.height - PADDING);
    ctx.stroke();

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('營收 (十億)', canvas.width / 2, canvas.height - 10);
    ctx.save();
    ctx.translate(12, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('成長率 (%)', 0, 0);
    ctx.restore();

    // Draw bubbles
    bubbles.forEach(bubble => {
        const x = PADDING + (bubble.x / 100) * chartWidth;
        const y = canvas.height - PADDING - (bubble.y / 100) * chartHeight;
        const radius = bubble.size;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = bubble === hoveredBubble ? bubble.color : bubble.color + '99';
        ctx.fill();

        if (radius > 15) {
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(bubble.name.slice(0, 4), x, y + 3);
        }
    });
}

function animate() {
    let moving = false;
    bubbles.forEach(b => {
        ['x', 'y', 'size'].forEach(prop => {
            const target = b['target' + prop.charAt(0).toUpperCase() + prop.slice(1)] || b[prop];
            const diff = target - b[prop];
            if (Math.abs(diff) > 0.1) {
                b[prop] += diff * 0.1;
                moving = true;
            }
        });
    });
    draw();
    if (moving) requestAnimationFrame(animate);
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const chartWidth = canvas.width - PADDING * 2;
    const chartHeight = canvas.height - PADDING * 2;

    hoveredBubble = null;
    bubbles.forEach(bubble => {
        const x = PADDING + (bubble.x / 100) * chartWidth;
        const y = canvas.height - PADDING - (bubble.y / 100) * chartHeight;
        const dist = Math.sqrt((mx - x) ** 2 + (my - y) ** 2);
        if (dist < bubble.size) {
            hoveredBubble = bubble;
        }
    });

    if (hoveredBubble) {
        infoEl.textContent = `${hoveredBubble.name} - 營收: ${Math.round(hoveredBubble.x)}B, 成長: ${Math.round(hoveredBubble.y)}%`;
    } else {
        infoEl.textContent = '懸停泡泡查看詳情';
    }
    draw();
});

document.getElementById('randomize').addEventListener('click', () => {
    bubbles.forEach(b => {
        b.targetX = Math.random() * 80 + 10;
        b.targetY = Math.random() * 80 + 10;
        b.targetSize = Math.random() * 30 + 10;
    });
    animate();
});

generateData();
draw();
