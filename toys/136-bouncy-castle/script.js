const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let people = [];
let bounceMultiplier = 0.9;
let floorBounce = 0.8;
let gravity = 0.35;
let totalBounces = 0;

// Castle dimensions
let castleX, castleY, castleWidth, castleHeight;
let floorNodes = [];
const numFloorNodes = 20;

const personColors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
    '#3b82f6', '#8b5cf6', '#ec4899'
];

class Person {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = 0;
        this.radius = 12;
        this.color = personColors[Math.floor(Math.random() * personColors.length)];
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.squash = 1;
        this.bounces = 0;
    }

    update() {
        // Apply gravity
        this.vy += gravity;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Rotation based on velocity
        this.rotationSpeed = this.vx * 0.05;
        this.rotation += this.rotationSpeed;

        // Recover squash
        this.squash += (1 - this.squash) * 0.2;

        // Air resistance
        this.vx *= 0.999;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(1 / this.squash, this.squash);

        // Body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 5, this.radius * 0.8, this.radius, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#fcd34d';
        ctx.beginPath();
        ctx.arc(0, -this.radius, this.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-3, -this.radius - 2, 2, 0, Math.PI * 2);
        ctx.arc(3, -this.radius - 2, 2, 0, Math.PI * 2);
        ctx.fill();

        // Smile
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -this.radius + 2, 4, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();

        // Arms
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';

        const armWave = Math.sin(Date.now() * 0.01 + this.x) * 20;
        ctx.beginPath();
        ctx.moveTo(-this.radius * 0.6, 0);
        ctx.lineTo(-this.radius * 1.2, -10 + armWave);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.radius * 0.6, 0);
        ctx.lineTo(this.radius * 1.2, -10 - armWave);
        ctx.stroke();

        // Legs
        ctx.beginPath();
        ctx.moveTo(-4, this.radius);
        ctx.lineTo(-6, this.radius + 10);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(4, this.radius);
        ctx.lineTo(6, this.radius + 10);
        ctx.stroke();

        ctx.restore();
    }

    bounce() {
        this.vy = -Math.abs(this.vy) * bounceMultiplier;
        this.squash = 1.4;
        this.bounces++;
        totalBounces++;
        updateStats();
    }
}

class FloorNode {
    constructor(x, y) {
        this.x = x;
        this.restY = y;
        this.y = y;
        this.vy = 0;
    }

    update() {
        // Spring back to rest position
        const displacement = this.y - this.restY;
        const springForce = -0.15 * displacement;
        this.vy += springForce;
        this.vy *= 0.9; // Damping
        this.y += this.vy;
    }

    push(force) {
        this.vy += force;
    }
}

function createFloorNodes() {
    floorNodes = [];
    const spacing = castleWidth / (numFloorNodes - 1);

    for (let i = 0; i < numFloorNodes; i++) {
        floorNodes.push(new FloorNode(
            castleX + i * spacing,
            castleY + castleHeight - 30
        ));
    }
}

function propagateWaves() {
    for (let i = 1; i < floorNodes.length - 1; i++) {
        const prev = floorNodes[i - 1];
        const curr = floorNodes[i];
        const next = floorNodes[i + 1];

        const avgY = (prev.y + next.y) / 2;
        curr.vy += (avgY - curr.y) * 0.3;
    }
}

function getFloorHeight(x) {
    // Find the two nearest nodes
    const spacing = castleWidth / (numFloorNodes - 1);
    const index = (x - castleX) / spacing;
    const i = Math.floor(index);
    const t = index - i;

    if (i < 0) return floorNodes[0].y;
    if (i >= floorNodes.length - 1) return floorNodes[floorNodes.length - 1].y;

    // Linear interpolation
    return floorNodes[i].y + (floorNodes[i + 1].y - floorNodes[i].y) * t;
}

