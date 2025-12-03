/**
 * Ambient Drone 氛圍音景 - Web Toys #096
 * 生成持續演化的氛圍音樂
 */

class AmbientDroneApp {
    constructor() {
        this.canvas = document.getElementById('droneCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 音頻上下文
        this.audioContext = null;
        this.masterGain = null;
        this.convolver = null;
        this.drones = [];

        // 狀態
        this.isPlaying = false;
        this.mood = 'peaceful';
        this.baseNote = 48;
        this.density = 0.5;
        this.movement = 0.5;
        this.volume = 0.4;

        // 氛圍設定
        this.moodSettings = {
            peaceful: {
                intervals: [0, 7, 12, 19],
                color: '#6496c8',
                waveTypes: ['sine', 'sine', 'triangle']
            },
            cosmic: {
                intervals: [0, 5, 12, 17, 24],
                color: '#9664c8',
                waveTypes: ['sine', 'triangle', 'sine']
            },
            dark: {
                intervals: [0, 3, 6, 12],
                color: '#644864',
                waveTypes: ['sawtooth', 'sine', 'triangle']
            },
            ethereal: {
                intervals: [0, 7, 14, 19, 24],
                color: '#64c8c8',
                waveTypes: ['sine', 'sine', 'sine']
            },
            warm: {
                intervals: [0, 4, 7, 12, 16],
                color: '#c89664',
                waveTypes: ['triangle', 'sine', 'triangle']
            }
        };

        // 視覺效果
        this.animationId = null;
        this.particles = [];
        this.time = 0;

        this.init();
    }

    async init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.setupControls();
        this.setupEventListeners();
        this.initParticles();
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.initParticles();
    }

