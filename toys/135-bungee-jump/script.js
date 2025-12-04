const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let jumper = null;
let ropeLength = 300;
let elasticity = 0.02;
let damping = 0.98;
let gravity = 0.4;

let hasJumped = false;
let maxSpeed = 0;
let lowestPoint = 0;
let bounceCount = 0;
let lastDirection = 0;

// Platform and anchor
let platformY = 80;
let anchorX;

class Jumper {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.width = 30;
        this.height = 50;
        this.onPlatform = true;
    }

    jump() {
        if (this.onPlatform) {
            this.onPlatform = false;
            this.vy = 2;
            hasJumped = true;
        }
    }

    update() {
        if (this.onPlatform) return;

        // Apply gravity
        this.vy += gravity;

        // Calculate rope force when stretched
        const ropeStartY = platformY + 20;
        const dy = this.y - ropeStartY;

        if (dy > ropeLength) {
            // Rope is stretched - apply elastic force
            const stretch = dy - ropeLength;
            const force = stretch * elasticity;
            this.vy -= force;

            // Track bounces
            const currentDirection = Math.sign(this.vy);
            if (currentDirection !== lastDirection && lastDirection !== 0) {
                bounceCount++;
                updateStats();
            }
            lastDirection = currentDirection;
        }

        // Apply damping
        this.vy *= damping;
        this.vx *= damping;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Track stats
        const speed = Math.abs(this.vy);
        if (speed > maxSpeed) {
            maxSpeed = speed;
        }
        if (this.y > lowestPoint) {
            lowestPoint = this.y;
        }

        // Keep within horizontal bounds
        if (this.x < this.width / 2) {
            this.x = this.width / 2;
            this.vx *= -0.5;
        }
        if (this.x > width - this.width / 2) {
            this.x = width - this.width / 2;
            this.vx *= -0.5;
        }

        updateStats();
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Body rotation based on velocity
        const rotation = Math.atan2(this.vx, Math.abs(this.vy)) * 0.3;
        ctx.rotate(rotation);

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(3, this.height / 2 + 5, this.width / 2, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Legs
        ctx.strokeStyle = '#4a3728';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';

        const legSpread = this.onPlatform ? 0 : Math.sin(Date.now() * 0.01) * 10;
        ctx.beginPath();
        ctx.moveTo(-5, this.height / 4);
        ctx.lineTo(-10 - legSpread, this.height / 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(5, this.height / 4);
        ctx.lineTo(10 + legSpread, this.height / 2);
        ctx.stroke();

        // Body
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2 - 5, this.height / 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Arms
        const armWave = this.onPlatform ? 0 : Math.sin(Date.now() * 0.015) * 20;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 5;

        ctx.beginPath();
        ctx.moveTo(-this.width / 2 + 5, -5);
        ctx.lineTo(-this.width / 2 - 10, -20 + armWave);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.width / 2 - 5, -5);
        ctx.lineTo(this.width / 2 + 10, -20 - armWave);
        ctx.stroke();

        // Head
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, -this.height / 3 - 5, 12, 0, Math.PI * 2);
        ctx.fill();

        // Helmet
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, -this.height / 3 - 8, 14, Math.PI, 0);
        ctx.fill();

        // Face
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-4, -this.height / 3 - 5, 2, 0, Math.PI * 2);
        ctx.arc(4, -this.height / 3 - 5, 2, 0, Math.PI * 2);
        ctx.fill();

        // Expression
        if (this.vy > 5) {
            // Scared
            ctx.beginPath();
            ctx.arc(0, -this.height / 3, 4, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            // Happy
            ctx.beginPath();
            ctx.arc(0, -this.height / 3 - 2, 5, 0.1 * Math.PI, 0.9 * Math.PI);
            ctx.stroke();
        }

        ctx.restore();
    }
}

function drawRope() {
    if (!jumper || jumper.onPlatform) return;

    const startX = anchorX;
    const startY = platformY + 20;
    const endX = jumper.x;
    const endY = jumper.y - jumper.height / 3;

    const dy = endY - startY;
    const isStretched = dy > ropeLength;

    // Calculate rope segments
    const segments = 30;
    const points = [];

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        let x = startX + (endX - startX) * t;
        let y = startY + (endY - startY) * t;

        // Add some sag if not fully stretched
        if (!isStretched && dy > 0) {
            const sag = Math.sin(t * Math.PI) * (ropeLength - dy) * 0.3;
            y += sag;
        }

        // Add vibration when stretched
        if (isStretched) {
            const vibration = Math.sin(t * Math.PI * 8 + Date.now() * 0.02) * 2 * (1 - t);
            x += vibration;
        }

        points.push({ x, y });
    }

    // Draw rope shadow
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(points[0].x + 3, points[0].y + 3);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x + 3, points[i].y + 3);
    }
    ctx.stroke();

    // Draw rope
    const ropeGradient = ctx.createLinearGradient(startX, startY, endX, endY);
    ropeGradient.addColorStop(0, '#2563eb');
    ropeGradient.addColorStop(0.5, '#3b82f6');
    ropeGradient.addColorStop(1, '#60a5fa');

    ctx.strokeStyle = ropeGradient;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[0].x - 1, points[0].y - 1);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x - 1, points[i].y - 1);
    }
    ctx.stroke();
}

