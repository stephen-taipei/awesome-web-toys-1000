/**
 * Standing Wave 駐波
 * Web Toy #183
 *
 * 功能：模擬弦上駐波的形成
 * 展示不同諧波模式、節點與波腹
 */

// 全域變數
let canvas, ctx;
let isPlaying = true;
let animationId = null;
let time = 0;

// 波的參數
let harmonicN = 1;      // 諧波數
let amplitude = 60;     // 振幅
let frequency = 1;      // 頻率倍率
let damping = 0;        // 阻尼

// 顯示選項
let showEnvelope = true;
let showComponents = true;
let showNodes = true;
let showAntinodes = true;

// 撥弦動畫
let pluckAmplitude = 0;
let isPlucking = false;

// 初始化
function init() {
    canvas = document.getElementById('waveCanvas');
    ctx = canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    setupControls();
    updateInfo();
    animate();
}

// 調整 Canvas 大小
function resizeCanvas() {
    const container = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = container.clientWidth * dpr;
    canvas.height = 350 * dpr;
    canvas.style.width = container.clientWidth + 'px';
    canvas.style.height = '350px';

    ctx.scale(dpr, dpr);
}

// 設定控制項
function setupControls() {
    // 諧波選擇
    document.querySelectorAll('.harmonic-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.harmonic-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            harmonicN = parseInt(btn.dataset.n);
            updateInfo();
            pluck();
        });
    });

    // 振幅
    document.getElementById('amplitude').addEventListener('input', (e) => {
        amplitude = parseInt(e.target.value);
        document.getElementById('amplitudeValue').textContent = amplitude;
    });

    // 頻率
    document.getElementById('frequency').addEventListener('input', (e) => {
        frequency = parseFloat(e.target.value);
        document.getElementById('frequencyValue').textContent = frequency.toFixed(1) + 'x';
    });

    // 阻尼
    document.getElementById('damping').addEventListener('input', (e) => {
        damping = parseFloat(e.target.value);
        document.getElementById('dampingValue').textContent = Math.round(damping * 100) + '%';
    });

    // 顯示選項
    document.getElementById('showEnvelope').addEventListener('change', (e) => {
        showEnvelope = e.target.checked;
    });

    document.getElementById('showComponents').addEventListener('change', (e) => {
        showComponents = e.target.checked;
    });

    document.getElementById('showNodes').addEventListener('change', (e) => {
        showNodes = e.target.checked;
    });

    document.getElementById('showAntinodes').addEventListener('change', (e) => {
        showAntinodes = e.target.checked;
    });

    // 按鈕
    document.getElementById('playBtn').addEventListener('click', togglePlay);
    document.getElementById('resetBtn').addEventListener('click', reset);
    document.getElementById('pluckBtn').addEventListener('click', pluck);
}

// 更新資訊顯示
function updateInfo() {
    document.getElementById('harmonicN').textContent = `n = ${harmonicN}`;
    document.getElementById('nodeCount').textContent = harmonicN + 1;
    document.getElementById('antinodeCount').textContent = harmonicN;

    // 波長
    const wavelengthText = harmonicN === 1 ? 'λ = 2L' :
                          harmonicN === 2 ? 'λ = L' :
                          `λ = 2L/${harmonicN}`;
    document.getElementById('wavelength').textContent = wavelengthText;
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
    pluckAmplitude = 0;
    isPlucking = false;
    harmonicN = 1;
    amplitude = 60;
    frequency = 1;
    damping = 0;

    // 更新控制項
    document.getElementById('amplitude').value = 60;
    document.getElementById('amplitudeValue').textContent = '60';
    document.getElementById('frequency').value = 1;
    document.getElementById('frequencyValue').textContent = '1.0x';
    document.getElementById('damping').value = 0;
    document.getElementById('dampingValue').textContent = '0%';

    document.querySelectorAll('.harmonic-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.n === '1') btn.classList.add('active');
    });

    updateInfo();
}

// 撥弦效果
function pluck() {
    pluckAmplitude = 1.5;
    isPlucking = true;
}

// 計算駐波 y 值
function standingWave(x, t, n, amp) {
    // y = 2A sin(kx) cos(ωt)
    // k = nπ/L, ω = nπv/L
    const k = n * Math.PI;
    const omega = n * Math.PI * frequency;

    // 加入阻尼
    const dampFactor = Math.exp(-damping * t);

    // 加入撥弦效果
    const pluckFactor = isPlucking ? pluckAmplitude : 1;

    return amp * pluckFactor * dampFactor * Math.sin(k * x) * Math.cos(omega * t);
}

// 計算行波（分量波）
function travelingWave(x, t, n, amp, direction) {
    const k = n * Math.PI;
    const omega = n * Math.PI * frequency;
    const dampFactor = Math.exp(-damping * t);

    return 0.5 * amp * dampFactor * Math.sin(k * x - direction * omega * t);
}

