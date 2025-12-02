/**
 * Galaxy Simulation 銀河模擬
 * Web Toys #019
 *
 * 模擬螺旋星系，可調整旋臂數量、星星密度
 * 點擊產生超新星爆炸效果
 *
 * 技術重點：
 * - WebGL 大量粒子渲染
 * - 螺旋臂密度波理論
 * - 粒子系統與物理模擬
 */

// ==================== WebGL 設定 ====================

const canvas = document.getElementById('galaxyCanvas');
const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: true,
    preserveDrawingBuffer: false
});

if (!gl) {
    alert('您的瀏覽器不支援 WebGL，請使用現代瀏覽器');
}

// ==================== 著色器程式碼 ====================

// 頂點著色器 - 處理星星位置與大小
const vertexShaderSource = `
    attribute vec2 a_position;
    attribute float a_size;
    attribute vec3 a_color;
    attribute float a_brightness;

    uniform vec2 u_resolution;
    uniform float u_time;

    varying vec3 v_color;
    varying float v_brightness;

    void main() {
        // 轉換到裁剪空間 (-1 到 1)
        vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

        // 星星大小隨亮度變化
        gl_PointSize = a_size * (0.8 + 0.4 * sin(u_time * 2.0 + a_brightness * 10.0));

        v_color = a_color;
        v_brightness = a_brightness;
    }
`;

// 片段著色器 - 處理星星外觀
const fragmentShaderSource = `
    precision mediump float;

    varying vec3 v_color;
    varying float v_brightness;

    void main() {
        // 計算到點中心的距離，創造圓形星星
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);

        // 高斯衰減，創造柔和的光暈效果
        float alpha = exp(-dist * dist * 8.0) * v_brightness;

        // 中心更亮的光芒效果
        float core = exp(-dist * dist * 32.0) * 0.5;

        vec3 finalColor = v_color + vec3(core);

        gl_FragColor = vec4(finalColor, alpha);
    }
`;

// ==================== 著色器編譯函數 ====================

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('著色器編譯失敗:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('程式連結失敗:', gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

// ==================== 初始化 WebGL ====================

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);

// 取得 attribute 和 uniform 位置
const positionLocation = gl.getAttribLocation(program, 'a_position');
const sizeLocation = gl.getAttribLocation(program, 'a_size');
const colorLocation = gl.getAttribLocation(program, 'a_color');
const brightnessLocation = gl.getAttribLocation(program, 'a_brightness');

const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
const timeLocation = gl.getUniformLocation(program, 'u_time');

// 建立緩衝區
const positionBuffer = gl.createBuffer();
const sizeBuffer = gl.createBuffer();
const colorBuffer = gl.createBuffer();
const brightnessBuffer = gl.createBuffer();

// ==================== 星系參數 ====================

let config = {
    armCount: 2,           // 旋臂數量
    starCount: 15000,      // 星星數量
    armSpread: 0.5,        // 旋臂擴散程度
    rotationSpeed: 0.2,    // 旋轉速度
    coreSize: 0.3          // 核心大小比例
};

// 星星資料陣列
let stars = [];
let supernovas = [];  // 超新星爆炸效果

// ==================== 星系生成 ====================

/**
 * 生成螺旋星系
 * 使用密度波理論模擬旋臂結構
 */
function generateGalaxy() {
    stars = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) * 0.85;

    for (let i = 0; i < config.starCount; i++) {
        const star = createStar(centerX, centerY, maxRadius);
        stars.push(star);
    }

    // 更新顯示的星星數量
    document.getElementById('starDisplay').textContent = config.starCount;
}

/**
 * 創建單一星星
 */
