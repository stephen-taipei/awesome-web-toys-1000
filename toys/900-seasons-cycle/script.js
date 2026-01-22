const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let currentSeason = 0;
let transitionProgress = 0;
let particles = [];
let time = 0;

const seasons = [
    { name: '春天', sky: ['#87CEEB', '#E0F6FF'], ground: '#90EE90', tree: '#228B22', particle: 'petal' },
    { name: '夏天', sky: ['#4169E1', '#87CEEB'], ground: '#228B22', tree: '#006400', particle: 'sun' },
    { name: '秋天', sky: ['#DEB887', '#FFE4B5'], ground: '#DAA520', tree: '#FF8C00', particle: 'leaf' },
    { name: '冬天', sky: ['#B0C4DE', '#E6E6FA'], ground: '#FFFAFA', tree: '#8B4513', particle: 'snow' }
];

function init() {
    spawnParticles();
}

function spawnParticles() {
    particles = [];
    for (let i = 0; i < 30; i++) {
        addParticle();
    }
}

function addParticle() {
    const season = seasons[currentSeason];
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 3 + Math.random() * 5,
        speed: 1 + Math.random() * 2,
        wobble: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2
    });
}

function nextSeason() {
    currentSeason = (currentSeason + 1) % 4;
    spawnParticles();
}

function updateParticles() {
    const season = seasons[currentSeason];

    particles.forEach(p => {
        p.wobble += 0.05;
        p.rotation += 0.02;

        if (season.particle === 'snow') {
            p.y += p.speed;
            p.x += Math.sin(p.wobble) * 0.5;
        } else if (season.particle === 'leaf') {
            p.y += p.speed * 0.8;
            p.x += Math.sin(p.wobble) * 1.5;
        } else if (season.particle === 'petal') {
            p.y += p.speed * 0.5;
            p.x += Math.sin(p.wobble) * 2;
        } else {
            p.y -= p.speed * 0.3;
            p.x += Math.sin(p.wobble) * 0.3;
        }

        if (p.y > canvas.height + 10) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
        }
        if (p.y < -10 && season.particle === 'sun') {
            p.y = canvas.height + 10;
            p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.x < -10) p.x = canvas.width + 10;
    });
}

function drawBackground() {
    const season = seasons[currentSeason];
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, season.sky[0]);
    gradient.addColorStop(0.6, season.sky[1]);
    gradient.addColorStop(1, season.ground);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSun() {
    const season = seasons[currentSeason];
    let sunY = 50;
    let sunSize = 25;
    let sunColor = '#FFD700';

    if (currentSeason === 1) {
        sunY = 40;
        sunSize = 35;
        sunColor = '#FFA500';
    } else if (currentSeason === 3) {
        sunY = 60;
        sunSize = 20;
        sunColor = '#F5F5DC';
    }

    ctx.fillStyle = sunColor;
    ctx.beginPath();
    ctx.arc(canvas.width - 60, sunY, sunSize, 0, Math.PI * 2);
    ctx.fill();

    if (currentSeason !== 3) {
        ctx.strokeStyle = sunColor;
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + time * 0.02;
            ctx.beginPath();
            ctx.moveTo(canvas.width - 60 + Math.cos(angle) * (sunSize + 5), sunY + Math.sin(angle) * (sunSize + 5));
            ctx.lineTo(canvas.width - 60 + Math.cos(angle) * (sunSize + 15), sunY + Math.sin(angle) * (sunSize + 15));
            ctx.stroke();
        }
    }
}

function drawGround() {
    const season = seasons[currentSeason];
    ctx.fillStyle = season.ground;
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);

    if (currentSeason === 0) {
        ctx.fillStyle = '#FF69B4';
        for (let i = 0; i < 15; i++) {
            ctx.beginPath();
            ctx.arc(20 + i * 25, canvas.height - 50 + Math.sin(i) * 5, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (currentSeason === 2) {
        ctx.fillStyle = '#8B4513';
        for (let i = 0; i < 10; i++) {
            ctx.fillRect(30 + i * 35, canvas.height - 55, 8, 3);
        }
    } else if (currentSeason === 3) {
        ctx.fillStyle = '#ADD8E6';
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.arc(15 + i * 20, canvas.height - 50, 5 + Math.sin(i) * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawTree() {
    const season = seasons[currentSeason];

    ctx.fillStyle = '#8B4513';
    ctx.fillRect(175, canvas.height - 130, 20, 70);

    if (currentSeason !== 3) {
        ctx.fillStyle = season.tree;
        ctx.beginPath();
        ctx.arc(185, canvas.height - 150, 50, 0, Math.PI * 2);
        ctx.fill();

        if (currentSeason === 0) {
            ctx.fillStyle = '#FFB6C1';
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                ctx.beginPath();
                ctx.arc(185 + Math.cos(angle) * 30, canvas.height - 150 + Math.sin(angle) * 30, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (currentSeason === 1) {
            ctx.fillStyle = '#FF0000';
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.arc(170 + i * 8, canvas.height - 140, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    } else {
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(185, canvas.height - 130);
        ctx.lineTo(160, canvas.height - 160);
        ctx.moveTo(185, canvas.height - 140);
        ctx.lineTo(210, canvas.height - 170);
        ctx.moveTo(185, canvas.height - 150);
        ctx.lineTo(165, canvas.height - 180);
        ctx.stroke();

        ctx.fillStyle = '#fff';
        [[160, -160], [210, -170], [165, -180]].forEach(([x, y]) => {
            ctx.beginPath();
            ctx.arc(x, canvas.height + y, 5, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

function drawParticles() {
    const season = seasons[currentSeason];

    particles.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (season.particle === 'snow') {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (season.particle === 'leaf') {
            ctx.fillStyle = ['#FF8C00', '#FF4500', '#DAA520'][Math.floor(p.size) % 3];
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (season.particle === 'petal') {
            ctx.fillStyle = '#FFB6C1';
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = `rgba(255, 255, 0, ${0.3 + Math.sin(time * 0.1) * 0.2})`;
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    });
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`季節: ${seasons[currentSeason].name}`, 20, 28);
}

function animate() {
    time++;
    updateParticles();
    drawBackground();
    drawSun();
    drawGround();
    drawTree();
    drawParticles();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('nextBtn').addEventListener('click', nextSeason);

init();
animate();
