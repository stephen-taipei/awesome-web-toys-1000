const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height, centerX, centerY;
let timeSpeed = 1;
let zoom = 1;
let showOrbits = true;
let showLabels = true;
let realisticSize = false;
let time = 0;
let selectedPlanet = null;

// Drag controls
let isDragging = false;
let offsetX = 0;
let offsetY = 0;
let dragStartX, dragStartY;
let startOffsetX, startOffsetY;

// UI elements
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const zoomSlider = document.getElementById('zoomSlider');
const zoomValue = document.getElementById('zoomValue');
const showOrbitsCheckbox = document.getElementById('showOrbits');
const showLabelsCheckbox = document.getElementById('showLabels');
const realisticSizeCheckbox = document.getElementById('realisticSize');
const resetBtn = document.getElementById('resetBtn');
const infoPanel = document.getElementById('infoPanel');
const planetNameEl = document.getElementById('planetName');
const planetDiameterEl = document.getElementById('planetDiameter');
const planetPeriodEl = document.getElementById('planetPeriod');
const planetDistanceEl = document.getElementById('planetDistance');

// Planet data (simplified, not to scale)
const planets = [
    {
        name: '水星 Mercury',
        color: '#b5b5b5',
        orbitRadius: 60,
        size: 4,
        realSize: 2,
        period: 0.24,
        diameter: '4,879 km',
        orbitalPeriod: '88 天',
        distance: '5,790 萬 km'
    },
    {
        name: '金星 Venus',
        color: '#e6c87a',
        orbitRadius: 90,
        size: 8,
        realSize: 5,
        period: 0.62,
        diameter: '12,104 km',
        orbitalPeriod: '225 天',
        distance: '1.082 億 km'
    },
    {
        name: '地球 Earth',
        color: '#6b93d6',
        orbitRadius: 120,
        size: 9,
        realSize: 5,
        period: 1,
        diameter: '12,742 km',
        orbitalPeriod: '365 天',
        distance: '1.496 億 km',
        hasMoon: true
    },
    {
        name: '火星 Mars',
        color: '#c1440e',
        orbitRadius: 160,
        size: 6,
        realSize: 3,
        period: 1.88,
        diameter: '6,779 km',
        orbitalPeriod: '687 天',
        distance: '2.279 億 km'
    },
    {
        name: '木星 Jupiter',
        color: '#d8ca9d',
        orbitRadius: 220,
        size: 20,
        realSize: 11,
        period: 11.86,
        diameter: '139,820 km',
        orbitalPeriod: '12 年',
        distance: '7.786 億 km',
        hasRings: false,
        bands: true
    },
    {
        name: '土星 Saturn',
        color: '#f4d59e',
        orbitRadius: 290,
        size: 17,
        realSize: 9,
        period: 29.46,
        diameter: '116,460 km',
        orbitalPeriod: '29 年',
        distance: '14.34 億 km',
        hasRings: true
    },
    {
        name: '天王星 Uranus',
        color: '#d1e7e7',
        orbitRadius: 350,
        size: 12,
        realSize: 4,
        period: 84.01,
        diameter: '50,724 km',
        orbitalPeriod: '84 年',
        distance: '28.71 億 km'
    },
    {
        name: '海王星 Neptune',
        color: '#5b5ddf',
        orbitRadius: 400,
        size: 11,
        realSize: 4,
        period: 164.8,
        diameter: '49,244 km',
        orbitalPeriod: '165 年',
        distance: '44.98 億 km'
    }
];

// Stars
let stars = [];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    centerX = width / 2;
    centerY = height / 2;
    generateStars();
}

function generateStars() {
    stars = [];
    for (let i = 0; i < 300; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 1.5 + 0.5,
            brightness: Math.random() * 0.5 + 0.5
        });
    }
}

function drawStars() {
    for (const star of stars) {
        const flicker = 0.7 + Math.sin(time * 0.5 + star.brightness * 10) * 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * flicker})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawSun() {
    const x = centerX + offsetX;
    const y = centerY + offsetY;
    const sunRadius = 35 * zoom;

    // Outer glow
    const gradient = ctx.createRadialGradient(x, y, sunRadius * 0.5, x, y, sunRadius * 3);
    gradient.addColorStop(0, 'rgba(255, 200, 50, 0.8)');
    gradient.addColorStop(0.3, 'rgba(255, 150, 0, 0.4)');
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, sunRadius * 3, 0, Math.PI * 2);
    ctx.fill();

    // Sun surface
    const surfaceGradient = ctx.createRadialGradient(x, y, 0, x, y, sunRadius);
    surfaceGradient.addColorStop(0, '#fff');
    surfaceGradient.addColorStop(0.3, '#ffd700');
    surfaceGradient.addColorStop(0.7, '#ff8c00');
    surfaceGradient.addColorStop(1, '#ff4500');

    ctx.fillStyle = surfaceGradient;
    ctx.beginPath();
    ctx.arc(x, y, sunRadius, 0, Math.PI * 2);
    ctx.fill();

    // Corona effect
    ctx.strokeStyle = 'rgba(255, 200, 100, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + time * 0.1;
        const length = sunRadius * (1.2 + Math.sin(time * 2 + i) * 0.2);
        ctx.beginPath();
        ctx.moveTo(
            x + Math.cos(angle) * sunRadius,
            y + Math.sin(angle) * sunRadius
        );
        ctx.lineTo(
            x + Math.cos(angle) * length,
            y + Math.sin(angle) * length
        );
        ctx.stroke();
    }
}

