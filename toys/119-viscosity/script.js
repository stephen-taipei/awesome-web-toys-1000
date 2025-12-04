// Liquid configurations
const liquids = [
    { id: 'tube1', name: 'Water', viscosity: 1, color: '#4fc3f7', opacity: 0.7 },
    { id: 'tube2', name: 'Olive Oil', viscosity: 84, color: '#c0ca33', opacity: 0.85 },
    { id: 'tube3', name: 'Honey', viscosity: 2000, color: '#ffb300', opacity: 0.9 },
    { id: 'tube4', name: 'Syrup', viscosity: 10000, color: '#6d4c41', opacity: 0.95 }
];

const tubeWidth = 100;
const tubeHeight = 300;
const tubes = [];
let isTilted = false;
let tiltAngle = 0;
let targetTiltAngle = 0;

class LiquidTube {
    constructor(config) {
        this.canvas = document.getElementById(config.id);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = tubeWidth;
        this.canvas.height = tubeHeight;

        this.name = config.name;
        this.viscosity = config.viscosity;
        this.color = config.color;
        this.opacity = config.opacity;

        // Liquid properties
        this.liquidLevel = tubeHeight * 0.7; // Start 70% full
        this.targetLevel = this.liquidLevel;
        this.waveOffset = Math.random() * Math.PI * 2;
        this.particles = [];

        // Flow speed inversely proportional to viscosity
        this.flowSpeed = 10 / Math.log10(this.viscosity + 10);

        this.initParticles();
    }

    initParticles() {
        this.particles = [];
        const count = 20;

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * (tubeWidth - 20) + 10,
                y: tubeHeight - this.liquidLevel + Math.random() * (this.liquidLevel - 20),
                size: 2 + Math.random() * 3,
                speed: 0.2 + Math.random() * 0.3,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    update(tiltAngle, time) {
        // Calculate target liquid position based on tilt
        const tiltEffect = Math.sin(tiltAngle) * tubeHeight * 0.3;
        this.targetLevel = tubeHeight * 0.7 + tiltEffect;

        // Move toward target based on viscosity (slower for higher viscosity)
        const moveSpeed = this.flowSpeed * 0.02;
        this.liquidLevel += (this.targetLevel - this.liquidLevel) * moveSpeed;

        // Update particles
        for (const particle of this.particles) {
            // Horizontal movement based on tilt
            particle.x += Math.sin(tiltAngle) * particle.speed / (Math.log10(this.viscosity + 10));

            // Vertical bobbing
            particle.y += Math.sin(time * particle.speed + particle.phase) * 0.3;

            // Keep within bounds
            const liquidTop = tubeHeight - this.liquidLevel;
            const margin = 10;

            if (particle.x < margin) particle.x = margin;
            if (particle.x > tubeWidth - margin) particle.x = tubeWidth - margin;
            if (particle.y < liquidTop + margin) particle.y = liquidTop + margin;
            if (particle.y > tubeHeight - margin) particle.y = tubeHeight - margin;
        }
    }

    draw(time) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, tubeWidth, tubeHeight);

        // Tube glass effect
        const glassGradient = ctx.createLinearGradient(0, 0, tubeWidth, 0);
        glassGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        glassGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.05)');
        glassGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.05)');
        glassGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');

        ctx.fillStyle = glassGradient;
        ctx.fillRect(0, 0, tubeWidth, tubeHeight);

        // Liquid
        const liquidTop = tubeHeight - this.liquidLevel;

        // Wave effect on surface
        const waveAmplitude = 3 / Math.log10(this.viscosity + 10);

        ctx.beginPath();
        ctx.moveTo(0, tubeHeight);

        // Bottom curve (tube bottom)
        ctx.lineTo(0, tubeHeight - 20);
        ctx.quadraticCurveTo(0, tubeHeight, 20, tubeHeight);
        ctx.lineTo(tubeWidth - 20, tubeHeight);
        ctx.quadraticCurveTo(tubeWidth, tubeHeight, tubeWidth, tubeHeight - 20);

        // Right side
        ctx.lineTo(tubeWidth, liquidTop);

        // Wavy surface
        for (let x = tubeWidth; x >= 0; x -= 5) {
            const wave = Math.sin(x * 0.1 + time * 2 + this.waveOffset) * waveAmplitude;
            ctx.lineTo(x, liquidTop + wave);
        }

        ctx.closePath();

        // Liquid gradient
        const liquidGradient = ctx.createLinearGradient(0, liquidTop, 0, tubeHeight);
        liquidGradient.addColorStop(0, this.color);
        liquidGradient.addColorStop(1, this.darkenColor(this.color, 30));

        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = liquidGradient;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Surface highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 5; x < tubeWidth - 5; x += 5) {
            const wave = Math.sin(x * 0.1 + time * 2 + this.waveOffset) * waveAmplitude;
            if (x === 5) ctx.moveTo(x, liquidTop + wave);
            else ctx.lineTo(x, liquidTop + wave);
        }
        ctx.stroke();

        // Draw particles (bubbles/impurities)
        for (const particle of this.particles) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Glass reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(5, 10, 8, tubeHeight - 40);

        // Meniscus effect at liquid surface
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(5, liquidTop, 5, -Math.PI / 2, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(tubeWidth - 5, liquidTop, 5, Math.PI, Math.PI * 1.5);
        ctx.stroke();
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return `rgb(${R}, ${G}, ${B})`;
    }

    reset() {
        this.liquidLevel = tubeHeight * 0.7;
        this.targetLevel = this.liquidLevel;
        this.initParticles();
    }
}

function init() {
    for (const config of liquids) {
        tubes.push(new LiquidTube(config));
    }
}

let time = 0;

function animate() {
    // Smooth tilt transition
    tiltAngle += (targetTiltAngle - tiltAngle) * 0.05;

    // Apply visual tilt to tubes
    for (let i = 0; i < tubes.length; i++) {
        const tube = tubes[i];
        tube.canvas.style.transform = `rotate(${tiltAngle * 180 / Math.PI}deg)`;
        tube.update(tiltAngle, time);
        tube.draw(time);
    }

    time += 0.05;
    requestAnimationFrame(animate);
}

// Event listeners
document.getElementById('tiltBtn').addEventListener('click', () => {
    isTilted = !isTilted;
    targetTiltAngle = isTilted ? Math.PI / 6 : 0; // 30 degrees
    document.getElementById('tiltBtn').textContent = isTilted ? '恢復直立' : '傾斜容器';
});

document.getElementById('resetBtn').addEventListener('click', () => {
    isTilted = false;
    targetTiltAngle = 0;
    document.getElementById('tiltBtn').textContent = '傾斜容器';

    for (const tube of tubes) {
        tube.reset();
    }
});

// Click on individual tubes to tilt
document.querySelectorAll('.tube').forEach(canvas => {
    canvas.addEventListener('click', () => {
        isTilted = !isTilted;
        targetTiltAngle = isTilted ? Math.PI / 6 : 0;
        document.getElementById('tiltBtn').textContent = isTilted ? '恢復直立' : '傾斜容器';
    });
});

// Initialize and start
init();
animate();
