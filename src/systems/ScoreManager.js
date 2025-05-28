import * as PIXI from 'pixi.js';
import { CONFIG } from '../utils/Config.js';

export class ScoreManager {
    constructor(container) {
        this.container = container;
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.scoreText = null;
        this.highScoreText = null;
        this.digitTexts = [];
        this.lastScoreDigits = [];
    }
    
    initialize() {
        // Create score panel background
        const panel = new PIXI.Graphics();
        
        // Pixel art style panel
        panel.beginFill(0x000000);
        panel.drawRect(20, 20, 200, 60);
        panel.endFill();
        
        panel.beginFill(CONFIG.COLORS.SPACE_BG_2);
        panel.drawRect(24, 24, 192, 52);
        panel.endFill();
        
        // Grid pattern
        panel.lineStyle(1, 0x000000, 0.2);
        for (let x = 24; x <= 216; x += 8) {
            panel.moveTo(x, 24);
            panel.lineTo(x, 76);
        }
        
        for (let y = 24; y <= 76; y += 8) {
            panel.moveTo(24, y);
            panel.lineTo(216, y);
        }
        
        // Top label accent
        panel.beginFill(CONFIG.COLORS.UI_GREEN);
        panel.drawRect(24, 24, 192, 14);
        panel.endFill();
        
        this.container.addChild(panel);
        
        // Create score label
        const labelText = new PIXI.Text('SCORE', {
            fontFamily: 'Press Start 2P, Courier, monospace',
            fontSize: 12,
            fill: 0x000000,
            align: 'left'
        });
        
        labelText.x = 30;
        labelText.y = 25;
        this.container.addChild(labelText);
        
        // Create high score text
        this.highScoreText = new PIXI.Text(`HI: ${this.formatScore(this.highScore)}`, {
            fontFamily: 'Press Start 2P, Courier, monospace',
            fontSize: 10,
            fill: CONFIG.COLORS.UI_PURPLE,
            align: 'right'
        });
        
        this.highScoreText.x = 200;
        this.highScoreText.y = 26;
        this.highScoreText.anchor.set(1, 0);
        this.container.addChild(this.highScoreText);
        
        // Create individual digit displays for score
        this.createDigitDisplay();
        
        // Add asteroids-to-upgrade counter
        this.asteroidsToUpgradeText = new PIXI.Text('UPGRADE: 0/5', {
            fontFamily: 'Press Start 2P, Courier, monospace',
            fontSize: 12,
            fill: CONFIG.COLORS.UI_PURPLE,
            align: 'left'
        });
        this.asteroidsToUpgradeText.x = 30;
        this.asteroidsToUpgradeText.y = 80;
        this.container.addChild(this.asteroidsToUpgradeText);
    }
    
    createDigitDisplay() {
        // Clear any existing digit texts
        this.digitTexts.forEach(digit => {
            this.container.removeChild(digit);
        });
        this.digitTexts = [];
        
        // Format the current score
        const scoreStr = this.formatScore(this.score);
        
        // Create a container for all digits
        for (let i = 0; i < scoreStr.length; i++) {
            const digitText = new PIXI.Text(scoreStr[i], {
                fontFamily: 'Press Start 2P, Courier, monospace',
                fontSize: 24,
                fontWeight: 'bold',
                fill: CONFIG.COLORS.UI_GREEN,
                align: 'center'
            });
            
            // Fixed position with equal spacing
            digitText.x = 40 + i * 20;
            digitText.y = 42;
            this.container.addChild(digitText);
            this.digitTexts.push(digitText);
        }
        
        // Store current digits for animation purposes
        this.lastScoreDigits = [...scoreStr];
    }
    
    formatScore(score) {
        // Format score with leading zeros
        return score.toString().padStart(6, '0');
    }
    
    addScore(points) {
        this.score += points;
        this.updateScoreDisplay();
        
        // Check for high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            this.updateHighScoreDisplay();
        }
    }
    
    getScore() {
        return this.score;
    }
    
    updateScoreDisplay() {
        const scoreStr = this.formatScore(this.score);
        const newDigits = [...scoreStr];
        
        // Check if we need to rebuild the display
        if (newDigits.length !== this.lastScoreDigits.length) {
            this.createDigitDisplay();
            return;
        }
        
        // Update all digits for consistency
        for (let i = 0; i < newDigits.length; i++) {
            if (newDigits[i] !== this.lastScoreDigits[i]) {
                // Update the digit
                this.digitTexts[i].text = newDigits[i];
                
                // Flash effect
                this.flashDigit(this.digitTexts[i]);
            }
        }
        
        this.lastScoreDigits = [...newDigits];
    }
    
    flashDigit(digitText) {
        // Save original position and color
        const originalY = digitText.y;
        const originalColor = digitText.style.fill;
        
        // Change to highlight color
        digitText.style.fill = 0xffffff;
        
        // Move up slightly
        digitText.y = originalY - 2;
        
        // Reset after a short delay using a promise to ensure it completes
        const resetPromise = new Promise(resolve => {
            const resetTimeout = setTimeout(() => {
                this.resetDigit(digitText, originalY, originalColor);
                resolve();
            }, 100);
            
            // Store the timeout so we can clear it if needed
            digitText.resetTimeout = resetTimeout;
        });
        
        return resetPromise;
    }
    
    resetDigit(digitText, originalY, originalColor) {
        digitText.style.fill = originalColor;
        digitText.y = originalY;
        if (digitText.resetTimeout) {
            clearTimeout(digitText.resetTimeout);
            digitText.resetTimeout = null;
        }
    }
    
    resetAllDigits() {
        // Reset all digits to their original positions and colors
        this.digitTexts.forEach(digit => {
            this.resetDigit(digit, 42, CONFIG.COLORS.UI_GREEN);
        });
    }
    
    updateHighScoreDisplay() {
        if (this.highScoreText) {
            this.highScoreText.text = `HI: ${this.formatScore(this.highScore)}`;
            
            // Flash high score
            const originalColor = this.highScoreText.style.fill;
            this.highScoreText.style.fill = CONFIG.COLORS.UI_PURPLE_LIGHT;
            
            setTimeout(() => {
                this.highScoreText.style.fill = originalColor;
            }, 300);
        }
    }
    
    loadHighScore() {
        const savedScore = localStorage.getItem('highScore');
        return savedScore ? parseInt(savedScore) : 0;
    }
    
    saveHighScore() {
        localStorage.setItem('highScore', this.highScore.toString());
    }
    
    reset() {
        this.score = 0;
        this.updateScoreDisplay();
    }
    
    setAsteroidsToUpgrade(count) {
        this.asteroidsToUpgradeText.text = `UPGRADE: ${count}/5`;
    }
} 