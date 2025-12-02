/**
 * Particle Music 粒子音樂
 * Web Toys #020
 *
 * 粒子碰撞邊界或彼此時產生音符
 * 創造隨機音樂，可調整音階
 *
 * 技術重點：
 * - Canvas 2D 粒子渲染
 * - Web Audio API 音訊合成
 * - 物理碰撞偵測
 * - 音樂理論（音階系統）
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

// ==================== 音訊設定 ====================

let audioContext = null;
let masterGain = null;
let isAudioStarted = false;

// 音階定義（以 C4 = 261.63 Hz 為基準）
const scales = {
    // 五聲音階 (C D E G A)
    pentatonic: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25],
    // 大調音階 (C D E F G A B)
    major: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25],
    // 小調音階 (A B C D E F G)
    minor: [220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00, 440.00],
    // 藍調音階
    blues: [261.63, 311.13, 349.23, 369.99, 392.00, 466.16, 523.25, 622.25],
    // 半音階
    chromatic: [261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30, 440.00, 466.16, 493.88]
};

// 音符名稱對應
const noteNames = {
    pentatonic: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5'],
    major: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
    minor: ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4'],
    blues: ['C4', 'Eb4', 'F4', 'Gb4', 'G4', 'Bb4', 'C5', 'Eb5'],
    chromatic: ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4']
};

// ==================== 配置參數 ====================

let config = {
    particleCount: 30,
    gravity: 0.3,
    bounceEnergy: 0.8,
    scale: 'pentatonic',
    volume: 0.5
};

// ==================== 粒子系統 ====================

let particles = [];

/**
 * 粒子類別
 */
class Particle {
    constructor(x, y) {
        this.x = x || Math.random() * canvas.width;
        this.y = y || Math.random() * canvas.height * 0.5;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 4;
        this.radius = 8 + Math.random() * 12;
        this.mass = this.radius * 0.5;

        // 根據音高範圍分配顏色
        this.hue = Math.random() * 60 + 10; // 橙黃色系
        this.color = `hsl(${this.hue}, 80%, 60%)`;
        this.glowColor = `hsla(${this.hue}, 100%, 70%, 0.5)`;

        // 音符索引（根據 Y 位置決定）
        this.noteIndex = 0;
        this.lastPlayTime = 0;
        this.isGlowing = false;
        this.glowIntensity = 0;
    }

    /**
     * 更新粒子物理狀態
     */
    update(deltaTime) {
        // 應用重力
        this.vy += config.gravity;

        // 更新位置
        this.x += this.vx;
        this.y += this.vy;

        // 更新音符索引（根據 Y 位置）
        const currentScale = scales[config.scale];
        const normalizedY = this.y / (canvas.height - 80);
        this.noteIndex = Math.floor(normalizedY * currentScale.length);
        this.noteIndex = Math.max(0, Math.min(currentScale.length - 1, this.noteIndex));

        // 更新顏色（根據音高）
        this.hue = 30 + (this.noteIndex / currentScale.length) * 40;
        this.color = `hsl(${this.hue}, 80%, 60%)`;
        this.glowColor = `hsla(${this.hue}, 100%, 70%, 0.5)`;

        // 發光效果衰減
        if (this.glowIntensity > 0) {
            this.glowIntensity -= 0.05;
        }

        // 邊界碰撞
        this.checkBoundaryCollision();
    }

