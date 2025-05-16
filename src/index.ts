import { Game } from './core/Game';
import { defaultGameConfig } from './config/GameConfig';
import { forestMap } from './config/MapConfig';

// Create game instance
const game = new Game(
  defaultGameConfig.canvasWidth,
  defaultGameConfig.canvasHeight
);

// Initialize and start the game
async function startGame() {
  // Initialize the game
  await game.init();
  
  // Load the forest map
  game.loadMap(forestMap);
  
  // Handle window resize
  window.addEventListener('resize', handleResize);
  handleResize();
  
  console.log('Fox Escape game started!');
}

// Resize handler
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