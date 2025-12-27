/**
 * Slinky Wave 彈簧波
 * Web Toy #184
 *
 * 功能：模擬彈簧玩具上的縱波和橫波傳播
 * 展示橫波與縱波的差異
 */

// 全域變數
let canvas, ctx;
let isPlaying = true;
let animationId = null;
let time = 0;

// 波的參數
let waveType = 'transverse'; // transverse, longitudinal, pulse
let amplitude = 40;
let waveSpeed = 150;
let frequency = 1.5;

// 彈簧參數
let numCoils = 50;
let stiffness = 0.5;

// 彈簧線圈陣列
let coils = [];

// 脈衝波參數
let pulseActive = false;
let pulsePosition = 0;
let pulseWidth = 0.15;

// 初始化
function init() {
    canvas = document.getElementById('slinkyCanvas');
    ctx = canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    initCoils();
    setupControls();
    setupCanvasInteraction();
    animate();
}

// 調整 Canvas 大小
function resizeCanvas() {
    const container = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = container.clientWidth * dpr;
    canvas.height = 300 * dpr;
    canvas.style.width = container.clientWidth + 'px';
    canvas.style.height = '300px';

    ctx.scale(dpr, dpr);
    initCoils();
}

// 初始化線圈
function initCoils() {
    coils = [];
    const width = canvas.width / (window.devicePixelRatio || 1);
    const margin = 80;
    const availableWidth = width - 2 * margin;

    for (let i = 0; i < numCoils; i++) {
        coils.push({
            baseX: margin + (i / (numCoils - 1)) * availableWidth,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0
        });
    }
}

// 設定控制項
function setupControls() {
    // 波類型選擇
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            waveType = btn.dataset.type;

            if (waveType === 'pulse') {
                sendPulse();
            }
        });
    });

    // 振幅
    document.getElementById('amplitude').addEventListener('input', (e) => {
        amplitude = parseInt(e.target.value);
        document.getElementById('amplitudeValue').textContent = amplitude;
    });

    // 波速
    document.getElementById('waveSpeed').addEventListener('input', (e) => {
        waveSpeed = parseInt(e.target.value);
        document.getElementById('waveSpeedValue').textContent = waveSpeed;
    });

    // 頻率
    document.getElementById('frequency').addEventListener('input', (e) => {
        frequency = parseFloat(e.target.value);
        document.getElementById('frequencyValue').textContent = frequency.toFixed(1) + ' Hz';
    });

    // 線圈數
    document.getElementById('coils').addEventListener('input', (e) => {
        numCoils = parseInt(e.target.value);
        document.getElementById('coilsValue').textContent = numCoils;
        initCoils();
    });

    // 彈性
    document.getElementById('stiffness').addEventListener('input', (e) => {
        stiffness = parseFloat(e.target.value);
        document.getElementById('stiffnessValue').textContent = stiffness.toFixed(1);
    });

    // 按鈕
    document.getElementById('playBtn').addEventListener('click', togglePlay);
    document.getElementById('resetBtn').addEventListener('click', reset);
    document.getElementById('pulseBtn').addEventListener('click', sendPulse);
}

// 設定畫布互動
function setupCanvasInteraction() {
    let isMouseDown = false;

    canvas.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        handleCanvasInput(e);
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isMouseDown) {
            handleCanvasInput(e);
        }
    });

    canvas.addEventListener('mouseup', () => {
        isMouseDown = false;
    });

    canvas.addEventListener('mouseleave', () => {
        isMouseDown = false;
    });

    // 觸控支援
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleCanvasInput(e.touches[0]);
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        handleCanvasInput(e.touches[0]);
    });
}

