const logoGroup = document.getElementById('logoGroup');
const anim1Btn = document.getElementById('anim1');
const anim2Btn = document.getElementById('anim2');
const anim3Btn = document.getElementById('anim3');
const anim4Btn = document.getElementById('anim4');
const replayBtn = document.getElementById('replayBtn');

const buttons = [anim1Btn, anim2Btn, anim3Btn, anim4Btn];
const animations = ['anim-fade', 'anim-scale', 'anim-rotate', 'anim-explode'];
let currentAnim = 'anim-fade';

function setAnimation(animClass, btn) {
    // Remove all animation classes
    animations.forEach(a => logoGroup.classList.remove(a));
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentAnim = animClass;

    // Trigger reflow to restart animation
    void logoGroup.offsetWidth;

    logoGroup.classList.add(animClass);
}

function replay() {
    const activeBtn = buttons.find(b => b.classList.contains('active'));
    animations.forEach(a => logoGroup.classList.remove(a));
    void logoGroup.offsetWidth;
    logoGroup.classList.add(currentAnim);
}

anim1Btn.addEventListener('click', () => setAnimation('anim-fade', anim1Btn));
anim2Btn.addEventListener('click', () => setAnimation('anim-scale', anim2Btn));
anim3Btn.addEventListener('click', () => setAnimation('anim-rotate', anim3Btn));
anim4Btn.addEventListener('click', () => setAnimation('anim-explode', anim4Btn));
replayBtn.addEventListener('click', replay);

// Initialize
setAnimation('anim-fade', anim1Btn);
