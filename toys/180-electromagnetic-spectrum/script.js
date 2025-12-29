/**
 * Electromagnetic Spectrum 電磁頻譜互動探索
 * Web Toy #180
 *
 * 功能：互動式電磁波頻譜探索，展示不同波段的特性與應用
 */

// 電磁波頻譜資料
const spectrumData = [
    {
        name: '無線電波',
        nameEn: 'Radio Waves',
        wavelengthRange: [1e-1, 1e4], // 公尺
        color: '#ff6b6b',
        description: '無線電波是波長最長的電磁波，廣泛用於無線通訊、廣播和導航系統。它們可以穿透建築物和雲層，是長距離通訊的理想選擇。',
        applications: ['AM/FM 廣播', '電視訊號', 'WiFi', '手機通訊', '雷達系統', '衛星通訊']
    },
    {
        name: '微波',
        nameEn: 'Microwaves',
        wavelengthRange: [1e-3, 1e-1], // 公尺
        color: '#ffa502',
        description: '微波波長介於1毫米至1公尺之間，常用於微波爐加熱食物、雷達技術和衛星通訊。它們能夠被水分子吸收，因此可以加熱含水物質。',
        applications: ['微波爐', '5G 通訊', '藍牙', '衛星電話', '氣象雷達', '航空導航']
    },
    {
        name: '紅外線',
        nameEn: 'Infrared',
        wavelengthRange: [7e-7, 1e-3], // 公尺
        color: '#ff4757',
        description: '紅外線是介於可見光和微波之間的電磁波，我們感受到的熱輻射大多來自紅外線。它被廣泛應用於夜視設備、遙控器和熱成像技術。',
        applications: ['遙控器', '夜視鏡', '熱成像', '紅外線烤箱', '天文觀測', '工業檢測']
    },
    {
        name: '可見光',
        nameEn: 'Visible Light',
        wavelengthRange: [3.8e-7, 7e-7], // 公尺
        color: '#2ed573',
        description: '可見光是人眼能夠感知的電磁波，波長範圍約為380-700奈米。從紫光到紅光，形成了我們看到的彩虹色彩。太陽光就是可見光的最主要來源。',
        applications: ['照明', '攝影', '光纖通訊', '雷射技術', '光合作用', '顯示技術']
    },
    {
        name: '紫外線',
        nameEn: 'Ultraviolet',
        wavelengthRange: [1e-8, 3.8e-7], // 公尺
        color: '#5352ed',
        description: '紫外線波長比可見光短，能量較高。適量紫外線有助於維生素D的合成，但過度曝曬會導致皮膚損傷。紫外線也用於殺菌消毒。',
        applications: ['紫外線消毒', '驗鈔機', '日光浴', '光刻技術', '螢光檢測', '天文觀測']
    },
    {
        name: 'X射線',
        nameEn: 'X-Rays',
        wavelengthRange: [1e-11, 1e-8], // 公尺
        color: '#3742fa',
        description: 'X射線是高能量電磁波，能穿透人體軟組織但被骨骼吸收，因此廣泛用於醫學影像診斷。它也用於機場安檢和材料結構分析。',
        applications: ['醫學X光', 'CT掃描', '機場安檢', '晶體結構分析', '藝術品鑑定', '工業檢測']
    },
    {
        name: '伽馬射線',
        nameEn: 'Gamma Rays',
        wavelengthRange: [1e-14, 1e-11], // 公尺
        color: '#a55eea',
        description: '伽馬射線是波長最短、能量最高的電磁波，由核反應和放射性衰變產生。它具有極強的穿透力，用於癌症治療和工業探傷。',
        applications: ['癌症放射治療', '核醫學', '工業探傷', '食品殺菌', '天文觀測', '核能研究']
    }
];

// 全域變數
let spectrumCanvas, spectrumCtx;
let waveCanvas, waveCtx;
let currentWavelength = 550e-9; // 預設綠光波長（公尺）
let isAnimating = false;
let animationId = null;
let wavePhase = 0;

