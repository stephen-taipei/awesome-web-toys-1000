/**
 * Ocean Waves 海浪聲 - Web Toys #100
 * 生成沉浸式海浪聲體驗
 */

class OceanWavesApp {
    constructor() {
        this.canvas = document.getElementById('oceanCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 音頻
        this.audioContext = null;
        this.masterGain = null;
        this.waveNodes = [];

        // 設定
        this.waveType = 'calm';
        this.depth = 0.5;
        this.seagullLevel = 0;
        this.volume = 0.5;

        // 狀態
        this.isPlaying = false;
        this.time = 0;
        this.wavePhase = 0;

        // 視覺波浪
        this.waves = [];

        // 海況設定
        this.waveSettings = {
            calm: {
                frequency: 0.08,
                amplitude: 20,
                speed: 0.3,
                layers: 3,
                crashRate: 0.01,
                name: '平靜'
            },
            gentle: {
                frequency: 0.1,
                amplitude: 35,
                speed: 0.5,
                layers: 4,
                crashRate: 0.02,
                name: '輕浪'
            },
            moderate: {
                frequency: 0.12,
                amplitude: 50,
                speed: 0.7,
                layers: 5,
                crashRate: 0.04,
                name: '中浪'
            },
            rough: {
                frequency: 0.15,
                amplitude: 70,
                speed: 1.0,
                layers: 6,
                crashRate: 0.08,
                name: '大浪'
            },
            stormy: {
                frequency: 0.18,
                amplitude: 100,
                speed: 1.5,
                layers: 7,
                crashRate: 0.15,
                name: '暴風浪'
            }
        };

        this.init();
    }

    async init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.setupControls();
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
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

        // 海況
        const waveTypeSelect = document.getElementById('waveType');
        waveTypeSelect.addEventListener('change', (e) => {
            this.waveType = e.target.value;
            this.updateDisplays();
            if (this.isPlaying) {
                this.restartWaveSound();
            }
        });

        // 深度
        const depthSlider = document.getElementById('depth');
        depthSlider.addEventListener('input', (e) => {
            this.depth = parseInt(e.target.value) / 100;
            document.getElementById('depthValue').textContent = this.getDepthLabel(this.depth);
        });

        // 海鷗
        const seagullsSlider = document.getElementById('seagulls');
        seagullsSlider.addEventListener('input', (e) => {
            this.seagullLevel = parseInt(e.target.value) / 100;
            document.getElementById('seagullsValue').textContent = this.getSeagullLabel(this.seagullLevel);
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

    getDepthLabel(depth) {
        if (depth < 0.33) return '淺';
        if (depth < 0.66) return '中等';
        return '深';
    }

    getSeagullLabel(level) {
        if (level < 0.1) return '關閉';
        if (level < 0.4) return '偶爾';
        if (level < 0.7) return '頻繁';
        return '密集';
    }

    updateDisplays() {
        document.getElementById('waveDisplay').textContent = this.waveSettings[this.waveType].name;
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
        this.startWaveSound();
        this.scheduleSeagulls();

        this.isPlaying = true;

        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = '停止';
        playBtn.classList.add('playing');
        document.getElementById('statusDisplay').textContent = '播放中';
    }

    stop() {
        this.stopWaveSound();
        this.isPlaying = false;

        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = '開始';
        playBtn.classList.remove('playing');
        document.getElementById('statusDisplay').textContent = '停止';
    }

    startWaveSound() {
        this.createOceanAmbience();
        this.scheduleWaveCrash();
    }

    createOceanAmbience() {
        const settings = this.waveSettings[this.waveType];

        // 基礎海浪噪音
        const bufferSize = this.audioContext.sampleRate * 4;
        const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);

        // 生成粉紅噪音
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
                b6 = white * 0.115926;
            }
        }

        // 噪音源
        this.oceanNoise = this.audioContext.createBufferSource();
        this.oceanNoise.buffer = buffer;
        this.oceanNoise.loop = true;

        // 低通濾波器（深度）
        this.oceanFilter = this.audioContext.createBiquadFilter();
        this.oceanFilter.type = 'lowpass';
        this.oceanFilter.frequency.value = 800 + (1 - this.depth) * 1500;
        this.oceanFilter.Q.value = 0.5;

        // LFO 調製（波浪起伏）
        this.waveLfo = this.audioContext.createOscillator();
        this.waveLfo.type = 'sine';
        this.waveLfo.frequency.value = settings.frequency;

        this.lfoGain = this.audioContext.createGain();
        this.lfoGain.gain.value = 200;

        this.waveLfo.connect(this.lfoGain);
        this.lfoGain.connect(this.oceanFilter.frequency);

        // 音量包絡 LFO
        this.volumeLfo = this.audioContext.createOscillator();
        this.volumeLfo.type = 'sine';
        this.volumeLfo.frequency.value = settings.frequency * 0.7;

        this.volumeLfoGain = this.audioContext.createGain();
        this.volumeLfoGain.gain.value = 0.15;

        // 海浪音量
        this.oceanGain = this.audioContext.createGain();
        this.oceanGain.gain.value = 0.3;

        this.volumeLfo.connect(this.volumeLfoGain);
        this.volumeLfoGain.connect(this.oceanGain.gain);

        // 連接
        this.oceanNoise.connect(this.oceanFilter);
        this.oceanFilter.connect(this.oceanGain);
        this.oceanGain.connect(this.masterGain);

        this.oceanNoise.start();
        this.waveLfo.start();
        this.volumeLfo.start();

        this.waveNodes.push(this.oceanNoise, this.waveLfo, this.volumeLfo);
    }

