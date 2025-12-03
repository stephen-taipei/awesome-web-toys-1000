/**
 * Binaural Beats 雙耳節拍 - Web Toys #093
 * 產生雙耳節拍促進不同腦波狀態
 */

class BinauralBeatsApp {
    constructor() {
        this.canvas = document.getElementById('binauralCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 音頻上下文
        this.audioContext = null;
        this.leftOsc = null;
        this.rightOsc = null;
        this.leftGain = null;
        this.rightGain = null;
        this.merger = null;

        // 狀態
        this.isPlaying = false;
        this.baseFreq = 200;
        this.beatFreq = 10;
        this.volume = 0.3;

        // 預設腦波模式
        this.presets = {
            delta: { beatFreq: 2, desc: '深度睡眠' },
            theta: { beatFreq: 6, desc: '冥想放鬆' },
            alpha: { beatFreq: 10, desc: '放鬆專注' },
            beta: { beatFreq: 20, desc: '警覺思考' },
            gamma: { beatFreq: 40, desc: '高度專注' }
        };

        // 視覺效果
        this.animationId = null;
        this.phase = 0;
        this.particles = [];

        this.init();
    }

    async init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.setupControls();
        this.setupEventListeners();
        this.initParticles();
        this.updateFrequencyDisplay();
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.initParticles();
    }

