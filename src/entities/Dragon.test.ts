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
  
  return {
    Sprite: jest.fn().mockImplementation(() => mockSprite),
    Texture: {
      from: jest.fn().mockImplementation(() => ({}))
    }
  };
});

jest.mock('./Fireball', () => ({
  Fireball: jest.fn().mockImplementation(() => ({
    position: new Vector2(0, 0),
    velocity: new Vector2(0, 0),
    update: jest.fn()
  }))
}));

describe('Dragon', () => {
  let dragon: Dragon;
  let position: Vector2;
  let mockTexture: PIXI.Texture;
  let mockInputManager: InputManager;
  
  beforeEach(() => {
    position = new Vector2(100, 100);
    mockTexture = {} as PIXI.Texture;
    dragon = new Dragon(position, mockTexture);
    
    mockInputManager = {
      getDirectionVector: jest.fn().mockReturnValue({ x: 1, y: 0 }),
      isActionPressed: jest.fn().mockReturnValue(false),
      isKeyPressed: jest.fn()
    } as unknown as InputManager;
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
  
  test('shootFireball should create fireball and reset cooldown', () => {
    // @ts-ignore - Set private field
    dragon['timeSinceLastFireball'] = 1;
    
    const fireball = dragon.shootFireball();
    
    expect(fireball).not.toBeNull();
    expect(Fireball).toHaveBeenCalled();
    
    // @ts-ignore - Access private field
    expect(dragon['timeSinceLastFireball']).toBe(0);
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
  
  test('getShootingDirection should return default direction when not moving', () => {
    dragon.velocity = new Vector2(0, 0);
    
    // @ts-ignore - Call private method
    const direction = dragon['getShootingDirection']();
    
    expect(direction.x).toBe(1);
    expect(direction.y).toBe(0);
  });
});