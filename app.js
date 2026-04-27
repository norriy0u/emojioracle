/* --- EMOJI ORACLE CORE LOGIC --- */

const EMOJI_POOL = [
    "🔮", "🧿", "✨", "🪐", "🌘", "🕯️", "🎭", "🍄", "🐍", "🦉", "🌊", "🌋", "🪬", "💀", "🕯️", "🥀", "🐈‍⬛", "🃏", "🪞", "🗡️",
    "🛸", "🤖", "🚀", "⚡", "🌈", "🎈", "🍔", "🍕", "🥑", "💩", "🦄", "🐉", "🌵", "🌋", "⚓", "🛰️", "💎", "💰", "🕰️", "🗝️",
    "🧠", "👁️", "👣", "👅", "👤", "🧛", "🧟", "🧞", "🧜", "👼", "👻", "👺", "🤡", "🤖", "👽", "👾", "🧶", "🧵", "🧬", "🧪"
];

let state = {
    isOracleWorking: false,
    results: [],
    consultations: parseInt(localStorage.getItem('oracle_count')) || 0,
    history: JSON.parse(localStorage.getItem('oracle_history')) || []
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    initStars();
    initParticles();
    updateCounter();
    renderHistory();
    
    const ball = document.getElementById('crystal-ball');
    ball.addEventListener('click', () => {
        if (!state.isOracleWorking) startOracle();
    });

    // Shake Detection
    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', handleShake);
    }

    document.getElementById('btn-reset').onclick = resetOracle;
    document.getElementById('btn-share').onclick = shareFortune;
    document.getElementById('btn-history').onclick = toggleHistory;
});

// --- SHAKE & INTERACTION ---
let lastShake = 0;
function handleShake(event) {
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;
    
    const threshold = 15;
    const delta = Math.sqrt(acc.x*acc.x + acc.y*acc.y + acc.z*acc.z);
    
    if (delta > threshold && !state.isOracleWorking) {
        const now = Date.now();
        if (now - lastShake > 1000) {
            startOracle();
            lastShake = now;
        }
    }
}

async function startOracle() {
    state.isOracleWorking = true;
    state.results = [];
    
    const ball = document.getElementById('crystal-ball');
    ball.classList.add('ball-shaking');
    
    // Slot machine reveal
    await revealEmoji('slot-1', 1000);
    await revealEmoji('slot-2', 1800);
    await revealEmoji('slot-3', 2600);
    
    ball.classList.remove('ball-shaking');
    playFanfare();
    
    // Increment total consultations
    state.consultations++;
    localStorage.setItem('oracle_count', state.consultations);
    updateCounter();

    // Interpret
    await interpretFortune();
}

async function revealEmoji(slotId, totalTime) {
    const slot = document.getElementById(slotId);
    const interval = 50;
    const steps = totalTime / interval;
    
    return new Promise(resolve => {
        let currentStep = 0;
        const spin = setInterval(() => {
            slot.textContent = EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
            currentStep++;
            if (currentStep >= steps) {
                clearInterval(spin);
                const final = EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
                slot.textContent = final;
                slot.classList.add('locked');
                state.results.push(final);
                playChime(1047 - (state.results.length * 100)); // Descending chimes
                resolve();
            }
        }, interval);
    });
}

