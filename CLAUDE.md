# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fox Escape is a top-view 2D game built with PixiJS and TypeScript. It features:
- One player controls a fox hiding from computer-controlled hunters
- Another player controls a dragon that protects the fox by shooting fireballs
- The fox needs to collect food while avoiding being seen

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint
```

## Architecture

### Core Structure
- `Game`: Main game controller that initializes the PIXI application and manages the game loop
- `World`: Manages all game entities and their interactions
- `InputManager`: Handles keyboard input for both players
- `AssetManager`: Loads and manages game assets

### Entity System
- `Entity`: Base class for all game objects with common properties (position, velocity, sprite)
- Game entities extend the base Entity class:
  - `Fox`: Player 1 character that collects food and avoids hunters
  - `Dragon`: Player 2 character that shoots fireballs
  - `Hunter`: AI-controlled enemy that patrols and chases the fox
  - `Food`: Collectible items for the fox
  - `Obstacle`: Static objects that block movement and line of sight
  - `Fireball`: Projectiles shot by the dragon

### Systems
- `CollisionSystem`: Handles collision detection between entities
  - AABB (Axis-Aligned Bounding Box) collision 
  - Line-of-sight detection for hunters

### Configuration
- `MapConfig`: Defines map dimensions, entity counts, and obstacle placements
- `GameConfig`: Controls game settings like canvas size and audio volume

### Testing
- Jest for unit testing
- Each class has corresponding test file
- Tests focus on individual component behavior
- TTD write and run tests as you code
