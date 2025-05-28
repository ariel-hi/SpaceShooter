import * as PIXI from 'pixi.js';
import { Bullet } from './Bullet.js';
import { CONFIG } from '../utils/Config.js';
import { PixelArtUtils } from '../utils/PixelArtUtils.js';

export class Player {
    constructor(x, y, container) {
        this.x = x;
        this.y = y;
        this.container = container;
        this.bullets = [];
        this.lastShootTime = 0;
        
        // Track number of upgrades applied
        this.upgradeCount = 0;
        
        // Player movement
        this.speed = CONFIG.PLAYER.SPEED;
        this.movingLeft = false;
        this.movingRight = false;
        
        // Player shooting properties
        this.fireRate = CONFIG.PLAYER.FIRE_RATE;
        this.bulletSpeed = CONFIG.PLAYER.BULLET_SPEED;
        this.bulletSize = CONFIG.PLAYER.BULLET_SIZE;
        this.shotCount = 1; // Start with single shot
        this.bulletDamage = CONFIG.PLAYER.BULLET_DAMAGE; // Base bullet damage
        
        // Thruster animation
        this.thrusterTime = 0;
        
        // Create player ship graphics
        this.createShip();
        
        // Add to container
        this.container.addChild(this.shipContainer);
    }
    
    createShip() {
        // Create a pixel art spaceship using the utility
        this.shipContainer = PixelArtUtils.createPixelShip(
            CONFIG.PLAYER.SIZE,
            CONFIG.COLORS.PLAYER_BLUE,
            CONFIG.COLORS.PLAYER_BLUE_LIGHT,
            CONFIG.COLORS.PLAYER_BLUE_DARK
        );
        
        this.shipContainer.x = this.x;
        this.shipContainer.y = this.y;
        
        // Get reference to the engine flames for animation
        this.engineFlames = this.shipContainer.getChildByName('engine');
    }
    
    update(delta) {
        // Handle movement
        if (this.movingLeft) {
            this.x -= this.speed * delta;
        }
        if (this.movingRight) {
            this.x += this.speed * delta;
        }
        
        // Boundary checking
        if (this.x < CONFIG.PLAYER.SIZE / 2) {
            this.x = CONFIG.PLAYER.SIZE / 2;
        }
        if (this.x > CONFIG.GAME.WIDTH - CONFIG.PLAYER.SIZE / 2) {
            this.x = CONFIG.GAME.WIDTH - CONFIG.PLAYER.SIZE / 2;
        }
        
        // Update sprite position
        this.shipContainer.x = this.x;
        this.shipContainer.y = this.y;
        
        // Update thruster animation
        this.updateThrusters(delta);
        
        // Update bullets
        this.updateBullets(delta);
    }
    
    updateThrusters(delta) {
        if (!this.engineFlames) return;
        
        // Animate engine flames
        this.thrusterTime += delta * 0.1;
        
        // Pulse the engine flame size
        const pulseScale = 0.8 + Math.sin(this.thrusterTime) * 0.2;
        this.engineFlames.scale.y = pulseScale;
        
        // Flicker the engine flames slightly
        const flicker = 0.9 + Math.random() * 0.2;
        this.engineFlames.alpha = flicker;
        
        // Make flames larger when moving
        if (this.movingLeft || this.movingRight) {
            this.engineFlames.scale.y = pulseScale * 1.5;
        }
    }
    
    updateBullets(delta) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update(delta);
            
