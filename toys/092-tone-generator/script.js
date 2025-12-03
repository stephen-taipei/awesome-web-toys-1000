/**
 * Tone Generator 音調產生器 - Web Toys #092
 * 可調頻率的純音產生器
 */

class ToneGeneratorApp {
    constructor() {
        this.canvas = document.getElementById('toneCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 音頻上下文
        this.audioContext = null;
        this.oscillator = null;
        this.gainNode = null;
        this.analyser = null;

        // 狀態
        this.isPlaying = false;
        this.frequency = 440;
        this.waveform = 'sine';
        this.volume = 0.3;

        // 視覺效果
        this.animationId = null;
        this.waveformData = new Uint8Array(256);
        this.frequencyData = new Uint8Array(128);

        this.init();
    }

    async init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.setupControls();
        this.setupEventListeners();
        this.updateNoteDisplay();
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    async initAudio() {
        if (this.audioContext) return;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // 分析器
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 512;

        // 增益節點
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = this.volume;

        this.gainNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
    }

    setupControls() {
        // 播放按鈕
        const playBtn = document.getElementById('playBtn');
        playBtn.addEventListener('click', () => this.togglePlay());

        // 頻率
        const freqSlider = document.getElementById('frequency');
        freqSlider.addEventListener('input', (e) => {
            this.frequency = parseFloat(e.target.value);
            document.getElementById('freqDisplay').textContent = Math.round(this.frequency);
            this.updateNoteDisplay();
            if (this.oscillator) {
                this.oscillator.frequency.setTargetAtTime(this.frequency, this.audioContext.currentTime, 0.01);
            }
        });

        // 波形
        const waveformSelect = document.getElementById('waveform');
        waveformSelect.addEventListener('change', (e) => {
            this.waveform = e.target.value;
            this.updateWaveDisplay();
            if (this.oscillator) {
                this.oscillator.type = this.waveform;
            }
        });

        // 預設頻率
        const presetSelect = document.getElementById('preset');
        presetSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                this.frequency = parseFloat(e.target.value);
                document.getElementById('frequency').value = this.frequency;
                document.getElementById('freqDisplay').textContent = Math.round(this.frequency);
                this.updateNoteDisplay();
                if (this.oscillator) {
                    this.oscillator.frequency.setTargetAtTime(this.frequency, this.audioContext.currentTime, 0.01);
                }
            }
        });

        // 音量
        const volumeSlider = document.getElementById('volume');
        const volumeValue = document.getElementById('volumeValue');
        volumeSlider.addEventListener('input', (e) => {
            this.volume = parseInt(e.target.value) / 100;
            volumeValue.textContent = e.target.value;
            if (this.gainNode) {
                this.gainNode.gain.setTargetAtTime(this.volume, this.audioContext.currentTime, 0.01);
            }
        });
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePlay();
            } else if (e.code === 'ArrowUp') {
                this.frequency = Math.min(2000, this.frequency + 10);
                this.updateFrequency();
            } else if (e.code === 'ArrowDown') {
                this.frequency = Math.max(20, this.frequency - 10);
                this.updateFrequency();
            } else if (e.code === 'ArrowRight') {
                this.frequency = Math.min(2000, this.frequency + 1);
                this.updateFrequency();
            } else if (e.code === 'ArrowLeft') {
                this.frequency = Math.max(20, this.frequency - 1);
                this.updateFrequency();
            }
        });
    }

    updateFrequency() {
        document.getElementById('frequency').value = this.frequency;
        document.getElementById('freqDisplay').textContent = Math.round(this.frequency);
        this.updateNoteDisplay();
        if (this.oscillator) {
            this.oscillator.frequency.setTargetAtTime(this.frequency, this.audioContext.currentTime, 0.01);
        }
    }

    updateWaveDisplay() {
        const labels = {
            sine: '正弦波',
            triangle: '三角波',
            sawtooth: '鋸齒波',
            square: '方波'
        };
        document.getElementById('waveDisplay').textContent = labels[this.waveform];
    }

    updateNoteDisplay() {
        const note = this.freqToNote(this.frequency);
        document.getElementById('noteDisplay').textContent = note;
    }

    freqToNote(freq) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const midi = 69 + 12 * Math.log2(freq / 440);
        const midiRounded = Math.round(midi);
        const note = notes[midiRounded % 12];
        const octave = Math.floor(midiRounded / 12) - 1;
        const cents = Math.round((midi - midiRounded) * 100);
        const centsStr = cents >= 0 ? `+${cents}` : cents.toString();
        return `${note}${octave} (${centsStr}¢)`;
    }

    async togglePlay() {
        await this.initAudio();

        if (this.isPlaying) {
            this.stop();
        } else {
            this.start();
        }
    }

    start() {
        // 創建振盪器
        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.type = this.waveform;
        this.oscillator.frequency.value = this.frequency;

        this.oscillator.connect(this.gainNode);
        this.oscillator.start();

        this.isPlaying = true;

        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = '停止';
        playBtn.classList.add('playing');
        document.getElementById('statusDisplay').textContent = '播放中';
    }

    stop() {
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator.disconnect();
            this.oscillator = null;
        }

        this.isPlaying = false;

        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = '播放';
        playBtn.classList.remove('playing');
        document.getElementById('statusDisplay').textContent = '停止';
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawBackground();
        this.drawWaveform();
        this.drawFrequencySpectrum();
        this.drawFrequencyIndicator();

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
        gradient.addColorStop(0, '#101820');
        gradient.addColorStop(0.5, '#080c12');
        gradient.addColorStop(1, '#040608');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 格線
        ctx.strokeStyle = 'rgba(100, 255, 150, 0.05)';
        ctx.lineWidth = 1;

        for (let x = 0; x < this.canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }

        for (let y = 0; y < this.canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
    }

    drawWaveform() {
        if (!this.analyser) return;

        const ctx = this.ctx;
        this.analyser.getByteTimeDomainData(this.waveformData);

        const waveHeight = 120;
        const waveY = this.canvas.height / 2 - 50;
        const waveWidth = Math.min(this.canvas.width * 0.7, 800);
        const startX = (this.canvas.width - waveWidth) / 2;

        // 波形背景
        ctx.fillStyle = 'rgba(100, 255, 150, 0.03)';
        ctx.fillRect(startX - 20, waveY - waveHeight - 30, waveWidth + 40, waveHeight * 2 + 60);

        ctx.strokeStyle = 'rgba(100, 255, 150, 0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(startX - 20, waveY - waveHeight - 30, waveWidth + 40, waveHeight * 2 + 60);

        // 中心線
        ctx.beginPath();
        ctx.moveTo(startX, waveY);
        ctx.lineTo(startX + waveWidth, waveY);
        ctx.strokeStyle = 'rgba(100, 255, 150, 0.2)';
        ctx.stroke();

        // 標籤
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('波形顯示', startX + waveWidth / 2, waveY - waveHeight - 40);

        if (!this.isPlaying) {
            ctx.fillStyle = 'rgba(100, 255, 150, 0.3)';
            ctx.font = '16px Arial';
            ctx.fillText('點擊播放開始', startX + waveWidth / 2, waveY);
            return;
        }

        // 波形
        ctx.beginPath();
        const sliceWidth = waveWidth / this.waveformData.length;
        let x = startX;

        for (let i = 0; i < this.waveformData.length; i++) {
            const v = this.waveformData[i] / 128.0;
            const y = waveY + (v - 1) * waveHeight;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        ctx.strokeStyle = '#64ff96';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 發光效果
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#64ff96';
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    drawFrequencySpectrum() {
        if (!this.analyser || !this.isPlaying) return;

        const ctx = this.ctx;
        this.analyser.getByteFrequencyData(this.frequencyData);

        const specWidth = Math.min(this.canvas.width * 0.7, 800);
        const specHeight = 100;
        const startX = (this.canvas.width - specWidth) / 2;
        const startY = this.canvas.height / 2 + 100;

        // 背景
        ctx.fillStyle = 'rgba(100, 255, 150, 0.03)';
        ctx.fillRect(startX - 20, startY - 10, specWidth + 40, specHeight + 40);

        ctx.strokeStyle = 'rgba(100, 255, 150, 0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(startX - 20, startY - 10, specWidth + 40, specHeight + 40);

        // 標籤
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('頻譜分析', startX + specWidth / 2, startY + specHeight + 25);

        // 頻譜條
        const barWidth = specWidth / this.frequencyData.length;

        for (let i = 0; i < this.frequencyData.length; i++) {
            const barHeight = (this.frequencyData[i] / 255) * specHeight;
            const x = startX + i * barWidth;
            const y = startY + specHeight - barHeight;

            // 漸層顏色
            const hue = 120 + (i / this.frequencyData.length) * 60;
            ctx.fillStyle = `hsla(${hue}, 100%, 60%, 0.8)`;
            ctx.fillRect(x, y, barWidth - 1, barHeight);
        }
    }

    drawFrequencyIndicator() {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const y = 120;

        // 頻率刻度
        const scaleWidth = Math.min(this.canvas.width * 0.6, 600);
        const startX = centerX - scaleWidth / 2;

        // 對數刻度
        const minLog = Math.log10(20);
        const maxLog = Math.log10(2000);

        // 刻度線
        const freqs = [20, 50, 100, 200, 500, 1000, 2000];
        ctx.strokeStyle = 'rgba(100, 255, 150, 0.3)';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';

        for (const f of freqs) {
            const logPos = (Math.log10(f) - minLog) / (maxLog - minLog);
            const x = startX + logPos * scaleWidth;

            ctx.beginPath();
            ctx.moveTo(x, y - 10);
            ctx.lineTo(x, y + 10);
            ctx.stroke();

            ctx.fillText(f >= 1000 ? `${f / 1000}k` : f.toString(), x, y + 25);
        }

        // 刻度軸
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + scaleWidth, y);
        ctx.strokeStyle = 'rgba(100, 255, 150, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 當前頻率指示器
        const currentLogPos = (Math.log10(this.frequency) - minLog) / (maxLog - minLog);
        const indicatorX = startX + currentLogPos * scaleWidth;

        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#64ff96';

        ctx.beginPath();
        ctx.moveTo(indicatorX, y - 20);
        ctx.lineTo(indicatorX - 8, y - 35);
        ctx.lineTo(indicatorX + 8, y - 35);
        ctx.closePath();
        ctx.fillStyle = '#64ff96';
        ctx.fill();

        ctx.restore();

        // 頻率標籤
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`${Math.round(this.frequency)} Hz`, indicatorX, y - 45);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.oscillator) {
            this.oscillator.stop();
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// 啟動應用
document.addEventListener('DOMContentLoaded', () => {
    new ToneGeneratorApp();
});
