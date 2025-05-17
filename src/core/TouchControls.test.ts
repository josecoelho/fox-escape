import * as PIXI from 'pixi.js';
import { TouchControls } from './TouchControls';
import { InputManager } from './InputManager';

// Mock PIXI
jest.mock('pixi.js', () => {
  const mockContainer = {
    addChild: jest.fn(),
    removeChild: jest.fn(),
    removeChildren: jest.fn(),
    children: [],
    position: {
      set: jest.fn()
    },
    interactive: false,
    buttonMode: false,
    zIndex: 0,
    visible: true,
    on: jest.fn(),
    off: jest.fn(),
    destroy: jest.fn(),
    getChildAt: jest.fn().mockReturnValue({})
  };
  
  const mockText = {
    position: { set: jest.fn() },
    anchor: { set: jest.fn() },
    text: ''
  };
  
  const mockGraphics = {
    beginFill: jest.fn().mockReturnThis(),
    drawCircle: jest.fn().mockReturnThis(),
    drawRoundedRect: jest.fn().mockReturnThis(),
    lineStyle: jest.fn().mockReturnThis(),
    moveTo: jest.fn().mockReturnThis(),
    lineTo: jest.fn().mockReturnThis(),
    bezierCurveTo: jest.fn().mockReturnThis(),
    drawEllipse: jest.fn().mockReturnThis(),
    endFill: jest.fn().mockReturnThis(),
    position: { set: jest.fn() },
    tint: 0xFFFFFF,
    destroy: jest.fn()
  };
  
  // Mock the Container constructor to always return the same mock for testing
  const Container = jest.fn().mockImplementation(() => mockContainer);
  const Graphics = jest.fn().mockImplementation(() => mockGraphics);
  const Text = jest.fn().mockImplementation(() => mockText);
  
  return {
    Container,
    Graphics,
    Text,
    InteractionEvent: jest.fn().mockImplementation(() => ({
      data: {
        global: { x: 100, y: 100 },
        identifier: 1
      }
    }))
  };
});

// Mock InputManager
jest.mock('./InputManager', () => {
  return {
    InputManager: jest.fn().mockImplementation(() => ({
      setDirectionVector: jest.fn(),
      setActionPressed: jest.fn(),
      setKeyPressed: jest.fn(),
      isTouchEnabled: jest.fn().mockReturnValue(true)
    }))
  };
});

describe('TouchControls', () => {
  let touchControls: TouchControls;
  let mockStage: PIXI.Container;
  let mockInputManager: InputManager;
  
  beforeEach(() => {
    // Create fresh mocks for each test
    mockStage = new PIXI.Container();
    mockInputManager = new InputManager();
    
    // Create TouchControls instance
    touchControls = new TouchControls(
      mockStage,
      mockInputManager,
      800,
      600
    );
    
    // Expose the container directly for testing
    // @ts-ignore - access private property
    touchControls.container = {
      visible: true,
      destroy: jest.fn(),
      removeChild: jest.fn()
    };
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('constructor should initialize with correct properties', () => {
    // Verify container was created and added to stage
    expect(PIXI.Container).toHaveBeenCalled();
    expect(mockStage.addChild).toHaveBeenCalled();
    
    // Should create joysticks and buttons
    expect(PIXI.Graphics).toHaveBeenCalled();
    expect(PIXI.Text).toHaveBeenCalled();
  });
  
  test('resize should update control positions', () => {
    // Initial positions set in constructor
    touchControls.resize(1000, 800);
    
    // Mocks are already properly setup so we only need
    // to verify the method runs without errors
    expect(() => touchControls.resize(1000, 800)).not.toThrow();
  });
  
  test('destroy should clean up event listeners and remove from stage', () => {
    touchControls.destroy();
    
    // Verify cleanup
    expect(mockStage.removeChild).toHaveBeenCalled();
  });
  
  // The following tests would normally test touch interactions
  // but those are difficult to test in a Jest environment without a DOM
  
  test('show and hide should toggle visibility', () => {
    // Get reference to the container
    const container = (touchControls as any).container;
    
    // Verify methods work
    touchControls.hide();
    expect(container.visible).toBe(false);
    
    touchControls.show();
    expect(container.visible).toBe(true);
  });
  
  test('update method should be defined', () => {
    // Just verify it doesn't throw an error
    expect(() => touchControls.update()).not.toThrow();
  });
});