/**
 * White Noise 白噪音 - Web Toys #094
 * 產生各種類型的噪音
 */

class WhiteNoiseApp {
    constructor() {
        this.canvas = document.getElementById('noiseCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 音頻上下文
        this.audioContext = null;
        this.noiseNode = null;
        this.gainNode = null;
        this.lowFilter = null;
        this.highFilter = null;
        this.analyser = null;

        // 狀態
        this.isPlaying = false;
        this.noiseType = 'white';
        this.lowcut = 20;
        this.highcut = 20000;
        this.volume = 0.3;

        // 視覺效果
        this.animationId = null;
        this.frequencyData = new Uint8Array(128);
        this.noisePixels = [];

        this.init();
    }

    async init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.setupControls();
        this.setupEventListeners();
        this.initNoisePixels();
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.initNoisePixels();
    }

    initNoisePixels() {
        this.noisePixels = [];
        const density = 3000;
        for (let i = 0; i < density; i++) {
            this.noisePixels.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 2 + 0.5
            });
        }
    }

    async initAudio() {
        if (this.audioContext) return;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // 創建噪音節點
        this.createNoiseNode();

        // 濾波器
        this.lowFilter = this.audioContext.createBiquadFilter();
        this.lowFilter.type = 'highpass';
        this.lowFilter.frequency.value = this.lowcut;

        this.highFilter = this.audioContext.createBiquadFilter();
        this.highFilter.type = 'lowpass';
        this.highFilter.frequency.value = this.highcut;

        // 增益
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = this.volume;

        // 分析器
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;

        // 連接
        this.noiseNode.connect(this.lowFilter);
        this.lowFilter.connect(this.highFilter);
        this.highFilter.connect(this.gainNode);
        this.gainNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
    }

    createNoiseNode() {
        const bufferSize = 2 * this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        switch (this.noiseType) {
            case 'white':
                this.generateWhiteNoise(data);
                break;
            case 'pink':
                this.generatePinkNoise(data);
                break;
            case 'brown':
                this.generateBrownNoise(data);
                break;
            case 'blue':
                this.generateBlueNoise(data);
                break;
        }

        this.noiseNode = this.audioContext.createBufferSource();
        this.noiseNode.buffer = buffer;
        this.noiseNode.loop = true;
    }

    generateWhiteNoise(data) {
        for (let i = 0; i < data.length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
    }

    generatePinkNoise(data) {
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < data.length; i++) {
            const white = Math.random() * 2 - 1;

            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;

            data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;
        }
    }

    generateBrownNoise(data) {
        let lastOut = 0;

        for (let i = 0; i < data.length; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5;
        }
    }

    generateBlueNoise(data) {
        let lastOut = 0;

        for (let i = 0; i < data.length; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = white - lastOut;
            lastOut = white;
            data[i] *= 0.5;
        }
    }

    setupControls() {
        // 播放按鈕
        const playBtn = document.getElementById('playBtn');
        playBtn.addEventListener('click', () => this.togglePlay());

        // 噪音類型
        const noiseTypeSelect = document.getElementById('noiseType');
        noiseTypeSelect.addEventListener('change', (e) => {
            this.noiseType = e.target.value;
            this.updateTypeDisplay();
            if (this.isPlaying) {
                this.restart();
            }
        });

        // 低頻截止
        const lowcutSlider = document.getElementById('lowcut');
        lowcutSlider.addEventListener('input', (e) => {
            this.lowcut = parseInt(e.target.value);
            document.getElementById('lowcutValue').textContent = this.lowcut;
            if (this.lowFilter) {
                this.lowFilter.frequency.setTargetAtTime(this.lowcut, this.audioContext.currentTime, 0.01);
            }
        });

        // 高頻截止
        const highcutSlider = document.getElementById('highcut');
        highcutSlider.addEventListener('input', (e) => {
            this.highcut = parseInt(e.target.value);
            document.getElementById('highcutValue').textContent = this.highcut;
            if (this.highFilter) {
                this.highFilter.frequency.setTargetAtTime(this.highcut, this.audioContext.currentTime, 0.01);
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
            }
        });
    }

    updateTypeDisplay() {
        const labels = {
            white: '白噪音',
            pink: '粉紅噪音',
            brown: '棕噪音',
            blue: '藍噪音'
        };
        document.getElementById('typeDisplay').textContent = labels[this.noiseType];
    }

    async togglePlay() {
        if (this.isPlaying) {
            this.stop();
        } else {
            await this.start();
        }
    }

    async start() {
        await this.initAudio();

        this.noiseNode.start();
        this.isPlaying = true;

        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = '停止';
        playBtn.classList.add('playing');
        document.getElementById('statusDisplay').textContent = '播放中';
    }

    stop() {
        if (this.noiseNode) {
            this.noiseNode.stop();
            this.noiseNode = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        this.isPlaying = false;

        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = '播放';
        playBtn.classList.remove('playing');
        document.getElementById('statusDisplay').textContent = '停止';
    }

    async restart() {
        this.stop();
        await this.start();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawBackground();
        this.drawNoiseVisual();
        this.drawSpectrum();
        this.updateNoisePixels();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawBackground() {
        const ctx = this.ctx;

        // 根據噪音類型改變背景顏色
        let bgColor;
        switch (this.noiseType) {
            case 'white':
                bgColor = '#0a0a0a';
                break;
            case 'pink':
                bgColor = '#100808';
                break;
            case 'brown':
                bgColor = '#0a0805';
                break;
            case 'blue':
                bgColor = '#080810';
                break;
            default:
                bgColor = '#0a0a0a';
        }

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawNoiseVisual() {
        const ctx = this.ctx;

        // 噪點動畫
        const intensity = this.isPlaying ? 0.3 + this.volume * 0.5 : 0.1;

        for (const pixel of this.noisePixels) {
            const alpha = this.isPlaying
                ? Math.random() * intensity
                : 0.05;

            let color;
            switch (this.noiseType) {
                case 'white':
                    color = `rgba(255, 255, 255, ${alpha})`;
                    break;
                case 'pink':
                    color = `rgba(255, 180, 200, ${alpha})`;
                    break;
                case 'brown':
                    color = `rgba(200, 150, 100, ${alpha})`;
                    break;
                case 'blue':
                    color = `rgba(150, 180, 255, ${alpha})`;
                    break;
                default:
                    color = `rgba(255, 255, 255, ${alpha})`;
            }

            ctx.fillStyle = color;
            ctx.fillRect(pixel.x, pixel.y, pixel.size, pixel.size);
        }
    }

    drawSpectrum() {
        if (!this.analyser || !this.isPlaying) return;

        const ctx = this.ctx;
        this.analyser.getByteFrequencyData(this.frequencyData);

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.25;

        // 圓形頻譜
        ctx.beginPath();
        for (let i = 0; i < this.frequencyData.length; i++) {
            const angle = (i / this.frequencyData.length) * Math.PI * 2 - Math.PI / 2;
            const amp = this.frequencyData[i] / 255;
            const r = radius + amp * 100;

            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();

        let strokeColor;
        switch (this.noiseType) {
            case 'white': strokeColor = 'rgba(255, 255, 255, 0.5)'; break;
            case 'pink': strokeColor = 'rgba(255, 150, 180, 0.5)'; break;
            case 'brown': strokeColor = 'rgba(200, 140, 80, 0.5)'; break;
            case 'blue': strokeColor = 'rgba(100, 150, 255, 0.5)'; break;
        }

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // 中心圓
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 20, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.stroke();

        // 噪音類型標籤
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const labels = {
            white: 'WHITE',
            pink: 'PINK',
            brown: 'BROWN',
            blue: 'BLUE'
        };
        ctx.fillText(labels[this.noiseType], centerX, centerY - 15);
        ctx.font = '14px Arial';
        ctx.fillText('NOISE', centerX, centerY + 15);
    }

    updateNoisePixels() {
        if (!this.isPlaying) return;

        for (const pixel of this.noisePixels) {
            // 隨機移動
            pixel.x += (Math.random() - 0.5) * pixel.speed * 3;
            pixel.y += (Math.random() - 0.5) * pixel.speed * 3;

            // 邊界處理
            if (pixel.x < 0) pixel.x = this.canvas.width;
            if (pixel.x > this.canvas.width) pixel.x = 0;
            if (pixel.y < 0) pixel.y = this.canvas.height;
            if (pixel.y > this.canvas.height) pixel.y = 0;
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.stop();
    }
}

// 啟動應用
document.addEventListener('DOMContentLoaded', () => {
    new WhiteNoiseApp();
});
