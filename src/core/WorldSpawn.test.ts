import * as PIXI from 'pixi.js';
import { World } from './World';
import { AssetManager } from './AssetManager';
import { MapConfig } from '../config/MapConfig';
import { GameState, GameStateType } from './GameState';
import { Vector2 } from '../utils/Vector2';
import { Hunter } from '../entities/Hunter';

// Mock necessary dependencies
jest.mock('pixi.js', () => {
  const mockContainer = {
    addChild: jest.fn(),
    removeChild: jest.fn()
  };
  
  const mockSprite = {
    width: 0,
    height: 0,
    alpha: 1,
    anchor: {
      set: jest.fn()
    },
    position: {
      set: jest.fn()
    },
    visible: true
  };
  
  const mockText = {
    position: { set: jest.fn() },
    anchor: { set: jest.fn() },
    text: ''
  };
  
  const mockTicker = {
    add: jest.fn(),
    start: jest.fn(),
    destroy: jest.fn()
  };
  
  return {
    Container: jest.fn().mockImplementation(() => mockContainer),
    Sprite: jest.fn().mockImplementation(() => mockSprite),
    TilingSprite: jest.fn().mockImplementation(() => ({
      width: 0,
      height: 0,
      tileScale: { set: jest.fn() }
    })),
    Text: jest.fn().mockImplementation(() => mockText),
    BlurFilter: jest.fn().mockImplementation(() => ({})),
    Ticker: Object.assign(
      jest.fn().mockImplementation(() => mockTicker),
      { shared: { FPS: 60 } }
    ),
    Filter: jest.fn().mockImplementation(() => ({}))
  };
});

// Mock GameState to control testing
jest.mock('./GameState', () => {
  return {
    GameStateType: {
      START_SCREEN: 0,
      PLAYING: 1,
      GAME_OVER: 2
    },
    GameState: jest.fn().mockImplementation(() => ({
      getState: jest.fn().mockReturnValue(1), // Default to PLAYING
      setState: jest.fn(),
      update: jest.fn(),
      shouldSpawnHunter: jest.fn().mockReturnValue(false),
      getDifficulty: jest.fn().mockReturnValue(1),
      increaseScore: jest.fn(),
      getScore: jest.fn().mockReturnValue(0),
      resize: jest.fn()
    }))
  };
});

// Must import Vector2 before mocking to avoid "Cannot access Vector2 before initialization"
const { Vector2 } = jest.requireActual('../utils/Vector2');

// Mock Hunter
jest.mock('../entities/Hunter', () => {
  const mockHunter = {
    position: { x: 0, y: 0 },
    isActive: true,
    setSpeedMultiplier: jest.fn(),
    update: jest.fn(),
    updateAI: jest.fn(),
    velocity: { x: 0, y: 0 },
    type: 'hunter',
    width: 30,
    height: 30,
    sprite: {},
    canSee: jest.fn().mockReturnValue(false),
    startChasing: jest.fn(),
    stopChasing: jest.fn(),
    takeHit: jest.fn(),
    getState: jest.fn(),
    destroy: jest.fn()
  };
  
  return {
    Hunter: jest.fn().mockImplementation(() => mockHunter),
    HunterState: {
      PATROLLING: 0,
      CHASING: 1,
      STUNNED: 2
    }
  };
});

// Simplified MapConfig for testing
const mockMapConfig: MapConfig = {
  name: 'Test Map',
  width: 800,
  height: 600,
  foodCount: 5,
  hunterCount: 3,
  textures: {
    background: 'bg.png',
    obstacles: ['obstacle.png']
  },
  obstacles: [
    { x: 100, y: 100, width: 50, height: 50 }
  ]
};

describe('World Hunter Spawning', () => {
  let world: World;
  let mockStage: PIXI.Container;
  let mockAssetManager: AssetManager;
  
  beforeEach(() => {
    mockStage = new PIXI.Container();
    
    mockAssetManager = {
      loadAssets: jest.fn().mockResolvedValue(undefined),
      getTexture: jest.fn().mockReturnValue('mockedTexture')
    } as unknown as AssetManager;
    
    world = new World(mockStage, mockAssetManager, mockMapConfig);
    world.init();
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  test('spawnHunter should create a new hunter', () => {
    // @ts-ignore - Access private property to check initial count
    const initialHunterCount = world['hunters'].length;
    
    const hunter = world.spawnHunter();
    
    expect(hunter).not.toBeNull();
    // @ts-ignore - Access private property to check new count
    expect(world['hunters'].length).toBe(initialHunterCount + 1);
    
    // Check that the Hunter constructor was called
    expect(Hunter).toHaveBeenCalled();
  });
  
  test('spawnHunter should set speed multiplier based on difficulty', () => {
    // @ts-ignore - Mock GameState to return higher difficulty
    world['gameState'].getDifficulty.mockReturnValue(2.0);
    
    const hunter = world.spawnHunter();
    
    expect(hunter).not.toBeNull();
    if (hunter) {
      // Check that setSpeedMultiplier was called with appropriate value
      expect(hunter.setSpeedMultiplier).toHaveBeenCalledWith(expect.any(Number));
    }
  });
  
  test('spawnHunter should place hunter at valid position', () => {
    const hunter = world.spawnHunter();
    
    expect(hunter).not.toBeNull();
    if (hunter) {
      // Position should be within map bounds
      expect(hunter.position.x).toBeGreaterThanOrEqual(0);
      expect(hunter.position.x).toBeLessThanOrEqual(mockMapConfig.width);
      expect(hunter.position.y).toBeGreaterThanOrEqual(0);
      expect(hunter.position.y).toBeLessThanOrEqual(mockMapConfig.height);
    }
  });
  
  test('spawnHunter should return null if position cannot be found', () => {
    // Mock the position validation to always fail
    // @ts-ignore - Replace private method
    const originalCollisionSystem = world['collisionSystem'];
    // @ts-ignore - Create a collision system that always returns true (collision)
    world['collisionSystem'] = {
      checkCollision: jest.fn().mockReturnValue(true)
    };
    
    // Set a small test map that causes position finding to fail
    // @ts-ignore - Set private property
    world['mapConfig'] = {
      ...mockMapConfig,
      width: 10,  // Super small map that will make it hard to find valid positions
      height: 10
    };
    
    const hunter = world.spawnHunter();
    
    // After many failed attempts, should return null
    expect(hunter).toBeNull();
    
    // Restore original collision system
    // @ts-ignore - Restore private method
    world['collisionSystem'] = originalCollisionSystem;
  });
});