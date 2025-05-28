import * as PIXI from 'pixi.js';
import { Player } from '../entities/Player.js';
import { AsteroidManager } from '../systems/AsteroidManager.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { ScoreManager } from '../systems/ScoreManager.js';
import { UpgradeSystem } from '../systems/UpgradeSystem.js';
import { CONFIG } from '../utils/Config.js';
import { PixelArtUtils } from '../utils/PixelArtUtils.js';

export class Game {
    constructor(containerElement) {
        // Create PIXI application
        this.app = new PIXI.Application({
            width: CONFIG.GAME.WIDTH,
            height: CONFIG.GAME.HEIGHT,
            backgroundColor: CONFIG.GAME.BG_COLOR,
            antialias: false, // Disable antialiasing for pixel art
            resolution: 1     // Set resolution to 1 for crisp pixels
        });
        
        // Add the canvas to the container element if provided
        if (containerElement) {
            containerElement.appendChild(this.app.view);
        } else {
            document.body.appendChild(this.app.view);
        }
        
        // Game state
        this.gameOver = false;
        this.paused = false;
        this.explosions = [];
        
        // Game containers - setup layers
        this.bgContainer = new PIXI.Container(); // Starfield background
        this.gameContainer = new PIXI.Container(); // Game objects
        this.fxContainer = new PIXI.Container();  // Visual effects
        this.uiContainer = new PIXI.Container();  // UI elements
        
        this.app.stage.addChild(this.bgContainer);
        this.app.stage.addChild(this.gameContainer);
        this.app.stage.addChild(this.fxContainer);
        this.app.stage.addChild(this.uiContainer);
        
        // Create starfield background
        this.createStarfield();
        
        // Create player
        this.player = new Player(
            CONFIG.GAME.WIDTH / 2,
            CONFIG.GAME.HEIGHT - 100,
            this.gameContainer
        );

        // Game systems
        this.scoreManager = new ScoreManager(this.uiContainer);
        this.upgradeSystem = new UpgradeSystem(this.uiContainer, this);
        this.asteroidManager = new AsteroidManager(this.gameContainer, this);
        this.collisionSystem = new CollisionSystem();
        
        // Setup input handlers
        this.setupInputHandlers();
    }
    
    createStarfield() {
        // Create pixelated starfield background
        this.starfieldUpdate = PixelArtUtils.createStarfield(this.bgContainer);
    }
    
    start() {
        // Start the game loop
        this.app.ticker.add(this.update.bind(this));
        
        // Initial game setup
        this.scoreManager.initialize();
        this.asteroidManager.initialize();
        
        console.log('Game started');
    }
    
    update(delta) {
        // Update starfield background
        this.starfieldUpdate(delta);
        
        if (this.gameOver || this.paused) return;
        
        // Update player
        this.player.update(delta);
        
        // Update asteroids
        this.asteroidManager.update(delta);
        
        // Check collisions
        this.handleCollisions();
        
        // Update explosion effects
        this.updateExplosions(delta);
    }
    
