import * as PIXI from 'pixi.js';
import { CONFIG } from '../utils/Config.js';
import { PixelArtUtils } from '../utils/PixelArtUtils.js';

export class Asteroid {
    constructor(x, y, size, speed, container, hpScale = 1) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.container = container;
        this.hpScale = hpScale;
        
        // Random rotation speed and direction
        this.rotation = (Math.random() * 2 - 1) * CONFIG.ASTEROID.ROTATION_SPEED;
        
        // Random asteroid type (variation)
        this.type = Math.floor(Math.random() * CONFIG.ASTEROID.VARIATIONS);
        
        // Calculate HP based on size
        this.maxHp = this.calculateHp();
        this.hp = this.maxHp;
        
        // Flash effect when hit
        this.flashTime = 0;
        
        // Create asteroid graphics
        this.createAsteroid();
        
        // Add to container
        this.container.addChild(this.asteroidContainer);
    }
    
    calculateHp() {
        // Larger asteroids have more HP
        const sizeFactor = this.size / CONFIG.ASTEROID.MIN_SIZE;
        const baseHp = Math.max(1, Math.floor(CONFIG.ASTEROID.BASE_HP + (sizeFactor - 1) * CONFIG.ASTEROID.HP_SIZE_FACTOR * 10));
        
        // Apply HP scaling from upgrades
        return Math.ceil(baseHp * this.hpScale);
    }
    
    createAsteroid() {
        // Create main container
        this.asteroidContainer = new PIXI.Container();
        
        // Create pixel art asteroid with random type
        this.asteroidSprite = PixelArtUtils.createPixelAsteroid(this.size, this.type);
        this.asteroidContainer.addChild(this.asteroidSprite);
        
        // Create HP bar (only for asteroids with more than 1 HP)
        if (this.maxHp > 1) {
            this.createHpBar();
        }
        
        // Position the container
        this.asteroidContainer.x = this.x;
        this.asteroidContainer.y = this.y;
    }
    
    createHpBar() {
        const barWidth = this.size * 1.2;
        const barHeight = 4;
        
        // HP bar background
        this.hpBarBg = new PIXI.Graphics();
        this.hpBarBg.beginFill(0x000000, 0.5);
        this.hpBarBg.drawRect(-barWidth/2, this.size/2 + 5, barWidth, barHeight);
        this.hpBarBg.endFill();
        
        // HP bar fill
        this.hpBarFill = new PIXI.Graphics();
        this.hpBarFill.beginFill(CONFIG.COLORS.UI_GREEN);
        this.hpBarFill.drawRect(-barWidth/2, this.size/2 + 5, barWidth, barHeight);
        this.hpBarFill.endFill();
        
        // Add to container
        this.asteroidContainer.addChild(this.hpBarBg);
        this.asteroidContainer.addChild(this.hpBarFill);
    }
    
    update(delta) {
        // Move asteroid downward
        this.y += this.speed * delta;
        this.asteroidContainer.y = this.y;
        
        // Rotate asteroid
        this.asteroidContainer.rotation += this.rotation * delta;
        
        // Update HP bar with current health
        this.updateHpBar();
        
        // Update flash effect if active
        if (this.flashTime > 0) {
            this.flashTime -= delta;
            
            // Toggle visibility for flash effect
            this.asteroidSprite.visible = Math.floor(this.flashTime) % 2 === 0;
            
            // Reset when flash is done
            if (this.flashTime <= 0) {
                this.asteroidSprite.visible = true;
                this.asteroidSprite.alpha = 1;
            }
        }
        
        // Update damage text if active
        if (this.damageText) {
            this.damageText.y -= 0.5 * delta;
            this.damageText.alpha = Math.max(0, this.damageText.alpha - 0.02 * delta);
            
            if (this.damageText.alpha <= 0) {
                this.asteroidContainer.removeChild(this.damageText);
                this.damageText = null;
            }
        }
    }
    
    takeDamage(damage) {
        // Apply damage
        this.hp -= damage;
        
        // Update HP bar if it exists
        this.updateHpBar();
        
        // Show damage text
        this.showDamageText(damage);
        
        // Flash effect
        this.flashTime = CONFIG.ASTEROID.HP_FLASH_DURATION;
        
        // Return true if destroyed
        return this.hp <= 0;
    }
    
    updateHpBar() {
        if (!this.hpBarFill || this.hpBarFill.destroyed) return; // Only update if the HP bar exists and is not destroyed
        // Update width based on current HP, but don't let it go negative
        const barWidth = this.size * 1.2;
        const hpRatio = Math.max(0, this.hp / this.maxHp);

        this.hpBarFill.clear();
        this.hpBarFill.beginFill(this.getHealthColor());
        this.hpBarFill.drawRect(-barWidth/2, this.size/2 + 5, barWidth * hpRatio, 4);
        this.hpBarFill.endFill();
    }
    
    getHealthColor() {
        // Color changes based on health percentage
        const healthPercent = this.hp / this.maxHp;
        
        if (healthPercent > 0.6) {
            return CONFIG.COLORS.UI_GREEN;
        } else if (healthPercent > 0.3) {
            return CONFIG.COLORS.BULLET_YELLOW;
        } else {
            return CONFIG.COLORS.ENEMY_RED;
        }
    }
    
    showDamageText(damage) {
        // Remove existing damage text if any
        if (this.damageText) {
            this.asteroidContainer.removeChild(this.damageText);
        }
        
        // Create damage text
        this.damageText = new PIXI.Text(`-${damage}`, {
            fontFamily: 'Press Start 2P, Courier, monospace',
            fontSize: 12,
            fill: CONFIG.COLORS.ENEMY_RED,
            align: 'center',
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowDistance: 1
        });
        
        this.damageText.anchor.set(0.5);
        this.damageText.x = 0;
        this.damageText.y = -this.size/2 - 10;
        this.damageText.alpha = 1;
        
        this.asteroidContainer.addChild(this.damageText);
    }
    
    destroy() {
        this.container.removeChild(this.asteroidContainer);
        this.asteroidContainer.destroy({children: true});
    }
    
    getHitbox() {
        return {
            x: this.x,
            y: this.y,
            radius: this.size * 0.8 // Slightly smaller hitbox for forgiveness
        };
    }
    
    isOffScreen() {
        return this.y > CONFIG.GAME.HEIGHT + this.size;
    }
} 