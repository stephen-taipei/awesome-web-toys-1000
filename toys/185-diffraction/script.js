/**
 * Diffraction 繞射
 * Web Toy #185
 *
 * 功能：模擬波通過狹縫的繞射現象
 * 包含單狹縫、雙狹縫、光柵和圓孔繞射
 */

// 全域變數
let canvas, ctx;
let isPlaying = true;
let animationId = null;
let time = 0;

// 波的參數
let wavelength = 25;
let amplitude = 0.7;

// 狹縫參數
let slitWidth = 30;
let slitSpacing = 60;
let slitCount = 5;

// 模式
let mode = 'single'; // single, double, grating, circular

// 顯示強度圖
let showIntensity = false;

// 初始化
function init() {
    canvas = document.getElementById('diffractionCanvas');
    ctx = canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    setupControls();
    animate();
}

// 調整 Canvas 大小
function resizeCanvas() {
    const container = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = container.clientWidth * dpr;
    canvas.height = 450 * dpr;
    canvas.style.width = container.clientWidth + 'px';
    canvas.style.height = '450px';

    ctx.scale(dpr, dpr);
}

// 設定控制項
function setupControls() {
    // 模式選擇
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            mode = btn.dataset.mode;
            updateControlVisibility();
        });
    });

    // 波長
    document.getElementById('wavelength').addEventListener('input', (e) => {
        wavelength = parseInt(e.target.value);
        document.getElementById('wavelengthValue').textContent = wavelength;
    });

    // 振幅
    document.getElementById('amplitude').addEventListener('input', (e) => {
        amplitude = parseFloat(e.target.value);
        document.getElementById('amplitudeValue').textContent = amplitude.toFixed(1);
    });

    // 狹縫寬度
    document.getElementById('slitWidth').addEventListener('input', (e) => {
        slitWidth = parseInt(e.target.value);
        document.getElementById('slitWidthValue').textContent = slitWidth;
    });

    // 狹縫間距
    document.getElementById('slitSpacing').addEventListener('input', (e) => {
        slitSpacing = parseInt(e.target.value);
        document.getElementById('slitSpacingValue').textContent = slitSpacing;
    });

    // 狹縫數量
    document.getElementById('slitCount').addEventListener('input', (e) => {
        slitCount = parseInt(e.target.value);
        document.getElementById('slitCountValue').textContent = slitCount;
    });

    // 按鈕
    document.getElementById('playBtn').addEventListener('click', togglePlay);
    document.getElementById('resetBtn').addEventListener('click', reset);
    document.getElementById('intensityBtn').addEventListener('click', toggleIntensity);

    updateControlVisibility();
}

// 更新控制項可見性
function updateControlVisibility() {
    const spacingRow = document.getElementById('slitSpacingRow');
    const countRow = document.getElementById('slitCountRow');

    if (mode === 'single' || mode === 'circular') {
        spacingRow.style.display = 'none';
        countRow.style.display = 'none';
    } else if (mode === 'double') {
        spacingRow.style.display = 'flex';
        countRow.style.display = 'none';
    } else if (mode === 'grating') {
        spacingRow.style.display = 'flex';
        countRow.style.display = 'flex';
    }
}

// 切換播放
function togglePlay() {
    const btn = document.getElementById('playBtn');
    isPlaying = !isPlaying;

    if (isPlaying) {
        btn.textContent = '暫停';
        btn.classList.remove('paused');
        animate();
    } else {
        btn.textContent = '播放';
        btn.classList.add('paused');
        cancelAnimationFrame(animationId);
    }
}

// 重置
function reset() {
    time = 0;
    wavelength = 25;
    amplitude = 0.7;
    slitWidth = 30;
    slitSpacing = 60;
    slitCount = 5;

    document.getElementById('wavelength').value = 25;
    document.getElementById('wavelengthValue').textContent = '25';
    document.getElementById('amplitude').value = 0.7;
    document.getElementById('amplitudeValue').textContent = '0.7';
    document.getElementById('slitWidth').value = 30;
    document.getElementById('slitWidthValue').textContent = '30';
    document.getElementById('slitSpacing').value = 60;
    document.getElementById('slitSpacingValue').textContent = '60';
    document.getElementById('slitCount').value = 5;
    document.getElementById('slitCountValue').textContent = '5';
}

// 切換強度圖顯示
function toggleIntensity() {
    const btn = document.getElementById('intensityBtn');
    showIntensity = !showIntensity;
    btn.classList.toggle('active', showIntensity);
    btn.textContent = showIntensity ? '隱藏強度圖' : '顯示強度圖';
}