    initParticles() {
        this.particles = [];
        const count = 50;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speed: Math.random() * 0.5 + 0.2,
                angle: Math.random() * Math.PI * 2
            });
        }
    }

    async initAudio() {
        if (this.audioContext) return;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // 創建立體聲合併器
        this.merger = this.audioContext.createChannelMerger(2);

        // 左耳振盪器
        this.leftOsc = this.audioContext.createOscillator();
        this.leftOsc.type = 'sine';
        this.leftGain = this.audioContext.createGain();
        this.leftGain.gain.value = this.volume;

        // 右耳振盪器
        this.rightOsc = this.audioContext.createOscillator();
        this.rightOsc.type = 'sine';
        this.rightGain = this.audioContext.createGain();
        this.rightGain.gain.value = this.volume;

        // 連接（立體聲分離）
        this.leftOsc.connect(this.leftGain);
        this.leftGain.connect(this.merger, 0, 0);  // 左聲道

        this.rightOsc.connect(this.rightGain);
        this.rightGain.connect(this.merger, 0, 1); // 右聲道

        this.merger.connect(this.audioContext.destination);

        this.updateFrequencies();
    }

    setupControls() {
        // 播放按鈕
        const playBtn = document.getElementById('playBtn');
        playBtn.addEventListener('click', () => this.togglePlay());

        // 預設模式
        const presetSelect = document.getElementById('preset');
        presetSelect.addEventListener('change', (e) => {
            const preset = this.presets[e.target.value];
            this.beatFreq = preset.beatFreq;
            document.getElementById('beatFreq').value = this.beatFreq;
            document.getElementById('beatFreqValue').textContent = this.beatFreq;
            this.updateFrequencies();
            this.updateFrequencyDisplay();
        });

        // 基礎頻率
        const baseFreqSlider = document.getElementById('baseFreq');
        baseFreqSlider.addEventListener('input', (e) => {
            this.baseFreq = parseInt(e.target.value);
            document.getElementById('baseFreqValue').textContent = this.baseFreq;
            this.updateFrequencies();
            this.updateFrequencyDisplay();
        });

        // 節拍頻率
        const beatFreqSlider = document.getElementById('beatFreq');
        beatFreqSlider.addEventListener('input', (e) => {
            this.beatFreq = parseInt(e.target.value);
            document.getElementById('beatFreqValue').textContent = this.beatFreq;
            this.updateFrequencies();
            this.updateFrequencyDisplay();
        });

        // 音量
        const volumeSlider = document.getElementById('volume');
        const volumeValue = document.getElementById('volumeValue');
        volumeSlider.addEventListener('input', (e) => {
            this.volume = parseInt(e.target.value) / 100;
            volumeValue.textContent = e.target.value;
            if (this.leftGain && this.rightGain) {
                this.leftGain.gain.setTargetAtTime(this.volume, this.audioContext.currentTime, 0.01);
                this.rightGain.gain.setTargetAtTime(this.volume, this.audioContext.currentTime, 0.01);
            }
        });
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePlay();
            }
        });
    }

    updateFrequencies() {
        if (!this.leftOsc || !this.rightOsc) return;

        const leftFreq = this.baseFreq - this.beatFreq / 2;
        const rightFreq = this.baseFreq + this.beatFreq / 2;

        this.leftOsc.frequency.setTargetAtTime(leftFreq, this.audioContext.currentTime, 0.01);
        this.rightOsc.frequency.setTargetAtTime(rightFreq, this.audioContext.currentTime, 0.01);
    }

    updateFrequencyDisplay() {
        const leftFreq = this.baseFreq - this.beatFreq / 2;
        const rightFreq = this.baseFreq + this.beatFreq / 2;

        document.getElementById('leftFreq').textContent = leftFreq.toFixed(1);
        document.getElementById('rightFreq').textContent = rightFreq.toFixed(1);
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

        // 如果振盪器已停止，需要重新創建
        if (this.leftOsc.context.state === 'running') {
            try {
                this.leftOsc.start();
                this.rightOsc.start();
            } catch (e) {
                // 振盪器已啟動，重新創建
                this.audioContext = null;
                await this.initAudio();
                this.leftOsc.start();
                this.rightOsc.start();
            }
        }

        this.isPlaying = true;

        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = '停止';
        playBtn.classList.add('playing');
        document.getElementById('statusDisplay').textContent = '播放中';
    }

    stop() {
        if (this.leftOsc) {
            this.leftOsc.stop();
            this.leftOsc = null;
        }
        if (this.rightOsc) {
            this.rightOsc.stop();
            this.rightOsc = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        this.isPlaying = false;

        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = '開始';
        playBtn.classList.remove('playing');
        document.getElementById('statusDisplay').textContent = '停止';
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawBackground();
        this.drawBrainWaves();
        this.drawParticles();
        this.updateParticles();

        if (this.isPlaying) {
            this.phase += this.beatFreq * 0.01;
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawBackground() {
        const ctx = this.ctx;

        // 漸層背景
        const gradient = ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2,
            Math.max(this.canvas.width, this.canvas.height) * 0.6
        );

        if (this.isPlaying) {
            const pulse = Math.sin(this.phase) * 0.1 + 0.9;
            gradient.addColorStop(0, `rgba(30, 20, 50, ${pulse})`);
            gradient.addColorStop(0.5, 'rgba(15, 10, 25, 1)');
            gradient.addColorStop(1, 'rgba(8, 8, 15, 1)');
        } else {
            gradient.addColorStop(0, '#1e1432');
            gradient.addColorStop(0.5, '#0f0a19');
            gradient.addColorStop(1, '#08080f');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBrainWaves() {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // 左耳波形
        this.drawWave(centerX - 150, centerY, 'left');

        // 右耳波形
        this.drawWave(centerX + 150, centerY, 'right');

        // 中央節拍指示
        this.drawBeatIndicator(centerX, centerY);
    }

    drawWave(x, y, side) {
        const ctx = this.ctx;
        const radius = 80;
        const waves = 3;

        for (let w = 0; w < waves; w++) {
            const waveRadius = radius + w * 30;
            const alpha = (1 - w / waves) * (this.isPlaying ? 0.6 : 0.2);

            ctx.beginPath();

            for (let i = 0; i <= 360; i += 5) {
                const angle = (i * Math.PI) / 180;
                const freq = side === 'left'
                    ? this.baseFreq - this.beatFreq / 2
                    : this.baseFreq + this.beatFreq / 2;

                const waveOffset = this.isPlaying
                    ? Math.sin(angle * 8 + this.phase * (side === 'left' ? 1 : 1.1)) * 10
                    : 0;

                const r = waveRadius + waveOffset;
                const px = x + Math.cos(angle) * r;
                const py = y + Math.sin(angle) * r;

                if (i === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }

            ctx.closePath();
            ctx.strokeStyle = side === 'left'
                ? `rgba(100, 150, 255, ${alpha})`
                : `rgba(255, 150, 100, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // 標籤
        ctx.fillStyle = side === 'left' ? '#6496ff' : '#ff9664';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(side === 'left' ? '左耳' : '右耳', x, y + radius + 60);

        const freq = side === 'left'
            ? this.baseFreq - this.beatFreq / 2
            : this.baseFreq + this.beatFreq / 2;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillText(`${freq.toFixed(1)} Hz`, x, y + radius + 80);
    }

    drawBeatIndicator(x, y) {
        const ctx = this.ctx;

        // 節拍脈動
        const pulse = this.isPlaying ? Math.sin(this.phase) * 0.5 + 0.5 : 0;
        const size = 40 + pulse * 20;

        // 光暈
        if (this.isPlaying) {
            ctx.save();
            ctx.shadowBlur = 30 + pulse * 20;
            ctx.shadowColor = 'rgba(180, 100, 255, 0.8)';

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
            gradient.addColorStop(0, `rgba(200, 150, 255, ${0.5 + pulse * 0.5})`);
            gradient.addColorStop(0.5, `rgba(150, 100, 255, ${0.3 + pulse * 0.3})`);
            gradient.addColorStop(1, 'rgba(100, 50, 200, 0)');

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            ctx.restore();
        }

        // 中心圓
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fillStyle = this.isPlaying
            ? `rgba(180, 100, 255, ${0.5 + pulse * 0.5})`
            : 'rgba(100, 50, 150, 0.3)';
        ctx.fill();

        // 節拍頻率
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${this.beatFreq}`, x, y - 5);
        ctx.font = '10px Arial';
        ctx.fillText('Hz', x, y + 10);

        // 連接線
        ctx.strokeStyle = 'rgba(180, 100, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);

        ctx.beginPath();
        ctx.moveTo(x - 150, y);
        ctx.lineTo(x - 50, y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + 50, y);
        ctx.lineTo(x + 150, y);
        ctx.stroke();

        ctx.setLineDash([]);
    }

    drawParticles() {
        const ctx = this.ctx;

        for (const p of this.particles) {
            const alpha = this.isPlaying ? 0.3 + Math.sin(this.phase + p.angle) * 0.2 : 0.1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(180, 100, 255, ${alpha})`;
            ctx.fill();
        }
    }

    updateParticles() {
        for (const p of this.particles) {
            if (this.isPlaying) {
                p.x += Math.cos(p.angle) * p.speed;
                p.y += Math.sin(p.angle) * p.speed;
                p.angle += 0.01;
            }

            // 邊界處理
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
    }
}

// 啟動應用
document.addEventListener('DOMContentLoaded', () => {
    new BinauralBeatsApp();
});
