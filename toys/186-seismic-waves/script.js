/**
 * Seismic Waves 地震波
 * Web Toy #186
 *
 * 功能：模擬地震波（P波、S波、表面波）在地層中的傳播
 */

// 全域變數
let canvas, ctx;
let animationId = null;
let time = 0;

// 地震參數
let epicenterX = 0.5;
let epicenterY = 0.5; // 相對於地層的位置
let depth = 50;       // 震源深度 km
let magnitude = 6;    // 地震規模

// 波速 (km/s)
let pSpeed = 8;
let sSpeed = 4.5;
let surfaceSpeed = 3;

// 波的顯示
let showP = true;
let showS = true;
let showSurface = true;

// 地震狀態
let isQuaking = false;
let quakeStartTime = 0;
let waves = [];

// 地層資訊
const groundLevel = 0.25; // 地面在畫布的 25% 高度處

// 初始化
function init() {
    canvas = document.getElementById('seismicCanvas');
    ctx = canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    setupControls();
    setupCanvasInteraction();
    animate();
}

// 調整 Canvas 大小
function resizeCanvas() {
    const container = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = container.clientWidth * dpr;
    canvas.height = 400 * dpr;
    canvas.style.width = container.clientWidth + 'px';
    canvas.style.height = '400px';

    ctx.scale(dpr, dpr);
}

// 設定控制項
function setupControls() {
    // 震源深度
    document.getElementById('depth').addEventListener('input', (e) => {
        depth = parseInt(e.target.value);
        document.getElementById('depthValue').textContent = depth + ' km';
    });

    // 地震規模
    document.getElementById('magnitude').addEventListener('input', (e) => {
        magnitude = parseFloat(e.target.value);
        document.getElementById('magnitudeValue').textContent = 'M ' + magnitude.toFixed(1);
    });

    // P波速度
    document.getElementById('pSpeed').addEventListener('input', (e) => {
        pSpeed = parseFloat(e.target.value);
        document.getElementById('pSpeedValue').textContent = pSpeed + ' km/s';
    });

    // S波速度
    document.getElementById('sSpeed').addEventListener('input', (e) => {
        sSpeed = parseFloat(e.target.value);
        document.getElementById('sSpeedValue').textContent = sSpeed + ' km/s';
    });

    // 波型顯示
    document.getElementById('showP').addEventListener('change', (e) => {
        showP = e.target.checked;
    });

    document.getElementById('showS').addEventListener('change', (e) => {
        showS = e.target.checked;
    });

    document.getElementById('showSurface').addEventListener('change', (e) => {
        showSurface = e.target.checked;
    });

    // 按鈕
    document.getElementById('quakeBtn').addEventListener('click', triggerQuake);
    document.getElementById('resetBtn').addEventListener('click', reset);
}

// 設定畫布互動
function setupCanvasInteraction() {
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        // 只允許在地下設定震源
        if (y > groundLevel) {
            epicenterX = x;
            epicenterY = (y - groundLevel) / (1 - groundLevel);
            triggerQuake();
        }
    });
}

// 觸發地震
function triggerQuake() {
    isQuaking = true;
    quakeStartTime = time;
    waves = [];

    // 加入震動效果
    canvas.parentElement.classList.add('shaking');
    setTimeout(() => {
        canvas.parentElement.classList.remove('shaking');
    }, 500);

    // 建立波
    const waveAmplitude = Math.pow(10, (magnitude - 4) / 2) * 10;

    // P波
    waves.push({
        type: 'P',
        radius: 0,
        speed: pSpeed,
        amplitude: waveAmplitude,
        color: 'rgba(255, 68, 68, 0.6)',
        thickness: 3
    });

    // S波
    waves.push({
        type: 'S',
        radius: 0,
        speed: sSpeed,
        amplitude: waveAmplitude * 1.5,
        color: 'rgba(68, 68, 255, 0.6)',
        thickness: 3
    });
}

// 重置
function reset() {
    isQuaking = false;
    waves = [];
    epicenterX = 0.5;
    epicenterY = 0.5;
}

