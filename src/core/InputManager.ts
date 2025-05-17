export type PlayerType = 'player1' | 'player2';

export class InputManager {
  private keys: { [key: string]: boolean } = {};
  private touchDirections: { [player: string]: { x: number, y: number } } = {
    player1: { x: 0, y: 0 },
    player2: { x: 0, y: 0 }
  };
  private touchActions: { [player: string]: boolean } = {
    player1: false,
    player2: false
  };
  
  private player1Keys = {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
    action: 'Space'
  };
  
  private player2Keys = {
    up: 'w',
    down: 's',
    left: 'a',
    right: 'd',
    action: 'f'
  };
  
  private isTouchDevice: boolean = false;
  
  public init(): void {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Detect if this is a touch device
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }
  
  public isTouchEnabled(): boolean {
    return this.isTouchDevice;
  }
  
  private handleKeyDown(event: KeyboardEvent): void {
    this.keys[event.key] = true;
    
    // Fix for Space key detection
    if (event.key === ' ') {
      this.keys['Space'] = true;
    }
  }
  
  private handleKeyUp(event: KeyboardEvent): void {
    this.keys[event.key] = false;
    
    // Fix for Space key detection
    if (event.key === ' ') {
      this.keys['Space'] = false;
    }
  }
  
  public isKeyPressed(key: string): boolean {
    return this.keys[key] === true;
  }
  
  public getDirectionVector(player: PlayerType): { x: number, y: number } {
    const keyMap = player === 'player1' ? this.player1Keys : this.player2Keys;
    
    // Check for touch input first
    const touchDir = this.touchDirections[player];
    if (touchDir && (touchDir.x !== 0 || touchDir.y !== 0)) {
      return touchDir;
    }
    
    // Fall back to keyboard if no touch input
    let x = 0;
    let y = 0;
    
    if (this.isKeyPressed(keyMap.up)) {
      y -= 1;
    }
    
    if (this.isKeyPressed(keyMap.down)) {
      y += 1;
    }
    
    if (this.isKeyPressed(keyMap.left)) {
      x -= 1;
    }
    
    if (this.isKeyPressed(keyMap.right)) {
      x += 1;
    }
    
    // Normalize diagonal movement
    if (x !== 0 && y !== 0) {
      const length = Math.sqrt(x * x + y * y);
      x /= length;
      y /= length;
    }
    
    return { x, y };
  }
  
  public isActionPressed(player: PlayerType): boolean {
    // Check for touch input first
    if (this.touchActions[player]) {
      return true;
    }
    
    // Fall back to keyboard if no touch input
    const keyMap = player === 'player1' ? this.player1Keys : this.player2Keys;
    return this.isKeyPressed(keyMap.action);
  }
  
  // Methods for touch controls to use
  public setDirectionVector(player: PlayerType, direction: { x: number, y: number }): void {
    this.touchDirections[player] = direction;
  }
  
  public setActionPressed(player: PlayerType, pressed: boolean): void {
    this.touchActions[player] = pressed;
  }
  
  // Additional method for touch buttons that trigger keyboard keys
  public setKeyPressed(key: string, pressed: boolean): void {
    this.keys[key] = pressed;
  }
  
  public destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
  }
}