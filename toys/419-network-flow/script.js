const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const toggleBtn = document.getElementById('toggle');
const speedSlider = document.getElementById('speed');

const nodes = [
    { x: 50, y: 160, label: 'S', color: '#2ecc71' },
    { x: 130, y: 80, label: 'A', color: '#3498db' },
    { x: 130, y: 240, label: 'B', color: '#3498db' },
    { x: 230, y: 80, label: 'C', color: '#3498db' },
    { x: 230, y: 240, label: 'D', color: '#3498db' },
    { x: 310, y: 160, label: 'T', color: '#e74c3c' }
];

const edges = [
    { from: 0, to: 1, capacity: 10 },
    { from: 0, to: 2, capacity: 8 },
    { from: 1, to: 2, capacity: 5 },
    { from: 1, to: 3, capacity: 7 },
    { from: 2, to: 4, capacity: 10 },
    { from: 3, to: 4, capacity: 3 },
    { from: 3, to: 5, capacity: 10 },
    { from: 4, to: 5, capacity: 12 }
];

let particles = [];
let running = false;

function spawnParticle(edge) {
    const from = nodes[edge.from];
    const to = nodes[edge.to];
    particles.push({
        x: from.x,
        y: from.y,
        targetX: to.x,
        targetY: to.y,
        progress: 0,
        edge: edge
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    edges.forEach(edge => {
        const from = nodes[edge.from];
        const to = nodes[edge.to];

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Capacity label
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(edge.capacity, midX, midY - 5);
    });

    // Draw particles
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#f1c40f';
        ctx.fill();
        ctx.shadowColor = '#f1c40f';
        ctx.shadowBlur = 10;
    });
    ctx.shadowBlur = 0;

    // Draw nodes
    nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x, node.y);
    });
}

function update() {
    if (!running) return;

    const speed = speedSlider.value / 100;

    // Update particles
    particles = particles.filter(p => {
        p.progress += speed;
        p.x = p.x + (p.targetX - p.x) * speed * 2;
        p.y = p.y + (p.targetY - p.y) * speed * 2;

        const dist = Math.sqrt((p.targetX - p.x) ** 2 + (p.targetY - p.y) ** 2);
        return dist > 5;
    });

    // Spawn new particles
    if (Math.random() < 0.1) {
        const edge = edges[Math.floor(Math.random() * edges.length)];
        if (Math.random() < edge.capacity / 12) {
            spawnParticle(edge);
        }
    }

    draw();
    requestAnimationFrame(update);
}

toggleBtn.addEventListener('click', () => {
    running = !running;
    toggleBtn.textContent = running ? '⏸️ 暫停' : '▶️ 開始';
    if (running) update();
});

draw();
