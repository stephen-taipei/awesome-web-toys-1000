/**
 * Wave Interference 波的干涉
 * Web Toy #181
 *
 * 功能：模擬兩個波源產生的干涉圖案
 * 可調整頻率、振幅、相位，觀察建設性與破壞性干涉
 */

// 全域變數
let canvas, ctx;
let isPlaying = true;
let animationId = null;
let time = 0;

// 波源設定
const sources = [
    { x: 0.3, y: 0.5, freq: 2, amp: 0.5, phase: 0, color: '#ff6464' },
    { x: 0.7, y: 0.5, freq: 2, amp: 0.5, phase: 0, color: '#6464ff' }
];

// 模擬參數
let waveSpeed = 100;
let showNodes = true;
let showAntinodes = true;
let colorMode = true;

// 像素資料
let imageData = null;

// 選中的波源（用於拖曳）
let selectedSource = null;
let isDragging = false;

// 初始化
function init() {
    canvas = document.getElementById('waveCanvas');
    ctx = canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 事件監聽
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

    // 控制項事件
    setupControls();

    // 更新波源標記
    updateSourceMarkers();

    // 開始動畫
    animate();
}

// 調整 Canvas 大小
function resizeCanvas() {
    const container = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = container.clientWidth * dpr;
    canvas.height = 500 * dpr;
    canvas.style.width = container.clientWidth + 'px';
    canvas.style.height = '500px';

    ctx.scale(dpr, dpr);
    imageData = ctx.createImageData(canvas.width, canvas.height);
}

// 設定控制項
function setupControls() {
    // 波源 1 控制
    document.getElementById('freq1').addEventListener('input', (e) => {
        sources[0].freq = parseFloat(e.target.value);
        document.getElementById('freq1Value').textContent = sources[0].freq.toFixed(1) + ' Hz';
    });

    document.getElementById('amp1').addEventListener('input', (e) => {
        sources[0].amp = parseFloat(e.target.value);
        document.getElementById('amp1Value').textContent = sources[0].amp.toFixed(1);
    });

    document.getElementById('phase1').addEventListener('input', (e) => {
        sources[0].phase = parseFloat(e.target.value);
        document.getElementById('phase1Value').textContent = sources[0].phase + '°';
    });

    // 波源 2 控制
    document.getElementById('freq2').addEventListener('input', (e) => {
        sources[1].freq = parseFloat(e.target.value);
        document.getElementById('freq2Value').textContent = sources[1].freq.toFixed(1) + ' Hz';
    });

    document.getElementById('amp2').addEventListener('input', (e) => {
        sources[1].amp = parseFloat(e.target.value);
        document.getElementById('amp2Value').textContent = sources[1].amp.toFixed(1);
    });

    document.getElementById('phase2').addEventListener('input', (e) => {
        sources[1].phase = parseFloat(e.target.value);
        document.getElementById('phase2Value').textContent = sources[1].phase + '°';
    });

    // 顯示設定
    document.getElementById('waveSpeed').addEventListener('input', (e) => {
        waveSpeed = parseInt(e.target.value);
        document.getElementById('waveSpeedValue').textContent = waveSpeed;
    });

    document.getElementById('showNodes').addEventListener('change', (e) => {
        showNodes = e.target.checked;
    });

    document.getElementById('showAntinodes').addEventListener('change', (e) => {
        showAntinodes = e.target.checked;
    });

    document.getElementById('colorMode').addEventListener('change', (e) => {
        colorMode = e.target.checked;
    });

    // 按鈕
    document.getElementById('playBtn').addEventListener('click', togglePlay);
    document.getElementById('resetBtn').addEventListener('click', reset);
    document.getElementById('presetBtn').addEventListener('click', applyPreset);
}

// 切換播放/暫停
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

    sources[0] = { x: 0.3, y: 0.5, freq: 2, amp: 0.5, phase: 0, color: '#ff6464' };
    sources[1] = { x: 0.7, y: 0.5, freq: 2, amp: 0.5, phase: 0, color: '#6464ff' };
    waveSpeed = 100;

    // 更新控制項
    document.getElementById('freq1').value = 2;
    document.getElementById('freq1Value').textContent = '2.0 Hz';
    document.getElementById('amp1').value = 0.5;
    document.getElementById('amp1Value').textContent = '0.5';
    document.getElementById('phase1').value = 0;
    document.getElementById('phase1Value').textContent = '0°';

    document.getElementById('freq2').value = 2;
    document.getElementById('freq2Value').textContent = '2.0 Hz';
    document.getElementById('amp2').value = 0.5;
    document.getElementById('amp2Value').textContent = '0.5';
    document.getElementById('phase2').value = 0;
    document.getElementById('phase2Value').textContent = '0°';

    document.getElementById('waveSpeed').value = 100;
    document.getElementById('waveSpeedValue').textContent = '100';

    updateSourceMarkers();
}

