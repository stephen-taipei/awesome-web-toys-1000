const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let marbles = [];
let tracks = [];
let gravity = 0.3;
let bounce = 0.6;
let currentType = 'ramp';

const marbleRadius = 12;
const marbleColors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd'];

class Marble {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = 0;
        this.radius = marbleRadius;
        this.color = marbleColors[Math.floor(Math.random() * marbleColors.length)];
        this.trail = [];
    }

    update() {
        // Trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 15) this.trail.shift();

        // Gravity
        this.vy += gravity;

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Wall collision
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -bounce;
        }
        if (this.x + this.radius > width) {
            this.x = width - this.radius;
            this.vx *= -bounce;
        }
        if (this.y + this.radius > height) {
            this.y = height - this.radius;
            this.vy *= -bounce;
            this.vx *= 0.98;
        }

        // Air resistance
        this.vx *= 0.999;
        this.vy *= 0.999;
    }

    draw() {
        // Trail
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = i / this.trail.length * 0.3;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, this.radius * (i / this.trail.length) * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(this.x + 3, this.y + 3, this.radius, this.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Marble body
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3,
            this.y - this.radius * 0.3,
            0,
            this.x,
            this.y,
            this.radius
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, this.color);
        gradient.addColorStop(1, this.darkenColor(this.color, 40));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.ellipse(
            this.x - this.radius * 0.3,
            this.y - this.radius * 0.3,
            this.radius * 0.25,
            this.radius * 0.15,
            -0.5,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return `rgb(${R}, ${G}, ${B})`;
    }
}

class Track {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.angle = 0;

