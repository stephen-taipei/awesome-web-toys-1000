let canvas, ctx;
let n1 = 1, n2 = 1.5, incidentAngle = 45;

function init() {
    canvas = document.getElementById('refractionCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupControls();
    draw();
}

function resizeCanvas() {
    const container = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = container.clientWidth * dpr;
    canvas.height = 400 * dpr;
    canvas.style.width = container.clientWidth + 'px';
    canvas.style.height = '400px';
    ctx.scale(dpr, dpr);
    draw();
}

function setupControls() {
    const materials = { 1: '空氣', 1.3: '水', 1.5: '玻璃', 2: '鑽石', 2.4: '鑽石' };
    document.getElementById('n1').addEventListener('input', (e) => {
        n1 = parseFloat(e.target.value);
        const name = n1 <= 1.1 ? '空氣' : n1 <= 1.4 ? '水' : n1 <= 1.6 ? '玻璃' : '鑽石';
        document.getElementById('n1Value').textContent = n1.toFixed(1) + ' (' + name + ')';
        draw();
    });
    document.getElementById('n2').addEventListener('input', (e) => {
        n2 = parseFloat(e.target.value);
        const name = n2 <= 1.1 ? '空氣' : n2 <= 1.4 ? '水' : n2 <= 1.6 ? '玻璃' : '鑽石';
        document.getElementById('n2Value').textContent = n2.toFixed(1) + ' (' + name + ')';
        draw();
    });
    document.getElementById('angle').addEventListener('input', (e) => {
        incidentAngle = parseInt(e.target.value);
        document.getElementById('angleValue').textContent = incidentAngle + '°';
        draw();
    });
}

function draw() {
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear and draw media
    ctx.fillStyle = '#1a2744';
    ctx.fillRect(0, 0, width, centerY);
    ctx.fillStyle = '#2a3754';
    ctx.fillRect(0, centerY, width, centerY);

    // Interface line
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Normal line
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Calculate refraction
    const theta1 = incidentAngle * Math.PI / 180;
    const sinTheta2 = (n1 / n2) * Math.sin(theta1);
    const isTotalReflection = Math.abs(sinTheta2) > 1;
    const theta2 = isTotalReflection ? 0 : Math.asin(sinTheta2);

    const rayLength = 150;

    // Incident ray
    const incidentEndX = centerX - rayLength * Math.sin(theta1);
    const incidentEndY = centerY - rayLength * Math.cos(theta1);
    ctx.beginPath();
    ctx.moveTo(incidentEndX, incidentEndY);
    ctx.lineTo(centerX, centerY);
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 3;
    ctx.stroke();
    drawArrow(incidentEndX, incidentEndY, centerX, centerY, '#ffff00');

    if (isTotalReflection) {
        // Total internal reflection
        const reflectEndX = centerX + rayLength * Math.sin(theta1);
        const reflectEndY = centerY - rayLength * Math.cos(theta1);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(reflectEndX, reflectEndY);
        ctx.strokeStyle = '#ff0000';
        ctx.stroke();
        drawArrow(centerX, centerY, reflectEndX, reflectEndY, '#ff0000');
        document.getElementById('resultInfo').textContent = '全內反射！臨界角約 ' + (Math.asin(n2/n1) * 180 / Math.PI).toFixed(1) + '°';
    } else {
        // Refracted ray
        const refractEndX = centerX + rayLength * Math.sin(theta2);
        const refractEndY = centerY + rayLength * Math.cos(theta2);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(refractEndX, refractEndY);
        ctx.strokeStyle = '#00ffff';
        ctx.stroke();
        drawArrow(centerX, centerY, refractEndX, refractEndY, '#00ffff');
        document.getElementById('resultInfo').textContent = '折射角: ' + (theta2 * 180 / Math.PI).toFixed(1) + '°';

        // Partial reflection
        const reflectEndX = centerX + rayLength * 0.3 * Math.sin(theta1);
        const reflectEndY = centerY - rayLength * 0.3 * Math.cos(theta1);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(reflectEndX, reflectEndY);
        ctx.strokeStyle = 'rgba(255,255,0,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Labels
    ctx.fillStyle = '#aaa';
    ctx.font = '14px "Segoe UI"';
    ctx.fillText('n₁ = ' + n1.toFixed(1), 20, 30);
    ctx.fillText('n₂ = ' + n2.toFixed(1), 20, centerY + 30);
    ctx.fillText('θ₁ = ' + incidentAngle + '°', centerX + 10, centerY - 50);
}

function drawArrow(fromX, fromY, toX, toY, color) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const headLen = 10;
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI/6), toY - headLen * Math.sin(angle - Math.PI/6));
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI/6), toY - headLen * Math.sin(angle + Math.PI/6));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

document.addEventListener('DOMContentLoaded', init);
