const wavyText = document.getElementById('wavyText');
const customText = document.getElementById('customText');
const applyBtn = document.getElementById('applyBtn');

function createWavyText(text) {
    wavyText.innerHTML = text.split('').map((char, i) => {
        const delay = i * 0.05;
        return `<span style="animation-delay: ${delay}s">${char === ' ' ? '&nbsp;' : char}</span>`;
    }).join('');
}

applyBtn.addEventListener('click', () => {
    const text = customText.value || 'WAVY TEXT';
    createWavyText(text.toUpperCase());
});

customText.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') applyBtn.click();
});

createWavyText('WAVY TEXT');
