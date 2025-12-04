const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let windSpeed = 5;
let waveHeight = 40;
let wavelength = 100;
let timeOfDay = 'day';
let showFoam = true;
let showReflection = true;
let time = 0;

// Foam particles
let foamParticles = [];

const colorSchemes = {
    day: {
        sky: ['#87CEEB', '#4A90D9', '#2E5984'],
        water: ['#006994', '#004466', '#002233'],
        sun: '#FFE87C',
        foam: 'rgba(255, 255, 255, 0.8)'
    },
    sunset: {
        sky: ['#FF6B35', '#F7C59F', '#2E5984'],
        water: ['#8B4513', '#4A3728', '#1A1A2E'],
        sun: '#FF4500',
        foam: 'rgba(255, 200, 150, 0.7)'
    },
    night: {
        sky: ['#0C1445', '#1A1A2E', '#000011'],
        water: ['#0A1628', '#051020', '#000008'],
        sun: '#FFFACD',
        foam: 'rgba(200, 220, 255, 0.4)'
    },
    storm: {
        sky: ['#2F4F4F', '#1C2833', '#0D1117'],
        water: ['#1C3D3D', '#0F2020', '#050A0A'],
        sun: null,
        foam: 'rgba(180, 190, 200, 0.6)'
    }
};

class FoamParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 2 + Math.random() * 4;
        this.life = 1;
        this.decay = 0.01 + Math.random() * 0.02;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = -Math.random() * 2;
    }

    update() {
        this.x += this.vx + windSpeed * 0.1;
        this.y += this.vy;
        this.vy += 0.05;
        this.life -= this.decay;
        return this.life > 0;
    }

    draw() {
        const scheme = colorSchemes[timeOfDay];
        ctx.fillStyle = scheme.foam.replace('0.8', this.life * 0.8);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fill();
    }
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

function getWaveY(x, t, layer = 0) {
    const baseY = height * 0.5;
    const freq1 = (2 * Math.PI) / wavelength;
    const freq2 = (2 * Math.PI) / (wavelength * 0.5);
    const freq3 = (2 * Math.PI) / (wavelength * 2);

    const speed1 = windSpeed * 0.5;
    const speed2 = windSpeed * 0.8;
    const speed3 = windSpeed * 0.3;

    const wave1 = Math.sin(x * freq1 + t * speed1) * waveHeight;
    const wave2 = Math.sin(x * freq2 + t * speed2 + layer) * waveHeight * 0.3;
    const wave3 = Math.sin(x * freq3 + t * speed3 + layer * 2) * waveHeight * 0.5;

    return baseY + wave1 + wave2 + wave3 + layer * 30;
}

