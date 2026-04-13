const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const gridSize = 10;
const cols = Math.ceil(canvas.width / gridSize);
const rows = Math.ceil(canvas.height / gridSize);

let velocityX = [];
let velocityY = [];
let density = [];

let mouseX = 0;
let mouseY = 0;
let lastMouseX = 0;
let lastMouseY = 0;
let time = 0;

function init() {
    velocityX = new Array(cols * rows).fill(0);
    velocityY = new Array(cols * rows).fill(0);
    density = new Array(cols * rows).fill(0);
}

function index(x, y) {
    x = Math.max(0, Math.min(cols - 1, x));
    y = Math.max(0, Math.min(rows - 1, y));
    return y * cols + x;
}

function addForce(x, y, fx, fy, d) {
    const i = index(Math.floor(x / gridSize), Math.floor(y / gridSize));
    velocityX[i] += fx;
    velocityY[i] += fy;
    density[i] += d;
}

function diffuse() {
    const newVX = [...velocityX];
    const newVY = [...velocityY];
    const newD = [...density];

    for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
            const i = index(x, y);
            const diffusion = 0.1;

            newVX[i] = velocityX[i] + diffusion * (
                velocityX[index(x-1, y)] + velocityX[index(x+1, y)] +
                velocityX[index(x, y-1)] + velocityX[index(x, y+1)] -
                4 * velocityX[i]
            );

            newVY[i] = velocityY[i] + diffusion * (
                velocityY[index(x-1, y)] + velocityY[index(x+1, y)] +
                velocityY[index(x, y-1)] + velocityY[index(x, y+1)] -
                4 * velocityY[i]
            );

            newD[i] = density[i] + diffusion * (
                density[index(x-1, y)] + density[index(x+1, y)] +
                density[index(x, y-1)] + density[index(x, y+1)] -
                4 * density[i]
            );

            newVX[i] *= 0.99;
            newVY[i] *= 0.99;
            newD[i] *= 0.98;
        }
    }

    velocityX = newVX;
    velocityY = newVY;
    density = newD;
}

function draw() {
    ctx.fillStyle = '#0a1520';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const i = index(x, y);
            const d = Math.min(1, Math.abs(density[i]));

            if (d > 0.01) {
                const vx = velocityX[i];
                const vy = velocityY[i];
                const speed = Math.sqrt(vx * vx + vy * vy);
                const hue = 180 + speed * 50;

                ctx.fillStyle = `hsla(${hue}, 80%, 50%, ${d})`;
                ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
            }
        }
    }

    ctx.strokeStyle = 'rgba(38, 198, 218, 0.3)';
    ctx.lineWidth = 1;

    for (let y = 0; y < rows; y += 3) {
        for (let x = 0; x < cols; x += 3) {
            const i = index(x, y);
            const vx = velocityX[i] * 5;
            const vy = velocityY[i] * 5;

            if (Math.abs(vx) > 0.1 || Math.abs(vy) > 0.1) {
                const cx = x * gridSize + gridSize / 2;
                const cy = y * gridSize + gridSize / 2;

                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + vx, cy + vy);
                ctx.stroke();
            }
        }
    }
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#26C6DA';
    ctx.font = '11px Arial';
    ctx.fillText('流體模擬', 20, 28);
}

function animate() {
    time++;

    const dx = mouseX - lastMouseX;
    const dy = mouseY - lastMouseY;

    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        addForce(mouseX, mouseY, dx * 0.5, dy * 0.5, Math.sqrt(dx*dx + dy*dy) * 0.1);
    }

    lastMouseX = mouseX;
    lastMouseY = mouseY;

    diffuse();
    draw();
    drawInfo();

    requestAnimationFrame(animate);
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        addForce(x, y, Math.cos(angle) * 3, Math.sin(angle) * 3, 1);
    }
});

document.getElementById('resetBtn').addEventListener('click', init);

init();
animate();
