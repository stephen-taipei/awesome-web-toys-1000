const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

// Simplified world map coordinates (major continents outlines)
const continents = {
    'North America': [[[-170,70],[-140,70],[-120,60],[-80,50],[-60,45],[-80,25],[-100,20],[-120,30],[-160,60],[-170,70]]],
    'South America': [[[-80,10],[-35,5],[-35,-55],[-70,-55],[-80,-40],[-70,-20],[-80,10]]],
    'Europe': [[[-10,70],[30,70],[40,50],[30,35],[-10,35],[-10,70]]],
    'Africa': [[[-20,35],[40,35],[50,10],[40,-35],[20,-35],[-20,5],[-20,35]]],
    'Asia': [[[40,70],[180,70],[150,50],[120,30],[100,10],[70,10],[40,35],[40,70]]],
    'Australia': [[[110,-10],[155,-10],[155,-45],[110,-45],[110,-10]]]
};

let scale = 1.5;
let offsetX = 180;
let offsetY = 140;
let dragging = false;
let lastX, lastY;

function lonLatToXY(lon, lat) {
    const x = (lon + 180) * (canvas.width / 360) * scale + offsetX - canvas.width * scale / 2;
    const y = (90 - lat) * (canvas.height / 180) * scale + offsetY - canvas.height * scale / 2;
    return [x, y];
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ocean
    ctx.fillStyle = '#1a5276';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw continents
    ctx.fillStyle = '#27ae60';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;

    Object.entries(continents).forEach(([name, polygons]) => {
        polygons.forEach(polygon => {
            ctx.beginPath();
            polygon.forEach((coord, i) => {
                const [x, y] = lonLatToXY(coord[0], coord[1]);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        });
    });

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 0.5;

    // Latitude lines
    for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        const [x1, y] = lonLatToXY(-180, lat);
        const [x2] = lonLatToXY(180, lat);
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();
    }

    // Longitude lines
    for (let lon = -180; lon <= 180; lon += 30) {
        ctx.beginPath();
        const [x, y1] = lonLatToXY(lon, 90);
        const [, y2] = lonLatToXY(lon, -90);
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.stroke();
    }
}

canvas.addEventListener('mousedown', (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    offsetX += dx;
    offsetY += dy;
    lastX = e.clientX;
    lastY = e.clientY;
    draw();
});

canvas.addEventListener('mouseup', () => { dragging = false; });
canvas.addEventListener('mouseleave', () => { dragging = false; });

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    scale = Math.max(0.5, Math.min(5, scale * delta));
    draw();
    infoEl.textContent = `縮放: ${Math.round(scale * 100)}%`;
});

document.getElementById('zoomIn').addEventListener('click', () => {
    scale = Math.min(5, scale * 1.2);
    draw();
});

document.getElementById('zoomOut').addEventListener('click', () => {
    scale = Math.max(0.5, scale / 1.2);
    draw();
});

document.getElementById('reset').addEventListener('click', () => {
    scale = 1.5;
    offsetX = 180;
    offsetY = 140;
    draw();
});

draw();
