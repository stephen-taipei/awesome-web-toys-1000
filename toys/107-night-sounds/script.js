/**
 * Night Sounds 夜晚聲音 - Web Toys #107
 * 生成寧靜的夏夜氛圍
 */

class NightSoundsApp {
    constructor() {
        this.canvas = document.getElementById('nightCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 音頻
        this.audioContext = null;
        this.masterGain = null;

        // 設定
        this.cricketsLevel = 0.5;
        this.owlsLevel = 0.3;
        this.frogsLevel = 0.5;
        this.windLevel = 0.3;
        this.volume = 0.5;

        // 狀態
        this.isPlaying = false;
        this.time = 0;

        // 視覺元素
        this.stars = [];
        this.fireflies = [];
        this.shootingStars = [];
        this.trees = [];

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
        // 星星
        this.stars = [];
        for (let i = 0; i < 200; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height * 0.6,
                size: Math.random() * 2,
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.02 + Math.random() * 0.03
            });
        }

        // 螢火蟲
        this.fireflies = [];
        for (let i = 0; i < 30; i++) {
            this.fireflies.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height * 0.4 + Math.random() * this.canvas.height * 0.4,
                phase: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 0.5,
                glowPhase: Math.random() * Math.PI * 2
            });
        }

        // 樹木剪影
        this.trees = [];
        for (let i = 0; i < 10; i++) {
            this.trees.push({
                x: i * (this.canvas.width / 9) - 50,
                height: 100 + Math.random() * 150,
                width: 40 + Math.random() * 30
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

        // 蟋蟀
        const cricketsSlider = document.getElementById('crickets');
        cricketsSlider.addEventListener('input', (e) => {
            this.cricketsLevel = parseInt(e.target.value) / 100;
            document.getElementById('cricketsValue').textContent = this.getLabel(this.cricketsLevel);
        });

        // 貓頭鷹
        const owlsSlider = document.getElementById('owls');
        owlsSlider.addEventListener('input', (e) => {
            this.owlsLevel = parseInt(e.target.value) / 100;
            document.getElementById('owlsValue').textContent = this.getOwlLabel(this.owlsLevel);
        });

        // 青蛙
        const frogsSlider = document.getElementById('frogs');
        frogsSlider.addEventListener('input', (e) => {
            this.frogsLevel = parseInt(e.target.value) / 100;
            document.getElementById('frogsValue').textContent = this.getLabel(this.frogsLevel);
        });

        // 微風
        const windSlider = document.getElementById('wind');
        windSlider.addEventListener('input', (e) => {
            this.windLevel = parseInt(e.target.value) / 100;
            document.getElementById('windValue').textContent = this.getWindLabel(this.windLevel);
            if (this.isPlaying) this.updateWind();
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
        if (value < 0.33) return '少';
        if (value < 0.66) return '中等';
        return '多';
    }

    getOwlLabel(value) {
        if (value < 0.2) return '無';
        if (value < 0.5) return '偶爾';
        if (value < 0.8) return '頻繁';
        return '密集';
    }

    getWindLabel(value) {
        if (value < 0.2) return '無';
        if (value < 0.5) return '輕微';
        if (value < 0.8) return '和煦';
        return '明顯';
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
        this.scheduleCrickets();
        this.scheduleOwls();
        this.scheduleFrogs();

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

    startWindSound() {
        if (this.windLevel < 0.1) return;

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
        this.windFilter.frequency.value = 400;

        this.windLfo = this.audioContext.createOscillator();
        this.windLfo.type = 'sine';
        this.windLfo.frequency.value = 0.1;

        this.windLfoGain = this.audioContext.createGain();
        this.windLfoGain.gain.value = 0.03;

        this.windGain = this.audioContext.createGain();
        this.windGain.gain.value = this.windLevel * 0.1;

        this.windLfo.connect(this.windLfoGain);
        this.windLfoGain.connect(this.windGain.gain);

        this.windNoise.connect(this.windFilter);
        this.windFilter.connect(this.windGain);
        this.windGain.connect(this.masterGain);

        this.windNoise.start();
        this.windLfo.start();
    }

    updateWind() {
        if (this.windGain) {
            this.windGain.gain.setTargetAtTime(
                this.windLevel * 0.1,
                this.audioContext.currentTime,
                0.3
            );
        }
    }

    scheduleCrickets() {
        if (!this.isPlaying) return;

        if (Math.random() < this.cricketsLevel * 0.1) {
            this.playCricket();
        }

        setTimeout(() => this.scheduleCrickets(), 100);
    }

    playCricket() {
        const now = this.audioContext.currentTime;
        const chirpCount = 2 + Math.floor(Math.random() * 4);
        const chirpDuration = 0.03 + Math.random() * 0.02;
        const chirpGap = 0.05 + Math.random() * 0.03;

        const baseFreq = 4000 + Math.random() * 1000;

        for (let i = 0; i < chirpCount; i++) {
            const t = now + i * (chirpDuration + chirpGap);

            const osc = this.audioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = baseFreq + Math.random() * 200;

            const gain = this.audioContext.createGain();
            gain.gain.setValueAtTime(0.03 * this.cricketsLevel, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + chirpDuration);

            const panner = this.audioContext.createStereoPanner();
            panner.pan.value = Math.random() * 2 - 1;

            osc.connect(gain);
            gain.connect(panner);
            panner.connect(this.masterGain);

            osc.start(t);
            osc.stop(t + chirpDuration + 0.01);
        }
    }

    scheduleOwls() {
        if (!this.isPlaying) return;

        if (Math.random() < this.owlsLevel * 0.005) {
            this.playOwl();
        }

        setTimeout(() => this.scheduleOwls(), 1000);
    }

    playOwl() {
        const now = this.audioContext.currentTime;
        const type = Math.random() < 0.5 ? 'hoot' : 'screech';

        if (type === 'hoot') {
            // 呼呼聲
            for (let i = 0; i < 2; i++) {
                const t = now + i * 0.5;

                const osc = this.audioContext.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, t);
                osc.frequency.linearRampToValueAtTime(350, t + 0.3);

                const gain = this.audioContext.createGain();
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(0.05 * this.owlsLevel, t + 0.05);
                gain.gain.linearRampToValueAtTime(0.03 * this.owlsLevel, t + 0.2);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

                const panner = this.audioContext.createStereoPanner();
                panner.pan.value = (Math.random() - 0.5) * 1.5;

                osc.connect(gain);
                gain.connect(panner);
                panner.connect(this.masterGain);

                osc.start(t);
                osc.stop(t + 0.5);
            }
        } else {
            // 尖叫聲
            const osc = this.audioContext.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.linearRampToValueAtTime(600, now + 0.3);

            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 700;
            filter.Q.value = 5;

            const gain = this.audioContext.createGain();
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.03 * this.owlsLevel, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + 0.5);
        }
    }

    scheduleFrogs() {
        if (!this.isPlaying) return;

        if (Math.random() < this.frogsLevel * 0.03) {
            this.playFrog();
        }

        setTimeout(() => this.scheduleFrogs(), 200);
    }

    playFrog() {
        const now = this.audioContext.currentTime;
        const type = Math.random();

        if (type < 0.5) {
            // 呱呱聲
            const ribbitCount = 1 + Math.floor(Math.random() * 3);

            for (let i = 0; i < ribbitCount; i++) {
                const t = now + i * 0.15;

                const osc = this.audioContext.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(200 + Math.random() * 100, t);
                osc.frequency.linearRampToValueAtTime(150, t + 0.08);

                const gain = this.audioContext.createGain();
                gain.gain.setValueAtTime(0.04 * this.frogsLevel, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

                const panner = this.audioContext.createStereoPanner();
                panner.pan.value = Math.random() * 2 - 1;

                osc.connect(gain);
                gain.connect(panner);
                panner.connect(this.masterGain);

                osc.start(t);
                osc.stop(t + 0.12);
            }
        } else {
            // 長音呱
            const osc = this.audioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(250, now);
            osc.frequency.setValueAtTime(220, now + 0.1);
            osc.frequency.setValueAtTime(250, now + 0.2);

            const vibrato = this.audioContext.createOscillator();
            vibrato.type = 'sine';
            vibrato.frequency.value = 10;

            const vibratoGain = this.audioContext.createGain();
            vibratoGain.gain.value = 20;

            vibrato.connect(vibratoGain);
            vibratoGain.connect(osc.frequency);

            const gain = this.audioContext.createGain();
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.05 * this.frogsLevel, now + 0.02);
            gain.gain.setValueAtTime(0.05 * this.frogsLevel, now + 0.25);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            const panner = this.audioContext.createStereoPanner();
            panner.pan.value = Math.random() * 2 - 1;

            osc.connect(gain);
            gain.connect(panner);
            panner.connect(this.masterGain);

            osc.start(now);
            vibrato.start(now);
            osc.stop(now + 0.4);
            vibrato.stop(now + 0.4);
        }
    }

    stopAllSounds() {
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
        this.drawMoon();
        this.drawStars();
        this.drawTrees();
        this.drawGround();
        this.updateFireflies();
        this.drawFireflies();
        this.updateShootingStars();
        this.drawShootingStars();

        requestAnimationFrame(() => this.animate());
    }

    drawSky() {
        const ctx = this.ctx;

        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#05051a');
        gradient.addColorStop(0.4, '#0a0a25');
        gradient.addColorStop(0.7, '#101030');
        gradient.addColorStop(1, '#0a0a15');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawMoon() {
        const ctx = this.ctx;
        const x = this.canvas.width * 0.8;
        const y = 100;
        const radius = 40;

        // 月暈
        const gradient = ctx.createRadialGradient(x, y, radius, x, y, radius * 4);
        gradient.addColorStop(0, 'rgba(200, 200, 220, 0.2)');
        gradient.addColorStop(0.5, 'rgba(150, 150, 180, 0.05)');
        gradient.addColorStop(1, 'rgba(100, 100, 150, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius * 4, 0, Math.PI * 2);
        ctx.fill();

        // 月球
        ctx.fillStyle = '#e8e8f0';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // 月球陰影（隕石坑）
        ctx.fillStyle = 'rgba(180, 180, 200, 0.3)';
        ctx.beginPath();
        ctx.arc(x - 10, y - 5, 8, 0, Math.PI * 2);
        ctx.arc(x + 15, y + 10, 5, 0, Math.PI * 2);
        ctx.arc(x - 5, y + 15, 6, 0, Math.PI * 2);
        ctx.fill();
    }

    drawStars() {
        const ctx = this.ctx;

        for (const star of this.stars) {
            star.twinkle += star.twinkleSpeed;
            const brightness = 0.5 + Math.sin(star.twinkle) * 0.5;

            ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.8})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }

        // 隨機流星
        if (this.isPlaying && Math.random() < 0.002) {
            this.shootingStars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height * 0.3,
                speed: 10 + Math.random() * 10,
                length: 50 + Math.random() * 50,
                life: 1
            });
        }
    }

    updateShootingStars() {
        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
            const star = this.shootingStars[i];
            star.x += star.speed;
            star.y += star.speed * 0.5;
            star.life -= 0.02;

            if (star.life <= 0) {
                this.shootingStars.splice(i, 1);
            }
        }
    }

    drawShootingStars() {
        const ctx = this.ctx;

        for (const star of this.shootingStars) {
            const gradient = ctx.createLinearGradient(
                star.x, star.y,
                star.x - star.length, star.y - star.length * 0.5
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${star.life})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(star.x - star.length, star.y - star.length * 0.5);
            ctx.stroke();
        }
    }

    drawTrees() {
        const ctx = this.ctx;
        const baseY = this.canvas.height * 0.85;

        for (const tree of this.trees) {
            ctx.fillStyle = '#0a0a10';

            // 樹幹
            ctx.fillRect(tree.x + tree.width / 2 - 5, baseY - tree.height * 0.3, 10, tree.height * 0.3);

            // 樹冠
            ctx.beginPath();
            ctx.moveTo(tree.x + tree.width / 2, baseY - tree.height);
            ctx.lineTo(tree.x, baseY - tree.height * 0.3);
            ctx.lineTo(tree.x + tree.width, baseY - tree.height * 0.3);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(tree.x + tree.width / 2, baseY - tree.height * 0.85);
            ctx.lineTo(tree.x + 5, baseY - tree.height * 0.2);
            ctx.lineTo(tree.x + tree.width - 5, baseY - tree.height * 0.2);
            ctx.closePath();
            ctx.fill();
        }
    }

    drawGround() {
        const ctx = this.ctx;
        const groundY = this.canvas.height * 0.85;

        ctx.fillStyle = '#0a0a10';
        ctx.fillRect(0, groundY, this.canvas.width, this.canvas.height - groundY);

        // 草地紋理
        ctx.fillStyle = '#080810';
        for (let x = 0; x < this.canvas.width; x += 20) {
            const height = 5 + Math.random() * 10;
            ctx.fillRect(x, groundY - height, 2, height);
        }
    }

    updateFireflies() {
        for (const f of this.fireflies) {
            f.phase += 0.02;
            f.glowPhase += 0.03;
            f.x += Math.sin(f.phase) * f.speed;
            f.y += Math.cos(f.phase * 0.7) * f.speed * 0.5;

            if (f.x < 0) f.x = this.canvas.width;
            if (f.x > this.canvas.width) f.x = 0;
            if (f.y < this.canvas.height * 0.3) f.y = this.canvas.height * 0.7;
            if (f.y > this.canvas.height * 0.8) f.y = this.canvas.height * 0.4;
        }
    }

    drawFireflies() {
        if (!this.isPlaying) return;

        const ctx = this.ctx;

        for (const f of this.fireflies) {
            const glow = (Math.sin(f.glowPhase) + 1) * 0.5;

            if (glow > 0.3) {
                const gradient = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 15);
                gradient.addColorStop(0, `rgba(200, 255, 100, ${glow * 0.8})`);
                gradient.addColorStop(0.3, `rgba(150, 200, 50, ${glow * 0.4})`);
                gradient.addColorStop(1, 'rgba(100, 150, 50, 0)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(f.x, f.y, 15, 0, Math.PI * 2);
                ctx.fill();
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
    new NightSoundsApp();
});