function drawOrbit(planet) {
    const x = centerX + offsetX;
    const y = centerY + offsetY;
    const radius = planet.orbitRadius * zoom;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
}

function getPlanetPosition(planet) {
    const angle = (time / planet.period) * Math.PI * 2;
    const radius = planet.orbitRadius * zoom;
    const x = centerX + offsetX + Math.cos(angle) * radius;
    const y = centerY + offsetY + Math.sin(angle) * radius;
    return { x, y, angle };
}

function drawPlanet(planet) {
    const pos = getPlanetPosition(planet);
    const size = (realisticSize ? planet.realSize : planet.size) * zoom;

    // Store position for click detection
    planet.currentX = pos.x;
    planet.currentY = pos.y;
    planet.currentSize = size;

    // Draw Saturn's rings first (behind the planet)
    if (planet.hasRings) {
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.scale(1, 0.4);

        ctx.strokeStyle = 'rgba(210, 180, 140, 0.6)';
        ctx.lineWidth = 4 * zoom;
        ctx.beginPath();
        ctx.arc(0, 0, size * 1.8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(180, 150, 120, 0.4)';
        ctx.lineWidth = 3 * zoom;
        ctx.beginPath();
        ctx.arc(0, 0, size * 2.2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    // Planet body
    const gradient = ctx.createRadialGradient(
        pos.x - size * 0.3, pos.y - size * 0.3, 0,
        pos.x, pos.y, size
    );
    gradient.addColorStop(0, lightenColor(planet.color, 30));
    gradient.addColorStop(1, planet.color);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
    ctx.fill();

    // Jupiter bands
    if (planet.bands) {
        ctx.save();
        ctx.clip();
        ctx.strokeStyle = 'rgba(139, 90, 43, 0.4)';
        ctx.lineWidth = 2;
        for (let i = -3; i <= 3; i++) {
            if (i === 0) continue;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y + i * size * 0.2, size, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }

    // Earth's moon
    if (planet.hasMoon) {
        const moonAngle = time * 12;
        const moonDist = size * 2.5;
        const moonX = pos.x + Math.cos(moonAngle) * moonDist;
        const moonY = pos.y + Math.sin(moonAngle) * moonDist;
        const moonSize = size * 0.25;

        ctx.fillStyle = '#ccc';
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonSize, 0, Math.PI * 2);
        ctx.fill();
    }

    // Label
    if (showLabels) {
        ctx.fillStyle = '#fff';
        ctx.font = `${10 * zoom}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(planet.name, pos.x, pos.y + size + 15 * zoom);
    }

    // Highlight selected planet
    if (selectedPlanet === planet) {
        ctx.strokeStyle = '#ffa500';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size + 5, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `rgb(${R}, ${G}, ${B})`;
}

function showPlanetInfo(planet) {
    selectedPlanet = planet;
    planetNameEl.textContent = planet.name;
    planetDiameterEl.textContent = planet.diameter;
    planetPeriodEl.textContent = planet.orbitalPeriod;
    planetDistanceEl.textContent = planet.distance;
    infoPanel.style.display = 'block';
}

function hidePlanetInfo() {
    selectedPlanet = null;
    infoPanel.style.display = 'none';
}

function animate() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    drawStars();

    // Draw orbits
    if (showOrbits) {
        for (const planet of planets) {
            drawOrbit(planet);
        }
    }

    drawSun();

    // Draw planets
    for (const planet of planets) {
        drawPlanet(planet);
    }

    time += 0.01 * timeSpeed;

    requestAnimationFrame(animate);
}

// Event listeners
speedSlider.addEventListener('input', () => {
    timeSpeed = parseFloat(speedSlider.value);
    speedValue.textContent = timeSpeed + 'x';
});

zoomSlider.addEventListener('input', () => {
    zoom = parseFloat(zoomSlider.value);
    zoomValue.textContent = zoom.toFixed(1) + 'x';
});

showOrbitsCheckbox.addEventListener('change', () => {
    showOrbits = showOrbitsCheckbox.checked;
});

showLabelsCheckbox.addEventListener('change', () => {
    showLabels = showLabelsCheckbox.checked;
});

realisticSizeCheckbox.addEventListener('change', () => {
    realisticSize = realisticSizeCheckbox.checked;
});

resetBtn.addEventListener('click', () => {
    offsetX = 0;
    offsetY = 0;
    zoom = 1;
    zoomSlider.value = 1;
    zoomValue.textContent = '1x';
    hidePlanetInfo();
});

// Drag to pan
canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    startOffsetX = offsetX;
    startOffsetY = offsetY;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        offsetX = startOffsetX + (e.clientX - dragStartX);
        offsetY = startOffsetY + (e.clientY - dragStartY);
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
});

// Click to select planet
canvas.addEventListener('click', (e) => {
    if (Math.abs(e.clientX - dragStartX) > 5 || Math.abs(e.clientY - dragStartY) > 5) {
        return; // Was dragging, not clicking
    }

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let clicked = false;

    for (const planet of planets) {
        if (planet.currentX && planet.currentY) {
            const dx = x - planet.currentX;
            const dy = y - planet.currentY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < planet.currentSize + 10) {
                showPlanetInfo(planet);
                clicked = true;
                break;
            }
        }
    }

    if (!clicked) {
        hidePlanetInfo();
    }
});

// Scroll to zoom
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    zoom = Math.max(0.5, Math.min(3, zoom + delta));
    zoomSlider.value = zoom;
    zoomValue.textContent = zoom.toFixed(1) + 'x';
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
