/**
 * Wind Sound 風聲 - Web Toys #102
 * 生成各種風聲體驗
 */

class WindSoundApp {
    constructor() {
        this.canvas = document.getElementById('windCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 音頻
        this.audioContext = null;
        this.masterGain = null;
        this.windNoise = null;
        this.whistleOsc = null;

        // 設定
        this.windType = 'breeze';
        this.gustiness = 0.5;
        this.whistleLevel = 0;
        this.volume = 0.5;

        // 狀態
        this.isPlaying = false;
        this.time = 0;
        this.gustPhase = 0;

        // 視覺元素
        this.particles = [];
        this.leaves = [];
        this.clouds = [];

        // 風型設定
        this.windSettings = {
            breeze: {
                baseGain: 0.15,
                filterFreq: 800,
                gustStrength: 0.2,
                speed: 1,
                name: '微風'
            },
            gentle: {
                baseGain: 0.25,
                filterFreq: 1000,
                gustStrength: 0.35,
                speed: 2,
                name: '輕風'
            },
            moderate: {
                baseGain: 0.35,
                filterFreq: 1200,
                gustStrength: 0.5,
                speed: 3,
                name: '和風'
            },
            strong: {
                baseGain: 0.5,
                filterFreq: 1500,
                gustStrength: 0.7,
                speed: 5,
                name: '強風'
            },
            gale: {
                baseGain: 0.7,
                filterFreq: 2000,
                gustStrength: 1,
                speed: 8,
                name: '暴風'
            }
        };

        this.init();
    }

    async init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.setupControls();
        this.initVisuals();
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.initVisuals();
    }

