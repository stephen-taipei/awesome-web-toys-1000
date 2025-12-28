let currentValue = 0;

function init() {
    document.getElementById('decimal').addEventListener('input', e => convert('decimal', e.target.value));
    document.getElementById('binary').addEventListener('input', e => convert('binary', e.target.value));
    document.getElementById('octal').addEventListener('input', e => convert('octal', e.target.value));
    document.getElementById('hex').addEventListener('input', e => convert('hex', e.target.value));
    document.getElementById('clearBtn').addEventListener('click', clear);
    updateVisual();
}

function convert(type, value) {
    if (!value || value === '') {
        currentValue = 0;
    } else {
        try {
            switch(type) {
                case 'decimal':
                    currentValue = parseInt(value, 10) || 0;
                    break;
                case 'binary':
                    currentValue = parseInt(value, 2) || 0;
                    break;
                case 'octal':
                    currentValue = parseInt(value, 8) || 0;
                    break;
                case 'hex':
                    currentValue = parseInt(value, 16) || 0;
                    break;
            }
        } catch(e) {
            currentValue = 0;
        }
    }

    currentValue = Math.max(0, Math.min(255, currentValue));
    updateAll(type);
    updateVisual();
}

function updateAll(except) {
    if (except !== 'decimal') document.getElementById('decimal').value = currentValue;
    if (except !== 'binary') document.getElementById('binary').value = currentValue.toString(2);
    if (except !== 'octal') document.getElementById('octal').value = currentValue.toString(8);
    if (except !== 'hex') document.getElementById('hex').value = currentValue.toString(16).toUpperCase();
}

function updateVisual() {
    const container = document.getElementById('binaryVisual');
    const binary = currentValue.toString(2).padStart(8, '0');
    container.innerHTML = binary.split('').map(bit =>
        '<div class="bit ' + (bit === '1' ? 'on' : '') + '">' + bit + '</div>'
    ).join('');
}

function clear() {
    currentValue = 0;
    document.getElementById('decimal').value = '';
    document.getElementById('binary').value = '';
    document.getElementById('octal').value = '';
    document.getElementById('hex').value = '';
    updateVisual();
}

document.addEventListener('DOMContentLoaded', init);
