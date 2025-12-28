const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const timeSlider = document.getElementById('timeSlider');
const timeLabel = document.getElementById('timeLabel');
const infoEl = document.getElementById('info');

let timeOfDay = 12; // 0-24 hours
const groundY = canvas.height * 0.7;

// Buildings
const buildings = [
    { x: 30, width: 50, height: 120 },
    { x: 90, width: 40, height: 80 },
    { x: 140, width: 60, height: 150 },
    { x: 210, width: 45, height: 100 },
    { x: 265, width: 55, height: 130 },
    { x: 330, width: 35, height: 90 }
];

// Trees
const trees = [
    { x: 180, size: 25 },
    { x: 320, size: 20 }
];

function getSunPosition() {
    // Sun arc from left to right
    const angle = ((timeOfDay - 6) / 12) * Math.PI; // 6am to 6pm
    const radius = canvas.width * 0.4;
    const centerX = canvas.width / 2;
    const centerY = groundY;

    return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY - Math.sin(angle) * radius,
        visible: timeOfDay >= 5 && timeOfDay <= 19
    };
}

function getSkyColors() {
    if (timeOfDay < 5 || timeOfDay > 20) {
        // Night
        return ['#0a0a20', '#1a1a3e'];
    } else if (timeOfDay < 7) {
        // Dawn
        const t = (timeOfDay - 5) / 2;
        return [
            `rgb(${Math.floor(30 + 100 * t)}, ${Math.floor(30 + 50 * t)}, ${Math.floor(60 + 40 * t)})`,
            `rgb(${Math.floor(100 + 155 * t)}, ${Math.floor(50 + 100 * t)}, ${Math.floor(100 + 50 * t)})`
        ];
    } else if (timeOfDay < 17) {
        // Day
        return ['#4a90d9', '#87ceeb'];
    } else if (timeOfDay < 20) {
        // Dusk
        const t = (timeOfDay - 17) / 3;
        return [
            `rgb(${Math.floor(74 + 100 * t)}, ${Math.floor(144 - 100 * t)}, ${Math.floor(217 - 150 * t)})`,
            `rgb(${Math.floor(255 - 100 * t)}, ${Math.floor(180 - 80 * t)}, ${Math.floor(100 + 50 * t)})`
        ];
    }
    return ['#1a1a3e', '#2a2a4e'];
}

function getSunColor() {
    if (timeOfDay < 7 || timeOfDay > 18) {
        return '#ff6b4a'; // Orange during sunrise/sunset
    }
    return '#fff5c0'; // Yellow during day
}

function getAmbientLight() {
    if (timeOfDay < 5 || timeOfDay > 20) return 0.1;
    if (timeOfDay < 7) return 0.1 + (timeOfDay - 5) / 2 * 0.6;
    if (timeOfDay > 18) return 0.7 - (timeOfDay - 18) / 2 * 0.6;
    return 0.7 + Math.sin((timeOfDay - 7) / 10 * Math.PI) * 0.3;
}

function drawSky() {
    const colors = getSkyColors();
    const gradient = ctx.createLinearGradient(0, 0, 0, groundY);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, groundY);
}