    initParticles() {
        this.particles = [];
        const count = 80;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    async initAudio() {
        if (this.audioContext) return;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // 殘響
        this.convolver = this.audioContext.createConvolver();
        await this.createReverb();

        this.wetGain = this.audioContext.createGain();
        this.wetGain.gain.value = 0.6;

        this.dryGain = this.audioContext.createGain();
        this.dryGain.gain.value = 0.4;

        // 主音量
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = this.volume;

        // 連接
        this.convolver.connect(this.wetGain);
        this.wetGain.connect(this.masterGain);
        this.dryGain.connect(this.masterGain);
        this.masterGain.connect(this.audioContext.destination);
    }

    async createReverb() {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * 5;
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const data = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const t = i / sampleRate;
                data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 1.2);
            }
        }

        this.convolver.buffer = impulse;
    }

    setupControls() {
        // 播放按鈕
        const playBtn = document.getElementById('playBtn');
        playBtn.addEventListener('click', () => this.togglePlay());

        // 氛圍
        const moodSelect = document.getElementById('mood');
        moodSelect.addEventListener('change', (e) => {
            this.mood = e.target.value;
            this.updateMoodDisplay();
            if (this.isPlaying) {
                this.restartDrones();
            }
        });

        // 基礎音
        const baseNoteSlider = document.getElementById('baseNote');
        baseNoteSlider.addEventListener('input', (e) => {
            this.baseNote = parseInt(e.target.value);
            document.getElementById('baseNoteValue').textContent = this.midiToNoteName(this.baseNote);
            if (this.isPlaying) {
                this.restartDrones();
            }
        });

        // 密度
        const densitySlider = document.getElementById('density');
        densitySlider.addEventListener('input', (e) => {
            this.density = parseInt(e.target.value) / 100;
            document.getElementById('densityValue').textContent = this.getAmountLabel(this.density);
        });

        // 動態
        const movementSlider = document.getElementById('movement');
        movementSlider.addEventListener('input', (e) => {
            this.movement = parseInt(e.target.value) / 100;
            document.getElementById('movementValue').textContent = this.getAmountLabel(this.movement);
        });

        // 音量
        const volumeSlider = document.getElementById('volume');
        const volumeValue = document.getElementById('volumeValue');
        volumeSlider.addEventListener('input', (e) => {
            this.volume = parseInt(e.target.value) / 100;
            volumeValue.textContent = e.target.value;
            if (this.masterGain) {
                this.masterGain.gain.setTargetAtTime(this.volume, this.audioContext.currentTime, 0.1);
            }
        });
    }

    getAmountLabel(amount) {
        if (amount < 0.33) return '低';
        if (amount < 0.66) return '中等';
        return '高';
    }

    updateMoodDisplay() {
        const labels = {
            peaceful: '寧靜',
            cosmic: '宇宙',
            dark: '黑暗',
            ethereal: '空靈',
            warm: '溫暖'
        };
        document.getElementById('moodDisplay').textContent = labels[this.mood];
    }

    midiToNoteName(midi) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const note = notes[midi % 12];
        const octave = Math.floor(midi / 12) - 1;
        return note + octave;
    }

    midiToFreq(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePlay();
            }
        });
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
        this.createDrones();
        this.startEvolution();

        this.isPlaying = true;

        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = '停止';
        playBtn.classList.add('playing');
        document.getElementById('statusDisplay').textContent = '播放中';
    }

    stop() {
        this.stopDrones();
        if (this.evolutionInterval) {
            clearInterval(this.evolutionInterval);
        }

        this.isPlaying = false;

        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = '播放';
        playBtn.classList.remove('playing');
        document.getElementById('statusDisplay').textContent = '停止';
    }

    createDrones() {
        const settings = this.moodSettings[this.mood];
        const layerCount = 2 + Math.floor(this.density * 3);

        for (let i = 0; i < layerCount; i++) {
            const interval = settings.intervals[i % settings.intervals.length];
            const freq = this.midiToFreq(this.baseNote + interval);
            const waveType = settings.waveTypes[i % settings.waveTypes.length];

            this.createDroneLayer(freq, waveType, i);
        }
    }

    createDroneLayer(freq, waveType, index) {
        const now = this.audioContext.currentTime;

        // 主振盪器
        const osc = this.audioContext.createOscillator();
        osc.type = waveType;
        osc.frequency.value = freq;

        // LFO 調製
        const lfo = this.audioContext.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1 + Math.random() * 0.2 * this.movement;

        const lfoGain = this.audioContext.createGain();
        lfoGain.gain.value = freq * 0.005 * this.movement;

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        // 濾波器
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800 + index * 200;
        filter.Q.value = 0.5;

        // 濾波器 LFO
        const filterLfo = this.audioContext.createOscillator();
        filterLfo.type = 'sine';
        filterLfo.frequency.value = 0.05 + Math.random() * 0.1;

        const filterLfoGain = this.audioContext.createGain();
        filterLfoGain.gain.value = 200 * this.movement;

        filterLfo.connect(filterLfoGain);
        filterLfoGain.connect(filter.frequency);

        // 音量包絡
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15 / (index + 1), now + 3);

        // 連接
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.dryGain);
        gain.connect(this.convolver);

        // 啟動
        osc.start(now);
        lfo.start(now);
        filterLfo.start(now);

        this.drones.push({ osc, lfo, filterLfo, gain, filter, freq });
    }

    stopDrones() {
        const now = this.audioContext ? this.audioContext.currentTime : 0;

        for (const drone of this.drones) {
            drone.gain.gain.linearRampToValueAtTime(0, now + 2);
            drone.osc.stop(now + 2.5);
            drone.lfo.stop(now + 2.5);
            drone.filterLfo.stop(now + 2.5);
        }

        this.drones = [];
    }

    restartDrones() {
        this.stopDrones();
        setTimeout(() => {
            if (this.isPlaying) {
                this.createDrones();
            }
        }, 100);
    }

    startEvolution() {
        // 緩慢演化參數
        this.evolutionInterval = setInterval(() => {
            if (!this.isPlaying) return;

            for (const drone of this.drones) {
                const now = this.audioContext.currentTime;

                // 隨機微調濾波器
                if (Math.random() < 0.3 * this.movement) {
                    const newFreq = 600 + Math.random() * 800;
                    drone.filter.frequency.linearRampToValueAtTime(newFreq, now + 5);
                }
            }
        }, 5000);
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.time += 0.01;
        this.drawBackground();
        this.drawWaves();
        this.drawParticles();
        this.updateParticles();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawBackground() {
        const ctx = this.ctx;
        const settings = this.moodSettings[this.mood];

        const gradient = ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2,
            Math.max(this.canvas.width, this.canvas.height) * 0.7
        );

        const pulse = this.isPlaying ? Math.sin(this.time) * 0.1 + 0.9 : 1;

        gradient.addColorStop(0, this.adjustBrightness(settings.color, -60 * pulse));
        gradient.addColorStop(0.5, '#0a0a15');
        gradient.addColorStop(1, '#050510');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    adjustBrightness(hex, amount) {
        const num = parseInt(hex.slice(1), 16);
        const r = Math.max(0, Math.min(255, (num >> 16) + amount));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 0xFF) + amount));
        const b = Math.max(0, Math.min(255, (num & 0xFF) + amount));
        return `rgb(${r}, ${g}, ${b})`;
    }

    drawWaves() {
        if (!this.isPlaying) return;

        const ctx = this.ctx;
        const settings = this.moodSettings[this.mood];
        const centerY = this.canvas.height / 2;

        for (let w = 0; w < 3; w++) {
            ctx.beginPath();

            const amplitude = 30 + w * 20;
            const frequency = 0.002 + w * 0.001;
            const speed = this.time * (1 + w * 0.5) * this.movement;

            for (let x = 0; x < this.canvas.width; x += 5) {
                const y = centerY + Math.sin(x * frequency + speed) * amplitude
                    + Math.sin(x * frequency * 2 + speed * 1.5) * amplitude * 0.5;

                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            ctx.strokeStyle = `${settings.color}${Math.floor((0.3 - w * 0.1) * 255).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    drawParticles() {
        const ctx = this.ctx;
        const settings = this.moodSettings[this.mood];

        for (const p of this.particles) {
            const alpha = this.isPlaying
                ? 0.3 + Math.sin(p.phase + this.time * 2) * 0.2
                : 0.1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `${settings.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.fill();
        }
    }

    updateParticles() {
        const speed = this.isPlaying ? this.movement : 0.2;

        for (const p of this.particles) {
            p.x += p.speedX * speed;
            p.y += p.speedY * speed;
            p.phase += 0.02;

            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.stop();
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// 啟動應用
document.addEventListener('DOMContentLoaded', () => {
    new AmbientDroneApp();
});
