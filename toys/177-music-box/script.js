/**
 * 音樂盒 - Music Box
 * 模擬傳統機械音樂盒的運作原理
 */

class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.pitchOffset = 0;
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    playNote(frequency, duration = 0.5, volume = 0.3) {
        if (!this.audioContext) return;

        // 套用音高偏移
        const pitchMultiplier = Math.pow(2, this.pitchOffset / 12);
        frequency *= pitchMultiplier;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filterNode = this.audioContext.createBiquadFilter();

        // 音樂盒音色 - 鐘琴般的聲音
        oscillator.type = 'sine';

        // 加入泛音
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode2 = this.audioContext.createGain();
        oscillator2.type = 'sine';
        oscillator2.frequency.setValueAtTime(frequency * 2, this.audioContext.currentTime);
        gainNode2.gain.setValueAtTime(volume * 0.3, this.audioContext.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration * 0.8);

        // 高通濾波器
        filterNode.type = 'highpass';
        filterNode.frequency.value = 200;

        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        // 音量包絡 - 快速起音，緩慢衰減
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator2.connect(gainNode2);
        gainNode2.connect(this.audioContext.destination);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
        oscillator2.start(this.audioContext.currentTime);
        oscillator2.stop(this.audioContext.currentTime + duration);
    }
}

// 曲目資料
const MELODIES = {
    twinkle: {
        name: '小星星',
        notes: [
            { note: 'C4', time: 0 }, { note: 'C4', time: 1 },
            { note: 'G4', time: 2 }, { note: 'G4', time: 3 },
            { note: 'A4', time: 4 }, { note: 'A4', time: 5 },
            { note: 'G4', time: 6 },
            { note: 'F4', time: 8 }, { note: 'F4', time: 9 },
            { note: 'E4', time: 10 }, { note: 'E4', time: 11 },
            { note: 'D4', time: 12 }, { note: 'D4', time: 13 },
            { note: 'C4', time: 14 },
            { note: 'G4', time: 16 }, { note: 'G4', time: 17 },
            { note: 'F4', time: 18 }, { note: 'F4', time: 19 },
            { note: 'E4', time: 20 }, { note: 'E4', time: 21 },
            { note: 'D4', time: 22 },
            { note: 'G4', time: 24 }, { note: 'G4', time: 25 },
            { note: 'F4', time: 26 }, { note: 'F4', time: 27 },
            { note: 'E4', time: 28 }, { note: 'E4', time: 29 },
            { note: 'D4', time: 30 }
        ],
        length: 32
    },
    canon: {
        name: '卡農',
        notes: [
            { note: 'D5', time: 0 }, { note: 'F#4', time: 1 },
            { note: 'A4', time: 2 }, { note: 'D4', time: 3 },
            { note: 'B4', time: 4 }, { note: 'G4', time: 5 },
            { note: 'A4', time: 6 }, { note: 'F#4', time: 7 },
            { note: 'G4', time: 8 }, { note: 'E4', time: 9 },
            { note: 'F#4', time: 10 }, { note: 'D4', time: 11 },
            { note: 'G4', time: 12 }, { note: 'F#4', time: 13 },
            { note: 'E4', time: 14 }, { note: 'D4', time: 15 }
        ],
        length: 16
    },
    furelise: {
        name: '乘著月光',
        notes: [
            { note: 'E5', time: 0 }, { note: 'D#5', time: 1 },
            { note: 'E5', time: 2 }, { note: 'D#5', time: 3 },
            { note: 'E5', time: 4 }, { note: 'B4', time: 5 },
            { note: 'D5', time: 6 }, { note: 'C5', time: 7 },
            { note: 'A4', time: 8 },
            { note: 'C4', time: 10 }, { note: 'E4', time: 11 },
            { note: 'A4', time: 12 }, { note: 'B4', time: 13 },
            { note: 'E4', time: 15 }, { note: 'G#4', time: 16 },
            { note: 'B4', time: 17 }, { note: 'C5', time: 18 }
        ],
        length: 20
    }
};

// 音符頻率對照表
const NOTE_FREQUENCIES = {
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
    'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
    'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25,
    'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99,
    'G#5': 830.61, 'A5': 880.00
};

class MusicBox {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audio = new AudioEngine();
        this.playing = false;
        this.speed = 50;
        this.melodyIndex = 0;
        this.melody = MELODIES.twinkle;
        this.position = 0;
        this.windUp = 100; // 發條能量
        this.lastNoteTime = -1;
        this.playedNotes = new Set();
        this.activeTines = [];
        this.cylinderRotation = 0;

