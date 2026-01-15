const animBox = document.getElementById('animBox');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(scrollY / maxScroll, 1);

    const rotation = progress * 720;
    const scale = 0.5 + progress * 0.5;
    const hue = progress * 120;
    const borderRadius = 20 + progress * 30;

    animBox.style.transform = `rotate(${rotation}deg) scale(${scale})`;
    animBox.style.borderRadius = `${borderRadius}px`;
    animBox.style.background = `linear-gradient(135deg, hsl(${240 + hue}, 70%, 60%), hsl(${280 + hue}, 50%, 50%))`;
});
