const baseColor = document.getElementById('baseColor');
const harmonyType = document.getElementById('harmonyType');
const palette = document.getElementById('palette');
const message = document.getElementById('message');

function hexToHsl(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h, s, l) {
    h = ((h % 360) + 360) % 360;
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r, g, b;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    return '#' + [r, g, b].map(v => Math.round((v + m) * 255).toString(16).padStart(2, '0').toUpperCase()).join('');
}

function getContrastColor(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 128 ? '#000000' : '#ffffff';
}

function getHarmonyColors(hex, type) {
    const [h, s, l] = hexToHsl(hex);
    const colors = [hex];
    switch (type) {
        case 'complementary':
            colors.push(hslToHex(h + 180, s, l));
            break;
        case 'analogous':
            colors.push(hslToHex(h - 30, s, l), hslToHex(h + 30, s, l));
            break;
        case 'triadic':
            colors.push(hslToHex(h + 120, s, l), hslToHex(h + 240, s, l));
            break;
        case 'split':
            colors.push(hslToHex(h + 150, s, l), hslToHex(h + 210, s, l));
            break;
        case 'tetradic':
            colors.push(hslToHex(h + 90, s, l), hslToHex(h + 180, s, l), hslToHex(h + 270, s, l));
            break;
    }
    return colors;
}

function updatePalette() {
    const colors = getHarmonyColors(baseColor.value, harmonyType.value);
    palette.innerHTML = colors.map(color => `
        <div class="color-swatch" style="background-color: ${color}; color: ${getContrastColor(color)}" data-color="${color}">
            ${color}
        </div>
    `).join('');
    palette.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => copyColor(swatch.dataset.color));
    });
}

async function copyColor(color) {
    try {
        await navigator.clipboard.writeText(color);
        message.textContent = `✅ 已複製 ${color}`;
        setTimeout(() => message.textContent = '', 2000);
    } catch (err) {
        message.textContent = '❌ 複製失敗';
    }
}

baseColor.addEventListener('input', updatePalette);
harmonyType.addEventListener('change', updatePalette);
updatePalette();
