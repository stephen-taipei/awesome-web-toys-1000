const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let mouseX = 0, mouseY = 0;
let prevMouseX = 0, prevMouseY = 0;
let isMouseDown = false;
let time = 0;

// Parameters
let density = 5;
let riseSpeed = 1.5;
let fadeSpeed = 0.008;
let turbulence = 1;
let colorMode = 'white';

// Simplex noise for turbulence
class SimplexNoise {
    constructor() {
        this.p = new Uint8Array(256);
        for (let i = 0; i < 256; i++) this.p[i] = i;
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
        }
        this.perm = new Uint8Array(512);
        for (let i = 0; i < 512; i++) this.perm[i] = this.p[i & 255];
    }

    dot2(g, x, y) {
        return g[0] * x + g[1] * y;
    }

    noise2D(x, y) {
        const F2 = 0.5 * (Math.sqrt(3) - 1);
        const G2 = (3 - Math.sqrt(3)) / 6;
        const grad3 = [[1,1],[−1,1],[1,−1],[−1,−1],[1,0],[−1,0],[0,1],[0,−1]];

        let s = (x + y) * F2;
        let i = Math.floor(x + s);
        let j = Math.floor(y + s);
        let t = (i + j) * G2;

        let X0 = i - t;
        let Y0 = j - t;
        let x0 = x - X0;
        let y0 = y - Y0;

        let i1, j1;
        if (x0 > y0) { i1 = 1; j1 = 0; }
        else { i1 = 0; j1 = 1; }

        let x1 = x0 - i1 + G2;
        let y1 = y0 - j1 + G2;
        let x2 = x0 - 1 + 2 * G2;
        let y2 = y0 - 1 + 2 * G2;

        let ii = i & 255;
        let jj = j & 255;

        let n0 = 0, n1 = 0, n2 = 0;

        let t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 >= 0) {
            let gi0 = this.perm[ii + this.perm[jj]] % 8;
            t0 *= t0;
            n0 = t0 * t0 * this.dot2(grad3[gi0], x0, y0);
        }

        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 >= 0) {
            let gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 8;
            t1 *= t1;
            n1 = t1 * t1 * this.dot2(grad3[gi1], x1, y1);
        }

        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 >= 0) {
            let gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 8;
            t2 *= t2;
            n2 = t2 * t2 * this.dot2(grad3[gi2], x2, y2);
        }

        return 70 * (n0 + n1 + n2);
    }
}

const noise = new SimplexNoise();

// Simple fallback noise if simplex fails
function simpleNoise(x, y, t) {
    return Math.sin(x * 0.02 + t) * Math.cos(y * 0.02 + t * 0.7) * 0.5 +
           Math.sin(x * 0.01 - t * 0.5) * Math.cos(y * 0.015 + t * 0.3) * 0.5;
}

class SmokeParticle {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx + (Math.random() - 0.5) * 2;
        this.vy = vy - Math.random() * riseSpeed - 0.5;
        this.size = 20 + Math.random() * 30;
        this.maxSize = this.size * (2 + Math.random());
        this.alpha = 0.3 + Math.random() * 0.4;
        this.life = 1;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.noiseOffset = Math.random() * 1000;

