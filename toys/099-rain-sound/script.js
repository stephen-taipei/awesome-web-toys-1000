/**
 * Rain Sound 雨聲 - Web Toys #099
 * 生成沉浸式雨聲體驗
 */

class RainSoundApp {
    constructor() {
        this.canvas = document.getElementById('rainCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 音頻
        this.audioContext = null;
        this.masterGain = null;
        this.rainNoise = null;
        this.rainGain = null;

        // 設定
        this.rainType = 'light';
        this.intensity = 0.5;
        this.thunderLevel = 0;
        this.volume = 0.5;

        // 狀態
        this.isPlaying = false;
        this.time = 0;

        // 雨滴
        this.raindrops = [];
        this.splashes = [];

        // 閃電
        this.lightning = null;
        this.lastThunderTime = 0;

        // 雨型設定
        this.rainSettings = {
            light: {
                dropCount: 100,
                speed: 8,
                length: 15,
                angle: 0.1,
                filterFreq: 3000,
                name: '細雨'
            },
            moderate: {
                dropCount: 200,
                speed: 12,
                length: 20,
                angle: 0.15,
                filterFreq: 2500,
                name: '中雨'
            },
            heavy: {
                dropCount: 400,
                speed: 18,
                length: 25,
                angle: 0.2,
                filterFreq: 2000,
                name: '大雨'
            },
            storm: {
                dropCount: 600,
                speed: 25,
                length: 30,
                angle: 0.3,
                filterFreq: 1500,
                name: '暴風雨'
            },
            drizzle: {
                dropCount: 50,
                speed: 5,
                length: 8,
                angle: 0.05,
                filterFreq: 4000,
                name: '毛毛雨'
            }
        };

        this.init();
    }

    async init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.setupControls();
        this.createRaindrops();
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.createRaindrops();
    }

    async initAudio() {
        if (this.audioContext) return;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // 主音量
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = this.volume;
        this.masterGain.connect(this.audioContext.destination);
    }

    createRaindrops() {
        this.raindrops = [];
        const settings = this.rainSettings[this.rainType];
        const count = Math.floor(settings.dropCount * this.intensity);

        for (let i = 0; i < count; i++) {
            this.raindrops.push(this.createRaindrop());
        }
    }

    createRaindrop() {
        const settings = this.rainSettings[this.rainType];
        return {
            x: Math.random() * (this.canvas.width + 200) - 100,
            y: Math.random() * this.canvas.height - this.canvas.height,
            speed: settings.speed * (0.8 + Math.random() * 0.4),
            length: settings.length * (0.7 + Math.random() * 0.6),
            opacity: 0.3 + Math.random() * 0.4
        };
    }

