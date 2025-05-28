# Space Shooter Roguelike

A classic space shooter game with roguelike elements. Destroy asteroids to earn points and upgrade your ship!

## Features

- Control a spaceship that moves side-to-side and shoots upward
- Dodge and destroy incoming asteroids
- Earn points for destroying asteroids
- Unlock upgrades as you earn more points
- Progressive difficulty as the game goes on

## New Feature: Spikes
- After the 5th upgrade, indestructible spike hazards begin to fall alongside asteroids.
- Spikes cannot be destroyed and will instantly defeat the player on collision.
- Spikes are visually distinct (red, spiky triangles).

## Controls

- **Left Arrow / A:** Move left
- **Right Arrow / D:** Move right
- **Space:** Shoot
- **P:** Pause game
- **R:** Restart game (when game over)

## Upgrades

Earn points to unlock the following upgrades:
- Faster fire rate
- Larger bullets
- Faster bullets
- Double shot capability
- Triple shot capability

## Installation

1. Clone this repository
2. Install dependencies: `npm install`
3. Run the game: `npm start`

## Development

The game is built with the following technologies:
- JavaScript (ES6+)
- Pixi.js for rendering
- Parcel for bundling

## Project Structure

- `src/core/` - Core game logic
- `src/entities/` - Game entities (Player, Bullet, Asteroid)
- `src/systems/` - Game systems (Collision, Score, Upgrades)
- `src/utils/` - Utility functions and configurations

## License

MIT 