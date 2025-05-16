import { Entity, EntityType } from './Entity';
import { Vector2 } from '../utils/Vector2';
import * as PIXI from 'pixi.js';

// Create a test implementation of the abstract class
class TestEntity extends Entity {
  constructor(position: Vector2, texture: PIXI.Texture, type: EntityType) {
    super(position, texture, type);
  }
}

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
    width: 30,
    height: 30,
    destroy: jest.fn()
  };
  
  return {
    Sprite: jest.fn().mockImplementation(() => mockSprite)
  };
});

describe('Entity', () => {
  let entity: TestEntity;
  let position: Vector2;
  let mockTexture: PIXI.Texture;
  
  beforeEach(() => {
    position = new Vector2(100, 100);
    mockTexture = {} as PIXI.Texture;
    entity = new TestEntity(position, mockTexture, 'obstacle');
  });
  
  test('constructor should initialize properties correctly', () => {
    expect(entity.position).toBe(position);
    expect(entity.velocity.x).toBe(0);
    expect(entity.velocity.y).toBe(0);
    expect(entity.acceleration.x).toBe(0);
    expect(entity.acceleration.y).toBe(0);
    expect(entity.type).toBe('obstacle');
    expect(entity.isActive).toBe(true);
    
    expect(PIXI.Sprite).toHaveBeenCalledWith(mockTexture);
    expect(entity.sprite.anchor.set).toHaveBeenCalledWith(0.5);
    expect(entity.sprite.position.set).toHaveBeenCalledWith(100, 100);
  });
  
  test('update should apply physics and update sprite position', () => {
    entity.velocity = new Vector2(10, 20);
    entity.acceleration = new Vector2(2, 5);
    
    entity.update(0.5);
    
    // Acceleration applied to velocity
    expect(entity.velocity.x).toBeCloseTo(11, 5);
    expect(entity.velocity.y).toBeCloseTo(22.5, 5);
    
    // Velocity applied to position
    expect(entity.position.x).toBeCloseTo(105.5, 5);
    expect(entity.position.y).toBeCloseTo(111.25, 5);
    
    // Sprite position updated
    expect(entity.sprite.position.set).toHaveBeenCalledWith(105.5, 111.25);
  });
  
  test('deactivate should set isActive to false and hide sprite', () => {
    entity.deactivate();
    
    expect(entity.isActive).toBe(false);
    expect(entity.sprite.visible).toBe(false);
  });
  
  test('destroy should call sprite.destroy', () => {
    entity.destroy();
    
    expect(entity.sprite.destroy).toHaveBeenCalled();
  });
});