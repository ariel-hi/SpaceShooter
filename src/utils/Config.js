export const CONFIG = {
    GAME: {
        WIDTH: 800,
        HEIGHT: 600,
        BG_COLOR: 0x0f0f1b, // Deep space blue
        PIXEL_SCALE: 3 // Scale factor for pixel art
    },
    COLORS: {
        // Pixel art color palette
        SPACE_BG: 0x0f0f1b,
        SPACE_BG_2: 0x16162c,
        PLAYER_BLUE: 0x4a78ff,
        PLAYER_BLUE_LIGHT: 0x82a9ff,
        PLAYER_BLUE_DARK: 0x2948b0,
        ENEMY_RED: 0xff4a4a,
        ENEMY_RED_LIGHT: 0xff7e7e,
        ENEMY_RED_DARK: 0xb02929,
        ASTEROID_GRAY: 0xa0a0a8,
        ASTEROID_LIGHT: 0xd0d0d8,
        ASTEROID_DARK: 0x606068,
        BULLET_YELLOW: 0xffde4a,
        BULLET_YELLOW_LIGHT: 0xffec82,
        BULLET_YELLOW_DARK: 0xb09c2a,
        UI_GREEN: 0x4aff94,
        UI_GREEN_LIGHT: 0x82ffc0,
        UI_GREEN_DARK: 0x29b063,
        UI_PURPLE: 0xb44aff,
        UI_PURPLE_LIGHT: 0xd082ff,
        UI_PURPLE_DARK: 0x762ab0
    },
    PLAYER: {
        SPEED: 5,
        SIZE: 32, // Pixel size
        COLOR: 0x4a78ff, // Blue
        FIRE_RATE: 250, // ms between shots
        BULLET_SPEED: 10,
        BULLET_SIZE: 6,
        BULLET_COLOR: 0xffde4a, // Yellow
        ENGINE_PARTICLES: true, // Add engine particle effects
        BULLET_DAMAGE: 1 // Base bullet damage
    },
    ASTEROID: {
        MIN_SIZE: 16,
        MAX_SIZE: 64,
        MIN_SPEED: 2,
        MAX_SPEED: 5,
        SPAWN_RATE: 1000, // ms between spawns
        COLOR: 0xa0a0a8, // Gray
        VARIATIONS: 4, // Number of different asteroid shapes
        ROTATION_SPEED: 0.01,
        // HP values based on size
        BASE_HP: 1, // Minimum HP
        HP_SIZE_FACTOR: 0.1, // HP increases with size
        HP_FLASH_DURATION: 5, // Frames to flash when hit
        DAMAGE_TEXT_DURATION: 30, // Frames to show damage text
        // Health scaling over time
        HP_TIME_SCALING: 0.15, // 15% increase in HP per minute
        HP_TIME_SCALING_MAX: 5, // Maximum multiplier for HP over time
        // Points based on size and health
        BASE_POINTS: 10, // Minimum points
        POINTS_SIZE_FACTOR: 0.5, // Points increase with size
        POINTS_HP_FACTOR: 2 // Points per HP
    },
    EFFECTS: {
        EXPLOSION_PARTICLES: 15,
        EXPLOSION_DURATION: 30,
        STAR_COUNT: 100,
        STAR_LAYERS: 3,
        STAR_SPEED: 0.5
    },
    SCORE: {
        ASTEROID_DESTROYED: 10 // Base score, will be multiplied by size & HP
    },
    UPGRADE: {
        INTERVAL: 100, // Show upgrade options every 100 points
        POOL: [
            { type: 'FIRE_RATE_BOOST', value: 0.8, name: 'Faster Firing', description: 'Reduce time between shots by 20%' },
            
            { type: 'BULLET_SIZE_BOOST', value: 1.3, name: 'Bigger Bullets', description: 'Increase bullet size by 30%' },
            
            { type: 'BULLET_SPEED_BOOST', value: 1.3, name: 'Swifter Bullets', description: 'Increase bullet speed by 50%' },
            
            { type: 'ADDITIONAL_SHOT', value: 1, name: '+1 Shot', description: 'Add one more bullet to your shots' },
            
            { type: 'PLAYER_SPEED_BOOST', value: 1.2, name: 'Increased Mobility', description: 'Move 20% faster' },
            
            { type: 'DAMAGE_BOOST', value: 1, name: '+1 Damage', description: 'Increase bullet damage by 1' }
        ]
    }
}; 