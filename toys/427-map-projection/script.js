const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

let projection = 'mercator';

const projectionInfo = {
    mercator: '麥卡托投影 - 保持角度，高緯度變形大',
    equirect: '等距圓柱投影 - 經緯度等間距',
    sinusoidal: '正弦投影 - 保持面積'
};

// Simplified continent outlines
const continents = [
    [[-130, 50], [-100, 60], [-80, 45], [-70, 30], [-100, 20], [-120, 35]],
    [[-80, 10], [-50, 0], [-40, -30], [-60, -50], [-75, -20]],
    [[0, 50], [30, 60], [40, 45], [10, 35]],
    [[-15, 30], [35, 30], [45, 0], [20, -35], [-10, 5]],
    [[60, 60], [140, 50], [130, 20], [100, 10], [70, 25], [50, 40]],
    [[115, -20], [150, -20], [150, -40], [115, -35]]
];

function project(lon, lat) {
    const w = canvas.width - 40;
    const h = canvas.height - 40;

    switch (projection) {
        case 'mercator':
            const latRad = lat * Math.PI / 180;
            const mercY = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
            return {
                x: 20 + (lon + 180) / 360 * w,
                y: 20 + h / 2 - mercY * w / (2 * Math.PI)
            };
        case 'equirect':
            return {
                x: 20 + (lon + 180) / 360 * w,
                y: 20 + (90 - lat) / 180 * h
            };
        case 'sinusoidal':
            const latRadS = lat * Math.PI / 180;
            return {
                x: 20 + w / 2 + (lon / 180) * Math.cos(latRadS) * w / 2,
                y: 20 + (90 - lat) / 180 * h
            };
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ocean
    ctx.fillStyle = '#1a5276';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 0.5;

    // Latitude lines
    for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        for (let lon = -180; lon <= 180; lon += 5) {
            const p = project(lon, lat);
            if (lon === -180) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
    }

    // Longitude lines
    for (let lon = -180; lon <= 180; lon += 30) {
        ctx.beginPath();
        for (let lat = -80; lat <= 80; lat += 5) {
            const p = project(lon, lat);
            if (lat === -80) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
    }

    // Continents
    ctx.fillStyle = '#27ae60';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;

    continents.forEach(continent => {
        ctx.beginPath();
        continent.forEach(([lon, lat], i) => {
            const p = project(lon, lat);
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    });

    infoEl.textContent = projectionInfo[projection];
}

document.querySelectorAll('.proj-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.proj-btn.active').classList.remove('active');
        btn.classList.add('active');
        projection = btn.dataset.proj;
        draw();
    });
});

draw();
