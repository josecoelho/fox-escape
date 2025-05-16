import { Food } from './Food';
import { Vector2 } from '../utils/Vector2';
import * as PIXI from 'pixi.js';

// Define a minimal mock type for the ticker
interface MockTicker {
  callback?: (deltaTime: number) => void;
  add: jest.Mock;
  start: jest.Mock;
  destroy: jest.Mock;
}

// Mock PIXI
jest.mock('pixi.js', () => {
  const mockSprite = {
    anchor: {
      set: jest.fn()
    },
    position: {
      set: jest.fn(),
      y: 0
    },
    scale: {
      set: jest.fn()
    },
    alpha: 1,
    visible: true,
    width: 20,
    height: 20,
    destroy: jest.fn()
  };
  
  const mockTickerInstance: MockTicker = {
    add: jest.fn(function(callback: (deltaTime: number) => void) {
      mockTickerInstance.callback = callback;
      return mockTickerInstance;
    }),
    start: jest.fn(),
    destroy: jest.fn()
  };
  
  const MockTicker = jest.fn().mockImplementation(() => mockTickerInstance);
  
  // Create a mock return object with shared property
  return {
    Sprite: jest.fn().mockImplementation(() => mockSprite),
    Ticker: MockTicker,
    // Add the shared property needed by the Food class
    TickerShared: { FPS: 60 }
  };
});

// Modify PIXI to add the shared property
Object.defineProperty(PIXI.Ticker, 'shared', {
  configurable: true,
  value: { FPS: 60 }
});

// Mock performance.now()
global.performance = {
  now: jest.fn().mockReturnValue(1000)
} as any;

describe('Food', () => {
  let food: Food;
  let position: Vector2;
  let mockTexture: PIXI.Texture;
  
  beforeEach(() => {
    position = new Vector2(100, 100);
    mockTexture = {} as PIXI.Texture;
    food = new Food(position, mockTexture);
    
    // Mock the sprite.scale.set method
    jest.spyOn(food.sprite.scale, 'set').mockImplementation(jest.fn());
  });
  
  test('constructor should initialize with correct type and dimensions', () => {
    expect(food.type).toBe('food');
    expect(food.width).toBe(20);
    expect(food.height).toBe(20);
  });
  
  test('constructor should set up animation ticker', () => {
    expect(PIXI.Ticker).toHaveBeenCalled();
    
    // @ts-ignore - Access private field
    expect(food['animationTicker']).not.toBeNull();
  });
  
  test('collect should start collection animation', () => {
    food.collect();
    
    // @ts-ignore - Access private field
    expect(food['collectAnimation']).toBe(true);
    // @ts-ignore
    expect(food['collectAnimationTime']).toBe(0);
  });
  
  test('destroy should clean up ticker', () => {
    // @ts-ignore - Access private field
    const ticker = food['animationTicker'] as MockTicker;
    
    expect(ticker.destroy).not.toHaveBeenCalled();
    
    food.destroy();
    
    // Check if destroy was called on the ticker
    expect(ticker.destroy).toHaveBeenCalled();
    
    // @ts-ignore - Access private field
    expect(food['animationTicker']).toBeNull();
  });
  
  test('update should not modify inactive food', () => {
    food.deactivate();
    
    const initialPosition = food.position.copy();
    
    food.update(0.16);
    
    expect(food.position.x).toBe(initialPosition.x);
    expect(food.position.y).toBe(initialPosition.y);
  });
});