// 初始化
function init() {
    // 取得 Canvas 元素
    spectrumCanvas = document.getElementById('spectrumCanvas');
    spectrumCtx = spectrumCanvas.getContext('2d');
    waveCanvas = document.getElementById('waveCanvas');
    waveCtx = waveCanvas.getContext('2d');

    // 設定 Canvas 大小
    resizeCanvases();
    window.addEventListener('resize', resizeCanvases);

    // 事件監聽
    spectrumCanvas.addEventListener('click', handleSpectrumClick);
    spectrumCanvas.addEventListener('mousemove', handleSpectrumHover);
    spectrumCanvas.addEventListener('touchstart', handleSpectrumTouch);
    spectrumCanvas.addEventListener('touchmove', handleSpectrumTouch);

    document.getElementById('wavelengthSlider').addEventListener('input', handleSliderChange);
    document.getElementById('animateBtn').addEventListener('click', toggleAnimation);
    document.getElementById('resetBtn').addEventListener('click', resetToDefault);

    // 初始繪製
    drawSpectrum();
    updateDisplay();
    drawWave();
}

// 調整 Canvas 大小
function resizeCanvases() {
    const container = document.querySelector('.spectrum-container');
    const dpr = window.devicePixelRatio || 1;

    // 頻譜 Canvas
    spectrumCanvas.width = container.clientWidth * dpr;
    spectrumCanvas.height = 120 * dpr;
    spectrumCanvas.style.width = container.clientWidth + 'px';
    spectrumCanvas.style.height = '120px';
    spectrumCtx.scale(dpr, dpr);

    // 波形 Canvas
    waveCanvas.width = container.clientWidth * dpr;
    waveCanvas.height = 150 * dpr;
    waveCanvas.style.width = container.clientWidth + 'px';
    waveCanvas.style.height = '150px';
    waveCtx.scale(dpr, dpr);

    drawSpectrum();
    drawWave();
}

