/**
 * Stream Sound 溪流聲 - Web Toys #104
 * 生成沉浸式溪流聲體驗
 */

class StreamSoundApp {
    constructor() {
        this.canvas = document.getElementById('streamCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 音頻
        this.audioContext = null;
        this.masterGain = null;
        this.streamNoise = null;

        // 設定
        this.streamType = 'gentle';
        this.flowRate = 0.5;
        this.rocksLevel = 0.5;
        this.volume = 0.5;

        // 狀態
        this.isPlaying = false;
        this.time = 0;

        // 視覺元素
        this.waterParticles = [];
        this.bubbles = [];
        this.rocks = [];
        this.ripples = [];

        // 溪流設定
        this.streamSettings = {
            gentle: {
                baseGain: 0.2,
                filterFreq: 1500,
                bubbleRate: 0.02,
                speed: 1,
                name: '潺潺小溪'
            },
            babbling: {
                baseGain: 0.3,
                filterFreq: 2000,
                bubbleRate: 0.04,
                speed: 1.5,
                name: '淙淙流水'
            },
            rapids: {
                baseGain: 0.5,
                filterFreq: 2500,
                bubbleRate: 0.08,
                speed: 3,
                name: '急流'
            },
            waterfall: {
                baseGain: 0.6,
                filterFreq: 3000,
                bubbleRate: 0.1,
                speed: 4,
                name: '小瀑布'
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
        // 水流粒子
        this.waterParticles = [];
        for (let i = 0; i < 200; i++) {
            this.waterParticles.push(this.createWaterParticle());
        }

        // 石頭
        this.rocks = [];
        const rockCount = 8 + Math.floor(Math.random() * 5);
        for (let i = 0; i < rockCount; i++) {
            this.rocks.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height * 0.5 + Math.random() * this.canvas.height * 0.3,
                width: 30 + Math.random() * 50,
                height: 20 + Math.random() * 30,
                color: `hsl(30, ${10 + Math.random() * 20}%, ${25 + Math.random() * 15}%)`
            });
        }

        // 氣泡
        this.bubbles = [];

        // 漣漪
        this.ripples = [];
    }

    createWaterParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: this.canvas.height * 0.4 + Math.random() * this.canvas.height * 0.5,
            size: 2 + Math.random() * 4,
            speed: 1 + Math.random() * 2,
            opacity: 0.2 + Math.random() * 0.3
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

        // 溪流類型
        const streamTypeSelect = document.getElementById('streamType');
        streamTypeSelect.addEventListener('change', (e) => {
            this.streamType = e.target.value;
            this.updateDisplays();
            if (this.isPlaying) {
                this.updateStreamSound();
            }
        });

        // 流速
        const flowRateSlider = document.getElementById('flowRate');
        flowRateSlider.addEventListener('input', (e) => {
            this.flowRate = parseInt(e.target.value) / 100;
            document.getElementById('flowRateValue').textContent = this.getLabel(this.flowRate);
            if (this.isPlaying) {
                this.updateStreamSound();
            }
        });

        // 石頭聲
        const rocksSlider = document.getElementById('rocks');
        rocksSlider.addEventListener('input', (e) => {
            this.rocksLevel = parseInt(e.target.value) / 100;
            document.getElementById('rocksValue').textContent = this.getLabel(this.rocksLevel);
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
        if (value < 0.33) return '慢';
        if (value < 0.66) return '中等';
        return '快';
    }

    updateDisplays() {
        document.getElementById('streamDisplay').textContent = this.streamSettings[this.streamType].name;
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
        this.startStreamSound();
        this.scheduleBubbles();
        this.scheduleRockSounds();

        this.isPlaying = true;

        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = '停止';
        playBtn.classList.add('playing');
        document.getElementById('statusDisplay').textContent = '播放中';
    }

    stop() {
        this.stopStreamSound();
        this.isPlaying = false;

        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = '開始';
        playBtn.classList.remove('playing');
        document.getElementById('statusDisplay').textContent = '停止';
    }

    startStreamSound() {
        const settings = this.streamSettings[this.streamType];

        // 創建水流噪音
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

        this.streamNoise = this.audioContext.createBufferSource();
        this.streamNoise.buffer = buffer;
        this.streamNoise.loop = true;

        // 帶通濾波
        this.streamFilter = this.audioContext.createBiquadFilter();
        this.streamFilter.type = 'bandpass';
        this.streamFilter.frequency.value = settings.filterFreq * this.flowRate;
        this.streamFilter.Q.value = 0.5;

        // LFO 模擬水流起伏
        this.streamLfo = this.audioContext.createOscillator();
        this.streamLfo.type = 'sine';
        this.streamLfo.frequency.value = 0.2 + this.flowRate * 0.3;

        this.streamLfoGain = this.audioContext.createGain();
        this.streamLfoGain.gain.value = 0.08;

        this.streamGain = this.audioContext.createGain();
        this.streamGain.gain.value = settings.baseGain * (0.5 + this.flowRate * 0.5);

        this.streamLfo.connect(this.streamLfoGain);
        this.streamLfoGain.connect(this.streamGain.gain);

        // 連接
        this.streamNoise.connect(this.streamFilter);
        this.streamFilter.connect(this.streamGain);
        this.streamGain.connect(this.masterGain);

        this.streamNoise.start();
        this.streamLfo.start();
    }

    updateStreamSound() {
        if (!this.streamFilter) return;

        const settings = this.streamSettings[this.streamType];
        const now = this.audioContext.currentTime;

        this.streamFilter.frequency.setTargetAtTime(
            settings.filterFreq * (0.5 + this.flowRate * 0.5),
            now,
            0.5
        );
        this.streamGain.gain.setTargetAtTime(
            settings.baseGain * (0.5 + this.flowRate * 0.5),
            now,
            0.5
        );
        this.streamLfo.frequency.setTargetAtTime(
            0.2 + this.flowRate * 0.3,
            now,
            0.3
        );
    }

    stopStreamSound() {
        if (this.streamNoise) {
            this.streamNoise.stop();
            this.streamNoise = null;
        }
        if (this.streamLfo) {
            this.streamLfo.stop();
            this.streamLfo = null;
        }
    }

    scheduleBubbles() {
        if (!this.isPlaying) return;

        const settings = this.streamSettings[this.streamType];
        const chance = settings.bubbleRate * this.flowRate;

        if (Math.random() < chance) {
            this.playBubble();
            this.addBubble();
        }

        setTimeout(() => this.scheduleBubbles(), 100);
    }

    playBubble() {
        const now = this.audioContext.currentTime;
        const freq = 800 + Math.random() * 1500;
        const duration = 0.05 + Math.random() * 0.1;

        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + duration);

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        const panner = this.audioContext.createStereoPanner();
        panner.pan.value = Math.random() * 2 - 1;

        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + duration);
    }

