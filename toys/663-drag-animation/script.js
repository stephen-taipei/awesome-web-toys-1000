const dragBox = document.getElementById('dragBox');
const dragZone = document.getElementById('dragZone');
let isDragging = false;
let offsetX, offsetY;

dragBox.addEventListener('mousedown', startDrag);
dragBox.addEventListener('touchstart', startDrag);
document.addEventListener('mousemove', drag);
document.addEventListener('touchmove', drag);
document.addEventListener('mouseup', endDrag);
document.addEventListener('touchend', endDrag);

function startDrag(e) {
    isDragging = true;
    dragBox.classList.add('dragging');
    const pos = e.touches ? e.touches[0] : e;
    const rect = dragBox.getBoundingClientRect();
    offsetX = pos.clientX - rect.left;
    offsetY = pos.clientY - rect.top;
}

function drag(e) {
    if (!isDragging) return;
    e.preventDefault();
    const pos = e.touches ? e.touches[0] : e;
    const zoneRect = dragZone.getBoundingClientRect();
    let x = pos.clientX - zoneRect.left - offsetX;
    let y = pos.clientY - zoneRect.top - offsetY;

    x = Math.max(0, Math.min(x, zoneRect.width - 100));
    y = Math.max(0, Math.min(y, zoneRect.height - 100));

    dragBox.style.left = x + 'px';
    dragBox.style.top = y + 'px';
    dragBox.style.transform = 'none';
}

function endDrag() {
    isDragging = false;
    dragBox.classList.remove('dragging');
}
