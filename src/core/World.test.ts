import { World } from './World';
import { AssetManager } from './AssetManager';
import { MapConfig } from '../config/MapConfig';
import { CollisionSystem } from '../systems/CollisionSystem';
import { Fox } from '../entities/Fox';
import { Dragon } from '../entities/Dragon';
import { InputManager } from './InputManager';
import { Vector2 } from '../utils/Vector2';

// Mock PIXI
jest.mock('pixi.js', () => {
  const mockContainer = {
    addChild: jest.fn(),
    destroy: jest.fn()
  };
  
  const mockSprite = {
    width: 0,
    height: 0
  };
  
  return {
    Container: jest.fn().mockImplementation(() => mockContainer),
    Sprite: {
      from: jest.fn().mockReturnValue(mockSprite)
    }
  };
});

// Mock entities
jest.mock('../entities/Fox', () => ({
  Fox: jest.fn().mockImplementation(() => ({
    position: new Vector2(0, 0),
    width: 30,
    height: 30,
    sprite: {},
    update: jest.fn(),
    isActive: true,
    collectFood: jest.fn(),
    handleCollision: jest.fn(),
    getCaught: jest.fn(),
    type: 'fox',
    destroy: jest.fn()
  }))
}));

jest.mock('../entities/Dragon', () => ({
  Dragon: jest.fn().mockImplementation(() => ({
    position: new Vector2(50, 50),
    width: 40,
    height: 40,
    sprite: {},
    update: jest.fn(),
    isActive: true,
    canShoot: jest.fn().mockReturnValue(true),
    shootFireball: jest.fn().mockReturnValue({
      position: new Vector2(50, 50),
      width: 10,
      height: 10,
      sprite: {},
      update: jest.fn(),
      isActive: true,
      deactivate: jest.fn(),
      type: 'fireball',
      destroy: jest.fn()
    }),
    shootFireballAt: jest.fn().mockReturnValue({
      position: new Vector2(50, 50),
      width: 10,
      height: 10,
      sprite: {},
      update: jest.fn(),
      isActive: true,
      deactivate: jest.fn(),
      type: 'fireball',
      destroy: jest.fn()
    }),
    type: 'dragon',
    destroy: jest.fn()
  }))
}));

jest.mock('../entities/Hunter', () => ({
  Hunter: jest.fn().mockImplementation(() => ({
    position: new Vector2(200, 200),
    width: 30,
    height: 30,
    sprite: {},
    update: jest.fn(),
    updateAI: jest.fn(),
    isActive: true,
    canSee: jest.fn().mockReturnValue(false),
    startChasing: jest.fn(),
    stopChasing: jest.fn(),
    takeHit: jest.fn(),
    type: 'hunter',
    destroy: jest.fn()
  }))
}));

jest.mock('../entities/Food', () => ({
  Food: jest.fn().mockImplementation(() => ({
    position: new Vector2(100, 100),
    width: 20,
    height: 20,
    sprite: {},
    update: jest.fn(),
    isActive: true,
    collect: jest.fn(),
    type: 'food',
    destroy: jest.fn()
  }))
}));

jest.mock('../entities/Obstacle', () => ({
  Obstacle: jest.fn().mockImplementation(() => ({
    position: new Vector2(300, 300),
    width: 50,
    height: 50,
    sprite: {},
    update: jest.fn(),
    isActive: true,
    type: 'obstacle',
    destroy: jest.fn()
  }))
}));

// Mock systems
jest.mock('../systems/CollisionSystem', () => ({
  CollisionSystem: jest.fn().mockImplementation(() => ({
    checkCollision: jest.fn().mockReturnValue(false)
  }))
}));

