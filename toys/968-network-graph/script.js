const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let nodes = [];
let edges = [];
let dragNode = null;

function init() {
    nodes = [];
    edges = [];

    const numNodes = 12;

    for (let i = 0; i < numNodes; i++) {
        nodes.push({
            x: Math.random() * (canvas.width - 60) + 30,
            y: Math.random() * (canvas.height - 60) + 30,
            vx: 0,
            vy: 0,
            radius: 8 + Math.random() * 8,
            hue: Math.random() * 60 + 200
        });
    }

    for (let i = 0; i < numNodes; i++) {
        const numConnections = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < numConnections; j++) {
            const target = Math.floor(Math.random() * numNodes);
            if (target !== i && !edges.some(e =>
                (e.source === i && e.target === target) ||
                (e.source === target && e.target === i)
            )) {
                edges.push({ source: i, target });
            }
        }
    }
}

function simulate() {
    const repulsion = 2000;
    const attraction = 0.01;
    const damping = 0.9;

    nodes.forEach((node, i) => {
        if (node === dragNode) return;

        let fx = 0, fy = 0;

        nodes.forEach((other, j) => {
            if (i === j) return;
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = repulsion / (dist * dist);
            fx += (dx / dist) * force;
            fy += (dy / dist) * force;
        });

        edges.forEach(edge => {
            let other = null;
            if (edge.source === i) other = nodes[edge.target];
            else if (edge.target === i) other = nodes[edge.source];

            if (other) {
                const dx = other.x - node.x;
                const dy = other.y - node.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                fx += dx * attraction;
                fy += dy * attraction;
            }
        });

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        fx += (cx - node.x) * 0.001;
        fy += (cy - node.y) * 0.001;

        node.vx = (node.vx + fx) * damping;
        node.vy = (node.vy + fy) * damping;

        node.x += node.vx;
        node.y += node.vy;

        node.x = Math.max(node.radius, Math.min(canvas.width - node.radius, node.x));
        node.y = Math.max(node.radius, Math.min(canvas.height - node.radius, node.y));
    });
}

function draw() {
    ctx.fillStyle = '#050a15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    edges.forEach(edge => {
        const source = nodes[edge.source];
        const target = nodes[edge.target];

        ctx.strokeStyle = 'rgba(100, 181, 246, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
    });

    nodes.forEach(node => {
        const gradient = ctx.createRadialGradient(
            node.x - node.radius * 0.3, node.y - node.radius * 0.3, 0,
            node.x, node.y, node.radius
        );
        gradient.addColorStop(0, `hsl(${node.hue}, 80%, 70%)`);
        gradient.addColorStop(1, `hsl(${node.hue}, 80%, 50%)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `hsl(${node.hue}, 80%, 80%)`;
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    nodes.forEach(node => {
        const dx = mx - node.x;
        const dy = my - node.y;
        if (dx * dx + dy * dy < node.radius * node.radius) {
            dragNode = node;
        }
    });
});

canvas.addEventListener('mousemove', (e) => {
    if (!dragNode) return;
    const rect = canvas.getBoundingClientRect();
    dragNode.x = (e.clientX - rect.left) * (canvas.width / rect.width);
    dragNode.y = (e.clientY - rect.top) * (canvas.height / rect.height);
    dragNode.vx = 0;
    dragNode.vy = 0;
});

canvas.addEventListener('mouseup', () => { dragNode = null; });
canvas.addEventListener('mouseleave', () => { dragNode = null; });

document.getElementById('randomBtn').addEventListener('click', init);

function animate() {
    simulate();
    draw();
    requestAnimationFrame(animate);
}

init();
animate();