    setupControls() {
        // 播放按鈕
        const playBtn = document.getElementById('playBtn');
        playBtn.addEventListener('click', () => this.togglePlay());

        // 雨型
        const rainTypeSelect = document.getElementById('rainType');
        rainTypeSelect.addEventListener('change', (e) => {
            this.rainType = e.target.value;
            this.createRaindrops();
            this.updateDisplays();
            if (this.isPlaying) {
                this.updateRainSound();
            }
        });

        // 強度
        const intensitySlider = document.getElementById('intensity');
        intensitySlider.addEventListener('input', (e) => {
            this.intensity = parseInt(e.target.value) / 100;
            document.getElementById('intensityValue').textContent = this.getIntensityLabel(this.intensity);
            this.createRaindrops();
            if (this.isPlaying) {
                this.updateRainSound();
            }
        });

        // 雷聲
        const thunderSlider = document.getElementById('thunder');
        thunderSlider.addEventListener('input', (e) => {
            this.thunderLevel = parseInt(e.target.value) / 100;
            document.getElementById('thunderValue').textContent = this.getThunderLabel(this.thunderLevel);
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
        if (intensity < 0.66) return '中等';
        return '強烈';
    }

    getThunderLabel(level) {
        if (level < 0.1) return '關閉';
        if (level < 0.4) return '偶爾';
        if (level < 0.7) return '頻繁';
        return '密集';
    }

    updateDisplays() {
        document.getElementById('rainDisplay').textContent = this.rainSettings[this.rainType].name;
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

        this.isPlaying = true;

        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = '停止';
        playBtn.classList.add('playing');
        document.getElementById('statusDisplay').textContent = '播放中';

        // 開始雷聲計時
        this.scheduleThunder();
    }

    stop() {
        this.stopRainSound();
        this.isPlaying = false;

        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = '開始';
        playBtn.classList.remove('playing');
        document.getElementById('statusDisplay').textContent = '停止';
    }

    startRainSound() {
        const settings = this.rainSettings[this.rainType];

        // 創建噪音緩衝
        const bufferSize = this.audioContext.sampleRate * 2;
        const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < bufferSize; i++) {
                // 粉紅噪音近似
                data[i] = (Math.random() * 2 - 1) * 0.5;
            }
        }

        // 噪音源
        this.rainNoise = this.audioContext.createBufferSource();
        this.rainNoise.buffer = buffer;
        this.rainNoise.loop = true;

        // 濾波器
        this.rainFilter = this.audioContext.createBiquadFilter();
        this.rainFilter.type = 'lowpass';
        this.rainFilter.frequency.value = settings.filterFreq;
        this.rainFilter.Q.value = 0.5;

        // 高通濾波去除低頻
        this.rainHighpass = this.audioContext.createBiquadFilter();
        this.rainHighpass.type = 'highpass';
        this.rainHighpass.frequency.value = 200;

        // 雨聲音量
        this.rainGain = this.audioContext.createGain();
        this.rainGain.gain.value = 0.4 * this.intensity;

        // 連接
        this.rainNoise.connect(this.rainFilter);
        this.rainFilter.connect(this.rainHighpass);
        this.rainHighpass.connect(this.rainGain);
        this.rainGain.connect(this.masterGain);

        this.rainNoise.start();
    }

    updateRainSound() {
        if (!this.rainGain) return;

        const settings = this.rainSettings[this.rainType];
        const now = this.audioContext.currentTime;

        this.rainFilter.frequency.setTargetAtTime(settings.filterFreq, now, 0.5);
        this.rainGain.gain.setTargetAtTime(0.4 * this.intensity, now, 0.3);
    }

    stopRainSound() {
        if (this.rainNoise) {
            this.rainNoise.stop();
            this.rainNoise = null;
        }
    }

    scheduleThunder() {
        if (!this.isPlaying) return;

        if (this.thunderLevel > 0.1) {
            const now = Date.now();
            const minInterval = 5000 / this.thunderLevel;
            const maxInterval = 20000 / this.thunderLevel;

            if (now - this.lastThunderTime > minInterval) {
                if (Math.random() < this.thunderLevel * 0.02) {
                    this.triggerThunder();
                    this.lastThunderTime = now;
                }
            }
        }

        setTimeout(() => this.scheduleThunder(), 500);
    }

    triggerThunder() {
        // 閃電視覺
        this.lightning = {
            intensity: 0.5 + Math.random() * 0.5,
            duration: 100 + Math.random() * 200
        };

        setTimeout(() => {
            this.lightning = null;
        }, this.lightning.duration);

        // 雷聲（延遲）
        const delay = 200 + Math.random() * 1500;
        setTimeout(() => this.playThunder(), delay);
    }

    playThunder() {
        if (!this.audioContext || !this.isPlaying) return;

        const now = this.audioContext.currentTime;
        const duration = 2 + Math.random() * 3;

        // 低頻隆隆聲
        const osc = this.audioContext.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(40 + Math.random() * 20, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + duration);

        // 噪音成分
        const noiseBuffer = this.audioContext.createBuffer(
            1,
            this.audioContext.sampleRate * duration,
            this.audioContext.sampleRate
        );
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
            noiseData[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = noiseBuffer;

        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.value = 300;

        // 包絡
        const oscGain = this.audioContext.createGain();
        oscGain.gain.setValueAtTime(0, now);
        oscGain.gain.linearRampToValueAtTime(0.3 * this.thunderLevel, now + 0.1);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.setValueAtTime(0, now);
        noiseGain.gain.linearRampToValueAtTime(0.4 * this.thunderLevel, now + 0.05);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration * 0.7);

        // 連接
        osc.connect(oscGain);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        oscGain.connect(this.masterGain);
        noiseGain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + duration);
        noise.start(now);
        noise.stop(now + duration);
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.time += 0.016;
        this.drawBackground();
        this.updateRaindrops();
        this.drawRaindrops();
        this.updateSplashes();
        this.drawSplashes();

