const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Lamp dimensions
const lampWidth = 200;
const lampHeight = 500;
canvas.width = lampWidth;
canvas.height = lampHeight;

// Parameters
let heat = 1;
let viscosity = 0.03;
let blobCount = 8;
let colorScheme = 'classic';

// Blobs
let blobs = [];
let time = 0;

const colorSchemes = {
    classic: {
        primary: '#ff4500',
        secondary: '#ff8c00',
        glow: 'rgba(255, 69, 0, 0.3)'
    },
    blue: {
        primary: '#0077be',
        secondary: '#00b4d8',
        glow: 'rgba(0, 180, 216, 0.3)'
    },
    green: {
        primary: '#228b22',
        secondary: '#32cd32',
        glow: 'rgba(50, 205, 50, 0.3)'
    },
    purple: {
        primary: '#8b008b',
        secondary: '#da70d6',
        glow: 'rgba(218, 112, 214, 0.3)'
    },
    rainbow: {
        primary: 'rainbow',
        secondary: 'rainbow',
        glow: 'rgba(255, 100, 255, 0.3)'
    }
};

class Blob {
    constructor(index) {
        this.index = index;
        this.reset();
    }

    reset() {
        this.x = lampWidth / 2 + (Math.random() - 0.5) * 100;
        this.y = lampHeight * 0.7 + Math.random() * lampHeight * 0.25;
        this.radius = 20 + Math.random() * 40;
        this.baseRadius = this.radius;
        this.vx = 0;
        this.vy = 0;
        this.temperature = 0.5 + Math.random() * 0.5;
        this.phase = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.02 + Math.random() * 0.02;
        this.hue = this.index * 40; // For rainbow mode
    }

    update() {
        // Temperature affects buoyancy
        const targetY = this.temperature > 0.6 ?
            50 + (1 - this.temperature) * 200 :
            lampHeight - 100 - (this.temperature) * 200;

        // Heat from bottom
        const bottomHeat = 1 - this.y / lampHeight;
        this.temperature += bottomHeat * heat * 0.002;

        // Cool at top
        const topCool = this.y / lampHeight;
        this.temperature -= topCool * 0.003;

        // Clamp temperature
        this.temperature = Math.max(0.2, Math.min(1, this.temperature));

        // Buoyancy force
        const buoyancy = (this.temperature - 0.5) * heat * 0.15;
        this.vy -= buoyancy;

        // Gravity
        this.vy += 0.02;

        // Viscosity/drag
        this.vx *= (1 - viscosity);
        this.vy *= (1 - viscosity);

        // Random movement
        this.vx += (Math.random() - 0.5) * 0.1;

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Boundary collision
        const margin = this.radius + 20;

        // Curved sides of lamp
        const centerX = lampWidth / 2;
        const maxX = centerX - 20 - (this.radius * 0.5);
        const curveOffset = Math.sin((this.y / lampHeight) * Math.PI) * 30;
        const leftBound = centerX - maxX + curveOffset;
        const rightBound = centerX + maxX - curveOffset;

        if (this.x < leftBound) {
            this.x = leftBound;
            this.vx *= -0.5;
        }
        if (this.x > rightBound) {
            this.x = rightBound;
            this.vx *= -0.5;
        }

        // Top and bottom
        if (this.y < margin) {
            this.y = margin;
            this.vy *= -0.3;
            this.temperature -= 0.05;
        }
        if (this.y > lampHeight - margin) {
            this.y = lampHeight - margin;
            this.vy *= -0.3;
            this.temperature += 0.1;
        }

        // Wobble effect
        this.phase += this.wobbleSpeed;
        this.radius = this.baseRadius + Math.sin(this.phase) * 5 +
                      Math.sin(this.phase * 2.3) * 3;
    }

    draw() {
        const scheme = colorSchemes[colorScheme];
        let color1, color2;

        if (colorScheme === 'rainbow') {
            const h = (this.hue + time * 20) % 360;
            color1 = `hsl(${h}, 80%, 50%)`;
            color2 = `hsl(${(h + 30) % 360}, 80%, 60%)`;
        } else {
            color1 = scheme.primary;
            color2 = scheme.secondary;
        }

        // Glow effect
        const glowGradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * 2
        );
        glowGradient.addColorStop(0, scheme.glow);
        glowGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Main blob with gradient
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3,
            this.y - this.radius * 0.3,
            0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, color2);
        gradient.addColorStop(0.7, color1);
        gradient.addColorStop(1, color1);

        ctx.fillStyle = gradient;
        ctx.beginPath();

        // Organic blob shape
        const points = 8;
        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const wobble = Math.sin(angle * 3 + this.phase) * 5 +
                          Math.sin(angle * 5 + this.phase * 1.5) * 3;
            const r = this.radius + wobble;
            const px = this.x + Math.cos(angle) * r;
            const py = this.y + Math.sin(angle) * r;

            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(
            this.x - this.radius * 0.2,
            this.y - this.radius * 0.3,
            this.radius * 0.3,
            this.radius * 0.2,
            -0.5,
            0, Math.PI * 2
        );
        ctx.fill();
    }
}

