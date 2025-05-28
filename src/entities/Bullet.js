import * as PIXI from 'pixi.js';
import { PixelArtUtils } from '../utils/PixelArtUtils.js';

export class Bullet {
    constructor(x, y, size, speed, color, damage, container) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.color = color;
        this.damage = damage;
        this.container = container;
        
        // Create bullet graphics
        this.createBullet();
        
        // Add to container
        this.container.addChild(this.bulletContainer);
    }
    
    createBullet() {
        // Create pixel art bullet
        this.bulletContainer = PixelArtUtils.createPixelBullet(this.size, this.color);
        this.bulletContainer.x = this.x;
        this.bulletContainer.y = this.y;
    }
    
    update(delta) {
        // Move bullet upward
        this.y -= this.speed * delta;
        this.bulletContainer.y = this.y;
        
        // Add slight wobble to the bullet for visual interest
        this.bulletContainer.rotation = Math.sin(this.y * 0.1) * 0.05;
    }
    
    destroy() {
        this.container.removeChild(this.bulletContainer);
        this.bulletContainer.destroy();
    }
    
    getHitbox() {
        return {
            x: this.x,
            y: this.y,
            radius: this.size * 0.9 // Slightly smaller hitbox for accuracy
        };
    }
    
    getDamage() {
        return this.damage;
    }
} 