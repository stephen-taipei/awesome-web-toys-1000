/**
 * Metronome 節拍器 - Web Toys #091
 * 精準的視覺化節拍器
 */

class MetronomeApp {
    constructor() {
        this.canvas = document.getElementById('metronomeCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 音頻上下文
        this.audioContext = null;
        this.masterGain = null;

        // 狀態
        this.isPlaying = false;
        this.tempo = 120;
        this.beatsPerMeasure = 4;
        this.currentBeat = 0;
        this.soundType = 'click';
        this.volume = 0.5;

        // 定時器
        this.nextBeatTime = 0;
        this.schedulerId = null;
        this.lookAhead = 0.1;
        this.scheduleInterval = 25;

        // 視覺效果
        this.animationId = null;
        this.pendulumAngle = 0;
        this.pendulumDirection = 1;
        this.beatFlash = 0;
        this.beatIndicators = [];

        this.init();
    }

    async init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.setupControls();
        this.setupEventListeners();
        this.updateBeatIndicators();
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

    setupControls() {
        // 播放按鈕
        const playBtn = document.getElementById('playBtn');
        playBtn.addEventListener('click', () => this.togglePlay());

        // 速度
        const tempoSlider = document.getElementById('tempo');
        tempoSlider.addEventListener('input', (e) => {
            this.tempo = parseInt(e.target.value);
            document.getElementById('tempoDisplay').textContent = this.tempo;
        });

        // 拍號
        const timeSignature = document.getElementById('timeSignature');
        timeSignature.addEventListener('change', (e) => {
            this.beatsPerMeasure = parseInt(e.target.value);
            this.currentBeat = 0;
            this.updateBeatIndicators();
            document.getElementById('totalBeats').textContent = this.beatsPerMeasure;
        });

        // 音色
        const soundSelect = document.getElementById('sound');
        soundSelect.addEventListener('change', (e) => {
            this.soundType = e.target.value;
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
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePlay();
            } else if (e.code === 'ArrowUp') {
                this.tempo = Math.min(240, this.tempo + 5);
                document.getElementById('tempo').value = this.tempo;
                document.getElementById('tempoDisplay').textContent = this.tempo;
            } else if (e.code === 'ArrowDown') {
                this.tempo = Math.max(30, this.tempo - 5);
                document.getElementById('tempo').value = this.tempo;
                document.getElementById('tempoDisplay').textContent = this.tempo;
            }
        });
    }

