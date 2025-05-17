import { GameState, GameStateType } from './GameState';
import * as PIXI from 'pixi.js';

// Mock PIXI
jest.mock('pixi.js', () => {
  const mockText = {
    anchor: { set: jest.fn() },
    position: { set: jest.fn() },
    text: '',
    name: ''
  };
  
  const mockContainer = {
    addChild: jest.fn(),
    removeChild: jest.fn(),
    getChildByName: jest.fn().mockImplementation((name: string) => ({
      ...mockText,
      name
    })),
    parent: { removeChild: jest.fn() }
  };
  
  return {
    Container: jest.fn().mockImplementation(() => mockContainer),
    Text: jest.fn().mockImplementation(() => mockText)
  };
});

describe('GameState', () => {
  let gameState: GameState;
  let mockStage: PIXI.Container;
  
  beforeEach(() => {
    mockStage = new PIXI.Container();
    gameState = new GameState(mockStage);
  });
  
  test('should initialize with START_SCREEN state', () => {
    expect(gameState.getState()).toBe(GameStateType.START_SCREEN);
  });
  
  test('should transition between states', () => {
    // Start in START_SCREEN state
    expect(gameState.getState()).toBe(GameStateType.START_SCREEN);
    
    // Transition to PLAYING state
    gameState.setState(GameStateType.PLAYING);
    expect(gameState.getState()).toBe(GameStateType.PLAYING);
    
    // Transition to GAME_OVER state
    gameState.setState(GameStateType.GAME_OVER);
    expect(gameState.getState()).toBe(GameStateType.GAME_OVER);
    
    // Back to START_SCREEN
    gameState.setState(GameStateType.START_SCREEN);
    expect(gameState.getState()).toBe(GameStateType.START_SCREEN);
  });
  
  test('should track score correctly', () => {
    expect(gameState.getScore()).toBe(0);
    
    gameState.increaseScore(10);
    expect(gameState.getScore()).toBe(10);
    
    gameState.increaseScore(5);
    expect(gameState.getScore()).toBe(15);
  });
  
  test('should reset game state when transitioning to PLAYING', () => {
    // Set some values
    gameState.setState(GameStateType.PLAYING);
    gameState.increaseScore(100);
    
    // Difficulty should increase over time
    gameState.update(5);
    const initialDifficulty = gameState.getDifficulty();
    expect(initialDifficulty).toBeGreaterThan(1);
    
    // Transition to GAME_OVER then back to PLAYING should reset
    gameState.setState(GameStateType.GAME_OVER);
    gameState.setState(GameStateType.PLAYING);
    
    // Score and difficulty should be reset
    expect(gameState.getScore()).toBe(0);
    expect(gameState.getDifficulty()).toBe(1);
  });
  
  test('should control hunter spawning based on time and difficulty', () => {
    gameState.setState(GameStateType.PLAYING);
    
    // Initially should not spawn a hunter
    expect(gameState.shouldSpawnHunter()).toBe(false);
    
    // After some time, but not enough, still no spawn
    gameState.update(1);
    expect(gameState.shouldSpawnHunter()).toBe(false);
    
    // After enough time (5+ seconds) should spawn
    gameState.update(5);
    expect(gameState.shouldSpawnHunter()).toBe(true);
    
    // After spawning, timer resets
    expect(gameState.shouldSpawnHunter()).toBe(false);
  });
  
  test('should control food spawning based on time and food count limit', () => {
    gameState.setState(GameStateType.PLAYING);
    
    // Initially should not spawn food
    expect(gameState.shouldSpawnFood(0)).toBe(false);
    
    // After some time, but not enough, still no spawn
    gameState.update(4);
    expect(gameState.shouldSpawnFood(0)).toBe(false);
    
    // After enough time (12+ seconds) should spawn if under max food count
    gameState.update(20); // Ensure we have plenty of time
    
    // Verify the max food capacity rule
    expect(gameState.shouldSpawnFood(5)).toBe(false); // Can't spawn when at max food
    
    // If we're under max capacity, we should be able to spawn
    // Get a new instance to avoid timer reset issues from previous tests
    const freshGameState = new GameState(new PIXI.Container());
    freshGameState.setState(GameStateType.PLAYING);
    freshGameState.update(20); // Plenty of time has passed
    
    expect(freshGameState.shouldSpawnFood(0)).toBe(true); // Should be able to spawn now
  });
  
  test('should increase difficulty over time', () => {
    gameState.setState(GameStateType.PLAYING);
    const initialDifficulty = gameState.getDifficulty();
    
    // Update with a large delta time
    gameState.update(10);
    
    // Difficulty should increase
    const newDifficulty = gameState.getDifficulty();
    expect(newDifficulty).toBeGreaterThan(initialDifficulty);
  });
});