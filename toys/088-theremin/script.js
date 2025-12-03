/**
 * Theremin 特雷門琴 - Web Toys #088
 * 模擬經典特雷門電子琴的空靈音色
 */

class ThereminApp {
    constructor() {
        this.canvas = document.getElementById('thereminCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 音頻上下文
        this.audioContext = null;
        this.oscillator = null;
        this.gainNode = null;
        this.vibratoOsc = null;
        this.vibratoGain = null;
        this.filterNode = null;

        // 狀態
        this.isPlaying = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetFreq = 440;
        this.currentFreq = 440;
        this.targetVolume = 0;
        this.currentVolume = 0;

        // 設定
        this.waveform = 'sine';
        this.vibratoAmount = 0.4;
        this.portamentoAmount = 0.5;
        this.masterVolume = 0.5;

        // 頻率範圍
        this.minFreq = 65;   // C2
        this.maxFreq = 2093; // C7

        // 視覺效果
        this.animationId = null;
        this.trails = [];
        this.waveformData = new Array(128).fill(0);
        this.analyser = null;

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

        // 主振盪器
        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.type = this.waveform;
        this.oscillator.frequency.value = 440;

        // 顫音振盪器
        this.vibratoOsc = this.audioContext.createOscillator();
        this.vibratoOsc.type = 'sine';
        this.vibratoOsc.frequency.value = 5;

        this.vibratoGain = this.audioContext.createGain();
        this.vibratoGain.gain.value = 0;

        // 濾波器
        this.filterNode = this.audioContext.createBiquadFilter();
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.value = 3000;
        this.filterNode.Q.value = 1;

        // 增益節點
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 0;

        // 分析器
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;

        // 連接
        this.vibratoOsc.connect(this.vibratoGain);
        this.vibratoGain.connect(this.oscillator.frequency);

        this.oscillator.connect(this.filterNode);
        this.filterNode.connect(this.gainNode);
        this.gainNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        // 啟動振盪器
        this.oscillator.start();
        this.vibratoOsc.start();
    }

    setupControls() {
        // 波形
        const waveformSelect = document.getElementById('waveform');
        waveformSelect.addEventListener('change', (e) => {
            this.waveform = e.target.value;
            if (this.oscillator) {
                this.oscillator.type = this.waveform;
            }
        });

        // 顫音
        const vibratoSlider = document.getElementById('vibrato');
        const vibratoValue = document.getElementById('vibratoValue');
        vibratoSlider.addEventListener('input', (e) => {
            this.vibratoAmount = parseInt(e.target.value) / 100;
            vibratoValue.textContent = this.getAmountLabel(this.vibratoAmount);
        });

        // 滑音
        const portamentoSlider = document.getElementById('portamento');
        const portamentoValue = document.getElementById('portamentoValue');
        portamentoSlider.addEventListener('input', (e) => {
            this.portamentoAmount = parseInt(e.target.value) / 100;
            portamentoValue.textContent = this.getAmountLabel(this.portamentoAmount);
        });

        // 音量
        const volumeSlider = document.getElementById('volume');
        const volumeValue = document.getElementById('volumeValue');
        volumeSlider.addEventListener('input', (e) => {
            this.masterVolume = parseInt(e.target.value) / 100;
            volumeValue.textContent = e.target.value;
        });
    }

    getAmountLabel(amount) {
        if (amount < 0.33) return '少';
        if (amount < 0.66) return '中等';
        return '強';
    }

    setupEventListeners() {
        // 滑鼠事件
        this.canvas.addEventListener('mouseenter', async (e) => {
            await this.initAudio();
            this.isPlaying = true;
            this.updatePosition(e);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            this.updatePosition(e);
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isPlaying = false;
        });

        // 觸控事件
        this.canvas.addEventListener('touchstart', async (e) => {
            e.preventDefault();
            await this.initAudio();
            this.isPlaying = true;
            this.updatePosition(e.touches[0]);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.updatePosition(e.touches[0]);
        });

        this.canvas.addEventListener('touchend', () => {
            this.isPlaying = false;
        });
    }

    updatePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;

        // 計算目標頻率 (X軸控制)
        const xRatio = this.mouseX / this.canvas.width;
        this.targetFreq = this.minFreq * Math.pow(this.maxFreq / this.minFreq, xRatio);

        // 計算目標音量 (Y軸控制 - 上方音量大)
        const yRatio = 1 - (this.mouseY / this.canvas.height);
        this.targetVolume = Math.max(0, Math.min(1, yRatio));

        // 添加軌跡點
        this.trails.push({
            x: this.mouseX,
            y: this.mouseY,
            freq: this.targetFreq,
            vol: this.targetVolume,
            alpha: 1,
            size: 8 + this.targetVolume * 12
        });

        // 限制軌跡數量
        if (this.trails.length > 50) {
            this.trails.shift();
        }
    }

