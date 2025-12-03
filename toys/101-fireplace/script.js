/**
 * Fireplace 壁爐聲 - Web Toys #101
 * 生成溫暖的壁爐聲體驗
 */

class FireplaceApp {
    constructor() {
        this.canvas = document.getElementById('fireCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 音頻
        this.audioContext = null;
        this.masterGain = null;
        this.fireNoise = null;

        // 設定
        this.fireSize = 0.5;
        this.crackleLevel = 0.5;
        this.woodType = 'oak';
        this.volume = 0.5;

        // 狀態
        this.isPlaying = false;
        this.time = 0;

        // 火焰粒子
        this.particles = [];
        this.sparks = [];
        this.embers = [];

        // 木材設定
        this.woodSettings = {
            oak: {
                crackleRate: 0.02,
                sparkRate: 0.01,
                color: '#ff6020',
                name: '橡木'
            },
            pine: {
                crackleRate: 0.04,
                sparkRate: 0.03,
                color: '#ff8040',
                name: '松木'
            },
            birch: {
                crackleRate: 0.015,
                sparkRate: 0.005,
                color: '#ffa050',
                name: '樺木'
            },
            cedar: {
                crackleRate: 0.03,
                sparkRate: 0.02,
                color: '#ff7030',
                name: '雪松'
            }
        };

        this.init();
    }

    async init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.setupControls();
        this.initEmbers();
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.initEmbers();
    }

