const scanBtn = document.getElementById('scanBtn');
const statusEl = document.getElementById('status');
const screensContainer = document.getElementById('screensContainer');
const template = document.getElementById('screenTemplate');

// Check support
if (!('getScreenDetails' in window)) {
    scanBtn.disabled = true;
    statusEl.textContent = 'Window Management API unavailable. Use HTTPS and a supporting browser.';
    statusEl.style.color = '#ff7675';
}

let activeScreenDetails = null;
let screenRequest = 0;
const onScreensChange = () => {
    if (!activeScreenDetails) return;
    renderScreens(activeScreenDetails);
    statusEl.textContent = `Found ${activeScreenDetails.screens.length} display(s).`;
};

scanBtn.addEventListener('click', async () => {
    if (scanBtn.disabled) return;
    const request = ++screenRequest;
    scanBtn.disabled = true;
    try {
        const details = await window.getScreenDetails();
        if (request !== screenRequest) return;
        activeScreenDetails?.removeEventListener('screenschange', onScreensChange);
        activeScreenDetails = details;
        activeScreenDetails.addEventListener('screenschange', onScreensChange);
        onScreensChange();
    } catch (error) {
        if (request === screenRequest) statusEl.textContent = `Error: ${error.message}. Check permission and HTTPS.`;
    } finally {
        if (request === screenRequest) scanBtn.disabled = false;
    }
});

window.addEventListener('pagehide', () => {
    screenRequest++;
    activeScreenDetails?.removeEventListener('screenschange', onScreensChange);
    activeScreenDetails = null;
    scanBtn.disabled = !('getScreenDetails' in window);
});

function renderScreens(screenDetails) {
    screensContainer.innerHTML = '';
    
    screenDetails.screens.forEach((screen, index) => {
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector('.screen-card');
        
        // Mark current screen
        if (screen === screenDetails.currentScreen) {
            card.classList.add('current');
        }
        
        clone.querySelector('.screen-name').textContent = screen.label || `Display ${index + 1}`;
        clone.querySelector('.screen-id').textContent = screen.isInternal ? 'Internal' : 'External';
        clone.querySelector('.screen-res').textContent = `${screen.width} x ${screen.height}`;
        clone.querySelector('.screen-pos').textContent = `Pos: ${screen.left}, ${screen.top}`;
        
        // Action Button
        const btn = clone.querySelector('.open-btn');
        btn.addEventListener('click', () => {
            openWindowOnScreen(screen);
        });
        
        screensContainer.appendChild(clone);
    });
}

function openWindowOnScreen(screen) {
    const features = [
        `left=${screen.availLeft + 100}`, // Slight offset
        `top=${screen.availTop + 100}`,
        `width=400`,
        `height=300`,
        `menubar=no`,
        `toolbar=no`,
        `location=no`,
        `status=no`
    ].join(',');

    const win = window.open('', `_blank${Date.now()}`, features);
    
    if (win) {
        // Screen labels are device metadata, never HTML.
        const document = win.document;
        document.title = 'Display preview';
        document.body.style.cssText = 'background: #0984e3; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; margin: 0;';
        const container = document.createElement('div');
        container.style.textAlign = 'center';
        const heading = document.createElement('h1');
        heading.textContent = 'Hello!';
        const label = document.createElement('p');
        label.textContent = `I was placed on ${screen.label || 'this screen'}`;
        const coordinates = document.createElement('p');
        coordinates.textContent = `Coords: ${screen.left}, ${screen.top}`;
        const close = document.createElement('button');
        close.textContent = 'Close';
        close.style.cssText = 'padding: 10px 20px; cursor: pointer;';
        close.addEventListener('click', () => win.close());
        container.append(heading, label, coordinates, close);
        document.body.replaceChildren(container);
        win.opener = null;
    } else {
        alert('Popup blocked! Please allow popups for this site.');
    }
}
