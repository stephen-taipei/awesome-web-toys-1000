const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = 360, height = 450;
let stars = [];
let speed = 50;
let centerX, centerY;
let targetX, targetY;

const numStars = 400;

function init() {
    setupCanvas();
    createStars();
    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('touchmove', handleTouch, { passive: false });
    document.getElementById('slowBtn').addEventListener('click', () => changeSpeed(-20));
    document.getElementById('fastBtn').addEventListener('click', () => changeSpeed(20));
    targetX = centerX;
    targetY = centerY;
    gameLoop();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    width = Math.min(360, wrapper.clientWidth);
    height = width * 1.25;
    canvas.width = width;
    canvas.height = height;
    centerX = width / 2;
    centerY = height / 2;
}

function createStars() {
    stars = [];
    for (let i = 0; i < numStars; i++) {
        stars.push(createStar());
    }
}

function createStar() {
    return {
        x: (Math.random() - 0.5) * width * 3,
        y: (Math.random() - 0.5) * height * 3,
        z: Math.random() * width,
        pz: 0
    };
}

function changeSpeed(delta) {
    speed = Math.max(10, Math.min(100, speed + delta));
    document.getElementById('speed').textContent = speed;
}

function handleMouse(e) {
    const rect = canvas.getBoundingClientRect();
    targetX = (e.clientX - rect.left) * (canvas.width / rect.width);
    targetY = (e.clientY - rect.top) * (canvas.height / rect.height);
}

function handleTouch(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    targetX = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
    targetY = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    centerX += (targetX - centerX) * 0.05;
    centerY += (targetY - centerY) * 0.05;

    const velocity = speed * 0.1;

    stars.forEach(star => {
        star.pz = star.z;
        star.z -= velocity;

        if (star.z < 1) {
            star.x = (Math.random() - 0.5) * width * 3;
            star.y = (Math.random() - 0.5) * height * 3;
            star.z = width;
            star.pz = star.z;
        }
    });
}

function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, width, height);

    stars.forEach(star => {
        const sx = (star.x / star.z) * width + centerX;
        const sy = (star.y / star.z) * height + centerY;
        const px = (star.x / star.pz) * width + centerX;
        const py = (star.y / star.pz) * height + centerY;

        if (sx < 0 || sx > width || sy < 0 || sy > height) return;

        const size = (1 - star.z / width) * 4;
        const alpha = (1 - star.z / width) * 0.8 + 0.2;

        if (speed > 30) {
            const gradient = ctx.createLinearGradient(px, py, sx, sy);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, ' + alpha + ')');

            ctx.strokeStyle = gradient;
            ctx.lineWidth = size;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(sx, sy);
            ctx.stroke();
        }

        const brightness = Math.floor(200 + alpha * 55);
        const blueShift = Math.floor(alpha * 100);
        ctx.fillStyle = 'rgb(' + brightness + ',' + brightness + ',' + (brightness + blueShift) + ')';
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
    });
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', () => {
    setupCanvas();
    createStars();
});