        requestAnimationFrame(() => this.animate());
    }

    drawBackground() {
        const ctx = this.ctx;

        // 漸層天空
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);

        if (this.lightning) {
            const flash = this.lightning.intensity;
            gradient.addColorStop(0, `rgba(${150 + flash * 100}, ${150 + flash * 100}, ${180 + flash * 75}, 1)`);
            gradient.addColorStop(1, `rgba(${30 + flash * 50}, ${35 + flash * 50}, ${50 + flash * 50}, 1)`);
        } else {
            gradient.addColorStop(0, '#1a1e28');
            gradient.addColorStop(0.5, '#0f1218');
            gradient.addColorStop(1, '#080a10');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 雲層
        ctx.fillStyle = 'rgba(40, 45, 60, 0.3)';
        for (let i = 0; i < 5; i++) {
            const x = (i * 300 + this.time * 10) % (this.canvas.width + 400) - 200;
            const y = 50 + i * 30;
            this.drawCloud(x, y, 150 + i * 30);
        }
    }

    drawCloud(x, y, size) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
        ctx.arc(x + size * 0.4, y - size * 0.2, size * 0.4, 0, Math.PI * 2);
        ctx.arc(x + size * 0.8, y, size * 0.45, 0, Math.PI * 2);
        ctx.arc(x + size * 0.4, y + size * 0.15, size * 0.35, 0, Math.PI * 2);
        ctx.fill();
    }

    updateRaindrops() {
        const settings = this.rainSettings[this.rainType];

        for (const drop of this.raindrops) {
            drop.y += drop.speed * this.intensity;
            drop.x += settings.angle * drop.speed;

            // 落到底部產生水花
            if (drop.y > this.canvas.height) {
                if (this.isPlaying && Math.random() < 0.3) {
                    this.splashes.push({
                        x: drop.x,
                        y: this.canvas.height,
                        radius: 2,
                        maxRadius: 5 + Math.random() * 5,
                        opacity: 0.5
                    });
                }

                // 重置雨滴
                drop.x = Math.random() * (this.canvas.width + 200) - 100;
                drop.y = -drop.length;
                drop.speed = settings.speed * (0.8 + Math.random() * 0.4);
            }
        }
    }

    drawRaindrops() {
        const ctx = this.ctx;
        const settings = this.rainSettings[this.rainType];

        ctx.strokeStyle = 'rgba(150, 180, 220, 0.4)';
        ctx.lineWidth = 1;

        for (const drop of this.raindrops) {
            ctx.globalAlpha = drop.opacity * (this.isPlaying ? 1 : 0.3);
            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(
                drop.x + settings.angle * drop.length,
                drop.y + drop.length
            );
            ctx.stroke();
        }

        ctx.globalAlpha = 1;
    }

    updateSplashes() {
        for (let i = this.splashes.length - 1; i >= 0; i--) {
            const splash = this.splashes[i];
            splash.radius += 0.5;
            splash.opacity -= 0.03;

            if (splash.opacity <= 0 || splash.radius >= splash.maxRadius) {
                this.splashes.splice(i, 1);
            }
        }
    }

    drawSplashes() {
        const ctx = this.ctx;

        for (const splash of this.splashes) {
            ctx.beginPath();
            ctx.arc(splash.x, splash.y, splash.radius, 0, Math.PI);
            ctx.strokeStyle = `rgba(150, 180, 220, ${splash.opacity})`;
            ctx.lineWidth = 1;
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
    new RainSoundApp();
});
