const accessBtn = document.getElementById('accessBtn');
const statusEl = document.getElementById('status');
const mainContent = document.getElementById('mainContent');
const fontList = document.getElementById('fontList');
const fontCountEl = document.getElementById('fontCount');
const previewText = document.getElementById('previewText');
const searchInput = document.getElementById('searchFont');
const fontSizeInput = document.getElementById('fontSize');
const sizeValEl = document.getElementById('sizeVal');

let fonts = [];

// Check if API is supported
if (!('queryLocalFonts' in window)) {
    accessBtn.disabled = true;
    statusEl.textContent = 'Your browser does not support the Local Font Access API.';
    statusEl.style.color = '#d63031';
}

accessBtn.addEventListener('click', async () => {
    statusEl.textContent = 'Requesting permission...';
    
    try {
        const availableFonts = await window.queryLocalFonts();
        fonts = availableFonts;
        
        statusEl.textContent = `Access granted. Loaded ${fonts.length} fonts.`;
        statusEl.style.color = '#00b894';
        accessBtn.style.display = 'none';
        mainContent.style.display = 'flex';
        fontCountEl.textContent = fonts.length;
        
        renderFontList(fonts);
        
    } catch (err) {
        statusEl.textContent = `Error: ${err.message}`;
        statusEl.style.color = '#d63031';
    }
});

function renderFontList(fontData) {
    fontList.innerHTML = '';
    
    // Limit to first 100 for performance if list is huge, implement infinite scroll ideally
    // For this toy, we'll render first 200 or filtered list
    const displayFonts = fontData.slice(0, 200); 

    displayFonts.forEach(font => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${font.fullName}</span>
            <span class="font-meta">${font.family}</span>
        `;
        li.addEventListener('click', () => selectFont(font, li));
        fontList.appendChild(li);
    });
}

function selectFont(fontData, liElement) {
    // Remove active class from others
    document.querySelectorAll('li.active').forEach(el => el.classList.remove('active'));
    liElement.classList.add('active');
    
    // Apply font to textarea
    // Note: fontData.family gives the font family name, but sometimes we need the PostScript name
    // Ideally we should use the blob if we can get it, but queryLocalFonts returns metadata.
    // Usually setting fontFamily to the name works if it's installed.
    previewText.style.fontFamily = `"${fontData.family}", "${fontData.fullName}", sans-serif`;
}

searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = fonts.filter(f => 
        f.fullName.toLowerCase().includes(term) || 
        f.family.toLowerCase().includes(term)
    );
    renderFontList(filtered);
});

fontSizeInput.addEventListener('input', (e) => {
    const size = e.target.value;
    sizeValEl.textContent = size;
    previewText.style.fontSize = `${size}px`;
});
