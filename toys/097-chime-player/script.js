/**
 * Chime Player 風鈴播放器 - Web Toys #097
 * 模擬不同材質的風鈴音效
 */

class ChimePlayerApp {
    constructor() {
        this.canvas = document.getElementById('chimeCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 音頻
        this.audioContext = null;
        this.masterGain = null;
        this.convolver = null;

        // 設定
        this.material = 'metal';
        this.tuning = 'pentatonic';
        this.windSpeed = 0.3;
        this.chimeCount = 5;
        this.volume = 0.5;

        // 風鈴
        this.chimes = [];
        this.windAngle = 0;
        this.time = 0;

        // 材質設定
        this.materialSettings = {
            metal: {
                color: '#c0c8d0',
                highlightColor: '#e8f0f8',
                decay: 3,
                harmonics: [1, 2, 3, 4.5, 6],
                brightness: 0.8,
                name: '金屬'
            },
            bamboo: {
                color: '#8b7355',
                highlightColor: '#c4a77d',
                decay: 0.8,
                harmonics: [1, 2.3, 3.5],
                brightness: 0.3,
                name: '竹子'
            },
            glass: {
                color: '#a0d8e8',
                highlightColor: '#e0f4ff',
                decay: 4,
                harmonics: [1, 2, 4, 6],
                brightness: 1,
                name: '玻璃'
            },
            ceramic: {
                color: '#d4c4b0',
                highlightColor: '#f0e8dc',
                decay: 1.5,
                harmonics: [1, 1.5, 2.8, 4],
                brightness: 0.5,
                name: '陶瓷'
            },
            shell: {
                color: '#e8d8c8',
                highlightColor: '#fff8f0',
                decay: 2,
                harmonics: [1, 2.2, 3.7, 5.2],
                brightness: 0.6,
                name: '貝殼'
            }
        };

        // 音階設定
        this.tuningSettings = {
            pentatonic: {
                intervals: [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26],
                name: '五聲音階'
            },
            major: {
                intervals: [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19],
                name: '大調'
            },
            minor: {
                intervals: [0, 2, 3, 5, 7, 8, 10, 12, 14, 15, 17, 19],
                name: '小調'
            },
            japanese: {
                intervals: [0, 1, 5, 7, 8, 12, 13, 17, 19, 20, 24, 25],
                name: '日本音階'
            },
            random: {
                intervals: [0, 3, 5, 6, 9, 11, 12, 15, 17, 18, 21, 23],
                name: '隨機'
            }
        };

        this.init();
    }

    async init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.setupControls();
        this.setupEventListeners();
        this.createChimes();
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.createChimes();
    }

    async initAudio() {
        if (this.audioContext) return;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // 殘響
        this.convolver = this.audioContext.createConvolver();
        await this.createReverb();

        this.wetGain = this.audioContext.createGain();
        this.wetGain.gain.value = 0.4;

        this.dryGain = this.audioContext.createGain();
        this.dryGain.gain.value = 0.6;

        // 主音量
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = this.volume;

        // 連接
        this.convolver.connect(this.wetGain);
        this.wetGain.connect(this.masterGain);
        this.dryGain.connect(this.masterGain);
        this.masterGain.connect(this.audioContext.destination);
    }

