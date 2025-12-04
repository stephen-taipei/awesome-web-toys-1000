const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let waves = [];
let waveSpeed = 5;
let waveIntensity = 50;
let particleDensity = 20;
let waveType = 'pressure';
let showPressure = true;

class Particle {
    constructor(x, y) {
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.pressure = 0;
    }

    update() {
        // Apply wave forces
        this.pressure = 0;

        for (const wave of waves) {
            const dx = this.baseX - wave.x;
            const dy = this.baseY - wave.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0) {
                const wavePos = wave.radius;
                const waveWidth = wave.type === 'shockwave' ? 20 : 50;
                const distFromWave = Math.abs(dist - wavePos);

                if (distFromWave < waveWidth) {
                    const factor = 1 - distFromWave / waveWidth;
                    const force = factor * wave.intensity * 0.1;

                    // Pressure wave pushes outward then pulls back
                    let direction = 1;
                    if (wave.type === 'pressure') {
                        direction = Math.sin((dist - wavePos) / waveWidth * Math.PI);
                    } else if (wave.type === 'sonic') {
                        direction = dist < wavePos ? 1 : -0.5;
                    }

                    this.vx += (dx / dist) * force * direction;
                    this.vy += (dy / dist) * force * direction;
                    this.pressure += factor * wave.intensity;
                }
            }
        }

        // Spring back to original position
        const returnForce = 0.05;
        this.vx += (this.baseX - this.x) * returnForce;
        this.vy += (this.baseY - this.y) * returnForce;

        // Damping
        this.vx *= 0.9;
        this.vy *= 0.9;

        // Update position
        this.x += this.vx;
        this.y += this.vy;
    }

    draw() {
        const displacement = Math.sqrt(
            Math.pow(this.x - this.baseX, 2) +
            Math.pow(this.y - this.baseY, 2)
        );

        // Color based on pressure
        let color;
        if (showPressure && this.pressure > 0) {
            const intensity = Math.min(1, this.pressure / 50);
            const r = Math.floor(100 + intensity * 155);
            const g = Math.floor(150 + intensity * 50);
            const b = 255;
            color = `rgb(${r}, ${g}, ${b})`;
        } else {
            const brightness = Math.min(255, 100 + displacement * 20);
            color = `rgb(${brightness}, ${brightness}, 255)`;
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw connection lines to neighbors
        ctx.strokeStyle = `rgba(100, 150, 255, ${0.1 + displacement * 0.02})`;
        ctx.lineWidth = 1;
    }
}

class Wave {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.intensity = waveIntensity;
        this.type = type;
        this.maxRadius = Math.max(width, height);
    }

    update() {
        this.radius += waveSpeed * 2;

        // Intensity decreases with distance
        if (this.type === 'shockwave') {
            this.intensity = waveIntensity * Math.exp(-this.radius / 500);
        } else {
            this.intensity = waveIntensity * (1 - this.radius / this.maxRadius);
        }

        return this.radius < this.maxRadius && this.intensity > 1;
    }

    draw() {
        // Wave ring visualization
        const alpha = this.intensity / waveIntensity;

        if (this.type === 'shockwave') {
            // Sharp shockwave
            ctx.strokeStyle = `rgba(255, 200, 100, ${alpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.type === 'sonic') {
            // Sonic boom with Mach cone effect
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = `rgba(100, 200, 255, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.95, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            // Pressure wave - softer gradient
            const gradient = ctx.createRadialGradient(
                this.x, this.y, this.radius - 30,
                this.x, this.y, this.radius + 30
            );
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.5, `rgba(0, 200, 255, ${alpha * 0.3})`);
            gradient.addColorStop(1, 'transparent');

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 60;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
}

function initParticles() {
    particles = [];
    const spacing = Math.floor(Math.max(width, height) / particleDensity);

    for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
            particles.push(new Particle(x, y));
        }
    }
}

function createWave(x, y) {
    waves.push(new Wave(x, y, waveType));
}

function drawConnections() {
    const spacing = Math.floor(Math.max(width, height) / particleDensity);
    const connectionDist = spacing * 1.5;

    ctx.strokeStyle = 'rgba(50, 100, 150, 0.2)';
    ctx.lineWidth = 1;

    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < connectionDist) {
                const alpha = 0.2 * (1 - dist / connectionDist);
                ctx.strokeStyle = `rgba(50, 100, 150, ${alpha})`;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    // Clear with fade
    ctx.fillStyle = 'rgba(10, 10, 26, 0.2)';
    ctx.fillRect(0, 0, width, height);

    // Update waves
    waves = waves.filter(wave => wave.update());

    // Draw waves
    for (const wave of waves) {
        wave.draw();
    }

    // Draw connections
    drawConnections();

    // Update and draw particles
    for (const particle of particles) {
        particle.update();
        particle.draw();
    }

    requestAnimationFrame(animate);
}

// Event listeners
canvas.addEventListener('click', (e) => {
    createWave(e.clientX, e.clientY);
});

canvas.addEventListener('mousemove', (e) => {
    if (e.buttons === 1 && Math.random() < 0.1) {
        createWave(e.clientX, e.clientY);
    }
});

document.getElementById('speedSlider').addEventListener('input', (e) => {
    waveSpeed = parseInt(e.target.value);
});

document.getElementById('intensitySlider').addEventListener('input', (e) => {
    waveIntensity = parseInt(e.target.value);
});

document.getElementById('densitySlider').addEventListener('input', (e) => {
    particleDensity = parseInt(e.target.value);
    initParticles();
});

document.getElementById('waveType').addEventListener('change', (e) => {
    waveType = e.target.value;
});

document.getElementById('showPressure').addEventListener('change', (e) => {
    showPressure = e.target.checked;
});

document.getElementById('clearBtn').addEventListener('click', () => {
    waves = [];
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
