import { Fireball } from './Fireball';
import { Vector2 } from '../utils/Vector2';
import * as PIXI from 'pixi.js';

// Mock PIXI
jest.mock('pixi.js', () => {
  const mockBlurFilter = {
    blur: 0
  };
  
  const mockSprite = {
    anchor: {
      set: jest.fn()
    },
    position: {
      set: jest.fn()
    },
    scale: {
      set: jest.fn()
    },
    rotation: 0,
    filters: [],
    visible: true,
    width: 20,
    height: 20,
    destroy: jest.fn(),
    tint: 0
  };
  
  return {
    Sprite: jest.fn().mockImplementation(() => mockSprite),
    BlurFilter: jest.fn().mockImplementation(() => mockBlurFilter),
    Filter: class {}
  };
});

describe('Fireball', () => {
  let fireball: Fireball;
  let position: Vector2;
  let direction: Vector2;
  let mockTexture: PIXI.Texture;
  
  beforeEach(() => {
    position = new Vector2(100, 100);
    direction = new Vector2(1, 0);
    mockTexture = {} as PIXI.Texture;
    fireball = new Fireball(position, mockTexture, direction);
  });
  
  test('constructor should initialize with correct type and dimensions', () => {
    expect(fireball.type).toBe('fireball');
    expect(fireball.width).toBe(20);
    expect(fireball.height).toBe(20);
  });
  
  test('constructor should set velocity based on direction', () => {
    // @ts-ignore - Access private field
    const expectedSpeed = fireball['speed'];
    
    expect(fireball.velocity.x).toBe(direction.x * expectedSpeed);
    expect(fireball.velocity.y).toBe(direction.y * expectedSpeed);
  });
  
  test('constructor should apply glow filter', () => {
    expect(PIXI.BlurFilter).toHaveBeenCalled();
    expect(fireball.sprite.filters?.length).toBe(1);
  });
  
  test('update should increment lifetime', () => {
    // @ts-ignore - Set private field
    fireball['currentLifetime'] = 0;
    
    fireball.update(0.16);
    
    // @ts-ignore - Access private field
    expect(fireball['currentLifetime']).toBeCloseTo(0.16, 5);
  });
  
  test('update should deactivate fireball when lifetime expires', () => {
    // @ts-ignore - Set private field
    fireball['currentLifetime'] = 1.9;
    
    fireball.update(0.2);
    
    expect(fireball.isActive).toBe(false);
  });
  
  test('update should add rotation to sprite', () => {
    fireball.sprite.rotation = 0;
    
    fireball.update(0.1);
    
    expect(fireball.sprite.rotation).toBeCloseTo(0.5, 5);
  });
  
  test('update should not modify inactive fireball', () => {
    fireball.deactivate();
    
    // @ts-ignore - Set private field
    fireball['currentLifetime'] = 0;
    const initialPosition = fireball.position.copy();
    
    fireball.update(0.16);
    
    // @ts-ignore - Access private field
    expect(fireball['currentLifetime']).toBe(0);
    expect(fireball.position.x).toBe(initialPosition.x);
    expect(fireball.position.y).toBe(initialPosition.y);
  });
});