function drawSky() {
    const scheme = colorSchemes[timeOfDay];
    const gradient = ctx.createLinearGradient(0, 0, 0, height * 0.5);

    gradient.addColorStop(0, scheme.sky[0]);
    gradient.addColorStop(0.5, scheme.sky[1]);
    gradient.addColorStop(1, scheme.sky[2]);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height * 0.5);

    // Sun/Moon
    if (scheme.sun) {
        const sunX = timeOfDay === 'sunset' ? width * 0.8 : width * 0.7;
        const sunY = timeOfDay === 'night' ? height * 0.15 : height * 0.2;
        const sunRadius = timeOfDay === 'night' ? 30 : 50;

        // Glow
        const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 3);
        glow.addColorStop(0, scheme.sun);
        glow.addColorStop(0.3, scheme.sun + '80');
        glow.addColorStop(1, 'transparent');

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Sun body
        ctx.fillStyle = scheme.sun;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        ctx.fill();

        // Stars for night
        if (timeOfDay === 'night') {
            ctx.fillStyle = '#FFFFFF';
            for (let i = 0; i < 100; i++) {
                const sx = (i * 137.5) % width;
                const sy = (i * 73.3) % (height * 0.4);
                const brightness = 0.3 + Math.sin(time * 2 + i) * 0.3;
                ctx.globalAlpha = brightness;
                ctx.beginPath();
                ctx.arc(sx, sy, 1, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
    }

    // Storm clouds
    if (timeOfDay === 'storm') {
        ctx.fillStyle = 'rgba(20, 30, 40, 0.5)';
        for (let i = 0; i < 5; i++) {
            const cx = (i * 300 + time * 20) % (width + 200) - 100;
            const cy = 50 + Math.sin(i) * 30;
            for (let j = 0; j < 5; j++) {
                ctx.beginPath();
                ctx.arc(cx + j * 40, cy + Math.sin(j) * 20, 50 + j * 10, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Lightning flash
        if (Math.random() < 0.002) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(0, 0, width, height);
        }
    }
}

function drawWaves() {
    const scheme = colorSchemes[timeOfDay];

    // Draw multiple wave layers
    for (let layer = 3; layer >= 0; layer--) {
        const gradient = ctx.createLinearGradient(0, height * 0.4, 0, height);
        const alpha = 1 - layer * 0.15;

        gradient.addColorStop(0, scheme.water[0]);
        gradient.addColorStop(0.5, scheme.water[1]);
        gradient.addColorStop(1, scheme.water[2]);

        ctx.fillStyle = gradient;
        ctx.globalAlpha = alpha;

        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 5) {
            const y = getWaveY(x, time, layer);
            ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();

        // Wave crest highlights
        if (layer === 0) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();

            for (let x = 0; x <= width; x += 5) {
                const y = getWaveY(x, time, 0);
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        ctx.globalAlpha = 1;
    }
}

function drawReflection() {
    if (!showReflection) return;

    const scheme = colorSchemes[timeOfDay];
    if (!scheme.sun) return;

    const sunX = timeOfDay === 'sunset' ? width * 0.8 : width * 0.7;

    // Sun reflection on water
    ctx.globalAlpha = 0.3;

    for (let y = height * 0.5; y < height; y += 10) {
        const waveOffset = Math.sin(y * 0.05 + time * 2) * 20;
        const reflectionWidth = 50 + (y - height * 0.5) * 0.5;

        const gradient = ctx.createLinearGradient(
            sunX - reflectionWidth + waveOffset, y,
            sunX + reflectionWidth + waveOffset, y
        );
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.5, scheme.sun);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(sunX - reflectionWidth + waveOffset, y, reflectionWidth * 2, 8);
    }

    ctx.globalAlpha = 1;
}

function updateFoam() {
    if (!showFoam) {
        foamParticles = [];
        return;
    }

    // Generate foam at wave crests
    for (let x = 0; x < width; x += 50) {
        const y = getWaveY(x, time, 0);
        const prevY = getWaveY(x, time - 0.1, 0);

        // Detect wave crest (local maximum)
        if (prevY > y && Math.random() < 0.1 * (windSpeed / 5)) {
            foamParticles.push(new FoamParticle(x + Math.random() * 30, y));
        }
    }

    // Update particles
    foamParticles = foamParticles.filter(p => p.update());

    // Limit particles
    if (foamParticles.length > 500) {
        foamParticles = foamParticles.slice(-400);
    }
}

function drawFoam() {
    for (const particle of foamParticles) {
        particle.draw();
    }

    // Wave foam line
    if (showFoam) {
        const scheme = colorSchemes[timeOfDay];
        ctx.strokeStyle = scheme.foam;
        ctx.lineWidth = 3;

        for (let x = 0; x < width; x += 100) {
            const y = getWaveY(x, time, 0);
            const foamLength = 20 + Math.sin(x * 0.1 + time * 3) * 10;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(
                x + foamLength / 2, y - 5,
                x + foamLength, y + 2
            );
            ctx.stroke();
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    drawSky();
    drawReflection();
    drawWaves();
    updateFoam();
    drawFoam();

    time += 0.02;
    requestAnimationFrame(animate);
}

// Event listeners
document.getElementById('windSlider').addEventListener('input', (e) => {
    windSpeed = parseFloat(e.target.value);
});

document.getElementById('heightSlider').addEventListener('input', (e) => {
    waveHeight = parseInt(e.target.value);
});

document.getElementById('wavelengthSlider').addEventListener('input', (e) => {
    wavelength = parseInt(e.target.value);
});

document.getElementById('timeSelect').addEventListener('change', (e) => {
    timeOfDay = e.target.value;
});

document.getElementById('showFoam').addEventListener('change', (e) => {
    showFoam = e.target.checked;
});

document.getElementById('showReflection').addEventListener('change', (e) => {
    showReflection = e.target.checked;
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
