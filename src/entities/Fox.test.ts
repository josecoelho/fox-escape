import { Fox } from './Fox';
import { Vector2 } from '../utils/Vector2';
import { InputManager } from '../core/InputManager';
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
    alpha: 1,
    visible: true,
    width: 30,
    height: 30,
    destroy: jest.fn()
  };
  
  return {
    Sprite: jest.fn().mockImplementation(() => mockSprite)
  };
});

describe('Fox', () => {
  let fox: Fox;
  let position: Vector2;
  let mockTexture: PIXI.Texture;
  let mockInputManager: InputManager;
  
  beforeEach(() => {
    position = new Vector2(100, 100);
    mockTexture = {} as PIXI.Texture;
    fox = new Fox(position, mockTexture);
    
    mockInputManager = {
      getDirectionVector: jest.fn().mockReturnValue({ x: 1, y: 0 }),
      isActionPressed: jest.fn().mockReturnValue(false),
      isKeyPressed: jest.fn()
    } as unknown as InputManager;
  });
  
  test('constructor should initialize with correct type and dimensions', () => {
    expect(fox.type).toBe('fox');
    expect(fox.width).toBe(30);
    expect(fox.height).toBe(30);
  });
  
  test('update should handle player input', () => {
    mockInputManager.getDirectionVector = jest.fn().mockReturnValue({ x: 0.5, y: -0.5 });
    
    fox.update(0.16, mockInputManager, 'player1');
    
    // @ts-ignore - Access private field
    expect(fox.velocity.x).toBeCloseTo(fox['speed'] * 0.5, 5);
    expect(fox.velocity.y).toBeCloseTo(fox['speed'] * -0.5, 5);
  });
  
  test('update should not change position when caught', () => {
    // @ts-ignore - Set private field
    fox['isCaught'] = true;
    const initialPosition = fox.position.copy();
    
    fox.update(0.16, mockInputManager, 'player1');
    
    expect(fox.position.x).toBe(initialPosition.x);
    expect(fox.position.y).toBe(initialPosition.y);
  });
  
  test('tryHide should set hiding state when cooldown is ready', () => {
    expect(fox.isHidden()).toBe(false);
    
    // The fox should be able to hide immediately after creation
    fox.tryHide();
    
    expect(fox.isHidden()).toBe(true);
  });
  
  test('collectFood should increment food counter', () => {
    expect(fox.getFoodCollected()).toBe(0);
    
    fox.collectFood();
    
    expect(fox.getFoodCollected()).toBe(1);
    
    fox.collectFood();
    fox.collectFood();
    
    expect(fox.getFoodCollected()).toBe(3);
  });
  
  test('handleCollision should push back fox', () => {
    fox.velocity = new Vector2(100, 0);
    const initialPosition = new Vector2(100, 100);
    fox.position = initialPosition.copy();
    
    fox.handleCollision();
    
    // Should push back by 10 units in the opposite direction of velocity
    expect(fox.position.x).toBe(initialPosition.x - 10);
    expect(fox.position.y).toBe(initialPosition.y);
    
    // Velocity should be reset
    expect(fox.velocity.x).toBe(0);
    expect(fox.velocity.y).toBe(0);
  });
  
  test('getCaught should deactivate fox when not hiding', () => {
    fox.getCaught();
    
    expect(fox.isActive).toBe(false);
  });
  
  test('getCaught should not deactivate fox when hiding', () => {
    fox.tryHide();
    fox.getCaught();
    
    expect(fox.isActive).toBe(true);
  });
  
  test('update should change sprite alpha based on hiding state', () => {
    fox.update(0.16, mockInputManager, 'player1');
    expect(fox.sprite.alpha).toBe(1);
    
    fox.tryHide();
    fox.update(0.16, mockInputManager, 'player1');
    expect(fox.sprite.alpha).toBe(0.5);
  });
  
  test('fox should automatically stop hiding after duration expires', () => {
    fox.tryHide();
    expect(fox.isHidden()).toBe(true);
    
    // Update for slightly less than the hiding duration
    fox.update(1.9, mockInputManager, 'player1');
    expect(fox.isHidden()).toBe(true);
    
    // Update for the remaining time to exceed the hiding duration
    fox.update(0.2, mockInputManager, 'player1');
    expect(fox.isHidden()).toBe(false);
  });
  
  test('fox should not be able to hide during cooldown period', () => {
    // First hide
    fox.tryHide();
    expect(fox.isHidden()).toBe(true);
    
    // Wait for hiding duration to expire
    fox.update(2.1, mockInputManager, 'player1');
    expect(fox.isHidden()).toBe(false);
    
    // Try to hide again immediately - should fail due to cooldown
    fox.tryHide();
    expect(fox.isHidden()).toBe(false);
    
    // Simulate waiting for part of the cooldown
    fox.update(5.0, mockInputManager, 'player1');
    fox.tryHide();
    expect(fox.isHidden()).toBe(false);
    
    // Simulate waiting for the rest of the cooldown
    fox.update(5.1, mockInputManager, 'player1');
    fox.tryHide();
    expect(fox.isHidden()).toBe(true);
  });
  
  test('getHideCooldownRemaining should return correct cooldown time', () => {
    // Initially cooldown should be 0 (ready to hide)
    expect(fox.getHideCooldownRemaining()).toBe(0);
    
    // Hide the fox
    fox.tryHide();
    
    // During hiding, cooldown remaining should be 0
    expect(fox.getHideCooldownRemaining()).toBe(0);
    
    // Wait for hiding to expire
    fox.update(2.1, mockInputManager, 'player1');
    
    // After hiding, cooldown should be close to 10 seconds (within 3 seconds margin)
    expect(fox.getHideCooldownRemaining()).toBeGreaterThan(7);
    
    // After some time passes, cooldown should decrease
    fox.update(4.0, mockInputManager, 'player1');
    expect(fox.getHideCooldownRemaining()).toBeLessThan(7);
  });
  
  test('resetHidingState should reset all hiding-related properties', () => {
    // First hide
    fox.tryHide();
    expect(fox.isHidden()).toBe(true);
    
    // Reset hiding state
    fox.resetHidingState();
    
    // Fox should not be hidden and should be able to hide immediately
    expect(fox.isHidden()).toBe(false);
    expect(fox.getHideCooldownRemaining()).toBe(0);
    
    // Should be able to hide again immediately
    fox.tryHide();
    expect(fox.isHidden()).toBe(true);
  });
});