// 繪製
function draw() {
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = 400;
    const groundY = height * groundLevel;

    // 清除畫布
    ctx.clearRect(0, 0, width, height);

    // 繪製天空
    const skyGradient = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#4a90a4');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, groundY);

    // 繪製地層
    drawEarthLayers(width, height, groundY);

    // 繪製震源
    drawEpicenter(width, height, groundY);

    // 繪製波
    drawWaves(width, height, groundY);

    // 繪製地表建築
    drawBuildings(width, groundY);

    // 繪製深度標尺
    drawDepthScale(width, height, groundY);

    // 繪製時間和資訊
    drawInfo(width, height);
}

// 繪製地層
function drawEarthLayers(width, height, groundY) {
    const layers = [
        { depth: 0, color: '#654321', name: '表土層' },
        { depth: 0.2, color: '#5c3d1e', name: '岩石層' },
        { depth: 0.5, color: '#4a3015', name: '地殼' },
        { depth: 0.8, color: '#3d2817', name: '上部地函' }
    ];

    const groundHeight = height - groundY;

    for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        const nextLayer = layers[i + 1];

        const startY = groundY + layer.depth * groundHeight;
        const endY = nextLayer ? groundY + nextLayer.depth * groundHeight : height;

        const gradient = ctx.createLinearGradient(0, startY, 0, endY);
        gradient.addColorStop(0, layer.color);
        gradient.addColorStop(1, layers[Math.min(i + 1, layers.length - 1)].color);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, startY, width, endY - startY);
    }

    // 繪製層界線
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    for (const layer of layers) {
        if (layer.depth > 0) {
            const y = groundY + layer.depth * groundHeight;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }

    ctx.setLineDash([]);
}

