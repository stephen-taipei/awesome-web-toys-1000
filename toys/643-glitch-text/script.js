const glitchText = document.querySelector('.glitch-text');
const customText = document.getElementById('customText');
const applyBtn = document.getElementById('applyBtn');

applyBtn.addEventListener('click', () => {
    const text = customText.value.toUpperCase() || 'GLITCH';
    glitchText.textContent = text;
    glitchText.dataset.text = text;
});

customText.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') applyBtn.click();
});
