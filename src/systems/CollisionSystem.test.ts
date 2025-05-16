import { CollisionSystem } from './CollisionSystem';

describe('CollisionSystem', () => {
  let collisionSystem: CollisionSystem;
  
  beforeEach(() => {
    collisionSystem = new CollisionSystem();
  });
  
  describe('checkCollision', () => {
    test('should detect overlapping rectangles', () => {
      // Two overlapping rectangles
      const result = collisionSystem.checkCollision(
        10, 10, 50, 50,
        20, 20, 50, 50
      );
      
      expect(result).toBe(true);
    });
    
    test('should not detect non-overlapping rectangles', () => {
      // Two non-overlapping rectangles
      const result = collisionSystem.checkCollision(
        10, 10, 50, 50,
        100, 100, 50, 50
      );
      
      expect(result).toBe(false);
    });
    
    test('should detect touching rectangles', () => {
      // Two rectangles touching at edges
      const result = collisionSystem.checkCollision(
        10, 10, 50, 50,
        60, 10, 50, 50
      );
      
      expect(result).toBe(true);
    });
  });
  
  describe('pointInRect', () => {
    test('should detect point inside rectangle', () => {
      const result = collisionSystem.pointInRect(
        25, 25,
        10, 10, 50, 50
      );
      
      expect(result).toBe(true);
    });
    
    test('should detect point on rectangle edge', () => {
      const result = collisionSystem.pointInRect(
        10, 25,
        10, 10, 50, 50
      );
      
      expect(result).toBe(true);
    });
    
    test('should not detect point outside rectangle', () => {
      const result = collisionSystem.pointInRect(
        5, 5,
        10, 10, 50, 50
      );
      
      expect(result).toBe(false);
    });
  });
  
  describe('lineIntersectsRect', () => {
    test('should detect line passing through rectangle', () => {
      const result = collisionSystem.lineIntersectsRect(
        0, 0, 100, 100,
        40, 40, 20, 20
      );
      
      expect(result).toBe(true);
    });
    
    test('should detect line with start point inside rectangle', () => {
      const result = collisionSystem.lineIntersectsRect(
        50, 50, 100, 100,
        40, 40, 20, 20
      );
      
      expect(result).toBe(true);
    });
    
    test('should detect line with end point inside rectangle', () => {
      const result = collisionSystem.lineIntersectsRect(
        0, 0, 50, 50,
        40, 40, 20, 20
      );
      
      expect(result).toBe(true);
    });
    
    test('should not detect non-intersecting line', () => {
      const result = collisionSystem.lineIntersectsRect(
        0, 0, 30, 30,
        40, 40, 20, 20
      );
      
      expect(result).toBe(false);
    });
  });
  
  describe('lineIntersectsLine', () => {
    test('should detect intersecting lines', () => {
      // @ts-ignore - testing private method
      const result = collisionSystem['lineIntersectsLine'](
        0, 0, 100, 100,
        0, 100, 100, 0
      );
      
      expect(result).toBe(true);
    });
    
    test('should not detect parallel lines', () => {
      // @ts-ignore - testing private method
      const result = collisionSystem['lineIntersectsLine'](
        0, 0, 100, 100,
        0, 10, 100, 110
      );
      
      expect(result).toBe(false);
    });
    
    test('should not detect non-intersecting lines', () => {
      // @ts-ignore - testing private method
      const result = collisionSystem['lineIntersectsLine'](
        0, 0, 50, 50,
        60, 60, 100, 100
      );
      
      expect(result).toBe(false);
    });
  });
});