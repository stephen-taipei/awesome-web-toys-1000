const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];

let nodes = [];
let edges = [];
let dragging = null;

function initGraph() {
    nodes = [];
    edges = [];

    for (let i = 0; i < 8; i++) {
        nodes.push({
            id: i,
            x: Math.random() * 300 + 30,
            y: Math.random() * 300 + 30,
            vx: 0,
            vy: 0,
            radius: 15 + Math.random() * 10,
            color: colors[i % colors.length]
        });
    }

    // Random edges
    for (let i = 0; i < nodes.length; i++) {
        const numEdges = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < numEdges; j++) {
            const target = Math.floor(Math.random() * nodes.length);
            if (target !== i && !edges.some(e => (e.source === i && e.target === target) || (e.source === target && e.target === i))) {
                edges.push({ source: i, target: target });
            }
        }
    }
}

function simulate() {
    const repulsion = 5000;
    const attraction = 0.01;
    const damping = 0.9;
    const centerForce = 0.01;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Reset forces
    nodes.forEach(node => {
        node.fx = 0;
        node.fy = 0;
    });

    // Repulsion between nodes
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[j].x - nodes[i].x;
            const dy = nodes[j].y - nodes[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = repulsion / (dist * dist);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            nodes[i].fx -= fx;
            nodes[i].fy -= fy;
            nodes[j].fx += fx;
            nodes[j].fy += fy;
        }
    }

    // Attraction along edges
    edges.forEach(edge => {
        const source = nodes[edge.source];
        const target = nodes[edge.target];
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = dist * attraction;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        source.fx += fx;
        source.fy += fy;
        target.fx -= fx;
        target.fy -= fy;
    });

    // Center gravity
    nodes.forEach(node => {
        node.fx += (cx - node.x) * centerForce;
        node.fy += (cy - node.y) * centerForce;
    });

    // Update positions
    nodes.forEach(node => {
        if (node === dragging) return;
        node.vx = (node.vx + node.fx) * damping;
        node.vy = (node.vy + node.fy) * damping;
        node.x += node.vx;
        node.y += node.vy;
        node.x = Math.max(node.radius, Math.min(canvas.width - node.radius, node.x));
        node.y = Math.max(node.radius, Math.min(canvas.height - node.radius, node.y));
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    edges.forEach(edge => {
        const source = nodes[edge.source];
        const target = nodes[edge.target];
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
    });

    // Draw nodes
    nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function animate() {
    simulate();
    draw();
    requestAnimationFrame(animate);
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    nodes.forEach(node => {
        const dist = Math.sqrt((mx - node.x) ** 2 + (my - node.y) ** 2);
        if (dist < node.radius) {
            dragging = node;
        }
    });
});

canvas.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    dragging.x = e.clientX - rect.left;
    dragging.y = e.clientY - rect.top;
    dragging.vx = 0;
    dragging.vy = 0;
});

canvas.addEventListener('mouseup', () => { dragging = null; });
canvas.addEventListener('mouseleave', () => { dragging = null; });

document.getElementById('addNode').addEventListener('click', () => {
    const newNode = {
        id: nodes.length,
        x: canvas.width / 2 + (Math.random() - 0.5) * 50,
        y: canvas.height / 2 + (Math.random() - 0.5) * 50,
        vx: 0,
        vy: 0,
        radius: 15 + Math.random() * 10,
        color: colors[nodes.length % colors.length]
    };
    nodes.push(newNode);

    // Connect to random existing node
    if (nodes.length > 1) {
        const target = Math.floor(Math.random() * (nodes.length - 1));
        edges.push({ source: newNode.id, target: target });
    }
});

document.getElementById('reset').addEventListener('click', initGraph);

initGraph();
animate();