    initVisuals() {
        // 粒子（灰塵/空氣流動）
        this.particles = [];
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 2 + 1,
                opacity: Math.random() * 0.3
            });
        }

        // 落葉
        this.leaves = [];
        for (let i = 0; i < 15; i++) {
            this.leaves.push(this.createLeaf());
        }

        // 雲朵
        this.clouds = [];
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: 50 + Math.random() * 150,
                width: 100 + Math.random() * 150,
                speed: 0.2 + Math.random() * 0.3
            });
        }
    }

    createLeaf() {
        return {
            x: -50,
            y: Math.random() * this.canvas.height * 0.7,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
            size: 8 + Math.random() * 8,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.05 + Math.random() * 0.05,
            color: `hsl(${30 + Math.random() * 30}, ${50 + Math.random() * 30}%, ${30 + Math.random() * 20}%)`
        };
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

        // 風型
        const windTypeSelect = document.getElementById('windType');
        windTypeSelect.addEventListener('change', (e) => {
            this.windType = e.target.value;
            this.updateDisplays();
            if (this.isPlaying) {
                this.updateWindSound();
            }
        });

        // 陣風
        const gustinessSlider = document.getElementById('gustiness');
        gustinessSlider.addEventListener('input', (e) => {
            this.gustiness = parseInt(e.target.value) / 100;
            document.getElementById('gustinessValue').textContent = this.getLabel(this.gustiness);
        });

        // 呼嘯聲
        const whistleSlider = document.getElementById('whistle');
        whistleSlider.addEventListener('input', (e) => {
            this.whistleLevel = parseInt(e.target.value) / 100;
            document.getElementById('whistleValue').textContent = this.getWhistleLabel(this.whistleLevel);
            if (this.isPlaying) {
                this.updateWhistle();
            }
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

    getLabel(value) {
        if (value < 0.33) return '弱';
        if (value < 0.66) return '中等';
        return '強';
    }

    getWhistleLabel(level) {
        if (level < 0.1) return '關閉';
        if (level < 0.4) return '輕微';
        if (level < 0.7) return '明顯';
        return '強烈';
    }

    updateDisplays() {
        document.getElementById('windDisplay').textContent = this.windSettings[this.windType].name;
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
        this.startWindSound();

        this.isPlaying = true;

        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = '停止';
        playBtn.classList.add('playing');
        document.getElementById('statusDisplay').textContent = '播放中';
    }

    stop() {
        this.stopWindSound();
        this.isPlaying = false;

        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = '開始';
        playBtn.classList.remove('playing');
        document.getElementById('statusDisplay').textContent = '停止';
    }

    startWindSound() {
        const settings = this.windSettings[this.windType];

        // 創建風聲噪音
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

        this.windNoise = this.audioContext.createBufferSource();
        this.windNoise.buffer = buffer;
        this.windNoise.loop = true;

        // 帶通濾波器
        this.windFilter = this.audioContext.createBiquadFilter();
        this.windFilter.type = 'bandpass';
        this.windFilter.frequency.value = settings.filterFreq;
        this.windFilter.Q.value = 0.5;

        // 陣風 LFO
        this.gustLfo = this.audioContext.createOscillator();
        this.gustLfo.type = 'sine';
        this.gustLfo.frequency.value = 0.1 + this.gustiness * 0.2;

        this.gustLfoGain = this.audioContext.createGain();
        this.gustLfoGain.gain.value = settings.gustStrength * this.gustiness * 0.2;

        // 風聲音量
        this.windGain = this.audioContext.createGain();
        this.windGain.gain.value = settings.baseGain;

        this.gustLfo.connect(this.gustLfoGain);
        this.gustLfoGain.connect(this.windGain.gain);

        // 連接
        this.windNoise.connect(this.windFilter);
        this.windFilter.connect(this.windGain);
        this.windGain.connect(this.masterGain);

        this.windNoise.start();
        this.gustLfo.start();

        // 呼嘯聲
        if (this.whistleLevel > 0) {
            this.startWhistle();
        }
    }

    startWhistle() {
        if (this.whistleOsc) return;

        const settings = this.windSettings[this.windType];

        this.whistleOsc = this.audioContext.createOscillator();
        this.whistleOsc.type = 'sine';
        this.whistleOsc.frequency.value = 400 + settings.speed * 50;

        // 頻率調變
        this.whistleLfo = this.audioContext.createOscillator();
        this.whistleLfo.type = 'sine';
        this.whistleLfo.frequency.value = 0.3;

        this.whistleLfoGain = this.audioContext.createGain();
        this.whistleLfoGain.gain.value = 50 + settings.speed * 20;

        this.whistleLfo.connect(this.whistleLfoGain);
        this.whistleLfoGain.connect(this.whistleOsc.frequency);

        // 呼嘯音量
        this.whistleGain = this.audioContext.createGain();
        this.whistleGain.gain.value = this.whistleLevel * 0.05;

        this.whistleOsc.connect(this.whistleGain);
        this.whistleGain.connect(this.masterGain);

        this.whistleOsc.start();
        this.whistleLfo.start();
    }

    updateWhistle() {
        if (this.whistleLevel > 0 && !this.whistleOsc) {
            this.startWhistle();
        } else if (this.whistleGain) {
            this.whistleGain.gain.setTargetAtTime(
                this.whistleLevel * 0.05,
                this.audioContext.currentTime,
                0.3
            );
        }
    }

    updateWindSound() {
        if (!this.windFilter) return;

        const settings = this.windSettings[this.windType];
        const now = this.audioContext.currentTime;

        this.windFilter.frequency.setTargetAtTime(settings.filterFreq, now, 0.5);
        this.windGain.gain.setTargetAtTime(settings.baseGain, now, 0.5);
        this.gustLfo.frequency.setTargetAtTime(0.1 + this.gustiness * 0.2, now, 0.3);
        this.gustLfoGain.gain.setTargetAtTime(settings.gustStrength * this.gustiness * 0.2, now, 0.3);

        if (this.whistleOsc) {
            this.whistleOsc.frequency.setTargetAtTime(400 + settings.speed * 50, now, 0.3);
        }
    }

    stopWindSound() {
        if (this.windNoise) {
            this.windNoise.stop();
            this.windNoise = null;
        }
        if (this.gustLfo) {
            this.gustLfo.stop();
            this.gustLfo = null;
        }
        if (this.whistleOsc) {
            this.whistleOsc.stop();
            this.whistleOsc = null;
        }
        if (this.whistleLfo) {
            this.whistleLfo.stop();
            this.whistleLfo = null;
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.time += 0.016;
        this.gustPhase += 0.02;

        const settings = this.windSettings[this.windType];
        const windStrength = this.isPlaying ? settings.speed : 0.5;

        this.drawBackground();
        this.drawClouds(windStrength);
        this.updateParticles(windStrength);
        this.drawParticles();
        this.updateLeaves(windStrength);
        this.drawLeaves();
        this.drawWindLines(windStrength);

        requestAnimationFrame(() => this.animate());
    }

    drawBackground() {
        const ctx = this.ctx;

        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a2030');
        gradient.addColorStop(0.5, '#2a3545');
        gradient.addColorStop(1, '#1a2535');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawClouds(windStrength) {
        const ctx = this.ctx;

        for (const cloud of this.clouds) {
            cloud.x += cloud.speed * windStrength;
            if (cloud.x > this.canvas.width + cloud.width) {
                cloud.x = -cloud.width;
            }

            ctx.fillStyle = 'rgba(60, 70, 90, 0.4)';
            this.drawCloud(cloud.x, cloud.y, cloud.width);
        }
    }

    drawCloud(x, y, size) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
        ctx.arc(x + size * 0.25, y - size * 0.1, size * 0.25, 0, Math.PI * 2);
        ctx.arc(x + size * 0.5, y, size * 0.28, 0, Math.PI * 2);
        ctx.arc(x + size * 0.25, y + size * 0.08, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }

    updateParticles(windStrength) {
        for (const p of this.particles) {
            const gust = Math.sin(this.gustPhase + p.y * 0.01) * this.gustiness;
            p.x += p.speed * windStrength * (1 + gust);
            p.y += Math.sin(this.time * 2 + p.x * 0.01) * 0.5;

            if (p.x > this.canvas.width + 10) {
                p.x = -10;
                p.y = Math.random() * this.canvas.height;
            }
        }
    }

    drawParticles() {
        const ctx = this.ctx;

        for (const p of this.particles) {
            ctx.fillStyle = `rgba(200, 210, 220, ${p.opacity})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    updateLeaves(windStrength) {
        for (const leaf of this.leaves) {
            const gust = Math.sin(this.gustPhase + leaf.y * 0.02) * this.gustiness;
            leaf.x += windStrength * 3 * (1 + gust * 0.5);
            leaf.y += Math.sin(leaf.wobble) * 2;
            leaf.wobble += leaf.wobbleSpeed * windStrength;
            leaf.rotation += leaf.rotationSpeed * windStrength;

            if (leaf.x > this.canvas.width + 50) {
                Object.assign(leaf, this.createLeaf());
            }
        }
    }

    drawLeaves() {
        const ctx = this.ctx;

        for (const leaf of this.leaves) {
            ctx.save();
            ctx.translate(leaf.x, leaf.y);
            ctx.rotate(leaf.rotation);

            ctx.fillStyle = leaf.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, leaf.size, leaf.size * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();

            // 葉脈
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(-leaf.size * 0.8, 0);
            ctx.lineTo(leaf.size * 0.8, 0);
            ctx.stroke();

            ctx.restore();
        }
    }

    drawWindLines(windStrength) {
        if (!this.isPlaying || windStrength < 2) return;

        const ctx = this.ctx;
        const lineCount = Math.floor(windStrength * 3);

        ctx.strokeStyle = 'rgba(200, 210, 220, 0.1)';
        ctx.lineWidth = 1;

        for (let i = 0; i < lineCount; i++) {
            const y = (this.time * 100 + i * 80) % this.canvas.height;
            const length = 50 + windStrength * 20;
            const x = (this.time * windStrength * 50 + i * 200) % (this.canvas.width + length) - length;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + length, y + Math.sin(this.time + i) * 5);
            ctx.stroke();
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
    new WindSoundApp();
});
