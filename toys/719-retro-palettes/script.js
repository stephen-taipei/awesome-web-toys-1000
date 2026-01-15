const palettes = {
    gameboy: {
        name: 'Game Boy',
        colors: ['#0f380f', '#306230', '#8bac0f', '#9bbc0f']
    },
    nes: {
        name: 'NES',
        colors: ['#7C7C7C','#0000FC','#0000BC','#4428BC','#940084','#A80020','#A81000','#881400','#503000','#007800','#006800','#005800','#004058','#000000','#BCBCBC','#0078F8','#0058F8','#6844FC','#D800CC','#E40058','#F83800','#E45C10','#AC7C00','#00B800','#00A800','#00A844','#008888','#000000','#F8F8F8','#3CBCFC','#6888FC','#9878F8','#F878F8','#F85898','#F87858','#FCA044','#F8B800','#B8F818','#58D854','#58F898','#00E8D8','#787878','#FCFCFC','#A4E4FC','#B8B8F8','#D8B8F8','#F8B8F8','#F8A4C0','#F0D0B0','#FCE0A8','#F8D878','#D8F878','#B8F8B8','#B8F8D8','#00FCFC','#D8D8D8']
    },
    cga: {
        name: 'CGA',
        colors: ['#000000','#0000AA','#00AA00','#00AAAA','#AA0000','#AA00AA','#AA5500','#AAAAAA','#555555','#5555FF','#55FF55','#55FFFF','#FF5555','#FF55FF','#FFFF55','#FFFFFF']
    },
    c64: {
        name: 'Commodore 64',
        colors: ['#000000','#FFFFFF','#880000','#AAFFEE','#CC44CC','#00CC55','#0000AA','#EEEE77','#DD8855','#664400','#FF7777','#333333','#777777','#AAFF66','#0088FF','#BBBBBB']
    },
    pico8: {
        name: 'PICO-8',
        colors: ['#000000','#1D2B53','#7E2553','#008751','#AB5236','#5F574F','#C2C3C7','#FFF1E8','#FF004D','#FFA300','#FFEC27','#00E436','#29ADFF','#83769C','#FF77A8','#FFCCAA']
    }
};

const display = document.getElementById('paletteDisplay');
const info = document.getElementById('paletteInfo');

function renderPalette(key) {
    const palette = palettes[key];
    display.innerHTML = '';
    palette.colors.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.background = color;
        swatch.addEventListener('click', () => {
            info.textContent = `${color.toUpperCase()}`;
            navigator.clipboard.writeText(color);
        });
        display.appendChild(swatch);
    });
    info.textContent = `${palette.name} - ${palette.colors.length} 色 (點擊複製)`;
}

document.getElementById('paletteSelect').addEventListener('change', (e) => {
    renderPalette(e.target.value);
});

renderPalette('gameboy');