    updateAudio() {
        if (!this.audioContext || !this.isPlaying) {
            if (this.gainNode) {
                this.currentVolume *= 0.9;
                this.gainNode.gain.setTargetAtTime(
                    this.currentVolume * this.masterVolume,
                    this.audioContext.currentTime,
                    0.05
                );
            }
            return;
        }

        // 滑音效果
        const portamentoSpeed = 0.02 + (1 - this.portamentoAmount) * 0.18;
        this.currentFreq += (this.targetFreq - this.currentFreq) * portamentoSpeed;
        this.currentVolume += (this.targetVolume - this.currentVolume) * 0.1;

        // 更新振盪器頻率
        this.oscillator.frequency.setTargetAtTime(
            this.currentFreq,
            this.audioContext.currentTime,
            0.01
        );

        // 更新顫音
        const vibratoDepth = this.currentFreq * 0.02 * this.vibratoAmount;
        this.vibratoGain.gain.setTargetAtTime(
            vibratoDepth,
            this.audioContext.currentTime,
            0.1
        );

        // 更新音量
        this.gainNode.gain.setTargetAtTime(
            this.currentVolume * this.masterVolume * 0.3,
            this.audioContext.currentTime,
            0.05
        );

        // 更新濾波器 (音量大時更亮)
        const filterFreq = 1000 + this.currentVolume * 4000;
        this.filterNode.frequency.setTargetAtTime(
            filterFreq,
            this.audioContext.currentTime,
            0.1
        );

        // 更新顯示
        document.getElementById('freqDisplay').textContent = Math.round(this.currentFreq);
        document.getElementById('levelDisplay').textContent = Math.round(this.currentVolume * 100);
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.updateAudio();
        this.drawBackground();
        this.drawGrid();
        this.drawWaveform();
        this.drawTrails();
        this.drawCursor();
        this.updateTrails();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawBackground() {
        const ctx = this.ctx;

        // 漸層背景
        const gradient = ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2,
            Math.max(this.canvas.width, this.canvas.height) * 0.7
        );
        gradient.addColorStop(0, '#15152a');
        gradient.addColorStop(0.5, '#0a0a18');
        gradient.addColorStop(1, '#050508');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid() {
        const ctx = this.ctx;

        // 頻率線（水平）
        ctx.strokeStyle = 'rgba(150, 100, 255, 0.1)';
        ctx.lineWidth = 1;

        // 音高參考線
        const notes = [130.81, 261.63, 523.25, 1046.50]; // C3, C4, C5, C6
        for (const freq of notes) {
            const x = (Math.log(freq / this.minFreq) / Math.log(this.maxFreq / this.minFreq)) * this.canvas.width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();

            // 標籤
            ctx.fillStyle = 'rgba(150, 100, 255, 0.3)';
            ctx.font = '12px Arial';
            ctx.fillText(`${Math.round(freq)}Hz`, x + 5, 20);
        }

        // 音量線（水平）
        for (let i = 0; i <= 4; i++) {
            const y = (i / 4) * this.canvas.height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
    }

    drawWaveform() {
        if (!this.analyser || !this.isPlaying) return;

        const ctx = this.ctx;
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteTimeDomainData(dataArray);

        // 波形顯示在底部
        const waveHeight = 100;
        const waveY = this.canvas.height - waveHeight - 60;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(150, 100, 255, ${0.3 + this.currentVolume * 0.5})`;
        ctx.lineWidth = 2;

        const sliceWidth = this.canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = waveY + (v - 1) * waveHeight * this.currentVolume;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        ctx.stroke();
    }

    drawTrails() {
        const ctx = this.ctx;

        for (const trail of this.trails) {
            // 光暈效果
            const gradient = ctx.createRadialGradient(
                trail.x, trail.y, 0,
                trail.x, trail.y, trail.size * 2
            );

            const hue = 260 + (trail.freq / this.maxFreq) * 60;
            gradient.addColorStop(0, `hsla(${hue}, 80%, 70%, ${trail.alpha * 0.8})`);
            gradient.addColorStop(0.5, `hsla(${hue}, 80%, 50%, ${trail.alpha * 0.3})`);
            gradient.addColorStop(1, `hsla(${hue}, 80%, 30%, 0)`);

            ctx.beginPath();
            ctx.arc(trail.x, trail.y, trail.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // 核心點
            ctx.beginPath();
            ctx.arc(trail.x, trail.y, trail.size * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${trail.alpha})`;
            ctx.fill();
        }
    }

    drawCursor() {
        if (!this.isPlaying) return;

        const ctx = this.ctx;
        const x = this.mouseX;
        const y = this.mouseY;
        const size = 15 + this.currentVolume * 25;

        // 外圈光暈
        ctx.save();
        ctx.shadowBlur = 30 + this.currentVolume * 30;
        ctx.shadowColor = 'rgba(150, 100, 255, 0.8)';

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, `rgba(200, 150, 255, ${0.8 + this.currentVolume * 0.2})`);
        gradient.addColorStop(0.5, `rgba(150, 100, 255, ${0.4 + this.currentVolume * 0.3})`);
        gradient.addColorStop(1, 'rgba(100, 50, 200, 0)');

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // 十字準心
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + this.currentVolume * 0.5})`;
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(x - size * 1.5, y);
        ctx.lineTo(x - size * 0.5, y);
        ctx.moveTo(x + size * 0.5, y);
        ctx.lineTo(x + size * 1.5, y);
        ctx.moveTo(x, y - size * 1.5);
        ctx.lineTo(x, y - size * 0.5);
        ctx.moveTo(x, y + size * 0.5);
        ctx.lineTo(x, y + size * 1.5);
        ctx.stroke();

        // 中心點
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        ctx.restore();

        // 頻率/音量指示線
        ctx.strokeStyle = 'rgba(150, 100, 255, 0.3)';
        ctx.setLineDash([5, 5]);

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.canvas.width, y);
        ctx.stroke();

        ctx.setLineDash([]);
    }

    updateTrails() {
        for (let i = this.trails.length - 1; i >= 0; i--) {
            this.trails[i].alpha -= 0.03;
            this.trails[i].size *= 0.98;

            if (this.trails[i].alpha <= 0) {
                this.trails.splice(i, 1);
            }
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.oscillator) {
            this.oscillator.stop();
        }
        if (this.vibratoOsc) {
            this.vibratoOsc.stop();
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// 啟動應用
document.addEventListener('DOMContentLoaded', () => {
    new ThereminApp();
});
