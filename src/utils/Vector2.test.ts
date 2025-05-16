import { Vector2 } from './Vector2';

describe('Vector2', () => {
  test('constructor should set x and y properties', () => {
    const vector = new Vector2(3, 4);
    
    expect(vector.x).toBe(3);
    expect(vector.y).toBe(4);
  });
  
  test('add should add two vectors', () => {
    const a = new Vector2(1, 2);
    const b = new Vector2(3, 4);
    
    const result = Vector2.add(a, b);
    
    expect(result.x).toBe(4);
    expect(result.y).toBe(6);
  });
  
  test('subtract should subtract two vectors', () => {
    const a = new Vector2(5, 7);
    const b = new Vector2(2, 3);
    
    const result = Vector2.subtract(a, b);
    
    expect(result.x).toBe(3);
    expect(result.y).toBe(4);
  });
  
  test('scale should multiply vector by scalar', () => {
    const vector = new Vector2(2, 3);
    
    const result = Vector2.scale(vector, 2);
    
    expect(result.x).toBe(4);
    expect(result.y).toBe(6);
  });
  
  test('distance should calculate correct distance between vectors', () => {
    const a = new Vector2(0, 0);
    const b = new Vector2(3, 4);
    
    const distance = Vector2.distance(a, b);
    
    expect(distance).toBe(5);
  });
  
  test('normalize should create unit vector', () => {
    const vector = new Vector2(3, 4);
    
    const normalized = Vector2.normalize(vector);
    
    expect(normalized.x).toBeCloseTo(0.6, 1);
    expect(normalized.y).toBeCloseTo(0.8, 1);
    
    // Length should be 1
    const length = Math.sqrt(normalized.x * normalized.x + normalized.y * normalized.y);
    expect(length).toBeCloseTo(1, 5);
  });
  
  test('normalize should handle zero vector', () => {
    const vector = new Vector2(0, 0);
    
    const normalized = Vector2.normalize(vector);
    
    expect(normalized.x).toBe(0);
    expect(normalized.y).toBe(0);
  });
  
  test('dot should calculate dot product', () => {
    const a = new Vector2(2, 3);
    const b = new Vector2(4, 5);
    
    const dotProduct = Vector2.dot(a, b);
    
    expect(dotProduct).toBe(2 * 4 + 3 * 5);
  });
  
  test('instance methods should work correctly', () => {
    const a = new Vector2(1, 2);
    const b = new Vector2(3, 4);
    
    expect(a.add(b).x).toBe(4);
    expect(a.add(b).y).toBe(6);
    
    expect(a.subtract(b).x).toBe(-2);
    expect(a.subtract(b).y).toBe(-2);
    
    expect(a.scale(2).x).toBe(2);
    expect(a.scale(2).y).toBe(4);
    
    expect(a.distanceTo(b)).toBeCloseTo(2.83, 2);
    
    expect(a.dot(b)).toBe(1 * 3 + 2 * 4);
  });
  
  test('copy should create a new instance with the same values', () => {
    const original = new Vector2(1, 2);
    const copy = original.copy();
    
    expect(copy).not.toBe(original);
    expect(copy.x).toBe(original.x);
    expect(copy.y).toBe(original.y);
  });
});