/**
 * Drum Machine 鼓機 - Web Toys #089
 * 經典節奏機模擬器
 */

class DrumMachineApp {
    constructor() {
        this.canvas = document.getElementById('drumCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 音頻上下文
        this.audioContext = null;
        this.masterGain = null;

        // 序列器狀態
        this.isPlaying = false;
        this.currentStep = 0;
        this.tempo = 120;
        this.swing = 0;
        this.volume = 0.5;
        this.steps = 16;

        // 鼓組定義
        this.drums = [
            { name: 'Kick', key: 'KeyQ', color: '#ff4444' },
            { name: 'Snare', key: 'KeyW', color: '#44ff44' },
            { name: 'Hi-Hat C', key: 'KeyE', color: '#4444ff' },
            { name: 'Hi-Hat O', key: 'KeyR', color: '#44ffff' },
            { name: 'Tom Hi', key: 'KeyT', color: '#ff44ff' },
            { name: 'Tom Lo', key: 'KeyY', color: '#ffff44' },
            { name: 'Clap', key: 'KeyU', color: '#ff8844' },
            { name: 'Rim', key: 'KeyI', color: '#88ff44' }
        ];

        // 節奏模式
        this.patterns = {
            basic: [
                [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], // Kick
                [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], // Snare
                [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], // HH Closed
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // HH Open
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // Tom Hi
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // Tom Lo
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // Clap
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]  // Rim
            ],
            rock: [
                [1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0],
                [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
                [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
                [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
            ],
            hiphop: [
                [1,0,0,1,0,0,1,0,0,0,1,0,0,0,0,0],
                [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1],
                [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
                [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
            ],
            house: [
                [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
                [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
                [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
                [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
                [0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0]
            ],
            dnb: [
                [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0],
                [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0]
            ]
        };

        // 當前節奏格
        this.grid = this.patterns.basic.map(row => [...row]);

        // 視覺效果
        this.animationId = null;
        this.hitEffects = [];
        this.schedulerId = null;
        this.nextStepTime = 0;

        // 鍵盤映射
        this.keyMap = {};
        this.drums.forEach((drum, i) => {
            this.keyMap[drum.key] = i;
        });

        this.init();
    }

    async init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.setupControls();
        this.setupEventListeners();
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    async initAudio() {
        if (this.audioContext) return;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = this.volume;
        this.masterGain.connect(this.audioContext.destination);
    }

    // 鼓音色合成
    playDrum(drumIndex, time = null) {
        if (!this.audioContext) return;

        const t = time || this.audioContext.currentTime;
        const drum = this.drums[drumIndex];

        switch (drumIndex) {
            case 0: this.playKick(t); break;
            case 1: this.playSnare(t); break;
            case 2: this.playHiHatClosed(t); break;
            case 3: this.playHiHatOpen(t); break;
            case 4: this.playTomHi(t); break;
            case 5: this.playTomLo(t); break;
            case 6: this.playClap(t); break;
            case 7: this.playRim(t); break;
        }

        // 視覺效果
        this.hitEffects.push({
            drumIndex: drumIndex,
            step: this.currentStep,
            alpha: 1,
            scale: 1.5
        });
    }

    playKick(t) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);

        gain.gain.setValueAtTime(0.8, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.5);
    }

    playSnare(t) {
        // 音調部分
        const osc = this.audioContext.createOscillator();
        const oscGain = this.audioContext.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);

        oscGain.gain.setValueAtTime(0.5, t);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.15);

        // 噪音部分
        const noise = this.createNoise(0.2);
        const noiseGain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        filter.type = 'highpass';
        filter.frequency.value = 1000;

        noiseGain.gain.setValueAtTime(0.6, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.masterGain);

        noise.start(t);
        noise.stop(t + 0.2);
    }

    playHiHatClosed(t) {
        const noise = this.createNoise(0.08);
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        filter.type = 'highpass';
        filter.frequency.value = 7000;

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start(t);
        noise.stop(t + 0.1);
    }

    playHiHatOpen(t) {
        const noise = this.createNoise(0.3);
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        filter.type = 'highpass';
        filter.frequency.value = 6000;

        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start(t);
        noise.stop(t + 0.35);
    }

    playTomHi(t) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(150, t + 0.15);

        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.35);
    }

    playTomLo(t) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.2);

        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.45);
    }

    playClap(t) {
        for (let i = 0; i < 3; i++) {
            const noise = this.createNoise(0.03);
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            filter.type = 'bandpass';
            filter.frequency.value = 2500;
            filter.Q.value = 3;

            const offset = t + i * 0.01;
            gain.gain.setValueAtTime(0.5, offset);
            gain.gain.exponentialRampToValueAtTime(0.001, offset + 0.08);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            noise.start(offset);
            noise.stop(offset + 0.1);
        }
    }

