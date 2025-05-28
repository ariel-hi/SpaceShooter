import { Asteroid } from '../entities/Asteroid.js';
import { CONFIG } from '../utils/Config.js';

export class AsteroidManager {
    constructor(container, gameInstance) {
        this.container = container;
        this.game = gameInstance;
        this.asteroids = [];
        this.lastSpawnTime = 0;
        this.spawnRate = CONFIG.ASTEROID.SPAWN_RATE;
        this.difficultyMultiplier = 1;
        this.waveTimer = 0;
        this.spawnPattern = 'random'; // Current spawn pattern
    }
    
    initialize() {
        this.asteroids = [];
        this.difficultyMultiplier = 1;
        this.lastSpawnTime = Date.now();
        this.waveTimer = 0;
        this.spawnPattern = 'random';
    }
    
    update(delta) {
        // Spawn new asteroids
        this.spawnAsteroids(delta);
        
        // Update existing asteroids
        this.updateAsteroids(delta);
        
        // Increase difficulty over time
        this.updateDifficulty(delta);
    }
    
    spawnAsteroids(delta) {
        const currentTime = Date.now();
        const adjustedSpawnRate = this.spawnRate / this.difficultyMultiplier;
        
        // Update wave timer
        this.waveTimer += delta;
        
        // Change spawn pattern every 1000 frames (about 16 seconds)
        if (this.waveTimer > 1000) {
            this.changeSpawnPattern();
            this.waveTimer = 0;
        }
        
        if (currentTime - this.lastSpawnTime < adjustedSpawnRate) {
            return; // Not time to spawn yet
        }
        
        this.lastSpawnTime = currentTime;
        
        // Spawn based on current pattern
        switch(this.spawnPattern) {
            case 'random':
                this.createAsteroid();
                break;
            case 'cluster':
                // Spawn 3-5 asteroids in a cluster
                const clusterCount = 3 + Math.floor(Math.random() * 3);
                const baseX = Math.random() * CONFIG.GAME.WIDTH;
                for (let i = 0; i < clusterCount; i++) {
                    const offsetX = (Math.random() - 0.5) * 100;
                    this.createAsteroid(baseX + offsetX);
                }
                break;
            case 'wall':
                // Create a wall of asteroids
                const segments = 4 + Math.floor(this.difficultyMultiplier);
                const width = CONFIG.GAME.WIDTH / segments;
                for (let i = 0; i < segments; i++) {
                    if (Math.random() < 0.7) { // 70% chance to spawn each segment
                        this.createAsteroid(i * width + width / 2);
                    }
                }
                break;
            case 'zigzag':
                // Create a zigzag pattern
                const zigzagPosition = (CONFIG.GAME.WIDTH / 2) + 
                    Math.sin(this.waveTimer * 0.01) * (CONFIG.GAME.WIDTH / 3);
                this.createAsteroid(zigzagPosition);
                break;
        }
    }
    
    changeSpawnPattern() {
        const patterns = ['random', 'cluster', 'wall', 'zigzag'];
        let newPattern;
        
        // Pick a different pattern than the current one
        do {
            newPattern = patterns[Math.floor(Math.random() * patterns.length)];
        } while (newPattern === this.spawnPattern);
        
        this.spawnPattern = newPattern;
        console.log(`Spawn pattern changed to: ${this.spawnPattern}`);
    }
    
    createAsteroid(x = null) {
        // Random position at the top of the screen if not specified
        if (x === null) {
            x = Math.random() * CONFIG.GAME.WIDTH;
        }
        
        const y = -CONFIG.ASTEROID.MAX_SIZE;
        
        // Random size
        const size = CONFIG.ASTEROID.MIN_SIZE + 
            Math.random() * (CONFIG.ASTEROID.MAX_SIZE - CONFIG.ASTEROID.MIN_SIZE);
        
        // Random speed (adjusted by difficulty)
        const baseSpeed = CONFIG.ASTEROID.MIN_SPEED + 
            Math.random() * (CONFIG.ASTEROID.MAX_SPEED - CONFIG.ASTEROID.MIN_SPEED);
        const speed = baseSpeed * this.difficultyMultiplier;
        
        // Get the player's upgrade count to scale HP
        const upgradeCount = this.game?.player?.getUpgradeCount() || 0;
        const upgradeHpScale = 1 + (upgradeCount * 0.2); // Each upgrade increases HP by 20%
        
        // Create asteroid with upgrade-scaled HP
        const asteroid = new Asteroid(x, y, size, speed, this.container, upgradeHpScale);
        this.asteroids.push(asteroid);
    }
    
    updateAsteroids(delta) {
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const asteroid = this.asteroids[i];
            asteroid.update(delta);
            
            // Remove asteroids that are off screen
            if (asteroid.isOffScreen()) {
                this.removeAsteroid(i);
            }
        }
    }
    
    updateDifficulty(delta) {
        // Gradually increase difficulty over time
        this.difficultyMultiplier = 1 + (Date.now() - this.lastSpawnTime) / 60000;
        
        // Cap the difficulty multiplier
        if (this.difficultyMultiplier > 2.5) {
            this.difficultyMultiplier = 2.5;
        }
    }
    
    destroyAsteroid(asteroid) {
        const index = this.asteroids.indexOf(asteroid);
        if (index !== -1) {
            this.removeAsteroid(index);
        }
    }
    
    removeAsteroid(index) {
        // Destroy sprite and remove from array
        this.asteroids[index].destroy();
        this.asteroids.splice(index, 1);
    }
    
    getAsteroids() {
        return this.asteroids;
    }
} 