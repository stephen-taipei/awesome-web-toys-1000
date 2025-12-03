/**
 * Steel Drum 鋼鼓 - Web Toys #087
 * 模擬加勒比海鋼鼓的熱帶音色
 */

class SteelDrumApp {
    constructor() {
        this.canvas = document.getElementById('steelDrumCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 音頻上下文
        this.audioContext = null;
        this.masterGain = null;
        this.convolver = null;

        // 狀態
        this.zones = [];
        this.scale = 'caribbean';
        this.reverbAmount = 0.45;
        this.brightness = 0.5;
        this.volume = 0.5;

        // 音階定義 (MIDI)
        this.scales = {
            caribbean: [60, 62, 64, 65, 67, 69, 71, 72, 74, 76],  // C大調 + 延伸
            major: [60, 62, 64, 65, 67, 69, 71, 72, 74, 76],
            minor: [57, 59, 60, 62, 64, 65, 67, 69, 71, 72],
            calypso: [60, 63, 65, 67, 70, 72, 75, 77, 79, 82]  // 卡利普索調式
        };

        // 鍵盤映射
        this.keyMap = {
            'Digit1': 0, 'Digit2': 1, 'Digit3': 2, 'Digit4': 3, 'Digit5': 4,
            'Digit6': 5, 'Digit7': 6, 'Digit8': 7, 'Digit9': 8, 'Digit0': 9
        };

        // 動畫
        this.animationId = null;
        this.activeZones = new Set();
        this.ripples = [];

        this.init();
    }

    async init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.setupControls();
        this.setupEventListeners();
        this.generateZones();
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.generateZones();
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
        const length = sampleRate * 2;
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
        this.dryGain.gain.value = 1 - this.reverbAmount * 0.25;
    }

    generateZones() {
        this.zones = [];
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const drumRadius = Math.min(this.canvas.width, this.canvas.height) * 0.38;

        const scale = this.scales[this.scale];

        // 鋼鼓音區佈局 - 中心和周圍
        // 中心區域
        this.zones.push({
            x: centerX,
            y: centerY,
            radius: drumRadius * 0.22,
            note: scale[0],
            index: 0,
            isCenter: true,
            glow: 0
        });

        // 內圈 - 3個音區
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
            const x = centerX + Math.cos(angle) * drumRadius * 0.38;
            const y = centerY + Math.sin(angle) * drumRadius * 0.38;

            this.zones.push({
                x: x,
                y: y,
                radius: drumRadius * 0.18,
                note: scale[i + 1],
                index: i + 1,
                isCenter: false,
                glow: 0
            });
        }

        // 外圈 - 6個音區
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
            const x = centerX + Math.cos(angle) * drumRadius * 0.72;
            const y = centerY + Math.sin(angle) * drumRadius * 0.72;