describe('World', () => {
  let world: World;
  let mockStage: any;
  let mockAssetManager: AssetManager;
  let mockMapConfig: MapConfig;
  
  beforeEach(() => {
    mockStage = { addChild: jest.fn() };
    
    mockAssetManager = {
      loadAssets: jest.fn().mockResolvedValue(undefined),
      getTexture: jest.fn().mockReturnValue('mockedTexture')
    } as unknown as AssetManager;
    
    mockMapConfig = {
      name: 'Test Map',
      width: 1000,
      height: 1000,
      foodCount: 2,
      hunterCount: 2,
      textures: {
        background: 'bg.png',
        obstacles: ['tree.png', 'rock.png']
      },
      obstacles: [
        { x: 300, y: 300, width: 50, height: 50 }
      ]
    };
    
    world = new World(mockStage, mockAssetManager, mockMapConfig);
  });
  
  test('init should set up the world correctly', () => {
    world.init();
    
    // Check if entities were created
    // @ts-ignore - accessing private properties for testing
    expect(world['fox']).not.toBeNull();
    // @ts-ignore
    expect(world['dragon']).not.toBeNull();
    // @ts-ignore
    expect(world['hunters'].length).toBe(2);
    // @ts-ignore
    expect(world['foods'].length).toBe(2);
    // @ts-ignore
    expect(world['obstacles'].length).toBe(1);
  });
  
  test('update should update all entities', () => {
    world.init();
    
    const mockInputManager = {
      isKeyPressed: jest.fn().mockReturnValue(false)
    } as unknown as InputManager;
    
    world.update(0.16, mockInputManager);
    
    // @ts-ignore - accessing private properties for testing
    expect(world['fox']?.update).toHaveBeenCalled();
    // @ts-ignore
    expect(world['dragon']?.update).toHaveBeenCalled();
    // @ts-ignore
    expect(world['hunters'][0].updateAI).toHaveBeenCalled();
  });
  
  test('dragon should shoot fireball when space is pressed', () => {
    world.init();
    
    const mockInputManager = {
      isKeyPressed: jest.fn((key) => key === 'Space')
    } as unknown as InputManager;
    
    // @ts-ignore - accessing private properties for testing
    const dragonShootSpy = jest.spyOn(world['dragon']!, 'shootFireball');
    
    world.update(0.16, mockInputManager);
    
    expect(dragonShootSpy).toHaveBeenCalled();
    // @ts-ignore - check if fireball was added
    expect(world['entities'].some(e => e.type === 'fireball')).toBeTruthy();
  });

  test('dragon should shoot fireball at closest hunter when f key is pressed', () => {
    world.init();
    
    const mockInputManager = {
      isKeyPressed: jest.fn((key) => key === 'f')
    } as unknown as InputManager;
    
    // Create multiple hunters at different distances from the dragon
    // @ts-ignore - accessing private properties for testing
    world['hunters'] = [
      // Using the same mock implementation as defined in the hunter mock at the top
      new (jest.requireMock('../entities/Hunter').Hunter)(),
      new (jest.requireMock('../entities/Hunter').Hunter)()
    ];

    // Override positions to ensure the first hunter is closer
    world['hunters'][0].position = new Vector2(100, 100);
    world['hunters'][1].position = new Vector2(200, 200);
    
    // @ts-ignore - accessing private properties for testing
    const dragonShootAtSpy = jest.spyOn(world['dragon']!, 'shootFireballAt');
    
    // Restore actual implementation for the relevant function
    // @ts-ignore - accessing private method
    const originalMethod = world['createFireballAtClosestHunter'];
    
    // Spy on console.log
    const consoleLogSpy = jest.spyOn(console, 'log');
    
    world.update(0.16, mockInputManager);
    
    // The closest hunter should be at (100, 100)
    expect(dragonShootAtSpy).toHaveBeenCalledWith(expect.objectContaining({
      x: 100,
      y: 100
    }));
    
    // Verify firebal was added to entities
    // @ts-ignore - check if fireball was added
    expect(world['entities'].some(e => e.type === 'fireball')).toBeTruthy();
    
    // Verify debug message was logged
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringMatching(/Dragon shooting at hunter at position/));
    
    // Restore the spy
    consoleLogSpy.mockRestore();
  });
  
  test('destroy should clean up all entities', () => {
    world.init();
    world.destroy();
    
    // @ts-ignore - accessing private properties for testing
    world['entities'].forEach(entity => {
      expect(entity.destroy).toHaveBeenCalled();
    });
  });
});