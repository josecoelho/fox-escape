# Fox Escape

A top-view 2D game set in the woods where one player controls a fox hiding from computer-controlled hunters, and another player controls a dragon that protects the fox by shooting fireballs at the hunters. Built with PixiJS and TypeScript.

## Game Overview

### Gameplay
- **Player 1 (Fox)**: Collect food while avoiding being seen by hunters. The fox can hide temporarily to avoid detection.
- **Player 2 (Dragon)**: Protect the fox by shooting fireballs at hunters.
- **Hunters**: Computer-controlled characters that patrol the map and chase the fox if spotted.

### Controls
- **Fox (Player 1)**:
  - Arrow keys to move
  - Space to toggle hiding
- **Dragon (Player 2)**:
  - WASD keys to move
  - F to shoot fireballs

## Development Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/fox-escape.git
cd fox-escape

# Install dependencies
npm install
```

### Running the Development Server
```bash
npm run dev
```
This will start a Vite dev server on http://localhost:3000.

### Building for Production
```bash
npm run build
```
The build files will be located in the `dist` directory.

### Preview Production Build
```bash
npm run preview
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Project Structure

- `src/` - Source code
  - `core/` - Core game engine
  - `entities/` - Game entities (Fox, Dragon, Hunter, etc.)
  - `systems/` - Game systems (Collision, etc.)
  - `utils/` - Utility classes and functions
  - `config/` - Game configuration
- `public/` - Static assets and HTML
- `dist/` - Build output

## Adding New Maps

To add a new map, create a new configuration in `src/config/MapConfig.ts` following the existing examples. Maps define:
- Dimensions
- Food count
- Hunter count
- Background texture
- Obstacle textures and positions

## License
This project is licensed under the MIT License - see the LICENSE file for details.