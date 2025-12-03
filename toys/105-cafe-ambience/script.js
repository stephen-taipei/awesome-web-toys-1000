/**
 * Cafe Ambience 咖啡廳氛圍 - Web Toys #105
 * 生成沉浸式咖啡廳環境音
 */

class CafeAmbienceApp {
    constructor() {
        this.canvas = document.getElementById('cafeCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 音頻
        this.audioContext = null;
        this.masterGain = null;
        this.crowdNoise = null;

        // 設定
        this.crowdLevel = 0.5;
        this.dishesLevel = 0.5;
        this.coffeeLevel = 0.5;
        this.musicLevel = 0;
        this.volume = 0.5;

        // 狀態
        this.isPlaying = false;
        this.time = 0;

        // 視覺元素
        this.tables = [];
        this.cups = [];
        this.steam = [];
        this.lights = [];

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
        // 桌子
        this.tables = [];
        const tableCount = 6;
        for (let i = 0; i < tableCount; i++) {
            this.tables.push({
                x: 100 + (i % 3) * (this.canvas.width - 200) / 2.5,
                y: this.canvas.height * 0.5 + Math.floor(i / 3) * 150,
                width: 80 + Math.random() * 40,
                occupied: Math.random() > 0.3
            });
        }

        // 咖啡杯
        this.cups = [];
        for (const table of this.tables) {
            if (table.occupied) {
                this.cups.push({
                    x: table.x + (Math.random() - 0.5) * 30,
                    y: table.y - 10,
                    size: 15 + Math.random() * 5
                });
            }
        }

        // 蒸氣
        this.steam = [];

        // 燈光
        this.lights = [];
        for (let i = 0; i < 5; i++) {
            this.lights.push({
                x: 100 + i * (this.canvas.width - 200) / 4,
                y: 100,
                radius: 150 + Math.random() * 50,
                flicker: Math.random() * Math.PI * 2
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

        // 人聲
        const crowdSlider = document.getElementById('crowdLevel');
        crowdSlider.addEventListener('input', (e) => {
            this.crowdLevel = parseInt(e.target.value) / 100;
            document.getElementById('crowdLevelValue').textContent = this.getLabel(this.crowdLevel);
            this.updateAmbienceDisplay();
            if (this.isPlaying) this.updateCrowdNoise();
        });

        // 餐具聲
        const dishesSlider = document.getElementById('dishes');
        dishesSlider.addEventListener('input', (e) => {
            this.dishesLevel = parseInt(e.target.value) / 100;
            document.getElementById('dishesValue').textContent = this.getLabel(this.dishesLevel);
        });

        // 咖啡機
        const coffeeSlider = document.getElementById('coffee');
        coffeeSlider.addEventListener('input', (e) => {
            this.coffeeLevel = parseInt(e.target.value) / 100;
            document.getElementById('coffeeValue').textContent = this.getLabel(this.coffeeLevel);
        });

        // 背景音樂
        const musicSlider = document.getElementById('music');
        musicSlider.addEventListener('input', (e) => {
            this.musicLevel = parseInt(e.target.value) / 100;
            document.getElementById('musicValue').textContent = this.getMusicLabel(this.musicLevel);
            if (this.isPlaying) this.updateMusic();
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

    getMusicLabel(level) {
        if (level < 0.1) return '關閉';
        if (level < 0.4) return '輕柔';
        if (level < 0.7) return '適中';
        return '明顯';
    }

    updateAmbienceDisplay() {
        let ambience = '寧靜';
        if (this.crowdLevel > 0.7) ambience = '熱鬧';
        else if (this.crowdLevel > 0.4) ambience = '舒適';
        document.getElementById('ambienceDisplay').textContent = ambience;
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
        this.startCrowdNoise();
        this.scheduleDishes();
        this.scheduleCoffeeMachine();
        if (this.musicLevel > 0) this.startMusic();

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

    startCrowdNoise() {
        // 人聲雜音
        const bufferSize = this.audioContext.sampleRate * 4;
        const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            let b0 = 0, b1 = 0, b2 = 0;

            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99765 * b0 + white * 0.0990460;
                b1 = 0.96300 * b1 + white * 0.2965164;
                b2 = 0.57000 * b2 + white * 1.0526913;
                data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.06;
            }
        }

        this.crowdNoise = this.audioContext.createBufferSource();
        this.crowdNoise.buffer = buffer;
        this.crowdNoise.loop = true;

        // 帶通濾波（人聲頻率）
        this.crowdFilter = this.audioContext.createBiquadFilter();
        this.crowdFilter.type = 'bandpass';
        this.crowdFilter.frequency.value = 400;
        this.crowdFilter.Q.value = 0.8;

        // 音量起伏 LFO
        this.crowdLfo = this.audioContext.createOscillator();
        this.crowdLfo.type = 'sine';
        this.crowdLfo.frequency.value = 0.1;

        this.crowdLfoGain = this.audioContext.createGain();
        this.crowdLfoGain.gain.value = 0.03;

        this.crowdGain = this.audioContext.createGain();
        this.crowdGain.gain.value = this.crowdLevel * 0.25;

        this.crowdLfo.connect(this.crowdLfoGain);
        this.crowdLfoGain.connect(this.crowdGain.gain);

        this.crowdNoise.connect(this.crowdFilter);
        this.crowdFilter.connect(this.crowdGain);
        this.crowdGain.connect(this.masterGain);

        this.crowdNoise.start();
        this.crowdLfo.start();
    }

    updateCrowdNoise() {
        if (this.crowdGain) {
            this.crowdGain.gain.setTargetAtTime(
                this.crowdLevel * 0.25,
                this.audioContext.currentTime,
                0.5
            );
        }
    }

    scheduleDishes() {
        if (!this.isPlaying) return;

        if (Math.random() < this.dishesLevel * 0.03) {
            this.playDishSound();
        }

        setTimeout(() => this.scheduleDishes(), 500);
    }

    playDishSound() {
        const now = this.audioContext.currentTime;
        const type = Math.random();

        if (type < 0.4) {
            // 杯子放下
            this.playCupDown(now);
        } else if (type < 0.7) {
            // 湯匙攪拌
            this.playStir(now);
        } else {
            // 盤子碰撞
            this.playPlate(now);
        }
    }

    playCupDown(time) {
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, time);
        osc.frequency.exponentialRampToValueAtTime(200, time + 0.1);

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.05 * this.dishesLevel, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

        const panner = this.audioContext.createStereoPanner();
        panner.pan.value = Math.random() * 2 - 1;

        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + 0.2);
    }

    playStir(time) {
        for (let i = 0; i < 4; i++) {
            const t = time + i * 0.15;

            const osc = this.audioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = 2000 + Math.random() * 1000;

            const gain = this.audioContext.createGain();
            gain.gain.setValueAtTime(0.02 * this.dishesLevel, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(t);
            osc.stop(t + 0.1);
        }
    }

    playPlate(time) {
        const freq = 1500 + Math.random() * 500;

        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;

        const osc2 = this.audioContext.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = freq * 1.5;

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.04 * this.dishesLevel, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

        const panner = this.audioContext.createStereoPanner();
        panner.pan.value = Math.random() * 2 - 1;

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(panner);
        panner.connect(this.masterGain);

        osc.start(time);
        osc2.start(time);
        osc.stop(time + 0.25);
        osc2.stop(time + 0.25);
    }

    scheduleCoffeeMachine() {
        if (!this.isPlaying) return;

        if (Math.random() < this.coffeeLevel * 0.01) {
            this.playCoffeeMachine();
        }

        setTimeout(() => this.scheduleCoffeeMachine(), 1000);
    }

    playCoffeeMachine() {
        const now = this.audioContext.currentTime;
        const duration = 3 + Math.random() * 2;

        // 蒸氣噪音
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 3000;
        filter.Q.value = 2;

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08 * this.coffeeLevel, now + 0.5);
        gain.gain.setValueAtTime(0.08 * this.coffeeLevel, now + duration - 0.5);
        gain.gain.linearRampToValueAtTime(0, now + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start(now);
        noise.stop(now + duration);

        // 添加蒸氣視覺
        this.addSteam();
    }

    addSteam() {
        const x = this.canvas.width * 0.8;
        const y = this.canvas.height * 0.4;

        for (let i = 0; i < 5; i++) {
            this.steam.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y,
                size: 5 + Math.random() * 10,
                speed: 1 + Math.random(),
                opacity: 0.5
            });
        }
    }

    startMusic() {
        // 簡單的背景旋律
        this.musicOsc = this.audioContext.createOscillator();
        this.musicOsc.type = 'sine';
        this.musicOsc.frequency.value = 220;

        this.musicLfo = this.audioContext.createOscillator();
        this.musicLfo.type = 'sine';
        this.musicLfo.frequency.value = 0.1;

        this.musicLfoGain = this.audioContext.createGain();
        this.musicLfoGain.gain.value = 20;

        this.musicLfo.connect(this.musicLfoGain);
        this.musicLfoGain.connect(this.musicOsc.frequency);

        this.musicGain = this.audioContext.createGain();
        this.musicGain.gain.value = this.musicLevel * 0.03;

        this.musicOsc.connect(this.musicGain);
        this.musicGain.connect(this.masterGain);

        this.musicOsc.start();
        this.musicLfo.start();
    }

    updateMusic() {
        if (this.musicLevel > 0 && !this.musicOsc) {
            this.startMusic();
        } else if (this.musicGain) {
            this.musicGain.gain.setTargetAtTime(
                this.musicLevel * 0.03,
                this.audioContext.currentTime,
                0.3
            );
        }
    }

    stopAllSounds() {
        if (this.crowdNoise) {
            this.crowdNoise.stop();
            this.crowdNoise = null;
        }
        if (this.crowdLfo) {
            this.crowdLfo.stop();
            this.crowdLfo = null;
        }
        if (this.musicOsc) {
            this.musicOsc.stop();
            this.musicOsc = null;
        }
        if (this.musicLfo) {
            this.musicLfo.stop();
            this.musicLfo = null;
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.time += 0.016;

        this.drawBackground();
        this.drawLights();
        this.drawTables();
        this.drawCups();
        this.updateSteam();
        this.drawSteam();
        this.drawDecor();

        requestAnimationFrame(() => this.animate());
    }

    drawBackground() {
        const ctx = this.ctx;

        // 漸層背景
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#2a2018');
        gradient.addColorStop(0.5, '#1a1510');
        gradient.addColorStop(1, '#0f0c08');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 木地板紋理
        ctx.fillStyle = 'rgba(60, 45, 30, 0.3)';
        for (let y = this.canvas.height * 0.6; y < this.canvas.height; y += 30) {
            ctx.fillRect(0, y, this.canvas.width, 28);
        }
    }

    drawLights() {
        const ctx = this.ctx;

        for (const light of this.lights) {
            light.flicker += 0.05;
            const intensity = 0.8 + Math.sin(light.flicker) * 0.1;

            const gradient = ctx.createRadialGradient(
                light.x, light.y, 0,
                light.x, light.y, light.radius * intensity
            );

            gradient.addColorStop(0, `rgba(255, 200, 120, ${0.3 * intensity})`);
            gradient.addColorStop(0.5, `rgba(200, 150, 80, ${0.1 * intensity})`);
            gradient.addColorStop(1, 'rgba(100, 70, 40, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
            ctx.fill();

            // 燈具
            ctx.fillStyle = '#4a3a28';
            ctx.beginPath();
            ctx.arc(light.x, light.y - 20, 20, Math.PI, 0);
            ctx.fill();
        }
    }

    drawTables() {
        const ctx = this.ctx;

        for (const table of this.tables) {
            // 桌面陰影
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(table.x + 5, table.y + 8, table.width / 2, 15, 0, 0, Math.PI * 2);
            ctx.fill();

            // 桌面
            ctx.fillStyle = '#5a4530';
            ctx.beginPath();
            ctx.ellipse(table.x, table.y, table.width / 2, 15, 0, 0, Math.PI * 2);
            ctx.fill();

            // 桌面高光
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.beginPath();
            ctx.ellipse(table.x - 10, table.y - 5, table.width / 4, 5, -0.3, 0, Math.PI * 2);
            ctx.fill();

            // 桌腿
            ctx.fillStyle = '#3a2820';
            ctx.fillRect(table.x - 5, table.y + 10, 10, 60);
        }
    }

    drawCups() {
        const ctx = this.ctx;

        for (const cup of this.cups) {
            // 杯子
            ctx.fillStyle = '#f8f0e8';
            ctx.beginPath();
            ctx.moveTo(cup.x - cup.size / 2, cup.y);
            ctx.lineTo(cup.x - cup.size / 2.5, cup.y - cup.size);
            ctx.lineTo(cup.x + cup.size / 2.5, cup.y - cup.size);
            ctx.lineTo(cup.x + cup.size / 2, cup.y);
            ctx.closePath();
            ctx.fill();

            // 咖啡
            ctx.fillStyle = '#3a2a1a';
            ctx.beginPath();
            ctx.ellipse(cup.x, cup.y - cup.size + 3, cup.size / 2.5 - 2, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            // 把手
            ctx.strokeStyle = '#f8f0e8';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cup.x + cup.size / 2 + 5, cup.y - cup.size / 2, 6, -Math.PI / 2, Math.PI / 2);
            ctx.stroke();
        }
    }

    updateSteam() {
        for (let i = this.steam.length - 1; i >= 0; i--) {
            const s = this.steam[i];
            s.y -= s.speed;
            s.x += Math.sin(this.time * 3 + i) * 0.5;
            s.opacity -= 0.01;
            s.size += 0.1;

            if (s.opacity <= 0) {
                this.steam.splice(i, 1);
            }
        }
    }

    drawSteam() {
        const ctx = this.ctx;

        for (const s of this.steam) {
            ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity * 0.3})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawDecor() {
        const ctx = this.ctx;

        // 窗戶
        ctx.fillStyle = 'rgba(100, 120, 150, 0.2)';
        ctx.fillRect(this.canvas.width - 150, 50, 100, 150);

        // 窗框
        ctx.strokeStyle = '#4a3a28';
        ctx.lineWidth = 5;
        ctx.strokeRect(this.canvas.width - 150, 50, 100, 150);
        ctx.beginPath();
        ctx.moveTo(this.canvas.width - 100, 50);
        ctx.lineTo(this.canvas.width - 100, 200);
        ctx.moveTo(this.canvas.width - 150, 125);
        ctx.lineTo(this.canvas.width - 50, 125);
        ctx.stroke();

        // 植物
        ctx.fillStyle = '#3a5a30';
        ctx.beginPath();
        ctx.arc(80, this.canvas.height - 100, 40, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#4a3020';
        ctx.fillRect(65, this.canvas.height - 60, 30, 60);
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
    new CafeAmbienceApp();
});