function checkFloorCollision(person) {
    // Check if inside castle bounds
    if (person.x < castleX || person.x > castleX + castleWidth) return;

    const floorY = getFloorHeight(person.x);
    const personBottom = person.y + person.radius + 10;

    if (personBottom > floorY) {
        person.y = floorY - person.radius - 10;
        person.bounce();

        // Push floor down
        const spacing = castleWidth / (numFloorNodes - 1);
        const index = Math.floor((person.x - castleX) / spacing);

        if (index >= 0 && index < floorNodes.length) {
            const force = Math.abs(person.vy) * 0.5;
            for (let i = Math.max(0, index - 2); i <= Math.min(floorNodes.length - 1, index + 2); i++) {
                const dist = Math.abs(i - index);
                floorNodes[i].push(force * (1 - dist / 3));
            }
        }
    }
}

function checkWallCollision(person) {
    // Left wall
    if (person.x - person.radius < castleX + 20 && person.y > castleY) {
        person.x = castleX + 20 + person.radius;
        person.vx = Math.abs(person.vx) * floorBounce;
    }

    // Right wall
    if (person.x + person.radius > castleX + castleWidth - 20 && person.y > castleY) {
        person.x = castleX + castleWidth - 20 - person.radius;
        person.vx = -Math.abs(person.vx) * floorBounce;
    }
}

function checkPersonCollision(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = (p1.radius + p2.radius) * 1.5;

    if (dist < minDist && dist > 0) {
        const angle = Math.atan2(dy, dx);
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);

        // Simple elastic collision
        const vx1 = p1.vx * cos + p1.vy * sin;
        const vy1 = p1.vy * cos - p1.vx * sin;
        const vx2 = p2.vx * cos + p2.vy * sin;
        const vy2 = p2.vy * cos - p2.vx * sin;

        p1.vx = vx2 * cos - vy1 * sin;
        p1.vy = vy1 * cos + vx2 * sin;
        p2.vx = vx1 * cos - vy2 * sin;
        p2.vy = vy2 * cos + vx1 * sin;

        // Separate
        const overlap = minDist - dist;
        p1.x -= (overlap / 2) * cos;
        p1.y -= (overlap / 2) * sin;
        p2.x += (overlap / 2) * cos;
        p2.y += (overlap / 2) * sin;
    }
}

function drawCastle() {
    // Main inflatable body
    const gradient = ctx.createLinearGradient(castleX, castleY, castleX, castleY + castleHeight);
    gradient.addColorStop(0, '#ec4899');
    gradient.addColorStop(0.5, '#f472b6');
    gradient.addColorStop(1, '#db2777');

    ctx.fillStyle = gradient;

    // Draw castle shape with curved top
    ctx.beginPath();
    ctx.moveTo(castleX, castleY + castleHeight);

    // Left wall
    ctx.lineTo(castleX, castleY + 50);

    // Towers
    const towerWidth = castleWidth / 5;
    for (let i = 0; i < 5; i++) {
        const tx = castleX + i * towerWidth;
        const towerHeight = i % 2 === 0 ? 60 : 40;

        ctx.lineTo(tx, castleY + (i % 2 === 0 ? 0 : 20));
        ctx.quadraticCurveTo(
            tx + towerWidth / 2, castleY - towerHeight,
            tx + towerWidth, castleY + (i % 2 === 0 ? 0 : 20)
        );
    }

    // Right wall
    ctx.lineTo(castleX + castleWidth, castleY + 50);
    ctx.lineTo(castleX + castleWidth, castleY + castleHeight);

    ctx.closePath();
    ctx.fill();

    // Draw floor surface
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.moveTo(floorNodes[0].x, floorNodes[0].y);

    for (let i = 1; i < floorNodes.length; i++) {
        ctx.lineTo(floorNodes[i].x, floorNodes[i].y);
    }

    ctx.lineTo(castleX + castleWidth, castleY + castleHeight);
    ctx.lineTo(castleX, castleY + castleHeight);
    ctx.closePath();
    ctx.fill();

    // Stitching lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);

    for (let y = castleY + 80; y < castleY + castleHeight - 50; y += 40) {
        ctx.beginPath();
        ctx.moveTo(castleX + 30, y);
        ctx.lineTo(castleX + castleWidth - 30, y);
        ctx.stroke();
    }

    ctx.setLineDash([]);

    // Entrance
    ctx.fillStyle = '#7c3aed';
    ctx.beginPath();
    ctx.moveTo(castleX + castleWidth / 2 - 40, castleY + castleHeight);
    ctx.quadraticCurveTo(
        castleX + castleWidth / 2, castleY + castleHeight - 80,
        castleX + castleWidth / 2 + 40, castleY + castleHeight
    );
    ctx.fill();

    // Decorations
    ctx.fillStyle = '#fbbf24';
    for (let i = 1; i < 5; i++) {
        const x = castleX + i * (castleWidth / 5);
        ctx.beginPath();
        ctx.arc(x, castleY + 80, 15, 0, Math.PI * 2);
        ctx.fill();
    }

    // Highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(castleX + 10, castleY + 100);
    ctx.lineTo(castleX + 10, castleY + castleHeight - 50);
    ctx.stroke();
}

