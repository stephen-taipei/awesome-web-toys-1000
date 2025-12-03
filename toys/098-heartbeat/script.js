/**
 * Heartbeat 心跳聲 - Web Toys #098
 * 模擬真實心跳聲
 */

class HeartbeatApp {
    constructor() {
        this.canvas = document.getElementById('heartCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 音頻
        this.audioContext = null;
        this.masterGain = null;

        // 設定
        this.heartRate = 60;
        this.intensity = 0.5;
        this.rhythm = 'normal';
        this.volume = 0.5;

        // 狀態
        this.isPlaying = false;
        this.beatPhase = 0;
        this.lastBeatTime = 0;
        this.heartScale = 1;
        this.time = 0;

        // 心電圖數據
        this.ecgData = [];
        this.ecgPosition = 0;

        // 節律設定
        this.rhythmSettings = {
            normal: {
                variability: 0.05,
                pattern: [1, 1],
                name: '正常心律'
            },
            athletic: {
                variability: 0.02,
                pattern: [1, 1],
                name: '運動員心率'
            },
            excited: {
                variability: 0.08,
                pattern: [1, 0.95, 1.05],
                name: '興奮心率'
            },
            relaxed: {
                variability: 0.1,
                pattern: [1, 1.1, 0.9, 1],
                name: '放鬆心率'
            },
            irregular: {
                variability: 0.2,
                pattern: [1, 0.7, 1.3, 0.85, 1.15],
                name: '心律不齊'
            }
        };

        this.patternIndex = 0;
        this.nextBeatTime = 0;

        this.init();
    }

    async init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.initECG();
        this.setupControls();
        this.setupEventListeners();
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initECG() {
        this.ecgData = new Array(300).fill(0);
    }

    async initAudio() {
        if (this.audioContext) return;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // 主音量
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = this.volume;
        this.masterGain.connect(this.audioContext.destination);
    }

    setupControls() {
        // 播放按鈕
        const playBtn = document.getElementById('playBtn');
        playBtn.addEventListener('click', () => this.togglePlay());

        // 心率
        const heartRateSlider = document.getElementById('heartRate');
        heartRateSlider.addEventListener('input', (e) => {
            this.heartRate = parseInt(e.target.value);
            document.getElementById('heartRateValue').textContent = this.heartRate;
            document.getElementById('bpmDisplay').textContent = this.heartRate;
        });

        // 強度
        const intensitySlider = document.getElementById('intensity');
        intensitySlider.addEventListener('input', (e) => {
            this.intensity = parseInt(e.target.value) / 100;
            document.getElementById('intensityValue').textContent = this.getIntensityLabel(this.intensity);
        });

        // 節律
        const rhythmSelect = document.getElementById('rhythm');
        rhythmSelect.addEventListener('change', (e) => {
            this.rhythm = e.target.value;
            this.patternIndex = 0;
        });

        // 音量
        const volumeSlider = document.getElementById('volume');
        volumeSlider.addEventListener('input', (e) => {
            this.volume = parseInt(e.target.value) / 100;
            document.getElementById('volumeValue').textContent = e.target.value;
            if (this.masterGain) {
                this.masterGain.gain.setTargetAtTime(this.volume, this.audioContext.currentTime, 0.1);
            }
        });
    }

    getIntensityLabel(intensity) {
        if (intensity < 0.33) return '輕微';
        if (intensity < 0.66) return '正常';
        return '強烈';
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePlay();
            }
        });

        // 點擊心臟觸發心跳
        this.canvas.addEventListener('click', async (e) => {
            await this.initAudio();
            this.triggerBeat();
        });
    }

    async togglePlay() {
        if (this.isPlaying) {
            this.stop();
        } else {
            await this.start();
        }
    }

    async start() {
        await this.initAudio();

        this.isPlaying = true;
        this.nextBeatTime = this.audioContext.currentTime;
        this.scheduleBeat();

        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = '停止';
        playBtn.classList.add('playing');
        document.getElementById('statusDisplay').textContent = '跳動中';
    }

    stop() {
        this.isPlaying = false;

        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = '開始';
        playBtn.classList.remove('playing');
        document.getElementById('statusDisplay').textContent = '停止';
    }

    scheduleBeat() {
        if (!this.isPlaying) return;

        const now = this.audioContext.currentTime;

        if (now >= this.nextBeatTime) {
            this.playHeartbeat();

            // 計算下次心跳時間
            const settings = this.rhythmSettings[this.rhythm];
            const pattern = settings.pattern;
            const baseInterval = 60 / this.heartRate;

            // 應用節律模式
            const modifier = pattern[this.patternIndex % pattern.length];
            this.patternIndex++;

            // 添加自然變異
            const variability = (Math.random() - 0.5) * 2 * settings.variability;
            const interval = baseInterval * modifier * (1 + variability);

            this.nextBeatTime = now + interval;
        }

        setTimeout(() => this.scheduleBeat(), 50);
    }

    playHeartbeat() {
        const now = this.audioContext.currentTime;

        // 心跳分為兩個聲音：S1（lub）和 S2（dub）
        this.playS1(now);
        this.playS2(now + 0.12);

        // 視覺效果
        this.triggerBeat();
    }

    playS1(time) {
        // S1: 低沉的「lub」聲 - 心室收縮
        const intensity = this.intensity;

        // 主要頻率組件
        const osc1 = this.audioContext.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(60, time);
        osc1.frequency.exponentialRampToValueAtTime(40, time + 0.08);

        const osc2 = this.audioContext.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(80, time);
        osc2.frequency.exponentialRampToValueAtTime(50, time + 0.06);

        // 噪音成分（瓣膜關閉聲）
        const noiseBuffer = this.createNoiseBuffer(0.1);
        const noise = this.audioContext.createBufferSource();
        noise.buffer = noiseBuffer;

        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.value = 150;

        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.setValueAtTime(0.3 * intensity, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

        // 振盪器增益
        const osc1Gain = this.audioContext.createGain();
        osc1Gain.gain.setValueAtTime(0.5 * intensity, time);
        osc1Gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

        const osc2Gain = this.audioContext.createGain();
        osc2Gain.gain.setValueAtTime(0.3 * intensity, time);
        osc2Gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

        // 連接
        osc1.connect(osc1Gain);
        osc2.connect(osc2Gain);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);

        osc1Gain.connect(this.masterGain);
        osc2Gain.connect(this.masterGain);
        noiseGain.connect(this.masterGain);

        // 啟動
        osc1.start(time);
        osc1.stop(time + 0.15);
        osc2.start(time);
        osc2.stop(time + 0.12);
        noise.start(time);
        noise.stop(time + 0.1);
    }

    playS2(time) {
        // S2: 較短促的「dub」聲 - 主動脈瓣關閉
        const intensity = this.intensity;

        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(90, time);
        osc.frequency.exponentialRampToValueAtTime(60, time + 0.05);

        const osc2 = this.audioContext.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(120, time);
        osc2.frequency.exponentialRampToValueAtTime(80, time + 0.04);

        // 噪音
        const noiseBuffer = this.createNoiseBuffer(0.08);
        const noise = this.audioContext.createBufferSource();
        noise.buffer = noiseBuffer;

        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 200;
        noiseFilter.Q.value = 2;

        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.setValueAtTime(0.2 * intensity, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

        const oscGain = this.audioContext.createGain();
        oscGain.gain.setValueAtTime(0.35 * intensity, time);
        oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);

        const osc2Gain = this.audioContext.createGain();
        osc2Gain.gain.setValueAtTime(0.2 * intensity, time);
        osc2Gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

        // 連接
        osc.connect(oscGain);
        osc2.connect(osc2Gain);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);

        oscGain.connect(this.masterGain);
        osc2Gain.connect(this.masterGain);
        noiseGain.connect(this.masterGain);

        // 啟動
        osc.start(time);
        osc.stop(time + 0.1);
        osc2.start(time);
        osc2.stop(time + 0.08);
        noise.start(time);
        noise.stop(time + 0.08);
    }

    createNoiseBuffer(duration) {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        return buffer;
    }

    triggerBeat() {
        this.heartScale = 1.3;
        this.beatPhase = 0;

        // 生成 ECG 波形
        this.generateECGBeat();
    }

    generateECGBeat() {
        // 模擬 PQRST 波形
        const beat = [];

        // P 波
        for (let i = 0; i < 10; i++) {
            beat.push(Math.sin(i / 10 * Math.PI) * 0.15);
        }

        // PR 段
        for (let i = 0; i < 5; i++) {
            beat.push(0);
        }

        // Q 波
        beat.push(-0.1);

        // R 波（尖峰）
        beat.push(0.2);
        beat.push(1.0);
        beat.push(0.3);

        // S 波
        beat.push(-0.2);

        // ST 段
        for (let i = 0; i < 8; i++) {
            beat.push(0);
        }

        // T 波
        for (let i = 0; i < 12; i++) {
            beat.push(Math.sin(i / 12 * Math.PI) * 0.25);
        }

        // 添加到 ECG 數據
        for (const value of beat) {
            this.ecgData.push(value);
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.time += 0.016;
        this.updateHeart();
        this.drawBackground();
        this.drawECG();
        this.drawHeart();
        this.drawPulseRings();

        requestAnimationFrame(() => this.animate());
    }

    updateHeart() {
        // 心跳縮放動畫
        if (this.heartScale > 1) {
            this.heartScale -= 0.02;
            if (this.heartScale < 1) this.heartScale = 1;
        }

        this.beatPhase += 0.05;

        // 更新 ECG 滾動
        if (this.ecgData.length > 300) {
            this.ecgData.shift();
        }

        // 添加基線數據
        if (this.isPlaying && this.ecgData.length < 300) {
            this.ecgData.push(0);
        }
    }

    drawBackground() {
        const ctx = this.ctx;

        // 漸層背景
        const gradient = ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2,
            Math.max(this.canvas.width, this.canvas.height) * 0.7
        );

        const pulse = this.isPlaying ? (this.heartScale - 1) * 2 : 0;

        gradient.addColorStop(0, `rgba(40, 10, 20, ${0.5 + pulse * 0.3})`);
        gradient.addColorStop(0.5, '#0a0508');
        gradient.addColorStop(1, '#050305');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawECG() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const centerY = this.canvas.height * 0.8;
        const amplitude = 50;

        // 網格背景
        ctx.strokeStyle = 'rgba(200, 80, 100, 0.1)';
        ctx.lineWidth = 1;

        // 水平線
        for (let y = centerY - 100; y <= centerY + 100; y += 25) {
            ctx.beginPath();
            ctx.moveTo(50, y);
            ctx.lineTo(width - 50, y);
            ctx.stroke();
        }

        // 垂直線
        for (let x = 50; x <= width - 50; x += 25) {
            ctx.beginPath();
            ctx.moveTo(x, centerY - 100);
            ctx.lineTo(x, centerY + 100);
            ctx.stroke();
        }

        // ECG 曲線
        if (this.ecgData.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = '#c85064';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#c85064';

            const stepX = (width - 100) / 300;

            for (let i = 0; i < this.ecgData.length; i++) {
                const x = 50 + i * stepX;
                const y = centerY - this.ecgData[i] * amplitude;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // 標籤
        ctx.fillStyle = 'rgba(200, 80, 100, 0.6)';
        ctx.font = '12px monospace';
        ctx.fillText('ECG', 55, centerY - 85);
    }

    drawHeart() {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height * 0.4;
        const size = 80 * this.heartScale;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(size / 100, size / 100);

        // 心形路徑
        ctx.beginPath();
        ctx.moveTo(0, 30);
        ctx.bezierCurveTo(-50, -10, -100, 50, 0, 100);
        ctx.bezierCurveTo(100, 50, 50, -10, 0, 30);

        // 漸層填充
        const gradient = ctx.createRadialGradient(0, 40, 0, 0, 40, 100);
        gradient.addColorStop(0, '#ff4060');
        gradient.addColorStop(0.5, '#c82040');
        gradient.addColorStop(1, '#801020');

        ctx.fillStyle = gradient;
        ctx.fill();

        // 光澤
        ctx.beginPath();
        ctx.ellipse(-30, 20, 15, 20, -0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();

        ctx.restore();

        // 心率文字
        if (this.isPlaying) {
            ctx.fillStyle = '#c85064';
            ctx.font = 'bold 24px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${this.heartRate} BPM`, centerX, centerY + 150);
        }
    }

    drawPulseRings() {
        if (!this.isPlaying) return;

        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height * 0.4;

        // 脈衝環
        const pulsePhase = (this.heartScale - 1) * 5;
        if (pulsePhase > 0) {
            for (let i = 0; i < 3; i++) {
                const radius = 100 + pulsePhase * 100 + i * 30;
                const alpha = Math.max(0, 0.3 - pulsePhase * 0.5 - i * 0.1);

                ctx.beginPath();
                ctx.arc(centerX, centerY + 40, radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(200, 80, 100, ${alpha})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
    }

    destroy() {
        this.stop();
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// 啟動應用
document.addEventListener('DOMContentLoaded', () => {
    new HeartbeatApp();
});
