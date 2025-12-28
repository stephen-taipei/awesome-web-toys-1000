const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const intensitySlider = document.getElementById('intensity');
const densitySlider = document.getElementById('density');

let intensity = 0.6;
let rayDensity = 30;
let time = 0;

// Light source (window/opening)
const lightSource = { x: canvas.width * 0.7, y: 20 };

// Particles floating in the light
const particles = [];
for (let i = 0; i < 100; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        drift: Math.random() * 0.5 - 0.25
    });
}

// Scene elements (pillars/trees that cast shadows)
const obstacles = [
    { x: 80, y: canvas.height, width: 30, height: 200 },
    { x: 180, y: canvas.height, width: 25, height: 180 },
    { x: 280, y: canvas.height, width: 35, height: 220 }
];

function isInShadow(px, py) {
    for (const obs of obstacles) {
        // Check if point is behind this obstacle relative to light
        const dx = px - lightSource.x;
        const dy = py - lightSource.y;
        const ox = obs.x + obs.width / 2 - lightSource.x;
        const oy = obs.y - obs.height / 2 - lightSource.y;

        // Simple shadow check
        if (px > obs.x && px < obs.x + obs.width && py > obs.y - obs.height) {
            // Check if in shadow cone
            const t = (px - lightSource.x) / (obs.x + obs.width / 2 - lightSource.x);
            if (t > 0) {
                const expectedY = lightSource.y + t * (obs.y - obs.height - lightSource.y);
                if (py < expectedY + 50) return true;
            }
        }
    }
    return false;
}

function drawVolumetricRays() {
    const numRays = rayDensity;

    for (let i = 0; i < numRays; i++) {
        const angle = (i / numRays) * Math.PI * 0.6 + Math.PI * 0.3;
        const rayLength = 400;

        const endX = lightSource.x + Math.cos(angle) * rayLength;
        const endY = lightSource.y + Math.sin(angle) * rayLength;

        // Create gradient for ray
        const gradient = ctx.createLinearGradient(
            lightSource.x, lightSource.y, endX, endY
        );

        const baseAlpha = intensity * 0.15;
        gradient.addColorStop(0, `rgba(255, 230, 150, ${baseAlpha})`);
        gradient.addColorStop(0.5, `rgba(255, 220, 130, ${baseAlpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(255, 210, 100, 0)');

        ctx.beginPath();
        ctx.moveTo(lightSource.x, lightSource.y);

        // Wavy ray effect
        const segments = 10;
        for (let j = 1; j <= segments; j++) {
            const t = j / segments;
            const wave = Math.sin(time * 2 + i + j * 0.5) * 3;
            const x = lightSource.x + (endX - lightSource.x) * t + wave;
            const y = lightSource.y + (endY - lightSource.y) * t;
            ctx.lineTo(x, y);
        }

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 8 + Math.sin(time + i) * 2;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
}

function drawObstacles() {
    obstacles.forEach(obs => {
        ctx.fillStyle = '#0a0a15';
        ctx.fillRect(obs.x, obs.y - obs.height, obs.width, obs.height);
    });
}

function drawParticles() {
    particles.forEach(p => {
        // Check if in light cone
        const angle = Math.atan2(p.y - lightSource.y, p.x - lightSource.x);
        const inCone = angle > Math.PI * 0.3 && angle < Math.PI * 0.9;
        const shadow = isInShadow(p.x, p.y);

        if (inCone && !shadow) {
            const dist = Math.sqrt((p.x - lightSource.x) ** 2 + (p.y - lightSource.y) ** 2);
            const brightness = Math.max(0.2, 1 - dist / 400) * intensity;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 240, 200, ${brightness * 0.8})`;
            ctx.fill();
        }

        // Update particle position
        p.y += p.speed;
        p.x += p.drift + Math.sin(time + p.y * 0.01) * 0.2;

        if (p.y > canvas.height + 10) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
        }
    });
}

function drawLightSource() {
    // Glow
    const gradient = ctx.createRadialGradient(
        lightSource.x, lightSource.y, 0,
        lightSource.x, lightSource.y, 60
    );
    gradient.addColorStop(0, `rgba(255, 240, 200, ${intensity})`);
    gradient.addColorStop(0.5, `rgba(255, 220, 150, ${intensity * 0.3})`);
    gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(lightSource.x, lightSource.y, 60, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(lightSource.x, lightSource.y, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#fff8e0';
    ctx.fill();
}

function draw() {
    time += 0.016;

    // Dark background
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    drawVolumetricRays();
    drawObstacles();
    drawParticles();
    drawLightSource();

    // Fog overlay
    const fogGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    fogGradient.addColorStop(0, 'rgba(30, 30, 50, 0)');
    fogGradient.addColorStop(1, 'rgba(30, 30, 50, 0.3)');
    ctx.fillStyle = fogGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    requestAnimationFrame(draw);
}

intensitySlider.addEventListener('input', (e) => {
    intensity = parseFloat(e.target.value);
});

densitySlider.addEventListener('input', (e) => {
    rayDensity = parseInt(e.target.value);
});

draw();
