/**
 * Hang Drum 手碗鼓 - Web Toys #085
 * 模擬 Hang Drum 的冥想音色
 */

class HangDrumApp {
    constructor() {
        this.canvas = document.getElementById('hangDrumCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 音頻上下文
        this.audioContext = null;
        this.masterGain = null;
        this.convolver = null;

        // 狀態
        this.zones = [];
        this.scale = 'integral';
        this.reverbAmount = 0.5;
        this.sustainAmount = 0.5;
        this.volume = 0.5;

        // 音階定義 (MIDI 音符)
        this.scales = {
            integral: [45, 50, 52, 55, 57, 60, 62, 64, 67],  // D3 為中心
            hijaz: [45, 48, 53, 55, 57, 60, 64, 65, 69],     // 中東風格
            aeolian: [45, 48, 50, 52, 55, 57, 60, 62, 64],   // 自然小調
            pygmy: [45, 48, 50, 55, 57, 60, 62, 67, 69]      // 非洲風格
        };

        // 鍵盤映射
        this.keyMap = {
            'Digit1': 0, 'Digit2': 1, 'Digit3': 2,
            'Digit4': 3, 'Digit5': 4, 'Digit6': 5,
            'Digit7': 6, 'Digit8': 7, 'Digit9': 8
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
        const length = sampleRate * 4;
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const data = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const t = i / sampleRate;
                data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 1.5);
            }
        }

