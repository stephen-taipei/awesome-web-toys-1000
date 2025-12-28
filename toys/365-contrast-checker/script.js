const foreground = document.getElementById('foreground');
const background = document.getElementById('background');
const preview = document.getElementById('preview');
const ratioValue = document.getElementById('ratioValue');
const wcagResults = document.getElementById('wcagResults');

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
}

function getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1, hex2) {
    const lum1 = getLuminance(...hexToRgb(hex1));
    const lum2 = getLuminance(...hexToRgb(hex2));
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
}

function updateContrast() {
    const fg = foreground.value;
    const bg = background.value;
    const ratio = getContrastRatio(fg, bg);

    preview.style.backgroundColor = bg;
    preview.style.color = fg;
    ratioValue.textContent = ratio.toFixed(2) + ':1';

    const checks = [
        { level: 'AA 大文字', threshold: 3, size: 'large' },
        { level: 'AA 一般', threshold: 4.5, size: 'normal' },
        { level: 'AAA 大文字', threshold: 4.5, size: 'large' },
        { level: 'AAA 一般', threshold: 7, size: 'normal' }
    ];

    wcagResults.innerHTML = checks.map(check => {
        const pass = ratio >= check.threshold;
        return `
            <div class="wcag-item">
                <div class="level">${check.level}</div>
                <div class="status ${pass ? 'pass' : 'fail'}">${pass ? '✅ 通過' : '❌ 不通過'}</div>
            </div>
        `;
    }).join('');
}

foreground.addEventListener('input', updateContrast);
background.addEventListener('input', updateContrast);
updateContrast();
