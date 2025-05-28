import * as PIXI from 'pixi.js';
import { CONFIG } from '../utils/Config.js';

export class UpgradeSystem {
    constructor(uiContainer, gameInstance) {
        this.uiContainer = uiContainer;
        this.game = gameInstance;
        this.upgradePool = CONFIG.UPGRADE.POOL;
        this.asteroidsDestroyed = 0; // Track asteroids destroyed since last upgrade
        this.upgradeScreenContainer = null;
        this.selectedUpgrade = null;
        this.upgradeOptions = [];
    }
    
    incrementAsteroidsDestroyed() {
        this.asteroidsDestroyed++;
        if (this.asteroidsDestroyed >= 5) {
            this.asteroidsDestroyed = 0;
            this.showUpgradeScreen();
            return true;
        }
        return false;
    }
    
    getAsteroidsDestroyed() {
        return this.asteroidsDestroyed;
    }
    
    showUpgradeScreen() {
        // Pause the game
        this.game.paused = true;
        
        // Reset score digits to their normal position
        this.game.scoreManager.resetAllDigits();
        
        // Create upgrade screen container
        this.upgradeScreenContainer = new PIXI.Container();
        this.uiContainer.addChild(this.upgradeScreenContainer);
        
        // Dark semi-transparent background
        const background = new PIXI.Graphics();
        background.beginFill(CONFIG.COLORS.SPACE_BG, 0.9);
        background.drawRect(0, 0, CONFIG.GAME.WIDTH, CONFIG.GAME.HEIGHT);
        background.endFill();
        this.upgradeScreenContainer.addChild(background);
        
        // Pixel art grid pattern for background
        const gridSize = 20;
        const grid = new PIXI.Graphics();
        grid.lineStyle(1, CONFIG.COLORS.SPACE_BG_2, 0.3);
        
        // Draw vertical lines
        for (let x = 0; x <= CONFIG.GAME.WIDTH; x += gridSize) {
            grid.moveTo(x, 0);
            grid.lineTo(x, CONFIG.GAME.HEIGHT);
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= CONFIG.GAME.HEIGHT; y += gridSize) {
            grid.moveTo(0, y);
            grid.lineTo(CONFIG.GAME.WIDTH, y);
        }
        
        this.upgradeScreenContainer.addChild(grid);
        
        // Add shine effect animation
        this.createShineEffect();
        
        // Title
        const titleText = new PIXI.Text('CHOOSE AN UPGRADE', {
            fontFamily: 'Press Start 2P, Courier, monospace',
            fontSize: 30,
            fill: CONFIG.COLORS.UI_PURPLE,
            align: 'center',
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowDistance: 4
        });
        
        titleText.anchor.set(0.5, 0);
        titleText.x = CONFIG.GAME.WIDTH / 2;
        titleText.y = 60;
        this.upgradeScreenContainer.addChild(titleText);
        
        // Subtitle
        const subtitleText = new PIXI.Text('PRESS 1, 2, OR 3 TO SELECT', {
            fontFamily: 'Press Start 2P, Courier, monospace',
            fontSize: 16,
            fill: CONFIG.COLORS.UI_PURPLE_LIGHT,
            align: 'center'
        });
        
        subtitleText.anchor.set(0.5, 0);
        subtitleText.x = CONFIG.GAME.WIDTH / 2;
        subtitleText.y = 110;
        this.upgradeScreenContainer.addChild(subtitleText);
        
        // Generate three random upgrades
        this.generateUpgradeOptions();
        
        // Add keyboard event listeners
        window.addEventListener('keydown', this.handleKeyDown = this.handleKeyDown.bind(this));
    }
    
