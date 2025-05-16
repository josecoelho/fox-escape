import { Hunter, HunterState } from './Hunter';
import { Vector2 } from '../utils/Vector2';
import { Fox } from './Fox';
import { Obstacle } from './Obstacle';
import { CollisionSystem } from '../systems/CollisionSystem';
import * as PIXI from 'pixi.js';

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
    width: 30,
    height: 30,
    destroy: jest.fn()
  };
  
  return {
    Sprite: jest.fn().mockImplementation(() => mockSprite)
  };
});

jest.mock('../systems/CollisionSystem', () => {
  const mockLineIntersectsRect = jest.fn().mockReturnValue(false);
  
  return {
    CollisionSystem: jest.fn().mockImplementation(() => ({
      lineIntersectsRect: mockLineIntersectsRect,
      checkCollision: jest.fn().mockReturnValue(false)
    }))
  };
});

jest.mock('./Fox', () => ({
  Fox: jest.fn().mockImplementation(() => ({
    position: new Vector2(200, 200),
    isActive: true,
    isHidden: jest.fn().mockReturnValue(false),
    width: 30,
    height: 30
  }))
}));

describe('Hunter', () => {
  let hunter: Hunter;
  let position: Vector2;
  let mockTexture: PIXI.Texture;
  let mockFox: Fox;
  let mockObstacles: Obstacle[];
  
  beforeEach(() => {
    position = new Vector2(100, 100);
    mockTexture = {} as PIXI.Texture;
    hunter = new Hunter(position, mockTexture);
    
    mockFox = new Fox(new Vector2(0, 0), {} as PIXI.Texture);
    mockObstacles = [];
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  test('constructor should initialize with correct type and dimensions', () => {
    expect(hunter.type).toBe('hunter');
    expect(hunter.width).toBe(30);
    expect(hunter.height).toBe(30);
  });
  
  test('constructor should generate patrol points', () => {
    // @ts-ignore - Access private field
    expect(hunter['patrolPoints'].length).toBeGreaterThan(0);
  });
  
  test('updateAI should handle stunned state', () => {
    // @ts-ignore - Set private fields
    hunter['state'] = HunterState.STUNNED;
    hunter['stunTime'] = 1;
    
    hunter.updateAI(0.5, mockFox, mockObstacles);
    
    // @ts-ignore - Access private fields
    expect(hunter['stunTime']).toBe(0.5);
    expect(hunter['state']).toBe(HunterState.STUNNED);
    expect(hunter.velocity.x).toBe(0);
    expect(hunter.velocity.y).toBe(0);
    
    hunter.updateAI(0.6, mockFox, mockObstacles);
    
    // @ts-ignore - Access private fields
    expect(hunter['state']).toBe(HunterState.PATROLLING);
  });
  
  test('updatePatrolling should move hunter towards patrol point', () => {
    // @ts-ignore - Set private fields
    hunter['state'] = HunterState.PATROLLING;
    hunter['patrolWaitTime'] = 0;
    // Force a specific patrol point for testing
    // @ts-ignore
    hunter['patrolPoints'] = [new Vector2(200, 200)];
    hunter['currentPatrolIndex'] = 0;
    
    // @ts-ignore - Call private method
    hunter['updatePatrolling'](0.16);
    
    // Should be moving towards patrol point
    expect(hunter.velocity.x).toBeGreaterThan(0);
    expect(hunter.velocity.y).toBeGreaterThan(0);
    
    // @ts-ignore - Access private field
    const speed = Math.sqrt(hunter.velocity.x ** 2 + hunter.velocity.y ** 2);
    expect(speed).toBeCloseTo(hunter['patrolSpeed'], 1);
  });
  
  test('updatePatrolling should wait at patrol point', () => {
    // @ts-ignore - Set private fields
    hunter['state'] = HunterState.PATROLLING;
    hunter['patrolWaitTime'] = 1;
    
    // @ts-ignore - Call private method
    hunter['updatePatrolling'](0.5);
    
    // Should not be moving while waiting
    expect(hunter.velocity.x).toBe(0);
    expect(hunter.velocity.y).toBe(0);
    // @ts-ignore - Access private field
    expect(hunter['patrolWaitTime']).toBe(0.5);
  });
  
  test('updateChasing should move hunter towards fox', () => {
    // @ts-ignore - Set private fields
    hunter['state'] = HunterState.CHASING;
    hunter['targetFox'] = {
      position: new Vector2(200, 200),
      isActive: true,
      isHidden: () => false
    } as Fox;
    
    // Mock canSee to return true
    const canSeeSpy = jest.spyOn(hunter, 'canSee').mockReturnValue(true);
    
    // @ts-ignore - Call private method
    hunter['updateChasing'](0.16, mockFox, mockObstacles);
    
    // Should be moving towards fox
    expect(hunter.velocity.x).toBeGreaterThan(0);
    expect(hunter.velocity.y).toBeGreaterThan(0);
    
    // @ts-ignore - Access private field
    const speed = Math.sqrt(hunter.velocity.x ** 2 + hunter.velocity.y ** 2);
    expect(speed).toBeCloseTo(hunter['chaseSpeed'], 1);
    
    canSeeSpy.mockRestore();
  });
  
  test('updateChasing should stop if fox is hidden', () => {
    // @ts-ignore - Set private fields
    hunter['state'] = HunterState.CHASING;
    hunter['targetFox'] = {
      position: new Vector2(200, 200),
      isActive: true,
      isHidden: () => true
    } as Fox;
    
    // @ts-ignore - Call private method
    hunter['updateChasing'](0.16, mockFox, mockObstacles);
    
    // Should have stopped chasing
    // @ts-ignore - Access private field
    expect(hunter['state']).toBe(HunterState.PATROLLING);
  });
  
  test('canSee should check distance, angle, and obstacles', () => {
    const fox = {
      position: new Vector2(150, 150),
      isActive: true,
      isHidden: () => false
    } as Fox;
    
    // @ts-ignore - Set private field
    hunter['visionRange'] = 100;
    
    // Within range
    expect(hunter.canSee(fox, mockObstacles)).toBe(true);
    
    // Out of range
    fox.position = new Vector2(300, 300);
    expect(hunter.canSee(fox, mockObstacles)).toBe(false);
    
    // Fox is hiding
    fox.position = new Vector2(150, 150);
    jest.spyOn(fox, 'isHidden').mockReturnValue(true);
    expect(hunter.canSee(fox, mockObstacles)).toBe(false);
    
    // Obstacle blocking view
    jest.spyOn(fox, 'isHidden').mockReturnValue(false);
    
    // Setup a mock obstacle with position property
    const mockObstacle = {
      position: new Vector2(125, 125),
      width: 30,
      height: 30
    } as Obstacle;
    
    const mockObstaclesWithBlock = [mockObstacle];
    
    // Set a new lineIntersectsRect that will return true for this test
    // @ts-ignore - Directly set the mock value to true
    hunter['collisionSystem'].lineIntersectsRect.mockReturnValueOnce(true);
    
    const result = hunter.canSee(fox, mockObstaclesWithBlock);
    expect(result).toBe(false);
  });
  
  test('startChasing should set state and target', () => {
    hunter.startChasing(mockFox);
    
    // @ts-ignore - Access private fields
    expect(hunter['state']).toBe(HunterState.CHASING);
    expect(hunter['targetFox']).toBe(mockFox);
  });
  
  test('stopChasing should reset state and target', () => {
    // @ts-ignore - Set private fields
    hunter['state'] = HunterState.CHASING;
    hunter['targetFox'] = mockFox;
    
    hunter.stopChasing();
    
    // @ts-ignore - Access private fields
    expect(hunter['state']).toBe(HunterState.PATROLLING);
    expect(hunter['targetFox']).toBeNull();
  });
  
  test('takeHit should reduce health and stun hunter', () => {
    // @ts-ignore - Set private field
    hunter['health'] = 2;
    
    hunter.takeHit();
    
    // @ts-ignore - Access private fields
    expect(hunter['health']).toBe(1);
    expect(hunter['state']).toBe(HunterState.STUNNED);
    expect(hunter['stunTime']).toBe(hunter['maxStunTime']);
  });
  
  test('takeHit should deactivate hunter when health reaches zero', () => {
    // @ts-ignore - Set private field
    hunter['health'] = 1;
    
    hunter.takeHit();
    
    expect(hunter.isActive).toBe(false);
  });
  
  test('getState should return current state', () => {
    // @ts-ignore - Set private field
    hunter['state'] = HunterState.CHASING;
    
    expect(hunter.getState()).toBe(HunterState.CHASING);
  });
});