// 處理畫布輸入
function handleCanvasInput(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    // 只在左側區域產生波
    if (x < width * 0.15) {
        const centerY = height / 2;
        const displacement = (y - centerY) * 1.5;

        // 擾動第一個線圈
        if (waveType === 'transverse') {
            coils[0].vy = displacement * 0.1;
        } else if (waveType === 'longitudinal') {
            coils[0].vx = (x - 50) * 0.2;
        }
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
    pulseActive = false;
    pulsePosition = 0;
    initCoils();
}

// 發送脈衝
function sendPulse() {
    pulseActive = true;
    pulsePosition = 0;
}

// 更新線圈位置
function updateCoils(dt) {
    const width = canvas.width / (window.devicePixelRatio || 1);
    const margin = 80;

    if (waveType === 'transverse') {
        // 橫波：質點在垂直方向振動
        for (let i = 0; i < coils.length; i++) {
            const normalizedPos = i / (coils.length - 1);
            const phase = normalizedPos * Math.PI * 4 - time * frequency * Math.PI * 2;
            coils[i].y = amplitude * Math.sin(phase);
            coils[i].x = 0;
        }
    } else if (waveType === 'longitudinal') {
        // 縱波：質點在水平方向振動
        for (let i = 0; i < coils.length; i++) {
            const normalizedPos = i / (coils.length - 1);
            const phase = normalizedPos * Math.PI * 4 - time * frequency * Math.PI * 2;
            coils[i].x = amplitude * 0.5 * Math.sin(phase);
            coils[i].y = 0;
        }
    } else if (waveType === 'pulse') {
        // 脈衝波
        if (pulseActive) {
            pulsePosition += waveSpeed * 0.0015;

            if (pulsePosition > 1.2) {
                pulseActive = false;
                pulsePosition = 0;
            }

            for (let i = 0; i < coils.length; i++) {
                const normalizedPos = i / (coils.length - 1);
                const distance = normalizedPos - pulsePosition;

                // 高斯脈衝形狀
                const pulseShape = Math.exp(-(distance * distance) / (2 * pulseWidth * pulseWidth));

                coils[i].y = amplitude * pulseShape;
                coils[i].x = 0;
            }
        } else {
            // 無脈衝時保持靜止
            for (let i = 0; i < coils.length; i++) {
                coils[i].x *= 0.95;
                coils[i].y *= 0.95;
            }
        }
    }
}

// 繪製
function draw() {
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = 300;
    const centerY = height / 2;
    const margin = 80;

    // 清除畫布
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, width, height);

    // 繪製背景格線
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    for (let y = 0; y <= height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // 繪製中心線
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.2)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(margin, centerY);
    ctx.lineTo(width - margin, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 繪製固定端
    drawFixedEnd(margin - 20, centerY, true);
    drawFixedEnd(width - margin + 20, centerY, false);

    // 繪製彈簧
    drawSlinky(centerY);

    // 繪製波傳播方向箭頭
    drawPropagationArrow(width, centerY);

    // 繪製振動方向指示
    drawVibrationIndicator(width, centerY);

    // 繪製說明文字
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';

    const typeLabels = {
        'transverse': '橫波 Transverse Wave',
        'longitudinal': '縱波 Longitudinal Wave',
        'pulse': '脈衝波 Pulse Wave'
    };
    ctx.fillText(typeLabels[waveType], width / 2, 30);
}

// 繪製固定端
function drawFixedEnd(x, y, isLeft) {
    ctx.fillStyle = '#555';
    ctx.fillRect(x - 5, y - 50, 10, 100);

    // 裝飾
    ctx.fillStyle = '#777';
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(x - 3, y - 40 + i * 20, 6, 10);
    }
}