    playRim(t) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, t);

        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.05);
    }

    createNoise(duration) {
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        return noise;
    }

    setupControls() {
        // 播放按鈕
        const playBtn = document.getElementById('playBtn');
        playBtn.addEventListener('click', () => this.togglePlay());

        // 節奏選擇
        const patternSelect = document.getElementById('pattern');
        patternSelect.addEventListener('change', (e) => {
            this.grid = this.patterns[e.target.value].map(row => [...row]);
        });

        // 速度
        const tempoSlider = document.getElementById('tempo');
        const tempoValue = document.getElementById('tempoValue');
        tempoSlider.addEventListener('input', (e) => {
            this.tempo = parseInt(e.target.value);
            tempoValue.textContent = this.tempo;
        });

        // 搖擺
        const swingSlider = document.getElementById('swing');
        const swingValue = document.getElementById('swingValue');
        swingSlider.addEventListener('input', (e) => {
            this.swing = parseInt(e.target.value);
            swingValue.textContent = this.swing;
        });

        // 音量
        const volumeSlider = document.getElementById('volume');
        const volumeValue = document.getElementById('volumeValue');
        volumeSlider.addEventListener('input', (e) => {
            this.volume = parseInt(e.target.value) / 100;
            volumeValue.textContent = e.target.value;
            if (this.masterGain) {
                this.masterGain.gain.value = this.volume;
            }
        });
    }

    setupEventListeners() {
        // 點擊網格
        this.canvas.addEventListener('click', (e) => this.handleGridClick(e));

        // 鍵盤
        document.addEventListener('keydown', async (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePlay();
            } else if (this.keyMap.hasOwnProperty(e.code)) {
                await this.initAudio();
                this.playDrum(this.keyMap[e.code]);
            }
        });
    }

    handleGridClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const gridInfo = this.getGridLayout();
        if (!gridInfo) return;

        const { startX, startY, cellWidth, cellHeight } = gridInfo;

        // 檢查是否在網格範圍內
        if (x < startX || x > startX + this.steps * cellWidth) return;
        if (y < startY || y > startY + this.drums.length * cellHeight) return;

        const step = Math.floor((x - startX) / cellWidth);
        const drumIndex = Math.floor((y - startY) / cellHeight);

        if (step >= 0 && step < this.steps && drumIndex >= 0 && drumIndex < this.drums.length) {
            this.grid[drumIndex][step] = this.grid[drumIndex][step] ? 0 : 1;
        }
    }

    getGridLayout() {
        const padding = 40;
        const labelWidth = 80;
        const gridWidth = Math.min(this.canvas.width - 350, 900);
        const gridHeight = Math.min(this.canvas.height - 200, 400);

        const cellWidth = gridWidth / this.steps;
        const cellHeight = gridHeight / this.drums.length;

        const startX = (this.canvas.width - gridWidth) / 2 + 50;
        const startY = (this.canvas.height - gridHeight) / 2;

        return { startX, startY, cellWidth, cellHeight, gridWidth, gridHeight, labelWidth };
    }

    async togglePlay() {
        await this.initAudio();

        this.isPlaying = !this.isPlaying;

        const playBtn = document.getElementById('playBtn');
        const statusDisplay = document.getElementById('statusDisplay');

        if (this.isPlaying) {
            playBtn.textContent = '停止';
            playBtn.classList.add('playing');
            statusDisplay.textContent = '播放中';
            this.currentStep = 0;
            this.nextStepTime = this.audioContext.currentTime;
            this.schedule();
        } else {
            playBtn.textContent = '播放';
            playBtn.classList.remove('playing');
            statusDisplay.textContent = '停止';
            if (this.schedulerId) {
                clearTimeout(this.schedulerId);
            }
        }
    }

    schedule() {
        if (!this.isPlaying) return;

        const lookAhead = 0.1;
        const scheduleInterval = 25;

        while (this.nextStepTime < this.audioContext.currentTime + lookAhead) {
            this.scheduleStep(this.currentStep, this.nextStepTime);

            const secondsPerBeat = 60 / this.tempo;
            const secondsPerStep = secondsPerBeat / 4;

            // 搖擺效果
            let swingOffset = 0;
            if (this.currentStep % 2 === 1) {
                swingOffset = secondsPerStep * (this.swing / 100) * 0.5;
            }

            this.nextStepTime += secondsPerStep + swingOffset;
            this.currentStep = (this.currentStep + 1) % this.steps;
        }

        this.schedulerId = setTimeout(() => this.schedule(), scheduleInterval);
    }

    scheduleStep(step, time) {
        for (let drumIndex = 0; drumIndex < this.drums.length; drumIndex++) {
            if (this.grid[drumIndex][step]) {
                this.playDrum(drumIndex, time);
            }
        }

        // 更新顯示
        document.getElementById('beatDisplay').textContent = step + 1;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawBackground();
        this.drawGrid();
        this.drawHitEffects();
        this.updateEffects();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawBackground() {
        const ctx = this.ctx;

        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a1a22');
        gradient.addColorStop(0.5, '#0f0f15');
        gradient.addColorStop(1, '#0a0a0f');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid() {
        const ctx = this.ctx;
        const gridInfo = this.getGridLayout();
        if (!gridInfo) return;

        const { startX, startY, cellWidth, cellHeight, gridWidth, gridHeight, labelWidth } = gridInfo;

        // 繪製鼓名標籤
        ctx.font = '14px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < this.drums.length; i++) {
            const y = startY + i * cellHeight + cellHeight / 2;
            ctx.fillStyle = this.drums[i].color;
            ctx.fillText(this.drums[i].name, startX - 15, y);
        }

        // 繪製步數標籤
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        for (let i = 0; i < this.steps; i++) {
            const x = startX + i * cellWidth + cellWidth / 2;
            ctx.fillText((i + 1).toString(), x, startY - 15);
        }

        // 繪製網格
        for (let drumIndex = 0; drumIndex < this.drums.length; drumIndex++) {
            for (let step = 0; step < this.steps; step++) {
                const x = startX + step * cellWidth;
                const y = startY + drumIndex * cellHeight;

                // 背景
                const isCurrentStep = this.isPlaying && step === this.currentStep;
                const isBeat = step % 4 === 0;

                if (isCurrentStep) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                } else if (isBeat) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                } else {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
                }

                ctx.fillRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);

                // 邊框
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = 1;
                ctx.strokeRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);

                // 啟用的格子
                if (this.grid[drumIndex][step]) {
                    const padding = 6;

                    // 漸層填充
                    const grad = ctx.createRadialGradient(
                        x + cellWidth / 2, y + cellHeight / 2, 0,
                        x + cellWidth / 2, y + cellHeight / 2, cellWidth / 2
                    );
                    grad.addColorStop(0, this.drums[drumIndex].color);
                    grad.addColorStop(1, this.darkenColor(this.drums[drumIndex].color, 40));

                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.roundRect(x + padding, y + padding,
                        cellWidth - padding * 2, cellHeight - padding * 2, 4);
                    ctx.fill();

                    // 高光
                    if (isCurrentStep) {
                        ctx.save();
                        ctx.shadowBlur = 15;
                        ctx.shadowColor = this.drums[drumIndex].color;
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                        ctx.beginPath();
                        ctx.roundRect(x + padding, y + padding,
                            cellWidth - padding * 2, cellHeight - padding * 2, 4);
                        ctx.fill();
                        ctx.restore();
                    }
                }
            }
        }

        // 當前步進指示線
        if (this.isPlaying) {
            const lineX = startX + this.currentStep * cellWidth + cellWidth / 2;
            ctx.strokeStyle = 'rgba(255, 100, 100, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(lineX, startY - 5);
            ctx.lineTo(lineX, startY + gridHeight + 5);
            ctx.stroke();
        }
    }

    darkenColor(color, percent) {
        const num = parseInt(color.slice(1), 16);
        const r = Math.max(0, (num >> 16) - percent * 2.55);
        const g = Math.max(0, ((num >> 8) & 0x00FF) - percent * 2.55);
        const b = Math.max(0, (num & 0x0000FF) - percent * 2.55);
        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }

    drawHitEffects() {
        const ctx = this.ctx;
        const gridInfo = this.getGridLayout();
        if (!gridInfo) return;

        const { startX, startY, cellWidth, cellHeight } = gridInfo;

        for (const effect of this.hitEffects) {
            const x = startX + effect.step * cellWidth + cellWidth / 2;
            const y = startY + effect.drumIndex * cellHeight + cellHeight / 2;
            const color = this.drums[effect.drumIndex].color;

            ctx.save();
            ctx.globalAlpha = effect.alpha;
            ctx.shadowBlur = 20 * effect.alpha;
            ctx.shadowColor = color;

            ctx.beginPath();
            ctx.arc(x, y, cellWidth * effect.scale * 0.4, 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
        }
    }

    updateEffects() {
        for (let i = this.hitEffects.length - 1; i >= 0; i--) {
            this.hitEffects[i].alpha -= 0.05;
            this.hitEffects[i].scale += 0.05;

            if (this.hitEffects[i].alpha <= 0) {
                this.hitEffects.splice(i, 1);
            }
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.schedulerId) {
            clearTimeout(this.schedulerId);
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// 啟動應用
document.addEventListener('DOMContentLoaded', () => {
    new DrumMachineApp();
});
