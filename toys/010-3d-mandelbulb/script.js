/**
 * 3D Mandelbulb 曼德球
 *
 * 使用 WebGL Ray Marching 即時渲染 3D 曼德球分形
 * - 拖曳旋轉視角
 * - 滾輪縮放
 * - 可調整 Power 參數改變形狀
 *
 * @author Awesome Web Toys 1000
 * @version 1.0.0
 */

(function() {
    'use strict';

    // ==================== 常數設定 ====================

    const CONFIG = {
        DEFAULT_POWER: 8,
        DEFAULT_ITERATIONS: 8,
        DEFAULT_ZOOM: 2.5,
        ZOOM_MIN: 1.5,
        ZOOM_MAX: 10,
        ROTATE_SPEED: 0.005,
        AUTO_ROTATE_SPEED: 0.003
    };

    // 預設視角
    const PRESETS = {
        front: { rotX: 0, rotY: 0, zoom: 2.5 },
        top: { rotX: -Math.PI / 2, rotY: 0, zoom: 3 },
        side: { rotX: 0, rotY: Math.PI / 2, zoom: 2.5 },
        detail: { rotX: 0.3, rotY: 0.5, zoom: 1.8 }
    };

    // 顏色主題 ID
    const COLOR_THEMES = {
        cosmic: 0,
        lava: 1,
        ocean: 2,
        alien: 3
    };

    // 細節程度對應的步數
    const DETAIL_LEVELS = [64, 128, 256];
    const DETAIL_NAMES = ['低', '中', '高'];

    // ==================== Shader 源碼 ====================

    const VERTEX_SHADER = `
        attribute vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    const FRAGMENT_SHADER = `
        precision highp float;

        uniform vec2 u_resolution;
        uniform float u_power;
        uniform int u_maxIter;
        uniform int u_maxSteps;
        uniform float u_zoom;
        uniform vec2 u_rotation;
        uniform int u_colorTheme;
        uniform float u_time;

        const float BAILOUT = 2.0;
        const float MIN_DIST = 0.0005;
        const float MAX_DIST = 20.0;

        // 旋轉矩陣
        mat3 rotateX(float a) {
            float c = cos(a), s = sin(a);
            return mat3(1.0, 0.0, 0.0,
                        0.0, c, -s,
                        0.0, s, c);
        }

        mat3 rotateY(float a) {
            float c = cos(a), s = sin(a);
            return mat3(c, 0.0, s,
                        0.0, 1.0, 0.0,
                        -s, 0.0, c);
        }

        // Mandelbulb 距離估計器
        float mandelbulbDE(vec3 pos) {
            vec3 z = pos;
            float dr = 1.0;
            float r = 0.0;

            for (int i = 0; i < 20; i++) {
                if (i >= u_maxIter) break;

                r = length(z);
                if (r > BAILOUT) break;

                // 轉換到球座標
                float theta = acos(z.z / r);
                float phi = atan(z.y, z.x);

                // 計算導數
                dr = pow(r, u_power - 1.0) * u_power * dr + 1.0;

                // 縮放和旋轉點
                float zr = pow(r, u_power);
                theta = theta * u_power;
                phi = phi * u_power;

                // 轉回笛卡爾座標
                z = zr * vec3(
                    sin(theta) * cos(phi),
                    sin(theta) * sin(phi),
                    cos(theta)
                );
                z += pos;
            }

            // 距離估計
            return 0.5 * log(r) * r / dr;
        }

        // 計算法線
        vec3 calcNormal(vec3 p) {
            vec2 e = vec2(0.0001, 0.0);
            return normalize(vec3(
                mandelbulbDE(p + e.xyy) - mandelbulbDE(p - e.xyy),
                mandelbulbDE(p + e.yxy) - mandelbulbDE(p - e.yxy),
                mandelbulbDE(p + e.yyx) - mandelbulbDE(p - e.yyx)
            ));
        }

        // 軟陰影
        float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
            float res = 1.0;
            float t = mint;
            for (int i = 0; i < 32; i++) {
                if (t >= maxt) break;
                float h = mandelbulbDE(ro + rd * t);
                if (h < MIN_DIST) return 0.0;
                res = min(res, k * h / t);
                t += h;
            }
            return res;
        }

        // 環境遮蔽
        float ambientOcclusion(vec3 p, vec3 n) {
            float occ = 0.0;
            float sca = 1.0;
            for (int i = 0; i < 5; i++) {
                float h = 0.01 + 0.12 * float(i) / 4.0;
                float d = mandelbulbDE(p + h * n);
                occ += (h - d) * sca;
                sca *= 0.95;
            }
            return clamp(1.0 - 3.0 * occ, 0.0, 1.0);
        }

        // 顏色方案
        vec3 getColor(float t, vec3 normal, int theme) {
            vec3 col;

            if (theme == 0) {
                // Cosmic 宇宙
                col = vec3(0.1, 0.05, 0.2) + vec3(0.4, 0.2, 0.6) * t;
                col += vec3(0.3, 0.1, 0.4) * (0.5 + 0.5 * normal.y);
            } else if (theme == 1) {
                // Lava 熔岩
                col = vec3(0.2, 0.02, 0.0) + vec3(0.8, 0.3, 0.0) * t;
                col += vec3(1.0, 0.8, 0.0) * pow(t, 3.0);
            } else if (theme == 2) {
                // Ocean 海洋
                col = vec3(0.0, 0.1, 0.2) + vec3(0.0, 0.4, 0.6) * t;
                col += vec3(0.2, 0.6, 0.8) * (0.5 + 0.5 * normal.y);
            } else {
                // Alien 異星
                col = vec3(0.0, 0.1, 0.0) + vec3(0.2, 0.6, 0.1) * t;
                col += vec3(0.5, 1.0, 0.2) * pow(t, 2.0);
            }

            return col;
        }

        void main() {
            // 螢幕座標正規化
            vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);

            // 相機設定
            vec3 ro = vec3(0.0, 0.0, u_zoom);  // 相機位置
            vec3 rd = normalize(vec3(uv, -1.5));  // 射線方向

            // 應用旋轉
            mat3 rotMat = rotateY(u_rotation.y) * rotateX(u_rotation.x);
            ro = rotMat * ro;
            rd = rotMat * rd;

            // Ray marching
            float t = 0.0;
            float d;
            vec3 p;

            for (int i = 0; i < 256; i++) {
                if (i >= u_maxSteps) break;

                p = ro + rd * t;
                d = mandelbulbDE(p);

                if (d < MIN_DIST || t > MAX_DIST) break;
                t += d * 0.8;  // 步進（略微保守以提高穩定性）
            }

            // 著色
            vec3 col = vec3(0.02, 0.02, 0.05);  // 背景色

            if (d < MIN_DIST) {
                // 命中表面
                vec3 normal = calcNormal(p);

                // 光照
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float diff = max(dot(normal, lightDir), 0.0);

                // 環境遮蔽
                float ao = ambientOcclusion(p, normal);

                // 軟陰影
                float shadow = softShadow(p + normal * 0.01, lightDir, 0.01, 2.0, 16.0);

                // 基於距離的顏色漸變
                float distFactor = 1.0 - t / MAX_DIST;

                // 獲取主題顏色
                col = getColor(distFactor, normal, u_colorTheme);

                // 應用光照
                col *= 0.3 + 0.7 * diff;
                col *= ao;
                col *= 0.5 + 0.5 * shadow;

                // 邊緣光
                float rim = pow(1.0 - max(dot(normal, -rd), 0.0), 3.0);
                col += vec3(0.3, 0.2, 0.5) * rim * 0.5;

                // Fresnel 反射
                float fresnel = pow(1.0 - max(dot(normal, -rd), 0.0), 5.0);
                col += vec3(0.5, 0.5, 0.6) * fresnel * 0.2;
            } else {
                // 背景漸層
                float gradient = 0.5 + 0.5 * rd.y;
                col = mix(vec3(0.02, 0.02, 0.05), vec3(0.05, 0.03, 0.1), gradient);
            }

            // Gamma 校正
            col = pow(col, vec3(0.8));

            gl_FragColor = vec4(col, 1.0);
        }
    `;

    // ==================== 全域狀態 ====================

    const state = {
        canvas: null,
        gl: null,
        program: null,

        // 視圖參數
        rotationX: 0,
        rotationY: 0,
        zoom: CONFIG.DEFAULT_ZOOM,

        // 分形參數
        power: CONFIG.DEFAULT_POWER,
        maxIterations: CONFIG.DEFAULT_ITERATIONS,
        detailLevel: 1,

        // 顏色主題
        colorTheme: 'cosmic',

        // 互動狀態
        isDragging: false,
        lastX: 0,
        lastY: 0,
        autoRotate: true,

        // Uniform locations
        uniforms: {},

        // 動畫
        animationId: null,
        time: 0
    };

    // ==================== 初始化 ====================

    function init() {
        state.canvas = document.getElementById('canvas');
        state.gl = state.canvas.getContext('webgl') || state.canvas.getContext('experimental-webgl');

        if (!state.gl) {
            alert('您的瀏覽器不支援 WebGL');
            return;
        }

        initShaders();
        initBuffers();
        resizeCanvas();
        bindEvents();
        animate();
    }

    /**
     * 初始化 Shaders
     */
    function initShaders() {
        const gl = state.gl;

        // 編譯 vertex shader
        const vertShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertShader, VERTEX_SHADER);
        gl.compileShader(vertShader);

        if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
            console.error('Vertex shader error:', gl.getShaderInfoLog(vertShader));
            return;
        }

        // 編譯 fragment shader
        const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragShader, FRAGMENT_SHADER);
        gl.compileShader(fragShader);

        if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
            console.error('Fragment shader error:', gl.getShaderInfoLog(fragShader));
            return;
        }

        // 連結程式
        state.program = gl.createProgram();
        gl.attachShader(state.program, vertShader);
        gl.attachShader(state.program, fragShader);
        gl.linkProgram(state.program);

        if (!gl.getProgramParameter(state.program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(state.program));
            return;
        }

        gl.useProgram(state.program);

        // 獲取 uniform locations
        state.uniforms = {
            resolution: gl.getUniformLocation(state.program, 'u_resolution'),
            power: gl.getUniformLocation(state.program, 'u_power'),
            maxIter: gl.getUniformLocation(state.program, 'u_maxIter'),
            maxSteps: gl.getUniformLocation(state.program, 'u_maxSteps'),
            zoom: gl.getUniformLocation(state.program, 'u_zoom'),
            rotation: gl.getUniformLocation(state.program, 'u_rotation'),
            colorTheme: gl.getUniformLocation(state.program, 'u_colorTheme'),
            time: gl.getUniformLocation(state.program, 'u_time')
        };
    }

    /**
     * 初始化頂點緩衝
     */
    function initBuffers() {
        const gl = state.gl;

        const vertices = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1
        ]);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const positionLoc = gl.getAttribLocation(state.program, 'a_position');
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    }

    /**
     * 調整畫布尺寸
     */
    function resizeCanvas() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);  // 限制 DPR 以保持效能
        const width = window.innerWidth;
        const height = window.innerHeight;

        state.canvas.width = width * dpr;
        state.canvas.height = height * dpr;
        state.canvas.style.width = width + 'px';
        state.canvas.style.height = height + 'px';

        state.gl.viewport(0, 0, state.canvas.width, state.canvas.height);
    }

    // ==================== 渲染 ====================

    function render() {
        const gl = state.gl;

        gl.uniform2f(state.uniforms.resolution, state.canvas.width, state.canvas.height);
        gl.uniform1f(state.uniforms.power, state.power);
        gl.uniform1i(state.uniforms.maxIter, state.maxIterations);
        gl.uniform1i(state.uniforms.maxSteps, DETAIL_LEVELS[state.detailLevel]);
        gl.uniform1f(state.uniforms.zoom, state.zoom);
        gl.uniform2f(state.uniforms.rotation, state.rotationX, state.rotationY);
        gl.uniform1i(state.uniforms.colorTheme, COLOR_THEMES[state.colorTheme]);
        gl.uniform1f(state.uniforms.time, state.time);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        updateDisplay();
    }

    // ==================== 動畫迴圈 ====================

    function animate() {
        state.time += 0.016;

        if (state.autoRotate && !state.isDragging) {
            state.rotationY += CONFIG.AUTO_ROTATE_SPEED;
        }

        render();
        state.animationId = requestAnimationFrame(animate);
    }

    // ==================== 事件綁定 ====================

    function bindEvents() {
        window.addEventListener('resize', () => {
            resizeCanvas();
        });

        // 滑鼠拖曳旋轉
        state.canvas.addEventListener('mousedown', (e) => {
            state.isDragging = true;
            state.lastX = e.clientX;
            state.lastY = e.clientY;
        });

        window.addEventListener('mousemove', (e) => {
            if (!state.isDragging) return;

            const dx = e.clientX - state.lastX;
            const dy = e.clientY - state.lastY;

            state.rotationY += dx * CONFIG.ROTATE_SPEED;
            state.rotationX += dy * CONFIG.ROTATE_SPEED;

            // 限制垂直旋轉角度
            state.rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, state.rotationX));

            state.lastX = e.clientX;
            state.lastY = e.clientY;
        });

        window.addEventListener('mouseup', () => {
            state.isDragging = false;
        });

        // 滾輪縮放
        state.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();

            if (e.deltaY > 0) {
                state.zoom = Math.min(CONFIG.ZOOM_MAX, state.zoom * 1.1);
            } else {
                state.zoom = Math.max(CONFIG.ZOOM_MIN, state.zoom / 1.1);
            }
        }, { passive: false });

        // 觸控支援
        let touchStartDist = 0;
        let touchStartZoom = 0;

        state.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                state.isDragging = true;
                state.lastX = e.touches[0].clientX;
                state.lastY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                touchStartDist = getTouchDistance(e.touches);
                touchStartZoom = state.zoom;
            }
        }, { passive: true });

        state.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();

            if (e.touches.length === 1 && state.isDragging) {
                const dx = e.touches[0].clientX - state.lastX;
                const dy = e.touches[0].clientY - state.lastY;

                state.rotationY += dx * CONFIG.ROTATE_SPEED;
                state.rotationX += dy * CONFIG.ROTATE_SPEED;
                state.rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, state.rotationX));

                state.lastX = e.touches[0].clientX;
                state.lastY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                const dist = getTouchDistance(e.touches);
                const scale = touchStartDist / dist;
                state.zoom = Math.min(CONFIG.ZOOM_MAX, Math.max(CONFIG.ZOOM_MIN, touchStartZoom * scale));
            }
        }, { passive: false });

        state.canvas.addEventListener('touchend', () => {
            state.isDragging = false;
        });

        // Power 滑桿
        document.getElementById('power-slider').addEventListener('input', (e) => {
            state.power = parseFloat(e.target.value);
            document.getElementById('power-display').textContent = state.power;
        });

        // 迭代滑桿
        document.getElementById('iteration-slider').addEventListener('input', (e) => {
            state.maxIterations = parseInt(e.target.value, 10);
            document.getElementById('iteration-display').textContent = state.maxIterations;
        });

        // 細節程度滑桿
        document.getElementById('detail-slider').addEventListener('input', (e) => {
            state.detailLevel = parseInt(e.target.value, 10);
            document.getElementById('detail-display').textContent = DETAIL_NAMES[state.detailLevel];
        });

        // 顏色按鈕
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.colorTheme = btn.dataset.color;
            });
        });

        // 預設視角按鈕
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = PRESETS[btn.dataset.preset];
                if (preset) {
                    animateTo(preset.rotX, preset.rotY, preset.zoom);
                }
            });
        });

        // 自動旋轉按鈕
        document.getElementById('auto-rotate-btn').addEventListener('click', function() {
            state.autoRotate = !state.autoRotate;
            this.classList.toggle('active', state.autoRotate);
        });

        // 重置按鈕
        document.getElementById('reset-btn').addEventListener('click', () => {
            animateTo(0, 0, CONFIG.DEFAULT_ZOOM);
            state.power = CONFIG.DEFAULT_POWER;
            state.maxIterations = CONFIG.DEFAULT_ITERATIONS;
            document.getElementById('power-slider').value = CONFIG.DEFAULT_POWER;
            document.getElementById('power-display').textContent = CONFIG.DEFAULT_POWER;
            document.getElementById('iteration-slider').value = CONFIG.DEFAULT_ITERATIONS;
            document.getElementById('iteration-display').textContent = CONFIG.DEFAULT_ITERATIONS;
        });
    }

    /**
     * 計算兩點觸控距離
     */
    function getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * 平滑動畫到目標視角
     */
    function animateTo(targetRotX, targetRotY, targetZoom) {
        const startRotX = state.rotationX;
        const startRotY = state.rotationY;
        const startZoom = state.zoom;
        const duration = 600;
        const startTime = performance.now();

        function easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const t = Math.min(1, elapsed / duration);
            const eased = easeOutCubic(t);

            state.rotationX = startRotX + (targetRotX - startRotX) * eased;
            state.rotationY = startRotY + (targetRotY - startRotY) * eased;
            state.zoom = startZoom + (targetZoom - startZoom) * eased;

            if (t < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    // ==================== UI 更新 ====================

    function updateDisplay() {
        const rotXDeg = Math.round(state.rotationX * 180 / Math.PI);
        const rotYDeg = Math.round(state.rotationY * 180 / Math.PI) % 360;
        document.getElementById('angle-display').textContent = `${rotXDeg}°, ${rotYDeg}°`;
        document.getElementById('zoom-display').textContent = state.zoom.toFixed(1) + 'x';
    }

    // ==================== 啟動 ====================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