// 計算單狹縫繞射
function singleSlitDiffraction(x, y, barrierX, centerY, t) {
    if (x < barrierX) {
        // 入射波（平面波）
        return amplitude * Math.sin(2 * Math.PI * (x / wavelength - t));
    }

    // 使用惠更斯原理計算
    let totalWave = 0;
    const numSources = Math.ceil(slitWidth);

    for (let i = 0; i < numSources; i++) {
        const sourceY = centerY - slitWidth / 2 + i;
        const dx = x - barrierX;
        const dy = y - sourceY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 次波源貢獻
        const phase = 2 * Math.PI * (distance / wavelength - t);
        const attenuation = 1 / Math.sqrt(distance + 1);
        totalWave += attenuation * Math.sin(phase);
    }

    return amplitude * totalWave / numSources;
}

// 計算雙狹縫繞射
function doubleSlitDiffraction(x, y, barrierX, centerY, t) {
    if (x < barrierX) {
        return amplitude * Math.sin(2 * Math.PI * (x / wavelength - t));
    }

    let totalWave = 0;
    const slitCenters = [
        centerY - slitSpacing / 2,
        centerY + slitSpacing / 2
    ];

    for (const slitCenter of slitCenters) {
        const numSources = Math.ceil(slitWidth);
        for (let i = 0; i < numSources; i++) {
            const sourceY = slitCenter - slitWidth / 2 + i;
            const dx = x - barrierX;
            const dy = y - sourceY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const phase = 2 * Math.PI * (distance / wavelength - t);
            const attenuation = 1 / Math.sqrt(distance + 1);
            totalWave += attenuation * Math.sin(phase);
        }
    }

    return amplitude * totalWave / (slitWidth * 2);
}

// 計算光柵繞射
function gratingDiffraction(x, y, barrierX, centerY, t) {
    if (x < barrierX) {
        return amplitude * Math.sin(2 * Math.PI * (x / wavelength - t));
    }

    let totalWave = 0;
    const totalHeight = (slitCount - 1) * slitSpacing;

    for (let s = 0; s < slitCount; s++) {
        const slitCenter = centerY - totalHeight / 2 + s * slitSpacing;
        const numSources = Math.ceil(slitWidth / 2);

        for (let i = 0; i < numSources; i++) {
            const sourceY = slitCenter - slitWidth / 4 + i * 0.5;
            const dx = x - barrierX;
            const dy = y - sourceY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const phase = 2 * Math.PI * (distance / wavelength - t);
            const attenuation = 1 / Math.sqrt(distance + 1);
            totalWave += attenuation * Math.sin(phase);
        }
    }

    return amplitude * totalWave / (slitWidth * slitCount);
}

// 計算圓孔繞射
function circularDiffraction(x, y, barrierX, centerY, t) {
    if (x < barrierX) {
        return amplitude * Math.sin(2 * Math.PI * (x / wavelength - t));
    }

    let totalWave = 0;
    const radius = slitWidth / 2;
    const numRings = 10;

    for (let r = 0; r <= radius; r += radius / numRings) {
        const circumference = 2 * Math.PI * r;
        const numPoints = Math.max(1, Math.ceil(circumference / 3));

        for (let i = 0; i < numPoints; i++) {
            const angle = (2 * Math.PI * i) / numPoints;
            const sourceY = centerY + r * Math.cos(angle);
            const sourceZ = r * Math.sin(angle); // 假設的Z座標

            const dx = x - barrierX;
            const dy = y - sourceY;
            const distance = Math.sqrt(dx * dx + dy * dy + sourceZ * sourceZ);

            const phase = 2 * Math.PI * (distance / wavelength - t);
            const attenuation = 1 / Math.sqrt(distance + 1);
            totalWave += attenuation * Math.sin(phase);
        }
    }

    return amplitude * totalWave / (radius * numRings);
}

