import { Game } from './Game';
import * as PIXI from 'pixi.js';
import { World } from './World';
import { MapConfig } from '../config/MapConfig';

// Mock dependencies
jest.mock('pixi.js', () => {
  const mockTicker = {
    add: jest.fn(),
    deltaMS: 16
  };
  
  return {
    Application: jest.fn().mockImplementation(() => ({
      view: document.createElement('canvas'),
      ticker: mockTicker,
      stage: {},
      renderer: {
        resize: jest.fn()
      },
      destroy: jest.fn()
    }))
  };
});

jest.mock('./World', () => ({
  World: jest.fn().mockImplementation(() => ({
    init: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    resize: jest.fn()
  }))
}));

jest.mock('./InputManager', () => ({
  InputManager: jest.fn().mockImplementation(() => ({
    init: jest.fn(),
    destroy: jest.fn(),
    isTouchEnabled: jest.fn().mockReturnValue(false)
  }))
}));

jest.mock('./AssetManager', () => ({
  AssetManager: jest.fn().mockImplementation(() => ({
    loadAssets: jest.fn().mockResolvedValue(undefined)
  }))
}));

describe('Game', () => {
  let game: Game;
  const mockAppendChild = jest.fn();
  
  beforeEach(() => {
    document.body.appendChild = mockAppendChild;
    game = new Game(800, 600);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('init should setup the game correctly', async () => {
    await game.init();
    
    expect(mockAppendChild).toHaveBeenCalled();
  });
  
  test('loadMap should create a new World instance', () => {
    const mockMapConfig: MapConfig = {
      name: 'Test Map',
      width: 1000,
      height: 1000,
      foodCount: 5,
      hunterCount: 3,
      textures: {
        background: 'bg.png',
        obstacles: ['tree.png', 'rock.png']
      },
      obstacles: []
    };
    
    game.loadMap(mockMapConfig);
    
    expect(World).toHaveBeenCalled();
  });
  
  test('resize should update renderer dimensions', async () => {
    await game.init();
    game.resize(1024, 768);
    
    // @ts-ignore - accessing private property for testing
    expect(game['app'].renderer.resize).toHaveBeenCalledWith(1024, 768);
  });
});