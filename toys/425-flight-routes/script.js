const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const cities = [
    { name: '台北', x: 280, y: 140, code: 'TPE' },
    { name: '東京', x: 310, y: 100, code: 'NRT' },
    { name: '首爾', x: 270, y: 95, code: 'ICN' },
    { name: '上海', x: 250, y: 130, code: 'PVG' },
    { name: '香港', x: 240, y: 160, code: 'HKG' },
    { name: '新加坡', x: 200, y: 220, code: 'SIN' },
    { name: '曼谷', x: 170, y: 180, code: 'BKK' },
    { name: '雪梨', x: 320, y: 270, code: 'SYD' }
];

const routes = [
    { from: 0, to: 1 }, { from: 0, to: 2 }, { from: 0, to: 3 },
    { from: 0, to: 4 }, { from: 1, to: 2 }, { from: 3, to: 4 },
    { from: 4, to: 5 }, { from: 5, to: 6 }, { from: 0, to: 7 },
    { from: 1, to: 7 }, { from: 5, to: 7 }
];

let planes = [];
let animating = false;

function drawMap() {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Simple landmass
    ctx.fillStyle = '#1a3a2a';
    ctx.beginPath();
    ctx.moveTo(100, 50);
    ctx.lineTo(340, 50);
    ctx.lineTo(340, 200);
    ctx.lineTo(280, 250);
    ctx.lineTo(150, 250);
    ctx.lineTo(100, 180);
    ctx.closePath();
    ctx.fill();

    // Australia
    ctx.beginPath();
    ctx.ellipse(310, 265, 40, 25, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawRoutes() {
    routes.forEach(route => {
        const from = cities[route.from];
        const to = cities[route.to];

        // Arc path
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2 - 30;

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.quadraticCurveTo(midX, midY, to.x, to.y);
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
    });
}

function drawCities() {
    cities.forEach(city => {
        ctx.beginPath();
        ctx.arc(city.x, city.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#f1c40f';
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = '9px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(city.code, city.x, city.y - 10);
    });
}

function drawPlanes() {
    planes.forEach(plane => {
        const from = cities[plane.from];
        const to = cities[plane.to];
        const t = plane.progress;

        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2 - 30;

        // Quadratic bezier point
        const x = (1-t)*(1-t)*from.x + 2*(1-t)*t*midX + t*t*to.x;
        const y = (1-t)*(1-t)*from.y + 2*(1-t)*t*midY + t*t*to.y;

        // Trail
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
    });
}

function update() {
    planes = planes.filter(plane => {
        plane.progress += 0.01;
        return plane.progress < 1;
    });

    if (animating && Math.random() < 0.05) {
        const route = routes[Math.floor(Math.random() * routes.length)];
        planes.push({ from: route.from, to: route.to, progress: 0 });
    }
}

function draw() {
    drawMap();
    drawRoutes();
    drawPlanes();
    drawCities();
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

document.getElementById('animate').addEventListener('click', function() {
    animating = !animating;
    this.textContent = animating ? '⏸️ 暫停動畫' : '✈️ 播放動畫';
    infoEl.textContent = animating ? '飛機正在飛行中...' : '顯示亞太地區主要航線';
});

animate();
