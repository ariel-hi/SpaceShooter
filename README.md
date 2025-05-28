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

## Prerequisites

Before running the game, make sure you have:
- [Node.js](https://nodejs.org/) installed (version 14 or higher recommended)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

## Installation

1. Clone or download this repository
2. Open a terminal/command prompt in the project directory
3. Install dependencies by running:
```bash
npm install
```

## Running the Game

### Development Mode
To run the game in development mode with hot-reloading:
```bash
npm start
```
Then open your browser and navigate to `http://localhost:1234`

### Production Build
To create a production build:
```bash
npm run build
```
The built files will be in the `dist` directory. You can serve these files using any static file server.

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