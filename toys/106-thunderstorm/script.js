/**
 * Thunderstorm 雷暴 - Web Toys #106
 * 生成震撼的雷暴體驗
 */

class ThunderstormApp {
    constructor() {
        this.canvas = document.getElementById('stormCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 音頻
        this.audioContext = null;
        this.masterGain = null;

        // 設定
        this.intensity = 0.5;
        this.thunderLevel = 0.5;
        this.rainLevel = 0.5;
        this.windLevel = 0.5;
        this.volume = 0.5;

        // 狀態
        this.isPlaying = false;
        this.time = 0;

        // 視覺元素
        this.raindrops = [];
        this.lightning = null;
        this.clouds = [];
        this.windStreaks = [];

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
        // 雨滴
        this.raindrops = [];
        const count = Math.floor(500 * this.rainLevel);
        for (let i = 0; i < count; i++) {
            this.raindrops.push(this.createRaindrop());
        }

        // 雲層
        this.clouds = [];
        for (let i = 0; i < 8; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * 200,
                width: 200 + Math.random() * 300,
                height: 80 + Math.random() * 60,
                speed: 0.2 + Math.random() * 0.3
            });
        }

        // 風痕
        this.windStreaks = [];
    }

    createRaindrop() {
        return {
            x: Math.random() * (this.canvas.width + 200) - 100,
            y: Math.random() * this.canvas.height - this.canvas.height,
            length: 15 + Math.random() * 20,
            speed: 15 + Math.random() * 10,
            opacity: 0.3 + Math.random() * 0.4
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

        // 風暴強度
        const intensitySlider = document.getElementById('intensity');
        intensitySlider.addEventListener('input', (e) => {
            this.intensity = parseInt(e.target.value) / 100;
            document.getElementById('intensityValue').textContent = this.getLabel(this.intensity);
            document.getElementById('stormDisplay').textContent = this.getLabel(this.intensity);
        });

        // 雷聲頻率
        const thunderSlider = document.getElementById('thunder');
        thunderSlider.addEventListener('input', (e) => {
            this.thunderLevel = parseInt(e.target.value) / 100;
            document.getElementById('thunderValue').textContent = this.getLabel(this.thunderLevel);
        });

        // 雨量
        const rainSlider = document.getElementById('rain');
        rainSlider.addEventListener('input', (e) => {
            this.rainLevel = parseInt(e.target.value) / 100;
            document.getElementById('rainValue').textContent = this.getLabel(this.rainLevel);
            this.updateRainCount();
            if (this.isPlaying) this.updateRainSound();
        });

        // 風聲
        const windSlider = document.getElementById('wind');
        windSlider.addEventListener('input', (e) => {
            this.windLevel = parseInt(e.target.value) / 100;
            document.getElementById('windValue').textContent = this.getLabel(this.windLevel);
            if (this.isPlaying) this.updateWindSound();
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

    updateRainCount() {
        const targetCount = Math.floor(500 * this.rainLevel);
        while (this.raindrops.length < targetCount) {
            this.raindrops.push(this.createRaindrop());
        }
        while (this.raindrops.length > targetCount) {
            this.raindrops.pop();
        }
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
        this.startRainSound();
        this.startWindSound();
        this.scheduleThunder();

        this.isPlaying = true;

        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = '停止';
        playBtn.classList.add('playing');
        document.getElementById('statusDisplay').textContent = '播放中';
    }

    stop() {
        this.stopAllSounds();
        this.isPlaying = false;

        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = '開始';
        playBtn.classList.remove('playing');
        document.getElementById('statusDisplay').textContent = '停止';
    }

    startRainSound() {
        const bufferSize = this.audioContext.sampleRate * 4;
        const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
        }

        this.rainNoise = this.audioContext.createBufferSource();
        this.rainNoise.buffer = buffer;
        this.rainNoise.loop = true;

        this.rainFilter = this.audioContext.createBiquadFilter();
        this.rainFilter.type = 'bandpass';
        this.rainFilter.frequency.value = 2000 + this.intensity * 1000;
        this.rainFilter.Q.value = 0.5;

        this.rainGain = this.audioContext.createGain();
        this.rainGain.gain.value = this.rainLevel * 0.3;

        this.rainNoise.connect(this.rainFilter);
        this.rainFilter.connect(this.rainGain);
        this.rainGain.connect(this.masterGain);

        this.rainNoise.start();
    }

    updateRainSound() {
        if (this.rainGain) {
            this.rainGain.gain.setTargetAtTime(
                this.rainLevel * 0.3,
                this.audioContext.currentTime,
                0.3
            );
        }
    }

    startWindSound() {
        const bufferSize = this.audioContext.sampleRate * 4;
        const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);

        // 粉紅噪音
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

        this.windFilter = this.audioContext.createBiquadFilter();
        this.windFilter.type = 'lowpass';
        this.windFilter.frequency.value = 500 + this.intensity * 500;

        // 風聲起伏
        this.windLfo = this.audioContext.createOscillator();
        this.windLfo.type = 'sine';
        this.windLfo.frequency.value = 0.1 + this.intensity * 0.2;

        this.windLfoGain = this.audioContext.createGain();
        this.windLfoGain.gain.value = 0.1;

        this.windGain = this.audioContext.createGain();
        this.windGain.gain.value = this.windLevel * 0.25;

        this.windLfo.connect(this.windLfoGain);
        this.windLfoGain.connect(this.windGain.gain);

        this.windNoise.connect(this.windFilter);
        this.windFilter.connect(this.windGain);
        this.windGain.connect(this.masterGain);

        this.windNoise.start();
        this.windLfo.start();
    }

    updateWindSound() {
        if (this.windGain) {
            this.windGain.gain.setTargetAtTime(
                this.windLevel * 0.25,
                this.audioContext.currentTime,
                0.3
            );
        }
    }

    scheduleThunder() {
        if (!this.isPlaying) return;

        const chance = this.thunderLevel * this.intensity * 0.02;
        if (Math.random() < chance) {
            this.triggerLightning();
        }

        setTimeout(() => this.scheduleThunder(), 500);
    }

    triggerLightning() {
        // 閃電視覺
        const type = Math.random() < 0.3 ? 'bolt' : 'flash';

        if (type === 'bolt') {
            this.lightning = {
                type: 'bolt',
                x: Math.random() * this.canvas.width,
                segments: this.generateLightningBolt(),
                intensity: 0.8 + Math.random() * 0.2,
                duration: 150 + Math.random() * 100
            };
        } else {
            this.lightning = {
                type: 'flash',
                intensity: 0.5 + Math.random() * 0.5,
                duration: 100 + Math.random() * 100
            };
        }

        setTimeout(() => {
            this.lightning = null;
        }, this.lightning.duration);

        // 雷聲延遲
        const delay = 200 + Math.random() * 2000;
        setTimeout(() => this.playThunder(), delay);
    }

    generateLightningBolt() {
        const segments = [];
        let x = this.canvas.width * (0.3 + Math.random() * 0.4);
        let y = 0;

        while (y < this.canvas.height * 0.7) {
            const nextX = x + (Math.random() - 0.5) * 100;
            const nextY = y + 30 + Math.random() * 50;

            segments.push({ x1: x, y1: y, x2: nextX, y2: nextY });

            // 分支
            if (Math.random() < 0.3) {
                const branchX = nextX + (Math.random() - 0.5) * 80;
                const branchY = nextY + 20 + Math.random() * 40;
                segments.push({ x1: nextX, y1: nextY, x2: branchX, y2: branchY, branch: true });
            }

            x = nextX;
            y = nextY;
        }

        return segments;
    }

    playThunder() {
        if (!this.audioContext || !this.isPlaying) return;

        const now = this.audioContext.currentTime;
        const duration = 2 + Math.random() * 4;
        const loudness = this.thunderLevel * this.intensity;

        // 低頻隆隆聲
        const osc = this.audioContext.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(50 + Math.random() * 30, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + duration);

        // 噪音成分
        const noiseBuffer = this.audioContext.createBuffer(
            2,
            this.audioContext.sampleRate * duration,
            this.audioContext.sampleRate
        );

        for (let channel = 0; channel < 2; channel++) {
            const data = noiseBuffer.getChannelData(channel);
            for (let i = 0; i < data.length; i++) {
                data[i] = Math.random() * 2 - 1;
            }
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = noiseBuffer;

        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.value = 400;

        // 包絡
        const oscGain = this.audioContext.createGain();
        oscGain.gain.setValueAtTime(0, now);
        oscGain.gain.linearRampToValueAtTime(0.4 * loudness, now + 0.1);
        oscGain.gain.setValueAtTime(0.3 * loudness, now + 0.3);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.setValueAtTime(0, now);
        noiseGain.gain.linearRampToValueAtTime(0.5 * loudness, now + 0.05);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration * 0.8);

        // 迴響效果
        const delay = this.audioContext.createDelay();
        delay.delayTime.value = 0.3;

        const delayGain = this.audioContext.createGain();
        delayGain.gain.value = 0.3;

        // 連接
        osc.connect(oscGain);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);

        oscGain.connect(this.masterGain);
        noiseGain.connect(this.masterGain);

        oscGain.connect(delay);
        delay.connect(delayGain);
        delayGain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + duration);
        noise.start(now);
        noise.stop(now + duration);
    }

    stopAllSounds() {
        if (this.rainNoise) {
            this.rainNoise.stop();
            this.rainNoise = null;
        }
        if (this.windNoise) {
            this.windNoise.stop();
            this.windNoise = null;
        }
        if (this.windLfo) {
            this.windLfo.stop();
            this.windLfo = null;
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.time += 0.016;

        this.drawSky();
        this.drawClouds();
        this.updateRain();
        this.drawRain();
        this.drawLightning();
        this.drawWindStreaks();

        requestAnimationFrame(() => this.animate());
    }

    drawSky() {
        const ctx = this.ctx;

        let flash = 0;
        if (this.lightning) {
            flash = this.lightning.intensity;
        }

        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, `rgb(${10 + flash * 100}, ${15 + flash * 100}, ${25 + flash * 80})`);
        gradient.addColorStop(0.5, `rgb(${20 + flash * 80}, ${25 + flash * 80}, ${40 + flash * 60})`);
        gradient.addColorStop(1, `rgb(${5 + flash * 50}, ${8 + flash * 50}, ${15 + flash * 40})`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawClouds() {
        const ctx = this.ctx;

        for (const cloud of this.clouds) {
            cloud.x += cloud.speed * this.intensity;
            if (cloud.x > this.canvas.width + cloud.width) {
                cloud.x = -cloud.width;
            }

            let alpha = 0.6;
            if (this.lightning) {
                alpha = 0.3;
            }

            ctx.fillStyle = `rgba(30, 35, 50, ${alpha})`;

            ctx.beginPath();
            ctx.ellipse(cloud.x, cloud.y, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
            ctx.ellipse(cloud.x + cloud.width * 0.3, cloud.y - 20, cloud.width / 3, cloud.height / 2.5, 0, 0, Math.PI * 2);
            ctx.ellipse(cloud.x - cloud.width * 0.25, cloud.y + 10, cloud.width / 3, cloud.height / 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    updateRain() {
        const windOffset = this.windLevel * this.intensity * 0.5;

        for (const drop of this.raindrops) {
            drop.y += drop.speed * (0.5 + this.intensity * 0.5);
            drop.x += windOffset * drop.speed * 0.3;

            if (drop.y > this.canvas.height) {
                drop.y = -drop.length;
                drop.x = Math.random() * (this.canvas.width + 200) - 100;
            }
        }
    }

    drawRain() {
        const ctx = this.ctx;
        const windAngle = this.windLevel * this.intensity * 0.3;

        ctx.strokeStyle = 'rgba(150, 170, 200, 0.4)';
        ctx.lineWidth = 1;

        for (const drop of this.raindrops) {
            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x + windAngle * drop.length, drop.y + drop.length);
            ctx.stroke();
        }
    }

    drawLightning() {
        if (!this.lightning) return;

        const ctx = this.ctx;

        if (this.lightning.type === 'bolt' && this.lightning.segments) {
            for (const seg of this.lightning.segments) {
                const width = seg.branch ? 2 : 4;
                const alpha = seg.branch ? 0.7 : 1;

                // 光暈
                ctx.strokeStyle = `rgba(200, 200, 255, ${alpha * 0.3})`;
                ctx.lineWidth = width + 10;
                ctx.beginPath();
                ctx.moveTo(seg.x1, seg.y1);
                ctx.lineTo(seg.x2, seg.y2);
                ctx.stroke();

                // 主體
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.lineWidth = width;
                ctx.beginPath();
                ctx.moveTo(seg.x1, seg.y1);
                ctx.lineTo(seg.x2, seg.y2);
                ctx.stroke();
            }
        }
    }

    drawWindStreaks() {
        if (!this.isPlaying || this.windLevel < 0.3) return;

        const ctx = this.ctx;
        const streakCount = Math.floor(this.windLevel * 10);

        ctx.strokeStyle = 'rgba(150, 170, 200, 0.1)';
        ctx.lineWidth = 1;

        for (let i = 0; i < streakCount; i++) {
            const x = (this.time * 200 * this.intensity + i * 150) % (this.canvas.width + 200) - 100;
            const y = (i * 73) % this.canvas.height;
            const length = 50 + this.windLevel * 100;

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
    new ThunderstormApp();
});
