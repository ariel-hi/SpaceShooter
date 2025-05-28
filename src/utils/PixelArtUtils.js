import * as PIXI from 'pixi.js';
import { CONFIG } from './Config.js';

export class PixelArtUtils {
    /**
     * Creates a pixel art spaceship
     * @param {number} size - Base size of the ship
     * @param {number} mainColor - Main color of the ship
     * @param {number} lightColor - Light/highlight color
     * @param {number} darkColor - Dark/shadow color
     * @returns {PIXI.Container} - Container with the ship graphics
     */
    static createPixelShip(size, mainColor, lightColor, darkColor) {
        const container = new PIXI.Container();
        const scale = CONFIG.GAME.PIXEL_SCALE;
        
        // Main ship body
        const body = new PIXI.Graphics();
        
        // Dark outline
        body.beginFill(darkColor);
        body.drawRect(-size/2 - 1, -size/2 - 1, size + 2, size + 2);
        body.endFill();
        
        // Main ship color
        body.beginFill(mainColor);
        body.drawRect(-size/2, -size/2, size, size);
        body.endFill();
        
        // Cockpit (lighter color)
        body.beginFill(lightColor);
        body.drawRect(-2 * scale, -size/3, 4 * scale, 6 * scale);
        body.endFill();
        
        // Ship wings (dark color)
        body.beginFill(darkColor);
        // Left wing
        body.drawRect(-size/2, 0, size/4, size/2);
        // Right wing
        body.drawRect(size/4, 0, size/4, size/2);
        body.endFill();
        
        // Wing highlights (light color)
        body.beginFill(lightColor);
        // Left highlight
        body.drawRect(-size/2 + scale, scale, 2 * scale, 2 * scale);
        // Right highlight
        body.drawRect(size/4 + scale, scale, 2 * scale, 2 * scale);
        body.endFill();
        
        container.addChild(body);
        
        // Engine flames (will be animated)
        const engine = new PIXI.Graphics();
        engine.beginFill(CONFIG.COLORS.BULLET_YELLOW);
        engine.drawRect(-scale * 3, size/2, 2 * scale, 3 * scale);
        engine.drawRect(scale, size/2, 2 * scale, 3 * scale);
        engine.endFill();
        
        engine.beginFill(CONFIG.COLORS.BULLET_YELLOW_LIGHT);
        engine.drawRect(-scale * 3, size/2 + scale, 2 * scale, scale);
        engine.drawRect(scale, size/2 + scale, 2 * scale, scale);
        engine.endFill();
        
        engine.name = 'engine';
        container.addChild(engine);
        
        return container;
    }
    
    /**
     * Creates a pixel art asteroid
     * @param {number} size - Size of the asteroid
     * @param {number} type - Asteroid shape variation (0-3)
     * @returns {PIXI.Container} - Container with the asteroid graphics
     */
    static createPixelAsteroid(size, type) {
        const container = new PIXI.Container();
        const mainColor = CONFIG.COLORS.ASTEROID_GRAY;
        const lightColor = CONFIG.COLORS.ASTEROID_LIGHT;
        const darkColor = CONFIG.COLORS.ASTEROID_DARK;
        const scale = CONFIG.GAME.PIXEL_SCALE;
        
        // Create asteroid shape
        const asteroid = new PIXI.Graphics();
        
        // Asteroid outline
        asteroid.beginFill(darkColor);
        
        const halfSize = Math.floor(size / 2);
        const quarterSize = Math.floor(size / 4);
        
        switch(type % 4) {
            case 0: // Roughly circular
                asteroid.drawRect(-halfSize - scale, -halfSize, size + 2 * scale, size);
                asteroid.drawRect(-halfSize, -halfSize - scale, size, size + 2 * scale);
                break;
            case 1: // More rectangular
                asteroid.drawRect(-halfSize - scale, -halfSize + scale, size + 2 * scale, size - 2 * scale);
                asteroid.drawRect(-halfSize + scale, -halfSize - scale, size - 2 * scale, size + 2 * scale);
                break;
            case 2: // Irregular shape 1
                asteroid.drawRect(-halfSize, -halfSize, size, size);
                asteroid.drawRect(-halfSize - scale * 2, -quarterSize, scale * 2, quarterSize * 2);
                asteroid.drawRect(halfSize, quarterSize, scale * 2, quarterSize);
                break;
            case 3: // Irregular shape 2
                asteroid.drawRect(-halfSize + scale, -halfSize, size - 2 * scale, size);
                asteroid.drawRect(-halfSize, -halfSize + scale, size, size - 2 * scale);
                asteroid.drawRect(-halfSize - scale, quarterSize, scale * 2, quarterSize);
                asteroid.drawRect(halfSize - scale, -halfSize - scale, scale * 2, quarterSize);
                break;
        }
        asteroid.endFill();
        
        // Main asteroid body
        asteroid.beginFill(mainColor);
        asteroid.drawRect(-halfSize, -halfSize, size, size);
        asteroid.endFill();
        
        // Add cracks and details
        asteroid.beginFill(darkColor);
        
        // Add unique cracks based on type
        for (let i = 0; i < 3 + type; i++) {
            const x = (Math.random() - 0.5) * size * 0.7;
            const y = (Math.random() - 0.5) * size * 0.7;
            const width = Math.floor(scale * (1 + Math.random()));
            const height = Math.floor(scale * (1 + Math.random()));
            asteroid.drawRect(x, y, width, height);
        }
        asteroid.endFill();
        
        // Highlight spots
        asteroid.beginFill(lightColor);
        for (let i = 0; i < 2; i++) {
            const x = (Math.random() - 0.5) * size * 0.6;
            const y = (Math.random() - 0.5) * size * 0.6;
            const spotSize = Math.floor(scale * (1 + Math.random()));
            asteroid.drawRect(x, y, spotSize, spotSize);
        }
        asteroid.endFill();
        
        container.addChild(asteroid);
        return container;
    }
    