    /**
     * 檢測邊界碰撞
     */
    checkBoundaryCollision() {
        const now = Date.now();
        const minInterval = 100; // 最小播放間隔（毫秒）
        const bottomLimit = canvas.height - 80; // 留給鋼琴的空間

        // 左右邊界
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx = -this.vx * config.bounceEnergy;
            if (now - this.lastPlayTime > minInterval) {
                this.playNote();
                this.lastPlayTime = now;
            }
        } else if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.vx = -this.vx * config.bounceEnergy;
            if (now - this.lastPlayTime > minInterval) {
                this.playNote();
                this.lastPlayTime = now;
            }
        }

        // 上下邊界
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy = -this.vy * config.bounceEnergy;
            if (now - this.lastPlayTime > minInterval) {
                this.playNote();
                this.lastPlayTime = now;
            }
        } else if (this.y + this.radius > bottomLimit) {
            this.y = bottomLimit - this.radius;
            this.vy = -this.vy * config.bounceEnergy;
            if (now - this.lastPlayTime > minInterval) {
                this.playNote();
                this.lastPlayTime = now;
            }
        }
    }

    /**
     * 播放音符
     */
    playNote() {
        if (!isAudioStarted || !audioContext) return;

        const currentScale = scales[config.scale];
        const frequency = currentScale[this.noteIndex];

        // 發光效果
        this.glowIntensity = 1;

        // 顯示音符名稱
        const names = noteNames[config.scale];
        document.getElementById('noteDisplay').textContent = names[this.noteIndex];

        // 高亮鋼琴鍵
        highlightPianoKey(this.noteIndex);

        // 創建音訊節點
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filterNode = audioContext.createBiquadFilter();

        // 使用正弦波 + 泛音創造更豐富的音色
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

        // 低通濾波器使聲音更柔和
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(2000, audioContext.currentTime);
        filterNode.Q.setValueAtTime(1, audioContext.currentTime);

        // ADSR 包絡
        const now = audioContext.currentTime;
        const attack = 0.01;
        const decay = 0.1;
        const sustain = 0.3;
        const release = 0.3;
        const duration = 0.5;

        // 根據速度調整音量
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const velocityVolume = Math.min(1, speed / 15) * config.volume;

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(velocityVolume, now + attack);
        gainNode.gain.linearRampToValueAtTime(velocityVolume * sustain, now + attack + decay);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);

        // 連接節點
        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(masterGain);

        // 播放
        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    /**
     * 繪製粒子
     */
    draw(ctx) {
        ctx.save();

        // 發光效果
        if (this.glowIntensity > 0) {
            const glowRadius = this.radius * (1.5 + this.glowIntensity);
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, glowRadius
            );
            gradient.addColorStop(0, `hsla(${this.hue}, 100%, 80%, ${this.glowIntensity * 0.8})`);
            gradient.addColorStop(0.5, `hsla(${this.hue}, 100%, 60%, ${this.glowIntensity * 0.3})`);
            gradient.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        }

        // 主體
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3, this.y - this.radius * 0.3, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, `hsl(${this.hue}, 80%, 80%)`);
        gradient.addColorStop(0.7, this.color);
        gradient.addColorStop(1, `hsl(${this.hue}, 80%, 40%)`);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // 高光
        ctx.beginPath();
        ctx.arc(
            this.x - this.radius * 0.3,
            this.y - this.radius * 0.3,
            this.radius * 0.2,
            0, Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();

        ctx.restore();
    }
}

/**
 * 檢測粒子間碰撞
 */
function checkParticleCollisions() {
    const now = Date.now();
    const minInterval = 150;

    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDist = p1.radius + p2.radius;

            if (distance < minDist) {
                // 碰撞發生
                const angle = Math.atan2(dy, dx);
                const sin = Math.sin(angle);
                const cos = Math.cos(angle);

                // 旋轉速度向量
                const vx1 = p1.vx * cos + p1.vy * sin;
                const vy1 = p1.vy * cos - p1.vx * sin;
                const vx2 = p2.vx * cos + p2.vy * sin;
                const vy2 = p2.vy * cos - p2.vx * sin;

                // 彈性碰撞公式
                const m1 = p1.mass;
                const m2 = p2.mass;
                const u1 = vx1;
                const u2 = vx2;

                const v1 = ((m1 - m2) * u1 + 2 * m2 * u2) / (m1 + m2);
                const v2 = ((m2 - m1) * u2 + 2 * m1 * u1) / (m1 + m2);

                // 旋轉回原座標系
                p1.vx = (v1 * cos - vy1 * sin) * config.bounceEnergy;
                p1.vy = (vy1 * cos + v1 * sin) * config.bounceEnergy;
                p2.vx = (v2 * cos - vy2 * sin) * config.bounceEnergy;
                p2.vy = (vy2 * cos + v2 * sin) * config.bounceEnergy;

                // 分離粒子
                const overlap = minDist - distance;
                const separationX = (overlap / 2) * cos;
                const separationY = (overlap / 2) * sin;

                p1.x -= separationX;
                p1.y -= separationY;
                p2.x += separationX;
                p2.y += separationY;

                // 播放音符
                if (now - p1.lastPlayTime > minInterval) {
                    p1.playNote();
                    p1.lastPlayTime = now;
                }
                if (now - p2.lastPlayTime > minInterval) {
                    p2.playNote();
                    p2.lastPlayTime = now;
                }
            }
        }
    }
}

// ==================== 鋼琴鍵視覺化 ====================

function createPianoKeys() {
    const container = document.getElementById('pianoKeys');
    container.innerHTML = '';

    const currentScale = scales[config.scale];
    const noteCount = currentScale.length;

    for (let i = 0; i < noteCount; i++) {
        const key = document.createElement('div');
        key.className = 'piano-key';
        key.dataset.index = i;
        container.appendChild(key);
    }
}

function highlightPianoKey(index) {
    const keys = document.querySelectorAll('.piano-key');
    keys.forEach((key, i) => {
        if (i === index) {
            key.classList.add('active');
            setTimeout(() => key.classList.remove('active'), 200);
        }
    });
}