    initEmbers() {
        this.embers = [];
        for (let i = 0; i < 20; i++) {
            this.embers.push({
                x: this.canvas.width / 2 + (Math.random() - 0.5) * 200,
                y: this.canvas.height * 0.85 + Math.random() * 30,
                size: 2 + Math.random() * 4,
                glow: Math.random(),
                glowSpeed: 0.02 + Math.random() * 0.03
            });
        }
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

        // 火焰大小
        const fireSizeSlider = document.getElementById('fireSize');
        fireSizeSlider.addEventListener('input', (e) => {
            this.fireSize = parseInt(e.target.value) / 100;
            document.getElementById('fireSizeValue').textContent = this.getSizeLabel(this.fireSize);
            if (this.isPlaying) {
                this.updateFireSound();
            }
        });

        // 噼啪聲
        const crackleSlider = document.getElementById('crackle');
        crackleSlider.addEventListener('input', (e) => {
            this.crackleLevel = parseInt(e.target.value) / 100;
            document.getElementById('crackleValue').textContent = this.getSizeLabel(this.crackleLevel);
        });

        // 木材類型
        const woodTypeSelect = document.getElementById('woodType');
        woodTypeSelect.addEventListener('change', (e) => {
            this.woodType = e.target.value;
            this.updateDisplays();
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

    getSizeLabel(value) {
        if (value < 0.33) return '小';
        if (value < 0.66) return '中等';
        return '大';
    }

    updateDisplays() {
        document.getElementById('woodDisplay').textContent = this.woodSettings[this.woodType].name;
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
        this.startFireSound();
        this.scheduleCrackle();

        this.isPlaying = true;

        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = '熄滅';
        playBtn.classList.add('playing');
        document.getElementById('statusDisplay').textContent = '燃燒中';
    }

    stop() {
        this.stopFireSound();
        this.isPlaying = false;

        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = '點燃';
        playBtn.classList.remove('playing');
        document.getElementById('statusDisplay').textContent = '熄滅';
    }

    startFireSound() {
        // 基礎燃燒噪音（棕色噪音）
        const bufferSize = this.audioContext.sampleRate * 4;
        const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            let lastOut = 0;

            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                lastOut = (lastOut + (0.02 * white)) / 1.02;
                data[i] = lastOut * 3.5;
            }
        }

        this.fireNoise = this.audioContext.createBufferSource();
        this.fireNoise.buffer = buffer;
        this.fireNoise.loop = true;

        // 低通濾波
        this.fireFilter = this.audioContext.createBiquadFilter();
        this.fireFilter.type = 'lowpass';
        this.fireFilter.frequency.value = 300 + this.fireSize * 400;
        this.fireFilter.Q.value = 0.5;

        // 音量 LFO（火焰搖曳）
        this.fireLfo = this.audioContext.createOscillator();
        this.fireLfo.type = 'sine';
        this.fireLfo.frequency.value = 0.5 + this.fireSize * 0.5;

        this.lfoGain = this.audioContext.createGain();
        this.lfoGain.gain.value = 0.05;

        // 火焰音量
        this.fireGain = this.audioContext.createGain();
        this.fireGain.gain.value = 0.2 * this.fireSize;

        this.fireLfo.connect(this.lfoGain);
        this.lfoGain.connect(this.fireGain.gain);

        // 連接
        this.fireNoise.connect(this.fireFilter);
        this.fireFilter.connect(this.fireGain);
        this.fireGain.connect(this.masterGain);

        this.fireNoise.start();
        this.fireLfo.start();
    }

    updateFireSound() {
        if (!this.fireFilter || !this.fireGain) return;

        const now = this.audioContext.currentTime;
        this.fireFilter.frequency.setTargetAtTime(300 + this.fireSize * 400, now, 0.3);
        this.fireGain.gain.setTargetAtTime(0.2 * this.fireSize, now, 0.3);
        this.fireLfo.frequency.setTargetAtTime(0.5 + this.fireSize * 0.5, now, 0.3);
    }

    stopFireSound() {
        if (this.fireNoise) {
            this.fireNoise.stop();
            this.fireNoise = null;
        }
        if (this.fireLfo) {
            this.fireLfo.stop();
            this.fireLfo = null;
        }
    }

    scheduleCrackle() {
        if (!this.isPlaying) return;

        const settings = this.woodSettings[this.woodType];
        const crackleChance = settings.crackleRate * this.crackleLevel * this.fireSize;

        if (Math.random() < crackleChance) {
            this.playCrackle();
        }

        // 火花
        if (Math.random() < settings.sparkRate * this.fireSize) {
            this.addSpark();
        }

        setTimeout(() => this.scheduleCrackle(), 100);
    }

    playCrackle() {
        const now = this.audioContext.currentTime;
        const duration = 0.05 + Math.random() * 0.1;

        // 噼啪噪音
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;

        // 高通濾波（清脆感）
        const highpass = this.audioContext.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 1000 + Math.random() * 2000;

        // 帶通濾波
        const bandpass = this.audioContext.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 2000 + Math.random() * 3000;
        bandpass.Q.value = 2;

        // 包絡
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.15 * this.crackleLevel, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        // 聲像
        const panner = this.audioContext.createStereoPanner();
        panner.pan.value = (Math.random() - 0.5) * 0.6;

        noise.connect(highpass);
        highpass.connect(bandpass);
        bandpass.connect(gain);
        gain.connect(panner);
        panner.connect(this.masterGain);

        noise.start(now);
        noise.stop(now + duration);
    }

    addSpark() {
        const centerX = this.canvas.width / 2;
        const baseY = this.canvas.height * 0.7;

        this.sparks.push({
            x: centerX + (Math.random() - 0.5) * 100,
            y: baseY,
            vx: (Math.random() - 0.5) * 3,
            vy: -2 - Math.random() * 4,
            life: 1,
            size: 1 + Math.random() * 2
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.time += 0.016;

        this.drawBackground();
        this.drawFireplace();

        if (this.isPlaying) {
            this.updateParticles();
            this.drawFire();
            this.updateSparks();
            this.drawSparks();
        }

        this.drawEmbers();
        this.drawLogs();

        requestAnimationFrame(() => this.animate());
    }

    drawBackground() {
        const ctx = this.ctx;

        // 背景漸層
        const gradient = ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height * 0.7, 0,
            this.canvas.width / 2, this.canvas.height * 0.7,
            this.canvas.width * 0.6
        );

        const glowIntensity = this.isPlaying ? 0.3 * this.fireSize : 0;

        gradient.addColorStop(0, `rgba(60, 20, 5, ${glowIntensity})`);
        gradient.addColorStop(0.5, 'rgba(15, 8, 5, 1)');
        gradient.addColorStop(1, '#0a0505');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawFireplace() {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const baseY = this.canvas.height * 0.9;

        // 壁爐框架
        ctx.fillStyle = '#2a1810';
        ctx.fillRect(centerX - 200, baseY - 250, 400, 280);

        // 壁爐內部
        ctx.fillStyle = '#0a0505';
        ctx.fillRect(centerX - 180, baseY - 230, 360, 240);

        // 磚塊紋理
        ctx.fillStyle = '#1a0c08';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 6; col++) {
                const offset = row % 2 === 0 ? 0 : 30;
                const x = centerX - 180 + col * 60 + offset;
                const y = baseY - 230 + row * 30;
                ctx.fillRect(x + 2, y + 2, 56, 26);
            }
        }
    }

    updateParticles() {
        const centerX = this.canvas.width / 2;
        const baseY = this.canvas.height * 0.75;
        const settings = this.woodSettings[this.woodType];

        // 添加新粒子
        const particleCount = Math.floor(5 * this.fireSize);
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: centerX + (Math.random() - 0.5) * 80 * this.fireSize,
                y: baseY,
                vx: (Math.random() - 0.5) * 2,
                vy: -2 - Math.random() * 3 * this.fireSize,
                life: 1,
                size: 20 + Math.random() * 30 * this.fireSize,
                color: settings.color
            });
        }

        // 更新粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx + Math.sin(this.time * 5 + i) * 0.5;
            p.y += p.vy;
            p.vy -= 0.05;
            p.life -= 0.02;
            p.size *= 0.98;

            if (p.life <= 0 || p.size < 2) {
                this.particles.splice(i, 1);
            }
        }
    }

    drawFire() {
        const ctx = this.ctx;

        ctx.globalCompositeOperation = 'lighter';

        for (const p of this.particles) {
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);

            const alpha = p.life * 0.6;
            gradient.addColorStop(0, `rgba(255, 255, 200, ${alpha})`);
            gradient.addColorStop(0.3, `rgba(255, 150, 50, ${alpha * 0.8})`);
            gradient.addColorStop(0.6, `rgba(255, 80, 20, ${alpha * 0.5})`);
            gradient.addColorStop(1, 'rgba(100, 20, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalCompositeOperation = 'source-over';
    }

    updateSparks() {
        for (let i = this.sparks.length - 1; i >= 0; i--) {
            const s = this.sparks[i];
            s.x += s.vx;
            s.y += s.vy;
            s.vy += 0.1; // 重力
            s.life -= 0.02;

            if (s.life <= 0) {
                this.sparks.splice(i, 1);
            }
        }
    }

    drawSparks() {
        const ctx = this.ctx;

        for (const s of this.sparks) {
            ctx.fillStyle = `rgba(255, 200, 100, ${s.life})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawEmbers() {
        const ctx = this.ctx;

        for (const ember of this.embers) {
            ember.glow += ember.glowSpeed;
            const brightness = 0.3 + Math.sin(ember.glow) * 0.3;

            if (this.isPlaying) {
                ctx.fillStyle = `rgba(255, 80, 20, ${brightness * this.fireSize})`;
            } else {
                ctx.fillStyle = `rgba(80, 30, 10, ${brightness * 0.3})`;
            }

            ctx.beginPath();
            ctx.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawLogs() {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const baseY = this.canvas.height * 0.88;

        // 木柴
        ctx.fillStyle = '#3a2010';

        // 左邊木柴
        ctx.save();
        ctx.translate(centerX - 60, baseY);
        ctx.rotate(-0.2);
        this.drawLog(ctx, 0, 0, 120, 25);
        ctx.restore();

        // 右邊木柴
        ctx.save();
        ctx.translate(centerX + 60, baseY);
        ctx.rotate(0.2);
        this.drawLog(ctx, 0, 0, 120, 25);
        ctx.restore();

        // 中間木柴
        ctx.save();
        ctx.translate(centerX, baseY - 15);
        this.drawLog(ctx, 0, 0, 100, 20);
        ctx.restore();
    }

    drawLog(ctx, x, y, width, height) {
        // 主體
        ctx.fillStyle = '#3a2010';
        ctx.beginPath();
        ctx.ellipse(x, y, width / 2, height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 木紋
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.ellipse(x, y, width / 2 - i * 8, height / 2 - i * 3, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        // 端面年輪
        ctx.fillStyle = '#4a3020';
        ctx.beginPath();
        ctx.ellipse(x + width / 2, y, height / 2, height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(60, 40, 20, 0.5)';
        for (let i = 1; i < 4; i++) {
            ctx.beginPath();
            ctx.arc(x + width / 2, y, height / 2 - i * 3, 0, Math.PI * 2);
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
    new FireplaceApp();
});