// 應用預設干涉圖案
function applyPreset() {
    sources[0] = { x: 0.35, y: 0.5, freq: 3, amp: 0.6, phase: 0, color: '#ff6464' };
    sources[1] = { x: 0.65, y: 0.5, freq: 3, amp: 0.6, phase: 0, color: '#6464ff' };
    waveSpeed = 120;

    // 更新控制項
    document.getElementById('freq1').value = 3;
    document.getElementById('freq1Value').textContent = '3.0 Hz';
    document.getElementById('amp1').value = 0.6;
    document.getElementById('amp1Value').textContent = '0.6';
    document.getElementById('phase1').value = 0;
    document.getElementById('phase1Value').textContent = '0°';

    document.getElementById('freq2').value = 3;
    document.getElementById('freq2Value').textContent = '3.0 Hz';
    document.getElementById('amp2').value = 0.6;
    document.getElementById('amp2Value').textContent = '0.6';
    document.getElementById('phase2').value = 0;
    document.getElementById('phase2Value').textContent = '0°';

    document.getElementById('waveSpeed').value = 120;
    document.getElementById('waveSpeedValue').textContent = '120';

    updateSourceMarkers();
}

// 更新波源標記
function updateSourceMarkers() {
    const container = document.getElementById('sourceMarkers');
    const rect = canvas.getBoundingClientRect();

    container.innerHTML = '';

    sources.forEach((source, i) => {
        const marker = document.createElement('div');
        marker.className = `source-marker source${i + 1}`;
        marker.style.left = (source.x * rect.width) + 'px';
        marker.style.top = (source.y * 500) + 'px';
        container.appendChild(marker);
    });
}

// 滑鼠事件處理
function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / 500;

    // 檢查是否點擊在波源附近
    for (let i = 0; i < sources.length; i++) {
        const dx = x - sources[i].x;
        const dy = y - sources[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.05) {
            selectedSource = i;
            isDragging = true;
            return;
        }
    }

    // 如果沒有點擊波源，移動最近的波源
    let minDist = Infinity;
    let closestSource = 0;

    for (let i = 0; i < sources.length; i++) {
        const dx = x - sources[i].x;
        const dy = y - sources[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < minDist) {
            minDist = dist;
            closestSource = i;
        }
    }

    sources[closestSource].x = x;
    sources[closestSource].y = y;
    updateSourceMarkers();
}

function handleMouseMove(e) {
    if (!isDragging || selectedSource === null) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / 500));

    sources[selectedSource].x = x;
    sources[selectedSource].y = y;
    updateSourceMarkers();
}

function handleMouseUp() {
    isDragging = false;
    selectedSource = null;
}

// 觸控事件處理
function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
}

function handleTouchEnd(e) {
    e.preventDefault();
    handleMouseUp();
}

// 計算波的振幅（在指定位置和時間）
function calculateWave(x, y, source, t) {
    const dx = x - source.x;
    const dy = y - source.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 避免除以零
    if (distance < 0.001) return source.amp;

    // 波的相位（考慮距離、頻率、時間和初始相位）
    const k = 2 * Math.PI * source.freq / (waveSpeed / 1000); // 波數
    const omega = 2 * Math.PI * source.freq; // 角頻率
    const phaseRad = source.phase * Math.PI / 180;

    // 衰減因子（距離越遠振幅越小）
    const attenuation = 1 / (1 + distance * 2);

    // 波的值
    return source.amp * attenuation * Math.sin(k * distance - omega * t + phaseRad);
}