    createShineEffect() {
        // Create a radial shine effect
        const shine = new PIXI.Graphics();
        
        // Pixel-art friendly shine - concentric squares
        for (let i = 0; i < 5; i++) {
            const alpha = 0.1 - i * 0.02;
            const size = 600 - i * 100;
            
            shine.beginFill(CONFIG.COLORS.UI_PURPLE_LIGHT, alpha);
            shine.drawRect(
                CONFIG.GAME.WIDTH / 2 - size / 2,
                CONFIG.GAME.HEIGHT / 2 - size / 2,
                size,
                size
            );
            shine.endFill();
        }
        
        this.upgradeScreenContainer.addChild(shine);
        
        // Create a pulsing animation
        let time = 0;
        const animate = (delta) => {
            if (!this.upgradeScreenContainer) {
                this.game.app.ticker.remove(animate);
                return;
            }
            
            time += delta * 0.01;
            const scale = 1 + Math.sin(time) * 0.03; // Subtle pulse
            shine.scale.set(scale);
        };
        
        this.game.app.ticker.add(animate);
    }
    
    handleKeyDown(event) {
        if (!this.upgradeScreenContainer) return;
        
        switch (event.key) {
            case '1':
                if (this.upgradeOptions[0]) {
                    this.selectUpgrade(this.upgradeOptions[0].upgrade);
                }
                break;
            case '2':
                if (this.upgradeOptions[1]) {
                    this.selectUpgrade(this.upgradeOptions[1].upgrade);
                }
                break;
            case '3':
                if (this.upgradeOptions[2]) {
                    this.selectUpgrade(this.upgradeOptions[2].upgrade);
                }
                break;
        }
    }
    
    generateUpgradeOptions() {
        // Clear any previous options
        this.upgradeOptions = [];
        
        // Get three random upgrades from the pool
        const shuffledPool = [...this.upgradePool].sort(() => Math.random() - 0.5);
        const selectedUpgrades = shuffledPool.slice(0, 3);
        
        // Card dimensions
        const cardWidth = 180;
        const cardHeight = 240;
        const cardSpacing = 30;
        const totalWidth = (cardWidth * 3) + (cardSpacing * 2);
        const startX = (CONFIG.GAME.WIDTH - totalWidth) / 2;
        
        // Create upgrade option cards
        for (let i = 0; i < selectedUpgrades.length; i++) {
            const upgrade = selectedUpgrades[i];
            
            // Create card container
            const cardContainer = new PIXI.Container();
            cardContainer.x = startX + i * (cardWidth + cardSpacing);
            cardContainer.y = 180;
            cardContainer.upgrade = upgrade;
            this.upgradeScreenContainer.addChild(cardContainer);
            this.upgradeOptions.push(cardContainer);
            
            // Card background - pixel art style
            const card = new PIXI.Graphics();
            
            // Outer border
            card.beginFill(0x000000);
            card.drawRect(0, 0, cardWidth, cardHeight);
            card.endFill();
            
            // Inner background with grid pattern
            card.beginFill(CONFIG.COLORS.SPACE_BG_2);
            card.drawRect(4, 4, cardWidth - 8, cardHeight - 8);
            card.endFill();
            
            // Draw grid pattern
            card.lineStyle(1, 0x000000, 0.2);
            for (let x = 0; x <= cardWidth; x += 10) {
                card.moveTo(x, 0);
                card.lineTo(x, cardHeight);
            }
            for (let y = 0; y <= cardHeight; y += 10) {
                card.moveTo(0, y);
                card.lineTo(cardWidth, y);
            }
            
            // Highlight top of card
            card.beginFill(this.getUpgradeColor(upgrade));
            card.drawRect(4, 4, cardWidth - 8, 40);
            card.endFill();
            
            cardContainer.addChild(card);
            
            // Key number (1, 2, or 3) - pixel art style
            const keyBox = new PIXI.Graphics();
            keyBox.beginFill(0x000000);
            keyBox.drawRect(10, 14, 24, 24);
            keyBox.endFill();
            
            keyBox.beginFill(this.getUpgradeColor(upgrade, true));
            keyBox.drawRect(12, 16, 20, 20);
            keyBox.endFill();
            cardContainer.addChild(keyBox);
            
            const keyText = new PIXI.Text(`${i + 1}`, {
                fontFamily: 'Press Start 2P, Courier, monospace',
                fontSize: 16,
                fontWeight: 'bold',
                fill: 0x000000,
                align: 'center'
            });
            keyText.x = 16;
            keyText.y = 18;
            cardContainer.addChild(keyText);
            
            // Upgrade name
            const nameText = new PIXI.Text(upgrade.name.toUpperCase(), {
                fontFamily: 'Press Start 2P, Courier, monospace',
                fontSize: 12,
                fontWeight: 'bold',
                fill: 0xffffff,
                align: 'center'
            });
            nameText.anchor.set(0.5, 0);
            nameText.x = cardWidth / 2;
            nameText.y = 52;
            cardContainer.addChild(nameText);
            
            // Upgrade description
            const descText = new PIXI.Text(upgrade.description, {
                fontFamily: 'Press Start 2P, Courier, monospace',
                fontSize: 9,
                fill: 0xcccccc,
                align: 'center',
                wordWrap: true,
                wordWrapWidth: cardWidth - 30
            });
            descText.anchor.set(0.5, 0);
            descText.x = cardWidth / 2;
            descText.y = 85;
            cardContainer.addChild(descText);
            
            // Add upgrade icon based on type
            this.addUpgradeIcon(upgrade, cardContainer);
            
            // Make card interactive
            card.interactive = true;
            card.buttonMode = true;
            
            card.on('pointerover', () => {
                card.tint = 0xaaaaaa;
            });
            
            card.on('pointerout', () => {
                card.tint = 0xffffff;
            });
            
            card.on('pointerdown', () => {
                this.selectUpgrade(upgrade);
            });
        }
    }
    
