const scrambleText = document.getElementById('scrambleText');
const customText = document.getElementById('customText');
const scrambleBtn = document.getElementById('scrambleBtn');

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';

function scramble(targetText) {
    const text = targetText.toUpperCase();
    const iterations = 10;
    let iteration = 0;

    const interval = setInterval(() => {
        scrambleText.textContent = text.split('').map((char, i) => {
            if (i < iteration) return text[i];
            return chars[Math.floor(Math.random() * chars.length)];
        }).join('');

        iteration += 1 / 3;

        if (iteration >= text.length) {
            clearInterval(interval);
            scrambleText.textContent = text;
        }
    }, 50);
}

scrambleBtn.addEventListener('click', () => {
    const text = customText.value || 'SCRAMBLE';
    scramble(text);
});

customText.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') scrambleBtn.click();
});

scramble('SCRAMBLE');