// 繪製電磁頻譜
function drawSpectrum() {
    const width = spectrumCanvas.width / (window.devicePixelRatio || 1);
    const height = spectrumCanvas.height / (window.devicePixelRatio || 1);

    spectrumCtx.clearRect(0, 0, width, height);

    // 背景漸層
    const bgGrad = spectrumCtx.createLinearGradient(0, 0, width, 0);
    bgGrad.addColorStop(0, 'rgba(255, 107, 107, 0.3)');
    bgGrad.addColorStop(0.14, 'rgba(255, 165, 2, 0.3)');
    bgGrad.addColorStop(0.28, 'rgba(255, 71, 87, 0.3)');
    bgGrad.addColorStop(0.42, 'rgba(46, 213, 115, 0.3)');
    bgGrad.addColorStop(0.57, 'rgba(83, 82, 237, 0.3)');
    bgGrad.addColorStop(0.71, 'rgba(55, 66, 250, 0.3)');
    bgGrad.addColorStop(1, 'rgba(165, 94, 234, 0.3)');

    spectrumCtx.fillStyle = bgGrad;
    spectrumCtx.fillRect(0, 0, width, height);

    // 頻譜條紋
    const gradient = spectrumCtx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(0.14, '#ffa502');
    gradient.addColorStop(0.28, '#ff4757');
    gradient.addColorStop(0.35, '#ff0000');
    gradient.addColorStop(0.40, '#ff7f00');
    gradient.addColorStop(0.45, '#ffff00');
    gradient.addColorStop(0.50, '#00ff00');
    gradient.addColorStop(0.55, '#00ffff');
    gradient.addColorStop(0.60, '#0000ff');
    gradient.addColorStop(0.65, '#8b00ff');
    gradient.addColorStop(0.71, '#5352ed');
    gradient.addColorStop(0.85, '#3742fa');
    gradient.addColorStop(1, '#a55eea');

    spectrumCtx.fillStyle = gradient;
    spectrumCtx.fillRect(0, 30, width, 60);

    // 波段標籤
    const labels = ['無線電波', '微波', '紅外線', '可見光', '紫外線', 'X射線', 'γ射線'];
    const positions = [0.07, 0.21, 0.35, 0.49, 0.63, 0.77, 0.93];

    spectrumCtx.font = '12px "Segoe UI", sans-serif';
    spectrumCtx.fillStyle = '#fff';
    spectrumCtx.textAlign = 'center';

    labels.forEach((label, i) => {
        const x = width * positions[i];
        spectrumCtx.fillText(label, x, 20);
    });

    // 波長標示
    const wavelengths = ['1km', '1m', '1mm', '1μm', '700nm', '400nm', '10nm', '0.01nm'];
    const wlPositions = [0, 0.14, 0.28, 0.35, 0.42, 0.65, 0.85, 1];

    spectrumCtx.font = '10px "Segoe UI", sans-serif';
    spectrumCtx.fillStyle = '#888';

    wlPositions.forEach((pos, i) => {
        const x = width * pos;
        spectrumCtx.fillText(wavelengths[i], Math.max(20, Math.min(x, width - 20)), 108);
    });

    // 當前位置指示器
    const currentPos = wavelengthToPosition(currentWavelength) * width;

    spectrumCtx.beginPath();
    spectrumCtx.moveTo(currentPos, 25);
    spectrumCtx.lineTo(currentPos - 8, 30);
    spectrumCtx.lineTo(currentPos + 8, 30);
    spectrumCtx.closePath();
    spectrumCtx.fillStyle = '#fff';
    spectrumCtx.fill();

    spectrumCtx.beginPath();
    spectrumCtx.moveTo(currentPos, 95);
    spectrumCtx.lineTo(currentPos - 8, 90);
    spectrumCtx.lineTo(currentPos + 8, 90);
    spectrumCtx.closePath();
    spectrumCtx.fill();
}

// 波長轉換為位置（0-1）
function wavelengthToPosition(wavelength) {
    // 使用對數刻度，從 10km 到 1pm
    const minLog = Math.log10(1e-12); // 1 pm
    const maxLog = Math.log10(1e4);    // 10 km
    const currentLog = Math.log10(wavelength);
    return 1 - (currentLog - minLog) / (maxLog - minLog);
}

// 位置轉換為波長
function positionToWavelength(position) {
    const minLog = Math.log10(1e-12);
    const maxLog = Math.log10(1e4);
    const logValue = maxLog - position * (maxLog - minLog);
    return Math.pow(10, logValue);
}

// 繪製波形
function drawWave() {
    const width = waveCanvas.width / (window.devicePixelRatio || 1);
    const height = waveCanvas.height / (window.devicePixelRatio || 1);
    const centerY = height / 2;

    waveCtx.clearRect(0, 0, width, height);

    // 背景格線
    waveCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    waveCtx.lineWidth = 1;

    for (let y = 0; y <= height; y += 25) {
        waveCtx.beginPath();
        waveCtx.moveTo(0, y);
        waveCtx.lineTo(width, y);
        waveCtx.stroke();
    }

    // 中心線
    waveCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    waveCtx.beginPath();
    waveCtx.moveTo(0, centerY);
    waveCtx.lineTo(width, centerY);
    waveCtx.stroke();

    // 計算顯示頻率（視覺化用）
    const displayFreq = getDisplayFrequency();
    const color = getWaveColor();

    // 繪製波形
    waveCtx.beginPath();
    waveCtx.strokeStyle = color;
    waveCtx.lineWidth = 3;
    waveCtx.shadowColor = color;
    waveCtx.shadowBlur = 10;

    for (let x = 0; x <= width; x++) {
        const y = centerY + Math.sin((x * displayFreq / 10) + wavePhase) * 50;
        if (x === 0) {
            waveCtx.moveTo(x, y);
        } else {
            waveCtx.lineTo(x, y);
        }
    }
    waveCtx.stroke();
    waveCtx.shadowBlur = 0;

    // 波長標示
    const wavelengthPixels = (10 / displayFreq) * Math.PI * 2;
    if (wavelengthPixels > 30) {
        const startX = width / 4;
        const endX = startX + wavelengthPixels;

        waveCtx.strokeStyle = '#fff';
        waveCtx.lineWidth = 2;
        waveCtx.beginPath();
        waveCtx.moveTo(startX, height - 20);
        waveCtx.lineTo(endX, height - 20);
        waveCtx.moveTo(startX, height - 25);
        waveCtx.lineTo(startX, height - 15);
        waveCtx.moveTo(endX, height - 25);
        waveCtx.lineTo(endX, height - 15);
        waveCtx.stroke();

        waveCtx.font = '12px "Segoe UI", sans-serif';
        waveCtx.fillStyle = '#fff';
        waveCtx.textAlign = 'center';
        waveCtx.fillText('λ', (startX + endX) / 2, height - 5);
    }
}