    addUpgradeIcon(upgrade, cardContainer) {
        const icon = new PIXI.Graphics();
        
        // Position at bottom of card
        const cardWidth = 180; // Match the card width defined in generateUpgradeOptions
        icon.x = cardWidth / 2;
        icon.y = 160;
        
        // Draw different icon based on upgrade type
        switch(upgrade.type) {
            case 'FIRE_RATE_BOOST':
                // Fire rate icon (machine gun)
                const barCount = 6;
                const barWidth = 6;
                const barSpacing = 3;
                const totalWidth = barCount * (barWidth + barSpacing) - barSpacing;
                
                icon.beginFill(CONFIG.COLORS.BULLET_YELLOW);
                for (let i = 0; i < barCount; i++) {
                    // Varied height bullets to show a burst
                    const height = 10 + Math.sin(i * 0.9) * 20;
                    const x = -totalWidth/2 + i * (barWidth + barSpacing);
                    icon.drawRect(x, -height/2, barWidth, height);
                }
                icon.endFill();
                break;
                
            case 'BULLET_SIZE_BOOST':
                // Increasing size bullets
                const bulletSizes = [8, 12, 16, 20];
                const bulletSpacing = 12;
                const bulletsTotalWidth = bulletSizes.reduce((sum, size) => sum + size, 0) + 
                                        bulletSpacing * (bulletSizes.length - 1);
                
                icon.beginFill(CONFIG.COLORS.BULLET_YELLOW);
                let xPos = -bulletsTotalWidth/2;
                for (let size of bulletSizes) {
                    icon.drawRect(xPos, -size/2, size, size);
                    xPos += size + bulletSpacing;
                }
                icon.endFill();
                break;
                
            case 'BULLET_SPEED_BOOST':
                // Fast bullet with trail
                icon.beginFill(CONFIG.COLORS.BULLET_YELLOW);
                icon.drawRect(-5, -20, 10, 20); // Main bullet
                icon.endFill();
                
                // Speed lines (trail)
                icon.beginFill(CONFIG.COLORS.BULLET_YELLOW_LIGHT, 0.7);
                icon.drawRect(-5, 5, 10, 5);
                icon.endFill();
                
                icon.beginFill(CONFIG.COLORS.BULLET_YELLOW_LIGHT, 0.5);
                icon.drawRect(-5, 15, 10, 8);
                icon.endFill();
                
                icon.beginFill(CONFIG.COLORS.BULLET_YELLOW_LIGHT, 0.3);
                icon.drawRect(-5, 28, 10, 12);
                icon.endFill();
                
                // Direction arrow
                icon.beginFill(CONFIG.COLORS.UI_GREEN);
                icon.drawRect(-15, -15, 5, 30);
                icon.drawRect(-20, -5, 15, 5);
                icon.endFill();
                break;
                
            case 'ADDITIONAL_SHOT':
                // Additional shot icon (current shots → current+1)
                // Draw bullet pattern
                icon.beginFill(CONFIG.COLORS.BULLET_YELLOW);
                
                // Draw existing bullet(s)
                icon.drawRect(-20, -15, 6, 15);
                
                // Draw new bullet with + sign
                icon.drawRect(10, -15, 6, 15);
                icon.endFill();
                
                // Plus sign
                icon.beginFill(CONFIG.COLORS.UI_GREEN);
                icon.drawRect(5, -5, 16, 4);  // Horizontal bar
                icon.drawRect(11, -11, 4, 16); // Vertical bar
                icon.endFill();
                
                // Ship outline at bottom
                icon.beginFill(CONFIG.COLORS.PLAYER_BLUE);
                icon.drawRect(-10, 10, 20, 10);
                icon.endFill();
                break;
                
            case 'DAMAGE_BOOST':
                // Damage boost icon (bullet with damage number)
                // Bullet
                icon.beginFill(CONFIG.COLORS.BULLET_YELLOW);
                icon.drawRect(-10, -25, 20, 25);
                icon.endFill();
                
                // Target with impact
                icon.beginFill(CONFIG.COLORS.ENEMY_RED);
                // Concentric circles for target
                icon.drawRect(-25, 10, 50, 4); // Horizontal
                icon.drawRect(-2, -15, 4, 50); // Vertical
                
                // Impact mark
                const impactSize = 20;
                icon.beginFill(CONFIG.COLORS.ENEMY_RED_LIGHT);
                // Create an X shape for impact
                icon.drawRect(-impactSize/2, -impactSize/2, impactSize, 4);
                icon.drawRect(-impactSize/2, impactSize/2 - 4, impactSize, 4);
                icon.drawRect(-2, -impactSize/2, 4, impactSize);
                icon.endFill();
                
                // Damage number
                const damageText = new PIXI.Text(`+${upgrade.value}`, {
                    fontFamily: 'Press Start 2P, Courier, monospace',
                    fontSize: 12,
                    fontWeight: 'bold',
                    fill: CONFIG.COLORS.UI_GREEN,
                    align: 'center'
                });
                damageText.anchor.set(0.5);
                damageText.x = 20;
                damageText.y = -10;
                
                icon.addChild(damageText);
                break;
                
            case 'PLAYER_SPEED_BOOST':
                // Ship with speed trails
                // Ship body
                icon.beginFill(CONFIG.COLORS.PLAYER_BLUE);
                icon.drawRect(-12, -10, 24, 20);
                icon.endFill();
                
                // Speed trails
                icon.beginFill(CONFIG.COLORS.PLAYER_BLUE_LIGHT, 0.7);
                icon.drawRect(-12, 15, 24, 5);
                icon.endFill();
                
                icon.beginFill(CONFIG.COLORS.PLAYER_BLUE_LIGHT, 0.5);
                icon.drawRect(-12, 25, 24, 8);
                icon.endFill();
                
                icon.beginFill(CONFIG.COLORS.PLAYER_BLUE_LIGHT, 0.3);
                icon.drawRect(-12, 38, 24, 12);
                icon.endFill();
                
                // Direction arrows
                icon.beginFill(CONFIG.COLORS.UI_GREEN);
                // Left arrow
                icon.drawRect(-30, -5, 10, 10);
                // Right arrow
                icon.drawRect(20, -5, 10, 10);
                icon.endFill();
                break;
        }
        
        cardContainer.addChild(icon);
    }
    
