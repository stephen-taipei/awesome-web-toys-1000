/**
 * Forest Sound 森林聲 - Web Toys #103
 * 生成沉浸式森林聲體驗
 */

class ForestSoundApp {
    constructor() {
        this.canvas = document.getElementById('forestCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 音頻
        this.audioContext = null;
        this.masterGain = null;

        // 設定
        this.timeOfDay = 'morning';
        this.birdsLevel = 0.5;
        this.insectsLevel = 0.5;
        this.rustlingLevel = 0.5;
        this.volume = 0.5;

        // 狀態
        this.isPlaying = false;
        this.time = 0;

        // 視覺元素
        this.trees = [];
        this.particles = [];
        this.fireflies = [];

        // 時段設定
        this.timeSettings = {
            morning: {
                skyTop: '#1a3050',
                skyBottom: '#4a6080',
                ambient: 0.6,
                birdRate: 0.03,
                insectRate: 0.005,
                name: '清晨'
            },
            day: {
                skyTop: '#3060a0',
                skyBottom: '#80b0e0',
                ambient: 1,
                birdRate: 0.02,
                insectRate: 0.01,
                name: '白天'
            },
            evening: {
                skyTop: '#402030',
                skyBottom: '#c06040',
                ambient: 0.7,
                birdRate: 0.025,
                insectRate: 0.015,
                name: '黃昏'
            },
            night: {
                skyTop: '#0a0a15',
                skyBottom: '#1a1a30',
                ambient: 0.3,
                birdRate: 0.005,
                insectRate: 0.04,
                name: '夜晚'
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
        // 樹木
        this.trees = [];
        const treeCount = Math.floor(this.canvas.width / 80);
        for (let i = 0; i < treeCount; i++) {
            this.trees.push({
                x: i * 80 + Math.random() * 40,
                height: 150 + Math.random() * 200,
                width: 30 + Math.random() * 20,
                layer: Math.floor(Math.random() * 3)
            });
        }
        this.trees.sort((a, b) => a.layer - b.layer);

        // 飄浮粒子
        this.particles = [];
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speed: Math.random() * 0.5 + 0.2,
                opacity: Math.random() * 0.3
            });
        }

        // 螢火蟲
        this.fireflies = [];
        for (let i = 0; i < 20; i++) {
            this.fireflies.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height * 0.4 + Math.random() * this.canvas.height * 0.4,
                phase: Math.random() * Math.PI * 2,
                speed: 0.02 + Math.random() * 0.02
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

        // 時段
        const timeSelect = document.getElementById('timeOfDay');
        timeSelect.addEventListener('change', (e) => {
            this.timeOfDay = e.target.value;
            this.updateDisplays();
        });

        // 鳥鳴
        const birdsSlider = document.getElementById('birds');
        birdsSlider.addEventListener('input', (e) => {
            this.birdsLevel = parseInt(e.target.value) / 100;
            document.getElementById('birdsValue').textContent = this.getLabel(this.birdsLevel);
        });

        // 蟲鳴
        const insectsSlider = document.getElementById('insects');
        insectsSlider.addEventListener('input', (e) => {
            this.insectsLevel = parseInt(e.target.value) / 100;
            document.getElementById('insectsValue').textContent = this.getLabel(this.insectsLevel);
        });

        // 樹葉沙沙
        const rustlingSlider = document.getElementById('rustling');
        rustlingSlider.addEventListener('input', (e) => {
            this.rustlingLevel = parseInt(e.target.value) / 100;
            document.getElementById('rustlingValue').textContent = this.getLabel(this.rustlingLevel);
            if (this.isPlaying) {
                this.updateRustling();
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
        if (value < 0.33) return '少';
        if (value < 0.66) return '中等';
        return '多';
    }

    updateDisplays() {
        document.getElementById('timeDisplay').textContent = this.timeSettings[this.timeOfDay].name;
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
        this.startRustling();
        this.scheduleBirds();
        this.scheduleInsects();

        this.isPlaying = true;

        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = '停止';
        playBtn.classList.add('playing');
        document.getElementById('statusDisplay').textContent = '播放中';
    }

    stop() {
        this.stopRustling();
        this.isPlaying = false;

        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = '開始';
        playBtn.classList.remove('playing');
        document.getElementById('statusDisplay').textContent = '停止';
    }

    startRustling() {
        // 樹葉沙沙聲（粉紅噪音）
        const bufferSize = this.audioContext.sampleRate * 4;
        const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);

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

        this.rustlingNoise = this.audioContext.createBufferSource();
        this.rustlingNoise.buffer = buffer;
        this.rustlingNoise.loop = true;

        // 高通濾波
        this.rustlingFilter = this.audioContext.createBiquadFilter();
        this.rustlingFilter.type = 'highpass';
        this.rustlingFilter.frequency.value = 2000;

        // LFO
        this.rustlingLfo = this.audioContext.createOscillator();
        this.rustlingLfo.type = 'sine';
        this.rustlingLfo.frequency.value = 0.3;

        this.rustlingLfoGain = this.audioContext.createGain();
        this.rustlingLfoGain.gain.value = 0.05;

        this.rustlingGain = this.audioContext.createGain();
        this.rustlingGain.gain.value = this.rustlingLevel * 0.15;

        this.rustlingLfo.connect(this.rustlingLfoGain);
        this.rustlingLfoGain.connect(this.rustlingGain.gain);

        this.rustlingNoise.connect(this.rustlingFilter);
        this.rustlingFilter.connect(this.rustlingGain);
        this.rustlingGain.connect(this.masterGain);

        this.rustlingNoise.start();
        this.rustlingLfo.start();
    }

    updateRustling() {
        if (this.rustlingGain) {
            this.rustlingGain.gain.setTargetAtTime(
                this.rustlingLevel * 0.15,
                this.audioContext.currentTime,
                0.3
            );
        }
    }

    stopRustling() {
        if (this.rustlingNoise) {
            this.rustlingNoise.stop();
            this.rustlingNoise = null;
        }
        if (this.rustlingLfo) {
            this.rustlingLfo.stop();
            this.rustlingLfo = null;
        }
    }

    scheduleBirds() {
        if (!this.isPlaying) return;

        const settings = this.timeSettings[this.timeOfDay];
        const chance = settings.birdRate * this.birdsLevel;

        if (Math.random() < chance) {
            this.playBirdCall();
        }

        setTimeout(() => this.scheduleBirds(), 500);
    }

    playBirdCall() {
        const now = this.audioContext.currentTime;
        const birdType = Math.floor(Math.random() * 4);

        switch (birdType) {
            case 0:
                this.playChirp(now);
                break;
            case 1:
                this.playWarble(now);
                break;
            case 2:
                this.playTweet(now);
                break;
            case 3:
                this.playCoo(now);
                break;
        }
    }

    playChirp(time) {
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';

        const baseFreq = 2000 + Math.random() * 1000;
        osc.frequency.setValueAtTime(baseFreq, time);
        osc.frequency.linearRampToValueAtTime(baseFreq * 1.5, time + 0.05);
        osc.frequency.linearRampToValueAtTime(baseFreq * 0.8, time + 0.1);

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.08 * this.birdsLevel, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

        const panner = this.audioContext.createStereoPanner();
        panner.pan.value = Math.random() * 2 - 1;

        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + 0.2);
    }

    playWarble(time) {
        for (let i = 0; i < 5; i++) {
            const osc = this.audioContext.createOscillator();
            osc.type = 'sine';

            const freq = 1500 + Math.random() * 500 + i * 100;
            const t = time + i * 0.08;

            osc.frequency.setValueAtTime(freq, t);
            osc.frequency.linearRampToValueAtTime(freq * 1.2, t + 0.04);

            const gain = this.audioContext.createGain();
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.05 * this.birdsLevel, t + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(t);
            osc.stop(t + 0.1);
        }
    }

    playTweet(time) {
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';

        const baseFreq = 2500 + Math.random() * 500;
        osc.frequency.setValueAtTime(baseFreq, time);
        osc.frequency.setValueAtTime(baseFreq * 0.9, time + 0.1);
        osc.frequency.setValueAtTime(baseFreq * 1.1, time + 0.15);

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.06 * this.birdsLevel, time);
        gain.gain.setValueAtTime(0.04 * this.birdsLevel, time + 0.08);
        gain.gain.setValueAtTime(0.05 * this.birdsLevel, time + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

        const panner = this.audioContext.createStereoPanner();
        panner.pan.value = Math.random() * 2 - 1;

        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + 0.3);
    }

    playCoo(time) {
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';

        osc.frequency.setValueAtTime(500, time);
        osc.frequency.linearRampToValueAtTime(400, time + 0.3);

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.04 * this.birdsLevel, time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + 0.5);
    }

