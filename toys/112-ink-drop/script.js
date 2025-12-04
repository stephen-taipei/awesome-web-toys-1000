const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let inkDrops = [];
let currentColor = 'random';
let dropSize = 15;
let spreadSpeed = 5;
let flowStrength = 2;
let time = 0;

// Perlin noise for organic movement
class PerlinNoise {
    constructor() {
        this.perm = [];
        for (let i = 0; i < 256; i++) this.perm[i] = i;
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.perm[i], this.perm[j]] = [this.perm[j], this.perm[i]];
        }
        this.perm = [...this.perm, ...this.perm];
    }

    fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    lerp(a, b, t) { return a + t * (b - a); }
    grad(hash, x, y) {
        const h = hash & 3;
        const u = h < 2 ? x : y;
        const v = h < 2 ? y : x;
        return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
    }

    noise(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        const u = this.fade(x);
        const v = this.fade(y);
        const A = this.perm[X] + Y;
        const B = this.perm[X + 1] + Y;
        return this.lerp(
            this.lerp(this.grad(this.perm[A], x, y), this.grad(this.perm[B], x - 1, y), u),
            this.lerp(this.grad(this.perm[A + 1], x, y - 1), this.grad(this.perm[B + 1], x - 1, y - 1), u),
            v
        );
    }
}

const perlin = new PerlinNoise();

class InkParticle {
    constructor(x, y, color, size) {
        this.x = x;
        this.y = y;
        this.originX = x;
        this.originY = y;
        this.color = color;
        this.size = size * (0.5 + Math.random() * 0.5);
        this.maxSize = this.size * (3 + Math.random() * 2);
        this.alpha = 0.8 + Math.random() * 0.2;
        this.growthRate = 0.02 + Math.random() * 0.03;
        this.angle = Math.random() * Math.PI * 2;
        this.spread = 0;
        this.spreadRate = (0.3 + Math.random() * 0.7) * spreadSpeed * 0.1;
        this.life = 1;
        this.decay = 0.0005 + Math.random() * 0.001;
        this.noiseOffset = Math.random() * 1000;
    }

    update() {
        // Grow
        if (this.size < this.maxSize) {
            this.size += this.growthRate * spreadSpeed;
        }

        // Spread outward
        this.spread += this.spreadRate;
        const noise = perlin.noise(
            this.x * 0.01 + this.noiseOffset,
            this.y * 0.01 + time * 0.5
        );

        this.x = this.originX + Math.cos(this.angle + noise) * this.spread;
        this.y = this.originY + Math.sin(this.angle + noise * 0.5) * this.spread;

        // Flow effect
        if (flowStrength > 0) {
            const flowNoise = perlin.noise(this.x * 0.005, time * 0.3);
            this.x += flowNoise * flowStrength * 0.5;
            this.y += perlin.noise(this.y * 0.005, time * 0.3) * flowStrength * 0.3;
        }

        // Fade
        this.life -= this.decay;
        this.alpha = Math.max(0, this.life * 0.8);

        return this.life > 0 && this.alpha > 0.01;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;

        // Create gradient for organic look
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size
        );

        const rgb = this.getRGB();
        gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`);
        gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`);
        gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    getRGB() {
        const colors = {
            crimson: { r: 220, g: 20, b: 60 },
            royalblue: { r: 65, g: 105, b: 225 },
            gold: { r: 255, g: 215, b: 0 },
            limegreen: { r: 50, g: 205, b: 50 },
            purple: { r: 128, g: 0, b: 128 }
        };

        if (this._rgb) return this._rgb;

        if (colors[this.color]) {
            this._rgb = colors[this.color];
        } else {
            // Generate random color
            const hue = Math.random() * 360;
            const rgb = hslToRgb(hue / 360, 0.8, 0.5);
            this._rgb = { r: rgb[0], g: rgb[1], b: rgb[2] };
        }

        return this._rgb;
    }
}

class InkDrop {
    constructor(x, y, color, size) {
        this.particles = [];
        this.x = x;
        this.y = y;

        // Create initial particles
        const particleCount = Math.floor(size * 3);
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const dist = Math.random() * size * 0.5;
            const px = x + Math.cos(angle) * dist;
            const py = y + Math.sin(angle) * dist;
            this.particles.push(new InkParticle(px, py, color, size * 0.3));
        }

        // Add center blob
        for (let i = 0; i < 5; i++) {
            this.particles.push(new InkParticle(
                x + (Math.random() - 0.5) * size * 0.3,
                y + (Math.random() - 0.5) * size * 0.3,
                color,
                size * 0.5
            ));
        }
    }

    update() {
        this.particles = this.particles.filter(p => p.update());
        return this.particles.length > 0;
    }

    draw() {
        // Sort by size for proper layering
        this.particles.sort((a, b) => b.size - a.size);
        for (const particle of this.particles) {
            particle.draw();
        }
    }
}

function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    // Fill with paper texture background
    drawBackground();
}

function drawBackground() {
    // Paper background
    ctx.fillStyle = '#f5f5f0';
    ctx.fillRect(0, 0, width, height);

    // Add subtle texture
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const gray = Math.random() * 100 + 100;
        ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
        ctx.fillRect(x, y, 1, 1);
    }
    ctx.globalAlpha = 1;
}

function addDrop(x, y) {
    const color = currentColor === 'random' ?
        ['crimson', 'royalblue', 'gold', 'limegreen', 'purple'][Math.floor(Math.random() * 5)] :
        currentColor;

    inkDrops.push(new InkDrop(x, y, color, dropSize));
}

function animate() {
    // Slight fade effect to simulate paper absorption
    ctx.fillStyle = 'rgba(245, 245, 240, 0.01)';
    ctx.fillRect(0, 0, width, height);

    // Update and draw ink drops
    inkDrops = inkDrops.filter(drop => drop.update());

    for (const drop of inkDrops) {
        drop.draw();
    }

    time += 0.01;
    requestAnimationFrame(animate);
}

// Event listeners
canvas.addEventListener('click', (e) => {
    addDrop(e.clientX, e.clientY);
});

canvas.addEventListener('mousemove', (e) => {
    if (e.buttons === 1) {
        if (Math.random() < 0.3) {
            addDrop(e.clientX, e.clientY);
        }
    }
});

// Touch support
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    addDrop(e.touches[0].clientX, e.touches[0].clientY);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (Math.random() < 0.3) {
        addDrop(e.touches[0].clientX, e.touches[0].clientY);
    }
});

// UI controls
document.getElementById('dropSizeSlider').addEventListener('input', (e) => {
    dropSize = parseInt(e.target.value);
});

document.getElementById('spreadSlider').addEventListener('input', (e) => {
    spreadSpeed = parseInt(e.target.value);
});

document.getElementById('flowSlider').addEventListener('input', (e) => {
    flowStrength = parseInt(e.target.value);
});

document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentColor = btn.dataset.color;
    });
});

document.getElementById('clearBtn').addEventListener('click', () => {
    inkDrops = [];
    drawBackground();
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
