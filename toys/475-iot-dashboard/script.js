const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const sensors = [
    { name: '溫度', value: 25, unit: '°C', min: 15, max: 35, color: '#e74c3c', icon: '🌡️' },
    { name: '濕度', value: 60, unit: '%', min: 30, max: 90, color: '#3498db', icon: '💧' },
    { name: '光線', value: 500, unit: 'lux', min: 0, max: 1000, color: '#f1c40f', icon: '☀️' },
    { name: '壓力', value: 1013, unit: 'hPa', min: 980, max: 1040, color: '#9b59b6', icon: '🌀' }
];

function updateSensors() {
    sensors.forEach(s => {
        const change = (Math.random() - 0.5) * (s.max - s.min) * 0.1;
        s.value = Math.max(s.min, Math.min(s.max, s.value + change));
    });
}

function drawGauge(x, y, radius, sensor) {
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const valueAngle = startAngle + (sensor.value - sensor.min) / (sensor.max - sensor.min) * (endAngle - startAngle);

    // Background arc
    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Value arc
    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, valueAngle);
    ctx.strokeStyle = sensor.color;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Needle
    ctx.beginPath();
    ctx.moveTo(x, y);
    const needleX = x + Math.cos(valueAngle) * (radius - 15);
    const needleY = y + Math.sin(valueAngle) * (radius - 15);
    ctx.lineTo(needleX, needleY);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Icon
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(sensor.icon, x, y - radius - 10);

    // Value text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`${sensor.value.toFixed(1)}${sensor.unit}`, x, y + 15);

    // Label
    ctx.font = '10px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(sensor.name, x, y + 30);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('感測器儀表板', canvas.width / 2, 25);

    // Draw 4 gauges in 2x2 grid
    const gaugeRadius = 50;
    const positions = [
        { x: 90, y: 100 },
        { x: 270, y: 100 },
        { x: 90, y: 220 },
        { x: 270, y: 220 }
    ];

    sensors.forEach((sensor, i) => {
        drawGauge(positions[i].x, positions[i].y, gaugeRadius, sensor);
    });
}

function update() {
    updateSensors();
    draw();

    const temp = sensors[0].value.toFixed(1);
    const humidity = sensors[1].value.toFixed(0);
    infoEl.textContent = `環境狀態: ${temp}°C / ${humidity}% 濕度`;
}

draw();
setInterval(update, 1500);