// --- AI INTERPRETATION ---
async function interpretFortune() {
    const overlay = document.getElementById('reading-overlay');
    const loader = document.getElementById('oracle-loader');
    const content = document.getElementById('reading-content');
    const question = document.getElementById('user-question').value || "No question asked";

    overlay.classList.remove('hidden');
    loader.classList.remove('hidden');
    content.classList.add('hidden');

    const emojiStr = state.results.join(' ');
    
    const prompt = `You are the Emoji Oracle, a mystical AI fortune teller. 
    The oracle has revealed 3 emojis: ${emojiStr}. 
    The querent's question: '${question}'. 
    Give a mystical, slightly absurd but strangely accurate fortune reading. 
    Reply ONLY in a JSON object with these keys: 
    title (max 5 words), reading (exactly 60 words), luckyNumber (1-99), warningSign (one weird funny warning), auspiciousDay (day of week), verdict (one sentence summary starting with 'The Oracle declares:').`;

    try {
        const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=mistral`);
        const text = await response.text();
        
        // Robust JSON extraction: look for anything between { and }
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        let data;
        try {
            data = JSON.parse(jsonMatch ? jsonMatch[0] : text);
        } catch (e) {
            console.warn("JSON parse failed, trying manual match");
            // Fallback: simple regex match for keys if JSON is malformed
            data = {
                title: (text.match(/title["']?\s*:\s*["']([^"']+)["']/i) || [null, "The Unseen Path"])[1],
                reading: (text.match(/reading["']?\s*:\s*["']([^"']+)["']/i) || [null, "The stars whisper of hidden journeys..."])[1],
                luckyNumber: (text.match(/luckyNumber["']?\s*:\s*(\d+)/i) || text.match(/number["']?\s*:\s*(\d+)/i) || [null, "7"])[1],
                auspiciousDay: (text.match(/auspiciousDay["']?\s*:\s*["']([^"']+)["']/i) || text.match(/day["']?\s*:\s*["']([^"']+)["']/i) || [null, "Today"])[1],
                warningSign: (text.match(/warningSign["']?\s*:\s*["']([^"']+)["']/i) || [null, "Beware of shadows."])[1],
                verdict: (text.match(/verdict["']?\s*:\s*["']([^"']+)["']/i) || [null, "The Oracle declares: Proceed with curiosity."])[1]
            };
        }
        
        // Normalize keys (handle camelCase vs snake_case)
        const normalizedData = {
            title: data.title || "The Starry Path",
            reading: data.reading || "The ether is thick with mystery.",
            luckyNumber: data.luckyNumber || data.lucky_number || data.number || Math.floor(Math.random()*99)+1,
            auspiciousDay: data.auspiciousDay || data.auspicious_day || data.day || "Solsticeday",
            warningSign: data.warningSign || data.warning_sign || data.warning || "None detected.",
            verdict: data.verdict || "The Oracle declares: All is in motion."
        };

        renderReading(normalizedData);
        
        // Save to history
        const historyItem = { ...normalizedData, emojis: state.results, date: new Date().toLocaleDateString() };
        state.history.unshift(historyItem);
        if (state.history.length > 10) state.history.pop();
        localStorage.setItem('oracle_history', JSON.stringify(state.history));
        renderHistory();

    } catch (err) {
        console.error(err);
        renderReading({
            title: "Static in the Ether",
            reading: "The stars are currently out of alignment. The emojis whisper of uncertainty and a spilled cup of tea. Perhaps the question was too powerful for the current lunar phase. Return when the moon has shifted three degrees to the east.",
            luckyNumber: 0,
            auspiciousDay: "Neverday",
            warningSign: "Avoid pigeons with hats.",
            verdict: "The Oracle declares: Try again after a deep breath."
        });
    }
}

function renderReading(data) {
    document.getElementById('oracle-loader').classList.add('hidden');
    document.getElementById('reading-content').classList.remove('hidden');

    document.getElementById('reading-title').textContent = data.title;
    document.getElementById('reading-text').textContent = data.reading;
    document.getElementById('lucky-num').textContent = data.luckyNumber;
    document.getElementById('auspicious-day').textContent = data.auspiciousDay;
    document.getElementById('warning-text').textContent = data.warningSign;
    document.getElementById('verdict-text').textContent = data.verdict;
}

// --- UI HELPERS ---
function resetOracle() {
    document.getElementById('reading-overlay').classList.add('hidden');
    document.querySelectorAll('.slot').forEach(s => {
        s.textContent = '?';
        s.classList.remove('locked');
    });
    document.getElementById('user-question').value = '';
    state.isOracleWorking = false;
}

function updateCounter() {
    document.getElementById('count').textContent = state.consultations;
}

function renderHistory() {
    const list = document.getElementById('history-list');
    list.innerHTML = state.history.map(item => `
        <div class="history-item">
            <div class="history-emojis">${item.emojis.join('')}</div>
            <div class="history-title">${item.title}</div>
            <div class="history-date">${item.date}</div>
        </div>
    `).join('');
}

function toggleHistory() {
    document.getElementById('history-panel').classList.toggle('hidden');
}

// --- VISUALS ---
function initStars() {
    const container = document.getElementById('stars-container');
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        container.appendChild(star);
    }
}

function initParticles() {
    const container = document.getElementById('emoji-particles');
    const funSet = ["✨", "☄️", "🌙", "☁️", "🧿", "🕯️", "🎭"];
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.textContent = funSet[Math.floor(Math.random() * funSet.length)];
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 15 + 's';
        container.appendChild(p);
    }
}

// --- CANVAS SHARE ---
function shareFortune() {
    const canvas = document.getElementById('share-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 600;
    canvas.height = 800;

    // Background
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0,0,600,800);

    // Parchment Effect
    ctx.fillStyle = '#fdf6e3';
    ctx.fillRect(50, 50, 500, 700);

    // Content
    ctx.fillStyle = '#2b1d0e';
    ctx.font = 'bold 40px "Cinzel Decorative"';
    ctx.textAlign = 'center';
    ctx.fillText("THE ORACLE SPEAKS", 300, 150);

    ctx.font = '80px Arial';
    ctx.fillText(state.results.join(' '), 300, 260);

    ctx.font = 'italic 20px "Quattrocento"';
    const text = document.getElementById('reading-text').textContent;
    wrapText(ctx, text, 300, 350, 400, 30);

    ctx.font = 'bold 20px "Quattrocento"';
    ctx.fillText("via Emoji Oracle 🔮", 300, 750);

    const link = document.createElement('a');
    link.download = `EmojiOracleFortune_${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for(let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
}
