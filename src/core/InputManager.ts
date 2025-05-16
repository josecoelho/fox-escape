export type PlayerType = 'player1' | 'player2';

export class InputManager {
  private keys: { [key: string]: boolean } = {};
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
  
  public init(): void {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
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
    const keyMap = player === 'player1' ? this.player1Keys : this.player2Keys;
    return this.isKeyPressed(keyMap.action);
  }
  
  public destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
  }
}