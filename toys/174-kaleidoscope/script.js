/**
 * 萬花筒 - Kaleidoscope
 * 模擬萬花筒的對稱圖案效果
 */

class KaleidoscopeElement {
    constructor(x, y, type, color, size) {
        this.x = x;
        this.y = y;
        this.type = type; // 'circle', 'triangle', 'diamond', 'star'
        this.color = color;
        this.size = size;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.02 + Math.random() * 0.02;
    }

    update() {
        this.rotation += this.rotationSpeed;
        this.pulsePhase += this.pulseSpeed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const pulse = 1 + Math.sin(this.pulsePhase) * 0.1;
        const size = this.size * pulse;

        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;

        switch (this.type) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(0, 0, size, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'triangle':
                ctx.beginPath();
                for (let i = 0; i < 3; i++) {
                    const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
                    const x = Math.cos(angle) * size;
                    const y = Math.sin(angle) * size;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();
                break;

            case 'diamond':
                ctx.beginPath();
                ctx.moveTo(0, -size);
                ctx.lineTo(size * 0.6, 0);
                ctx.lineTo(0, size);
                ctx.lineTo(-size * 0.6, 0);
                ctx.closePath();
                ctx.fill();
                break;

            case 'star':
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const outerAngle = (i / 5) * Math.PI * 2 - Math.PI / 2;
                    const innerAngle = ((i + 0.5) / 5) * Math.PI * 2 - Math.PI / 2;
                    const outerX = Math.cos(outerAngle) * size;
                    const outerY = Math.sin(outerAngle) * size;
                    const innerX = Math.cos(innerAngle) * size * 0.4;
                    const innerY = Math.sin(innerAngle) * size * 0.4;

                    if (i === 0) ctx.moveTo(outerX, outerY);
                    else ctx.lineTo(outerX, outerY);
                    ctx.lineTo(innerX, innerY);
                }
                ctx.closePath();
                ctx.fill();
                break;

            case 'ring':
                ctx.beginPath();
                ctx.arc(0, 0, size, 0, Math.PI * 2);
                ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2, true);
                ctx.fill();
                break;

            case 'hexagon':
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const x = Math.cos(angle) * size;
                    const y = Math.sin(angle) * size;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();
                break;
        }

        ctx.restore();
    }
}

class Kaleidoscope {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.elements = [];
        this.segments = 6;
        this.speed = 30;
        this.zoom = 100;
        this.rotation = 0;
        this.hueOffset = 0;
        this.mousePos = null;