// 繪製彈簧
function drawSlinky(centerY) {
    if (coils.length < 2) return;

    // 繪製彈簧線圈
    ctx.lineWidth = 3;

    for (let i = 0; i < coils.length - 1; i++) {
        const coil1 = coils[i];
        const coil2 = coils[i + 1];

        const x1 = coil1.baseX + coil1.x;
        const y1 = centerY + coil1.y;
        const x2 = coil2.baseX + coil2.x;
        const y2 = centerY + coil2.y;

        // 計算線圈間距（用於縱波壓縮顯示）
        const spacing = x2 - x1;
        const normalSpacing = (coils[1].baseX - coils[0].baseX);
        const compressionRatio = spacing / normalSpacing;

        // 根據壓縮程度調整顏色
        let color;
        if (waveType === 'longitudinal') {
            if (compressionRatio < 0.8) {
                // 壓縮區域 - 紅色
                color = `rgba(255, ${Math.floor(100 + compressionRatio * 100)}, 71, 1)`;
            } else if (compressionRatio > 1.2) {
                // 拉伸區域 - 藍色
                color = `rgba(100, ${Math.floor(200 - (compressionRatio - 1) * 100)}, 255, 1)`;
            } else {
                // 正常區域 - 金色
                color = '#ffd700';
            }
        } else {
            // 橫波和脈衝波使用金色
            const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
            gradient.addColorStop(0, '#ffd700');
            gradient.addColorStop(1, '#ff6347');
            color = gradient;
        }

        // 繪製彈簧線圈（簡化版螺旋）
        ctx.beginPath();
        ctx.strokeStyle = color;

        const segments = 8;
        const coilRadius = 15;

        for (let j = 0; j <= segments; j++) {
            const t = j / segments;
            const px = x1 + (x2 - x1) * t;
            const py = y1 + (y2 - y1) * t + Math.sin(t * Math.PI * 2) * coilRadius;

            if (j === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }

        ctx.stroke();
    }

    // 繪製線圈節點
    for (let i = 0; i < coils.length; i++) {
        const coil = coils[i];
        const x = coil.baseX + coil.x;
        const y = centerY + coil.y;

        // 節點
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
    }
}

// 繪製波傳播方向箭頭
function drawPropagationArrow(width, centerY) {
    const arrowY = centerY + 100;
    const startX = width * 0.3;
    const endX = width * 0.7;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, arrowY);
    ctx.lineTo(endX, arrowY);
    ctx.stroke();

    // 箭頭
    ctx.beginPath();
    ctx.moveTo(endX, arrowY);
    ctx.lineTo(endX - 10, arrowY - 5);
    ctx.lineTo(endX - 10, arrowY + 5);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();

    ctx.fillStyle = '#aaa';
    ctx.font = '12px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('波的傳播方向', (startX + endX) / 2, arrowY + 20);
}

// 繪製振動方向指示
function drawVibrationIndicator(width, centerY) {
    const indicatorX = 50;

    if (waveType === 'transverse') {
        // 垂直振動
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(indicatorX, centerY - 30);
        ctx.lineTo(indicatorX, centerY + 30);
        ctx.stroke();

        // 雙向箭頭
        ctx.beginPath();
        ctx.moveTo(indicatorX, centerY - 30);
        ctx.lineTo(indicatorX - 5, centerY - 20);
        ctx.moveTo(indicatorX, centerY - 30);
        ctx.lineTo(indicatorX + 5, centerY - 20);
        ctx.moveTo(indicatorX, centerY + 30);
        ctx.lineTo(indicatorX - 5, centerY + 20);
        ctx.moveTo(indicatorX, centerY + 30);
        ctx.lineTo(indicatorX + 5, centerY + 20);
        ctx.stroke();

        ctx.fillStyle = '#ffd700';
        ctx.font = '10px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('振動', indicatorX, centerY + 50);
    } else if (waveType === 'longitudinal') {
        // 水平振動
        ctx.strokeStyle = '#ff6347';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(indicatorX - 20, centerY);
        ctx.lineTo(indicatorX + 20, centerY);
        ctx.stroke();

        // 雙向箭頭
        ctx.beginPath();
        ctx.moveTo(indicatorX - 20, centerY);
        ctx.lineTo(indicatorX - 10, centerY - 5);
        ctx.moveTo(indicatorX - 20, centerY);
        ctx.lineTo(indicatorX - 10, centerY + 5);
        ctx.moveTo(indicatorX + 20, centerY);
        ctx.lineTo(indicatorX + 10, centerY - 5);
        ctx.moveTo(indicatorX + 20, centerY);
        ctx.lineTo(indicatorX + 10, centerY + 5);
        ctx.stroke();

        ctx.fillStyle = '#ff6347';
        ctx.font = '10px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('振動', indicatorX, centerY + 30);
    }
}

// 動畫迴圈
function animate() {
    if (!isPlaying) return;

    time += 0.016;
    updateCoils(0.016);
    draw();

    animationId = requestAnimationFrame(animate);
}

// 啟動
document.addEventListener('DOMContentLoaded', init);
