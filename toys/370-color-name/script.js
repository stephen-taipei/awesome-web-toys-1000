const colorPicker = document.getElementById('colorPicker');
const colorDisplay = document.getElementById('colorDisplay');
const colorName = document.getElementById('colorName');
const hexValue = document.getElementById('hexValue');
const englishName = document.getElementById('englishName');
const message = document.getElementById('message');

const colorNames = [
    { hex: '#FF0000', en: 'Red', zh: '紅色' },
    { hex: '#FF4500', en: 'Orange Red', zh: '橘紅色' },
    { hex: '#FFA500', en: 'Orange', zh: '橙色' },
    { hex: '#FFD700', en: 'Gold', zh: '金色' },
    { hex: '#FFFF00', en: 'Yellow', zh: '黃色' },
    { hex: '#9ACD32', en: 'Yellow Green', zh: '黃綠色' },
    { hex: '#00FF00', en: 'Lime', zh: '萊姆綠' },
    { hex: '#32CD32', en: 'Lime Green', zh: '檸檬綠' },
    { hex: '#228B22', en: 'Forest Green', zh: '森林綠' },
    { hex: '#008000', en: 'Green', zh: '綠色' },
    { hex: '#006400', en: 'Dark Green', zh: '深綠色' },
    { hex: '#00FFFF', en: 'Cyan', zh: '青色' },
    { hex: '#00CED1', en: 'Turquoise', zh: '青綠色' },
    { hex: '#008B8B', en: 'Teal', zh: '藍綠色' },
    { hex: '#4169E1', en: 'Royal Blue', zh: '皇家藍' },
    { hex: '#0000FF', en: 'Blue', zh: '藍色' },
    { hex: '#000080', en: 'Navy', zh: '海軍藍' },
    { hex: '#4B0082', en: 'Indigo', zh: '靛色' },
    { hex: '#8B00FF', en: 'Violet', zh: '紫羅蘭色' },
    { hex: '#9400D3', en: 'Purple', zh: '紫色' },
    { hex: '#FF00FF', en: 'Magenta', zh: '洋紅色' },
    { hex: '#FF1493', en: 'Deep Pink', zh: '深粉色' },
    { hex: '#FF69B4', en: 'Hot Pink', zh: '亮粉色' },
    { hex: '#FFC0CB', en: 'Pink', zh: '粉紅色' },
    { hex: '#DC143C', en: 'Crimson', zh: '緋紅色' },
    { hex: '#8B4513', en: 'Brown', zh: '棕色' },
    { hex: '#D2691E', en: 'Chocolate', zh: '巧克力色' },
    { hex: '#F4A460', en: 'Sandy Brown', zh: '沙棕色' },
    { hex: '#DEB887', en: 'Burlywood', zh: '駝色' },
    { hex: '#FFE4C4', en: 'Bisque', zh: '米色' },
    { hex: '#FFFFFF', en: 'White', zh: '白色' },
    { hex: '#F5F5F5', en: 'White Smoke', zh: '煙白色' },
    { hex: '#D3D3D3', en: 'Light Gray', zh: '淺灰色' },
    { hex: '#A9A9A9', en: 'Dark Gray', zh: '深灰色' },
    { hex: '#808080', en: 'Gray', zh: '灰色' },
    { hex: '#696969', en: 'Dim Gray', zh: '暗灰色' },
    { hex: '#000000', en: 'Black', zh: '黑色' }
];

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
}

function colorDistance(hex1, hex2) {
    const [r1, g1, b1] = hexToRgb(hex1);
    const [r2, g2, b2] = hexToRgb(hex2);
    return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
}

function findClosestColor(hex) {
    let closest = colorNames[0];
    let minDist = Infinity;
    for (const color of colorNames) {
        const dist = colorDistance(hex.toUpperCase(), color.hex);
        if (dist < minDist) {
            minDist = dist;
            closest = color;
        }
    }
    return closest;
}

function updateColor(hex) {
    colorDisplay.style.backgroundColor = hex;
    hexValue.textContent = hex.toUpperCase();
    const closest = findClosestColor(hex);
    colorName.textContent = closest.zh;
    englishName.textContent = closest.en;
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        message.textContent = '✅ 已複製!';
        setTimeout(() => message.textContent = '', 2000);
    } catch (err) {
        message.textContent = '❌ 複製失敗';
    }
}

colorPicker.addEventListener('input', (e) => updateColor(e.target.value));
document.querySelectorAll('.info-row').forEach(row => {
    row.addEventListener('click', () => copyToClipboard(row.lastElementChild.textContent));
});

updateColor(colorPicker.value);