// 繪製
function draw() {
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = 350;
    const centerY = height / 2;
    const margin = 50;
    const stringLength = width - 2 * margin;

    // 清除畫布
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, width, height);

    // 繪製背景格線
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    for (let y = 0; y <= height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // 繪製中心線（平衡位置）
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(margin, centerY);
    ctx.lineTo(width - margin, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 繪製固定端
    ctx.fillStyle = '#888';
    ctx.fillRect(margin - 10, centerY - 40, 10, 80);
    ctx.fillRect(width - margin, centerY - 40, 10, 80);

    // 繪製包絡線
    if (showEnvelope) {
        const envelopeAmp = amplitude * (isPlucking ? pluckAmplitude : 1) * Math.exp(-damping * time);

        ctx.beginPath();
        for (let px = margin; px <= width - margin; px++) {
            const x = (px - margin) / stringLength;
            const y = envelopeAmp * Math.abs(Math.sin(harmonicN * Math.PI * x));

            if (px === margin) {
                ctx.moveTo(px, centerY - y);
            } else {
                ctx.lineTo(px, centerY - y);
            }
        }
        ctx.strokeStyle = 'rgba(240, 147, 251, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 下包絡線
        ctx.beginPath();
        for (let px = margin; px <= width - margin; px++) {
            const x = (px - margin) / stringLength;
            const y = envelopeAmp * Math.abs(Math.sin(harmonicN * Math.PI * x));

            if (px === margin) {
                ctx.moveTo(px, centerY + y);
            } else {
                ctx.lineTo(px, centerY + y);
            }
        }
        ctx.stroke();
    }

    // 繪製分量波（行波）
    if (showComponents) {
        // 向右行波
        ctx.beginPath();
        for (let px = margin; px <= width - margin; px++) {
            const x = (px - margin) / stringLength;
            const y = travelingWave(x, time, harmonicN, amplitude, 1);

            if (px === margin) {
                ctx.moveTo(px, centerY - y);
            } else {
                ctx.lineTo(px, centerY - y);
            }
        }
        ctx.strokeStyle = 'rgba(79, 172, 254, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 向左行波
        ctx.beginPath();
        for (let px = margin; px <= width - margin; px++) {
            const x = (px - margin) / stringLength;
            const y = travelingWave(x, time, harmonicN, amplitude, -1);

            if (px === margin) {
                ctx.moveTo(px, centerY - y);
            } else {
                ctx.lineTo(px, centerY - y);
            }
        }
        ctx.strokeStyle = 'rgba(245, 87, 108, 0.4)';
        ctx.stroke();
    }

    // 繪製主駐波
    ctx.beginPath();
    for (let px = margin; px <= width - margin; px++) {
        const x = (px - margin) / stringLength;
        const y = standingWave(x, time, harmonicN, amplitude);

        if (px === margin) {
            ctx.moveTo(px, centerY - y);
        } else {
            ctx.lineTo(px, centerY - y);
        }
    }

    // 漸層線條
    const gradient = ctx.createLinearGradient(margin, 0, width - margin, 0);
    gradient.addColorStop(0, '#f093fb');
    gradient.addColorStop(0.5, '#4facfe');
    gradient.addColorStop(1, '#f5576c');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // 繪製發光效果
    ctx.shadowColor = '#f093fb';
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 標記節點
    if (showNodes) {
        for (let i = 0; i <= harmonicN; i++) {
            const x = margin + (i / harmonicN) * stringLength;

            // 節點圓圈
            ctx.beginPath();
            ctx.arc(x, centerY, 8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(100, 200, 255, 0.8)';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // 標籤
            if (i === 0) {
                ctx.fillStyle = '#aaa';
                ctx.font = '12px "Segoe UI", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('節點', x, centerY + 60);
            }
        }
    }

    // 標記波腹
    if (showAntinodes) {
        for (let i = 0; i < harmonicN; i++) {
            const x = margin + ((i + 0.5) / harmonicN) * stringLength;
            const y = standingWave((i + 0.5) / harmonicN, time, harmonicN, amplitude);

            // 波腹標記（菱形）
            ctx.beginPath();
            ctx.moveTo(x, centerY - y - 10);
            ctx.lineTo(x + 8, centerY - y);
            ctx.lineTo(x, centerY - y + 10);
            ctx.lineTo(x - 8, centerY - y);
            ctx.closePath();
            ctx.fillStyle = 'rgba(240, 147, 251, 0.8)';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // 標籤（只在第一個波腹顯示）
            if (i === 0) {
                ctx.fillStyle = '#aaa';
                ctx.font = '12px "Segoe UI", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('波腹', x, centerY - 80);
            }
        }
    }

    // 繪製波長標示
    if (harmonicN <= 4) {
        const wavelengthPx = stringLength / harmonicN;
        const startX = margin;
        const endX = startX + wavelengthPx;
        const labelY = height - 30;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, labelY);
        ctx.lineTo(endX, labelY);
        ctx.moveTo(startX, labelY - 5);
        ctx.lineTo(startX, labelY + 5);
        ctx.moveTo(endX, labelY - 5);
        ctx.lineTo(endX, labelY + 5);
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '14px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('λ', (startX + endX) / 2, labelY - 10);
    }

    // 繪製諧波數標籤
    ctx.fillStyle = '#f093fb';
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`n = ${harmonicN}`, margin + 10, 30);

    // 繪製頻率指示
    const freqText = harmonicN === 1 ? 'f₁ (基頻)' : `f${harmonicN} = ${harmonicN}f₁`;
    ctx.fillStyle = '#4facfe';
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.fillText(freqText, margin + 10, 50);
}

// 動畫迴圈
function animate() {
    if (!isPlaying) return;

    time += 0.02;

    // 撥弦衰減
    if (isPlucking && pluckAmplitude > 1) {
        pluckAmplitude *= 0.98;
        if (pluckAmplitude <= 1.01) {
            pluckAmplitude = 1;
            isPlucking = false;
        }
    }

    draw();

    animationId = requestAnimationFrame(animate);
}

// 啟動
document.addEventListener('DOMContentLoaded', init);
