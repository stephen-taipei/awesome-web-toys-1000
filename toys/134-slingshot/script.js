const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let projectile = null;
let projectiles = [];
let blocks = [];
let targets = [];
let score = 0;
let shots = 0;
let powerMultiplier = 1.0;
let gravity = 0.3;

// Slingshot position
let slingshotX, slingshotY;
let isDragging = false;
let dragX, dragY;
const maxPull = 150;

class Projectile {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = 15;
        this.trail = [];
        this.active = true;
    }

    update() {
        if (!this.active) return;

        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 30) this.trail.shift();

        this.vy += gravity;
        this.x += this.vx;
        this.y += this.vy;

        // Ground collision
        if (this.y + this.radius > height - 50) {
            this.y = height - 50 - this.radius;
            this.vy *= -0.5;
            this.vx *= 0.8;

            if (Math.abs(this.vy) < 1) {
                this.vy = 0;
            }
        }

        // Wall collision
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -0.5;
        }
        if (this.x + this.radius > width) {
            this.x = width - this.radius;
            this.vx *= -0.5;
        }

        // Deactivate if stopped
        if (Math.abs(this.vx) < 0.1 && Math.abs(this.vy) < 0.1 && this.y >= height - 51 - this.radius) {
            this.active = false;
        }
    }

    draw() {
        // Trail
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = i / this.trail.length * 0.5;
            ctx.fillStyle = `rgba(139, 69, 19, ${alpha})`;
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, this.radius * (i / this.trail.length) * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(this.x + 3, this.y + 3, this.radius, this.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Projectile (rock)
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3, this.y - this.radius * 0.3, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, '#a0a0a0');
        gradient.addColorStop(0.5, '#808080');
        gradient.addColorStop(1, '#505050');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Texture spots
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(this.x + 3, this.y + 2, 3, 0, Math.PI * 2);
        ctx.arc(this.x - 4, this.y + 4, 2, 0, Math.PI * 2);
        ctx.arc(this.x + 2, this.y - 4, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Block {
    constructor(x, y, width, height, type = 'wood') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.vx = 0;
        this.vy = 0;
        this.angle = 0;
        this.angularVel = 0;
        this.health = type === 'wood' ? 2 : type === 'stone' ? 4 : 1;
        this.destroyed = false;
    }

    update() {
        if (this.destroyed) return;

        this.vy += gravity * 0.5;
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.angularVel;

        // Ground collision
        if (this.y + this.height / 2 > height - 50) {
            this.y = height - 50 - this.height / 2;
            this.vy *= -0.3;
            this.vx *= 0.8;
            this.angularVel *= 0.8;
        }

        // Friction
        this.vx *= 0.98;
        this.angularVel *= 0.95;
    }

    draw() {
        if (this.destroyed) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(-this.width / 2 + 3, -this.height / 2 + 3, this.width, this.height);

        // Block
        let color1, color2;
        if (this.type === 'wood') {
            color1 = '#deb887';
            color2 = '#a0522d';
        } else if (this.type === 'stone') {
            color1 = '#a0a0a0';
            color2 = '#606060';
        } else {
            color1 = '#87ceeb';
            color2 = '#4169e1';
        }

        const gradient = ctx.createLinearGradient(-this.width / 2, -this.height / 2, this.width / 2, this.height / 2);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);

        ctx.fillStyle = gradient;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Wood grain or stone texture
        if (this.type === 'wood') {
            ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                const y = -this.height / 2 + (i + 1) * this.height / 4;
                ctx.beginPath();
                ctx.moveTo(-this.width / 2, y);
                ctx.lineTo(this.width / 2, y);
                ctx.stroke();
            }
        }

        // Border
        ctx.strokeStyle = color2;
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

        ctx.restore();
    }

    checkCollision(projectile) {
        if (this.destroyed) return false;

        // Simple AABB for now
        const dx = Math.abs(projectile.x - this.x);
        const dy = Math.abs(projectile.y - this.y);

        if (dx < this.width / 2 + projectile.radius && dy < this.height / 2 + projectile.radius) {
            // Collision!
            const overlapX = this.width / 2 + projectile.radius - dx;
            const overlapY = this.height / 2 + projectile.radius - dy;

            // Apply force to block
            this.vx += projectile.vx * 0.3;
            this.vy += projectile.vy * 0.3;
            this.angularVel += (projectile.vx * 0.01) * Math.sign(projectile.y - this.y);

            // Bounce projectile
            if (overlapX < overlapY) {
                projectile.vx *= -0.5;
            } else {
                projectile.vy *= -0.5;
            }

            // Damage block
            this.health--;
            if (this.health <= 0) {
                this.destroyed = true;
                score += this.type === 'wood' ? 50 : this.type === 'stone' ? 100 : 25;
                updateStats();
            }

            return true;
        }
        return false;
    }
}

