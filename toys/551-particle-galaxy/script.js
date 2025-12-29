const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const speedSlider = document.getElementById('speedSlider');
const countSlider = document.getElementById('countSlider');
const infoEl = document.getElementById('info');

let rotationSpeed = 0.5;
let particleCount = 1500;
let particles = [];
let time = 0;
let rotationX = 0.5;
let rotationY = 0;

function createGalaxy() {
    particles = [];
    const arms = 4;

    for (let i = 0; i < particleCount; i++) {
        const arm = i % arms;
        const armAngle = (arm / arms) * Math.PI * 2;

        // Distance from center with exponential distribution
        const t = Math.random();
        const dist = t * t * 150;

        // Spiral angle
        const spiralAngle = armAngle + dist * 0.03 + (Math.random() - 0.5) * 0.5;

        // Position in disk
        const x = Math.cos(spiralAngle) * dist;
        const z = Math.sin(spiralAngle) * dist;
        const y = (Math.random() - 0.5) * 10 * (1 - t); // Thinner at edges

        // Color based on distance (blue center, pink/white edges)
        const hue = 200 + dist * 0.5 + Math.random() * 30;
        const saturation = 60 + Math.random() * 30;
        const lightness = 50 + Math.random() * 30;

        particles.push({
            x, y, z,
            baseAngle: spiralAngle,
            dist,
            hue, saturation, lightness,
            size: 0.5 + Math.random() * 1.5 * (1 - t * 0.5),
            orbitSpeed: 0.5 + (1 - t) * 1.5 // Faster near center
        });
    }

    // Add bright core particles
    for (let i = 0; i < 100; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 20;
        particles.push({
            x: Math.cos(angle) * dist,
            y: (Math.random() - 0.5) * 5,
            z: Math.sin(angle) * dist,
            baseAngle: angle,
            dist,
            hue: 50 + Math.random() * 20,
            saturation: 80,
            lightness: 70 + Math.random() * 20,
            size: 1 + Math.random() * 2,
            orbitSpeed: 2
        });
    }
}

function project(x, y, z) {
    // Rotate around X
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;

    // Rotate around Y
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const x1 = x * cosY - z1 * sinY;
    const z2 = x * sinY + z1 * cosY;

    const scale = 300 / (300 + z2);
    return {
        x: canvas.width / 2 + x1 * scale,
        y: canvas.height / 2 + y1 * scale,
        scale,
        z: z2
    };
}

function draw() {
    time += 0.016;
    rotationY += rotationSpeed * 0.01;

    // Fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and sort particles by z
    const projected = particles.map((p, i) => {
        // Orbit around center
        const angle = p.baseAngle + time * p.orbitSpeed * rotationSpeed * 0.1;
        const x = Math.cos(angle) * p.dist;
        const z = Math.sin(angle) * p.dist;

        const proj = project(x, p.y, z);
        return { ...p, ...proj, index: i };
    });

    projected.sort((a, b) => b.z - a.z);

    // Draw particles
    projected.forEach(p => {
        const alpha = Math.min(1, p.scale * 0.8);
        const size = p.size * p.scale;

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, size), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, ${alpha})`;
        ctx.fill();

        // Glow for bright particles
        if (p.size > 1.5) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, ${alpha * 0.2})`;
            ctx.fill();
        }
    });

    requestAnimationFrame(draw);
}

speedSlider.addEventListener('input', (e) => {
    rotationSpeed = parseInt(e.target.value) / 10;
    infoEl.textContent = `旋轉速度: ${rotationSpeed.toFixed(1)}x`;
});

countSlider.addEventListener('input', (e) => {
    particleCount = parseInt(e.target.value);
    createGalaxy();
    infoEl.textContent = `粒子數: ${particleCount}`;
});

createGalaxy();
draw();