    async createReverb() {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * 3;
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const data = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const t = i / sampleRate;
                data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 2);
            }
        }

        this.convolver.buffer = impulse;
    }

    createChimes() {
        this.chimes = [];
        const spacing = this.canvas.width / (this.chimeCount + 1);
        const startY = 80;
        const intervals = this.tuningSettings[this.tuning].intervals;

        for (let i = 0; i < this.chimeCount; i++) {
            const interval = intervals[i % intervals.length];
            const baseNote = 72 + interval; // C5 開始

            this.chimes.push({
                x: spacing * (i + 1),
                y: startY,
                length: 60 + (this.chimeCount - i) * 15,
                width: 8 + Math.random() * 4,
                angle: 0,
                velocity: 0,
                note: baseNote,
                lastPlay: 0,
                index: i
            });
        }
    }

    setupControls() {
        // 材質
        const materialSelect = document.getElementById('material');
        materialSelect.addEventListener('change', (e) => {
            this.material = e.target.value;
            this.updateDisplays();
        });

        // 音調
        const tuningSelect = document.getElementById('tuning');
        tuningSelect.addEventListener('change', (e) => {
            this.tuning = e.target.value;
            this.createChimes();
            this.updateDisplays();
        });

        // 風速
        const windSpeedSlider = document.getElementById('windSpeed');
        windSpeedSlider.addEventListener('input', (e) => {
            this.windSpeed = parseInt(e.target.value) / 100;
            document.getElementById('windSpeedValue').textContent = this.getWindLabel(this.windSpeed);
        });

        // 風鈴數量
        const chimeCountSlider = document.getElementById('chimeCount');
        chimeCountSlider.addEventListener('input', (e) => {
            this.chimeCount = parseInt(e.target.value);
            document.getElementById('chimeCountValue').textContent = this.chimeCount;
            this.createChimes();
        });

        // 音量
        const volumeSlider = document.getElementById('volume');
        volumeSlider.addEventListener('input', (e) => {
            this.volume = parseInt(e.target.value) / 100;
            document.getElementById('volumeValue').textContent = e.target.value;
            if (this.masterGain) {
                this.masterGain.gain.setTargetAtTime(this.volume, this.audioContext.currentTime, 0.1);
            }
        });
    }

    getWindLabel(speed) {
        if (speed < 0.2) return '靜止';
        if (speed < 0.4) return '微風';
        if (speed < 0.6) return '輕風';
        if (speed < 0.8) return '和風';
        return '強風';
    }

    updateDisplays() {
        document.getElementById('materialDisplay').textContent = this.materialSettings[this.material].name;
        document.getElementById('tuningDisplay').textContent = this.tuningSettings[this.tuning].name;
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.handleClick({ clientX: touch.clientX, clientY: touch.clientY });
        });
    }

    async handleClick(e) {
        await this.initAudio();

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 檢查是否點擊到風鈴
        for (const chime of this.chimes) {
            const chimeBottom = chime.y + chime.length;
            if (Math.abs(x - chime.x) < 30 && y > chime.y && y < chimeBottom + 50) {
                this.strikeChime(chime, 1);
                break;
            }
        }
    }

    async strikeChime(chime, intensity) {
        await this.initAudio();

        const now = this.audioContext.currentTime;
        if (now - chime.lastPlay < 0.1) return;
        chime.lastPlay = now;

        // 擺動
        chime.velocity = (Math.random() - 0.5) * 0.3 * intensity;

        const settings = this.materialSettings[this.material];
        const freq = this.midiToFreq(chime.note);

        // 創建多泛音
        for (let i = 0; i < settings.harmonics.length; i++) {
            const harmonic = settings.harmonics[i];
            const gain = intensity * 0.15 / (i + 1);

            this.playTone(freq * harmonic, gain, settings.decay, settings.brightness);
        }
    }

    playTone(freq, gain, decay, brightness) {
        const now = this.audioContext.currentTime;

        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;

        // 濾波器增加亮度
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 200 + brightness * 500;
        filter.Q.value = 0.5;

        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(gain, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + decay);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.dryGain);
        gainNode.connect(this.convolver);

        osc.start(now);
        osc.stop(now + decay + 0.1);
    }

    midiToFreq(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    updateWind() {
        this.windAngle += 0.02;
        const windForce = Math.sin(this.windAngle) * this.windSpeed * 0.02;
        const gustForce = Math.sin(this.windAngle * 3.7) * this.windSpeed * 0.01;

        for (const chime of this.chimes) {
            // 風力影響
            chime.velocity += (windForce + gustForce) * (1 + chime.index * 0.1);

            // 重力恢復
            chime.velocity -= chime.angle * 0.02;

            // 阻尼
            chime.velocity *= 0.98;

            // 更新角度
            chime.angle += chime.velocity;

            // 限制擺動範圍
            const maxAngle = 0.5;
            if (Math.abs(chime.angle) > maxAngle) {
                chime.angle = Math.sign(chime.angle) * maxAngle;
                chime.velocity *= -0.5;
            }

            // 隨機觸發（風吹）
            if (this.windSpeed > 0.2 && Math.random() < this.windSpeed * 0.005) {
                this.strikeChime(chime, this.windSpeed * 0.7);
            }

            // 碰撞檢測（相鄰風鈴）
            const chimeIndex = this.chimes.indexOf(chime);
            if (chimeIndex > 0) {
                const prevChime = this.chimes[chimeIndex - 1];
                const distance = Math.abs(chime.x + Math.sin(chime.angle) * chime.length -
                    (prevChime.x + Math.sin(prevChime.angle) * prevChime.length));

                if (distance < 15 && Math.abs(chime.velocity - prevChime.velocity) > 0.02) {
                    this.strikeChime(chime, 0.5);
                    this.strikeChime(prevChime, 0.5);

                    // 交換速度
                    const temp = chime.velocity;
                    chime.velocity = prevChime.velocity * 0.8;
                    prevChime.velocity = temp * 0.8;
                }
            }
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.time += 0.016;
        this.updateWind();
        this.drawBackground();
        this.drawWindIndicator();
        this.drawChimes();

        requestAnimationFrame(() => this.animate());
    }

    drawBackground() {
        const ctx = this.ctx;

        // 漸層背景
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0a1520');
        gradient.addColorStop(0.5, '#152030');
        gradient.addColorStop(1, '#0a1015');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 星星
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 50; i++) {
            const x = (i * 137.5) % this.canvas.width;
            const y = (i * 73.7) % (this.canvas.height * 0.6);
            const twinkle = Math.sin(this.time * 2 + i) * 0.5 + 0.5;
            ctx.globalAlpha = 0.2 + twinkle * 0.3;
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    drawWindIndicator() {
        if (this.windSpeed < 0.1) return;

        const ctx = this.ctx;
        const windDir = Math.sin(this.windAngle);

        // 風的線條
        ctx.strokeStyle = `rgba(200, 180, 140, ${this.windSpeed * 0.2})`;
        ctx.lineWidth = 1;

        for (let i = 0; i < 10; i++) {
            const x = ((this.time * 100 * this.windSpeed + i * 150) % (this.canvas.width + 200)) - 100;
            const y = 100 + i * 50 + Math.sin(this.time + i) * 20;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.bezierCurveTo(
                x + 30 + windDir * 20, y - 5,
                x + 60 + windDir * 30, y + 5,
                x + 100, y
            );
            ctx.stroke();
        }
    }

    drawChimes() {
        const ctx = this.ctx;
        const settings = this.materialSettings[this.material];

        // 頂部橫樑
        const beamY = 60;
        ctx.fillStyle = '#4a3a2a';
        ctx.fillRect(this.canvas.width * 0.1, beamY - 8, this.canvas.width * 0.8, 16);

        // 木紋
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(this.canvas.width * 0.1, beamY - 6 + i * 3);
            ctx.lineTo(this.canvas.width * 0.9, beamY - 6 + i * 3);
            ctx.stroke();
        }

        for (const chime of this.chimes) {
            this.drawChime(chime, settings);
        }
    }

    drawChime(chime, settings) {
        const ctx = this.ctx;

        ctx.save();
        ctx.translate(chime.x, chime.y);
        ctx.rotate(chime.angle);

        // 繩子
        ctx.strokeStyle = '#8b7355';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(0, 0);
        ctx.stroke();

        // 風鈴管身
        const gradient = ctx.createLinearGradient(-chime.width / 2, 0, chime.width / 2, 0);
        gradient.addColorStop(0, settings.color);
        gradient.addColorStop(0.3, settings.highlightColor);
        gradient.addColorStop(0.7, settings.color);
        gradient.addColorStop(1, this.darkenColor(settings.color, 30));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(-chime.width / 2, 0, chime.width, chime.length, 3);
        ctx.fill();

        // 高光
        ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.abs(Math.sin(chime.angle * 3)) * 0.2})`;
        ctx.beginPath();
        ctx.roundRect(-chime.width / 2 + 1, 2, 3, chime.length - 4, 1);
        ctx.fill();

        // 底部敲擊片
        ctx.fillStyle = settings.color;
        ctx.beginPath();
        ctx.ellipse(0, chime.length + 15, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // 懸掛絲線
        ctx.strokeStyle = '#8b7355';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, chime.length);
        ctx.lineTo(0, chime.length + 15);
        ctx.stroke();

        ctx.restore();
    }

    darkenColor(hex, amount) {
        const num = parseInt(hex.slice(1), 16);
        const r = Math.max(0, (num >> 16) - amount);
        const g = Math.max(0, ((num >> 8) & 0xFF) - amount);
        const b = Math.max(0, (num & 0xFF) - amount);
        return `rgb(${r}, ${g}, ${b})`;
    }

    destroy() {
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// 啟動應用
document.addEventListener('DOMContentLoaded', () => {
    new ChimePlayerApp();
});
