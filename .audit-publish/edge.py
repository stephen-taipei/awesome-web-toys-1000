from pathlib import Path
ROOT=Path.cwd()
p=ROOT/'toys/998-local-font/script.js';s=p.read_text();a=s.index('        li.innerHTML = `');b=s.index("        li.addEventListener('click'",a)
s=s[:a]+'''        const name = document.createElement('span');
        name.textContent = font.fullName;
        const family = document.createElement('span');
        family.className = 'font-meta';
        family.textContent = font.family;
        li.append(name, family);
        li.tabIndex = 0;
        li.setAttribute('role', 'button');
        li.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                selectFont(font, li);
            }
        });
'''+s[b:];p.write_text(s)
p=ROOT/'toys/647-wavy-text/script.js';s=p.read_text();a=s.index('    wavyText.innerHTML');b=s.index('\n}',a)
s=s[:a]+'''    // Keep combining marks and emoji sequences together when supported.
    const characters = typeof Intl.Segmenter === 'function'
        ? Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), item => item.segment)
        : Array.from(text);
    wavyText.replaceChildren(...characters.map((character, index) => {
        const span = document.createElement('span');
        span.style.animationDelay = `${index * 0.05}s`;
        span.textContent = character === ' ' ? '\\u00a0' : character;
        return span;
    }));'''+s[b:];s=s.replace("addEventListener('keypress'", "addEventListener('keydown'");p.write_text(s)
p=ROOT/'toys/996-multi-screen/script.js';s=p.read_text().replace("statusEl.innerHTML = 'Window Management API not supported.<br>Enable <b>chrome://flags/#window-placement</b> if available.';", "statusEl.textContent = 'Window Management API unavailable. Use HTTPS and a supporting browser.';")
a=s.index("scanBtn.addEventListener('click'");b=s.index('\nfunction renderScreens',a)
s=s[:a]+'''let activeScreenDetails = null;
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
'''+s[b:]
a=s.index('        win.document.write(`');b=s.index('\n    } else {',a)
s=s[:a]+'''        // Screen labels are device metadata, never HTML.
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
        win.opener = null;'''+s[b:];p.write_text(s)
for p in ROOT.glob('toys/1000-*/script.js'):
 s=p.read_text();s=s.replace('!f.exploded || particles.some(p => p.life > 0)', '!f.exploded');p.write_text(s)
