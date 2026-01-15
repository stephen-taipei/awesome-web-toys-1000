const lines = document.querySelectorAll('#svgDemo line');
const strokeWidth = document.getElementById('strokeWidth');
const dashArray = document.getElementById('dashArray');
const lineCap = document.getElementById('lineCap');
const colorPicker = document.getElementById('colorPicker');

function updateStyles() {
    const width = strokeWidth.value;
    const dash = dashArray.value;
    const cap = lineCap.value;
    const color = colorPicker.value;

    lines[0].setAttribute('stroke-width', width);
    lines[0].setAttribute('stroke', color);
    lines[0].setAttribute('stroke-linecap', cap);

    lines[1].setAttribute('stroke-width', width);
    lines[1].setAttribute('stroke', color);
    lines[1].setAttribute('stroke-dasharray', `${dash},${dash}`);

    lines[2].setAttribute('stroke-width', width);
    lines[2].setAttribute('stroke', color);
    lines[2].setAttribute('stroke-dasharray', `${dash},${dash/2}`);

    lines[3].setAttribute('stroke-width', width);
    lines[3].setAttribute('stroke', color);
    lines[3].setAttribute('stroke-dasharray', `${dash},${dash},${dash/2},${dash}`);
}

strokeWidth.addEventListener('input', updateStyles);
dashArray.addEventListener('input', updateStyles);
lineCap.addEventListener('change', updateStyles);
colorPicker.addEventListener('input', updateStyles);

updateStyles();
