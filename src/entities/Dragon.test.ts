import { Dragon } from './Dragon';
import { Vector2 } from '../utils/Vector2';
import { InputManager } from '../core/InputManager';
import * as PIXI from 'pixi.js';
import { Fireball } from './Fireball';

// Mock dependencies
jest.mock('pixi.js', () => {
  const mockSprite = {
    anchor: {
      set: jest.fn()
    },
    position: {
      set: jest.fn()
    },
    visible: true,
    width: 40,
    height: 40,
    destroy: jest.fn()
  };
  
  // Create a minimal mock implementation for document
  const mockCanvas = {
    width: 0,
    height: 0,
    getContext: jest.fn().mockImplementation(() => ({
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn()
    }))
  };
  
  const mockCreateElement = jest.fn().mockImplementation(() => mockCanvas);
  
  global.document = {
    createElement: mockCreateElement
  } as any;
  
  return {
    Sprite: jest.fn().mockImplementation(() => mockSprite),
    Texture: {
      from: jest.fn().mockImplementation(() => ({}))
    },
    BlurFilter: jest.fn().mockImplementation(() => ({
      blur: 0
    }))
  };
});

jest.mock('./Fireball', () => ({
  Fireball: jest.fn().mockImplementation(() => ({
    position: new Vector2(0, 0),
    velocity: new Vector2(0, 0),
    update: jest.fn(),
    sprite: {
      scale: {
        set: jest.fn()
      },
      tint: 0
    }
  }))
}));

