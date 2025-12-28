const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = 360, height = 360;
let particles = [];
let time = 0;
let hue = 0;

const numParticles = 1000;
const noiseScale = 0.005;

function init() {
    setupCanvas();
    createParticles();

    document.getElementById('colorBtn').addEventListener('click', changeColor);
    document.getElementById('clearBtn').addEventListener('click', clearCanvas);

    clearCanvas();
    gameLoop();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    width = Math.min(360, wrapper.clientWidth);
    height = width;
    canvas.width = width;
    canvas.height = height;
}

function createParticles() {
    particles = [];
    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            speed: 1 + Math.random() * 2,
            hueOffset: Math.random() * 60
        });
    }
}

function changeColor() {
    hue = (hue + 60) % 360;
}

function clearCanvas() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);
    createParticles();
}

function noise(x, y, z) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);

    const u = fade(x);
    const v = fade(y);
    const w = fade(z);

    const A = p[X] + Y;
    const AA = p[A] + Z;
    const AB = p[A + 1] + Z;
    const B = p[X + 1] + Y;
    const BA = p[B] + Z;
    const BB = p[B + 1] + Z;

    return lerp(w,
        lerp(v,
            lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)),
            lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z))),
        lerp(v,
            lerp(u, grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1)),
            lerp(u, grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1))));
}

function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(t, a, b) { return a + t * (b - a); }
function grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

const permutation = [];
for (let i = 0; i < 256; i++) permutation[i] = i;
for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
}
const p = [...permutation, ...permutation];

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    time += 0.005;

    particles.forEach(particle => {
        const angle = noise(
            particle.x * noiseScale,
            particle.y * noiseScale,
            time
        ) * Math.PI * 4;

        particle.x += Math.cos(angle) * particle.speed;
        particle.y += Math.sin(angle) * particle.speed;

        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;
    });
}

function draw() {
    ctx.fillStyle = 'rgba(10, 10, 10, 0.02)';
    ctx.fillRect(0, 0, width, height);

    particles.forEach(particle => {
        const particleHue = (hue + particle.hueOffset + particle.x * 0.2) % 360;
        ctx.fillStyle = 'hsla(' + particleHue + ', 80%, 60%, 0.5)';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2);
        ctx.fill();
    });
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', () => {
    setupCanvas();
    clearCanvas();
});
