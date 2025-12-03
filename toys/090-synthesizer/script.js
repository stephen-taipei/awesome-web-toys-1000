/**
 * Synthesizer 合成器 - Web Toys #090
 * 具備 ADSR 包絡的虛擬合成器
 */

class SynthesizerApp {
    constructor() {
        this.canvas = document.getElementById('synthCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 音頻上下文
        this.audioContext = null;
        this.masterGain = null;
        this.filterNode = null;
        this.analyser = null;

        // 活動中的音符
        this.activeNotes = new Map();

        // ADSR 設定
        this.attack = 0.1;
        this.decay = 0.2;
        this.sustain = 0.7;
        this.release = 0.3;

        // 其他設定
        this.waveform = 'sawtooth';
        this.filterFreq = 5000;
        this.volume = 0.5;

        // 鍵盤定義
        this.keys = [
            { note: 'C4', midi: 60, isBlack: false, key: 'KeyA' },
            { note: 'C#4', midi: 61, isBlack: true, key: 'KeyW' },
            { note: 'D4', midi: 62, isBlack: false, key: 'KeyS' },
            { note: 'D#4', midi: 63, isBlack: true, key: 'KeyE' },
            { note: 'E4', midi: 64, isBlack: false, key: 'KeyD' },
            { note: 'F4', midi: 65, isBlack: false, key: 'KeyF' },
            { note: 'F#4', midi: 66, isBlack: true, key: 'KeyT' },
            { note: 'G4', midi: 67, isBlack: false, key: 'KeyG' },
            { note: 'G#4', midi: 68, isBlack: true, key: 'KeyY' },
            { note: 'A4', midi: 69, isBlack: false, key: 'KeyH' },
            { note: 'A#4', midi: 70, isBlack: true, key: 'KeyU' },
            { note: 'B4', midi: 71, isBlack: false, key: 'KeyJ' },
            { note: 'C5', midi: 72, isBlack: false, key: 'KeyK' },
            { note: 'C#5', midi: 73, isBlack: true, key: 'KeyO' },
            { note: 'D5', midi: 74, isBlack: false, key: 'KeyL' }
        ];

        // 鍵盤映射
        this.keyMap = {};
        this.keys.forEach((k, i) => {
            this.keyMap[k.key] = i;
        });

        // 視覺效果
        this.animationId = null;
        this.waveformData = new Uint8Array(128);
        this.pressedKeys = new Set();

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

        // 濾波器
        this.filterNode = this.audioContext.createBiquadFilter();
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.value = this.filterFreq;
        this.filterNode.Q.value = 1;

        // 主音量
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = this.volume;

        // 分析器
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;

        // 連接
        this.filterNode.connect(this.masterGain);
        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
    }

    setupControls() {
        // 波形
        const waveformSelect = document.getElementById('waveform');
        waveformSelect.addEventListener('change', (e) => {
            this.waveform = e.target.value;
            this.updateWaveDisplay();
        });

        // Attack
        const attackSlider = document.getElementById('attack');
        const attackValue = document.getElementById('attackValue');
        attackSlider.addEventListener('input', (e) => {
            this.attack = parseInt(e.target.value) / 100;
            attackValue.textContent = this.attack.toFixed(1);
        });

        // Decay
        const decaySlider = document.getElementById('decay');
        const decayValue = document.getElementById('decayValue');
        decaySlider.addEventListener('input', (e) => {
            this.decay = parseInt(e.target.value) / 100;
            decayValue.textContent = this.decay.toFixed(1);
        });

        // Sustain
        const sustainSlider = document.getElementById('sustain');
        const sustainValue = document.getElementById('sustainValue');
        sustainSlider.addEventListener('input', (e) => {
            this.sustain = parseInt(e.target.value) / 100;
            sustainValue.textContent = e.target.value;
        });

        // Release
        const releaseSlider = document.getElementById('release');
        const releaseValue = document.getElementById('releaseValue');
        releaseSlider.addEventListener('input', (e) => {
            this.release = parseInt(e.target.value) / 100;
            releaseValue.textContent = this.release.toFixed(1);
        });

        // Filter
        const filterSlider = document.getElementById('filter');
        const filterValue = document.getElementById('filterValue');
        filterSlider.addEventListener('input', (e) => {
            this.filterFreq = parseInt(e.target.value);
            filterValue.textContent = this.filterFreq;
            if (this.filterNode) {
                this.filterNode.frequency.value = this.filterFreq;
            }
        });

        // Volume
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

    updateWaveDisplay() {
        const labels = {
            sine: '正弦波',
            triangle: '三角波',
            sawtooth: '鋸齒波',
            square: '方波'
        };
        document.getElementById('waveDisplay').textContent = labels[this.waveform];
    }

    setupEventListeners() {
        // 鍵盤按下
        document.addEventListener('keydown', async (e) => {
            if (e.repeat) return;
            if (this.keyMap.hasOwnProperty(e.code)) {
                await this.initAudio();
                const keyIndex = this.keyMap[e.code];
                this.noteOn(keyIndex);
            }
        });

        // 鍵盤放開
        document.addEventListener('keyup', (e) => {
            if (this.keyMap.hasOwnProperty(e.code)) {
                const keyIndex = this.keyMap[e.code];
                this.noteOff(keyIndex);
            }
        });

        // 滑鼠點擊
        this.canvas.addEventListener('mousedown', async (e) => {
            await this.initAudio();
            const keyIndex = this.getKeyAtPosition(e);
            if (keyIndex !== -1) {
                this.noteOn(keyIndex);
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            for (const keyIndex of this.pressedKeys) {
                this.noteOff(keyIndex);
            }
        });

        this.canvas.addEventListener('mouseleave', () => {
            for (const keyIndex of this.pressedKeys) {
                this.noteOff(keyIndex);
            }
        });

        // 觸控
        this.canvas.addEventListener('touchstart', async (e) => {
            e.preventDefault();
            await this.initAudio();
            for (const touch of e.touches) {
                const keyIndex = this.getKeyAtPosition(touch);
                if (keyIndex !== -1) {
                    this.noteOn(keyIndex);
                }
            }
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            for (const keyIndex of this.pressedKeys) {
                this.noteOff(keyIndex);
            }
        });
    }

    getKeyAtPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const keyboardInfo = this.getKeyboardLayout();
        if (!keyboardInfo) return -1;

        const { startX, startY, whiteKeyWidth, whiteKeyHeight, blackKeyWidth, blackKeyHeight } = keyboardInfo;

        // 先檢查黑鍵（因為在上層）
        let whiteIndex = 0;
        for (let i = 0; i < this.keys.length; i++) {
            const key = this.keys[i];
            if (key.isBlack) {
                const blackX = startX + whiteIndex * whiteKeyWidth - blackKeyWidth / 2;
                if (x >= blackX && x <= blackX + blackKeyWidth &&
                    y >= startY && y <= startY + blackKeyHeight) {
                    return i;
                }
            } else {
                whiteIndex++;
            }
        }

        // 檢查白鍵
        whiteIndex = 0;
        for (let i = 0; i < this.keys.length; i++) {
            const key = this.keys[i];
            if (!key.isBlack) {
                const keyX = startX + whiteIndex * whiteKeyWidth;
                if (x >= keyX && x <= keyX + whiteKeyWidth &&
                    y >= startY && y <= startY + whiteKeyHeight) {
                    return i;
                }
                whiteIndex++;
            }
        }

        return -1;
    }

    getKeyboardLayout() {
        const whiteKeys = this.keys.filter(k => !k.isBlack).length;
        const maxWidth = Math.min(this.canvas.width * 0.8, 800);
        const whiteKeyWidth = maxWidth / whiteKeys;
        const whiteKeyHeight = 180;
        const blackKeyWidth = whiteKeyWidth * 0.6;
        const blackKeyHeight = 110;

        const startX = (this.canvas.width - maxWidth) / 2;
        const startY = this.canvas.height - whiteKeyHeight - 100;

        return { startX, startY, whiteKeyWidth, whiteKeyHeight, blackKeyWidth, blackKeyHeight };
    }

    noteOn(keyIndex) {
        if (this.pressedKeys.has(keyIndex)) return;

        const key = this.keys[keyIndex];
        const freq = this.midiToFreq(key.midi);
        const now = this.audioContext.currentTime;

        // 創建振盪器
        const osc = this.audioContext.createOscillator();
        osc.type = this.waveform;
        osc.frequency.value = freq;

        // 創建增益節點（用於 ADSR）
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0, now);

        // Attack
        gain.gain.linearRampToValueAtTime(1, now + this.attack);

        // Decay to Sustain
        gain.gain.linearRampToValueAtTime(this.sustain, now + this.attack + this.decay);

        // 連接
        osc.connect(gain);
        gain.connect(this.filterNode);

        osc.start(now);

        // 儲存活動音符
        this.activeNotes.set(keyIndex, { osc, gain });
        this.pressedKeys.add(keyIndex);

        // 更新顯示
        document.getElementById('noteDisplay').textContent = key.note;
    }

    noteOff(keyIndex) {
        if (!this.activeNotes.has(keyIndex)) return;

        const { osc, gain } = this.activeNotes.get(keyIndex);
        const now = this.audioContext.currentTime;

        // Release
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0, now + this.release);

        // 停止振盪器
        osc.stop(now + this.release + 0.1);

        this.activeNotes.delete(keyIndex);
        this.pressedKeys.delete(keyIndex);
    }

