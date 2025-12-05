const scanBtn = document.getElementById('scanBtn');
const statusEl = document.getElementById('status');
const screensContainer = document.getElementById('screensContainer');
const template = document.getElementById('screenTemplate');

// Check support
if (!('getScreenDetails' in window)) {
    scanBtn.disabled = true;
    statusEl.innerHTML = 'Window Management API not supported.<br>Enable <b>chrome://flags/#window-placement</b> if available.';
    statusEl.style.color = '#ff7675';
}

scanBtn.addEventListener('click', async () => {
    try {
        const screenDetails = await window.getScreenDetails();
        renderScreens(screenDetails);
        
        // Listen for changes (plug/unplug monitors)
        screenDetails.addEventListener('screenschange', () => {
            renderScreens(screenDetails);
        });
        
        statusEl.textContent = `Found ${screenDetails.screens.length} display(s).`;
    } catch (err) {
        console.error(err);
        statusEl.textContent = `Error: ${err.message}. Permission denied?`;
    }
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
        win.document.write(`
            <html>
                <body style="background: #0984e3; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; margin: 0;">
                    <div style="text-align: center;">
                        <h1>Hello!</h1>
                        <p>I was placed on ${screen.label || 'this screen'}</p>
                        <p>Coords: ${screen.left}, ${screen.top}</p>
                        <button onclick="window.close()" style="padding: 10px 20px; cursor: pointer;">Close</button>
                    </div>
                </body>
            </html>
        `);
    } else {
        alert('Popup blocked! Please allow popups for this site.');
    }
}
