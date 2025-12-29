const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const markers = [];
const cities = [
    { name: '台北', x: 280, y: 120 },
    { name: '東京', x: 300, y: 100 },
    { name: '首爾', x: 270, y: 95 },
    { name: '北京', x: 240, y: 90 },
    { name: '上海', x: 255, y: 115 }
];

// Simple map background
function drawMap() {
    // Ocean
    ctx.fillStyle = '#1a5276';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Simplified Asia landmass
    ctx.fillStyle = '#27ae60';
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(320, 50);
    ctx.lineTo(340, 150);
    ctx.lineTo(300, 200);
    ctx.lineTo(200, 250);
    ctx.lineTo(100, 200);
    ctx.lineTo(30, 100);
    ctx.closePath();
    ctx.fill();

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
}

function drawMarkers() {
    // Draw preset cities
    cities.forEach(city => {
        ctx.beginPath();
        ctx.arc(city.x, city.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#3498db';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(city.name, city.x, city.y - 12);
    });

    // Draw user markers
    markers.forEach((marker, i) => {
        // Pulse animation
        const pulse = Math.sin(Date.now() / 300 + i) * 3 + 10;
        ctx.beginPath();
        ctx.arc(marker.x, marker.y, pulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(231, 76, 60, 0.3)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(marker.x, marker.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function draw() {
    drawMap();
    drawMarkers();
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    markers.push({ x, y });
    infoEl.textContent = `已新增 ${markers.length} 個標記`;
});

document.getElementById('clear').addEventListener('click', () => {
    markers.length = 0;
    infoEl.textContent = '點擊地圖新增標記';
});

animate();
