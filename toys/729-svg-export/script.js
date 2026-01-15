const svg = document.getElementById('svgCanvas');
const svgCode = document.getElementById('svgCode');
const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];

function randomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

document.getElementById('addRect').addEventListener('click', () => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', 20 + Math.random() * 200);
    rect.setAttribute('y', 20 + Math.random() * 100);
    rect.setAttribute('width', 40 + Math.random() * 60);
    rect.setAttribute('height', 40 + Math.random() * 60);
    rect.setAttribute('fill', randomColor());
    rect.setAttribute('rx', 5);
    svg.appendChild(rect);
});

document.getElementById('addCircle').addEventListener('click', () => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', 50 + Math.random() * 260);
    circle.setAttribute('cy', 40 + Math.random() * 120);
    circle.setAttribute('r', 20 + Math.random() * 30);
    circle.setAttribute('fill', randomColor());
    svg.appendChild(circle);
});

document.getElementById('exportBtn').addEventListener('click', () => {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const formatted = svgString.replace(/></g, '>\n<');

    svgCode.value = formatted;

    // Download
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'drawing.svg';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
});
