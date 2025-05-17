import { Game } from './core/Game';
import { defaultGameConfig } from './config/GameConfig';
import { forestMap } from './config/MapConfig';

// Use browser window size for the canvas
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

// Create game instance with browser window dimensions
const game = new Game(
  windowWidth,
  windowHeight
);

// Initialize and start the game
async function startGame() {
  // Initialize the game
  await game.init();
  
  // Create a copy of the forest map with window dimensions
  const adaptedMap = { ...forestMap };
  adaptedMap.width = windowWidth;
  adaptedMap.height = windowHeight;
  
  // Adjust obstacle positions and sizes to fit the window size
  adaptedMap.obstacles = forestMap.obstacles.map((obstacle, index) => {
    // Calculate new positions proportional to window size
    const rows = 3;
    const cols = 4;
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    // Scale obstacle size based on screen dimensions
    const sizeFactor = Math.min(windowWidth, windowHeight) / 1200;
    const scaledWidth = obstacle.width * sizeFactor;
    const scaledHeight = obstacle.height * sizeFactor;
    
    return {
      ...obstacle,
      x: (col + 0.5) * (windowWidth / cols) + (Math.random() * 100 - 50),
      y: (row + 0.5) * (windowHeight / rows) + (Math.random() * 100 - 50),
      width: scaledWidth,
      height: scaledHeight
    };
  });
  
  // Load the adapted map
  game.loadMap(adaptedMap);
  
  // Handle window resize
  window.addEventListener('resize', handleResize);
  handleResize();
  
  console.log('Fox Escape game started!');
}

// Resize handler - only resize the renderer
// We don't need to recreate the world since we're setting initial size only
function handleResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  game.resize(width, height);
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startGame);
} else {
  startGame();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  window.removeEventListener('resize', handleResize);
  game.destroy();
});