    updateBeatIndicators() {
        this.beatIndicators = [];
        for (let i = 0; i < this.beatsPerMeasure; i++) {
            this.beatIndicators.push({
                index: i,
                flash: 0
            });
        }
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
            this.currentBeat = 0;
            this.nextBeatTime = this.audioContext.currentTime;
            this.schedule();
        } else {
            playBtn.textContent = '開始';
            playBtn.classList.remove('playing');
            statusDisplay.textContent = '停止';
            if (this.schedulerId) {
                clearTimeout(this.schedulerId);
            }
        }
    }

    schedule() {
        if (!this.isPlaying) return;

        while (this.nextBeatTime < this.audioContext.currentTime + this.lookAhead) {
            this.scheduleBeat(this.currentBeat, this.nextBeatTime);

            const secondsPerBeat = 60 / this.tempo;
            this.nextBeatTime += secondsPerBeat;

            this.currentBeat = (this.currentBeat + 1) % this.beatsPerMeasure;
        }

        this.schedulerId = setTimeout(() => this.schedule(), this.scheduleInterval);
    }

    scheduleBeat(beat, time) {
        const isAccent = beat === 0;

        switch (this.soundType) {
            case 'click':
                this.playClick(time, isAccent);
                break;
            case 'wood':
                this.playWood(time, isAccent);
                break;
            case 'beep':
                this.playBeep(time, isAccent);
                break;
            case 'drum':
                this.playDrum(time, isAccent);
                break;
        }

        // 視覺效果同步
        const delay = (time - this.audioContext.currentTime) * 1000;
        setTimeout(() => {
            this.beatFlash = 1;
            this.pendulumDirection *= -1;
            this.beatIndicators[beat].flash = 1;
            document.getElementById('beatDisplay').textContent = beat + 1;
        }, Math.max(0, delay));
    }

    playClick(time, isAccent) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.value = isAccent ? 1000 : 800;

        gain.gain.setValueAtTime(isAccent ? 0.8 : 0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + 0.06);
    }

    playWood(time, isAccent) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.value = isAccent ? 1200 : 900;

        filter.type = 'bandpass';
        filter.frequency.value = isAccent ? 1500 : 1200;
        filter.Q.value = 5;

        gain.gain.setValueAtTime(isAccent ? 0.7 : 0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + 0.1);
    }

    playBeep(time, isAccent) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'square';
        osc.frequency.value = isAccent ? 880 : 660;

        gain.gain.setValueAtTime(isAccent ? 0.4 : 0.25, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + 0.12);
    }

    playDrum(time, isAccent) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(isAccent ? 200 : 150, time);
        osc.frequency.exponentialRampToValueAtTime(isAccent ? 80 : 60, time + 0.1);

        gain.gain.setValueAtTime(isAccent ? 0.8 : 0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + 0.25);
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawBackground();
        this.drawPendulum();
        this.drawBeatIndicators();
        this.updateEffects();

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
        gradient.addColorStop(0, '#1a1410');
        gradient.addColorStop(0.5, '#0f0a08');
        gradient.addColorStop(1, '#080504');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 節拍閃爍效果
        if (this.beatFlash > 0.01) {
            ctx.fillStyle = `rgba(255, 150, 50, ${this.beatFlash * 0.1})`;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    drawPendulum() {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const pivotY = 100;
        const pendulumLength = Math.min(this.canvas.height * 0.45, 350);

        // 計算擺動
        if (this.isPlaying) {
            const swingSpeed = (this.tempo / 60) * Math.PI;
            this.pendulumAngle += this.pendulumDirection * swingSpeed * 0.016;

            // 限制角度
            const maxAngle = Math.PI / 6;
            if (Math.abs(this.pendulumAngle) > maxAngle) {
                this.pendulumAngle = this.pendulumDirection * maxAngle;
            }
        } else {
            this.pendulumAngle *= 0.95;
        }

        const bobX = centerX + Math.sin(this.pendulumAngle) * pendulumLength;
        const bobY = pivotY + Math.cos(this.pendulumAngle) * pendulumLength;

        // 支架
        ctx.fillStyle = '#3a2a1a';
        ctx.beginPath();
        ctx.moveTo(centerX - 60, pivotY - 30);
        ctx.lineTo(centerX + 60, pivotY - 30);
        ctx.lineTo(centerX + 40, pivotY + 10);
        ctx.lineTo(centerX - 40, pivotY + 10);
        ctx.closePath();
        ctx.fill();

        // 軌跡弧線
        ctx.beginPath();
        ctx.arc(centerX, pivotY, pendulumLength + 30, Math.PI / 2 - Math.PI / 6, Math.PI / 2 + Math.PI / 6);
        ctx.strokeStyle = 'rgba(255, 150, 50, 0.1)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 刻度
        for (let i = -5; i <= 5; i++) {
            const angle = Math.PI / 2 + (i / 5) * (Math.PI / 6);
            const innerR = pendulumLength + 20;
            const outerR = pendulumLength + (i === 0 ? 40 : 30);

            ctx.beginPath();
            ctx.moveTo(centerX + Math.cos(angle) * innerR, pivotY + Math.sin(angle) * innerR);
            ctx.lineTo(centerX + Math.cos(angle) * outerR, pivotY + Math.sin(angle) * outerR);
            ctx.strokeStyle = i === 0 ? 'rgba(255, 150, 50, 0.5)' : 'rgba(255, 150, 50, 0.2)';
            ctx.lineWidth = i === 0 ? 2 : 1;
            ctx.stroke();
        }

        // 擺桿
        ctx.beginPath();
        ctx.moveTo(centerX, pivotY);
        ctx.lineTo(bobX, bobY);
        ctx.strokeStyle = '#8a6a4a';
        ctx.lineWidth = 4;
        ctx.stroke();

        // 擺錘
        const bobRadius = 25 + this.beatFlash * 10;

        ctx.save();
        ctx.shadowBlur = 20 + this.beatFlash * 30;
        ctx.shadowColor = 'rgba(255, 150, 50, 0.8)';

        const bobGrad = ctx.createRadialGradient(bobX - 8, bobY - 8, 0, bobX, bobY, bobRadius);
        bobGrad.addColorStop(0, '#ffb060');
        bobGrad.addColorStop(0.5, '#c08040');
        bobGrad.addColorStop(1, '#805020');

        ctx.beginPath();
        ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
        ctx.fillStyle = bobGrad;
        ctx.fill();

        ctx.restore();

        // 擺錘高光
        ctx.beginPath();
        ctx.arc(bobX - 8, bobY - 8, bobRadius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();

        // 樞軸點
        ctx.beginPath();
        ctx.arc(centerX, pivotY, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#5a4a3a';
        ctx.fill();
    }

    drawBeatIndicators() {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const y = this.canvas.height - 150;
        const spacing = 60;
        const startX = centerX - (this.beatsPerMeasure - 1) * spacing / 2;

        for (let i = 0; i < this.beatIndicators.length; i++) {
            const indicator = this.beatIndicators[i];
            const x = startX + i * spacing;
            const isAccent = i === 0;
            const radius = isAccent ? 20 : 15;

            // 發光效果
            if (indicator.flash > 0.01) {
                ctx.save();
                ctx.shadowBlur = 30 * indicator.flash;
                ctx.shadowColor = isAccent ? '#ff9632' : '#ffb860';

                ctx.beginPath();
                ctx.arc(x, y, radius + 10 * indicator.flash, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 150, 50, ${indicator.flash * 0.5})`;
                ctx.fill();

                ctx.restore();
            }

            // 指示器
            const grad = ctx.createRadialGradient(x - 5, y - 5, 0, x, y, radius);

            if (indicator.flash > 0.01) {
                grad.addColorStop(0, '#ffe0a0');
                grad.addColorStop(0.5, '#ffb060');
                grad.addColorStop(1, '#c08040');
            } else {
                grad.addColorStop(0, '#5a4a3a');
                grad.addColorStop(0.5, '#3a2a1a');
                grad.addColorStop(1, '#2a1a0a');
            }

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();

            // 邊框
            ctx.strokeStyle = isAccent ? '#ff9632' : '#8a6a4a';
            ctx.lineWidth = 2;
            ctx.stroke();

            // 數字
            ctx.fillStyle = indicator.flash > 0.01 ? '#fff' : 'rgba(255, 255, 255, 0.5)';
            ctx.font = `${isAccent ? 16 : 14}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText((i + 1).toString(), x, y);
        }
    }

    updateEffects() {
        // 更新閃爍效果
        this.beatFlash *= 0.9;

        for (const indicator of this.beatIndicators) {
            indicator.flash *= 0.9;
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
    new MetronomeApp();
});
