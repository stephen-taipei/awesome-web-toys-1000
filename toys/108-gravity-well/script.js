const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let masses = [];
let particles = [];
let gridDensity = 20;
let particleCount = 200;
let showGrid = true;
let showParticles = true;
let currentMass = 5;

// UI elements
const massSlider = document.getElementById('massSlider');
const massValue = document.getElementById('massValue');
const gridSlider = document.getElementById('gridSlider');
const gridValue = document.getElementById('gridValue');
const particleSlider = document.getElementById('particleSlider');
const particleValue = document.getElementById('particleValue');
const showGridCheckbox = document.getElementById('showGrid');
const showParticlesCheckbox = document.getElementById('showParticles');
const clearBtn = document.getElementById('clearBtn');

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
}

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.life = 1;
        this.hue = Math.random() * 60 + 200; // Blue to purple
    }

    update() {
        // Apply gravity from all masses
        for (const mass of masses) {
            const dx = mass.x - this.x;
            const dy = mass.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 20) {
                this.reset();
                return;
            }

            const force = (mass.strength * 50) / (dist * dist);
            this.vx += (dx / dist) * force;
            this.vy += (dy / dist) * force;
        }

        // Limit velocity
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 10) {
            this.vx = (this.vx / speed) * 10;
            this.vy = (this.vy / speed) * 10;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Reset if out of bounds
        if (this.x < -50 || this.x > width + 50 || this.y < -50 || this.y > height + 50) {
            this.reset();
        }
    }

    draw() {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const alpha = Math.min(1, speed / 3);
        ctx.fillStyle = `hsla(${this.hue}, 80%, 60%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function calculateGridDisplacement(x, y) {
    let totalDx = 0;
    let totalDy = 0;

    for (const mass of masses) {
        const dx = x - mass.x;
        const dy = y - mass.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5) continue;

        // Simulate spacetime curvature - points get pulled toward mass
        const strength = (mass.strength * 2000) / (dist * dist + 100);
        totalDx -= (dx / dist) * strength;
        totalDy -= (dy / dist) * strength;
    }

    return { dx: totalDx, dy: totalDy };
}

function drawGrid() {
    const spacing = Math.max(width, height) / gridDensity;

    ctx.strokeStyle = 'rgba(100, 150, 255, 0.3)';
    ctx.lineWidth = 1;

    // Draw horizontal lines
    for (let y = 0; y <= height + spacing; y += spacing) {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 5) {
            const disp = calculateGridDisplacement(x, y);
            const px = x + disp.dx;
            const py = y + disp.dy;

            if (x === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.stroke();
    }

    // Draw vertical lines
    for (let x = 0; x <= width + spacing; x += spacing) {
        ctx.beginPath();
        for (let y = 0; y <= height; y += 5) {
            const disp = calculateGridDisplacement(x, y);
            const px = x + disp.dx;
            const py = y + disp.dy;

            if (y === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.stroke();
    }
}

function drawMasses() {
    for (const mass of masses) {
        // Glow effect
        const gradient = ctx.createRadialGradient(
            mass.x, mass.y, 0,
            mass.x, mass.y, mass.strength * 15
        );
        gradient.addColorStop(0, `hsla(${mass.hue}, 100%, 70%, 1)`);
        gradient.addColorStop(0.3, `hsla(${mass.hue}, 100%, 50%, 0.5)`);
        gradient.addColorStop(1, `hsla(${mass.hue}, 100%, 50%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mass.x, mass.y, mass.strength * 15, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `hsl(${mass.hue}, 100%, 80%)`;
        ctx.beginPath();
        ctx.arc(mass.x, mass.y, mass.strength * 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function animate() {
    // Clear with fade effect
    ctx.fillStyle = 'rgba(0, 0, 10, 0.3)';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    if (showGrid) {
        drawGrid();
    }

    // Update and draw particles
    if (showParticles) {
        for (const particle of particles) {
            particle.update();
            particle.draw();
        }
    }

    // Draw masses
    drawMasses();

    requestAnimationFrame(animate);
}

// Event listeners
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    masses.push({
        x: x,
        y: y,
        strength: currentMass,
        hue: Math.random() * 60 + 240 // Purple to blue
    });
});

massSlider.addEventListener('input', () => {
    currentMass = parseFloat(massSlider.value);
    massValue.textContent = currentMass;
});

gridSlider.addEventListener('input', () => {
    gridDensity = parseInt(gridSlider.value);
    gridValue.textContent = gridDensity;
});

particleSlider.addEventListener('input', () => {
    particleCount = parseInt(particleSlider.value);
    particleValue.textContent = particleCount;
    initParticles();
});

showGridCheckbox.addEventListener('change', () => {
    showGrid = showGridCheckbox.checked;
});

showParticlesCheckbox.addEventListener('change', () => {
    showParticles = showParticlesCheckbox.checked;
});

clearBtn.addEventListener('click', () => {
    masses = [];
    initParticles();
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