function drawBackground() {
    // Sky
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.7);
    skyGradient.addColorStop(0, '#87ceeb');
    skyGradient.addColorStop(1, '#e0f0ff');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height * 0.7);

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    drawCloud(width * 0.2, 80, 1);
    drawCloud(width * 0.6, 120, 1.2);
    drawCloud(width * 0.85, 70, 0.8);

    // Ground
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(0, height * 0.7, width, height * 0.3);
}

function drawCloud(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.arc(25, -10, 25, 0, Math.PI * 2);
    ctx.arc(50, 0, 30, 0, Math.PI * 2);
    ctx.arc(25, 10, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function addPerson(x, y) {
    if (people.length < 30) {
        // Check if inside castle
        if (x > castleX && x < castleX + castleWidth && y < castleY + castleHeight - 50) {
            people.push(new Person(x, y));
            updateStats();
        }
    }
}

function updateStats() {
    document.getElementById('personCount').textContent = people.length;
    document.getElementById('totalBounces').textContent = totalBounces;
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    castleWidth = Math.min(600, width * 0.6);
    castleHeight = Math.min(400, height * 0.5);
    castleX = (width - castleWidth) / 2;
    castleY = height * 0.7 - castleHeight;

    createFloorNodes();
}

function animate() {
    drawBackground();

    // Update floor nodes
    for (const node of floorNodes) {
        node.update();
    }
    propagateWaves();

    drawCastle();

    // Update people
    for (const person of people) {
        person.update();
        checkFloorCollision(person);
        checkWallCollision(person);
    }

    // Person-person collision
    for (let i = 0; i < people.length; i++) {
        for (let j = i + 1; j < people.length; j++) {
            checkPersonCollision(people[i], people[j]);
        }
    }

    // Draw people
    for (const person of people) {
        person.draw();
    }

    // Remove people who fell out
    people = people.filter(p => p.y < height + 100);
    updateStats();

    requestAnimationFrame(animate);
}

// Event listeners
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addPerson(x, y);
});

document.getElementById('addBtn').addEventListener('click', () => {
    const x = castleX + 50 + Math.random() * (castleWidth - 100);
    const y = castleY + 50;
    addPerson(x, y);
});

document.getElementById('bounceSlider').addEventListener('input', (e) => {
    bounceMultiplier = parseFloat(e.target.value);
    document.getElementById('bounceValue').textContent = bounceMultiplier.toFixed(2);
});

document.getElementById('floorSlider').addEventListener('input', (e) => {
    floorBounce = parseFloat(e.target.value);
    document.getElementById('floorValue').textContent = floorBounce.toFixed(2);
});

document.getElementById('gravitySlider').addEventListener('input', (e) => {
    gravity = parseFloat(e.target.value);
    document.getElementById('gravityValue').textContent = gravity.toFixed(2);
});

document.getElementById('resetBtn').addEventListener('click', () => {
    people = [];
    totalBounces = 0;
    createFloorNodes();
    updateStats();
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