        this.convolver.buffer = impulse;
    }

    updateReverbMix() {
        if (!this.wetGain) return;
        this.wetGain.gain.value = this.reverbAmount * 0.7;
        this.dryGain.gain.value = 1 - this.reverbAmount * 0.3;
    }

    generateZones() {
        this.zones = [];
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.35;

        const scale = this.scales[this.scale];

        // 中心音區 (Ding)
        this.zones.push({
            x: centerX,
            y: centerY,
            radius: radius * 0.25,
            note: scale[0],
            index: 0,
            isCenter: true,
            glow: 0
        });

        // 周圍 8 個音區
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius * 0.65;
            const y = centerY + Math.sin(angle) * radius * 0.65;

            this.zones.push({
                x: x,
                y: y,
                radius: radius * 0.18,
                note: scale[i + 1],
                index: i + 1,
                isCenter: false,
                glow: 0,
                angle: angle
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

        // 延音
        const sustainSlider = document.getElementById('sustain');
        const sustainValue = document.getElementById('sustainValue');
        sustainSlider.addEventListener('input', (e) => {
            this.sustainAmount = parseInt(e.target.value) / 100;
            sustainValue.textContent = this.getAmountLabel(this.sustainAmount);
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
        document.getElementById('scaleDisplay').textContent =
            document.getElementById('scale').options[document.getElementById('scale').selectedIndex].text;
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
        const sustainDuration = 2 + this.sustainAmount * 4;

        // Hang Drum 音色 - 深沉溫暖的金屬音
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

        // 第五泛音（特色音）
        const osc4 = this.audioContext.createOscillator();
        osc4.type = 'sine';
        osc4.frequency.value = freq * 5;

        // 低音共鳴（Helmholtz 共振）
        const osc5 = this.audioContext.createOscillator();
        osc5.type = 'sine';
        osc5.frequency.value = freq * 0.5;

        // 攻擊噪音
        const noiseBuffer = this.createNoiseBuffer(0.1);
        const noise = this.audioContext.createBufferSource();
        noise.buffer = noiseBuffer;

        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = freq * 2;
        noiseFilter.Q.value = 2;

        // 增益控制
        const gain1 = this.audioContext.createGain();
        const gain2 = this.audioContext.createGain();
        const gain3 = this.audioContext.createGain();
        const gain4 = this.audioContext.createGain();
        const gain5 = this.audioContext.createGain();
        const noiseGain = this.audioContext.createGain();

        // 基音包絡 - 溫暖飽滿
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.35, now + 0.01);
        gain1.gain.exponentialRampToValueAtTime(0.2, now + 0.15);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + sustainDuration);

        // 第二泛音包絡
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.linearRampToValueAtTime(0.15, now + 0.008);
        gain2.gain.exponentialRampToValueAtTime(0.06, now + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + sustainDuration * 0.7);

        // 第三泛音包絡
        gain3.gain.setValueAtTime(0, now);
        gain3.gain.linearRampToValueAtTime(0.08, now + 0.006);
        gain3.gain.exponentialRampToValueAtTime(0.02, now + 0.1);
        gain3.gain.exponentialRampToValueAtTime(0.001, now + sustainDuration * 0.5);

        // 第五泛音包絡（快速衰減）
        gain4.gain.setValueAtTime(0, now);
        gain4.gain.linearRampToValueAtTime(0.04, now + 0.004);
        gain4.gain.exponentialRampToValueAtTime(0.001, now + sustainDuration * 0.3);

        // 低音共鳴包絡
        gain5.gain.setValueAtTime(0, now);
        gain5.gain.linearRampToValueAtTime(zone.isCenter ? 0.2 : 0.08, now + 0.02);
        gain5.gain.exponentialRampToValueAtTime(0.001, now + sustainDuration * 0.8);

        // 攻擊噪音包絡
        noiseGain.gain.setValueAtTime(0.08, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        // 音高微調（模擬金屬振動）
        const pitchMod = this.audioContext.createOscillator();
        pitchMod.type = 'sine';
        pitchMod.frequency.value = 4 + Math.random() * 2;
        const pitchModGain = this.audioContext.createGain();
        pitchModGain.gain.value = freq * 0.002;
        pitchMod.connect(pitchModGain);
        pitchModGain.connect(osc1.frequency);

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
        gain5.connect(this.convolver);

        // 播放
        osc1.start(now);
        osc2.start(now);
        osc3.start(now);
        osc4.start(now);
        osc5.start(now);
        noise.start(now);
        pitchMod.start(now);

        const stopTime = now + sustainDuration + 0.5;
        osc1.stop(stopTime);
        osc2.stop(stopTime);
        osc3.stop(stopTime);
        osc4.stop(stopTime);
        osc5.stop(stopTime);
        noise.stop(now + 0.1);
        pitchMod.stop(stopTime);

        // 視覺效果
        zone.glow = 1;
        this.activeZones.add(zone);

        // 添加波紋
        this.ripples.push({
            x: zone.x,
            y: zone.y,
            radius: zone.radius,
            maxRadius: zone.radius * 3,
            alpha: 0.8,
            speed: 2
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
        this.drawHangDrum();
        this.drawRipples();
        this.updateEffects();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawBackground() {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // 放射狀漸層背景
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, Math.max(this.canvas.width, this.canvas.height) * 0.7
        );
        gradient.addColorStop(0, '#1a2530');
        gradient.addColorStop(0.5, '#0f1820');
        gradient.addColorStop(1, '#080c10');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawHangDrum() {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const drumRadius = Math.min(this.canvas.width, this.canvas.height) * 0.35;

        // 鼓的外框陰影
        ctx.save();
        ctx.shadowBlur = 50;
        ctx.shadowColor = 'rgba(100, 180, 200, 0.2)';

        // 鼓的主體漸層
        const drumGrad = ctx.createRadialGradient(
            centerX - drumRadius * 0.2, centerY - drumRadius * 0.2, 0,
            centerX, centerY, drumRadius
        );
        drumGrad.addColorStop(0, '#4a5a68');
        drumGrad.addColorStop(0.3, '#3a4a58');
        drumGrad.addColorStop(0.7, '#2a3a48');
        drumGrad.addColorStop(1, '#1a2a38');

        ctx.beginPath();
        ctx.arc(centerX, centerY, drumRadius, 0, Math.PI * 2);
        ctx.fillStyle = drumGrad;
        ctx.fill();
        ctx.restore();

        // 鼓邊緣
        ctx.beginPath();
        ctx.arc(centerX, centerY, drumRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(100, 180, 200, 0.3)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 繪製音區
        for (const zone of this.zones) {
            this.drawZone(zone);
        }
    }

    drawZone(zone) {
        const ctx = this.ctx;

        // 音區漸層
        const isActive = zone.glow > 0.01;
        const zoneGrad = ctx.createRadialGradient(
            zone.x, zone.y, 0,
            zone.x, zone.y, zone.radius
        );

        if (isActive) {
            const intensity = zone.glow;
            zoneGrad.addColorStop(0, `rgba(150, 220, 240, ${0.4 * intensity})`);
            zoneGrad.addColorStop(0.5, `rgba(100, 180, 200, ${0.3 * intensity})`);
            zoneGrad.addColorStop(1, `rgba(60, 120, 150, ${0.2 * intensity})`);
        } else {
            zoneGrad.addColorStop(0, 'rgba(80, 100, 120, 0.3)');
            zoneGrad.addColorStop(0.7, 'rgba(60, 80, 100, 0.2)');
            zoneGrad.addColorStop(1, 'rgba(40, 60, 80, 0.1)');
        }

        // 音區凹陷效果
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
        ctx.fillStyle = zoneGrad;
        ctx.fill();

        // 音區邊緣
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
        ctx.strokeStyle = isActive
            ? `rgba(150, 220, 240, ${0.6 * zone.glow + 0.2})`
            : 'rgba(100, 140, 160, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 內圈裝飾
        if (zone.isCenter) {
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, zone.radius * 0.5, 0, Math.PI * 2);
            ctx.strokeStyle = isActive
                ? `rgba(150, 220, 240, ${0.4 * zone.glow + 0.15})`
                : 'rgba(100, 140, 160, 0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // 發光效果
        if (isActive) {
            ctx.save();
            ctx.shadowBlur = 30 * zone.glow;
            ctx.shadowColor = 'rgba(100, 200, 220, 0.8)';
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, zone.radius * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(150, 220, 240, ${0.3 * zone.glow})`;
            ctx.fill();
            ctx.restore();
        }

        // 音符標記
        ctx.fillStyle = isActive
            ? `rgba(255, 255, 255, ${0.5 + 0.5 * zone.glow})`
            : 'rgba(255, 255, 255, 0.3)';
        ctx.font = `${zone.isCenter ? 16 : 12}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(zone.index + 1, zone.x, zone.y);
    }

    drawRipples() {
        const ctx = this.ctx;

        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const ripple = this.ripples[i];

            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(100, 200, 220, ${ripple.alpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            ripple.radius += ripple.speed;
            ripple.alpha -= 0.02;

            if (ripple.alpha <= 0 || ripple.radius >= ripple.maxRadius) {
                this.ripples.splice(i, 1);
            }
        }
    }

    updateEffects() {
        // 更新發光衰減
        for (const zone of this.activeZones) {
            zone.glow *= 0.95;
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
    new HangDrumApp();
});
