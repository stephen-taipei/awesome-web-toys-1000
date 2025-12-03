/**
 * Kalimba 拇指琴 - Web Toys #084
 * 模擬拇指琴的溫暖音色
 */

class KalimbaApp {
    constructor() {
        this.canvas = document.getElementById('kalimbaCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 音頻上下文
        this.audioContext = null;
        this.masterGain = null;
        this.convolver = null;

        // 狀態
        this.tines = [];
        this.tineCount = 17;
        this.tuning = 'c';
        this.reverbAmount = 0.5;
        this.volume = 0.5;

        // 音階定義
        this.scales = {
            c: [48, 52, 55, 60, 64, 67, 72, 76, 79, 84, 88, 91, 96, 100, 103, 108, 112, 115, 120, 124, 127],
            g: [43, 47, 50, 55, 59, 62, 67, 71, 74, 79, 83, 86, 91, 95, 98, 103, 107, 110, 115, 119, 122],
            am: [45, 48, 52, 57, 60, 64, 69, 72, 76, 81, 84, 88, 93, 96, 100, 105, 108, 112, 117, 120, 124],
            pentatonic: [48, 50, 53, 55, 57, 60, 62, 65, 67, 69, 72, 74, 77, 79, 81, 84, 86, 89, 91, 93, 96]
        };

        // 鍵盤映射
        this.keyMap = {
            'KeyA': 0, 'KeyS': 1, 'KeyD': 2, 'KeyF': 3, 'KeyG': 4,
            'KeyH': 5, 'KeyJ': 6, 'KeyK': 7, 'KeyL': 8
        };

        // 動畫
        this.animationId = null;
        this.activeTines = new Set();

        this.init();
    }

    async init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.setupControls();
        this.setupEventListeners();
        this.generateTines();
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.generateTines();
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
        const length = sampleRate * 2.5;
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const data = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const t = i / sampleRate;
                data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 2.5);
            }
        }

        this.convolver.buffer = impulse;
    }

    updateReverbMix() {
        if (!this.wetGain) return;
        this.wetGain.gain.value = this.reverbAmount * 0.6;
        this.dryGain.gain.value = 1 - this.reverbAmount * 0.3;
    }

    generateTines() {
        this.tines = [];
        const centerX = this.canvas.width / 2;
        const baseY = this.canvas.height * 0.85;

        // 拇指琴的琴鍵從中間向兩邊擴展，由短到長
        const maxWidth = Math.min(this.canvas.width * 0.8, 800);
        const tineWidth = Math.min(maxWidth / this.tineCount * 0.8, 35);
        const spacing = maxWidth / this.tineCount;

        const scale = this.scales[this.tuning];

        // 中間最短，兩邊最長的排列
        const midIndex = Math.floor(this.tineCount / 2);

        for (let i = 0; i < this.tineCount; i++) {
            // 計算位置 - 交錯排列（低音在右，高音在左，交替）
            let position;
            if (i % 2 === 0) {
                position = midIndex + Math.floor(i / 2);
            } else {
                position = midIndex - Math.ceil(i / 2);
            }

            const x = centerX - maxWidth / 2 + position * spacing + spacing / 2;

            // 長度 - 中間短，兩邊長
            const distFromCenter = Math.abs(position - midIndex);
            const minHeight = 120;
            const maxHeight = 280;
            const height = minHeight + (distFromCenter / midIndex) * (maxHeight - minHeight);

            // 音高 - 使用音階
            const noteIndex = Math.min(i, scale.length - 1);
            const note = scale[noteIndex];

            this.tines.push({
                x: x,
                y: baseY,
                width: tineWidth,
                height: height,
                note: note,
                index: i,
                position: position,
                vibration: 0,
                phase: 0
            });
        }

        // 按位置排序以便繪製
        this.tines.sort((a, b) => a.position - b.position);
    }

    setupControls() {
        // 音階
        const tuningSelect = document.getElementById('tuning');
        tuningSelect.addEventListener('change', (e) => {
            this.tuning = e.target.value;
            this.generateTines();
            this.updateTuningDisplay();
        });

        // 琴鍵數量
        const tinesSlider = document.getElementById('tines');
        const tinesValue = document.getElementById('tinesValue');
        tinesSlider.addEventListener('input', (e) => {
            this.tineCount = parseInt(e.target.value);
            tinesValue.textContent = this.tineCount;
            this.generateTines();
        });

        // 殘響
        const reverbSlider = document.getElementById('reverb');
        const reverbValue = document.getElementById('reverbValue');
        reverbSlider.addEventListener('input', (e) => {
            this.reverbAmount = parseInt(e.target.value) / 100;
            reverbValue.textContent = this.getReverbLabel(this.reverbAmount);
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

    getReverbLabel(amount) {
        if (amount < 0.33) return '少';
        if (amount < 0.66) return '中等';
        return '豐富';
    }

    updateTuningDisplay() {
        const display = document.getElementById('tuningDisplay');
        const labels = {
            'c': 'C 大調',
            'g': 'G 大調',
            'am': 'A 小調',
            'pentatonic': '五聲音階'
        };
        display.textContent = labels[this.tuning];
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
                if (index < this.tines.length) {
                    this.playTine(this.tines[index]);
                }
            }
        });
    }

    handlePointer(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 檢查是否點擊到琴鍵
        for (const tine of this.tines) {
            if (x >= tine.x - tine.width / 2 &&
                x <= tine.x + tine.width / 2 &&
                y >= tine.y - tine.height &&
                y <= tine.y) {
                this.playTine(tine);
                break;
            }
        }
    }

    async playTine(tine) {
        await this.initAudio();

        const freq = this.midiToFreq(tine.note);
        const now = this.audioContext.currentTime;

        // 拇指琴音色 - 溫暖的金屬音
        // 基音
        const osc1 = this.audioContext.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.value = freq;

        // 第二泛音
        const osc2 = this.audioContext.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = freq * 2;

        // 第三泛音（較弱）
        const osc3 = this.audioContext.createOscillator();
        osc3.type = 'sine';
        osc3.frequency.value = freq * 3;

        // 高頻泛音（攻擊感）
        const osc4 = this.audioContext.createOscillator();
        osc4.type = 'sine';
        osc4.frequency.value = freq * 5.43; // 不諧和泛音增加金屬感

        // 增益控制
        const gain1 = this.audioContext.createGain();
        const gain2 = this.audioContext.createGain();
        const gain3 = this.audioContext.createGain();
        const gain4 = this.audioContext.createGain();

        // 基音包絡
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.4, now + 0.003);
        gain1.gain.exponentialRampToValueAtTime(0.2, now + 0.1);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

        // 第二泛音包絡
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.linearRampToValueAtTime(0.2, now + 0.002);
        gain2.gain.exponentialRampToValueAtTime(0.08, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        // 第三泛音包絡
        gain3.gain.setValueAtTime(0, now);
        gain3.gain.linearRampToValueAtTime(0.1, now + 0.002);
        gain3.gain.exponentialRampToValueAtTime(0.03, now + 0.06);
        gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        // 高頻攻擊包絡（快速衰減）
        gain4.gain.setValueAtTime(0, now);
        gain4.gain.linearRampToValueAtTime(0.08, now + 0.001);
        gain4.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        // 輕微的音高變化（模擬金屬振動）
        const vibrato = this.audioContext.createOscillator();
        vibrato.type = 'sine';
        vibrato.frequency.value = 6;
        const vibratoGain = this.audioContext.createGain();
        vibratoGain.gain.value = freq * 0.003;
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc1.frequency);

        // 連接
        osc1.connect(gain1);
        osc2.connect(gain2);
        osc3.connect(gain3);
        osc4.connect(gain4);

        gain1.connect(this.dryGain);
        gain2.connect(this.dryGain);
        gain3.connect(this.dryGain);
        gain4.connect(this.dryGain);

        gain1.connect(this.convolver);
        gain2.connect(this.convolver);

        // 播放
        osc1.start(now);
        osc2.start(now);
        osc3.start(now);
        osc4.start(now);
        vibrato.start(now);

        osc1.stop(now + 3);
        osc2.stop(now + 2);
        osc3.stop(now + 1.5);
        osc4.stop(now + 0.2);
        vibrato.stop(now + 3);

        // 視覺效果
        tine.vibration = 1;
        this.activeTines.add(tine);

        // 更新顯示
        this.updateNoteDisplay(tine.note);
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

        this.drawKalimba();
        this.updateVibrations();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawKalimba() {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const baseY = this.canvas.height * 0.85;

        // 繪製琴身
        const bodyWidth = Math.min(this.canvas.width * 0.7, 650);
        const bodyHeight = 180;

        // 琴身漸層
        const bodyGrad = ctx.createRadialGradient(
            centerX, baseY - bodyHeight/2,
            0,
            centerX, baseY - bodyHeight/2,
            bodyWidth/2
        );
        bodyGrad.addColorStop(0, '#8B6914');
        bodyGrad.addColorStop(0.5, '#6B4D0C');
        bodyGrad.addColorStop(1, '#4A3508');

        // 繪製橢圓形琴身
        ctx.beginPath();
        ctx.ellipse(centerX, baseY - bodyHeight/2 + 30, bodyWidth/2, bodyHeight/2, 0, 0, Math.PI * 2);
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        // 琴身邊框
        ctx.strokeStyle = '#3A2805';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 音孔
        ctx.beginPath();
        ctx.ellipse(centerX, baseY - 50, 40, 30, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#1a1510';
        ctx.fill();
        ctx.strokeStyle = '#5A4D08';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 裝飾圖案
        ctx.beginPath();
        ctx.ellipse(centerX, baseY - 50, 50, 40, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(200, 160, 100, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 繪製琴橋
        const bridgeY = baseY - 110;
        ctx.fillStyle = '#2A1F08';
        ctx.fillRect(centerX - bodyWidth/2 + 50, bridgeY - 10, bodyWidth - 100, 20);

        // 繪製琴鍵
        for (const tine of this.tines) {
            this.drawTine(tine);
        }
    }

    drawTine(tine) {
        const ctx = this.ctx;

        // 振動效果
        let offsetX = 0;
        if (tine.vibration > 0.01) {
            tine.phase += 0.5;
            offsetX = Math.sin(tine.phase) * tine.vibration * 8;
        }

        const x = tine.x + offsetX;
        const y = tine.y - 110; // 從琴橋開始
        const width = tine.width;
        const height = tine.height;

        // 琴鍵漸層（金屬質感）
        const isActive = tine.vibration > 0.01;
        const metalGrad = ctx.createLinearGradient(x - width/2, 0, x + width/2, 0);

        if (isActive) {
            metalGrad.addColorStop(0, '#E0C080');
            metalGrad.addColorStop(0.3, '#FFF0D0');
            metalGrad.addColorStop(0.5, '#FFE8C0');
            metalGrad.addColorStop(0.7, '#FFF0D0');
            metalGrad.addColorStop(1, '#E0C080');
        } else {
            metalGrad.addColorStop(0, '#A08050');
            metalGrad.addColorStop(0.3, '#C8A070');
            metalGrad.addColorStop(0.5, '#D0B080');
            metalGrad.addColorStop(0.7, '#C8A070');
            metalGrad.addColorStop(1, '#A08050');
        }

        // 琴鍵主體
        ctx.beginPath();
        ctx.roundRect(x - width/2, y - height, width, height, [width/4, width/4, 2, 2]);
        ctx.fillStyle = metalGrad;
        ctx.fill();

        // 邊緣高光
        ctx.strokeStyle = isActive ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 中心線
        ctx.beginPath();
        ctx.moveTo(x, y - height + 10);
        ctx.lineTo(x, y - 10);
        ctx.strokeStyle = isActive ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 發光效果
        if (isActive) {
            ctx.save();
            ctx.shadowBlur = 20 * tine.vibration;
            ctx.shadowColor = '#FFD080';
            ctx.beginPath();
            ctx.roundRect(x - width/2, y - height, width, height, [width/4, width/4, 2, 2]);
            ctx.fillStyle = 'rgba(255, 220, 150, 0.3)';
            ctx.fill();
            ctx.restore();
        }
    }

    updateVibrations() {
        for (const tine of this.activeTines) {
            tine.vibration *= 0.96;
            if (tine.vibration < 0.01) {
                tine.vibration = 0;
                tine.phase = 0;
                this.activeTines.delete(tine);
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
    new KalimbaApp();
});
