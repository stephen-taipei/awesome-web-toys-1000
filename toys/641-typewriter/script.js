const typeText = document.getElementById('typeText');
const customText = document.getElementById('customText');
const typeBtn = document.getElementById('typeBtn');
const clearBtn = document.getElementById('clearBtn');
const speedSlider = document.getElementById('speed');

const defaultText = 'Hello, World! 歡迎來到打字機效果展示。';
let isTyping = false;

async function typeWriter(text) {
    if (isTyping) return;
    isTyping = true;
    typeText.textContent = '';

    for (let i = 0; i < text.length; i++) {
        typeText.textContent += text[i];
        await new Promise(r => setTimeout(r, 220 - speedSlider.value));
    }
    isTyping = false;
}

typeBtn.addEventListener('click', () => {
    const text = customText.value || defaultText;
    typeWriter(text);
});

clearBtn.addEventListener('click', () => {
    typeText.textContent = '';
    customText.value = '';
});

typeWriter(defaultText);
