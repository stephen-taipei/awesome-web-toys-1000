const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const cities = [
    { name: '台北', x: 180, y: 80, population: 2700000 },
    { name: '台中', x: 150, y: 160, population: 2800000 },
    { name: '高雄', x: 160, y: 260, population: 2770000 },
    { name: '台南', x: 130, y: 220, population: 1880000 },
    { name: '桃園', x: 210, y: 100, population: 2270000 }
];

const flows = [
    { from: 0, to: 1, volume: 50000 },
    { from: 0, to: 4, volume: 80000 },
    { from: 1, to: 2, volume: 30000 },
    { from: 1, to: 3, volume: 25000 },
    { from: 2, to: 3, volume: 40000 },
    { from: 4, to: 1, volume: 20000 }
];

let particles = [];
let animating = false;

function drawMap() {
    ctx.fillStyle = '#1a2a4a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Taiwan outline
    ctx.fillStyle = '#2a4a6a';
    ctx.beginPath();
    ctx.moveTo(180, 40);
    ctx.lineTo(240, 80);
    ctx.lineTo(250, 150);
    ctx.lineTo(220, 250);
    ctx.lineTo(160, 290);
    ctx.lineTo(120, 250);
    ctx.lineTo(110, 180);
    ctx.lineTo(130, 100);
    ctx.closePath();
    ctx.fill();
}

function drawFlows() {
    flows.forEach(flow => {
        const from = cities[flow.from];
        const to = cities[flow.to];
        const width = flow.volume / 20000;

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);

        const cpX = (from.x + to.x) / 2;
        const cpY = (from.y + to.y) / 2 - 20;
        ctx.quadraticCurveTo(cpX, cpY, to.x, to.y);

        ctx.strokeStyle = `rgba(255, 200, 100, ${0.3 + width * 0.1})`;
        ctx.lineWidth = width;
        ctx.stroke();
    });
}

function drawCities() {
    cities.forEach(city => {
        const size = city.population / 200000;

        ctx.beginPath();
        ctx.arc(city.x, city.y, size, 0, Math.PI * 2);
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(city.name, city.x, city.y - size - 8);
    });
}

function drawParticles() {
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#f1c40f';
        ctx.fill();
    });
}

function update() {
    particles = particles.filter(p => {
        p.progress += 0.02;

        const from = cities[p.from];
        const to = cities[p.to];
        const t = p.progress;

        const cpX = (from.x + to.x) / 2;
        const cpY = (from.y + to.y) / 2 - 20;

        p.x = (1-t)*(1-t)*from.x + 2*(1-t)*t*cpX + t*t*to.x;
        p.y = (1-t)*(1-t)*from.y + 2*(1-t)*t*cpY + t*t*to.y;

        return p.progress < 1;
    });

    if (animating && Math.random() < 0.15) {
        const flow = flows[Math.floor(Math.random() * flows.length)];
        const from = cities[flow.from];
        particles.push({
            from: flow.from,
            to: flow.to,
            x: from.x,
            y: from.y,
            progress: 0
        });
    }
}

function draw() {
    drawMap();
    drawFlows();
    drawParticles();
    drawCities();
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

document.getElementById('animate').addEventListener('click', function() {
    animating = !animating;
    this.textContent = animating ? '⏸️ 暫停動畫' : '▶️ 播放動畫';
    infoEl.textContent = animating ? '人口正在流動中...' : '顯示區域間人口流動';
});

animate();