// 繪製震源
function drawEpicenter(width, height, groundY) {
    const groundHeight = height - groundY;
    const x = epicenterX * width;
    const y = groundY + epicenterY * groundHeight;

    // 震源標記
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4444';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 十字標記
    ctx.beginPath();
    ctx.moveTo(x - 15, y);
    ctx.lineTo(x + 15, y);
    ctx.moveTo(x, y - 15);
    ctx.lineTo(x, y + 15);
    ctx.strokeStyle = 'rgba(255, 68, 68, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 震源標籤
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('震源', x, y - 20);

    // 震源到地表的連線
    const surfaceX = x;
    const surfaceY = groundY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(surfaceX, surfaceY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 震央標記
    ctx.beginPath();
    ctx.arc(surfaceX, surfaceY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffaa00';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#ffaa00';
    ctx.fillText('震央', surfaceX, surfaceY - 10);
}

// 繪製波
function drawWaves(width, height, groundY) {
    const groundHeight = height - groundY;
    const epicenterPx = {
        x: epicenterX * width,
        y: groundY + epicenterY * groundHeight
    };

    const elapsedTime = isQuaking ? (time - quakeStartTime) : 0;
    const scaleFactor = width / 500; // 將波速轉換為像素

    for (const wave of waves) {
        if (!isQuaking) continue;

        // 更新波的半徑
        wave.radius = wave.speed * elapsedTime * scaleFactor * 20;

        // 檢查是否顯示此類波
        if (wave.type === 'P' && !showP) continue;
        if (wave.type === 'S' && !showS) continue;

        // 繪製波前
        if (wave.radius > 0 && wave.radius < width * 2) {
            // 主波前
            ctx.beginPath();
            ctx.arc(epicenterPx.x, epicenterPx.y, wave.radius, 0, Math.PI * 2);
            ctx.strokeStyle = wave.color;
            ctx.lineWidth = wave.thickness;
            ctx.stroke();

            // 發光效果
            ctx.beginPath();
            ctx.arc(epicenterPx.x, epicenterPx.y, wave.radius, 0, Math.PI * 2);
            ctx.strokeStyle = wave.color.replace('0.6', '0.2');
            ctx.lineWidth = wave.thickness * 3;
            ctx.stroke();

            // 尾波
            for (let i = 1; i <= 3; i++) {
                const trailRadius = wave.radius - i * 15;
                if (trailRadius > 0) {
                    ctx.beginPath();
                    ctx.arc(epicenterPx.x, epicenterPx.y, trailRadius, 0, Math.PI * 2);
                    ctx.strokeStyle = wave.color.replace('0.6', String(0.3 - i * 0.08));
                    ctx.lineWidth = wave.thickness - i * 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    // 繪製表面波（當 P 波到達地表後）
    if (showSurface && isQuaking) {
        const pWave = waves.find(w => w.type === 'P');
        if (pWave) {
            // 檢查 P 波是否到達地表
            const distToSurface = epicenterY * groundHeight;
            const pTravelTime = distToSurface / (pSpeed * scaleFactor * 20);

            if (elapsedTime > pTravelTime) {
                const surfaceWaveRadius = (elapsedTime - pTravelTime) * surfaceSpeed * scaleFactor * 20;

                if (surfaceWaveRadius > 0 && surfaceWaveRadius < width) {
                    // 左側表面波
                    const leftX = epicenterPx.x - surfaceWaveRadius;
                    const rightX = epicenterPx.x + surfaceWaveRadius;

                    // 表面波視覺效果
                    ctx.beginPath();
                    ctx.moveTo(Math.max(0, leftX), groundY);
                    ctx.lineTo(Math.min(width, rightX), groundY);
                    ctx.strokeStyle = 'rgba(68, 255, 68, 0.8)';
                    ctx.lineWidth = 4;
                    ctx.stroke();

                    // 表面波擾動
                    const waveSegments = 50;
                    ctx.beginPath();
                    for (let i = 0; i <= waveSegments; i++) {
                        const t = i / waveSegments;
                        const x = Math.max(0, leftX) + t * (Math.min(width, rightX) - Math.max(0, leftX));

                        const distFromCenter = Math.abs(x - epicenterPx.x);
                        const wavePhase = distFromCenter * 0.1 - elapsedTime * 5;
                        const amplitude = Math.max(0, 15 * (1 - distFromCenter / surfaceWaveRadius));
                        const y = groundY + amplitude * Math.sin(wavePhase);

                        if (i === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                    ctx.strokeStyle = 'rgba(68, 255, 68, 0.5)';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
        }
    }
}

// 繪製建築物
function drawBuildings(width, groundY) {
    const buildings = [
        { x: 0.1, w: 30, h: 40 },
        { x: 0.25, w: 25, h: 60 },
        { x: 0.4, w: 40, h: 45 },
        { x: 0.55, w: 35, h: 70 },
        { x: 0.7, w: 30, h: 35 },
        { x: 0.85, w: 45, h: 55 }
    ];

    buildings.forEach(building => {
        const x = building.x * width - building.w / 2;
        const y = groundY - building.h;

        // 建築物主體
        ctx.fillStyle = '#555';
        ctx.fillRect(x, y, building.w, building.h);

        // 窗戶
        ctx.fillStyle = '#ffff88';
        const rows = Math.floor(building.h / 15);
        const cols = Math.floor(building.w / 12);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const wx = x + 5 + c * 12;
                const wy = y + 5 + r * 15;
                ctx.fillRect(wx, wy, 6, 8);
            }
        }
    });

    // 地面草地
    ctx.fillStyle = '#2d5a2d';
    ctx.fillRect(0, groundY - 5, width, 5);
}

// 繪製深度標尺
function drawDepthScale(width, height, groundY) {
    const x = 20;
    const groundHeight = height - groundY;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';

    // 標尺
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.lineTo(x, height);
    ctx.stroke();

    // 刻度
    const maxDepth = 300; // km
    for (let d = 0; d <= maxDepth; d += 50) {
        const y = groundY + (d / maxDepth) * groundHeight;
        ctx.beginPath();
        ctx.moveTo(x - 5, y);
        ctx.lineTo(x + 5, y);
        ctx.stroke();
        ctx.fillText(d + ' km', x + 10, y + 4);
    }
}

// 繪製資訊
function drawInfo(width, height) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 14px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';

    ctx.fillText(`規模: M ${magnitude.toFixed(1)}`, width - 150, 30);
    ctx.fillText(`震源深度: ${depth} km`, width - 150, 50);

    if (isQuaking) {
        const elapsed = ((time - quakeStartTime) * 10).toFixed(1);
        ctx.fillStyle = '#ffaa00';
        ctx.fillText(`經過時間: ${elapsed} 秒`, width - 150, 70);
    }
}

// 動畫迴圈
function animate() {
    time += 0.016;
    draw();
    animationId = requestAnimationFrame(animate);
}

// 啟動
document.addEventListener('DOMContentLoaded', init);