    getUpgradeColor(upgrade, isLight = false) {
        // Return color based on upgrade type
        switch(upgrade.type) {
            case 'FIRE_RATE_BOOST':
            case 'BULLET_SPEED_BOOST':
            case 'BULLET_SIZE_BOOST':
                return isLight ? CONFIG.COLORS.BULLET_YELLOW_LIGHT : CONFIG.COLORS.BULLET_YELLOW;
            case 'ADDITIONAL_SHOT':
                return isLight ? CONFIG.COLORS.UI_PURPLE_LIGHT : CONFIG.COLORS.UI_PURPLE;
            case 'DAMAGE_BOOST':
                return isLight ? CONFIG.COLORS.ENEMY_RED_LIGHT : CONFIG.COLORS.ENEMY_RED;
            case 'PLAYER_SPEED_BOOST':
                return isLight ? CONFIG.COLORS.PLAYER_BLUE_LIGHT : CONFIG.COLORS.PLAYER_BLUE;
            default:
                return isLight ? CONFIG.COLORS.UI_GREEN_LIGHT : CONFIG.COLORS.UI_GREEN;
        }
    }
    
    selectUpgrade(upgrade) {
        this.selectedUpgrade = upgrade;
        this.applySelectedUpgrade();
        if (this.game.playSFX) {
            const el = document.getElementById('sfx-upgrade');
            if (el) {
                el.currentTime = 0;
                el.playbackRate = 1.3; // Unique, higher pitch for upgrade
                el.play().catch(() => {});
            }
        }
        this.closeUpgradeScreen();
    }
    