    scheduleWaveCrash() {
        if (!this.isPlaying) return;

        const settings = this.waveSettings[this.waveType];

        if (Math.random() < settings.crashRate) {
            this.playWaveCrash();
        }

        setTimeout(() => this.scheduleWaveCrash(), 500);
    }

    playWaveCrash() {
        const now = this.audioContext.currentTime;
        const settings = this.waveSettings[this.waveType];
        const duration = 2 + Math.random() * 2;

        // 噪音
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;

        // 濾波
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000 + Math.random() * 500;
        filter.Q.value = 0.8;

        // 包絡
        const gain = this.audioContext.createGain();
        const intensity = 0.1 + settings.amplitude / 200;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(intensity, now + 0.3);
        gain.gain.linearRampToValueAtTime(intensity * 0.7, now + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start(now);
        noise.stop(now + duration);
    }

    scheduleSeagulls() {
        if (!this.isPlaying) return;

        if (this.seagullLevel > 0.1 && Math.random() < this.seagullLevel * 0.02) {
            this.playSeagull();
        }

        setTimeout(() => this.scheduleSeagulls(), 1000);
    }

    playSeagull() {
        const now = this.audioContext.currentTime;
        const duration = 0.5 + Math.random() * 0.5;

        // 基頻
        const baseFreq = 800 + Math.random() * 400;

        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.linearRampToValueAtTime(baseFreq * 1.5, now + duration * 0.3);
        osc.frequency.linearRampToValueAtTime(baseFreq * 0.8, now + duration);

        // 顫音
        const vibrato = this.audioContext.createOscillator();
        vibrato.type = 'sine';
        vibrato.frequency.value = 8;

        const vibratoGain = this.audioContext.createGain();
        vibratoGain.gain.value = 30;

        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);

        // 包絡
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.05 * this.seagullLevel, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        // 聲像（左右隨機）
        const panner = this.audioContext.createStereoPanner();
        panner.pan.value = Math.random() * 2 - 1;

        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.masterGain);