// ==================== 初始化粒子 ====================

function initParticles() {
    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
        particles.push(new Particle());
    }
    document.getElementById('particleDisplay').textContent = particles.length;
}

// ==================== 音訊初始化 ====================

function initAudio() {
    if (audioContext) return;

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(config.volume, audioContext.currentTime);
    masterGain.connect(audioContext.destination);

    // 添加混響效果
    const convolver = audioContext.createConvolver();
    // 簡單的混響（使用衰減的噪音）
    const reverbTime = 1.5;
    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * reverbTime;
    const impulse = audioContext.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
            channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
        }
    }

    convolver.buffer = impulse;

    isAudioStarted = true;
}

// ==================== 動畫迴圈 ====================

let lastTime = 0;

function animate(currentTime) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // 清除畫布
    ctx.fillStyle = 'rgba(26, 26, 46, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 繪製音高區域指示線
    drawPitchZones();

    // 更新和繪製粒子
    particles.forEach(particle => {
        particle.update(deltaTime);
        particle.draw(ctx);
    });

    // 檢測粒子間碰撞
    checkParticleCollisions();

    requestAnimationFrame(animate);
}

/**
 * 繪製音高區域指示
 */
function drawPitchZones() {
    const currentScale = scales[config.scale];
    const zoneHeight = (canvas.height - 80) / currentScale.length;

    ctx.save();
    ctx.globalAlpha = 0.1;

    for (let i = 0; i < currentScale.length; i++) {
        const y = i * zoneHeight;
        const hue = 30 + (i / currentScale.length) * 40;

        ctx.fillStyle = `hsl(${hue}, 60%, 50%)`;
        ctx.fillRect(0, y, canvas.width, zoneHeight);

        // 分隔線
        ctx.strokeStyle = `hsl(${hue}, 80%, 60%)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    ctx.restore();
}

// ==================== 畫布大小調整 ====================

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(dpr, dpr);

    // 重置畫布寬高（用於繪製計算）
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// ==================== 事件處理 ====================

window.addEventListener('resize', () => {
    resizeCanvas();
});

// 點擊添加粒子
canvas.addEventListener('click', (e) => {
    if (!isAudioStarted) {
        initAudio();
        document.getElementById('startBtn').textContent = '暫停音樂';
        document.getElementById('startBtn').classList.add('active');
    }

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (y < canvas.height - 80) {
        particles.push(new Particle(x, y));
        document.getElementById('particleDisplay').textContent = particles.length;
    }
});

// 觸控支援
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();

    if (!isAudioStarted) {
        initAudio();
        document.getElementById('startBtn').textContent = '暫停音樂';
        document.getElementById('startBtn').classList.add('active');
    }

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    if (y < canvas.height - 80) {
        particles.push(new Particle(x, y));
        document.getElementById('particleDisplay').textContent = particles.length;
    }
}, { passive: false });

// 控制面板事件
document.getElementById('particleCount').addEventListener('input', (e) => {
    config.particleCount = parseInt(e.target.value);
    document.getElementById('particleCountValue').textContent = config.particleCount;
});

document.getElementById('gravity').addEventListener('input', (e) => {
    config.gravity = parseFloat(e.target.value);
    document.getElementById('gravityValue').textContent = config.gravity.toFixed(2);
});

document.getElementById('bounceEnergy').addEventListener('input', (e) => {
    config.bounceEnergy = parseFloat(e.target.value);
    document.getElementById('bounceEnergyValue').textContent = config.bounceEnergy.toFixed(2);
});

document.getElementById('scale').addEventListener('change', (e) => {
    config.scale = e.target.value;
    createPianoKeys();
});

document.getElementById('volume').addEventListener('input', (e) => {
    config.volume = parseInt(e.target.value) / 100;
    document.getElementById('volumeValue').textContent = e.target.value;
    if (masterGain) {
        masterGain.gain.setValueAtTime(config.volume, audioContext.currentTime);
    }
});

document.getElementById('startBtn').addEventListener('click', () => {
    if (!isAudioStarted) {
        initAudio();
        document.getElementById('startBtn').textContent = '暫停音樂';
        document.getElementById('startBtn').classList.add('active');
    } else {
        if (audioContext.state === 'running') {
            audioContext.suspend();
            document.getElementById('startBtn').textContent = '繼續音樂';
        } else {
            audioContext.resume();
            document.getElementById('startBtn').textContent = '暫停音樂';
        }
    }
});

document.getElementById('resetBtn').addEventListener('click', () => {
    initParticles();
});

// ==================== 初始化 ====================

resizeCanvas();
createPianoKeys();
initParticles();
requestAnimationFrame(animate);
