/**
 * Wind Chimes 風鈴聲
 * Web Toys #080
 *
 * 風鈴音效模擬器
 *
 * 技術重點：
 * - 物理模擬風鈴擺動
 * - 泛音合成
 * - 殘響效果
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('chimeCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    material: 'metal',
    windSpeed: 40,
    tuning: 'pentatonic',
    chimeCount: 5,
    reverb: 50,
    volume: 0.5,
    timer: 0
};

// 音訊相關
let audioContext = null;
let masterGain = null;
let convolver = null;
let isPlaying = false;

// 風鈴物理
let chimes = [];
let windPhase = 0;

// 定時器
let timerEndTime = 0;
let timerInterval = null;
let windTimeout = null;

// 音階定義
const scales = {
    pentatonic: [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26],
    major: [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19],
    minor: [0, 2, 3, 5, 7, 8, 10, 12, 14, 15, 17, 19],
    chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
};

// 材質音色
const materials = {
    metal: { baseFreq: 880, decay: 3, harmonics: [1, 2, 3, 4.2, 5.4], brightness: 0.8 },
    bamboo: { baseFreq: 440, decay: 0.8, harmonics: [1, 2.8, 4.5], brightness: 0.3 },
    glass: { baseFreq: 1200, decay: 2, harmonics: [1, 2, 3.5, 5], brightness: 1.0 },
    ceramic: { baseFreq: 660, decay: 1.5, harmonics: [1, 2.2, 3.8, 5.2], brightness: 0.5 }
};

// ==================== 初始化 ====================

function init() {
    resizeCanvas();
    createChimes();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function createChimes() {
    chimes = [];
    const centerX = canvas.width / 2;
    const startY = 100;
    const spacing = Math.min(60, (canvas.width - 200) / config.chimeCount);

    const scale = scales[config.tuning];

    for (let i = 0; i < config.chimeCount; i++) {
        const x = centerX - ((config.chimeCount - 1) * spacing) / 2 + i * spacing;
        const length = 100 + (config.chimeCount - i) * 30;
        const semitones = scale[i % scale.length];
        const octave = Math.floor(i / scale.length);

        chimes.push({
            x: x,
            y: startY,
            length: length,
            angle: 0,
            velocity: 0,
            semitones: semitones + octave * 12,
            ringing: 0,
            lastCollision: 0
        });
    }
}

// ==================== 音訊控制 ====================

function startChimes() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }

    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    masterGain = audioContext.createGain();
    masterGain.gain.value = config.volume;

    // 創建殘響
    createReverb();

    masterGain.connect(convolver);
    convolver.connect(audioContext.destination);

    // 直接輸出也連接（乾濕混合）
    const dryGain = audioContext.createGain();
    dryGain.gain.value = 1 - config.reverb / 100;
    masterGain.connect(dryGain);
    dryGain.connect(audioContext.destination);

    isPlaying = true;
    scheduleWind();

    if (config.timer > 0) {
        startTimer();
    }

    document.getElementById('playBtn').textContent = '停止';
    document.getElementById('playBtn').classList.add('playing');
    document.getElementById('statusDisplay').textContent = '播放中';
}

function createReverb() {
    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * 2;
    const impulse = audioContext.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
        const data = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
            const decay = Math.exp(-i / (sampleRate * 0.5));
            data[i] = (Math.random() * 2 - 1) * decay;
        }
    }

    convolver = audioContext.createConvolver();
    convolver.buffer = impulse;

    const wetGain = audioContext.createGain();
    wetGain.gain.value = config.reverb / 100;

    convolver.connect(wetGain);
    wetGain.connect(audioContext.destination);
}

function playChime(chimeIndex) {
    if (!audioContext || !isPlaying) return;

    const chime = chimes[chimeIndex];
    const material = materials[config.material];

    // 計算頻率
    const baseFreq = material.baseFreq * Math.pow(2, chime.semitones / 12);

    // 創建泛音
    material.harmonics.forEach((harmonic, i) => {
        const osc = audioContext.createOscillator();
        const oscGain = audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.value = baseFreq * harmonic;

        // 泛音衰減
        const harmonicLevel = Math.pow(0.6, i) * material.brightness;
        const attackTime = 0.005;
        const decayTime = material.decay * (1 - i * 0.1);

        oscGain.gain.setValueAtTime(0, audioContext.currentTime);
        oscGain.gain.linearRampToValueAtTime(
            0.15 * harmonicLevel,
            audioContext.currentTime + attackTime
        );
        oscGain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + decayTime
        );

        osc.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start();
        osc.stop(audioContext.currentTime + decayTime);
    });

    // 擊打聲（噪音爆發）
    const noiseLength = 0.02;
    const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * noiseLength, audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);

    for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseData.length * 0.3));
    }

    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseGain = audioContext.createGain();
    noiseGain.gain.value = 0.1 * material.brightness;

    const noiseFilter = audioContext.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 2000;

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);

    noiseSource.start();

    // 標記風鈴正在響
    chime.ringing = 1;
}

function scheduleWind() {
    if (!isPlaying) return;

    // 風吹動風鈴
    const gustStrength = (config.windSpeed / 100) * (0.5 + Math.random() * 0.5);

    chimes.forEach((chime, index) => {
        // 隨機風力影響
        if (Math.random() < gustStrength * 0.3) {
            chime.velocity += (Math.random() - 0.5) * gustStrength * 0.5;
        }
    });

    // 下次風
    const nextWind = (2000 - config.windSpeed * 15) + Math.random() * 1000;
    windTimeout = setTimeout(scheduleWind, nextWind);
}

function stopChimes() {
    if (windTimeout) {
        clearTimeout(windTimeout);
        windTimeout = null;
    }

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        document.getElementById('timerDisplay').textContent = '';
    }

    isPlaying = false;

    document.getElementById('playBtn').textContent = '開始';
    document.getElementById('playBtn').classList.remove('playing');
    document.getElementById('statusDisplay').textContent = '停止';
}

function toggleChimes() {
    if (isPlaying) {
        stopChimes();
    } else {
        startChimes();
    }
}

function getWindSpeedName(value) {
    if (value < 30) return '微風';
    if (value < 60) return '輕風';
    if (value < 80) return '中風';
    return '強風';
}

function getReverbName(value) {
    if (value < 30) return '少量';
    if (value < 70) return '中等';
    return '豐富';
}

// ==================== 定時器 ====================

function startTimer() {
    timerEndTime = Date.now() + config.timer * 60 * 1000;

    timerInterval = setInterval(() => {
        const remaining = timerEndTime - Date.now();

        if (remaining <= 0) {
            stopChimes();
            return;
        }

        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        document.getElementById('timerDisplay').textContent =
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// ==================== 物理模擬 ====================

function updatePhysics() {
    const time = Date.now() / 1000;
    windPhase += 0.01;

    // 風力
    const windForce = Math.sin(windPhase) * (config.windSpeed / 100) * 0.02 +
                      Math.sin(windPhase * 2.7) * (config.windSpeed / 100) * 0.01;

    chimes.forEach((chime, index) => {
        // 風力影響
        if (isPlaying) {
            chime.velocity += windForce * (1 + Math.sin(index + time) * 0.3);
        }

        // 重力恢復
        const gravity = 0.002;
        chime.velocity -= Math.sin(chime.angle) * gravity;

        // 阻尼
        chime.velocity *= 0.995;

        // 更新角度
        chime.angle += chime.velocity;

        // 限制角度
        const maxAngle = 0.5;
        if (Math.abs(chime.angle) > maxAngle) {
            chime.angle = Math.sign(chime.angle) * maxAngle;
            chime.velocity *= -0.5;
        }

        // 衰減響鈴效果
        chime.ringing *= 0.95;

        // 碰撞檢測
        if (isPlaying && index > 0) {
            const prevChime = chimes[index - 1];
            const tipX = chime.x + Math.sin(chime.angle) * chime.length;
            const prevTipX = prevChime.x + Math.sin(prevChime.angle) * prevChime.length;

            const distance = Math.abs(tipX - prevTipX);
            const minDistance = 20;

            if (distance < minDistance && time - chime.lastCollision > 0.2) {
                // 碰撞！
                const collisionStrength = Math.abs(chime.velocity - prevChime.velocity);

                if (collisionStrength > 0.01) {
                    playChime(index);
                    if (Math.random() > 0.5) {
                        playChime(index - 1);
                    }

                    // 交換動量
                    const temp = chime.velocity;
                    chime.velocity = prevChime.velocity * 0.8;
                    prevChime.velocity = temp * 0.8;

                    chime.lastCollision = time;
                    prevChime.lastCollision = time;
                }
            }
        }
    });
}

// ==================== 視覺效果 ====================

function draw() {
    const time = Date.now() / 1000;

    // 背景
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0a1520');
    gradient.addColorStop(1, '#152030');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 星星
    for (let i = 0; i < 50; i++) {
        const x = (Math.sin(i * 0.7) + 1) / 2 * canvas.width;
        const y = (Math.cos(i * 1.3) + 1) / 2 * canvas.height * 0.6;
        const twinkle = 0.2 + Math.sin(time * 2 + i) * 0.15;

        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
    }

    // 月亮
    const moonX = canvas.width * 0.8;
    const moonY = canvas.height * 0.15;
    const moonGradient = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 40);
    moonGradient.addColorStop(0, 'rgba(255, 255, 230, 0.9)');
    moonGradient.addColorStop(0.5, 'rgba(255, 255, 200, 0.4)');
    moonGradient.addColorStop(1, 'transparent');

    ctx.fillStyle = moonGradient;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 40, 0, Math.PI * 2);
    ctx.fill();

    // 更新物理
    updatePhysics();

    // 繪製風鈴
    drawChimes();

    // 風的視覺效果
    if (isPlaying) {
        drawWindEffect(time);
    }

    requestAnimationFrame(draw);
}

function drawChimes() {
    const centerX = canvas.width / 2;

    // 頂部橫樑
    const beamY = 80;
    const beamWidth = (config.chimeCount - 1) * 60 + 100;

    ctx.fillStyle = '#3a2a20';
    ctx.beginPath();
    ctx.roundRect(centerX - beamWidth / 2, beamY - 10, beamWidth, 20, 5);
    ctx.fill();

    // 吊繩和風鈴
    chimes.forEach((chime, index) => {
        const startX = chime.x;
        const startY = chime.y;
        const tipX = startX + Math.sin(chime.angle) * chime.length;
        const tipY = startY + Math.cos(chime.angle) * chime.length;

        // 吊繩
        ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(startX, beamY);
        ctx.lineTo(startX, startY);
        ctx.stroke();

        // 風鈴管
        const tubeWidth = 8 + (config.chimeCount - index) * 2;

        // 材質顏色
        let color;
        switch (config.material) {
            case 'metal':
                color = chime.ringing > 0.1
                    ? `rgba(200, 220, 255, ${0.8 + chime.ringing * 0.2})`
                    : 'rgba(180, 200, 220, 0.9)';
                break;
            case 'bamboo':
                color = chime.ringing > 0.1
                    ? `rgba(180, 160, 100, ${0.8 + chime.ringing * 0.2})`
                    : 'rgba(160, 140, 80, 0.9)';
                break;
            case 'glass':
                color = chime.ringing > 0.1
                    ? `rgba(200, 240, 255, ${0.6 + chime.ringing * 0.4})`
                    : 'rgba(180, 220, 240, 0.7)';
                break;
            case 'ceramic':
                color = chime.ringing > 0.1
                    ? `rgba(240, 230, 220, ${0.8 + chime.ringing * 0.2})`
                    : 'rgba(220, 210, 200, 0.9)';
                break;
        }

        ctx.save();
        ctx.translate(startX, startY);
        ctx.rotate(chime.angle);

        // 風鈴管
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(-tubeWidth / 2, 0, tubeWidth, chime.length, 3);
        ctx.fill();

        // 高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.roundRect(-tubeWidth / 2 + 2, 5, 3, chime.length - 10, 1);
        ctx.fill();

        ctx.restore();

        // 發光效果
        if (chime.ringing > 0.1) {
            const glowGradient = ctx.createRadialGradient(
                (startX + tipX) / 2, (startY + tipY) / 2, 0,
                (startX + tipX) / 2, (startY + tipY) / 2, 50
            );
            glowGradient.addColorStop(0, `rgba(150, 200, 255, ${chime.ringing * 0.3})`);
            glowGradient.addColorStop(1, 'transparent');

            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc((startX + tipX) / 2, (startY + tipY) / 2, 50, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // 中心擺錘
    const centerPendulumLength = 150;
    const pendulumAngle = Math.sin(Date.now() / 1000 * (config.windSpeed / 50)) * 0.3;
    const pendulumX = centerX + Math.sin(pendulumAngle) * centerPendulumLength;
    const pendulumY = beamY + Math.cos(pendulumAngle) * centerPendulumLength;

    ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX, beamY);
    ctx.lineTo(pendulumX, pendulumY);
    ctx.stroke();

    ctx.fillStyle = '#4a3a30';
    ctx.beginPath();
    ctx.arc(pendulumX, pendulumY, 15, 0, Math.PI * 2);
    ctx.fill();
}

function drawWindEffect(time) {
    // 風的粒子
    const particleCount = Math.floor(config.windSpeed / 10);

    for (let i = 0; i < particleCount; i++) {
        const x = ((time * 100 + i * 50) % (canvas.width + 100)) - 50;
        const y = 100 + Math.sin(time + i) * 50 + i * 20;
        const alpha = 0.1 + Math.sin(time * 2 + i) * 0.05;

        ctx.strokeStyle = `rgba(200, 220, 255, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 20, y + Math.sin(time * 3 + i) * 5);
        ctx.stroke();
    }
}

// ==================== 事件處理 ====================

window.addEventListener('resize', () => {
    resizeCanvas();
    createChimes();
});

document.getElementById('playBtn').addEventListener('click', toggleChimes);

// 點擊觸發風鈴
canvas.addEventListener('click', (e) => {
    if (!isPlaying) return;

    // 找最近的風鈴
    let closestIndex = 0;
    let closestDist = Infinity;

    chimes.forEach((chime, index) => {
        const tipX = chime.x + Math.sin(chime.angle) * chime.length;
        const tipY = chime.y + Math.cos(chime.angle) * chime.length;
        const midX = (chime.x + tipX) / 2;
        const midY = (chime.y + tipY) / 2;

        const dist = Math.hypot(e.clientX - midX, e.clientY - midY);
        if (dist < closestDist) {
            closestDist = dist;
            closestIndex = index;
        }
    });

    if (closestDist < 100) {
        playChime(closestIndex);
        chimes[closestIndex].velocity += (Math.random() - 0.5) * 0.2;
    }
});

document.getElementById('material').addEventListener('change', (e) => {
    config.material = e.target.value;

    const materialNames = {
        metal: '金屬',
        bamboo: '竹製',
        glass: '玻璃',
        ceramic: '陶瓷'
    };
    document.getElementById('materialDisplay').textContent = materialNames[config.material];
});

document.getElementById('windSpeed').addEventListener('input', (e) => {
    config.windSpeed = parseInt(e.target.value);
    document.getElementById('windSpeedValue').textContent = getWindSpeedName(config.windSpeed);
});

document.getElementById('tuning').addEventListener('change', (e) => {
    config.tuning = e.target.value;
    createChimes();
});

document.getElementById('chimeCount').addEventListener('input', (e) => {
    config.chimeCount = parseInt(e.target.value);
    document.getElementById('chimeCountValue').textContent = config.chimeCount;
    createChimes();
});

document.getElementById('reverb').addEventListener('input', (e) => {
    config.reverb = parseInt(e.target.value);
    document.getElementById('reverbValue').textContent = getReverbName(config.reverb);
});

document.getElementById('volume').addEventListener('input', (e) => {
    config.volume = parseInt(e.target.value) / 100;
    document.getElementById('volumeValue').textContent = e.target.value;

    if (masterGain) {
        masterGain.gain.setValueAtTime(config.volume, audioContext.currentTime);
    }
});

document.getElementById('timer').addEventListener('change', (e) => {
    config.timer = parseInt(e.target.value);

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    if (isPlaying && config.timer > 0) {
        startTimer();
    } else {
        document.getElementById('timerDisplay').textContent = '';
    }
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        toggleChimes();
    }
});

// ==================== 啟動 ====================

init();
requestAnimationFrame(draw);