function createStar(centerX, centerY, maxRadius) {
    // 決定這顆星是在核心還是旋臂
    const isCore = Math.random() < config.coreSize;

    let distance, angle, spread;

    if (isCore) {
        // 核心區域：高斯分布
        distance = Math.abs(gaussianRandom() * maxRadius * 0.3);
        angle = Math.random() * Math.PI * 2;
        spread = 0;
    } else {
        // 旋臂區域：對數螺旋
        const armIndex = Math.floor(Math.random() * config.armCount);
        const armAngle = (armIndex / config.armCount) * Math.PI * 2;

        // 距離使用非線性分布，外圍較稀疏
        const t = Math.random();
        distance = t * t * maxRadius * 0.9 + maxRadius * 0.1;

        // 對數螺旋公式
        const spiralAngle = Math.log(distance / 50) * 0.5;
        angle = armAngle + spiralAngle;

        // 加入隨機擴散
        spread = gaussianRandom() * config.armSpread * (distance / maxRadius);
        angle += spread;
    }

    // 計算初始位置
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;

    // 根據位置決定顏色
    const color = getStarColor(distance, maxRadius, isCore);

    // 星星大小和亮度
    const size = isCore
        ? 1.5 + Math.random() * 2.5
        : 1 + Math.random() * 2;

    const brightness = isCore
        ? 0.7 + Math.random() * 0.3
        : 0.3 + Math.random() * 0.5 * (1 - distance / maxRadius);

    return {
        x, y,
        originX: x,
        originY: y,
        distance,
        angle,
        size,
        color,
        brightness,
        twinkleOffset: Math.random() * Math.PI * 2,
        // 超新星爆炸用的速度
        vx: 0,
        vy: 0,
        exploding: false
    };
}

/**
 * 高斯隨機數生成（Box-Muller 轉換）
 */
function gaussianRandom() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * 根據距離獲取星星顏色
 * 核心偏黃白色，外圍偏藍色
 */
function getStarColor(distance, maxRadius, isCore) {
    const ratio = distance / maxRadius;

    if (isCore) {
        // 核心：黃白色到橙色
        const r = 1.0;
        const g = 0.8 + Math.random() * 0.2;
        const b = 0.5 + Math.random() * 0.3;
        return [r, g, b];
    }

    // 外圍星星有多種顏色
    const type = Math.random();

    if (type < 0.6) {
        // 藍白色年輕恆星
        return [0.7 + Math.random() * 0.3, 0.8 + Math.random() * 0.2, 1.0];
    } else if (type < 0.85) {
        // 黃色中年恆星
        return [1.0, 0.9 + Math.random() * 0.1, 0.6 + Math.random() * 0.2];
    } else {
        // 紅色老年恆星
        return [1.0, 0.4 + Math.random() * 0.3, 0.2 + Math.random() * 0.2];
    }
}

// ==================== 超新星爆炸效果 ====================

/**
 * 在指定位置創建超新星爆炸
 */
function createSupernova(x, y) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const explosionRadius = 150;

    // 找出爆炸範圍內的星星
    stars.forEach(star => {
        const dx = star.originX - x;
        const dy = star.originY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < explosionRadius) {
            // 計算爆炸衝擊力
            const force = (1 - dist / explosionRadius) * 15;
            const angle = Math.atan2(dy, dx);

            star.vx = Math.cos(angle) * force;
            star.vy = Math.sin(angle) * force;
            star.exploding = true;

            // 臨時變亮
            star.brightness = Math.min(1, star.brightness + 0.5);
        }
    });

    // 添加爆炸視覺效果
    supernovas.push({
        x, y,
        radius: 0,
        maxRadius: explosionRadius * 1.5,
        alpha: 1,
        color: [1, 0.9, 0.7]
    });
}

// ==================== 動畫更新 ====================

let lastTime = 0;
let totalTime = 0;
let frameCount = 0;
let fps = 60;

function update(currentTime) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    totalTime += deltaTime;

    // 計算 FPS
    frameCount++;
    if (frameCount >= 30) {
        fps = Math.round(frameCount / (totalTime - (totalTime - deltaTime * frameCount)));
        document.getElementById('fpsDisplay').textContent = fps;
        frameCount = 0;
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 更新星星位置（旋轉 + 爆炸效果）
    stars.forEach(star => {
        if (star.exploding) {
            // 爆炸中的星星
            star.originX += star.vx;
            star.originY += star.vy;

            // 減速
            star.vx *= 0.98;
            star.vy *= 0.98;

            // 恢復到正常亮度
            star.brightness = Math.max(0.3, star.brightness - 0.01);

            // 停止爆炸狀態
            if (Math.abs(star.vx) < 0.01 && Math.abs(star.vy) < 0.01) {
                star.exploding = false;
            }
        }

        // 計算旋轉（靠近中心的旋轉快，遠離的旋轉慢）
        const dx = star.originX - centerX;
        const dy = star.originY - centerY;
        star.distance = Math.sqrt(dx * dx + dy * dy);

        // 差異旋轉 - 內部旋轉快，外部旋轉慢
        const angularSpeed = config.rotationSpeed / (1 + star.distance * 0.002);
        star.angle = Math.atan2(dy, dx) + angularSpeed * deltaTime;

        // 更新位置
        star.x = centerX + Math.cos(star.angle) * star.distance;
        star.y = centerY + Math.sin(star.angle) * star.distance;

        // 同步更新原始位置（用於下一幀計算）
        star.originX = star.x;
        star.originY = star.y;
    });

    // 更新超新星效果
    supernovas = supernovas.filter(sn => {
        sn.radius += 10;
        sn.alpha -= 0.02;
        return sn.alpha > 0;
    });
}

