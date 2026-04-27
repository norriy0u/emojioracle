/* --- MYSTICAL AUDIO ENGINE --- */

let audioCtx = null;
let droneOsc1, droneOsc2;
let isAudioEnabled = false;

function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create Drones (55Hz and 73Hz)
    droneOsc1 = createDrone(55, 0.05);
    droneOsc2 = createDrone(73, 0.03);
}

function createDrone(freq, vol) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    
    gain.gain.value = 0; // Start muted
    
    osc.connect(filter).connect(gain).connect(audioCtx.destination);
    osc.start();
    
    return { osc, gain };
}

function toggleAudio() {
    if (!audioCtx) initAudio();
    
    const btn = document.getElementById('audio-toggle');
    if (isAudioEnabled) {
        droneOsc1.gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.5);
        droneOsc2.gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.5);
        btn.style.opacity = '0.5';
    } else {
        audioCtx.resume();
        droneOsc1.gain.gain.setTargetAtTime(0.05, audioCtx.currentTime, 0.5);
        droneOsc2.gain.gain.setTargetAtTime(0.03, audioCtx.currentTime, 0.5);
        btn.style.opacity = '1';
    }
    isAudioEnabled = !isAudioEnabled;
}

function playChime(freq = 1047, decay = 1) {
    if (!audioCtx || !isAudioEnabled) return;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + decay);
    
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + decay);
}

function playFanfare() {
    if (!audioCtx || !isAudioEnabled) return;
    const now = audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    notes.forEach((note, i) => {
        setTimeout(() => playChime(note, 1.5), i * 200);
    });
}

document.getElementById('audio-toggle').onclick = toggleAudio;
