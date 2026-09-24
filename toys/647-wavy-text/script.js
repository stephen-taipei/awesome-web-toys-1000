const wavyText = document.getElementById('wavyText');
const customText = document.getElementById('customText');
const applyBtn = document.getElementById('applyBtn');

function createWavyText(text) {
    // Keep combining marks and emoji sequences together when supported.
    const characters = typeof Intl.Segmenter === 'function'
        ? Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), item => item.segment)
        : Array.from(text);
    wavyText.replaceChildren(...characters.map((character, index) => {
        const span = document.createElement('span');
        span.style.animationDelay = `${index * 0.05}s`;
        span.textContent = character === ' ' ? '\u00a0' : character;
        return span;
    }));
}

applyBtn.addEventListener('click', () => {
    const text = customText.value || 'WAVY TEXT';
    createWavyText(text.toUpperCase());
});

customText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') applyBtn.click();
});

createWavyText('WAVY TEXT');
