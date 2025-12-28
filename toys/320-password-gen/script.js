const chars = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

function init() {
    document.getElementById('generateBtn').addEventListener('click', generate);
    document.getElementById('copyBtn').addEventListener('click', copy);
    document.getElementById('length').addEventListener('input', e => {
        document.getElementById('lengthValue').textContent = e.target.value;
    });
}

function generate() {
    const length = parseInt(document.getElementById('length').value);
    const useUppercase = document.getElementById('uppercase').checked;
    const useLowercase = document.getElementById('lowercase').checked;
    const useNumbers = document.getElementById('numbers').checked;
    const useSymbols = document.getElementById('symbols').checked;

    let charSet = '';
    if (useUppercase) charSet += chars.uppercase;
    if (useLowercase) charSet += chars.lowercase;
    if (useNumbers) charSet += chars.numbers;
    if (useSymbols) charSet += chars.symbols;

    if (!charSet) {
        document.getElementById('password').textContent = '請選擇至少一種字元類型';
        return;
    }

    let password = '';
    for (let i = 0; i < length; i++) {
        password += charSet[Math.floor(Math.random() * charSet.length)];
    }

    document.getElementById('password').textContent = password;
    updateStrength(password);
}

function updateStrength(password) {
    const strength = document.getElementById('strength');
    let score = 0;

    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    strength.className = 'strength';
    if (score <= 2) strength.classList.add('weak');
    else if (score <= 4) strength.classList.add('medium');
    else strength.classList.add('strong');
}

function copy() {
    const password = document.getElementById('password').textContent;
    if (password === '點擊產生' || password.includes('請選擇')) return;

    navigator.clipboard.writeText(password).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.textContent = '✓';
        setTimeout(() => btn.textContent = '📋', 1000);
    });
}

document.addEventListener('DOMContentLoaded', init);
