/**
 * Particle Image 粒子圖像
 * 粒子系統 #8 - 圖片轉粒子互動
 *
 * 功能：
 * - 圖片上傳或預設圖像
 * - 像素採樣生成粒子
 * - 滑鼠推開粒子
 * - 彈簧物理復原
 */

(function() {
    'use strict';

    // 畫布設置
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // 離屏畫布用於圖像處理
    const offCanvas = document.createElement('canvas');
    const offCtx = offCanvas.getContext('2d');

    // 狀態管理
    const state = {
        density: 4,           // 採樣密度（越小粒子越多）
        particleSize: 3,      // 粒子大小
        mouseRadius: 100,     // 滑鼠影響半徑
        force: 5,             // 推力強度
        returnSpeed: 0.05,    // 回復速度（彈簧係數）
        friction: 0.85,       // 阻尼係數
        colorful: true,       // 保持原色
        monoColor: '#00ffff', // 單色色調
        currentPreset: 'heart'
    };

    // 滑鼠狀態
    const mouse = {
        x: -1000,
        y: -1000,
        active: false
    };

    // 粒子陣列
    let particles = [];

    /**
     * 粒子類別
     * 使用彈簧物理進行位置復原
     */
    class Particle {
        constructor(x, y, color) {
            // 目標位置（原始位置）
            this.originX = x;
            this.originY = y;

            // 當前位置
            this.x = x;
            this.y = y;

            // 速度
            this.vx = 0;
            this.vy = 0;

            // 顏色
            this.color = color;

            // 隨機偏移用於視覺變化
            this.size = state.particleSize * (0.8 + Math.random() * 0.4);
        }

        /**
         * 更新粒子位置
         * 使用彈簧阻尼系統：F = -k(x-x0) - cv
         */
        update() {
            // 計算與滑鼠的距離
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // 如果在影響範圍內，施加推力
            if (dist < state.mouseRadius && mouse.active) {
                const force = (state.mouseRadius - dist) / state.mouseRadius;
                const angle = Math.atan2(dy, dx);

                // 反方向推開
                this.vx -= Math.cos(angle) * force * state.force;
                this.vy -= Math.sin(angle) * force * state.force;
            }

            // 彈簧力：朝向原始位置
            const springX = (this.originX - this.x) * state.returnSpeed;
            const springY = (this.originY - this.y) * state.returnSpeed;

            // 加入彈簧力
            this.vx += springX;
            this.vy += springY;

            // 阻尼
            this.vx *= state.friction;
            this.vy *= state.friction;

            // 更新位置
            this.x += this.vx;
            this.y += this.vy;
        }

        /**
         * 繪製粒子
         */
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = state.colorful ? this.color : state.monoColor;
            ctx.fill();
        }
    }

    /**
     * 調整畫布大小
     */
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    /**
     * 從圖像數據創建粒子
     */
    function createParticlesFromImage(imageData, offsetX, offsetY) {
        particles = [];
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const gap = state.density;

        for (let y = 0; y < height; y += gap) {
            for (let x = 0; x < width; x += gap) {
                const index = (y * width + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3];

                // 只處理不透明的像素
                if (a > 128) {
                    const color = `rgb(${r}, ${g}, ${b})`;
                    const px = offsetX + x;
                    const py = offsetY + y;
                    particles.push(new Particle(px, py, color));
                }
            }
        }

        updateParticleCount();
    }

    /**
     * 更新粒子數量顯示
     */
    function updateParticleCount() {
        let countDisplay = document.querySelector('.particle-count');
        if (!countDisplay) {
            countDisplay = document.createElement('div');
            countDisplay.className = 'particle-count';
            document.body.appendChild(countDisplay);
        }
        countDisplay.innerHTML = `粒子數: <span>${particles.length.toLocaleString()}</span>`;
    }

    /**
     * 載入並處理用戶上傳的圖片
     */
    function loadImage(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                processImage(img);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    /**
     * 處理圖片並生成粒子
     */
    function processImage(img) {
        // 計算適合畫布的尺寸
        const maxWidth = canvas.width * 0.6;
        const maxHeight = canvas.height * 0.6;
        let width = img.width;
        let height = img.height;

        // 縮放以適應畫布
        if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        }
        if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
        }

        // 設置離屏畫布
        offCanvas.width = width;
        offCanvas.height = height;
        offCtx.clearRect(0, 0, width, height);
        offCtx.drawImage(img, 0, 0, width, height);

        // 獲取圖像數據
        const imageData = offCtx.getImageData(0, 0, width, height);

        // 計算居中偏移
        const offsetX = (canvas.width - width) / 2;
        const offsetY = (canvas.height - height) / 2;

        createParticlesFromImage(imageData, offsetX, offsetY);
    }

    /**
     * 生成預設圖像
     */
    function generatePresetImage(preset) {
        const size = Math.min(canvas.width, canvas.height) * 0.5;
        offCanvas.width = size;
        offCanvas.height = size;
        offCtx.clearRect(0, 0, size, size);

        const cx = size / 2;
        const cy = size / 2;

        switch (preset) {
            case 'heart':
                drawHeart(cx, cy, size * 0.4);
                break;
            case 'star':
                drawStar(cx, cy, size * 0.4, 5);
                break;
            case 'spiral':
                drawSpiral(cx, cy, size * 0.4);
                break;
            case 'wave':
                drawWave(size);
                break;
        }

        const imageData = offCtx.getImageData(0, 0, size, size);
        const offsetX = (canvas.width - size) / 2;
        const offsetY = (canvas.height - size) / 2;
        createParticlesFromImage(imageData, offsetX, offsetY);
    }

    /**
     * 繪製愛心
     */
    function drawHeart(cx, cy, scale) {
        offCtx.save();
        offCtx.translate(cx, cy);

        // 使用漸層填充
        const gradient = offCtx.createRadialGradient(0, 0, 0, 0, 0, scale);
        gradient.addColorStop(0, '#ff6b9d');
        gradient.addColorStop(0.5, '#ff4081');
        gradient.addColorStop(1, '#e91e63');
        offCtx.fillStyle = gradient;

        offCtx.beginPath();
        for (let t = 0; t < Math.PI * 2; t += 0.01) {
            // 心形參數方程
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

            if (t === 0) {
                offCtx.moveTo(x * scale / 16, y * scale / 16);
            } else {
                offCtx.lineTo(x * scale / 16, y * scale / 16);
            }
        }
        offCtx.closePath();
        offCtx.fill();
        offCtx.restore();
    }

    /**
     * 繪製星星
     */
    function drawStar(cx, cy, radius, points) {
        const gradient = offCtx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, '#ffeb3b');
        gradient.addColorStop(0.5, '#ffc107');
        gradient.addColorStop(1, '#ff9800');
        offCtx.fillStyle = gradient;

        offCtx.beginPath();
        const innerRadius = radius * 0.4;
        for (let i = 0; i < points * 2; i++) {
            const r = i % 2 === 0 ? radius : innerRadius;
            const angle = (i * Math.PI) / points - Math.PI / 2;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if (i === 0) {
                offCtx.moveTo(x, y);
            } else {
                offCtx.lineTo(x, y);
            }
        }
        offCtx.closePath();
        offCtx.fill();
    }

    /**
     * 繪製螺旋
     */
    function drawSpiral(cx, cy, maxRadius) {
        const turns = 4;
        const pointsPerTurn = 100;
        const totalPoints = turns * pointsPerTurn;

        for (let i = 0; i < totalPoints; i++) {
            const t = i / pointsPerTurn;
            const angle = t * Math.PI * 2;
            const radius = (i / totalPoints) * maxRadius;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;

            // 漸變顏色
            const hue = (i / totalPoints) * 360;
            offCtx.fillStyle = `hsl(${hue}, 80%, 60%)`;

            const dotSize = 3 + (i / totalPoints) * 8;
            offCtx.beginPath();
            offCtx.arc(x, y, dotSize, 0, Math.PI * 2);
            offCtx.fill();
        }
    }

    /**
     * 繪製波浪
     */
    function drawWave(size) {
        const waves = 5;
        const amplitude = size / 8;

        for (let w = 0; w < waves; w++) {
            const y = (w + 0.5) * (size / waves);
            const hue = (w / waves) * 180 + 180;

            offCtx.strokeStyle = `hsl(${hue}, 70%, 60%)`;
            offCtx.lineWidth = 15;
            offCtx.lineCap = 'round';

            offCtx.beginPath();
            for (let x = 0; x < size; x += 2) {
                const waveY = y + Math.sin((x / size) * Math.PI * 4 + w) * amplitude;
                if (x === 0) {
                    offCtx.moveTo(x, waveY);
                } else {
                    offCtx.lineTo(x, waveY);
                }
            }
            offCtx.stroke();
        }
    }

    /**
     * 重置粒子位置
     */
    function resetParticles() {
        for (const particle of particles) {
            particle.x = particle.originX;
            particle.y = particle.originY;
            particle.vx = 0;
            particle.vy = 0;
        }
    }

    /**
     * 動畫循環
     */
    function animate() {
        // 半透明清除產生拖尾效果
        ctx.fillStyle = 'rgba(10, 10, 15, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 更新並繪製所有粒子
        for (const particle of particles) {
            particle.update();
            particle.size = state.particleSize * (0.8 + Math.random() * 0.4);
            particle.draw();
        }

        requestAnimationFrame(animate);
    }

    /**
     * 綁定控制項事件
     */
    function bindControls() {
        // 檔案上傳
        const imageInput = document.getElementById('imageInput');
        const uploadBtn = document.getElementById('uploadBtn');

        uploadBtn.addEventListener('click', () => imageInput.click());
        imageInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                loadImage(e.target.files[0]);
                // 取消預設按鈕選中狀態
                document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
            }
        });

        // 預設圖像按鈕
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.currentPreset = btn.dataset.preset;
                generatePresetImage(state.currentPreset);
            });
        });

        // 數值滑桿
        const controls = [
            { id: 'density', prop: 'density', valueId: 'densityValue', regenerate: true },
            { id: 'particleSize', prop: 'particleSize', valueId: 'particleSizeValue' },
            { id: 'mouseRadius', prop: 'mouseRadius', valueId: 'mouseRadiusValue' },
            { id: 'force', prop: 'force', valueId: 'forceValue' },
            { id: 'returnSpeed', prop: 'returnSpeed', valueId: 'returnSpeedValue' },
            { id: 'friction', prop: 'friction', valueId: 'frictionValue' }
        ];

        controls.forEach(ctrl => {
            const input = document.getElementById(ctrl.id);
            const valueDisplay = document.getElementById(ctrl.valueId);

            input.addEventListener('input', () => {
                state[ctrl.prop] = parseFloat(input.value);
                valueDisplay.textContent = input.value;

                // 如果需要重新生成粒子
                if (ctrl.regenerate) {
                    generatePresetImage(state.currentPreset);
                }
            });
        });

        // 顏色選項
        document.getElementById('colorful').addEventListener('change', (e) => {
            state.colorful = e.target.checked;
        });

        document.getElementById('monoColor').addEventListener('input', (e) => {
            state.monoColor = e.target.value;
        });

        // 重置按鈕
        document.getElementById('resetBtn').addEventListener('click', resetParticles);
    }

    /**
     * 綁定滑鼠事件
     */
    function bindMouseEvents() {
        canvas.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            mouse.active = true;
        });

        canvas.addEventListener('mouseleave', () => {
            mouse.active = false;
        });

        canvas.addEventListener('mouseenter', () => {
            mouse.active = true;
        });

        // 觸控支援
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            mouse.x = touch.clientX;
            mouse.y = touch.clientY;
            mouse.active = true;
        }, { passive: false });

        canvas.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            mouse.x = touch.clientX;
            mouse.y = touch.clientY;
            mouse.active = true;
        });

        canvas.addEventListener('touchend', () => {
            mouse.active = false;
        });
    }

    /**
     * 視窗大小改變時重新生成
     */
    function handleResize() {
        resizeCanvas();
        generatePresetImage(state.currentPreset);
    }

    /**
     * 初始化
     */
    function init() {
        resizeCanvas();
        bindControls();
        bindMouseEvents();

        window.addEventListener('resize', handleResize);

        // 生成預設的愛心圖像
        generatePresetImage('heart');

        // 啟動動畫
        animate();
    }

    // 啟動應用
    init();
})();
