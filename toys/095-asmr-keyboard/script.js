/**
 * ASMR Keyboard 鍵盤音效 - Web Toys #095
 * 模擬各種機械鍵盤軸體的打字音效
 */

class ASMRKeyboardApp {
    constructor() {
        this.canvas = document.getElementById('keyboardCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 音頻上下文
        this.audioContext = null;
        this.masterGain = null;
        this.convolver = null;

        // 狀態
        this.switchType = 'blue';
        this.reverbAmount = 0.4;
        this.volume = 0.5;

        // 統計
        this.keyCount = 0;
        this.keyTimes = [];
        this.wpm = 0;

        // 視覺效果
        this.animationId = null;
        this.keyEffects = [];
        this.pressedKeys = new Set();

        // 鍵盤佈局
        this.keyboardLayout = [
            ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Back'],
            ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
            ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
            ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
            ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Fn', 'Menu', 'Ctrl']
        ];

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
        const length = sampleRate * 0.8;
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const data = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const t = i / sampleRate;
                data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 5);
            }
        }

        this.convolver.buffer = impulse;
    }

    updateReverbMix() {
        if (!this.wetGain) return;
        this.wetGain.gain.value = this.reverbAmount * 0.5;
        this.dryGain.gain.value = 1 - this.reverbAmount * 0.2;
    }

    setupControls() {
        // 軸體類型
        const switchSelect = document.getElementById('switchType');
        switchSelect.addEventListener('change', (e) => {
            this.switchType = e.target.value;
            this.updateSwitchDisplay();
        });

        // 空間感
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
        if (amount < 0.33) return '小';
        if (amount < 0.66) return '中等';
        return '大';
    }

    updateSwitchDisplay() {
        const labels = {
            blue: '青軸',
            red: '紅軸',
            brown: '茶軸',
            black: '黑軸',
            membrane: '薄膜',
            buckling: '彈簧'
        };
        document.getElementById('switchDisplay').textContent = labels[this.switchType];
    }

    setupEventListeners() {
        document.addEventListener('keydown', async (e) => {
            if (this.pressedKeys.has(e.code)) return;
            this.pressedKeys.add(e.code);

            await this.initAudio();
            this.playKeySound('down');
            this.addKeyEffect(e.key);
            this.updateStats();
            document.getElementById('lastKey').textContent = e.key.length === 1 ? e.key.toUpperCase() : e.key;
        });

        document.addEventListener('keyup', async (e) => {
            this.pressedKeys.delete(e.code);
            await this.initAudio();
            this.playKeySound('up');
        });
    }

    playKeySound(type) {
        const now = this.audioContext.currentTime;

        switch (this.switchType) {
            case 'blue':
                this.playBlueSwitch(now, type);
                break;
            case 'red':
                this.playRedSwitch(now, type);
                break;
            case 'brown':
                this.playBrownSwitch(now, type);
                break;
            case 'black':
                this.playBlackSwitch(now, type);
                break;
            case 'membrane':
                this.playMembraneSwitch(now, type);
                break;
            case 'buckling':
                this.playBucklingSwitch(now, type);
                break;
        }
    }

    playBlueSwitch(t, type) {
        // 青軸 - 清脆的 click 聲
        if (type === 'down') {
            // Click 聲
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(4000, t);
            osc.frequency.exponentialRampToValueAtTime(2000, t + 0.01);

            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

            osc.connect(gain);
            gain.connect(this.dryGain);
            gain.connect(this.convolver);

            osc.start(t);
            osc.stop(t + 0.05);

            // 底部撞擊
            this.playBottomOut(t + 0.02);
        } else {
            // 回彈 click
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'square';
            osc.frequency.value = 3500;

            gain.gain.setValueAtTime(0.15, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

            osc.connect(gain);
            gain.connect(this.dryGain);

            osc.start(t);
            osc.stop(t + 0.03);
        }
    }

    playRedSwitch(t, type) {
        // 紅軸 - 線性，只有底部撞擊聲
        if (type === 'down') {
            this.playBottomOut(t);
        } else {
            this.playSpringUp(t);
        }
    }

    playBrownSwitch(t, type) {
        // 茶軸 - 輕微段落感
        if (type === 'down') {
            // 輕微的 bump
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'triangle';
            osc.frequency.value = 2500;

            gain.gain.setValueAtTime(0.15, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);

            osc.connect(gain);
            gain.connect(this.dryGain);

            osc.start(t);
            osc.stop(t + 0.02);

            this.playBottomOut(t + 0.01);
        } else {
            this.playSpringUp(t);
        }
    }

    playBlackSwitch(t, type) {
        // 黑軸 - 較重的線性
        if (type === 'down') {
            // 較低沉的底部撞擊
            const noise = this.createNoise(0.04);
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            filter.type = 'lowpass';
            filter.frequency.value = 800;

            gain.gain.setValueAtTime(0.4, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.dryGain);
            gain.connect(this.convolver);

            noise.start(t);
            noise.stop(t + 0.06);
        } else {
            this.playSpringUp(t);
        }
    }

    playMembraneSwitch(t, type) {
        // 薄膜 - 軟綿的聲音
        if (type === 'down') {
            const noise = this.createNoise(0.06);
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            filter.type = 'lowpass';
            filter.frequency.value = 600;
            filter.Q.value = 2;

            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.dryGain);

            noise.start(t);
            noise.stop(t + 0.1);
        }
    }

    playBucklingSwitch(t, type) {
        // 彈簧軸 - 復古 IBM 風格
        if (type === 'down') {
            // 彈簧聲
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(1500, t);
            osc.frequency.exponentialRampToValueAtTime(500, t + 0.03);

            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

            osc.connect(gain);
            gain.connect(this.dryGain);
            gain.connect(this.convolver);

            osc.start(t);
            osc.stop(t + 0.06);

            // 金屬撞擊
            const osc2 = this.audioContext.createOscillator();
            const gain2 = this.audioContext.createGain();

            osc2.type = 'square';
            osc2.frequency.value = 3000;

            gain2.gain.setValueAtTime(0.2, t + 0.01);
            gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

            osc2.connect(gain2);
            gain2.connect(this.dryGain);

            osc2.start(t + 0.01);
            osc2.stop(t + 0.04);
        } else {
            // 回彈
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(800, t);
            osc.frequency.exponentialRampToValueAtTime(1200, t + 0.02);

            gain.gain.setValueAtTime(0.15, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

            osc.connect(gain);
            gain.connect(this.dryGain);

            osc.start(t);
            osc.stop(t + 0.04);
        }
    }

    playBottomOut(t) {
        const noise = this.createNoise(0.03);
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        filter.type = 'bandpass';
        filter.frequency.value = 1500;
        filter.Q.value = 2;

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.dryGain);
        gain.connect(this.convolver);

        noise.start(t);
        noise.stop(t + 0.05);
    }

    playSpringUp(t) {
        const noise = this.createNoise(0.02);
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        filter.type = 'highpass';
        filter.frequency.value = 2000;

        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.dryGain);

        noise.start(t);
        noise.stop(t + 0.03);
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

    addKeyEffect(key) {
        this.keyEffects.push({
            key: key.length === 1 ? key.toUpperCase() : key,
            x: this.canvas.width / 2 + (Math.random() - 0.5) * 200,
            y: this.canvas.height / 2 + (Math.random() - 0.5) * 100,
            alpha: 1,
            scale: 1,
            vy: -2
        });
    }

    updateStats() {
        this.keyCount++;
        document.getElementById('keyCount').textContent = this.keyCount;

        // 計算 WPM
        const now = Date.now();
        this.keyTimes.push(now);

        // 只保留最近 60 秒的按鍵
        this.keyTimes = this.keyTimes.filter(t => now - t < 60000);

        // WPM = (字符數 / 5) / 分鐘數
        const minutes = (this.keyTimes.length > 1)
            ? (now - this.keyTimes[0]) / 60000
            : 1;
        this.wpm = Math.round((this.keyTimes.length / 5) / Math.max(minutes, 0.1));
        document.getElementById('wpm').textContent = this.wpm;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawBackground();
        this.drawKeyboard();
        this.drawKeyEffects();
        this.updateKeyEffects();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawBackground() {
        const ctx = this.ctx;

        const gradient = ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2,
            Math.max(this.canvas.width, this.canvas.height) * 0.6
        );
        gradient.addColorStop(0, '#151520');
        gradient.addColorStop(0.5, '#0a0a12');
        gradient.addColorStop(1, '#050508');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawKeyboard() {
        const ctx = this.ctx;
        const keyWidth = 45;
        const keyHeight = 45;
        const gap = 5;

        const totalWidth = 14 * (keyWidth + gap);
        const totalHeight = 5 * (keyHeight + gap);
        const startX = (this.canvas.width - totalWidth) / 2;
        const startY = (this.canvas.height - totalHeight) / 2 + 50;

        for (let row = 0; row < this.keyboardLayout.length; row++) {
            let x = startX;
            const y = startY + row * (keyHeight + gap);

            for (let col = 0; col < this.keyboardLayout[row].length; col++) {
                const key = this.keyboardLayout[row][col];
                let width = keyWidth;

                // 特殊按鍵寬度
                if (key === 'Back' || key === 'Tab' || key === '\\') width = keyWidth * 1.5;
                if (key === 'Caps' || key === 'Enter') width = keyWidth * 1.75;
                if (key === 'Shift') width = keyWidth * 2.25;
                if (key === 'Space') width = keyWidth * 6;
                if (key === 'Ctrl' || key === 'Alt') width = keyWidth * 1.25;

                // 按鍵背景
                const isPressed = Array.from(this.pressedKeys).some(code => {
                    const keyName = code.replace('Key', '').replace('Digit', '');
                    return keyName === key || keyName.toLowerCase() === key.toLowerCase();
                });

                const grad = ctx.createLinearGradient(x, y, x, y + keyHeight);
                if (isPressed) {
                    grad.addColorStop(0, '#3a5a4a');
                    grad.addColorStop(1, '#2a4a3a');
                } else {
                    grad.addColorStop(0, '#3a3a45');
                    grad.addColorStop(1, '#2a2a35');
                }

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.roundRect(x, y, width, keyHeight, 5);
                ctx.fill();

                // 邊框
                ctx.strokeStyle = isPressed ? '#64c896' : 'rgba(100, 100, 120, 0.5)';
                ctx.lineWidth = 1;
                ctx.stroke();

                // 按鍵文字
                ctx.fillStyle = isPressed ? '#a0e0c0' : 'rgba(255, 255, 255, 0.6)';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(key, x + width / 2, y + keyHeight / 2);

                x += width + gap;
            }
        }
    }

    drawKeyEffects() {
        const ctx = this.ctx;

        for (const effect of this.keyEffects) {
            ctx.save();
            ctx.globalAlpha = effect.alpha;
            ctx.font = `${24 * effect.scale}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#64c896';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#64c896';
            ctx.fillText(effect.key, effect.x, effect.y);
            ctx.restore();
        }
    }

    updateKeyEffects() {
        for (let i = this.keyEffects.length - 1; i >= 0; i--) {
            const effect = this.keyEffects[i];
            effect.y += effect.vy;
            effect.alpha -= 0.02;
            effect.scale += 0.02;

            if (effect.alpha <= 0) {
                this.keyEffects.splice(i, 1);
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
    new ASMRKeyboardApp();
});