        // Color based on mode
        this.setColor();
    }

    setColor() {
        switch (colorMode) {
            case 'white':
                this.r = 200 + Math.random() * 55;
                this.g = 200 + Math.random() * 55;
                this.b = 200 + Math.random() * 55;
                break;
            case 'gray':
                const gray = 80 + Math.random() * 80;
                this.r = gray;
                this.g = gray;
                this.b = gray;
                break;
            case 'fire':
                this.r = 200 + Math.random() * 55;
                this.g = 50 + Math.random() * 100;
                this.b = 20 + Math.random() * 30;
                break;
            case 'magic':
                this.r = 100 + Math.random() * 100;
                this.g = 50 + Math.random() * 50;
                this.b = 200 + Math.random() * 55;
                break;
        }
    }

    update() {
        // Apply turbulence
        const noiseVal = simpleNoise(
            this.x * 0.01 + this.noiseOffset,
            this.y * 0.01,
            time
        );

        this.vx += noiseVal * turbulence * 0.1;
        this.vy += simpleNoise(
            this.x * 0.01,
            this.y * 0.01 + this.noiseOffset,
            time * 0.8
        ) * turbulence * 0.05;

        // Rise effect
        this.vy -= riseSpeed * 0.01;

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Damping
        this.vx *= 0.99;
        this.vy *= 0.99;

        // Grow
        if (this.size < this.maxSize) {
            this.size += 0.5;
        }

        // Rotate
        this.rotation += this.rotationSpeed;

        // Fade
        this.life -= fadeSpeed;
        this.alpha = this.life * 0.5;

        return this.life > 0 && this.y > -this.size;
    }

    draw() {
        if (this.alpha <= 0) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.alpha;

        // Create soft smoke gradient
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, `rgba(${this.r}, ${this.g}, ${this.b}, 0.8)`);
        gradient.addColorStop(0.4, `rgba(${this.r}, ${this.g}, ${this.b}, 0.3)`);
        gradient.addColorStop(1, `rgba(${this.r}, ${this.g}, ${this.b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

function emitSmoke(x, y, vx, vy) {
    const count = Math.floor(density);
    for (let i = 0; i < count; i++) {
        particles.push(new SmokeParticle(
            x + (Math.random() - 0.5) * 20,
            y + (Math.random() - 0.5) * 20,
            vx * 0.2,
            vy * 0.2
        ));
    }
}

function animate() {
    // Dark fade effect
    ctx.fillStyle = 'rgba(10, 10, 10, 0.15)';
    ctx.fillRect(0, 0, width, height);

    // Update and draw particles
    particles = particles.filter(p => p.update());

    // Sort by size for better layering
    particles.sort((a, b) => b.size - a.size);

    for (const particle of particles) {
        particle.draw();
    }

    // Emit smoke when mouse is down
    if (isMouseDown) {
        const vx = mouseX - prevMouseX;
        const vy = mouseY - prevMouseY;
        emitSmoke(mouseX, mouseY, vx, vy);
    }

    prevMouseX = mouseX;
    prevMouseY = mouseY;
    time += 0.02;

    // Limit particles
    if (particles.length > 2000) {
        particles = particles.slice(-1500);
    }

    requestAnimationFrame(animate);
}

// Event listeners
canvas.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    mouseX = e.clientX;
    mouseY = e.clientY;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
});

canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Blow smoke with mouse movement
    if (!isMouseDown) {
        const dx = e.movementX;
        const dy = e.movementY;
        const speed = Math.sqrt(dx * dx + dy * dy);

        if (speed > 5) {
            for (const particle of particles) {
                const distX = e.clientX - particle.x;
                const distY = e.clientY - particle.y;
                const dist = Math.sqrt(distX * distX + distY * distY);

                if (dist < 100) {
                    const force = (100 - dist) / 100;
                    particle.vx += dx * force * 0.3;
                    particle.vy += dy * force * 0.3;
                }
            }
        }
    }
});

canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
});

canvas.addEventListener('mouseleave', () => {
    isMouseDown = false;
});

// Touch support
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isMouseDown = true;
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
});

canvas.addEventListener('touchend', () => {
    isMouseDown = false;
});

// UI controls
document.getElementById('densitySlider').addEventListener('input', (e) => {
    density = parseFloat(e.target.value);
});

document.getElementById('riseSlider').addEventListener('input', (e) => {
    riseSpeed = parseFloat(e.target.value);
});

document.getElementById('fadeSlider').addEventListener('input', (e) => {
    fadeSpeed = parseFloat(e.target.value);
});

document.getElementById('turbulenceSlider').addEventListener('input', (e) => {
    turbulence = parseFloat(e.target.value);
});

document.getElementById('colorSelect').addEventListener('change', (e) => {
    colorMode = e.target.value;
});

document.getElementById('clearBtn').addEventListener('click', () => {
    particles = [];
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