// 繪製干涉圖案
function draw() {
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = 500;
    const dpr = window.devicePixelRatio || 1;

    // 清除畫布
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // 建立像素資料
    const imgData = ctx.createImageData(width * dpr, height * dpr);
    const data = imgData.data;

    // 計算每個像素的波值
    for (let py = 0; py < height * dpr; py++) {
        for (let px = 0; px < width * dpr; px++) {
            const x = px / (width * dpr);
            const y = py / (height * dpr);

            // 計算來自兩個波源的疊加
            let totalWave = 0;
            for (const source of sources) {
                totalWave += calculateWave(x, y, source, time);
            }

            // 正規化（-1 到 1 之間）
            const normalizedWave = Math.max(-1, Math.min(1, totalWave));

            // 計算像素索引
            const idx = (py * width * dpr + px) * 4;

            if (colorMode) {
                // 彩色模式：建設性干涉為暖色，破壞性為冷色
                if (normalizedWave > 0) {
                    // 建設性干涉 - 暖色（紅橙黃）
                    const intensity = normalizedWave;
                    data[idx] = Math.floor(255 * intensity);     // R
                    data[idx + 1] = Math.floor(100 * intensity); // G
                    data[idx + 2] = Math.floor(50 * intensity);  // B
                } else {
                    // 破壞性干涉 - 冷色（藍紫）
                    const intensity = -normalizedWave;
                    data[idx] = Math.floor(50 * intensity);      // R
                    data[idx + 1] = Math.floor(100 * intensity); // G
                    data[idx + 2] = Math.floor(255 * intensity); // B
                }
            } else {
                // 灰度模式
                const gray = Math.floor(128 + 127 * normalizedWave);
                data[idx] = gray;
                data[idx + 1] = gray;
                data[idx + 2] = gray;
            }

            data[idx + 3] = 255; // Alpha
        }
    }

    ctx.putImageData(imgData, 0, 0);

    // 繪製波源位置
    sources.forEach((source, i) => {
        const sx = source.x * width;
        const sy = source.y * height;

        // 波源光暈
        const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, 30);
        gradient.addColorStop(0, source.color);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(sx, sy, 30, 0, Math.PI * 2);
        ctx.fill();

        // 波源中心
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(sx, sy, 5, 0, Math.PI * 2);
        ctx.fill();

        // 標籤
        ctx.fillStyle = '#fff';
        ctx.font = '12px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`S${i + 1}`, sx, sy - 15);
    });

    // 顯示節點和波腹線
    if (showNodes || showAntinodes) {
        drawInterferenceLines(width, height);
    }
}

// 繪製干涉線（節點線和波腹線）
function drawInterferenceLines(width, height) {
    const s1 = sources[0];
    const s2 = sources[1];

    // 計算波源之間的距離
    const dx = s2.x - s1.x;
    const dy = s2.y - s1.y;
    const d = Math.sqrt(dx * dx + dy * dy);

    // 波長（簡化計算）
    const wavelength = waveSpeed / (1000 * sources[0].freq);

    // 相位差（弧度）
    const phaseDiff = (s2.phase - s1.phase) * Math.PI / 180;

    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;

    // 繪製多條干涉線
    for (let m = -10; m <= 10; m++) {
        // 路徑差對應的位置
        const pathDiff = m * wavelength;

        // 繪製雙曲線（近似為直線在遠處）
        ctx.beginPath();

        for (let t = 0; t <= 1; t += 0.01) {
            const angle = t * Math.PI * 2;
            const r = 0.3 + t * 0.5;

            // 中點
            const mx = (s1.x + s2.x) / 2;
            const my = (s1.y + s2.y) / 2;

            // 沿著雙曲線
            const a = pathDiff / 2;
            const c = d / 2;

            if (Math.abs(a) < c) {
                const b = Math.sqrt(c * c - a * a);

                // 旋轉角度
                const rotAngle = Math.atan2(dy, dx);

                // 雙曲線點
                const hx = a * Math.cosh(angle - Math.PI);
                const hy = b * Math.sinh(angle - Math.PI);

                // 旋轉和平移
                const px = mx + hx * Math.cos(rotAngle) - hy * Math.sin(rotAngle);
                const py = my + hx * Math.sin(rotAngle) + hy * Math.cos(rotAngle);

                if (px >= 0 && px <= 1 && py >= 0 && py <= 1) {
                    if (t === 0) {
                        ctx.moveTo(px * width, py * height);
                    } else {
                        ctx.lineTo(px * width, py * height);
                    }
                }
            }
        }

        // 節點線（破壞性干涉）
        if (showNodes && m % 1 === 0) {
            ctx.strokeStyle = '#00ffff';
            ctx.stroke();
        }
    }

    ctx.globalAlpha = 1;
}

// 動畫迴圈
function animate() {
    if (!isPlaying) return;

    time += 0.016; // 約 60fps
    draw();

    animationId = requestAnimationFrame(animate);
}

// 啟動
document.addEventListener('DOMContentLoaded', init);