    scheduleInsects() {
        if (!this.isPlaying) return;

        const settings = this.timeSettings[this.timeOfDay];
        const chance = settings.insectRate * this.insectsLevel;

        if (Math.random() < chance) {
            this.playInsectSound();
        }

        setTimeout(() => this.scheduleInsects(), 200);
    }

    playInsectSound() {
        const now = this.audioContext.currentTime;
        const type = Math.random() < 0.7 ? 'cricket' : 'cicada';

        if (type === 'cricket') {
            this.playCricket(now);
        } else {
            this.playCicada(now);
        }
    }

    playCricket(time) {
        const duration = 0.05 + Math.random() * 0.05;
        const count = 2 + Math.floor(Math.random() * 4);

        for (let i = 0; i < count; i++) {
            const t = time + i * (duration + 0.02);

            const osc = this.audioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = 4000 + Math.random() * 1000;

            const gain = this.audioContext.createGain();
            gain.gain.setValueAtTime(0.03 * this.insectsLevel, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

            const panner = this.audioContext.createStereoPanner();
            panner.pan.value = Math.random() * 2 - 1;

            osc.connect(gain);
            gain.connect(panner);
            panner.connect(this.masterGain);

            osc.start(t);
            osc.stop(t + duration);
        }
    }

    playCicada(time) {
        const duration = 1 + Math.random() * 2;

        const osc = this.audioContext.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = 3000 + Math.random() * 500;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 4000;
        filter.Q.value = 5;

        // 調變
        const lfo = this.audioContext.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 50 + Math.random() * 30;

        const lfoGain = this.audioContext.createGain();
        lfoGain.gain.value = 200;

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.02 * this.insectsLevel, time + 0.2);
        gain.gain.setValueAtTime(0.02 * this.insectsLevel, time + duration - 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(time);
        lfo.start(time);
        osc.stop(time + duration);
        lfo.stop(time + duration);
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.time += 0.016;

        this.drawSky();
        this.drawTrees();
        this.updateParticles();
        this.drawParticles();

        if (this.timeOfDay === 'night') {
            this.updateFireflies();
            this.drawFireflies();
        }

        requestAnimationFrame(() => this.animate());
    }

    drawSky() {
        const ctx = this.ctx;
        const settings = this.timeSettings[this.timeOfDay];

        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, settings.skyTop);
        gradient.addColorStop(0.6, settings.skyBottom);
        gradient.addColorStop(1, '#1a2a1a');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 夜晚星星
        if (this.timeOfDay === 'night') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            for (let i = 0; i < 100; i++) {
                const x = (i * 97) % this.canvas.width;
                const y = (i * 53) % (this.canvas.height * 0.5);
                const twinkle = Math.sin(this.time * 3 + i) * 0.3 + 0.7;
                ctx.globalAlpha = twinkle * 0.5;
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
    }

    drawTrees() {
        const ctx = this.ctx;
        const settings = this.timeSettings[this.timeOfDay];

        for (const tree of this.trees) {
            const darkness = 0.3 + tree.layer * 0.2;
            const sway = Math.sin(this.time * 0.5 + tree.x * 0.01) * 3 * (this.isPlaying ? this.rustlingLevel : 0.2);

            // 樹幹
            ctx.fillStyle = `rgba(60, 40, 30, ${settings.ambient})`;
            ctx.fillRect(
                tree.x - tree.width / 6,
                this.canvas.height - tree.height * 0.3,
                tree.width / 3,
                tree.height * 0.3
            );

            // 樹冠
            ctx.fillStyle = `rgba(${30 - tree.layer * 10}, ${60 - tree.layer * 15}, ${30 - tree.layer * 10}, ${settings.ambient})`;

            ctx.beginPath();
            ctx.moveTo(tree.x + sway, this.canvas.height - tree.height);
            ctx.lineTo(tree.x - tree.width + sway * 0.5, this.canvas.height - tree.height * 0.3);
            ctx.lineTo(tree.x + tree.width + sway * 0.5, this.canvas.height - tree.height * 0.3);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(tree.x + sway * 0.8, this.canvas.height - tree.height * 0.8);
            ctx.lineTo(tree.x - tree.width * 0.8 + sway * 0.4, this.canvas.height - tree.height * 0.2);
            ctx.lineTo(tree.x + tree.width * 0.8 + sway * 0.4, this.canvas.height - tree.height * 0.2);
            ctx.closePath();
            ctx.fill();
        }
    }

    updateParticles() {
        for (const p of this.particles) {
            p.y -= p.speed;
            p.x += Math.sin(this.time + p.y * 0.01) * 0.3;

            if (p.y < -10) {
                p.y = this.canvas.height + 10;
                p.x = Math.random() * this.canvas.width;
            }
        }
    }

    drawParticles() {
        const ctx = this.ctx;
        const settings = this.timeSettings[this.timeOfDay];

        for (const p of this.particles) {
            ctx.fillStyle = `rgba(200, 220, 200, ${p.opacity * settings.ambient})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    updateFireflies() {
        for (const f of this.fireflies) {
            f.phase += f.speed;
            f.x += Math.sin(f.phase * 0.5) * 0.5;
            f.y += Math.cos(f.phase * 0.3) * 0.3;

            if (f.x < 0) f.x = this.canvas.width;
            if (f.x > this.canvas.width) f.x = 0;
        }
    }

    drawFireflies() {
        const ctx = this.ctx;

        for (const f of this.fireflies) {
            const glow = (Math.sin(f.phase * 2) + 1) * 0.5;

            if (glow > 0.3) {
                const gradient = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 10);
                gradient.addColorStop(0, `rgba(200, 255, 100, ${glow * 0.8})`);
                gradient.addColorStop(0.5, `rgba(150, 200, 50, ${glow * 0.3})`);
                gradient.addColorStop(1, 'rgba(100, 150, 50, 0)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(f.x, f.y, 10, 0, Math.PI * 2);
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
    new ForestSoundApp();
});
