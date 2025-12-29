const colorInput = document.getElementById('colorInput');
const results = document.getElementById('results');

const types = [
    { name: '正常視覺', id: 'normal', matrix: null },
    { name: '紅色盲 (Protanopia)', id: 'protanopia', matrix: [[0.567,0.433,0],[0.558,0.442,0],[0,0.242,0.758]] },
    { name: '綠色盲 (Deuteranopia)', id: 'deuteranopia', matrix: [[0.625,0.375,0],[0.7,0.3,0],[0,0.3,0.7]] },
    { name: '藍色盲 (Tritanopia)', id: 'tritanopia', matrix: [[0.95,0.05,0],[0,0.433,0.567],[0,0.475,0.525]] },
    { name: '全色盲 (Achromatopsia)', id: 'achromatopsia', matrix: [[0.299,0.587,0.114],[0.299,0.587,0.114],[0.299,0.587,0.114]] }
];

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
}

function rgbToHex(r, g, b) {
    const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
    return '#' + [r, g, b].map(v => clamp(v).toString(16).padStart(2, '0')).join('');
}

function applyMatrix(rgb, matrix) {
    if (!matrix) return rgb;
    return [
        rgb[0] * matrix[0][0] + rgb[1] * matrix[0][1] + rgb[2] * matrix[0][2],
        rgb[0] * matrix[1][0] + rgb[1] * matrix[1][1] + rgb[2] * matrix[1][2],
        rgb[0] * matrix[2][0] + rgb[1] * matrix[2][1] + rgb[2] * matrix[2][2]
    ];
}

function getContrastColor(hex) {
    const [r, g, b] = hexToRgb(hex);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
}

function updateSimulation() {
    const originalRgb = hexToRgb(colorInput.value);
    results.innerHTML = types.map(type => {
        const simRgb = applyMatrix(originalRgb, type.matrix);
        const simHex = rgbToHex(...simRgb);
        return `
            <div class="result-card">
                <div class="result-header">${type.name}</div>
                <div class="color-preview" style="background-color: ${simHex}; color: ${getContrastColor(simHex)}">
                    ${simHex.toUpperCase()}
                </div>
            </div>
        `;
    }).join('');
}

colorInput.addEventListener('input', updateSimulation);
updateSimulation();