            this.zones.push({
                x: x,
                y: y,
                radius: drumRadius * 0.15,
                note: scale[Math.min(i + 4, scale.length - 1)],
                index: i + 4,
                isCenter: false,
                glow: 0
            });
        }
    }

    setupControls() {
        // 音階
        const scaleSelect = document.getElementById('scale');
        scaleSelect.addEventListener('change', (e) => {
            this.scale = e.target.value;
            this.generateZones();
            this.updateScaleDisplay();
        });

        // 殘響
        const reverbSlider = document.getElementById('reverb');
        const reverbValue = document.getElementById('reverbValue');
        reverbSlider.addEventListener('input', (e) => {
            this.reverbAmount = parseInt(e.target.value) / 100;
            reverbValue.textContent = this.getAmountLabel(this.reverbAmount);
            this.updateReverbMix();
        });

        // 明亮度
        const brightnessSlider = document.getElementById('brightness');
        const brightnessValue = document.getElementById('brightnessValue');
        brightnessSlider.addEventListener('input', (e) => {
            this.brightness = parseInt(e.target.value) / 100;
            brightnessValue.textContent = this.getAmountLabel(this.brightness);
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
        if (amount < 0.33) return '低';
        if (amount < 0.66) return '中等';
        return '高';
    }

    updateScaleDisplay() {
        const labels = {
            caribbean: '加勒比海',
            major: 'C 大調',
            minor: 'A 小調',
            calypso: '卡利普索'
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
                if (index < this.zones.length) {
                    this.playZone(this.zones[index]);
                }
            }
        });
    }

    handlePointer(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 檢查是否點擊到音區
        for (const zone of this.zones) {
            const dist = Math.hypot(x - zone.x, y - zone.y);
            if (dist <= zone.radius) {
                this.playZone(zone);
                break;
            }
        }
    }

    async playZone(zone) {
        await this.initAudio();

        const freq = this.midiToFreq(zone.note);
        const now = this.audioContext.currentTime;

        // 鋼鼓音色 - 明亮有彈性的金屬音
        // 基音
        const osc1 = this.audioContext.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.value = freq;

        // 第二泛音
        const osc2 = this.audioContext.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = freq * 2;

        // 第三泛音
        const osc3 = this.audioContext.createOscillator();
        osc3.type = 'sine';
        osc3.frequency.value = freq * 3;

        // 第四泛音（特徵音）
        const osc4 = this.audioContext.createOscillator();
        osc4.type = 'sine';
        osc4.frequency.value = freq * 4.12;  // 略微失諧

        // 高頻泛音（明亮度控制）
        const osc5 = this.audioContext.createOscillator();
        osc5.type = 'sine';
        osc5.frequency.value = freq * 6;

        // 攻擊噪音
        const noiseBuffer = this.createNoiseBuffer(0.05);
        const noise = this.audioContext.createBufferSource();
        noise.buffer = noiseBuffer;

        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 2000;

        // 增益控制
        const gain1 = this.audioContext.createGain();
        const gain2 = this.audioContext.createGain();
        const gain3 = this.audioContext.createGain();
        const gain4 = this.audioContext.createGain();
        const gain5 = this.audioContext.createGain();
        const noiseGain = this.audioContext.createGain();

        // 鋼鼓包絡 - 快速攻擊，振動衰減
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.4, now + 0.005);
        gain1.gain.setValueAtTime(0.4, now + 0.01);
        gain1.gain.exponentialRampToValueAtTime(0.15, now + 0.15);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        gain2.gain.setValueAtTime(0, now);
        gain2.gain.linearRampToValueAtTime(0.2, now + 0.004);
        gain2.gain.exponentialRampToValueAtTime(0.06, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        gain3.gain.setValueAtTime(0, now);
        gain3.gain.linearRampToValueAtTime(0.12, now + 0.003);
        gain3.gain.exponentialRampToValueAtTime(0.03, now + 0.08);
        gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        gain4.gain.setValueAtTime(0, now);
        gain4.gain.linearRampToValueAtTime(0.08, now + 0.003);
        gain4.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        // 明亮度控制
        const brightLevel = 0.1 * this.brightness;
        gain5.gain.setValueAtTime(0, now);
        gain5.gain.linearRampToValueAtTime(brightLevel, now + 0.002);
        gain5.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        noiseGain.gain.setValueAtTime(0.06, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

        // 音高振動效果
        const vibrato = this.audioContext.createOscillator();
        vibrato.type = 'sine';
        vibrato.frequency.value = 8;
        const vibratoGain = this.audioContext.createGain();
        vibratoGain.gain.setValueAtTime(freq * 0.008, now);
        vibratoGain.gain.exponentialRampToValueAtTime(freq * 0.001, now + 0.5);
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc1.frequency);

        // 連接
        osc1.connect(gain1);
        osc2.connect(gain2);
        osc3.connect(gain3);
        osc4.connect(gain4);
        osc5.connect(gain5);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);

        gain1.connect(this.dryGain);
        gain2.connect(this.dryGain);
        gain3.connect(this.dryGain);
        gain4.connect(this.dryGain);
        gain5.connect(this.dryGain);
        noiseGain.connect(this.dryGain);

        gain1.connect(this.convolver);
        gain2.connect(this.convolver);

        // 播放
        osc1.start(now);
        osc2.start(now);
        osc3.start(now);
        osc4.start(now);
        osc5.start(now);
        noise.start(now);
        vibrato.start(now);

        const stopTime = now + 2;
        osc1.stop(stopTime);
        osc2.stop(stopTime);
        osc3.stop(stopTime);
        osc4.stop(stopTime);
        osc5.stop(stopTime);
        noise.stop(now + 0.1);
        vibrato.stop(stopTime);

        // 視覺效果
        zone.glow = 1;
        this.activeZones.add(zone);

        // 添加波紋
        this.ripples.push({
            x: zone.x,
            y: zone.y,
            radius: zone.radius * 0.5,
            maxRadius: zone.radius * 2.5,
            alpha: 0.8
        });

        // 更新顯示
        this.updateNoteDisplay(zone.note);
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
        this.drawDrum();
        this.drawRipples();
        this.updateEffects();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawBackground() {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // 熱帶漸層背景
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, Math.max(this.canvas.width, this.canvas.height) * 0.7
        );
        gradient.addColorStop(0, '#1a2a3a');
        gradient.addColorStop(0.5, '#0f1a28');
        gradient.addColorStop(1, '#080c12');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 裝飾性光點
        for (let i = 0; i < 30; i++) {
            const x = (Math.sin(i * 0.7 + Date.now() * 0.0005) + 1) * this.canvas.width / 2;
            const y = (Math.cos(i * 0.5 + Date.now() * 0.0003) + 1) * this.canvas.height / 2;
            const size = 1 + Math.sin(i + Date.now() * 0.002) * 0.5;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 200, 100, ${0.1 + Math.sin(i) * 0.05})`;
            ctx.fill();
        }
    }

    drawDrum() {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const drumRadius = Math.min(this.canvas.width, this.canvas.height) * 0.38;

        // 鼓的陰影
        ctx.save();
        ctx.shadowBlur = 40;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowOffsetY = 10;

        // 鼓體漸層
        const drumGrad = ctx.createRadialGradient(
            centerX - drumRadius * 0.2, centerY - drumRadius * 0.2, 0,
            centerX, centerY, drumRadius
        );
        drumGrad.addColorStop(0, '#5a6570');
        drumGrad.addColorStop(0.3, '#4a5560');
        drumGrad.addColorStop(0.7, '#3a4550');
        drumGrad.addColorStop(1, '#2a3540');

        ctx.beginPath();
        ctx.arc(centerX, centerY, drumRadius, 0, Math.PI * 2);
        ctx.fillStyle = drumGrad;
        ctx.fill();
        ctx.restore();

        // 鼓邊緣
        ctx.beginPath();
        ctx.arc(centerX, centerY, drumRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#6a7580';
        ctx.lineWidth = 8;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY, drumRadius - 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#8a9aa0';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 繪製音區
        for (const zone of this.zones) {
            this.drawZone(zone);
        }
    }

    drawZone(zone) {
        const ctx = this.ctx;
        const isActive = zone.glow > 0.01;

        // 音區凹陷效果
        const zoneGrad = ctx.createRadialGradient(
            zone.x - zone.radius * 0.2, zone.y - zone.radius * 0.2, 0,
            zone.x, zone.y, zone.radius
        );

        if (isActive) {
            zoneGrad.addColorStop(0, `rgba(255, 220, 150, ${0.6 * zone.glow})`);
            zoneGrad.addColorStop(0.5, `rgba(255, 180, 100, ${0.4 * zone.glow})`);
            zoneGrad.addColorStop(1, `rgba(200, 140, 80, ${0.2 * zone.glow})`);
        } else {
            zoneGrad.addColorStop(0, 'rgba(70, 80, 90, 0.8)');
            zoneGrad.addColorStop(0.5, 'rgba(50, 60, 70, 0.6)');
            zoneGrad.addColorStop(1, 'rgba(40, 50, 60, 0.4)');
        }

        // 凹面效果
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
        ctx.fillStyle = zoneGrad;
        ctx.fill();

        // 音區邊緣 - 凸起的金屬邊
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
        ctx.strokeStyle = isActive
            ? `rgba(255, 220, 150, ${0.8 * zone.glow + 0.3})`
            : 'rgba(100, 110, 120, 0.6)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 高光
        ctx.beginPath();
        ctx.arc(zone.x - zone.radius * 0.3, zone.y - zone.radius * 0.3,
            zone.radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = isActive
            ? `rgba(255, 255, 255, ${0.4 * zone.glow})`
            : 'rgba(255, 255, 255, 0.1)';
        ctx.fill();

        // 發光效果
        if (isActive) {
            ctx.save();
            ctx.shadowBlur = 30 * zone.glow;
            ctx.shadowColor = 'rgba(255, 200, 100, 0.8)';
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, zone.radius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 220, 150, ${0.3 * zone.glow})`;
            ctx.fill();
            ctx.restore();
        }

        // 音區編號
        ctx.fillStyle = isActive
            ? `rgba(255, 255, 255, ${0.7 + 0.3 * zone.glow})`
            : 'rgba(255, 255, 255, 0.4)';
        ctx.font = `${zone.isCenter ? 18 : 14}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(zone.index === 0 ? '1' : (zone.index + 1).toString(), zone.x, zone.y);
    }

    drawRipples() {
        const ctx = this.ctx;

        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const ripple = this.ripples[i];

            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 200, 100, ${ripple.alpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            ripple.radius += 3;
            ripple.alpha -= 0.025;

            if (ripple.alpha <= 0 || ripple.radius >= ripple.maxRadius) {
                this.ripples.splice(i, 1);
            }
        }
    }

    updateEffects() {
        for (const zone of this.activeZones) {
            zone.glow *= 0.94;
            if (zone.glow < 0.01) {
                zone.glow = 0;
                this.activeZones.delete(zone);
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
    new SteelDrumApp();
});