    /**
     * Creates a pixel art bullet
     * @param {number} size - Size of the bullet
     * @param {number} color - Color of the bullet
     * @returns {PIXI.Container} - Container with the bullet graphics
     */
    static createPixelBullet(size, color) {
        const container = new PIXI.Container();
        const scale = CONFIG.GAME.PIXEL_SCALE;
        
        const bullet = new PIXI.Graphics();
        const lightColor = CONFIG.COLORS.BULLET_YELLOW_LIGHT;
        
        // Bullet body
        bullet.beginFill(color);
        bullet.drawRect(-size / 2, -size, size, size * 2);
        bullet.endFill();
        
        // Bullet highlight
        bullet.beginFill(lightColor);
        bullet.drawRect(-size / 2, -size, Math.ceil(size / 3), size);
        bullet.endFill();
        
        container.addChild(bullet);
        return container;
    }
    
    /**
     * Creates a pixel art explosion effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} size - Size of explosion
     * @param {PIXI.Container} container - Container to add the explosion to
     * @param {number} [particleCount] - Optional number of particles (default: CONFIG.EFFECTS.EXPLOSION_PARTICLES)
     * @param {boolean} [isImpact] - Whether this is a bullet impact (smaller and faster)
     * @returns {Function} - Animation update function
     */
    static createExplosion(x, y, size, container, particleCount, isImpact = false) {
        const particles = [];
        const particleNum = particleCount || CONFIG.EFFECTS.EXPLOSION_PARTICLES;
        
        // Different colors for different explosion types
        const colors = isImpact ? 
            [CONFIG.COLORS.BULLET_YELLOW, CONFIG.COLORS.BULLET_YELLOW_LIGHT] : 
            [
                CONFIG.COLORS.BULLET_YELLOW,
                CONFIG.COLORS.BULLET_YELLOW_LIGHT, 
                CONFIG.COLORS.ENEMY_RED,
                CONFIG.COLORS.ENEMY_RED_LIGHT
            ];
        
        // Create explosion particles
        for (let i = 0; i < particleNum; i++) {
            const particle = new PIXI.Graphics();
            const color = colors[Math.floor(Math.random() * colors.length)];
            const particleSize = Math.max(1, Math.floor(size / 8 * Math.random()));
            
            particle.beginFill(color);
            particle.drawRect(0, 0, particleSize, particleSize);
            particle.endFill();
            
            particle.x = x;
            particle.y = y;
            
            // Random velocity
            const angle = Math.random() * Math.PI * 2;
            const speedFactor = isImpact ? 0.7 : 1; // Impact explosions are a bit slower
            const speed = (1 + Math.random() * 3) * speedFactor;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            
            // Add to container
            container.addChild(particle);
            particles.push(particle);
        }
        
        // Return animation function
        let frame = 0;
        const duration = isImpact ? CONFIG.EFFECTS.EXPLOSION_DURATION * 0.7 : CONFIG.EFFECTS.EXPLOSION_DURATION;
        
        return (delta) => {
            frame += delta;
            
            // Update particles
            for (const particle of particles) {
                particle.x += particle.vx * delta;
                particle.y += particle.vy * delta;
                particle.alpha = Math.max(0, 1 - frame / duration);
            }
            
            // Remove when animation is complete
            if (frame >= duration) {
                for (const particle of particles) {
                    container.removeChild(particle);
                    particle.destroy();
                }
                return true; // Animation complete
            }
            
            return false;
        };
    }
    
    /**
     * Creates a parallax starfield background
     * @param {PIXI.Container} container - Container to add stars to
     * @returns {Function} - Animation update function
     */
    static createStarfield(container) {
        const stars = [];
        const width = CONFIG.GAME.WIDTH;
        const height = CONFIG.GAME.HEIGHT;
        const scale = CONFIG.GAME.PIXEL_SCALE;
        
        // Create different layers of stars
        for (let layer = 0; layer < CONFIG.EFFECTS.STAR_LAYERS; layer++) {
            const layerSpeed = CONFIG.EFFECTS.STAR_SPEED * (layer + 1) / CONFIG.EFFECTS.STAR_LAYERS;
            const starCount = Math.floor(CONFIG.EFFECTS.STAR_COUNT / CONFIG.EFFECTS.STAR_LAYERS);
            const layerAlpha = 0.3 + (layer / CONFIG.EFFECTS.STAR_LAYERS) * 0.7;
            
            for (let i = 0; i < starCount; i++) {
                const star = new PIXI.Graphics();
                const size = layer === CONFIG.EFFECTS.STAR_LAYERS - 1 ? 2 : 1;
                
                // Random star color
                const colors = [0xffffff, 0xccccff, 0xffcccc, 0xffffcc];
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                star.beginFill(color);
                star.drawRect(0, 0, size, size);
                star.endFill();
                
                star.x = Math.random() * width;
                star.y = Math.random() * height;
                star.alpha = layerAlpha;
                star.speed = layerSpeed;
                
                container.addChild(star);
                stars.push(star);
            }
        }
        
        // Return animation function
        return (delta) => {
            for (const star of stars) {
                star.y += star.speed * delta;
                
                // Wrap around when off screen
                if (star.y > height) {
                    star.y = -2;
                    star.x = Math.random() * width;
                }
            }
        };
    }
} 