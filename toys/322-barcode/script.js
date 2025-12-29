const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 250; canvas.height = 100;

const patterns = {
    '0': '0001101', '1': '0011001', '2': '0010011', '3': '0111101', '4': '0100011',
    '5': '0110001', '6': '0101111', '7': '0111011', '8': '0110111', '9': '0001011'
};

function init() {
    document.getElementById('generateBtn').addEventListener('click', generate);
    document.getElementById('randomBtn').addEventListener('click', randomCode);
    randomCode();
}

function randomCode() {
    let code = '';
    for (let i = 0; i < 12; i++) {
        code += Math.floor(Math.random() * 10);
    }
    document.getElementById('codeInput').value = code;
    generate();
}

function generate() {
    let code = document.getElementById('codeInput').value.replace(/\D/g, '');
    if (code.length < 12) {
        code = code.padStart(12, '0');
    }
    code = code.substring(0, 12);

    document.getElementById('codeDisplay').textContent = code;

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let barcode = '101';
    for (let i = 0; i < 6; i++) {
        barcode += patterns[code[i]];
    }
    barcode += '01010';
    for (let i = 6; i < 12; i++) {
        const pattern = patterns[code[i]];
        barcode += pattern.split('').map(b => b === '0' ? '1' : '0').join('');
    }
    barcode += '101';

    const barWidth = 2;
    const startX = (canvas.width - barcode.length * barWidth) / 2;
    const barHeight = 70;

    ctx.fillStyle = '#000';
    for (let i = 0; i < barcode.length; i++) {
        if (barcode[i] === '1') {
            ctx.fillRect(startX + i * barWidth, 10, barWidth, barHeight);
        }
    }
}

document.addEventListener('DOMContentLoaded', init);
