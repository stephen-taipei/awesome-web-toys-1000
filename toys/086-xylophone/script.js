/**
 * Xylophone 木琴 - Web Toys #086
 * 模擬木琴的清脆音色
 */

class XylophoneApp {
    constructor() {
        this.canvas = document.getElementById('xylophoneCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 音頻上下文
        this.audioContext = null;
        this.masterGain = null;
        this.convolver = null;

        // 狀態
        this.bars = [];
        this.scale = 'major';
        this.octaves = 2;
        this.reverbAmount = 0.4;
        this.volume = 0.5;

        // 音階定義
        this.scaleNotes = {
            major: [0, 2, 4, 5, 7, 9, 11],      // C D E F G A B
            minor: [0, 2, 3, 5, 7, 8, 10],      // A B C D E F G
            pentatonic: [0, 2, 4, 7, 9],         // C D E G A
            chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        };

        // 顏色對應音階
        this.barColors = [
            '#e74c3c', // C - 紅
            '#e67e22', // D - 橙
            '#f1c40f', // E - 黃
            '#2ecc71', // F - 綠
            '#3498db', // G - 藍
            '#9b59b6', // A - 紫
            '#e91e63', // B - 粉
            '#00bcd4'  // 備用
        ];

        // 鍵盤映射
        this.keyMap = {
            'KeyA': 0, 'KeyS': 1, 'KeyD': 2, 'KeyF': 3,
            'KeyG': 4, 'KeyH': 5, 'KeyJ': 6, 'KeyK': 7,
            'KeyL': 8, 'Semicolon': 9, 'Quote': 10, 'Backslash': 11
        };

        // 動畫
        this.animationId = null;
        this.activeBars = new Set();
        this.malletHits = [];

        this.init();
    }

    async init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.setupControls();
        this.setupEventListeners();
        this.generateBars();
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.generateBars();
    }

    async initAudio() {
        if (this.audioContext) return;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // 主音量
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = this.volume;

        // 殘響
        this.convolver = this.audioContext.createConvolver();
        this.wetGain = this.audioContext.createGain();
        this.dryGain = this.audioContext.createGain();

        await this.createReverb();

        this.dryGain.connect(this.masterGain);
        this.convolver.connect(this.wetGain);
        this.wetGain.connect(this.masterGain);
        this.masterGain.connect(this.audioContext.destination);

        this.updateReverbMix();
    }