    midiToFreq(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawBackground();
        this.drawWaveform();
        this.drawADSRDisplay();
        this.drawKeyboard();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawBackground() {
        const ctx = this.ctx;

        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#12121f');
        gradient.addColorStop(0.5, '#0a0a15');
        gradient.addColorStop(1, '#080810');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 裝飾格線
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.05)';
        ctx.lineWidth = 1;

        for (let x = 0; x < this.canvas.width; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }

        for (let y = 0; y < this.canvas.height; y += 50) {
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

        const waveHeight = 100;
        const waveY = 150;
        const waveWidth = Math.min(this.canvas.width * 0.6, 600);
        const startX = (this.canvas.width - waveWidth) / 2;

        // 波形背景
        ctx.fillStyle = 'rgba(0, 200, 255, 0.05)';
        ctx.fillRect(startX - 20, waveY - waveHeight - 20, waveWidth + 40, waveHeight * 2 + 40);

        ctx.strokeStyle = 'rgba(0, 200, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(startX - 20, waveY - waveHeight - 20, waveWidth + 40, waveHeight * 2 + 40);

        // 中心線
        ctx.beginPath();
        ctx.moveTo(startX, waveY);
        ctx.lineTo(startX + waveWidth, waveY);
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.2)';
        ctx.stroke();

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

        ctx.strokeStyle = '#00c8ff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 發光效果
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00c8ff';
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    drawADSRDisplay() {
        const ctx = this.ctx;
        const width = 200;
        const height = 80;
        const x = this.canvas.width - width - 350;
        const y = 100;

        // 背景
        ctx.fillStyle = 'rgba(0, 200, 255, 0.05)';
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);

        // ADSR 曲線
        const totalTime = this.attack + this.decay + 0.3 + this.release;
        const timeScale = width / totalTime;

        ctx.beginPath();
        ctx.moveTo(x, y + height);

        // Attack
        const attackX = x + this.attack * timeScale;
        ctx.lineTo(attackX, y);

        // Decay
        const decayX = attackX + this.decay * timeScale;
        ctx.lineTo(decayX, y + height * (1 - this.sustain));

        // Sustain
        const sustainX = decayX + 0.3 * timeScale;
        ctx.lineTo(sustainX, y + height * (1 - this.sustain));

        // Release
        const releaseX = sustainX + this.release * timeScale;
        ctx.lineTo(releaseX, y + height);

        ctx.strokeStyle = '#00c8ff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 標籤
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('A', attackX, y + height + 12);
        ctx.fillText('D', decayX, y + height + 12);
        ctx.fillText('S', sustainX, y + height + 12);
        ctx.fillText('R', releaseX, y + height + 12);

        ctx.fillText('ADSR', x + width / 2, y - 8);
    }

