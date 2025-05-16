import { Obstacle } from './Obstacle';
import { Vector2 } from '../utils/Vector2';
import * as PIXI from 'pixi.js';

// Mock PIXI
jest.mock('pixi.js', () => {
  const mockSprite = {
    anchor: {
      set: jest.fn()
    },
    position: {
      set: jest.fn()
    },
    visible: true,
    width: 0,
    height: 0,
    destroy: jest.fn()
  };
  
  return {
    Sprite: jest.fn().mockImplementation(() => mockSprite)
  };
});

describe('Obstacle', () => {
  let obstacle: Obstacle;
  let position: Vector2;
  let mockTexture: PIXI.Texture;
  
  beforeEach(() => {
    position = new Vector2(100, 100);
    mockTexture = {} as unknown as PIXI.Texture;
    obstacle = new Obstacle(position, 50, 75, mockTexture);
  });
  
  test('constructor should initialize with correct type and dimensions', () => {
    expect(obstacle.type).toBe('obstacle');
    expect(obstacle.width).toBe(50);
    expect(obstacle.height).toBe(75);
    
    // Sprite dimensions should match
    expect(obstacle.sprite.width).toBe(50);
    expect(obstacle.sprite.height).toBe(75);
  });
  
  test('update should not change anything', () => {
    const initialPosition = obstacle.position.copy();
    const initialVelocity = obstacle.velocity.copy();
    
    // Call update with no parameters (matching the override signature)
    obstacle.update();
    
    // Position and velocity should remain unchanged
    expect(obstacle.position.x).toBe(initialPosition.x);
    expect(obstacle.position.y).toBe(initialPosition.y);
    expect(obstacle.velocity.x).toBe(initialVelocity.x);
    expect(obstacle.velocity.y).toBe(initialVelocity.y);
  });
});