// 取得視覺化顯示用的頻率
function getDisplayFrequency() {
    // 根據波長範圍映射到合適的視覺頻率
    const pos = wavelengthToPosition(currentWavelength);
    return 0.5 + pos * 4; // 0.5 到 4.5 之間
}

// 取得波形顏色
function getWaveColor() {
    const band = getCurrentBand();
    if (band) {
        // 如果是可見光範圍，使用實際顏色
        if (band.name === '可見光') {
            return wavelengthToColor(currentWavelength);
        }
        return band.color;
    }
    return '#ffffff';
}

// 波長轉換為可見光顏色
function wavelengthToColor(wavelength) {
    const wl = wavelength * 1e9; // 轉換為奈米
    let r, g, b;

    if (wl >= 380 && wl < 440) {
        r = -(wl - 440) / (440 - 380);
        g = 0;
        b = 1;
    } else if (wl >= 440 && wl < 490) {
        r = 0;
        g = (wl - 440) / (490 - 440);
        b = 1;
    } else if (wl >= 490 && wl < 510) {
        r = 0;
        g = 1;
        b = -(wl - 510) / (510 - 490);
    } else if (wl >= 510 && wl < 580) {
        r = (wl - 510) / (580 - 510);
        g = 1;
        b = 0;
    } else if (wl >= 580 && wl < 645) {
        r = 1;
        g = -(wl - 645) / (645 - 580);
        b = 0;
    } else if (wl >= 645 && wl <= 700) {
        r = 1;
        g = 0;
        b = 0;
    } else {
        r = 0.5;
        g = 0.5;
        b = 0.5;
    }

    return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}

// 取得當前波段資料
function getCurrentBand() {
    for (const band of spectrumData) {
        if (currentWavelength >= band.wavelengthRange[0] &&
            currentWavelength <= band.wavelengthRange[1]) {
            return band;
        }
    }
    return null;
}

// 更新顯示資訊
function updateDisplay() {
    const band = getCurrentBand();

    if (band) {
        document.getElementById('waveName').textContent = `${band.name} ${band.nameEn}`;
        document.getElementById('waveName').style.color = band.color;
        document.getElementById('description').textContent = band.description;
        document.getElementById('description').style.borderLeftColor = band.color;

        // 更新應用列表
        const appList = document.getElementById('appList');
        appList.innerHTML = '';
        band.applications.forEach(app => {
            const li = document.createElement('li');
            li.textContent = app;
            li.style.borderColor = band.color;
            appList.appendChild(li);
        });
    }

    // 更新波長、頻率、能量
    document.getElementById('wavelength').textContent = formatWavelength(currentWavelength);
    document.getElementById('frequency').textContent = formatFrequency(currentWavelength);
    document.getElementById('energy').textContent = formatEnergy(currentWavelength);

    // 更新滑桿位置
    const slider = document.getElementById('wavelengthSlider');
    slider.value = wavelengthToPosition(currentWavelength) * 100;
}