    drawKeyboard() {
        const ctx = this.ctx;
        const keyboardInfo = this.getKeyboardLayout();
        if (!keyboardInfo) return;

        const { startX, startY, whiteKeyWidth, whiteKeyHeight, blackKeyWidth, blackKeyHeight } = keyboardInfo;

        // 繪製白鍵
        let whiteIndex = 0;
        for (let i = 0; i < this.keys.length; i++) {
            const key = this.keys[i];
            if (!key.isBlack) {
                const x = startX + whiteIndex * whiteKeyWidth;
                const isPressed = this.pressedKeys.has(i);

                // 白鍵漸層
                const grad = ctx.createLinearGradient(x, startY, x, startY + whiteKeyHeight);
                if (isPressed) {
                    grad.addColorStop(0, '#a0d8ff');
                    grad.addColorStop(1, '#80c0e0');
                } else {
                    grad.addColorStop(0, '#ffffff');
                    grad.addColorStop(0.8, '#e8e8e8');
                    grad.addColorStop(1, '#d0d0d0');
                }

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.roundRect(x + 2, startY, whiteKeyWidth - 4, whiteKeyHeight, [0, 0, 6, 6]);
                ctx.fill();

                // 邊框
                ctx.strokeStyle = '#888';
                ctx.lineWidth = 1;
                ctx.stroke();

                // 發光效果
                if (isPressed) {
                    ctx.save();
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = '#00c8ff';
                    ctx.fillStyle = 'rgba(0, 200, 255, 0.2)';
                    ctx.fill();
                    ctx.restore();
                }

                // 音符標籤
                ctx.fillStyle = isPressed ? '#006090' : '#666';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(key.note, x + whiteKeyWidth / 2, startY + whiteKeyHeight - 15);

                whiteIndex++;
            }
        }

        // 繪製黑鍵
        whiteIndex = 0;
        for (let i = 0; i < this.keys.length; i++) {
            const key = this.keys[i];
            if (key.isBlack) {
                const x = startX + whiteIndex * whiteKeyWidth - blackKeyWidth / 2;
                const isPressed = this.pressedKeys.has(i);

                // 黑鍵漸層
                const grad = ctx.createLinearGradient(x, startY, x, startY + blackKeyHeight);
                if (isPressed) {
                    grad.addColorStop(0, '#4080a0');
                    grad.addColorStop(1, '#306080');
                } else {
                    grad.addColorStop(0, '#404040');
                    grad.addColorStop(0.7, '#2a2a2a');
                    grad.addColorStop(1, '#1a1a1a');
                }

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.roundRect(x, startY, blackKeyWidth, blackKeyHeight, [0, 0, 4, 4]);
                ctx.fill();

                // 發光效果
                if (isPressed) {
                    ctx.save();
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = '#00c8ff';
                    ctx.fillStyle = 'rgba(0, 200, 255, 0.3)';
                    ctx.fill();
                    ctx.restore();
                }
            } else {
                whiteIndex++;
            }
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        for (const [keyIndex, note] of this.activeNotes) {
            note.osc.stop();
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// 啟動應用
document.addEventListener('DOMContentLoaded', () => {
    new SynthesizerApp();
});
