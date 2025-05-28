import { Game } from './core/Game.js';

// Add Electron close button logic
let ipcRenderer = null;
try {
    // Only available in Electron
    ipcRenderer = window.require ? window.require('electron').ipcRenderer : null;
} catch (e) {}

// Initialize and start the game
window.onload = () => {
    // Wait for loading animation to complete
    setTimeout(() => {
        const gameContainer = document.getElementById('game-container');
        const game = new Game(gameContainer);
        game.start();
        
        // Ensure background music plays after user interaction (for autoplay policy)
        const bgMusic = document.getElementById('bg-music');
        if (bgMusic) {
            bgMusic.volume = 0.25;
        }
        const resumeMusic = () => {
            if (bgMusic && bgMusic.paused) {
                bgMusic.play().catch(() => {});
            }
            window.removeEventListener('click', resumeMusic);
            window.removeEventListener('keydown', resumeMusic);
        };
        window.addEventListener('click', resumeMusic);
        window.addEventListener('keydown', resumeMusic);

        // Create a volume slider in the bottom left
        const volumeContainer = document.createElement('div');
        volumeContainer.style.position = 'fixed';
        volumeContainer.style.left = '20px';
        volumeContainer.style.bottom = '20px';
        volumeContainer.style.background = 'rgba(0,0,0,0.7)';
        volumeContainer.style.padding = '8px 14px 8px 10px';
        volumeContainer.style.borderRadius = '8px';
        volumeContainer.style.zIndex = 200;
        volumeContainer.style.display = 'flex';
        volumeContainer.style.alignItems = 'center';
        volumeContainer.style.fontFamily = 'Press Start 2P, Courier, monospace';
        volumeContainer.style.fontSize = '12px';
        volumeContainer.style.color = '#fff';
        volumeContainer.style.boxShadow = '0 2px 8px #0008';

        const label = document.createElement('span');
        label.textContent = 'VOLUME';
        label.style.marginRight = '10px';
        volumeContainer.appendChild(label);

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = 0;
        slider.max = 100;
        slider.value = 25;
        slider.style.width = '100px';
        slider.style.marginRight = '8px';
        slider.style.verticalAlign = 'middle';
        slider.title = 'Adjust music volume';
        volumeContainer.appendChild(slider);

        // Show current value
        const valueLabel = document.createElement('span');
        valueLabel.textContent = '25%';
        valueLabel.style.marginLeft = '2px';
        volumeContainer.appendChild(valueLabel);

        slider.addEventListener('input', () => {
            const vol = slider.value / 100;
            if (bgMusic) bgMusic.volume = vol;
            valueLabel.textContent = `${slider.value}%`;
        });

        document.body.appendChild(volumeContainer);

        // Add close button logic
        const closeBtn = document.getElementById('close-btn');
        if (closeBtn && ipcRenderer) {
            closeBtn.addEventListener('click', () => {
                ipcRenderer.send('close-app');
            });
        }

        console.log('Game initialized and started!');
    }, 2000); // 2 second delay for loading animation
}; 