// 格式化波長
function formatWavelength(wavelength) {
    if (wavelength >= 1) {
        return wavelength.toFixed(2) + ' m';
    } else if (wavelength >= 1e-3) {
        return (wavelength * 1e3).toFixed(2) + ' mm';
    } else if (wavelength >= 1e-6) {
        return (wavelength * 1e6).toFixed(2) + ' μm';
    } else if (wavelength >= 1e-9) {
        return (wavelength * 1e9).toFixed(1) + ' nm';
    } else {
        return (wavelength * 1e12).toFixed(2) + ' pm';
    }
}

// 格式化頻率
function formatFrequency(wavelength) {
    const c = 3e8; // 光速 m/s
    const freq = c / wavelength;

    if (freq >= 1e18) {
        return (freq / 1e18).toFixed(2) + ' × 10¹⁸ Hz';
    } else if (freq >= 1e15) {
        return (freq / 1e15).toFixed(2) + ' × 10¹⁵ Hz';
    } else if (freq >= 1e12) {
        return (freq / 1e12).toFixed(2) + ' THz';
    } else if (freq >= 1e9) {
        return (freq / 1e9).toFixed(2) + ' GHz';
    } else if (freq >= 1e6) {
        return (freq / 1e6).toFixed(2) + ' MHz';
    } else {
        return (freq / 1e3).toFixed(2) + ' kHz';
    }
}

// 格式化能量
function formatEnergy(wavelength) {
    const h = 6.626e-34; // 普朗克常數
    const c = 3e8;
    const eV = 1.602e-19; // 電子伏特

    const energy = (h * c / wavelength) / eV;

    if (energy >= 1e6) {
        return (energy / 1e6).toFixed(2) + ' MeV';
    } else if (energy >= 1e3) {
        return (energy / 1e3).toFixed(2) + ' keV';
    } else if (energy >= 1) {
        return energy.toFixed(2) + ' eV';
    } else {
        return (energy * 1e3).toFixed(2) + ' meV';
    }
}

// 事件處理：點擊頻譜
function handleSpectrumClick(e) {
    const rect = spectrumCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = x / rect.width;

    currentWavelength = positionToWavelength(position);
    updateDisplay();
    drawSpectrum();
    drawWave();
}

// 事件處理：滑鼠移動
function handleSpectrumHover(e) {
    spectrumCanvas.style.cursor = 'crosshair';
}

// 事件處理：觸控
function handleSpectrumTouch(e) {
    e.preventDefault();
    const rect = spectrumCanvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const position = x / rect.width;

    currentWavelength = positionToWavelength(position);
    updateDisplay();
    drawSpectrum();
    drawWave();
}

// 事件處理：滑桿變更
function handleSliderChange(e) {
    const position = e.target.value / 100;
    currentWavelength = positionToWavelength(position);
    updateDisplay();
    drawSpectrum();
    drawWave();
}

// 切換動畫
function toggleAnimation() {
    const btn = document.getElementById('animateBtn');

    if (isAnimating) {
        cancelAnimationFrame(animationId);
        isAnimating = false;
        btn.textContent = '播放波動';
        btn.classList.remove('playing');
    } else {
        isAnimating = true;
        btn.textContent = '暫停';
        btn.classList.add('playing');
        animate();
    }
}

// 動畫迴圈
function animate() {
    if (!isAnimating) return;

    wavePhase += 0.1;
    drawWave();

    animationId = requestAnimationFrame(animate);
}

// 重置到預設值
function resetToDefault() {
    currentWavelength = 550e-9; // 綠光
    wavePhase = 0;

    if (isAnimating) {
        toggleAnimation();
    }

    updateDisplay();
    drawSpectrum();
    drawWave();
}

// 啟動
document.addEventListener('DOMContentLoaded', init);