    closeUpgradeScreen() {
        if (this.upgradeScreenContainer) {
            this.uiContainer.removeChild(this.upgradeScreenContainer);
            this.upgradeScreenContainer = null;
            this.upgradeOptions = [];
            
            // Remove keyboard event listener
            window.removeEventListener('keydown', this.handleKeyDown);
        }
        
        // Resume the game
        this.game.paused = false;
    }
    
    applySelectedUpgrade() {
        if (!this.selectedUpgrade) return;
        
        // Apply the upgrade to the player
        this.game.player.applyUpgrade(this.selectedUpgrade);
        
        // Show notification
        this.displayUpgradeMessage(this.selectedUpgrade);
        
        // Reset selected upgrade
        this.selectedUpgrade = null;
    }
    
    displayUpgradeMessage(upgrade) {
        // Create floating text notification
        const messageText = new PIXI.Text(`UPGRADE: ${upgrade.name.toUpperCase()}`, {
            fontFamily: 'Press Start 2P, Courier, monospace',
            fontSize: 20,
            fontWeight: 'bold',
            fill: this.getUpgradeColor(upgrade),
            align: 'center',
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowDistance: 2
        });
        
        messageText.anchor.set(0.5);
        messageText.x = CONFIG.GAME.WIDTH / 2;
        messageText.y = CONFIG.GAME.HEIGHT / 2;
        this.uiContainer.addChild(messageText);
        
        // Animate the notification
        let elapsed = 0;
        const animate = (delta) => {
            elapsed += delta;
            
            // Pixelated movement (move in 2-pixel increments)
            if (elapsed % 2 === 0) {
                messageText.y -= 1;
            }
            
            // Flashing effect
            messageText.visible = (Math.floor(elapsed / 5) % 2 === 0);
            
            // Fade out at the end
            if (elapsed > 30) {
                messageText.alpha = Math.max(0, 1 - (elapsed - 30) / 30);
            }
            
            if (elapsed >= 60) {
                this.uiContainer.removeChild(messageText);
                this.game.app.ticker.remove(animate);
            }
        };
        
        this.game.app.ticker.add(animate);
        
        console.log(`Upgrade applied: ${upgrade.name}`);
    }
    
    reset() {
        this.asteroidsDestroyed = 0;
        if (this.upgradeScreenContainer) {
            this.closeUpgradeScreen();
        }
    }
} 