class Target {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.destroyed = false;
        this.vx = 0;
        this.vy = 0;
    }

    update() {
        if (this.destroyed) return;

        this.vy += gravity * 0.3;
        this.x += this.vx;
        this.y += this.vy;

        if (this.y + this.radius > height - 50) {
            this.y = height - 50 - this.radius;
            this.vy = 0;
            this.vx *= 0.9;
        }
    }

    draw() {
        if (this.destroyed) return;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(this.x + 2, this.y + 2, this.radius, this.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Target (pig-like)
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3, this.y - this.radius * 0.3, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, '#90ee90');
        gradient.addColorStop(0.7, '#32cd32');
        gradient.addColorStop(1, '#228b22');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Face
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x - 5, this.y - 3, 5, 0, Math.PI * 2);
        ctx.arc(this.x + 5, this.y - 3, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x - 5, this.y - 3, 2, 0, Math.PI * 2);
        ctx.arc(this.x + 5, this.y - 3, 2, 0, Math.PI * 2);
        ctx.fill();

        // Snout
        ctx.fillStyle = '#3cb371';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + 5, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#228b22';
        ctx.beginPath();
        ctx.arc(this.x - 3, this.y + 5, 2, 0, Math.PI * 2);
        ctx.arc(this.x + 3, this.y + 5, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    checkCollision(obj) {
        if (this.destroyed) return false;

        const dx = obj.x - this.x;
        const dy = obj.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = obj.radius + this.radius;

        if (dist < minDist) {
            this.destroyed = true;
            score += 200;
            updateStats();
            return true;
        }
        return false;
    }
}

