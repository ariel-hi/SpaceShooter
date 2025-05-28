import * as PIXI from 'pixi.js';
import { CONFIG } from '../utils/Config.js';
import { PixelArtUtils } from '../utils/PixelArtUtils.js';

export class Spike {
    constructor(x, y, size, speed, container) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.container = container;
        this.rotation = (Math.random() * 2 - 1) * 0.01;
        this.createSpike();
        this.container.addChild(this.spikeContainer);
    }

    createSpike() {
        this.spikeContainer = new PIXI.Container();
        this.spikeSprite = PixelArtUtils.createPixelSpike(this.size);
        this.spikeContainer.addChild(this.spikeSprite);
        this.spikeContainer.x = this.x;
        this.spikeContainer.y = this.y;
    }

    update(delta) {
        this.y += this.speed * delta;
        this.spikeContainer.y = this.y;
        this.spikeContainer.rotation += this.rotation * delta;
    }

    destroy() {
        this.container.removeChild(this.spikeContainer);
        this.spikeContainer.destroy({children: true});
    }

    getHitbox() {
        return {
            x: this.x,
            y: this.y,
            radius: this.size * 0.7 // Slightly smaller hitbox for spikes
        };
    }

    isOffScreen() {
        return this.y > CONFIG.GAME.HEIGHT + this.size;
    }
} 