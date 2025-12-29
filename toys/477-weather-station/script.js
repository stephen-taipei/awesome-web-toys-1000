const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const weather = {
    temperature: 24,
    humidity: 65,
    pressure: 1013,
    windSpeed: 12,
    windDirection: 45,
    uvIndex: 6
};

const tempHistory = [];
for (let i = 0; i < 24; i++) {
    tempHistory.push(22 + Math.random() * 8);
}

function updateWeather() {
    weather.temperature += (Math.random() - 0.5) * 1;
    weather.temperature = Math.max(15, Math.min(35, weather.temperature));

    weather.humidity += (Math.random() - 0.5) * 3;
    weather.humidity = Math.max(30, Math.min(95, weather.humidity));

    weather.pressure += (Math.random() - 0.5) * 2;
    weather.pressure = Math.max(990, Math.min(1030, weather.pressure));

    weather.windSpeed += (Math.random() - 0.5) * 3;
    weather.windSpeed = Math.max(0, Math.min(50, weather.windSpeed));

    weather.windDirection += (Math.random() - 0.5) * 20;
    weather.windDirection = (weather.windDirection + 360) % 360;

    weather.uvIndex += (Math.random() - 0.5) * 0.5;
    weather.uvIndex = Math.max(0, Math.min(11, weather.uvIndex));

    tempHistory.push(weather.temperature);
    if (tempHistory.length > 24) tempHistory.shift();
}

function getWindDirectionLabel(deg) {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(deg / 45) % 8];
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Main temperature display
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${weather.temperature.toFixed(1)}°`, canvas.width / 2, 70);

    ctx.font = '16px Arial';
    ctx.fillText('台北市', canvas.width / 2, 95);

    // Weather icon (sun/cloud based on temp)
    ctx.font = '40px Arial';
    const icon = weather.temperature > 28 ? '☀️' : weather.humidity > 80 ? '🌧️' : '⛅';
    ctx.fillText(icon, canvas.width / 2, 140);

    // Stats grid
    const stats = [
        { icon: '💧', label: '濕度', value: `${weather.humidity.toFixed(0)}%` },
        { icon: '🌀', label: '氣壓', value: `${weather.pressure.toFixed(0)} hPa` },
        { icon: '💨', label: '風速', value: `${weather.windSpeed.toFixed(0)} km/h` },
        { icon: '🧭', label: '風向', value: getWindDirectionLabel(weather.windDirection) },
        { icon: '☀️', label: 'UV指數', value: weather.uvIndex.toFixed(1) }
    ];

    const startY = 165;
    stats.forEach((stat, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 60 + col * 120;
        const y = startY + row * 50;

        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(stat.icon, x, y);

        ctx.font = '10px Arial';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText(stat.label, x, y + 15);

        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText(stat.value, x, y + 30);
    });

    // Temperature chart
    const chartLeft = 30;
    const chartRight = canvas.width - 30;
    const chartTop = 255;
    const chartBottom = 290;

    const minTemp = Math.min(...tempHistory) - 2;
    const maxTemp = Math.max(...tempHistory) + 2;

    // Area fill
    ctx.beginPath();
    ctx.moveTo(chartLeft, chartBottom);
    tempHistory.forEach((t, i) => {
        const x = chartLeft + (i / (tempHistory.length - 1)) * (chartRight - chartLeft);
        const y = chartBottom - ((t - minTemp) / (maxTemp - minTemp)) * (chartBottom - chartTop);
        ctx.lineTo(x, y);
    });
    ctx.lineTo(chartRight, chartBottom);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fill();

    // Line
    ctx.beginPath();
    tempHistory.forEach((t, i) => {
        const x = chartLeft + (i / (tempHistory.length - 1)) * (chartRight - chartLeft);
        const y = chartBottom - ((t - minTemp) / (maxTemp - minTemp)) * (chartBottom - chartTop);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function update() {
    updateWeather();
    draw();

    const feels = weather.temperature - (weather.windSpeed * 0.1);
    infoEl.textContent = `體感溫度: ${feels.toFixed(1)}°C`;
}

draw();
setInterval(update, 2000);