    updateExplosions(delta) {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            // Call update function for each explosion
            const isComplete = this.explosions[i](delta);
            if (isComplete) {
                this.explosions.splice(i, 1);
            }
        }
    }
    
    handleCollisions() {
        // Check player-asteroid collisions
        const asteroids = this.asteroidManager.getAsteroids();
        const playerHit = this.collisionSystem.checkPlayerAsteroidCollisions(this.player, asteroids);
        
        if (playerHit) {
            // Create explosion at player position
            this.createExplosion(this.player.x, this.player.y, CONFIG.PLAYER.SIZE);
            
            this.gameOver = true;
            this.endGame();
            return;
        }
        
        // Check player-spike collisions
        const spikes = this.asteroidManager.getSpikes();
        const spikeHit = this.collisionSystem.checkPlayerSpikeCollisions(this.player, spikes);
        
        if (spikeHit) {
            // Create explosion at player position
            this.createExplosion(this.player.x, this.player.y, CONFIG.PLAYER.SIZE);
            
            this.gameOver = true;
            this.endGame();
            return;
        }
        
        // Check bullet-asteroid collisions
        const bullets = this.player.getBullets();
        const collisions = this.collisionSystem.checkBulletAsteroidCollisions(bullets, asteroids);
        
        // Handle all collisions
        for (const collision of collisions) {
            const bullet = collision.bullet;
            const asteroid = collision.asteroid;
            
            // Apply damage to asteroid
            const damage = bullet.getDamage();
            const destroyed = asteroid.takeDamage(damage);
            
            // Create a small explosion at hit point
            this.createBulletImpact(bullet.x, bullet.y, bullet.size);
            this.playSFX('sfx-hit');
            
            // Remove the bullet in all cases
            this.player.removeBullet(bullet);
            
            // If asteroid was destroyed, create explosion and award score
            if (destroyed) {
                // Create explosion at collision point
                this.createExplosion(
                    asteroid.x, 
                    asteroid.y, 
                    asteroid.size
                );
                // Calculate score based on asteroid size
                const sizeBonus = Math.floor((asteroid.size / CONFIG.ASTEROID.MIN_SIZE) * CONFIG.SCORE.ASTEROID_DESTROYED);
                const totalScore = CONFIG.SCORE.ASTEROID_DESTROYED + sizeBonus;
                
                this.asteroidManager.destroyAsteroid(asteroid);
                this.scoreManager.addScore(Math.floor(totalScore));
                this.upgradeSystem.incrementAsteroidsDestroyed();
                this.scoreManager.setAsteroidsToUpgrade(this.upgradeSystem.getAsteroidsDestroyed());
                this.playSFX('sfx-destroy');
            }
        }
    }
    
    createExplosion(x, y, size) {
        const explosionUpdate = PixelArtUtils.createExplosion(x, y, size, this.fxContainer);
        this.explosions.push(explosionUpdate);
    }
    
    createBulletImpact(x, y, size) {
        // Create a smaller explosion for bullet impacts
        const impactSize = size * 2;
        const particleCount = Math.floor(CONFIG.EFFECTS.EXPLOSION_PARTICLES * 0.3);
        
        const impactUpdate = PixelArtUtils.createExplosion(
            x, y, impactSize, this.fxContainer, particleCount, true
        );
        
        this.explosions.push(impactUpdate);
    }
    
    setupInputHandlers() {
        // Keyboard input setup
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }
    
    handleKeyDown(event) {
        if (this.gameOver) {
            if (event.code === 'KeyR') {
                this.restart();
            }
            return;
        }
        
        if (this.paused && !this.upgradeSystem.upgradeScreenContainer) {
            if (event.code === 'KeyP') {
                this.togglePause();
            }
            return;
        }
        
        switch (event.code) {
            case 'ArrowLeft':
            case 'KeyA':
                this.player.moveLeft();
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.player.moveRight();
                break;
            case 'Space':
                this.player.shoot();
                break;
            case 'KeyP':
                this.togglePause();
                break;
        }
    }
    
    handleKeyUp(event) {
        if (this.gameOver) return;
        
        switch (event.code) {
            case 'ArrowLeft':
            case 'KeyA':
                if (this.player.isMovingLeft()) this.player.stopMoving();
                break;
            case 'ArrowRight':
            case 'KeyD':
                if (this.player.isMovingRight()) this.player.stopMoving();
                break;
        }
    }
    
    togglePause() {
        // Don't toggle pause if upgrade screen is active
        if (this.upgradeSystem.upgradeScreenContainer) return;
        
        this.paused = !this.paused;
        
        // Show pause indicator
        if (this.paused) {
            this.showPauseIndicator();
        } else {
            this.hidePauseIndicator();
        }
    }
    
    showPauseIndicator() {
        if (this.pauseText) return;
        
        this.pauseText = new PIXI.Text('PAUSED', {
            fontFamily: 'Press Start 2P, Courier, monospace',
            fontSize: 32,
            fill: 0xffffff,
            align: 'center'
        });
        
        this.pauseText.anchor.set(0.5);
        this.pauseText.x = CONFIG.GAME.WIDTH / 2;
        this.pauseText.y = CONFIG.GAME.HEIGHT / 2;
        
        this.uiContainer.addChild(this.pauseText);
    }
    
    hidePauseIndicator() {
        if (this.pauseText) {
            this.uiContainer.removeChild(this.pauseText);
            this.pauseText = null;
        }
    }
    
    endGame() {
        console.log('Game over! Final score:', this.scoreManager.getScore());
        
        // Show game over screen
        const gameOverText = new PIXI.Text('GAME OVER', {
            fontFamily: 'Press Start 2P, Courier, monospace',
            fontSize: 36,
            fill: CONFIG.COLORS.ENEMY_RED,
            align: 'center',
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowDistance: 4
        });
        
        gameOverText.anchor.set(0.5);
        gameOverText.x = CONFIG.GAME.WIDTH / 2;
        gameOverText.y = CONFIG.GAME.HEIGHT / 2 - 50;
        
        const scoreText = new PIXI.Text(`Score: ${this.scoreManager.getScore()}`, {
            fontFamily: 'Press Start 2P, Courier, monospace',
            fontSize: 24,
            fill: CONFIG.COLORS.UI_GREEN,
            align: 'center'
        });
        
        scoreText.anchor.set(0.5);
        scoreText.x = CONFIG.GAME.WIDTH / 2;
        scoreText.y = CONFIG.GAME.HEIGHT / 2 + 10;
        
        const restartText = new PIXI.Text('Press R to restart', {
            fontFamily: 'Press Start 2P, Courier, monospace',
            fontSize: 18,
            fill: 0xffffff,
            align: 'center'
        });
        
        restartText.anchor.set(0.5);
        restartText.x = CONFIG.GAME.WIDTH / 2;
        restartText.y = CONFIG.GAME.HEIGHT / 2 + 60;
        
        this.uiContainer.addChild(gameOverText);
        this.uiContainer.addChild(scoreText);
        this.uiContainer.addChild(restartText);
        
        this.playSFX('sfx-defeat');
    }
    
    restart() {
        // Clear the stage
        this.gameContainer.removeChildren();
        this.fxContainer.removeChildren();
        this.uiContainer.removeChildren();
        
        // Reset game state
        this.gameOver = false;
        this.paused = false;
        this.explosions = [];
        
        // Recreate player
        this.player = new Player(
            CONFIG.GAME.WIDTH / 2,
            CONFIG.GAME.HEIGHT - 100,
            this.gameContainer
        );
        
        // Reset systems
        this.scoreManager.reset();
        this.scoreManager.initialize();
        this.upgradeSystem.reset();
        this.asteroidManager.initialize();
        this.scoreManager.setAsteroidsToUpgrade(0);
        
        console.log('Game restarted');
    }
    
    playSFX(id) {
        const el = document.getElementById(id);
        if (el) {
            el.currentTime = 0;
            // Add pitch variation for hit and destroy
            if (id === 'sfx-hit' || id === 'sfx-destroy') {
                el.playbackRate = 0.9 + Math.random() * 0.25; // 0.9 to 1.15
            } else {
                el.playbackRate = 1.0;
            }
            el.play().catch(() => {});
        }
    }
} 