function initBlobs() {
    blobs = [];
    for (let i = 0; i < blobCount; i++) {
        blobs.push(new Blob(i));
    }
}

function drawLampBackground() {
    // Clear
    ctx.clearRect(0, 0, lampWidth, lampHeight);

    // Liquid background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, lampHeight);
    bgGradient.addColorStop(0, 'rgba(20, 10, 30, 0.9)');
    bgGradient.addColorStop(0.5, 'rgba(30, 20, 40, 0.8)');
    bgGradient.addColorStop(1, 'rgba(50, 30, 20, 0.9)');

    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, lampWidth, lampHeight);

    // Heat glow at bottom
    const heatGlow = ctx.createRadialGradient(
        lampWidth / 2, lampHeight + 50, 0,
        lampWidth / 2, lampHeight, lampHeight * 0.4
    );
    heatGlow.addColorStop(0, `rgba(255, 100, 0, ${0.3 * heat})`);
    heatGlow.addColorStop(1, 'transparent');

    ctx.fillStyle = heatGlow;
    ctx.fillRect(0, 0, lampWidth, lampHeight);
}

function checkBlobCollisions() {
    for (let i = 0; i < blobs.length; i++) {
        for (let j = i + 1; j < blobs.length; j++) {
            const dx = blobs[j].x - blobs[i].x;
            const dy = blobs[j].y - blobs[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = blobs[i].radius + blobs[j].radius;

            if (dist < minDist && dist > 0) {
                const overlap = minDist - dist;
                const nx = dx / dist;
                const ny = dy / dist;

                // Separate blobs
                blobs[i].x -= nx * overlap * 0.5;
                blobs[i].y -= ny * overlap * 0.5;
                blobs[j].x += nx * overlap * 0.5;
                blobs[j].y += ny * overlap * 0.5;

                // Transfer momentum
                const relVx = blobs[j].vx - blobs[i].vx;
                const relVy = blobs[j].vy - blobs[i].vy;
                const relVn = relVx * nx + relVy * ny;

                blobs[i].vx += nx * relVn * 0.3;
                blobs[i].vy += ny * relVn * 0.3;
                blobs[j].vx -= nx * relVn * 0.3;
                blobs[j].vy -= ny * relVn * 0.3;

                // Temperature exchange
                const avgTemp = (blobs[i].temperature + blobs[j].temperature) / 2;
                blobs[i].temperature = blobs[i].temperature * 0.9 + avgTemp * 0.1;
                blobs[j].temperature = blobs[j].temperature * 0.9 + avgTemp * 0.1;
            }
        }
    }
}

function shake() {
    for (const blob of blobs) {
        blob.vx += (Math.random() - 0.5) * 10;
        blob.vy += (Math.random() - 0.5) * 10;
        blob.temperature = 0.3 + Math.random() * 0.4;
    }
}

function animate() {
    drawLampBackground();

    // Update and check collisions
    for (const blob of blobs) {
        blob.update();
    }
    checkBlobCollisions();

    // Draw blobs (sorted by y for layering)
    blobs.sort((a, b) => a.y - b.y);
    for (const blob of blobs) {
        blob.draw();
    }

    time += 0.016;
    requestAnimationFrame(animate);
}

// UI controls
document.getElementById('heatSlider').addEventListener('input', (e) => {
    heat = parseFloat(e.target.value);
});

document.getElementById('viscositySlider').addEventListener('input', (e) => {
    viscosity = parseFloat(e.target.value);
});

document.getElementById('countSlider').addEventListener('input', (e) => {
    blobCount = parseInt(e.target.value);
    initBlobs();
});

document.getElementById('colorSelect').addEventListener('change', (e) => {
    colorScheme = e.target.value;
});

document.getElementById('shakeBtn').addEventListener('click', shake);

// Initialize
initBlobs();
animate();