function drawSlingshot() {
    // Back band
    if (isDragging && projectile) {
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(slingshotX - 20, slingshotY - 60);
        ctx.lineTo(dragX, dragY);
        ctx.stroke();
    }

    // Post shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(slingshotX - 12, slingshotY - 85, 30, 100);

    // Main post
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(slingshotX - 10, slingshotY - 80, 20, 90);

    // Y-frame
    ctx.fillStyle = '#a0522d';
    ctx.beginPath();
    ctx.moveTo(slingshotX, slingshotY - 80);
    ctx.lineTo(slingshotX - 25, slingshotY - 110);
    ctx.lineTo(slingshotX - 20, slingshotY - 115);
    ctx.lineTo(slingshotX, slingshotY - 90);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(slingshotX, slingshotY - 80);
    ctx.lineTo(slingshotX + 25, slingshotY - 110);
    ctx.lineTo(slingshotX + 20, slingshotY - 115);
    ctx.lineTo(slingshotX, slingshotY - 90);
    ctx.closePath();
    ctx.fill();

    // Front band
    if (isDragging && projectile) {
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(slingshotX + 20, slingshotY - 60);
        ctx.lineTo(dragX, dragY);
        ctx.stroke();

        // Draw projectile in sling
        projectile.x = dragX;
        projectile.y = dragY;
        projectile.draw();

        // Power indicator
        const pull = Math.sqrt(Math.pow(dragX - slingshotX, 2) + Math.pow(dragY - slingshotY + 60, 2));
        const power = Math.min(pull / maxPull, 1);

        ctx.fillStyle = `rgba(255, ${255 - power * 255}, 0, 0.8)`;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(power * 100)}%`, dragX, dragY - 30);
    } else {
        // Resting band
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(slingshotX - 20, slingshotY - 60);
        ctx.quadraticCurveTo(slingshotX, slingshotY - 40, slingshotX + 20, slingshotY - 60);
        ctx.stroke();
    }
}

function drawGround() {
    // Grass
    ctx.fillStyle = '#228b22';
    ctx.fillRect(0, height - 50, width, 50);

    // Grass texture
    ctx.strokeStyle = '#1a6b1a';
    ctx.lineWidth = 2;
    for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, height - 50);
        ctx.lineTo(x + 5, height - 55 - Math.random() * 10);
        ctx.stroke();
    }
}

function createLevel() {
    blocks = [];
    targets = [];

    const baseX = width * 0.65;
    const groundY = height - 50;

    // Tower structure
    // Base blocks
    blocks.push(new Block(baseX - 40, groundY - 20, 30, 40, 'wood'));
    blocks.push(new Block(baseX + 40, groundY - 20, 30, 40, 'wood'));

    // Platform
    blocks.push(new Block(baseX, groundY - 50, 120, 15, 'wood'));

    // Second level
    blocks.push(new Block(baseX - 30, groundY - 75, 25, 35, 'wood'));
    blocks.push(new Block(baseX + 30, groundY - 75, 25, 35, 'wood'));

    // Top platform
    blocks.push(new Block(baseX, groundY - 100, 80, 12, 'stone'));

    // Target on top
    targets.push(new Target(baseX, groundY - 130));

    // Side target
    targets.push(new Target(baseX + 100, groundY - 20));

    updateStats();
}

function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('shots').textContent = shots;
    document.getElementById('targets').textContent = targets.filter(t => !t.destroyed).length;
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    slingshotX = width * 0.15;
    slingshotY = height - 50;
    createLevel();
}

function animate() {
    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height - 50);
    skyGradient.addColorStop(0, '#87ceeb');
    skyGradient.addColorStop(1, '#e0f0ff');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height - 50);

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(width * 0.3, 80, 30, 0, Math.PI * 2);
    ctx.arc(width * 0.35, 70, 40, 0, Math.PI * 2);
    ctx.arc(width * 0.4, 85, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(width * 0.7, 120, 35, 0, Math.PI * 2);
    ctx.arc(width * 0.75, 110, 45, 0, Math.PI * 2);
    ctx.arc(width * 0.82, 125, 30, 0, Math.PI * 2);
    ctx.fill();

    drawGround();

    // Update and draw blocks
    for (const block of blocks) {
        block.update();
        block.draw();
    }

    // Update and draw targets
    for (const target of targets) {
        target.update();
        target.draw();
    }

    // Update and draw projectiles
    for (const proj of projectiles) {
        proj.update();

        // Check collisions with blocks
        for (const block of blocks) {
            block.checkCollision(proj);
        }

        // Check collisions with targets
        for (const target of targets) {
            target.checkCollision(proj);
        }

        proj.draw();
    }

    // Remove inactive projectiles
    projectiles = projectiles.filter(p => p.active || p.y < height);

    drawSlingshot();

    requestAnimationFrame(animate);
}

// Event listeners
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking near slingshot
    const dx = x - slingshotX;
    const dy = y - (slingshotY - 60);
    if (Math.sqrt(dx * dx + dy * dy) < 50) {
        isDragging = true;
        projectile = new Projectile(slingshotX, slingshotY - 60, 0, 0);
        dragX = x;
        dragY = y;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Limit pull distance
    const dx = x - slingshotX;
    const dy = y - (slingshotY - 60);
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > maxPull) {
        x = slingshotX + (dx / dist) * maxPull;
        y = slingshotY - 60 + (dy / dist) * maxPull;
    }

    // Only allow pulling back (left)
    if (x > slingshotX) {
        x = slingshotX;
    }

    dragX = x;
    dragY = y;
});

canvas.addEventListener('mouseup', () => {
    if (!isDragging || !projectile) return;

    // Calculate launch velocity
    const dx = slingshotX - dragX;
    const dy = (slingshotY - 60) - dragY;
    const power = Math.sqrt(dx * dx + dy * dy) / maxPull;

    projectile.vx = dx * 0.15 * powerMultiplier;
    projectile.vy = dy * 0.15 * powerMultiplier;
    projectile.x = slingshotX;
    projectile.y = slingshotY - 60;

    projectiles.push(projectile);
    shots++;
    updateStats();

    isDragging = false;
    projectile = null;
});

// Touch support
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const dx = x - slingshotX;
    const dy = y - (slingshotY - 60);
    if (Math.sqrt(dx * dx + dy * dy) < 80) {
        isDragging = true;
        projectile = new Projectile(slingshotX, slingshotY - 60, 0, 0);
        dragX = x;
        dragY = y;
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDragging) return;

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    let x = touch.clientX - rect.left;
    let y = touch.clientY - rect.top;

    const dx = x - slingshotX;
    const dy = y - (slingshotY - 60);
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > maxPull) {
        x = slingshotX + (dx / dist) * maxPull;
        y = slingshotY - 60 + (dy / dist) * maxPull;
    }

    if (x > slingshotX) x = slingshotX;

    dragX = x;
    dragY = y;
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (!isDragging || !projectile) return;

    const dx = slingshotX - dragX;
    const dy = (slingshotY - 60) - dragY;

    projectile.vx = dx * 0.15 * powerMultiplier;
    projectile.vy = dy * 0.15 * powerMultiplier;
    projectile.x = slingshotX;
    projectile.y = slingshotY - 60;

    projectiles.push(projectile);
    shots++;
    updateStats();

    isDragging = false;
    projectile = null;
});

// Control listeners
document.getElementById('powerSlider').addEventListener('input', (e) => {
    powerMultiplier = parseFloat(e.target.value);
    document.getElementById('powerValue').textContent = powerMultiplier.toFixed(1);
});

document.getElementById('gravitySlider').addEventListener('input', (e) => {
    gravity = parseFloat(e.target.value);
    document.getElementById('gravityValue').textContent = gravity.toFixed(2);
});

document.getElementById('resetBtn').addEventListener('click', () => {
    projectiles = [];
    shots = 0;
    score = 0;
    createLevel();
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