    addBubble() {
        this.bubbles.push({
            x: Math.random() * this.canvas.width,
            y: this.canvas.height * 0.7 + Math.random() * this.canvas.height * 0.2,
            size: 2 + Math.random() * 4,
            speed: 1 + Math.random() * 2,
            wobble: Math.random() * Math.PI * 2
        });
    }

    scheduleRockSounds() {
        if (!this.isPlaying) return;

        const chance = 0.02 * this.rocksLevel * this.flowRate;

        if (Math.random() < chance) {
            this.playRockSound();
            this.addRipple();
        }

        setTimeout(() => this.scheduleRockSounds(), 200);
    }

    playRockSound() {
        const now = this.audioContext.currentTime;

        // 水碰石頭的噗噗聲
        const bufferSize = this.audioContext.sampleRate * 0.15;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 500 + Math.random() * 500;
        filter.Q.value = 2;

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.08 * this.rocksLevel, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        const panner = this.audioContext.createStereoPanner();
        panner.pan.value = Math.random() * 2 - 1;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(panner);
        panner.connect(this.masterGain);

        noise.start(now);
        noise.stop(now + 0.15);
    }

    addRipple() {
        const rock = this.rocks[Math.floor(Math.random() * this.rocks.length)];
        if (rock) {
            this.ripples.push({
                x: rock.x,
                y: rock.y,
                radius: 5,
                maxRadius: 30 + Math.random() * 20,
                opacity: 0.5
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.time += 0.016;

        this.drawBackground();
        this.drawStreamBed();
        this.drawRocks();
        this.updateWater();
        this.drawWater();
        this.updateBubbles();
        this.drawBubbles();
        this.updateRipples();
        this.drawRipples();
        this.drawSurface();

        requestAnimationFrame(() => this.animate());
    }

    drawBackground() {
        const ctx = this.ctx;

        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a3040');
        gradient.addColorStop(0.3, '#2a4a5a');
        gradient.addColorStop(0.5, '#1a3848');
        gradient.addColorStop(1, '#0a1820');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawStreamBed() {
        const ctx = this.ctx;
        const bedY = this.canvas.height * 0.4;

        // 河床
        const gradient = ctx.createLinearGradient(0, bedY, 0, this.canvas.height);
        gradient.addColorStop(0, 'rgba(60, 80, 90, 0.3)');
        gradient.addColorStop(0.5, 'rgba(40, 60, 70, 0.5)');
        gradient.addColorStop(1, 'rgba(30, 50, 60, 0.7)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, bedY, this.canvas.width, this.canvas.height - bedY);

        // 小石子
        ctx.fillStyle = 'rgba(80, 90, 100, 0.3)';
        for (let i = 0; i < 50; i++) {
            const x = (i * 73) % this.canvas.width;
            const y = bedY + 100 + (i * 37) % (this.canvas.height - bedY - 100);
            ctx.beginPath();
            ctx.ellipse(x, y, 3 + (i % 5), 2 + (i % 3), 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawRocks() {
        const ctx = this.ctx;

        for (const rock of this.rocks) {
            // 陰影
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(rock.x + 5, rock.y + 5, rock.width / 2, rock.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();

            // 石頭
            ctx.fillStyle = rock.color;
            ctx.beginPath();
            ctx.ellipse(rock.x, rock.y, rock.width / 2, rock.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();

            // 高光
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.beginPath();
            ctx.ellipse(rock.x - rock.width * 0.15, rock.y - rock.height * 0.15,
                rock.width * 0.2, rock.height * 0.15, -0.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    updateWater() {
        const settings = this.streamSettings[this.streamType];
        const speed = settings.speed * (0.5 + this.flowRate * 0.5);

        for (const p of this.waterParticles) {
            p.x += p.speed * speed;
            p.y += Math.sin(this.time * 3 + p.x * 0.02) * 0.5;

            if (p.x > this.canvas.width + 10) {
                p.x = -10;
                p.y = this.canvas.height * 0.4 + Math.random() * this.canvas.height * 0.5;
            }
        }
    }

    drawWater() {
        const ctx = this.ctx;

        ctx.fillStyle = 'rgba(100, 180, 220, 0.15)';

        for (const p of this.waterParticles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    updateBubbles() {
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const b = this.bubbles[i];
            b.y -= b.speed;
            b.x += Math.sin(b.wobble) * 0.5;
            b.wobble += 0.1;

            if (b.y < this.canvas.height * 0.3) {
                this.bubbles.splice(i, 1);
            }
        }
    }

    drawBubbles() {
        const ctx = this.ctx;

        for (const b of this.bubbles) {
            ctx.strokeStyle = 'rgba(200, 230, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
            ctx.stroke();

            // 高光
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(b.x - b.size * 0.3, b.y - b.size * 0.3, b.size * 0.2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    updateRipples() {
        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const r = this.ripples[i];
            r.radius += 1;
            r.opacity -= 0.02;

            if (r.opacity <= 0 || r.radius >= r.maxRadius) {
                this.ripples.splice(i, 1);
            }
        }
    }

    drawRipples() {
        const ctx = this.ctx;

        for (const r of this.ripples) {
            ctx.strokeStyle = `rgba(200, 230, 255, ${r.opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    drawSurface() {
        const ctx = this.ctx;
        const settings = this.streamSettings[this.streamType];
        const surfaceY = this.canvas.height * 0.4;

        // 水面波紋
        ctx.strokeStyle = 'rgba(200, 230, 255, 0.2)';
        ctx.lineWidth = 1;

        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            const offset = this.time * settings.speed * 20 + i * 50;

            for (let x = 0; x < this.canvas.width; x += 10) {
                const y = surfaceY + Math.sin((x + offset) * 0.02) * 5 + i * 20;
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        }

        // 光線反射
        if (this.isPlaying) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            for (let i = 0; i < 10; i++) {
                const x = (this.time * 30 + i * 100) % this.canvas.width;
                const y = surfaceY + 30 + Math.sin(this.time + i) * 10;
                ctx.fillRect(x, y, 20 + Math.random() * 30, 2);
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
    new StreamSoundApp();
});
