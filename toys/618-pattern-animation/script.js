const patternRect = document.getElementById('patternRect');
const pattern1Btn = document.getElementById('pattern1');
const pattern2Btn = document.getElementById('pattern2');
const pattern3Btn = document.getElementById('pattern3');
const pattern4Btn = document.getElementById('pattern4');
const pattern5Btn = document.getElementById('pattern5');
const pattern6Btn = document.getElementById('pattern6');

const buttons = [pattern1Btn, pattern2Btn, pattern3Btn, pattern4Btn, pattern5Btn, pattern6Btn];
const patterns = ['dotsPattern', 'linesPattern', 'wavesPattern', 'gridPattern', 'hexPattern', 'starsPattern'];

function setPattern(patternId, btn) {
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    patternRect.setAttribute('fill', `url(#${patternId})`);
}

pattern1Btn.addEventListener('click', () => setPattern('dotsPattern', pattern1Btn));
pattern2Btn.addEventListener('click', () => setPattern('linesPattern', pattern2Btn));
pattern3Btn.addEventListener('click', () => setPattern('wavesPattern', pattern3Btn));
pattern4Btn.addEventListener('click', () => setPattern('gridPattern', pattern4Btn));
pattern5Btn.addEventListener('click', () => setPattern('hexPattern', pattern5Btn));
pattern6Btn.addEventListener('click', () => setPattern('starsPattern', pattern6Btn));