        this.resize();
        this.bindEvents();
        this.animate();
    }

    resize() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);

        this.width = rect.width;
        this.height = rect.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        this.canvas.addEventListener('click', () => {
            this.audio.init();
            if (!this.playing) {
                this.play();
            }
        });

        document.getElementById('speed').addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            document.getElementById('speedValue').textContent = this.speed;
        });

        document.getElementById('melody').addEventListener('input', (e) => {
            this.melodyIndex = parseInt(e.target.value);
            const melodies = [MELODIES.twinkle, MELODIES.canon, MELODIES.furelise];
            this.melody = melodies[this.melodyIndex];
            document.getElementById('melodyValue').textContent = this.melody.name;
            this.position = 0;
            this.playedNotes.clear();
        });

        document.getElementById('pitch').addEventListener('input', (e) => {
            this.audio.pitchOffset = parseInt(e.target.value);
            document.getElementById('pitchValue').textContent = this.audio.pitchOffset;
        });

        document.getElementById('playBtn').addEventListener('click', () => {
            this.audio.init();
            this.play();
        });

        document.getElementById('stopBtn').addEventListener('click', () => {
            this.stop();
        });

        document.getElementById('windBtn').addEventListener('click', () => {
            this.windUp = Math.min(100, this.windUp + 30);
        });
    }

    play() {
        this.playing = true;
        this.playedNotes.clear();
        document.getElementById('playBtn').classList.add('playing');
        document.getElementById('playBtn').textContent = '播放中';
    }

    stop() {
        this.playing = false;
        document.getElementById('playBtn').classList.remove('playing');
        document.getElementById('playBtn').textContent = '播放';
    }

    update() {
        if (!this.playing || this.windUp <= 0) {
            if (this.windUp <= 0) this.stop();
            return;
        }

        // 消耗發條
        this.windUp -= 0.01 * (this.speed / 50);

        // 更新位置
        const speedFactor = this.speed / 50;
        this.position += 0.02 * speedFactor;

        // 滾筒旋轉
        this.cylinderRotation += 0.01 * speedFactor;

        // 循環播放
        if (this.position >= this.melody.length) {
            this.position = 0;
            this.playedNotes.clear();
        }

        // 檢查是否需要播放音符
        this.melody.notes.forEach((noteData, index) => {
            if (this.position >= noteData.time && !this.playedNotes.has(index)) {
                this.playedNotes.add(index);
                const frequency = NOTE_FREQUENCIES[noteData.note];
                if (frequency) {
                    this.audio.playNote(frequency, 1.5, 0.25);
                    // 添加活動音梳
                    this.activeTines.push({
                        index: this.getNoteIndex(noteData.note),
                        time: 0,
                        maxTime: 30
                    });
                }
            }
        });

        // 更新活動音梳
        this.activeTines = this.activeTines.filter(tine => {
            tine.time++;
            return tine.time < tine.maxTime;
        });
    }

    getNoteIndex(noteName) {
        const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5'];
        const baseNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const note = noteName.replace(/[0-9]/g, '');
        const octave = parseInt(noteName.replace(/[^0-9]/g, ''));

        let index = baseNotes.indexOf(note);
        if (octave >= 5) index += 7;
        return Math.min(11, Math.max(0, index));
    }

    draw() {
        const ctx = this.ctx;

        // 背景
        const bgGradient = ctx.createLinearGradient(0, 0, 0, this.height);
        bgGradient.addColorStop(0, '#2F1810');
        bgGradient.addColorStop(0.5, '#4A2C20');
        bgGradient.addColorStop(1, '#2F1810');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // 繪製音樂盒內部
        this.drawMechanism();

        // 繪製發條指示
        this.drawWindIndicator();
    }

    drawMechanism() {
        const ctx = this.ctx;
        const cx = this.centerX;
        const cy = this.centerY + 30;

        // 機械底座
        ctx.save();
        const baseGradient = ctx.createLinearGradient(cx - 200, cy + 80, cx + 200, cy + 120);
        baseGradient.addColorStop(0, '#5D4037');
        baseGradient.addColorStop(0.5, '#8D6E63');
        baseGradient.addColorStop(1, '#5D4037');
        ctx.fillStyle = baseGradient;
        ctx.beginPath();
        ctx.roundRect(cx - 200, cy + 80, 400, 40, 5);
        ctx.fill();
        ctx.restore();

        // 滾筒
        this.drawCylinder(cx - 50, cy, 150, 60);

        // 音梳
        this.drawComb(cx + 120, cy - 50, 60, 120);

        // 齒輪裝飾
        this.drawGear(cx - 150, cy + 50, 25);
        this.drawGear(cx - 100, cy + 60, 18);
    }

    drawCylinder(x, y, width, radius) {
        const ctx = this.ctx;

        ctx.save();
        ctx.translate(x, y);

        // 滾筒主體
        const cylinderGradient = ctx.createLinearGradient(-width / 2, -radius, -width / 2, radius);
        cylinderGradient.addColorStop(0, '#DAA520');
        cylinderGradient.addColorStop(0.3, '#FFD700');
        cylinderGradient.addColorStop(0.5, '#FFF8DC');
        cylinderGradient.addColorStop(0.7, '#FFD700');
        cylinderGradient.addColorStop(1, '#B8860B');

        ctx.fillStyle = cylinderGradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, width / 2, radius, 0, 0, Math.PI * 2);
        ctx.fill();

        // 滾筒上的針點
        const pinCount = this.melody.notes.length;
        ctx.fillStyle = '#8B4513';

        for (let i = 0; i < pinCount; i++) {
            const noteData = this.melody.notes[i];
            const angle = (noteData.time / this.melody.length) * Math.PI * 2 + this.cylinderRotation;
            const noteIndex = this.getNoteIndex(noteData.note);
            const pinX = Math.cos(angle) * (width / 2 - 10);
            const pinY = -radius + 10 + noteIndex * 8;

            // 只繪製可見的針
            if (Math.cos(angle) > -0.3) {
                ctx.beginPath();
                ctx.arc(pinX, pinY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // 滾筒端蓋
        ctx.fillStyle = '#B8860B';
        ctx.beginPath();
        ctx.ellipse(-width / 2, 0, 8, radius * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(width / 2, 0, 8, radius * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawComb(x, y, width, height) {
        const ctx = this.ctx;
        const tineCount = 12;
        const tineHeight = height / tineCount;

        ctx.save();
        ctx.translate(x, y);

        // 音梳底座
        const baseGradient = ctx.createLinearGradient(0, 0, width, 0);
        baseGradient.addColorStop(0, '#CD853F');
        baseGradient.addColorStop(0.5, '#DEB887');
        baseGradient.addColorStop(1, '#CD853F');

        ctx.fillStyle = baseGradient;
        ctx.fillRect(width - 15, 0, 15, height);

        // 音梳齒
        for (let i = 0; i < tineCount; i++) {
            const tineY = i * tineHeight + tineHeight / 2;
            const tineWidth = width - 20 + i * 2;

            // 檢查是否活動
            const isActive = this.activeTines.some(t => t.index === i);
            const activeOffset = isActive ?
                Math.sin(this.activeTines.find(t => t.index === i).time * 0.5) * 5 : 0;

            const tineGradient = ctx.createLinearGradient(0, tineY - 3, 0, tineY + 3);
            tineGradient.addColorStop(0, '#C0C0C0');
            tineGradient.addColorStop(0.5, '#E8E8E8');
            tineGradient.addColorStop(1, '#A0A0A0');

            ctx.fillStyle = tineGradient;
            ctx.beginPath();
            ctx.roundRect(-tineWidth + activeOffset, tineY - 3, tineWidth, 6, 2);
            ctx.fill();

            // 活動發光效果
            if (isActive) {
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.roundRect(-tineWidth + activeOffset, tineY - 3, tineWidth, 6, 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        ctx.restore();
    }

    drawGear(x, y, radius) {
        const ctx = this.ctx;
        const teeth = 12;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.cylinderRotation * 2);

        const gearGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        gearGradient.addColorStop(0, '#DAA520');
        gearGradient.addColorStop(0.7, '#B8860B');
        gearGradient.addColorStop(1, '#8B6914');

        ctx.fillStyle = gearGradient;
        ctx.beginPath();

        for (let i = 0; i < teeth; i++) {
            const angle1 = (i / teeth) * Math.PI * 2;
            const angle2 = ((i + 0.3) / teeth) * Math.PI * 2;
            const angle3 = ((i + 0.5) / teeth) * Math.PI * 2;
            const angle4 = ((i + 0.7) / teeth) * Math.PI * 2;

            const innerRadius = radius * 0.7;
            const outerRadius = radius;

            if (i === 0) {
                ctx.moveTo(Math.cos(angle1) * innerRadius, Math.sin(angle1) * innerRadius);
            }

            ctx.lineTo(Math.cos(angle2) * innerRadius, Math.sin(angle2) * innerRadius);
            ctx.lineTo(Math.cos(angle2) * outerRadius, Math.sin(angle2) * outerRadius);
            ctx.lineTo(Math.cos(angle4) * outerRadius, Math.sin(angle4) * outerRadius);
            ctx.lineTo(Math.cos(angle4) * innerRadius, Math.sin(angle4) * innerRadius);
        }

        ctx.closePath();
        ctx.fill();

        // 中心孔
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawWindIndicator() {
        const ctx = this.ctx;
        const x = 50;
        const y = this.height - 60;
        const width = 100;
        const height = 20;

        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 5);
        ctx.fill();

        // 發條能量條
        const energyWidth = (this.windUp / 100) * (width - 4);
        const energyGradient = ctx.createLinearGradient(x, 0, x + width, 0);
        energyGradient.addColorStop(0, '#ff4444');
        energyGradient.addColorStop(0.5, '#ffaa00');
        energyGradient.addColorStop(1, '#44ff44');

        ctx.fillStyle = energyGradient;
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, energyWidth, height - 4, 3);
        ctx.fill();

        // 標籤
        ctx.fillStyle = '#FFD700';
        ctx.font = '12px Arial';
        ctx.fillText('發條', x, y - 5);
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// 初始化
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    new MusicBox(canvas);
});
