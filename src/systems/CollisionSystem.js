export class CollisionSystem {
    constructor() {
        this.collisions = [];
    }
    
    checkPlayerAsteroidCollisions(player, asteroids) {
        const playerHitbox = player.getHitbox();
        
        for (const asteroid of asteroids) {
            const asteroidHitbox = asteroid.getHitbox();
            
            if (this.checkCircleCollision(playerHitbox, asteroidHitbox)) {
                return true; // Player was hit
            }
        }
        
        return false; // No collision
    }
    
    checkBulletAsteroidCollisions(bullets, asteroids) {
        this.collisions = [];
        
        for (const bullet of bullets) {
            const bulletHitbox = bullet.getHitbox();
            
            for (const asteroid of asteroids) {
                const asteroidHitbox = asteroid.getHitbox();
                
                if (this.checkCircleCollision(bulletHitbox, asteroidHitbox)) {
                    this.collisions.push({
                        bullet: bullet,
                        asteroid: asteroid
                    });
                    
                    // Only record one collision per bullet
                    break;
                }
            }
        }
        
        return this.collisions;
    }
    
    checkCircleCollision(circle1, circle2) {
        // Calculate distance between circle centers
        const dx = circle1.x - circle2.x;
        const dy = circle1.y - circle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if circles overlap
        return distance < circle1.radius + circle2.radius;
    }
    
    checkPlayerSpikeCollisions(player, spikes) {
        const playerHitbox = player.getHitbox();
        for (const spike of spikes) {
            const spikeHitbox = spike.getHitbox();
            if (this.checkCircleCollision(playerHitbox, spikeHitbox)) {
                return true; // Player hit a spike
            }
        }
        return false;
    }
} 