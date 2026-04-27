# 🔮 Emoji Oracle

A mystical single-page web application where users receive a 3-emoji fortune interpreted by a live AI.

## ✨ Features

- **Mystical Interaction**: Shake your phone (via `DeviceMotionEvent`) or click the glowing crystal ball to initiate a reading.
- **Crystal Ball Visuals**: A custom-drawn CSS crystal ball with radial gradients, pulsing inner glows, and rotating glares.
- **Emoji Slot-Machine**: Each fortune starts with a rapid, animated cycle through 200+ emojis before locking in three distinct symbols with descending crystal chimes.
- **Live AI Interpretation**: Uses the **Pollinations.ai** text API (no key required!) to interpret the 3 emojis into a mystical, slightly absurd, and strangely accurate fortune reading.
- **Web Audio Ambience**: A real-time synthetic drone (55Hz/73Hz sines) and reverb-simulated chimes provide an immersive mystical atmosphere.
- **Shareable Fortunes**: Generates a custom parchment-style canvas card of your reading that you can download and share.
- **History Tracking**: Saves your previous consultations to `localStorage` so you can review your mystical journey.

## 🚀 Getting Started

1.  Clone or download this repository.
2.  Open `index.html` in any modern web browser.
3.  Or run a local server:
    ```bash
    python -m http.server 8000
    ```
    *Note: To use the shake feature on mobile, ensure your browser has permission to access motion sensors.*

## 🛠️ Tech Stack

- **HTML5 & CSS3**: Custom animations and sphere rendering.
- **Vanilla JavaScript**: Shake detection, slot-machine logic, and state management.
- **Pollinations.ai**: Live AI text generation (Mistral model).
- **Web Audio API**: Synthetic drone and sound effects.

---
*Built for the VishwaNova Weboreel Hackathon.*
