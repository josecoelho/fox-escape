import { InputManager, PlayerType } from './InputManager';

describe('InputManager', () => {
  let inputManager: InputManager;
  
  beforeEach(() => {
    inputManager = new InputManager();
    inputManager.init();
  });
  
  afterEach(() => {
    inputManager.destroy();
  });
  
  test('isKeyPressed should return true for pressed keys', () => {
    // @ts-ignore - Directly set key state for testing
    inputManager['keys'] = { 'ArrowUp': true, 'Space': false };
    
    expect(inputManager.isKeyPressed('ArrowUp')).toBe(true);
    expect(inputManager.isKeyPressed('Space')).toBe(false);
    expect(inputManager.isKeyPressed('NonExistent')).toBe(false);
  });
  
  test('getDirectionVector should return correct vector for player1', () => {
    // @ts-ignore - Directly set key state for testing
    inputManager['keys'] = { 'ArrowUp': true, 'ArrowRight': true };
    
    const direction = inputManager.getDirectionVector('player1');
    
    // Should be normalized for diagonal movement
    expect(direction.x).toBeCloseTo(0.7071, 3);
    expect(direction.y).toBeCloseTo(-0.7071, 3);
  });
  
  test('getDirectionVector should return correct vector for player2', () => {
    // @ts-ignore - Directly set key state for testing
    inputManager['keys'] = { 'w': true, 'd': true };
    
    const direction = inputManager.getDirectionVector('player2');
    
    // Should be normalized for diagonal movement
    expect(direction.x).toBeCloseTo(0.7071, 3);
    expect(direction.y).toBeCloseTo(-0.7071, 3);
  });
  
  test('getDirectionVector should handle single axis movement', () => {
    // @ts-ignore - Directly set key state for testing
    inputManager['keys'] = { 'ArrowLeft': true };
    
    const direction = inputManager.getDirectionVector('player1');
    
    expect(direction.x).toBe(-1);
    expect(direction.y).toBe(0);
  });
  
  test('isActionPressed should return correct value for each player', () => {
    // @ts-ignore - Directly set key state for testing
    inputManager['keys'] = { 'Space': true, 'f': false };
    
    expect(inputManager.isActionPressed('player1')).toBe(true);
    expect(inputManager.isActionPressed('player2')).toBe(false);
  });
  
  test('handleKeyDown should set key state to true', () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    
    // @ts-ignore - Call private method for testing
    inputManager['handleKeyDown'](event);
    
    // @ts-ignore - Check internal state
    expect(inputManager['keys']['ArrowUp']).toBe(true);
  });
  
  test('handleKeyUp should set key state to false', () => {
    // @ts-ignore - Directly set key state for testing
    inputManager['keys'] = { 'ArrowUp': true };
    
    const event = new KeyboardEvent('keyup', { key: 'ArrowUp' });
    
    // @ts-ignore - Call private method for testing
    inputManager['handleKeyUp'](event);
    
    // @ts-ignore - Check internal state
    expect(inputManager['keys']['ArrowUp']).toBe(false);
  });
});