const innerBox = document.querySelector('.inner-box');
const syncBox = document.getElementById('syncBox');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollY / maxScroll;

    const boxWidth = syncBox.offsetWidth - 50;
    innerBox.style.left = (progress * boxWidth) + 'px';
    innerBox.style.transform = `translateY(-50%) rotate(${progress * 720}deg)`;
    innerBox.style.borderRadius = (10 + progress * 15) + 'px';
});
