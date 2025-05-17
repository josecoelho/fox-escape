import { StartButton } from './StartButton';

// Simple mock for PIXI
jest.mock('pixi.js', () => {
  return {
    Container: jest.fn().mockImplementation(() => ({
      addChild: jest.fn(),
      removeChild: jest.fn(),
      children: [{ }, { text: 'START' }],
      position: { set: jest.fn() },
      scale: { set: jest.fn() },
      on: jest.fn(),
      off: jest.fn(),
      visible: true,
      parent: { removeChild: jest.fn() },
      destroy: jest.fn()
    })),
    Graphics: jest.fn().mockImplementation(() => ({
      beginFill: jest.fn().mockReturnThis(),
      lineStyle: jest.fn().mockReturnThis(),
      drawRoundedRect: jest.fn().mockReturnThis(),
      endFill: jest.fn().mockReturnThis()
    })),
    Text: jest.fn().mockImplementation(() => ({
      anchor: { set: jest.fn() },
      text: 'START'
    }))
  };
});

describe('StartButton basic tests', () => {
  test('it should create a start button', () => {
    // Simple test just to make sure the component renders
    const mockStage = { addChild: jest.fn() };
    const onClickHandler = jest.fn();
    
    const startButton = new StartButton(
      mockStage as any,
      800,
      600,
      'START',
      onClickHandler
    );
    
    // Basic verification that the button was created
    expect(mockStage.addChild).toHaveBeenCalled();
    expect(startButton).toBeDefined();
  });
});