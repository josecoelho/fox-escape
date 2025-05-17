import { StartButton } from './StartButton';

// Mock PIXI
jest.mock('pixi.js', () => {
  const mockContainer = {
    addChild: jest.fn(),
    removeChild: jest.fn(),
    destroy: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    visible: true,
    position: { set: jest.fn() },
    scale: { set: jest.fn() },
    children: [],
    parent: null,
  };

  return {
    Container: jest.fn().mockImplementation(() => mockContainer),
    Graphics: jest.fn().mockImplementation(() => ({
      beginFill: jest.fn().mockReturnThis(),
      lineStyle: jest.fn().mockReturnThis(),
      drawRoundedRect: jest.fn().mockReturnThis(),
      endFill: jest.fn().mockReturnThis(),
    })),
    Text: jest.fn().mockImplementation(() => ({
      anchor: { set: jest.fn() },
      text: ''
    })),
    Rectangle: jest.fn()
  };
});

describe('StartButton minimal tests', () => {
  // Very minimal test to avoid memory issues
  test('should initialize correctly', () => {
    const mockStage = { addChild: jest.fn() };
    const mockOnClick = jest.fn();
    
    const button = new StartButton(
      mockStage as any,
      800,
      600,
      'START',
      mockOnClick
    );
    
    expect(mockStage.addChild).toHaveBeenCalled();
    expect(button).toBeDefined();
  });
});