// ==================== WebGL 渲染 ====================

function render() {
    // 設定視窗大小
    gl.viewport(0, 0, canvas.width, canvas.height);

    // 清除背景為深黑色
    gl.clearColor(0.0, 0.0, 0.02, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 啟用混合模式（加法混合讓星星發光）
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    gl.useProgram(program);

    // 設定 uniforms
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform1f(timeLocation, totalTime);

    // 準備資料陣列
    const positions = new Float32Array(stars.length * 2);
    const sizes = new Float32Array(stars.length);
    const colors = new Float32Array(stars.length * 3);
    const brightnesses = new Float32Array(stars.length);

    stars.forEach((star, i) => {
        positions[i * 2] = star.x;
        positions[i * 2 + 1] = star.y;
        sizes[i] = star.size;
        colors[i * 3] = star.color[0];
        colors[i * 3 + 1] = star.color[1];
        colors[i * 3 + 2] = star.color[2];
        brightnesses[i] = star.brightness;
    });

    // 上傳位置資料
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // 上傳大小資料
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(sizeLocation);
    gl.vertexAttribPointer(sizeLocation, 1, gl.FLOAT, false, 0, 0);

    // 上傳顏色資料
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

    // 上傳亮度資料
    gl.bindBuffer(gl.ARRAY_BUFFER, brightnessBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, brightnesses, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(brightnessLocation);
    gl.vertexAttribPointer(brightnessLocation, 1, gl.FLOAT, false, 0, 0);

    // 繪製所有星星
    gl.drawArrays(gl.POINTS, 0, stars.length);
}

// ==================== 動畫迴圈 ====================

function animate(currentTime) {
    update(currentTime);
    render();
    requestAnimationFrame(animate);
}

// ==================== 畫布大小調整 ====================

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';

    // 重新生成星系以適應新的畫布大小
    generateGalaxy();
}

// ==================== 事件處理 ====================

// 視窗大小改變
window.addEventListener('resize', resizeCanvas);

// 點擊產生超新星
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const x = (e.clientX - rect.left) * dpr;
    const y = (e.clientY - rect.top) * dpr;
    createSupernova(x, y);
});

// 觸控支援
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const x = (touch.clientX - rect.left) * dpr;
    const y = (touch.clientY - rect.top) * dpr;
    createSupernova(x, y);
}, { passive: false });

// 控制面板事件
document.getElementById('armCount').addEventListener('input', (e) => {
    config.armCount = parseInt(e.target.value);
    document.getElementById('armCountValue').textContent = config.armCount;
    generateGalaxy();
});

document.getElementById('starCount').addEventListener('input', (e) => {
    config.starCount = parseInt(e.target.value);
    document.getElementById('starCountValue').textContent = config.starCount;
    generateGalaxy();
});

document.getElementById('armSpread').addEventListener('input', (e) => {
    config.armSpread = parseFloat(e.target.value);
    document.getElementById('armSpreadValue').textContent = config.armSpread.toFixed(1);
    generateGalaxy();
});

document.getElementById('rotationSpeed').addEventListener('input', (e) => {
    config.rotationSpeed = parseFloat(e.target.value);
    document.getElementById('rotationSpeedValue').textContent = config.rotationSpeed.toFixed(2);
});

document.getElementById('coreSize').addEventListener('input', (e) => {
    config.coreSize = parseFloat(e.target.value);
    document.getElementById('coreSizeValue').textContent = config.coreSize.toFixed(2);
    generateGalaxy();
});

document.getElementById('regenerateBtn').addEventListener('click', () => {
    generateGalaxy();
});

document.getElementById('supernovaBtn').addEventListener('click', () => {
    // 在隨機位置產生超新星
    const dpr = window.devicePixelRatio || 1;
    const x = (0.3 + Math.random() * 0.4) * canvas.width;
    const y = (0.3 + Math.random() * 0.4) * canvas.height;
    createSupernova(x, y);
});

// ==================== 初始化 ====================

resizeCanvas();
requestAnimationFrame(animate);