        this.resize();
        this.init();
        this.bindEvents();
        this.animate();
    }

    resize() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        const size = Math.min(rect.width, rect.height);
        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = size * dpr;
        this.canvas.height = size * dpr;
        this.ctx.scale(dpr, dpr);

        this.width = size;
        this.height = size;
        this.centerX = size / 2;
        this.centerY = size / 2;
        this.radius = size / 2;
    }

    init() {
        this.elements = [];
        this.generateElements();
    }

    generateElements() {
        const types = ['circle', 'triangle', 'diamond', 'star', 'ring', 'hexagon'];
        const elementCount = 15 + Math.floor(Math.random() * 10);

        for (let i = 0; i < elementCount; i++) {
            // 在一個扇形區域內生成元素
            const angle = Math.random() * (Math.PI / this.segments);
            const dist = 20 + Math.random() * (this.radius * 0.7);
            const x = Math.cos(angle) * dist;
            const y = Math.sin(angle) * dist;

            const type = types[Math.floor(Math.random() * types.length)];
            const hue = (this.hueOffset + Math.random() * 60) % 360;
            const saturation = 70 + Math.random() * 30;
            const lightness = 50 + Math.random() * 20;
            const alpha = 0.6 + Math.random() * 0.4;
            const color = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
            const size = 5 + Math.random() * 20;

            this.elements.push(new KaleidoscopeElement(x, y, type, color, size));
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
        });

        // 滑鼠移動影響圖案
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePos = {
                x: e.clientX - rect.left - this.centerX,
                y: e.clientY - rect.top - this.centerY
            };
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mousePos = null;
        });

        // 觸控
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.mousePos = {
                x: touch.clientX - rect.left - this.centerX,
                y: touch.clientY - rect.top - this.centerY
            };
        });

        this.canvas.addEventListener('touchend', () => {
            this.mousePos = null;
        });

        // 控制項
        document.getElementById('segments').addEventListener('input', (e) => {
            this.segments = parseInt(e.target.value);
            document.getElementById('segmentsValue').textContent = this.segments;
            this.init();
        });

        document.getElementById('speed').addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            document.getElementById('speedValue').textContent = this.speed;
        });

        document.getElementById('zoom').addEventListener('input', (e) => {
            this.zoom = parseInt(e.target.value);
            document.getElementById('zoomValue').textContent = this.zoom + '%';
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.rotation = 0;
            this.init();
        });

        document.getElementById('randomBtn').addEventListener('click', () => {
            this.hueOffset = Math.random() * 360;
            this.init();
        });

        document.getElementById('colorBtn').addEventListener('click', () => {
            this.hueOffset = (this.hueOffset + 60) % 360;
            this.init();
        });
    }

    update() {
        // 更新旋轉
        this.rotation += this.speed * 0.0001;

        // 更新元素
        this.elements.forEach(elem => elem.update());

        // 滑鼠影響
        if (this.mousePos) {
            const dist = Math.sqrt(this.mousePos.x ** 2 + this.mousePos.y ** 2);
            const influence = Math.min(dist / this.radius, 1);

            this.elements.forEach((elem, i) => {
                const offset = influence * 10 * Math.sin(i * 0.5 + this.rotation * 5);
                elem.x += (offset - elem.x * 0.01) * 0.1;
            });
        }
    }

    draw() {
        const ctx = this.ctx;
        const scale = this.zoom / 100;

        // 清除畫面
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.width, this.height);

        // 圓形裁剪
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.radius - 2, 0, Math.PI * 2);
        ctx.clip();

        // 背景漸層
        const bgGradient = ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, this.radius
        );
        bgGradient.addColorStop(0, `hsla(${this.hueOffset + 180}, 50%, 10%, 1)`);
        bgGradient.addColorStop(1, '#000');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // 移動到中心
        ctx.translate(this.centerX, this.centerY);
        ctx.rotate(this.rotation);
        ctx.scale(scale, scale);

        // 繪製對稱圖案
        const segmentAngle = (Math.PI * 2) / this.segments;

        for (let s = 0; s < this.segments; s++) {
            ctx.save();
            ctx.rotate(s * segmentAngle);

            // 正常繪製
            this.elements.forEach(elem => elem.draw(ctx));

            // 鏡像繪製
            ctx.scale(1, -1);
            this.elements.forEach(elem => elem.draw(ctx));

            ctx.restore();
        }

        ctx.restore();

        // 繪製邊框
        this.drawBorder();

        // 繪製中心裝飾
        this.drawCenter();
    }

    drawBorder() {
        const ctx = this.ctx;

        // 外圈發光
        const glowGradient = ctx.createRadialGradient(
            this.centerX, this.centerY, this.radius - 20,
            this.centerX, this.centerY, this.radius
        );
        glowGradient.addColorStop(0, 'transparent');
        glowGradient.addColorStop(0.5, `hsla(${this.hueOffset}, 70%, 50%, 0.3)`);
        glowGradient.addColorStop(1, `hsla(${this.hueOffset}, 70%, 30%, 0.8)`);

        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = glowGradient;
        ctx.lineWidth = 20;
        ctx.stroke();

        // 金屬邊框
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.radius - 2, 0, Math.PI * 2);

        const borderGradient = ctx.createLinearGradient(
            0, this.centerY - this.radius,
            0, this.centerY + this.radius
        );
        borderGradient.addColorStop(0, '#888');
        borderGradient.addColorStop(0.3, '#ccc');
        borderGradient.addColorStop(0.5, '#fff');
        borderGradient.addColorStop(0.7, '#ccc');
        borderGradient.addColorStop(1, '#666');

        ctx.strokeStyle = borderGradient;
        ctx.lineWidth = 4;
        ctx.stroke();
    }

    drawCenter() {
        const ctx = this.ctx;

        // 中心寶石
        const gemRadius = 15;
        const gemGradient = ctx.createRadialGradient(
            this.centerX - 5, this.centerY - 5, 0,
            this.centerX, this.centerY, gemRadius
        );

        const hue = (this.hueOffset + this.rotation * 50) % 360;
        gemGradient.addColorStop(0, `hsl(${hue}, 100%, 90%)`);
        gemGradient.addColorStop(0.3, `hsl(${hue}, 80%, 70%)`);
        gemGradient.addColorStop(0.7, `hsl(${hue}, 90%, 50%)`);
        gemGradient.addColorStop(1, `hsl(${hue}, 100%, 30%)`);

        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, gemRadius, 0, Math.PI * 2);
        ctx.fillStyle = gemGradient;
        ctx.fill();

        // 寶石高光
        ctx.beginPath();
        ctx.arc(this.centerX - 4, this.centerY - 4, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();

        // 發光效果
        ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, gemRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
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
    new Kaleidoscope(canvas);
});
