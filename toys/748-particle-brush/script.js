const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorInput = document.getElementById('color');
const countInput = document.getElementById('count');

canvas.width = 370;
canvas.height = 280;

let particles = [];
let drawing = false;
let mousePos = { x: 0, y: 0 };

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

function createParticles(x, y) {
    const count = parseInt(countInput.value);
    const rgb = hexToRgb(colorInput.value);

    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            decay: 0.01 + Math.random() * 0.02,
            size: 2 + Math.random() * 4,
            r: rgb.r + Math.random() * 40 - 20,
            g: rgb.g + Math.random() * 40 - 20,
            b: rgb.b + Math.random() * 40 - 20
        });
    }
}

function animate() {
    // Fade background
    ctx.fillStyle = 'rgba(26, 26, 46, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // gravity
        p.life -= p.decay;

        if (p.life > 0) {
            ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${p.life})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
            return true;
        }
        return false;
    });

    if (drawing) {
        createParticles(mousePos.x, mousePos.y);
    }

    requestAnimationFrame(animate);
}

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

canvas.addEventListener('mousedown', (e) => { drawing = true; mousePos = getPos(e); });
canvas.addEventListener('mousemove', (e) => { if (drawing) mousePos = getPos(e); });
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseleave', () => drawing = false);

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); drawing = true; mousePos = getPos(e); });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (drawing) mousePos = getPos(e); });
canvas.addEventListener('touchend', () => drawing = false);

document.getElementById('clearBtn').addEventListener('click', () => {
    particles = [];
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});

animate();