function drawPlatform() {
    // Bridge/platform
    const platformWidth = 200;
    const platformX = anchorX - platformWidth / 2;

    // Support beams
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(platformX, platformY, 20, 60);
    ctx.fillRect(platformX + platformWidth - 20, platformY, 20, 60);

    // Cross beams
    ctx.strokeStyle = '#a0522d';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(platformX + 10, platformY);
    ctx.lineTo(platformX + platformWidth - 10, platformY + 50);
    ctx.moveTo(platformX + platformWidth - 10, platformY);
    ctx.lineTo(platformX + 10, platformY + 50);
    ctx.stroke();

    // Platform top
    ctx.fillStyle = '#cd853f';
    ctx.fillRect(platformX - 20, platformY - 15, platformWidth + 40, 20);

    // Railing
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(platformX - 20, platformY - 15);
    ctx.lineTo(platformX - 20, platformY - 45);
    ctx.lineTo(platformX + platformWidth + 20, platformY - 45);
    ctx.lineTo(platformX + platformWidth + 20, platformY - 15);
    ctx.stroke();

    // Anchor point
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(anchorX, platformY + 20, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.arc(anchorX, platformY + 20, 6, 0, Math.PI * 2);
    ctx.fill();
}

function drawBackground() {
    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, '#1e3a5f');
    skyGradient.addColorStop(0.3, '#87ceeb');
    skyGradient.addColorStop(0.7, '#e0f0ff');
    skyGradient.addColorStop(1, '#90ee90');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    // Distant mountains
    ctx.fillStyle = '#6b8e6b';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.7);
    ctx.lineTo(width * 0.2, height * 0.5);
    ctx.lineTo(width * 0.4, height * 0.65);
    ctx.lineTo(width * 0.6, height * 0.45);
    ctx.lineTo(width * 0.8, height * 0.6);
    ctx.lineTo(width, height * 0.55);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Trees
    ctx.fillStyle = '#228b22';
    for (let x = 0; x < width; x += 80) {
        const treeHeight = 40 + Math.random() * 30;
        ctx.beginPath();
        ctx.moveTo(x + 40, height - 50);
        ctx.lineTo(x + 20, height - 50 - treeHeight);
        ctx.lineTo(x + 60, height - 50 - treeHeight);
        ctx.closePath();
        ctx.fill();
    }

    // Ground
    ctx.fillStyle = '#228b22';
    ctx.fillRect(0, height - 50, width, 50);

    // River
    ctx.fillStyle = 'rgba(30, 144, 255, 0.6)';
    ctx.fillRect(width * 0.3, height - 50, width * 0.4, 50);
}

function drawSpeedometer() {
    if (!jumper || jumper.onPlatform) return;

    const speed = Math.abs(jumper.vy);
    const maxDisplay = 20;
    const ratio = Math.min(speed / maxDisplay, 1);

    const x = width - 80;
    const y = 100;
    const radius = 50;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
    ctx.fill();

    // Speed arc
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0.75 * Math.PI, 0.25 * Math.PI);
    ctx.stroke();

    // Speed indicator
    const speedGradient = ctx.createLinearGradient(x - radius, y, x + radius, y);
    speedGradient.addColorStop(0, '#22c55e');
    speedGradient.addColorStop(0.5, '#fbbf24');
    speedGradient.addColorStop(1, '#ef4444');

    ctx.strokeStyle = speedGradient;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0.75 * Math.PI, 0.75 * Math.PI + ratio * 1.5 * Math.PI);
    ctx.stroke();

    // Speed text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(speed.toFixed(1), x, y + 5);
    ctx.font = '10px Arial';
    ctx.fillText('m/s', x, y + 18);
}

function updateStats() {
    document.getElementById('maxSpeed').textContent = maxSpeed.toFixed(1) + ' m/s';
    document.getElementById('lowestPoint').textContent = Math.round(lowestPoint - platformY) + ' m';
    document.getElementById('bounceCount').textContent = bounceCount;
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    anchorX = width / 2;
    reset();
}

function reset() {
    jumper = new Jumper(anchorX, platformY - 30);
    hasJumped = false;
    maxSpeed = 0;
    lowestPoint = 0;
    bounceCount = 0;
    lastDirection = 0;
    updateStats();
}

function animate() {
    drawBackground();
    drawPlatform();

    if (jumper) {
        jumper.update();
        drawRope();
        jumper.draw();
    }

    drawSpeedometer();

    requestAnimationFrame(animate);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (jumper) jumper.jump();
    }
});

document.getElementById('jumpBtn').addEventListener('click', () => {
    if (jumper) jumper.jump();
});

document.getElementById('resetBtn').addEventListener('click', reset);

document.getElementById('lengthSlider').addEventListener('input', (e) => {
    ropeLength = parseInt(e.target.value);
    document.getElementById('lengthValue').textContent = ropeLength;
});

document.getElementById('elasticitySlider').addEventListener('input', (e) => {
    elasticity = parseFloat(e.target.value);
    document.getElementById('elasticityValue').textContent = elasticity.toFixed(3);
});

document.getElementById('dampingSlider').addEventListener('input', (e) => {
    damping = parseFloat(e.target.value);
    document.getElementById('dampingValue').textContent = damping.toFixed(3);
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