        switch (type) {
            case 'ramp':
                this.width = 120;
                this.height = 10;
                this.angle = Math.PI * 0.15;
                break;
            case 'funnel':
                this.width = 80;
                this.height = 60;
                break;
            case 'bumper':
                this.radius = 20;
                this.strength = 8;
                break;
            case 'spinner':
                this.radius = 40;
                this.spinAngle = 0;
                this.armLength = 35;
                break;
        }
    }

    update() {
        if (this.type === 'spinner') {
            this.spinAngle += 0.03;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        switch (this.type) {
            case 'ramp':
                this.drawRamp();
                break;
            case 'funnel':
                this.drawFunnel();
                break;
            case 'bumper':
                this.drawBumper();
                break;
            case 'spinner':
                this.drawSpinner();
                break;
        }

        ctx.restore();
    }

    drawRamp() {
        ctx.rotate(this.angle);

        const gradient = ctx.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
        gradient.addColorStop(0, '#8B4513');
        gradient.addColorStop(0.5, '#A0522D');
        gradient.addColorStop(1, '#654321');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, 3);
        ctx.fill();

        ctx.strokeStyle = '#5D3A1A';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawFunnel() {
        ctx.fillStyle = '#4a4a6a';
        ctx.beginPath();
        ctx.moveTo(-this.width / 2, 0);
        ctx.lineTo(-10, this.height);
        ctx.lineTo(10, this.height);
        ctx.lineTo(this.width / 2, 0);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#6a6a8a';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    drawBumper() {
        // Glow
        const glow = ctx.createRadialGradient(0, 0, this.radius * 0.5, 0, 0, this.radius * 1.5);
        glow.addColorStop(0, 'rgba(255, 100, 100, 0.3)');
        glow.addColorStop(1, 'rgba(255, 100, 100, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        const gradient = ctx.createRadialGradient(-5, -5, 0, 0, 0, this.radius);
        gradient.addColorStop(0, '#ff8888');
        gradient.addColorStop(0.7, '#ff4444');
        gradient.addColorStop(1, '#cc0000');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#aa0000';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    drawSpinner() {
        // Center
        ctx.fillStyle = '#555';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();

        // Arms
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';

        for (let i = 0; i < 4; i++) {
            const angle = this.spinAngle + (i * Math.PI / 2);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * this.armLength, Math.sin(angle) * this.armLength);
            ctx.stroke();
        }
    }

    checkCollision(marble) {
        switch (this.type) {
            case 'ramp':
                return this.checkRampCollision(marble);
            case 'funnel':
                return this.checkFunnelCollision(marble);
            case 'bumper':
                return this.checkBumperCollision(marble);
            case 'spinner':
                return this.checkSpinnerCollision(marble);
        }
    }

    checkRampCollision(marble) {
        // Transform marble position to ramp space
        const cos = Math.cos(-this.angle);
        const sin = Math.sin(-this.angle);
        const dx = marble.x - this.x;
        const dy = marble.y - this.y;
        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        if (Math.abs(localX) < this.width / 2 + marble.radius &&
            Math.abs(localY) < this.height / 2 + marble.radius) {

            if (localY < 0) {
                // Bounce on ramp surface
                const normalAngle = this.angle - Math.PI / 2;
                const normalX = Math.cos(normalAngle);
                const normalY = Math.sin(normalAngle);

                const dot = marble.vx * normalX + marble.vy * normalY;
                marble.vx -= 2 * dot * normalX * bounce;
                marble.vy -= 2 * dot * normalY * bounce;

                // Push out
                marble.y = this.y + (localX * Math.tan(this.angle)) - marble.radius - this.height / 2;
            }
        }
    }

    checkFunnelCollision(marble) {
        const dx = marble.x - this.x;
        const dy = marble.y - this.y;

        if (dy > 0 && dy < this.height && Math.abs(dx) < this.width / 2) {
            const funnelWidth = this.width / 2 * (1 - dy / this.height) + 10;

            if (Math.abs(dx) > funnelWidth - marble.radius) {
                marble.vx *= -bounce * 0.5;
                marble.x = this.x + Math.sign(dx) * (funnelWidth - marble.radius);
            }
        }
    }

    checkBumperCollision(marble) {
        const dx = marble.x - this.x;
        const dy = marble.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = this.radius + marble.radius;

        if (dist < minDist) {
            const angle = Math.atan2(dy, dx);
            marble.vx = Math.cos(angle) * this.strength;
            marble.vy = Math.sin(angle) * this.strength;

            marble.x = this.x + Math.cos(angle) * minDist;
            marble.y = this.y + Math.sin(angle) * minDist;
        }
    }

    checkSpinnerCollision(marble) {
        for (let i = 0; i < 4; i++) {
            const angle = this.spinAngle + (i * Math.PI / 2);
            const armEndX = this.x + Math.cos(angle) * this.armLength;
            const armEndY = this.y + Math.sin(angle) * this.armLength;

            // Check distance to arm line
            const dx = armEndX - this.x;
            const dy = armEndY - this.y;
            const t = Math.max(0, Math.min(1,
                ((marble.x - this.x) * dx + (marble.y - this.y) * dy) / (dx * dx + dy * dy)
            ));

            const closestX = this.x + t * dx;
            const closestY = this.y + t * dy;

            const distX = marble.x - closestX;
            const distY = marble.y - closestY;
            const dist = Math.sqrt(distX * distX + distY * distY);

            if (dist < marble.radius + 4) {
                // Push away and add spin velocity
                const pushAngle = Math.atan2(distY, distX);
                marble.vx += Math.cos(pushAngle) * 3 + Math.cos(angle + Math.PI / 2) * 2;
                marble.vy += Math.sin(pushAngle) * 3 + Math.sin(angle + Math.PI / 2) * 2;
            }
        }
    }
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

function dropMarble() {
    if (marbles.length < 50) {
        const x = 100 + Math.random() * (width - 200);
        marbles.push(new Marble(x, 50));
        updateStats();
    }
}

function updateStats() {
    document.getElementById('marbleCount').textContent = marbles.length;
    document.getElementById('trackCount').textContent = tracks.length;
}

function animate() {
    // Background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#2d1f3d');
    bgGradient.addColorStop(1, '#1a1028');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = 'rgba(255, 180, 100, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // Update and draw tracks
    for (const track of tracks) {
        track.update();
        track.draw();
    }

    // Update marbles
    for (const marble of marbles) {
        marble.update();

        // Check track collisions
        for (const track of tracks) {
            track.checkCollision(marble);
        }

        // Check marble-marble collisions
        for (const other of marbles) {
            if (other === marble) continue;

            const dx = other.x - marble.x;
            const dy = other.y - marble.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = marble.radius + other.radius;

            if (dist < minDist && dist > 0) {
                const angle = Math.atan2(dy, dx);
                const sin = Math.sin(angle);
                const cos = Math.cos(angle);

                // Elastic collision
                const vx1 = marble.vx * cos + marble.vy * sin;
                const vy1 = marble.vy * cos - marble.vx * sin;
                const vx2 = other.vx * cos + other.vy * sin;
                const vy2 = other.vy * cos - other.vx * sin;

                marble.vx = (vx2 * cos - vy1 * sin) * bounce;
                marble.vy = (vy1 * cos + vx2 * sin) * bounce;
                other.vx = (vx1 * cos - vy2 * sin) * bounce;
                other.vy = (vy2 * cos + vx1 * sin) * bounce;

                // Separate
                const overlap = minDist - dist;
                marble.x -= (overlap / 2) * cos;
                marble.y -= (overlap / 2) * sin;
                other.x += (overlap / 2) * cos;
                other.y += (overlap / 2) * sin;
            }
        }
    }

    // Draw marbles
    for (const marble of marbles) {
        marble.draw();
    }

    // Remove off-screen marbles
    marbles = marbles.filter(m => m.y < height + 100);
    updateStats();

    requestAnimationFrame(animate);
}

// Event listeners
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    tracks.push(new Track(x, y, currentType));
    updateStats();
});

document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentType = btn.dataset.type;
    });
});

document.getElementById('gravitySlider').addEventListener('input', (e) => {
    gravity = parseFloat(e.target.value);
    document.getElementById('gravityValue').textContent = gravity.toFixed(2);
});

document.getElementById('bounceSlider').addEventListener('input', (e) => {
    bounce = parseFloat(e.target.value);
    document.getElementById('bounceValue').textContent = bounce.toFixed(2);
});

document.getElementById('dropBtn').addEventListener('click', dropMarble);

document.getElementById('resetBtn').addEventListener('click', () => {
    marbles = [];
    tracks = [];
    updateStats();
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        dropMarble();
    }
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
