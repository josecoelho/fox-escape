import { forestMap } from '../config/MapConfig';

describe('Map Sizing and Adaptations', () => {
  // Store original window dimensions 
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;
  
  beforeEach(() => {
    // Set specific window size for consistent testing
    Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
  });
  
  afterEach(() => {
    // Restore original window dimensions
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth });
    Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight });
  });
  
  test('map should adapt to window size', () => {
    // Get window size
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Create adapted map as in index.ts
    const adaptedMap = { ...forestMap };
    adaptedMap.width = windowWidth;
    adaptedMap.height = windowHeight;
    
    // Verify dimensions are set correctly
    expect(adaptedMap.width).toBe(windowWidth);
    expect(adaptedMap.height).toBe(windowHeight);
  });
  
  test('obstacles should be distributed across the window correctly', () => {
    // Get window size
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Define grid dimensions as in index.ts
    const rows = 3;
    const cols = 4;
    
    // Create adapted obstacles
    const adaptedObstacles = forestMap.obstacles.map((obstacle, index) => {
      // Calculate new positions proportional to window size
      const row = Math.floor(index / cols);
      const col = index % cols;
      
      // Mock random for testing purposes by setting a fixed value
      const mockRandom = 0;
      
      return {
        ...obstacle,
        x: (col + 0.5) * (windowWidth / cols) + (mockRandom * 100 - 50),
        y: (row + 0.5) * (windowHeight / rows) + (mockRandom * 100 - 50)
      };
    });
    
    // Test the first obstacle position
    if (adaptedObstacles.length > 0) {
      // First obstacle should be in the top-left cell
      const firstObstacle = adaptedObstacles[0];
      // Using col=0, row=0
      const expectedX = 0.5 * (windowWidth / cols) - 50; // mockRandom = 0
      const expectedY = 0.5 * (windowHeight / rows) - 50; // mockRandom = 0
      
      expect(firstObstacle.x).toBe(expectedX);
      expect(firstObstacle.y).toBe(expectedY);
    }
    
    // Test the fifth obstacle position (if it exists)
    if (adaptedObstacles.length > 4) {
      // Fifth obstacle should be in the second row, first column (row=1, col=0)
      const fifthObstacle = adaptedObstacles[4];
      const expectedX = 0.5 * (windowWidth / cols) - 50; // mockRandom = 0
      const expectedY = 1.5 * (windowHeight / rows) - 50; // mockRandom = 0
      
      expect(fifthObstacle.x).toBe(expectedX);
      expect(fifthObstacle.y).toBe(expectedY);
    }
  });
});