const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let gameOver = false;
let landed = false;

// Lander properties
const lander = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    angle: 0,
    fuel: 100,
    width: 30,
    height: 40,
    thrustMain: false,
    thrustLeft: false,
    thrustRight: false
};

// Physics constants
const GRAVITY = 0.02;
const THRUST_POWER = 0.08;
const SIDE_THRUST = 0.03;
const FUEL_CONSUMPTION = 0.15;
const SAFE_LANDING_SPEED = 2;
const SAFE_LANDING_ANGLE = 15;

// Terrain
let terrain = [];
let landingPad = { x: 0, width: 80 };

// Stars
let stars = [];

// UI elements
const altitudeEl = document.getElementById('altitude');
const velocityEl = document.getElementById('velocity');
const hVelocityEl = document.getElementById('hVelocity');
const fuelBar = document.getElementById('fuelBar');
const fuelPercent = document.getElementById('fuelPercent');
const messageEl = document.getElementById('message');
const restartBtn = document.getElementById('restartBtn');

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    generateTerrain();
    generateStars();
    resetGame();
}

function generateStars() {
    stars = [];
    for (let i = 0; i < 200; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height * 0.7,
            size: Math.random() * 2 + 0.5,
            brightness: Math.random()
        });
    }
}

function generateTerrain() {
    terrain = [];
    const segments = 40;
    const segmentWidth = width / segments;

    // Landing pad position
    landingPad.x = width * 0.3 + Math.random() * width * 0.4;

    let y = height - 100;

    for (let i = 0; i <= segments; i++) {
        const x = i * segmentWidth;

        // Flat landing pad area
        if (Math.abs(x - landingPad.x) < landingPad.width / 2) {
            terrain.push({ x, y: height - 50 });
        } else {
            // Random terrain
            y = height - 50 - Math.random() * 100 - 30;
            terrain.push({ x, y });
        }
    }
}

function resetGame() {
    lander.x = width * 0.2 + Math.random() * width * 0.6;
    lander.y = 100;
    lander.vx = (Math.random() - 0.5) * 2;
    lander.vy = 0;
    lander.angle = 0;
    lander.fuel = 100;
    lander.thrustMain = false;
    lander.thrustLeft = false;
    lander.thrustRight = false;

    gameOver = false;
    landed = false;

    messageEl.textContent = '';
    messageEl.className = 'message';
    restartBtn.style.display = 'none';

    generateTerrain();
}

function getTerrainHeight(x) {
    for (let i = 0; i < terrain.length - 1; i++) {
        if (x >= terrain[i].x && x <= terrain[i + 1].x) {
            const t = (x - terrain[i].x) / (terrain[i + 1].x - terrain[i].x);
            return terrain[i].y + t * (terrain[i + 1].y - terrain[i].y);
        }
    }
    return height - 50;
}

function update() {
    if (gameOver) return;

    // Apply gravity
    lander.vy += GRAVITY;

    // Apply thrust
    if (lander.fuel > 0) {
        if (lander.thrustMain) {
            lander.vy -= THRUST_POWER;
            lander.fuel -= FUEL_CONSUMPTION;
        }
        if (lander.thrustLeft) {
            lander.vx += SIDE_THRUST;
            lander.fuel -= FUEL_CONSUMPTION * 0.5;
        }
        if (lander.thrustRight) {
            lander.vx -= SIDE_THRUST;
            lander.fuel -= FUEL_CONSUMPTION * 0.5;
        }
    }

    lander.fuel = Math.max(0, lander.fuel);

    // Update position
    lander.x += lander.vx;
    lander.y += lander.vy;

    // Wrap horizontally
    if (lander.x < 0) lander.x = width;
    if (lander.x > width) lander.x = 0;

    // Check collision with terrain
    const terrainY = getTerrainHeight(lander.x);
    const landerBottom = lander.y + lander.height / 2;

    if (landerBottom >= terrainY) {
        gameOver = true;

        const speed = Math.sqrt(lander.vx * lander.vx + lander.vy * lander.vy);
        const onPad = Math.abs(lander.x - landingPad.x) < landingPad.width / 2;

        if (speed < SAFE_LANDING_SPEED && onPad && Math.abs(lander.vy) < 2) {
            landed = true;
            messageEl.textContent = '成功著陸！';
            messageEl.className = 'message success';
        } else {
            messageEl.textContent = '墜毀！';
            messageEl.className = 'message failure';
        }

        restartBtn.style.display = 'block';
    }
}

