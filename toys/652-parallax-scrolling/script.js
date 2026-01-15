const layerBack = document.querySelector('.layer-back');
const layerMid = document.querySelector('.layer-mid');
const layerFront = document.querySelector('.layer-front');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    layerBack.style.transform = `translateY(${scrollY * 0.1}px)`;
    layerMid.style.transform = `translateY(${scrollY * 0.3}px)`;
    layerFront.style.transform = `translateY(${scrollY * 0.5}px)`;
});