// Spy on console.log and console.error
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('Dragon', () => {
  let dragon: Dragon;
  let position: Vector2;
  let mockTexture: PIXI.Texture;
  let mockInputManager: InputManager;
  
  beforeEach(() => {
    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
    
    position = new Vector2(100, 100);
    mockTexture = {} as PIXI.Texture;
    dragon = new Dragon(position, mockTexture);
    
    mockInputManager = {
      getDirectionVector: jest.fn().mockReturnValue({ x: 1, y: 0 }),
      isActionPressed: jest.fn().mockReturnValue(false),
      isKeyPressed: jest.fn()
    } as unknown as InputManager;
    
    // Reset the Fireball mock
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });
  
  test('constructor should initialize with correct type and dimensions', () => {
    expect(dragon.type).toBe('dragon');
    expect(dragon.width).toBe(40);
    expect(dragon.height).toBe(40);
  });
  
  test('update should handle player input', () => {
    mockInputManager.getDirectionVector = jest.fn().mockReturnValue({ x: 0.5, y: -0.5 });
    
    dragon.update(0.16, mockInputManager, 'player2');
    
    // @ts-ignore - Access private field
    expect(dragon.velocity.x).toBeCloseTo(dragon['speed'] * 0.5, 5);
    expect(dragon.velocity.y).toBeCloseTo(dragon['speed'] * -0.5, 5);
  });
  
  test('update should increase fireball cooldown timer', () => {
    // @ts-ignore - Set private field
    dragon['timeSinceLastFireball'] = 0;
    
    dragon.update(0.16);
    
    // @ts-ignore - Access private field
    expect(dragon['timeSinceLastFireball']).toBeCloseTo(0.16, 5);
  });
  
  test('canShoot should return false during cooldown', () => {
    // @ts-ignore - Set private field
    dragon['timeSinceLastFireball'] = 0;
    
    expect(dragon.canShoot()).toBe(false);
  });
  
  test('canShoot should return true after cooldown', () => {
    // @ts-ignore - Set private field
    dragon['timeSinceLastFireball'] = 1;
    
    expect(dragon.canShoot()).toBe(true);
  });
  
  test('shootFireball should return null during cooldown', () => {
    // @ts-ignore - Set private field
    dragon['timeSinceLastFireball'] = 0;
    
    const fireball = dragon.shootFireball();
    
    expect(fireball).toBeNull();
  });
  
  test('shootFireball should create fireball with canvas texture and reset cooldown', () => {
    // @ts-ignore - Set private field
    dragon['timeSinceLastFireball'] = 1;
    
    // Spy on document.createElement since it's already mocked
    const createElementSpy = jest.spyOn(document, 'createElement');
    
    const fireball = dragon.shootFireball();
    
    expect(fireball).not.toBeNull();
    expect(createElementSpy).toHaveBeenCalledWith('canvas');
    expect(Fireball).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalled();
    
    // @ts-ignore - Access private field
    expect(dragon['timeSinceLastFireball']).toBe(0);
    
    createElementSpy.mockRestore();
  });
  
  test('shootFireball should shoot in direction of movement', () => {
    // @ts-ignore - Set private field
    dragon['timeSinceLastFireball'] = 1;
    dragon.velocity = new Vector2(0, -1);
    
    const getShootingDirectionSpy = jest.spyOn(
      // @ts-ignore - Access private method
      dragon as any, 'getShootingDirection'
    );
    
    dragon.shootFireball();
    
    expect(getShootingDirectionSpy).toHaveBeenCalled();
    const direction = getShootingDirectionSpy.mock.results[0].value;
    expect(direction.x).toBe(0);
    expect(direction.y).toBe(-1);
  });
  
  test('shootFireballAt should target a specific position', () => {
    // @ts-ignore - Set private field
    dragon['timeSinceLastFireball'] = 1;
    
    // Spy on document.createElement since it's already mocked
    const createElementSpy = jest.spyOn(document, 'createElement');
    
    const targetPosition = new Vector2(200, 200);
    const fireball = dragon.shootFireballAt(targetPosition);
    
    expect(fireball).not.toBeNull();
    expect(createElementSpy).toHaveBeenCalledWith('canvas');
    expect(Fireball).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Dragon shot a fireball at target:"),
      expect.any(Number),
      expect.any(Number)
    );
    
    // @ts-ignore - Access private field
    expect(dragon['timeSinceLastFireball']).toBe(0);
    
    createElementSpy.mockRestore();
  });
  
  test('shootFireballAt should correctly calculate direction to target', () => {
    // @ts-ignore - Set private field
    dragon['timeSinceLastFireball'] = 1;
    
    // Set dragon position
    dragon.position = new Vector2(100, 100);
    
    // Create a target to the right and down from the dragon
    const targetPosition = new Vector2(200, 150);
    
    // We need to capture the direction vector that's passed to the Fireball constructor
    const originalFireball = Fireball;
    
    let capturedDirection: any = null;
    (Fireball as jest.Mock).mockImplementationOnce(
      (position: Vector2, texture: PIXI.Texture, direction: Vector2) => {
        capturedDirection = direction;
        return {
          position,
          velocity: direction.scale(400), // Assume speed is 400
          update: jest.fn(),
          isActive: true,
          deactivate: jest.fn(),
          sprite: {
            scale: { set: jest.fn() },
            tint: 0,
            filters: []
          }
        };
      }
    );
    
    dragon.shootFireballAt(targetPosition);
    
    // Verify the direction is calculated correctly
    expect(capturedDirection).not.toBeNull();
    
    if (capturedDirection) {
      // The direction should be a normalized vector pointing from (100,100) to (200,150)
      // Expected vector is (100, 50) normalized
      const expectedLength = Math.sqrt(100*100 + 50*50);
      expect(capturedDirection.x).toBeCloseTo(100 / expectedLength, 5);
      expect(capturedDirection.y).toBeCloseTo(50 / expectedLength, 5);
      
      // Verify it's normalized (length should be 1)
      const length = Math.sqrt(capturedDirection.x * capturedDirection.x + capturedDirection.y * capturedDirection.y);
      expect(length).toBeCloseTo(1, 5);
    }
  });
  
  test('shootFireballAt should handle errors', () => {
    // @ts-ignore - Set private field
    dragon['timeSinceLastFireball'] = 1;
    
    // Make PIXI.Texture.from throw an error
    const error = new Error('Texture creation failed');
    jest.spyOn(PIXI.Texture, 'from').mockImplementationOnce(() => {
      throw error;
    });
    
    const targetPosition = new Vector2(200, 200);
    const fireball = dragon.shootFireballAt(targetPosition);
    
    expect(fireball).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Error creating fireball:"),
      error
    );
  });
  
  test('getShootingDirection should return default direction when not moving', () => {
    dragon.velocity = new Vector2(0, 0);
    
    // @ts-ignore - Call private method
    const direction = dragon['getShootingDirection']();
    
    expect(direction.x).toBe(1);
    expect(direction.y).toBe(0);
  });
});