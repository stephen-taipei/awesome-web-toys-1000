const dashboard = document.getElementById('dashboard');
const infoEl = document.getElementById('info');
const widgetBtns = document.querySelectorAll('.widget-btn');

let widgetCount = 0;
let draggedWidget = null;
let offsetX, offsetY;

const widgetTypes = {
    chart: {
        title: '銷售圖表',
        width: 150,
        height: 100,
        render: (el) => {
            const canvas = document.createElement('canvas');
            canvas.width = 130;
            canvas.height = 60;
            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i < 10; i++) {
                const x = i * 14;
                const y = 30 + Math.sin(i * 0.8) * 20 + Math.random() * 10;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            el.appendChild(canvas);
        }
    },
    gauge: {
        title: '效能指標',
        width: 100,
        height: 90,
        render: (el) => {
            const value = Math.floor(Math.random() * 100);
            const canvas = document.createElement('canvas');
            canvas.width = 80;
            canvas.height = 50;
            const ctx = canvas.getContext('2d');
            ctx.beginPath();
            ctx.arc(40, 45, 35, Math.PI, 0);
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 8;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(40, 45, 35, Math.PI, Math.PI + (value / 100) * Math.PI);
            ctx.strokeStyle = value > 70 ? '#e74c3c' : '#2ecc71';
            ctx.stroke();
            el.appendChild(canvas);
            const text = document.createElement('div');
            text.style.textAlign = 'center';
            text.style.marginTop = '-10px';
            text.textContent = value + '%';
            el.appendChild(text);
        }
    },
    number: {
        title: '今日訂單',
        width: 100,
        height: 70,
        render: (el) => {
            const num = Math.floor(Math.random() * 1000) + 100;
            el.innerHTML = `<div style="font-size:1.8rem;color:#00ff88">${num}</div><div style="font-size:0.7rem;color:rgba(255,255,255,0.6)">+12.5%</div>`;
        }
    },
    list: {
        title: '熱門商品',
        width: 130,
        height: 100,
        render: (el) => {
            const items = ['商品A', '商品B', '商品C'];
            const ul = document.createElement('div');
            ul.style.fontSize = '0.75rem';
            items.forEach((item, i) => {
                ul.innerHTML += `<div style="padding:2px 0">${i + 1}. ${item}</div>`;
            });
            el.appendChild(ul);
        }
    }
};

function createWidget(type) {
    const config = widgetTypes[type];
    const widget = document.createElement('div');
    widget.className = 'widget';
    widget.style.width = config.width + 'px';
    widget.style.height = config.height + 'px';
    widget.style.left = (10 + (widgetCount % 2) * 170) + 'px';
    widget.style.top = (10 + Math.floor(widgetCount / 2) * 110) + 'px';

    widget.innerHTML = `
        <div class="widget-header">
            <span>${config.title}</span>
            <span class="widget-close">✕</span>
        </div>
        <div class="widget-content"></div>
    `;

    const content = widget.querySelector('.widget-content');
    config.render(content);

    widget.querySelector('.widget-close').addEventListener('click', () => {
        widget.remove();
        updateInfo();
    });

    widget.addEventListener('mousedown', startDrag);
    widget.addEventListener('touchstart', startDrag, { passive: false });

    dashboard.appendChild(widget);
    widgetCount++;
    updateInfo();
}

function startDrag(e) {
    e.preventDefault();
    draggedWidget = e.currentTarget;
    const rect = draggedWidget.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;
    draggedWidget.style.zIndex = 100;
}

function drag(e) {
    if (!draggedWidget) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dashRect = dashboard.getBoundingClientRect();
    let x = clientX - dashRect.left - offsetX;
    let y = clientY - dashRect.top - offsetY;
    x = Math.max(0, Math.min(x, dashRect.width - draggedWidget.offsetWidth));
    y = Math.max(0, Math.min(y, dashRect.height - draggedWidget.offsetHeight));
    draggedWidget.style.left = x + 'px';
    draggedWidget.style.top = y + 'px';
}

function endDrag() {
    if (draggedWidget) {
        draggedWidget.style.zIndex = 1;
        draggedWidget = null;
    }
}

function updateInfo() {
    const count = dashboard.querySelectorAll('.widget').length;
    infoEl.textContent = `已新增 ${count} 個組件`;
}

document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', endDrag);
document.addEventListener('touchmove', drag, { passive: false });
document.addEventListener('touchend', endDrag);

widgetBtns.forEach(btn => {
    btn.addEventListener('click', () => createWidget(btn.dataset.type));
});