            // Remove bullets that are off screen
            if (bullet.y < -bullet.size) {
                this.removeBullet(bullet);
            }
        }
    }
    
    moveLeft() {
        this.movingLeft = true;
        this.movingRight = false;
        
        // Tilt ship slightly when moving
        this.shipContainer.rotation = -0.1;
    }
    
    moveRight() {
        this.movingRight = true;
        this.movingLeft = false;
        
        // Tilt ship slightly when moving
        this.shipContainer.rotation = 0.1;
    }
    
    stopMoving() {
        this.movingLeft = false;
        this.movingRight = false;
        
        // Reset ship rotation
        this.shipContainer.rotation = 0;
    }
    
    isMovingLeft() {
        return this.movingLeft;
    }
    
    isMovingRight() {
        return this.movingRight;
    }
    
    shoot() {
        const currentTime = Date.now();
        
        if (currentTime - this.lastShootTime < this.fireRate) {
            return; // Still on cooldown
        }
        
        this.lastShootTime = currentTime;
        
        // Calculate bullet positions based on shot count
        const positions = this.calculateBulletPositions();
        
        // Create bullets at calculated positions
        for (const pos of positions) {
            this.createBullet(pos.x, pos.y);
        }
        
        // Add a little "kick" when shooting
        this.shipContainer.y += 2;
        
        // Reset position in next frame
        setTimeout(() => {
            if (this.shipContainer) {
                this.shipContainer.y = this.y;
            }
        }, 50);
    }
    
    calculateBulletPositions() {
        const positions = [];
        
        // Based on the number of shots, calculate the positions
        if (this.shotCount === 1) {
            // Single shot - center
            positions.push({ x: this.x, y: this.y });
        } else {
            // For multiple shots, spread them out
            const spreadFactor = Math.min(this.shotCount * 5, 40); // Limit spread width
            
            for (let i = 0; i < this.shotCount; i++) {
                // Calculate spread
                const spreadWidth = this.shotCount === 2 ? 20 : spreadFactor;
                const spreadPosition = (i / (this.shotCount - 1)) * spreadWidth * 2 - spreadWidth;
                
                // Add slight vertical variations for aesthetics when we have many shots
                const verticalOffset = this.shotCount > 3 ? 
                    -5 * Math.sin((i / (this.shotCount - 1)) * Math.PI) : 0;
                
                positions.push({ 
                    x: this.x + spreadPosition, 
                    y: this.y + verticalOffset
                });
            }
        }
        
        return positions;
    }
    
    createBullet(x, y) {
        const bullet = new Bullet(
            x, 
            y, 
            this.bulletSize, 
            this.bulletSpeed, 
            CONFIG.COLORS.BULLET_YELLOW,
            this.bulletDamage,
            this.container
        );
        
        this.bullets.push(bullet);
    }
    
    removeBullet(bullet) {
        const index = this.bullets.indexOf(bullet);
        if (index !== -1) {
            bullet.destroy();
            this.bullets.splice(index, 1);
        }
    }
    
    getBullets() {
        return this.bullets;
    }
    
    getHitbox() {
        return {
            x: this.x,
            y: this.y,
            radius: CONFIG.PLAYER.SIZE / 2 * 0.8 // Slightly smaller hitbox for forgiveness
        };
    }
    
    applyUpgrade(upgrade) {
        // Increment upgrade count
        this.upgradeCount++;
        
        switch (upgrade.type) {
            case 'FIRE_RATE_BOOST':
                // Multiply current fire rate by the boost factor (lower is faster)
                this.fireRate = Math.floor(this.fireRate * upgrade.value);
                console.log(`Fire rate improved to: ${this.fireRate}ms`);
                break;
                
            case 'BULLET_SIZE_BOOST':
                // Multiply current bullet size by the boost factor
                this.bulletSize = Math.ceil(this.bulletSize * upgrade.value);
                console.log(`Bullet size increased to: ${this.bulletSize}`);
                break;
                
            case 'BULLET_SPEED_BOOST':
                // Multiply current bullet speed by the boost factor
                this.bulletSpeed = Math.ceil(this.bulletSpeed * upgrade.value);
                console.log(`Bullet speed increased to: ${this.bulletSpeed}`);
                break;
                
            case 'ADDITIONAL_SHOT':
                // Add one more shot
                this.shotCount += upgrade.value;
                console.log(`Shot count increased to: ${this.shotCount}`);
                break;
                
            case 'PLAYER_SPEED_BOOST':
                // Multiply current speed by the boost factor
                this.speed = Math.ceil(this.speed * upgrade.value);
                console.log(`Player speed increased to: ${this.speed}`);
                break;
                
            case 'DAMAGE_BOOST':
                // Add to damage
                this.bulletDamage += upgrade.value;
                console.log(`Bullet damage increased to: ${this.bulletDamage}`);
                break;
        }
        
        console.log(`Upgrade applied: ${upgrade.name}`);
    }
    
    getUpgradeCount() {
        return this.upgradeCount;
    }
} 