    async createReverb() {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * 1.5;
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const data = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const t = i / sampleRate;
                data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 3);
            }
        }

        this.convolver.buffer = impulse;
    }

    updateReverbMix() {
        if (!this.wetGain) return;
        this.wetGain.gain.value = this.reverbAmount * 0.5;
        this.dryGain.gain.value = 1 - this.reverbAmount * 0.2;
    }

    generateBars() {
        this.bars = [];
        const notes = this.scaleNotes[this.scale];
        const totalNotes = notes.length * this.octaves;

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxWidth = Math.min(this.canvas.width * 0.85, 1000);
        const barSpacing = maxWidth / totalNotes;
        const barWidth = barSpacing * 0.7;

        // 基音 (C4 = MIDI 60 for major, A3 = MIDI 57 for minor)
        const baseNote = this.scale === 'minor' ? 57 : 60;

        for (let i = 0; i < totalNotes; i++) {
            const noteInScale = i % notes.length;
            const octave = Math.floor(i / notes.length);
            const midiNote = baseNote + notes[noteInScale] + octave * 12;

            // 長度 - 低音長，高音短
            const minHeight = 60;
            const maxHeight = 180;
            const heightRatio = 1 - (i / totalNotes);
            const height = minHeight + heightRatio * (maxHeight - minHeight);

            // 位置
            const x = centerX - maxWidth / 2 + i * barSpacing + barSpacing / 2;
            const y = centerY;

            // 顏色
            const colorIndex = noteInScale % this.barColors.length;

            this.bars.push({
                x: x,
                y: y,
                width: barWidth,
                height: height,
                note: midiNote,
                index: i,
                color: this.barColors[colorIndex],
                brightness: 0,
                vibration: 0,
                phase: 0
            });
        }
    }

    setupControls() {
        // 音階
        const scaleSelect = document.getElementById('scale');
        scaleSelect.addEventListener('change', (e) => {
            this.scale = e.target.value;
            this.generateBars();
            this.updateScaleDisplay();
        });

        // 八度
        const octavesSlider = document.getElementById('octaves');
        const octavesValue = document.getElementById('octavesValue');
        octavesSlider.addEventListener('input', (e) => {
            this.octaves = parseInt(e.target.value);
            octavesValue.textContent = this.octaves;
            this.generateBars();
        });

        // 殘響
        const reverbSlider = document.getElementById('reverb');
        const reverbValue = document.getElementById('reverbValue');
        reverbSlider.addEventListener('input', (e) => {
            this.reverbAmount = parseInt(e.target.value) / 100;
            reverbValue.textContent = this.getAmountLabel(this.reverbAmount);
            this.updateReverbMix();
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

    getAmountLabel(amount) {
        if (amount < 0.33) return '少';
        if (amount < 0.66) return '中等';
        return '豐富';
    }

    updateScaleDisplay() {
        const labels = {
            major: 'C 大調',
            minor: 'A 小調',
            pentatonic: '五聲音階',
            chromatic: '半音階'
        };
        document.getElementById('scaleDisplay').textContent = labels[this.scale];
    }

    setupEventListeners() {
        // 滑鼠/觸控
        this.canvas.addEventListener('mousedown', (e) => this.handlePointer(e));
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            for (const touch of e.touches) {
                this.handlePointer(touch);
            }
        });

        // 鍵盤
        document.addEventListener('keydown', (e) => {
            if (this.keyMap.hasOwnProperty(e.code)) {
                const index = this.keyMap[e.code];
                if (index < this.bars.length) {
                    this.playBar(this.bars[index]);
                }
            }
        });
    }

    handlePointer(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 檢查是否點擊到琴鍵
        for (const bar of this.bars) {
            if (x >= bar.x - bar.width / 2 &&
                x <= bar.x + bar.width / 2 &&
                y >= bar.y - bar.height / 2 &&
                y <= bar.y + bar.height / 2) {
                this.playBar(bar);
                break;
            }
        }
    }

    async playBar(bar) {
        await this.initAudio();

        const freq = this.midiToFreq(bar.note);
        const now = this.audioContext.currentTime;

        // 木琴音色 - 清脆明亮
        // 基音
        const osc1 = this.audioContext.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.value = freq;

        // 第二泛音（八度）
        const osc2 = this.audioContext.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = freq * 2;

        // 第四泛音（兩個八度）
        const osc3 = this.audioContext.createOscillator();
        osc3.type = 'sine';
        osc3.frequency.value = freq * 4;

        // 攻擊噪音（木質敲擊聲）
        const noiseBuffer = this.createNoiseBuffer(0.08);
        const noise = this.audioContext.createBufferSource();
        noise.buffer = noiseBuffer;

        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = freq * 3;
        noiseFilter.Q.value = 3;

        // 增益控制
        const gain1 = this.audioContext.createGain();
        const gain2 = this.audioContext.createGain();
        const gain3 = this.audioContext.createGain();
        const noiseGain = this.audioContext.createGain();

        // 基音包絡 - 快速攻擊，中等衰減
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.4, now + 0.002);
        gain1.gain.exponentialRampToValueAtTime(0.15, now + 0.08);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        // 第二泛音包絡
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.linearRampToValueAtTime(0.25, now + 0.002);
        gain2.gain.exponentialRampToValueAtTime(0.08, now + 0.06);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        // 第四泛音包絡（快速衰減）
        gain3.gain.setValueAtTime(0, now);
        gain3.gain.linearRampToValueAtTime(0.15, now + 0.001);
        gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        // 攻擊噪音包絡
        noiseGain.gain.setValueAtTime(0.12, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        // 輕微音高下滑（木質特性）
        osc1.frequency.setValueAtTime(freq * 1.02, now);
        osc1.frequency.exponentialRampToValueAtTime(freq, now + 0.02);

        // 連接
        osc1.connect(gain1);
        osc2.connect(gain2);
        osc3.connect(gain3);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);

        gain1.connect(this.dryGain);
        gain2.connect(this.dryGain);
        gain3.connect(this.dryGain);
        noiseGain.connect(this.dryGain);

        gain1.connect(this.convolver);

        // 播放
        osc1.start(now);
        osc2.start(now);
        osc3.start(now);
        noise.start(now);

        osc1.stop(now + 1.5);
        osc2.stop(now + 1);
        osc3.stop(now + 0.5);
        noise.stop(now + 0.1);

        // 視覺效果
        bar.brightness = 1;
        bar.vibration = 1;
        this.activeBars.add(bar);

        // 添加敲擊效果
        this.malletHits.push({
            x: bar.x,
            y: bar.y - bar.height / 2 - 10,
            radius: 10,
            alpha: 1
        });

        // 更新顯示
        this.updateNoteDisplay(bar.note);
    }

    createNoiseBuffer(duration) {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        return buffer;
    }

    midiToFreq(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    midiToNoteName(midi) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const note = notes[midi % 12];
        const octave = Math.floor(midi / 12) - 1;
        return note + octave;
    }

    updateNoteDisplay(note) {
        document.getElementById('noteDisplay').textContent = this.midiToNoteName(note);
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawBackground();
        this.drawFrame();
        this.drawBars();
        this.drawMalletHits();
        this.updateEffects();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawBackground() {
        const ctx = this.ctx;

        // 木質背景漸層
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#2a1f10');
        gradient.addColorStop(0.5, '#1a1208');
        gradient.addColorStop(1, '#0f0a04');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawFrame() {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        if (this.bars.length === 0) return;

        const firstBar = this.bars[0];
        const lastBar = this.bars[this.bars.length - 1];
        const frameLeft = firstBar.x - firstBar.width;
        const frameRight = lastBar.x + lastBar.width;
        const frameTop = centerY - 120;
        const frameBottom = centerY + 120;

        // 框架
        ctx.fillStyle = '#3a2a15';
        ctx.strokeStyle = '#5a4a25';
        ctx.lineWidth = 3;

        // 左側支架
        ctx.fillRect(frameLeft - 20, frameTop, 15, frameBottom - frameTop);
        ctx.strokeRect(frameLeft - 20, frameTop, 15, frameBottom - frameTop);

        // 右側支架
        ctx.fillRect(frameRight + 5, frameTop, 15, frameBottom - frameTop);
        ctx.strokeRect(frameRight + 5, frameTop, 15, frameBottom - frameTop);

        // 上橫桿
        ctx.fillRect(frameLeft - 20, frameTop - 10, frameRight - frameLeft + 40, 12);
        ctx.strokeRect(frameLeft - 20, frameTop - 10, frameRight - frameLeft + 40, 12);

        // 下橫桿
        ctx.fillRect(frameLeft - 20, frameBottom - 2, frameRight - frameLeft + 40, 12);
        ctx.strokeRect(frameLeft - 20, frameBottom - 2, frameRight - frameLeft + 40, 12);

        // 繩索
        for (const bar of this.bars) {
            ctx.strokeStyle = '#8a7a5a';
            ctx.lineWidth = 2;

            // 上繩
            ctx.beginPath();
            ctx.moveTo(bar.x - bar.width * 0.3, frameTop);
            ctx.lineTo(bar.x - bar.width * 0.3, bar.y - bar.height / 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(bar.x + bar.width * 0.3, frameTop);
            ctx.lineTo(bar.x + bar.width * 0.3, bar.y - bar.height / 2);
            ctx.stroke();
        }
    }

    drawBars() {
        for (const bar of this.bars) {
            this.drawBar(bar);
        }
    }

    drawBar(bar) {
        const ctx = this.ctx;

        // 振動效果
        let offsetX = 0;
        if (bar.vibration > 0.01) {
            bar.phase += 0.6;
            offsetX = Math.sin(bar.phase) * bar.vibration * 3;
        }

        const x = bar.x + offsetX;
        const y = bar.y;
        const width = bar.width;
        const height = bar.height;

        // 發光效果
        if (bar.brightness > 0.01) {
            ctx.save();
            ctx.shadowBlur = 25 * bar.brightness;
            ctx.shadowColor = bar.color;
            ctx.restore();
        }

        // 琴鍵漸層
        const barGrad = ctx.createLinearGradient(x - width / 2, 0, x + width / 2, 0);
        const baseColor = bar.color;

        if (bar.brightness > 0.01) {
            // 亮起狀態
            barGrad.addColorStop(0, this.lightenColor(baseColor, 20));
            barGrad.addColorStop(0.3, this.lightenColor(baseColor, 40));
            barGrad.addColorStop(0.5, this.lightenColor(baseColor, 50));
            barGrad.addColorStop(0.7, this.lightenColor(baseColor, 40));
            barGrad.addColorStop(1, this.lightenColor(baseColor, 20));
        } else {
            // 正常狀態
            barGrad.addColorStop(0, this.darkenColor(baseColor, 20));
            barGrad.addColorStop(0.3, baseColor);
            barGrad.addColorStop(0.5, this.lightenColor(baseColor, 10));
            barGrad.addColorStop(0.7, baseColor);
            barGrad.addColorStop(1, this.darkenColor(baseColor, 20));
        }

        // 繪製琴鍵
        ctx.beginPath();
        ctx.roundRect(x - width / 2, y - height / 2, width, height, 4);
        ctx.fillStyle = barGrad;
        ctx.fill();

        // 邊框
        ctx.strokeStyle = bar.brightness > 0.01
            ? 'rgba(255, 255, 255, 0.5)'
            : 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 高光
        ctx.beginPath();
        ctx.roundRect(x - width / 2 + 3, y - height / 2 + 3, width * 0.3, height - 6, 2);
        ctx.fillStyle = bar.brightness > 0.01
            ? 'rgba(255, 255, 255, 0.4)'
            : 'rgba(255, 255, 255, 0.15)';
        ctx.fill();

        // 發光效果
        if (bar.brightness > 0.01) {
            ctx.save();
            ctx.shadowBlur = 30 * bar.brightness;
            ctx.shadowColor = bar.color;
            ctx.beginPath();
            ctx.roundRect(x - width / 2, y - height / 2, width, height, 4);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.2 * bar.brightness})`;
            ctx.fill();
            ctx.restore();
        }
    }

    lightenColor(color, percent) {
        const num = parseInt(color.slice(1), 16);
        const r = Math.min(255, (num >> 16) + percent * 2.55);
        const g = Math.min(255, ((num >> 8) & 0x00FF) + percent * 2.55);
        const b = Math.min(255, (num & 0x0000FF) + percent * 2.55);
        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }

    darkenColor(color, percent) {
        const num = parseInt(color.slice(1), 16);
        const r = Math.max(0, (num >> 16) - percent * 2.55);
        const g = Math.max(0, ((num >> 8) & 0x00FF) - percent * 2.55);
        const b = Math.max(0, (num & 0x0000FF) - percent * 2.55);
        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }

    drawMalletHits() {
        const ctx = this.ctx;

        for (let i = this.malletHits.length - 1; i >= 0; i--) {
            const hit = this.malletHits[i];

            // 敲擊光圈
            ctx.beginPath();
            ctx.arc(hit.x, hit.y, hit.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 200, ${hit.alpha * 0.5})`;
            ctx.fill();

            hit.radius += 2;
            hit.alpha -= 0.05;

            if (hit.alpha <= 0) {
                this.malletHits.splice(i, 1);
            }
        }
    }

    updateEffects() {
        for (const bar of this.activeBars) {
            bar.brightness *= 0.92;
            bar.vibration *= 0.94;

            if (bar.brightness < 0.01 && bar.vibration < 0.01) {
                bar.brightness = 0;
                bar.vibration = 0;
                bar.phase = 0;
                this.activeBars.delete(bar);
            }
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// 啟動應用
document.addEventListener('DOMContentLoaded', () => {
    new XylophoneApp();
});