function drawStars() {
    for (const star of stars) {
        const flicker = 0.5 + Math.sin(Date.now() * 0.003 + star.brightness * 10) * 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * flicker})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawTerrain() {
    // Moon surface
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(0, height);

    for (const point of terrain) {
        ctx.lineTo(point.x, point.y);
    }

    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // Surface texture
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < terrain.length - 1; i++) {
        ctx.moveTo(terrain[i].x, terrain[i].y);
        ctx.lineTo(terrain[i + 1].x, terrain[i + 1].y);
    }
    ctx.stroke();

    // Landing pad
    ctx.fillStyle = '#0f0';
    ctx.fillRect(landingPad.x - landingPad.width / 2, height - 52, landingPad.width, 4);

    // Landing pad lights
    const lightOn = Math.floor(Date.now() / 500) % 2 === 0;
    ctx.fillStyle = lightOn ? '#0f0' : '#030';
    ctx.beginPath();
    ctx.arc(landingPad.x - landingPad.width / 2 + 5, height - 55, 3, 0, Math.PI * 2);
    ctx.arc(landingPad.x + landingPad.width / 2 - 5, height - 55, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawLander() {
    ctx.save();
    ctx.translate(lander.x, lander.y);

    // Draw thrust flames
    if (lander.thrustMain && lander.fuel > 0) {
        const flameLength = 20 + Math.random() * 15;
        const gradient = ctx.createLinearGradient(0, lander.height / 2, 0, lander.height / 2 + flameLength);
        gradient.addColorStop(0, '#ff0');
        gradient.addColorStop(0.5, '#f80');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(-8, lander.height / 2);
        ctx.lineTo(8, lander.height / 2);
        ctx.lineTo(2, lander.height / 2 + flameLength);
        ctx.lineTo(-2, lander.height / 2 + flameLength);
        ctx.closePath();
        ctx.fill();
    }

    if (lander.thrustLeft && lander.fuel > 0) {
        ctx.fillStyle = '#ff0';
        ctx.beginPath();
        ctx.moveTo(lander.width / 2, -5);
        ctx.lineTo(lander.width / 2 + 10 + Math.random() * 5, 0);
        ctx.lineTo(lander.width / 2, 5);
        ctx.closePath();
        ctx.fill();
    }

    if (lander.thrustRight && lander.fuel > 0) {
        ctx.fillStyle = '#ff0';
        ctx.beginPath();
        ctx.moveTo(-lander.width / 2, -5);
        ctx.lineTo(-lander.width / 2 - 10 - Math.random() * 5, 0);
        ctx.lineTo(-lander.width / 2, 5);
        ctx.closePath();
        ctx.fill();
    }

    // Lander body
    if (gameOver && !landed) {
        // Explosion
        const t = Date.now() * 0.01;
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2 + t;
            const dist = 20 + Math.sin(t * 3 + i) * 10;
            ctx.fillStyle = `hsl(${30 + Math.random() * 30}, 100%, 50%)`;
            ctx.beginPath();
            ctx.arc(
                Math.cos(angle) * dist,
                Math.sin(angle) * dist,
                5 + Math.random() * 5,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    } else {
        // Body
        ctx.fillStyle = '#aaa';
        ctx.beginPath();
        ctx.moveTo(0, -lander.height / 2);
        ctx.lineTo(lander.width / 2, lander.height / 4);
        ctx.lineTo(lander.width / 2, lander.height / 2);
        ctx.lineTo(-lander.width / 2, lander.height / 2);
        ctx.lineTo(-lander.width / 2, lander.height / 4);
        ctx.closePath();
        ctx.fill();

        // Cockpit
        ctx.fillStyle = '#4af';
        ctx.beginPath();
        ctx.arc(0, -lander.height / 4, 8, 0, Math.PI * 2);
        ctx.fill();

        // Legs
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-lander.width / 2, lander.height / 2);
        ctx.lineTo(-lander.width / 2 - 8, lander.height / 2 + 10);
        ctx.moveTo(lander.width / 2, lander.height / 2);
        ctx.lineTo(lander.width / 2 + 8, lander.height / 2 + 10);
        ctx.stroke();

        // Feet
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.arc(-lander.width / 2 - 8, lander.height / 2 + 12, 4, 0, Math.PI * 2);
        ctx.arc(lander.width / 2 + 8, lander.height / 2 + 12, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function updateHUD() {
    const altitude = Math.max(0, Math.round(getTerrainHeight(lander.x) - lander.y - lander.height / 2));
    const velocity = Math.round(lander.vy * 10);
    const hVelocity = Math.round(lander.vx * 10);

    altitudeEl.textContent = altitude;
    velocityEl.textContent = velocity;
    hVelocityEl.textContent = hVelocity;

    // Color coding for velocity
    if (Math.abs(velocity) > 20) {
        velocityEl.className = 'value danger';
    } else if (Math.abs(velocity) > 15) {
        velocityEl.className = 'value warning';
    } else {
        velocityEl.className = 'value';
    }

    // Fuel
    fuelBar.style.width = lander.fuel + '%';
    fuelPercent.textContent = Math.round(lander.fuel) + '%';

    if (lander.fuel < 20) {
        fuelBar.style.background = '#f00';
    } else if (lander.fuel < 40) {
        fuelBar.style.background = '#ff0';
    } else {
        fuelBar.style.background = 'linear-gradient(90deg, #0f0, #0a0)';
    }
}

function animate() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    drawStars();
    drawTerrain();
    update();
    drawLander();
    updateHUD();

    requestAnimationFrame(animate);
}

// Keyboard controls
const keys = {};

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        lander.thrustMain = true;
        e.preventDefault();
    }
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        lander.thrustRight = true;
        e.preventDefault();
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        lander.thrustLeft = true;
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        lander.thrustMain = false;
    }
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        lander.thrustRight = false;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        lander.thrustLeft = false;
    }
});

restartBtn.addEventListener('click', resetGame);

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