// 繪製
function draw() {
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = 450;
    const centerY = height / 2;
    const barrierX = width * 0.3;

    // 清除畫布
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // 計算並繪製波場
    const resolution = 4;
    const imageData = ctx.createImageData(width, height);

    for (let py = 0; py < height; py += resolution) {
        for (let px = 0; px < width; px += resolution) {
            let waveValue;

            switch (mode) {
                case 'single':
                    waveValue = singleSlitDiffraction(px, py, barrierX, centerY, time);
                    break;
                case 'double':
                    waveValue = doubleSlitDiffraction(px, py, barrierX, centerY, time);
                    break;
                case 'grating':
                    waveValue = gratingDiffraction(px, py, barrierX, centerY, time);
                    break;
                case 'circular':
                    waveValue = circularDiffraction(px, py, barrierX, centerY, time);
                    break;
            }

            // 正規化
            const normalized = Math.max(-1, Math.min(1, waveValue));

            // 顏色映射
            let r, g, b;
            if (normalized > 0) {
                r = Math.floor(normalized * 100);
                g = Math.floor(255 * normalized);
                b = Math.floor(255 * normalized);
            } else {
                r = 0;
                g = Math.floor(100 * (1 + normalized));
                b = Math.floor(150 * (1 + normalized));
            }

            // 填充像素塊
            for (let dy = 0; dy < resolution && py + dy < height; dy++) {
                for (let dx = 0; dx < resolution && px + dx < width; dx++) {
                    const idx = ((py + dy) * width + (px + dx)) * 4;
                    imageData.data[idx] = r;
                    imageData.data[idx + 1] = g;
                    imageData.data[idx + 2] = b;
                    imageData.data[idx + 3] = 255;
                }
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);

    // 繪製障礙物（有狹縫的牆）
    drawBarrier(barrierX, centerY, height);

    // 繪製強度圖
    if (showIntensity) {
        drawIntensityGraph(width, height, barrierX, centerY);
    }

    // 繪製標籤
    drawLabels(width, height, barrierX);
}

// 繪製障礙物
function drawBarrier(barrierX, centerY, height) {
    ctx.fillStyle = '#333';

    switch (mode) {
        case 'single':
            // 上半部分
            ctx.fillRect(barrierX - 5, 0, 10, centerY - slitWidth / 2);
            // 下半部分
            ctx.fillRect(barrierX - 5, centerY + slitWidth / 2, 10, height - centerY - slitWidth / 2);
            break;

        case 'double':
            const slit1Center = centerY - slitSpacing / 2;
            const slit2Center = centerY + slitSpacing / 2;

            ctx.fillRect(barrierX - 5, 0, 10, slit1Center - slitWidth / 2);
            ctx.fillRect(barrierX - 5, slit1Center + slitWidth / 2, 10, slit2Center - slitWidth / 2 - slit1Center - slitWidth / 2);
            ctx.fillRect(barrierX - 5, slit2Center + slitWidth / 2, 10, height - slit2Center - slitWidth / 2);
            break;

        case 'grating':
            const totalHeight = (slitCount - 1) * slitSpacing;
            let lastY = 0;

            for (let s = 0; s < slitCount; s++) {
                const slitCenter = centerY - totalHeight / 2 + s * slitSpacing;
                const slitTop = slitCenter - slitWidth / 2;
                const slitBottom = slitCenter + slitWidth / 2;

                ctx.fillRect(barrierX - 5, lastY, 10, slitTop - lastY);
                lastY = slitBottom;
            }
            ctx.fillRect(barrierX - 5, lastY, 10, height - lastY);
            break;

        case 'circular':
            // 繪製圓孔周圍的障礙物
            ctx.fillRect(barrierX - 5, 0, 10, height);
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(barrierX, centerY, slitWidth / 2, 0, Math.PI * 2);
            ctx.fill();
            break;
    }

    // 障礙物邊框
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(barrierX - 5, 0, 10, height);
}

// 繪製強度圖
function drawIntensityGraph(width, height, barrierX, centerY) {
    const graphX = width * 0.85;
    const graphHeight = height * 0.8;
    const graphTop = (height - graphHeight) / 2;

    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(graphX - 10, graphTop - 20, 80, graphHeight + 40);

    // 軸線
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(graphX, graphTop);
    ctx.lineTo(graphX, graphTop + graphHeight);
    ctx.stroke();

    // 強度曲線
    ctx.beginPath();
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;

    for (let py = 0; py < graphHeight; py++) {
        const y = graphTop + py;
        let intensity = 0;

        // 計算該位置的平均強度
        for (let t = 0; t < 10; t++) {
            let wave;
            switch (mode) {
                case 'single':
                    wave = singleSlitDiffraction(width * 0.7, y, barrierX, centerY, t * 0.1);
                    break;
                case 'double':
                    wave = doubleSlitDiffraction(width * 0.7, y, barrierX, centerY, t * 0.1);
                    break;
                case 'grating':
                    wave = gratingDiffraction(width * 0.7, y, barrierX, centerY, t * 0.1);
                    break;
                case 'circular':
                    wave = circularDiffraction(width * 0.7, y, barrierX, centerY, t * 0.1);
                    break;
            }
            intensity += wave * wave;
        }
        intensity /= 10;

        const x = graphX + intensity * 50;

        if (py === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.stroke();

    // 標籤
    ctx.fillStyle = '#00ff88';
    ctx.font = '12px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('強度', graphX + 25, graphTop - 5);
}

// 繪製標籤
function drawLabels(width, height, barrierX) {
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';

    const modeLabels = {
        'single': '單狹縫繞射',
        'double': '雙狹縫干涉',
        'grating': '光柵繞射',
        'circular': '圓孔繞射'
    };

    ctx.fillText(modeLabels[mode], width / 2, 30);

    // 入射波標示
    ctx.fillStyle = '#888';
    ctx.font = '12px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('入射平面波', 20, height - 20);

    // 繞射波標示
    ctx.textAlign = 'right';
    ctx.fillText('繞射波', width - 20, height - 20);
}

// 動畫迴圈
function animate() {
    if (!isPlaying) return;

    time += 0.05;
    draw();

    animationId = requestAnimationFrame(animate);
}

// 啟動
document.addEventListener('DOMContentLoaded', init);