        osc.start(now);
        vibrato.start(now);
        osc.stop(now + duration);
        vibrato.stop(now + duration);
    }

    restartWaveSound() {
        this.stopWaveSound();
        this.startWaveSound();
    }

    stopWaveSound() {
        for (const node of this.waveNodes) {
            try {
                node.stop();
            } catch (e) {}
        }
        this.waveNodes = [];
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.time += 0.016;
        this.wavePhase += this.waveSettings[this.waveType].speed * 0.02;

        this.drawSky();
        this.drawSun();
        this.drawOcean();
        this.drawFoam();

        requestAnimationFrame(() => this.animate());
    }

    drawSky() {
        const ctx = this.ctx;
        const horizon = this.canvas.height * 0.5;

        const gradient = ctx.createLinearGradient(0, 0, 0, horizon);
        gradient.addColorStop(0, '#0a1525');
        gradient.addColorStop(0.5, '#1a3050');
        gradient.addColorStop(1, '#2a4570');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, horizon);

        // 星星
        if (!this.isPlaying) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            for (let i = 0; i < 100; i++) {
                const x = (i * 97.3) % this.canvas.width;
                const y = (i * 53.7) % (horizon * 0.8);
                ctx.beginPath();
                ctx.arc(x, y, 0.5 + Math.random(), 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    drawSun() {
        const ctx = this.ctx;
        const x = this.canvas.width * 0.7;
        const y = this.canvas.height * 0.25;
        const radius = 40;

        // 光暈
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 4);
        gradient.addColorStop(0, 'rgba(255, 200, 100, 0.3)');
        gradient.addColorStop(0.5, 'rgba(255, 150, 50, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 100, 50, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius * 4, 0, Math.PI * 2);
        ctx.fill();

        // 太陽
        ctx.fillStyle = '#ffcc66';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    drawOcean() {
        const ctx = this.ctx;
        const settings = this.waveSettings[this.waveType];
        const horizon = this.canvas.height * 0.5;

        // 海水漸層
        const gradient = ctx.createLinearGradient(0, horizon, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a4060');
        gradient.addColorStop(0.3, '#0a2840');
        gradient.addColorStop(1, '#051520');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, horizon, this.canvas.width, this.canvas.height - horizon);

        // 波浪層
        for (let layer = 0; layer < settings.layers; layer++) {
            const layerY = horizon + layer * 40;
            const amplitude = settings.amplitude * (1 - layer * 0.1);
            const frequency = 0.005 + layer * 0.002;
            const speed = this.wavePhase * (1 + layer * 0.2);

            ctx.beginPath();
            ctx.moveTo(0, layerY);

            for (let x = 0; x <= this.canvas.width; x += 5) {
                const y = layerY +
                    Math.sin(x * frequency + speed) * amplitude +
                    Math.sin(x * frequency * 2 + speed * 1.3) * amplitude * 0.3;
                ctx.lineTo(x, y);
            }

            ctx.lineTo(this.canvas.width, this.canvas.height);
            ctx.lineTo(0, this.canvas.height);
            ctx.closePath();

            const alpha = 0.3 - layer * 0.03;
            ctx.fillStyle = `rgba(20, 60, 100, ${alpha})`;
            ctx.fill();
        }

        // 光反射
        ctx.fillStyle = 'rgba(255, 200, 100, 0.1)';
        const reflectX = this.canvas.width * 0.7;
        for (let i = 0; i < 20; i++) {
            const x = reflectX + (Math.random() - 0.5) * 100;
            const y = horizon + 50 + i * 20 + Math.sin(this.time + i) * 5;
            const width = 30 + Math.random() * 50;
            ctx.fillRect(x - width / 2, y, width, 3);
        }
    }

    drawFoam() {
        if (!this.isPlaying) return;

        const ctx = this.ctx;
        const settings = this.waveSettings[this.waveType];

        // 浪花泡沫
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';

        for (let i = 0; i < settings.layers * 5; i++) {
            const x = (i * 137 + this.time * 50) % this.canvas.width;
            const baseY = this.canvas.height * 0.5 + 20 + (i % 3) * 30;
            const y = baseY + Math.sin(x * 0.01 + this.wavePhase) * settings.amplitude * 0.5;

            ctx.beginPath();
            ctx.arc(x, y, 3 + Math.random() * 5, 0, Math.PI * 2);
            ctx.fill();
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
    new OceanWavesApp();
});