function drawStars() {
    if (timeOfDay > 5 && timeOfDay < 20) return;

    const starOpacity = timeOfDay < 5 ? 1 : (timeOfDay > 20 ? (timeOfDay - 20) / 4 : 0);

    for (let i = 0; i < 50; i++) {
        const x = (i * 73 + 13) % canvas.width;
        const y = (i * 37 + 7) % (groundY - 30);
        const size = (i % 3) + 1;
        const twinkle = 0.5 + 0.5 * Math.sin(Date.now() / 500 + i);

        ctx.beginPath();
        ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${starOpacity * twinkle * 0.8})`;
        ctx.fill();
    }
}

function drawSun() {
    const sun = getSunPosition();
    if (!sun.visible || sun.y > groundY) return;

    const sunColor = getSunColor();
    const size = 25;

    // Glow
    const gradient = ctx.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, size * 3);
    gradient.addColorStop(0, sunColor);
    gradient.addColorStop(0.3, `${sunColor}80`);
    gradient.addColorStop(1, `${sunColor}00`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, size * 3, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, size, 0, Math.PI * 2);
    ctx.fillStyle = sunColor;
    ctx.fill();
}

function drawMoon() {
    if (timeOfDay > 5 && timeOfDay < 19) return;

    const moonAngle = ((timeOfDay + 12) % 24 - 6) / 12 * Math.PI;
    const radius = canvas.width * 0.35;
    const moonX = canvas.width / 2 + Math.cos(moonAngle) * radius;
    const moonY = groundY - Math.sin(moonAngle) * radius;

    if (moonY > groundY) return;

    // Moon glow
    const gradient = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 40);
    gradient.addColorStop(0, 'rgba(200, 220, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(150, 180, 220, 0.2)');
    gradient.addColorStop(1, 'rgba(100, 150, 200, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 40, 0, Math.PI * 2);
    ctx.fill();

    // Moon
    ctx.beginPath();
    ctx.arc(moonX, moonY, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#e8e8f0';
    ctx.fill();
}

function drawGround() {
    const ambient = getAmbientLight();
    const green = Math.floor(80 + ambient * 80);
    ctx.fillStyle = `rgb(${Math.floor(30 + ambient * 30)}, ${green}, ${Math.floor(20 + ambient * 30)})`;
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
}

function drawBuilding(building) {
    const sun = getSunPosition();
    const ambient = getAmbientLight();

    // Building shadow
    if (sun.visible && sun.y < groundY) {
        const shadowLength = (groundY - sun.y) > 0 ? (building.height * 0.5 * (groundY - building.height / 2) / (groundY - sun.y)) : 0;
        const shadowDir = sun.x < building.x + building.width / 2 ? 1 : -1;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.moveTo(building.x, groundY);
        ctx.lineTo(building.x + building.width, groundY);
        ctx.lineTo(building.x + building.width + shadowLength * shadowDir, groundY);
        ctx.lineTo(building.x + shadowLength * shadowDir, groundY);
        ctx.closePath();
        ctx.fill();
    }

    // Building
    const brightness = Math.floor(60 + ambient * 60);
    ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness + 10})`;
    ctx.fillRect(building.x, groundY - building.height, building.width, building.height);

    // Windows
    const windowLight = timeOfDay < 6 || timeOfDay > 19 ? 0.8 : 0;
    for (let row = 0; row < Math.floor(building.height / 20); row++) {
        for (let col = 0; col < Math.floor(building.width / 15); col++) {
            const wx = building.x + 5 + col * 15;
            const wy = groundY - building.height + 10 + row * 20;
            const lit = Math.random() > 0.3;
            ctx.fillStyle = windowLight > 0 && lit ?
                `rgba(255, 230, 150, ${windowLight})` :
                `rgba(100, 150, 200, 0.3)`;
            ctx.fillRect(wx, wy, 8, 12);
        }
    }
}

function draw() {
    drawSky();
    drawStars();
    drawMoon();
    drawSun();
    drawGround();

    buildings.forEach(b => drawBuilding(b));

    // Time display
    const hours = Math.floor(timeOfDay);
    const minutes = Math.floor((timeOfDay % 1) * 60);
    timeLabel.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    requestAnimationFrame(draw);
}

timeSlider.addEventListener('input', (e) => {
    timeOfDay = parseFloat(e.target.value);

    let period = '';
    if (timeOfDay < 5) period = '深夜';
    else if (timeOfDay < 7) period = '黎明';
    else if (timeOfDay < 12) period = '上午';
    else if (timeOfDay < 17) period = '下午';
    else if (timeOfDay < 20) period = '黃昏';
    else period = '夜晚';

    infoEl.textContent = period;
});

draw();
