/**
 * 電漿球 - Plasma Ball
 * 模擬特斯拉線圈電漿球的電弧效果
 */

class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    sub(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    mul(s) {
        return new Vector2(this.x * s, this.y * s);
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const len = this.length();
        return len > 0 ? new Vector2(this.x / len, this.y / len) : new Vector2();
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }

    static fromAngle(angle, length = 1) {
        return new Vector2(Math.cos(angle) * length, Math.sin(angle) * length);
    }
}

// 電弧類別
class PlasmaArc {
    constructor(centerX, centerY, angle, radius) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.baseAngle = angle;
        this.angle = angle;
        this.radius = radius;
        this.targetAngle = angle;
        this.segments = [];
        this.life = 1;
        this.flickerPhase = Math.random() * Math.PI * 2;
        this.branchProbability = 0.15;
        this.attracted = false;
        this.attractPoint = null;
    }

    setAttractPoint(point) {
        if (point) {
            this.attracted = true;
            this.attractPoint = point;
            // 計算目標角度
            const dx = point.x - this.centerX;
            const dy = point.y - this.centerY;
            this.targetAngle = Math.atan2(dy, dx);
        } else {
            this.attracted = false;
            this.attractPoint = null;
            this.targetAngle = this.baseAngle + (Math.random() - 0.5) * 0.5;
        }
    }

    generate(voltage) {
        this.segments = [];

        // 平滑追蹤目標角度
        const angleDiff = this.targetAngle - this.angle;
        this.angle += angleDiff * 0.1;

        const startX = this.centerX;
        const startY = this.centerY;

        let endX, endY;

        if (this.attracted && this.attractPoint) {
            // 電弧指向觸摸點
            const dist = Math.sqrt(
                Math.pow(this.attractPoint.x - this.centerX, 2) +
                Math.pow(this.attractPoint.y - this.centerY, 2)
            );
            const targetDist = Math.min(dist, this.radius);
            endX = this.centerX + Math.cos(this.angle) * targetDist;
            endY = this.centerY + Math.sin(this.angle) * targetDist;
        } else {
            // 隨機結束點
            const endRadius = this.radius * (0.7 + Math.random() * 0.3);
            endX = this.centerX + Math.cos(this.angle) * endRadius;
            endY = this.centerY + Math.sin(this.angle) * endRadius;
        }

        // 生成主電弧
        this.generateBranch(startX, startY, endX, endY, voltage, 0, true);
    }

    generateBranch(startX, startY, endX, endY, voltage, depth, isMain) {
        const points = [];
        const segmentCount = isMain ? 15 + Math.floor(voltage / 10) : 8;

        const dx = endX - startX;
        const dy = endY - startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        for (let i = 0; i <= segmentCount; i++) {
            const t = i / segmentCount;
            const baseX = startX + dx * t;
            const baseY = startY + dy * t;

            // 閃電式偏移
            let offset = 0;
            if (i > 0 && i < segmentCount) {
                const maxOffset = (isMain ? 30 : 15) * (voltage / 100);
                offset = (Math.random() - 0.5) * maxOffset * Math.sin(t * Math.PI);
            }

            const perpX = -Math.sin(angle);
            const perpY = Math.cos(angle);

            points.push({
                x: baseX + perpX * offset,
                y: baseY + perpY * offset,
                intensity: isMain ? 1 - t * 0.3 : 0.5
            });

            // 分支
            if (depth < 2 && i > 2 && i < segmentCount - 2 && Math.random() < this.branchProbability) {
                const branchAngle = angle + (Math.random() - 0.5) * Math.PI * 0.6;
                const branchLength = length * (0.2 + Math.random() * 0.3) * (1 - t);
                const branchEndX = baseX + Math.cos(branchAngle) * branchLength;
                const branchEndY = baseY + Math.sin(branchAngle) * branchLength;

                this.generateBranch(baseX, baseY, branchEndX, branchEndY, voltage * 0.6, depth + 1, false);
            }
        }

        this.segments.push({
            points,
            isMain,
            depth
        });
    }

    update() {
        this.flickerPhase += 0.3;
        this.life = 0.7 + Math.sin(this.flickerPhase) * 0.3;

        // 隨機角度漂移
        if (!this.attracted) {
            this.targetAngle = this.baseAngle + (Math.random() - 0.5) * 0.8;
        }
    }

    draw(ctx, hue, voltage) {
        const flicker = this.life * (0.8 + Math.random() * 0.2);

        this.segments.forEach(segment => {
            if (segment.points.length < 2) return;

            const lineWidth = segment.isMain ? 3 : 1.5;
            const alpha = segment.isMain ? flicker : flicker * 0.6;

            // 外發光
            ctx.save();
            ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${alpha * 0.3})`;
            ctx.lineWidth = lineWidth * 6;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.filter = 'blur(8px)';

            ctx.beginPath();
            ctx.moveTo(segment.points[0].x, segment.points[0].y);
            for (let i = 1; i < segment.points.length; i++) {
                ctx.lineTo(segment.points[i].x, segment.points[i].y);
            }
            ctx.stroke();
            ctx.restore();

            // 中間層
            ctx.save();
            ctx.strokeStyle = `hsla(${hue}, 100%, 80%, ${alpha * 0.6})`;
            ctx.lineWidth = lineWidth * 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.filter = 'blur(3px)';

            ctx.beginPath();
            ctx.moveTo(segment.points[0].x, segment.points[0].y);
            for (let i = 1; i < segment.points.length; i++) {
                ctx.lineTo(segment.points[i].x, segment.points[i].y);
            }
            ctx.stroke();
            ctx.restore();

            // 核心線
            ctx.save();
            ctx.strokeStyle = `hsla(${(hue + 30) % 360}, 100%, 95%, ${alpha})`;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            ctx.moveTo(segment.points[0].x, segment.points[0].y);
            for (let i = 1; i < segment.points.length; i++) {
                ctx.lineTo(segment.points[i].x, segment.points[i].y);
            }
            ctx.stroke();
            ctx.restore();
        });
    }
}

class PlasmaBall {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.arcs = [];
        this.voltage = 70;
        this.arcCount = 6;
        this.hue = 280;
        this.touchPoint = null;
        this.pulseActive = false;
        this.pulseIntensity = 0;

        this.resize();
        this.init();
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

        // 電漿球尺寸
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.ballRadius = Math.min(this.width, this.height) * 0.38;
        this.coreRadius = this.ballRadius * 0.15;
    }

    init() {
        this.arcs = [];

        for (let i = 0; i < this.arcCount; i++) {
            const angle = (i / this.arcCount) * Math.PI * 2;
            const arc = new PlasmaArc(
                this.centerX,
                this.centerY,
                angle,
                this.ballRadius
            );
            this.arcs.push(arc);
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.init();
        });

        // 觸摸/滑鼠互動
        const handleMove = (x, y) => {
            const rect = this.canvas.getBoundingClientRect();
            const px = x - rect.left;
            const py = y - rect.top;

            // 檢查是否在球內
            const dist = Math.sqrt(
                Math.pow(px - this.centerX, 2) +
                Math.pow(py - this.centerY, 2)
            );

            if (dist < this.ballRadius) {
                this.touchPoint = { x: px, y: py };
            } else {
                this.touchPoint = null;
            }
        };

        this.canvas.addEventListener('mousemove', (e) => {
            handleMove(e.clientX, e.clientY);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            handleMove(touch.clientX, touch.clientY);
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.touchPoint = null;
        });

        this.canvas.addEventListener('touchend', () => {
            this.touchPoint = null;
        });

        // 控制項
        document.getElementById('voltage').addEventListener('input', (e) => {
            this.voltage = parseInt(e.target.value);
            document.getElementById('voltageValue').textContent = this.voltage;
        });

        document.getElementById('arcCount').addEventListener('input', (e) => {
            this.arcCount = parseInt(e.target.value);
            document.getElementById('arcCountValue').textContent = this.arcCount;
            this.init();
        });

        document.getElementById('hue').addEventListener('input', (e) => {
            this.hue = parseInt(e.target.value);
            document.getElementById('hueValue').textContent = this.hue + '°';
        });

        document.getElementById('resetBtn').addEventListener('click', () => this.init());
        document.getElementById('pulseBtn').addEventListener('click', () => this.pulse());
        document.getElementById('colorBtn').addEventListener('click', () => this.randomColor());
    }

    pulse() {
        this.pulseActive = true;
        this.pulseIntensity = 1;
    }

    randomColor() {
        this.hue = Math.floor(Math.random() * 360);
        document.getElementById('hue').value = this.hue;
        document.getElementById('hueValue').textContent = this.hue + '°';
    }

    update() {
        // 脈衝衰減
        if (this.pulseActive) {
            this.pulseIntensity *= 0.95;
            if (this.pulseIntensity < 0.01) {
                this.pulseActive = false;
            }
        }

        // 更新電弧
        this.arcs.forEach((arc, i) => {
            // 設置吸引點
            if (this.touchPoint) {
                // 找最近的電弧
                const dx = this.touchPoint.x - this.centerX;
                const dy = this.touchPoint.y - this.centerY;
                const touchAngle = Math.atan2(dy, dx);
                const arcAngle = arc.baseAngle;

                let angleDiff = Math.abs(touchAngle - arcAngle);
                if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

                if (angleDiff < Math.PI / this.arcCount * 1.5) {
                    arc.setAttractPoint(this.touchPoint);
                } else {
                    arc.setAttractPoint(null);
                }
            } else {
                arc.setAttractPoint(null);
            }

            arc.update();

            // 重新生成電弧
            if (Math.random() < 0.3) {
                const voltageBoost = this.pulseActive ? this.voltage + this.pulseIntensity * 50 : this.voltage;
                arc.generate(voltageBoost);
            }
        });
    }

    draw() {
        const ctx = this.ctx;

        // 清除畫面
        ctx.fillStyle = '#000005';
        ctx.fillRect(0, 0, this.width, this.height);

        // 繪製玻璃球
        this.drawGlassBall();

        // 繪製電弧
        const voltageBoost = this.pulseActive ? this.voltage + this.pulseIntensity * 50 : this.voltage;
        this.arcs.forEach(arc => arc.draw(ctx, this.hue, voltageBoost));

        // 繪製中心電極
        this.drawCore();

        // 繪製玻璃反光
        this.drawReflections();

        // 繪製底座
        this.drawBase();
    }

    drawGlassBall() {
        const ctx = this.ctx;

        // 球體漸層背景
        const gradient = ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, this.ballRadius
        );
        gradient.addColorStop(0, 'rgba(20, 10, 40, 0.3)');
        gradient.addColorStop(0.7, 'rgba(10, 5, 25, 0.5)');
        gradient.addColorStop(1, 'rgba(5, 0, 15, 0.8)');

        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // 球體邊緣
        ctx.strokeStyle = `hsla(${this.hue}, 50%, 30%, 0.3)`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawCore() {
        const ctx = this.ctx;
        const pulseScale = 1 + (this.pulseActive ? this.pulseIntensity * 0.5 : 0);

        // 核心發光
        const coreGlow = ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, this.coreRadius * 3 * pulseScale
        );
        coreGlow.addColorStop(0, `hsla(${this.hue}, 100%, 90%, 1)`);
        coreGlow.addColorStop(0.3, `hsla(${this.hue}, 100%, 70%, 0.8)`);
        coreGlow.addColorStop(0.6, `hsla(${this.hue}, 100%, 50%, 0.3)`);
        coreGlow.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.coreRadius * 3 * pulseScale, 0, Math.PI * 2);
        ctx.fillStyle = coreGlow;
        ctx.fill();

        // 核心球體
        const coreGradient = ctx.createRadialGradient(
            this.centerX - this.coreRadius * 0.3,
            this.centerY - this.coreRadius * 0.3,
            0,
            this.centerX, this.centerY, this.coreRadius
        );
        coreGradient.addColorStop(0, '#ffffff');
        coreGradient.addColorStop(0.3, `hsl(${this.hue}, 100%, 85%)`);
        coreGradient.addColorStop(1, `hsl(${this.hue}, 100%, 60%)`);

        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.coreRadius, 0, Math.PI * 2);
        ctx.fillStyle = coreGradient;
        ctx.fill();
    }

    drawReflections() {
        const ctx = this.ctx;

        // 主反光
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.ballRadius, 0, Math.PI * 2);
        ctx.clip();

        // 左上反光
        const reflectGradient = ctx.createRadialGradient(
            this.centerX - this.ballRadius * 0.5,
            this.centerY - this.ballRadius * 0.5,
            0,
            this.centerX - this.ballRadius * 0.3,
            this.centerY - this.ballRadius * 0.3,
            this.ballRadius * 0.6
        );
        reflectGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        reflectGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = reflectGradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // 右下反光
        const reflectGradient2 = ctx.createRadialGradient(
            this.centerX + this.ballRadius * 0.4,
            this.centerY + this.ballRadius * 0.4,
            0,
            this.centerX + this.ballRadius * 0.3,
            this.centerY + this.ballRadius * 0.3,
            this.ballRadius * 0.4
        );
        reflectGradient2.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
        reflectGradient2.addColorStop(1, 'transparent');

        ctx.fillStyle = reflectGradient2;
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.restore();

        // 邊緣高光弧
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(
            this.centerX,
            this.centerY,
            this.ballRadius - 2,
            -Math.PI * 0.7,
            -Math.PI * 0.3
        );
        ctx.stroke();
        ctx.restore();
    }

    drawBase() {
        const ctx = this.ctx;
        const baseY = this.centerY + this.ballRadius + 10;
        const baseWidth = this.ballRadius * 1.2;
        const baseHeight = 40;

        // 底座主體
        const baseGradient = ctx.createLinearGradient(
            this.centerX - baseWidth, baseY,
            this.centerX + baseWidth, baseY + baseHeight
        );
        baseGradient.addColorStop(0, '#333');
        baseGradient.addColorStop(0.5, '#1a1a1a');
        baseGradient.addColorStop(1, '#0d0d0d');

        ctx.beginPath();
        ctx.ellipse(this.centerX, baseY + baseHeight * 0.5, baseWidth, baseHeight * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = baseGradient;
        ctx.fill();

        // 底座頂部
        ctx.beginPath();
        ctx.ellipse(this.centerX, baseY, baseWidth * 0.9, baseHeight * 0.35, 0, 0, Math.PI * 2);

        const topGradient = ctx.createRadialGradient(
            this.centerX, baseY, 0,
            this.centerX, baseY, baseWidth
        );
        topGradient.addColorStop(0, '#555');
        topGradient.addColorStop(0.5, '#333');
        topGradient.addColorStop(1, '#222');

        ctx.fillStyle = topGradient;
        ctx.fill();

        // 連接球體的頸部
        ctx.beginPath();
        ctx.ellipse(this.centerX, this.centerY + this.ballRadius, this.ballRadius * 0.2, 15, 0, 0, Math.PI * 2);

        const neckGradient = ctx.createRadialGradient(
            this.centerX, this.centerY + this.ballRadius, 0,
            this.centerX, this.centerY + this.ballRadius, this.ballRadius * 0.25
        );
        neckGradient.addColorStop(0, '#444');
        neckGradient.addColorStop(1, '#222');

        ctx.fillStyle = neckGradient;
        ctx.fill();
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
    new PlasmaBall(canvas);
});
