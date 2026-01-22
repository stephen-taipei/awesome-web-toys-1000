const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const attractors = [
    { name: 'Lorenz', sigma: 10, rho: 28, beta: 8/3 },
    { name: 'Rössler', a: 0.2, b: 0.2, c: 5.7 },
    { name: 'Aizawa', a: 0.95, b: 0.7, c: 0.6, d: 3.5, e: 0.25, f: 0.1 }
];

let attractorIndex = 0;
let x = 0.1, y = 0, z = 0;
let points = [];
let time = 0;

function changeAttractor() {
    attractorIndex = (attractorIndex + 1) % attractors.length;
    x = 0.1; y = 0; z = 0;
    points = [];
}

function updateLorenz() {
    const { sigma, rho, beta } = attractors[0];
    const dt = 0.01;

    const dx = sigma * (y - x);
    const dy = x * (rho - z) - y;
    const dz = x * y - beta * z;

    x += dx * dt;
    y += dy * dt;
    z += dz * dt;

    return { x: x * 5 + canvas.width / 2, y: z * 3 + 50 };
}

function updateRossler() {
    const { a, b, c } = attractors[1];
    const dt = 0.05;

    const dx = -y - z;
    const dy = x + a * y;
    const dz = b + z * (x - c);

    x += dx * dt;
    y += dy * dt;
    z += dz * dt;

    return { x: x * 8 + canvas.width / 2, y: y * 8 + canvas.height / 2 };
}

function updateAizawa() {
    const { a, b, c, d, e, f } = attractors[2];
    const dt = 0.01;

    const dx = (z - b) * x - d * y;
    const dy = d * x + (z - b) * y;
    const dz = c + a * z - z * z * z / 3 - (x * x + y * y) * (1 + e * z) + f * z * x * x * x;

    x += dx * dt;
    y += dy * dt;
    z += dz * dt;

    return { x: x * 80 + canvas.width / 2, y: y * 80 + canvas.height / 2 };
}

function update() {
    let point;
    switch (attractorIndex) {
        case 0: point = updateLorenz(); break;
        case 1: point = updateRossler(); break;
        case 2: point = updateAizawa(); break;
    }

    points.push(point);
    if (points.length > 2000) points.shift();
}

function draw() {
    ctx.fillStyle = 'rgba(5, 10, 21, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        const alpha = i / points.length;
        const hue = 120 + alpha * 60;

        ctx.strokeStyle = `hsla(${hue}, 100%, 50%, ${alpha * 0.8})`;
        ctx.lineWidth = 1;
        ctx.lineTo(points[i].x, points[i].y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
    }

    const last = points[points.length - 1];
    ctx.fillStyle = '#00E676';
    ctx.beginPath();
    ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
    ctx.fill();

    drawInfo();
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 120, 30);

    ctx.fillStyle = '#00E676';
    ctx.font = '11px Arial';
    ctx.fillText(`${attractors[attractorIndex].name} 吸引子`, 20, 28);
}

function animate() {
    time++;
    for (let i = 0; i < 5; i++) {
        update();
    }
    draw();
    requestAnimationFrame(animate);
}

document.getElementById('attractorBtn').addEventListener('click', changeAttractor);

animate();
