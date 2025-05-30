import * as PIXI from 'pixi.js';
import { StartButton } from '../ui/StartButton';

export enum GameStateType {
  START_SCREEN,
  PLAYING,
  GAME_OVER
}

export class GameState {
  private type: GameStateType;
  private container: PIXI.Container;
  private startScreen: PIXI.Container;
  private gameOverScreen: PIXI.Container;
  private difficulty: number = 1;
  private hunterSpawnInterval: number = 5; // Seconds between hunter spawns
  private timeSinceLastSpawn: number = 0;
  private foodSpawnInterval: number = 12; // Seconds between food spawns (longer than hunters)
  private timeSinceLastFoodSpawn: number = 0;
  private maxFoodOnMap: number = 5; // Maximum food items on map at once
  private score: number = 0;
  private isTouchDevice: boolean = false;
  private startButton: StartButton | null = null;
  private restartButton: StartButton | null = null;
  private onResetGame: (() => void) | null = null;
  
  constructor(stage: PIXI.Container) {
    this.type = GameStateType.START_SCREEN;
    this.container = stage;
    
    // Detect if this is a touch device
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Create UI containers
    this.startScreen = new PIXI.Container();
    this.gameOverScreen = new PIXI.Container();
    
    // Initialize screens but don't add them yet
    this.initStartScreen();
    this.initGameOverScreen();
    
    // Start with showing the start screen
    this.showStartScreen();
  }
  
  /**
   * Register a callback to reset the game world
   * @param callback Function to call when game should be reset
   */
  public registerResetCallback(callback: () => void): void {
    this.onResetGame = callback;
  }
  
  public getState(): GameStateType {
    return this.type;
  }
  
  public setState(state: GameStateType): void {
    const previousState = this.type;
    this.type = state;
    
    // Handle state transitions
    if (previousState !== state) {
      console.log(`Game state changed from ${previousState} to ${state}`);
      switch (state) {
        case GameStateType.START_SCREEN:
          this.showStartScreen();
          break;
        case GameStateType.PLAYING:
          this.hideAllScreens();
          this.resetGame();
          // The fox should not be hidden when the game starts
          // World class will handle ensuring this state
          break;
        case GameStateType.GAME_OVER:
          this.showGameOverScreen();
          break;
      }
    }
  }
  
  private showStartScreen(): void {
    this.hideAllScreens();
    this.container.addChild(this.startScreen);
    
    // Show start button if on touch device
    if (this.isTouchDevice && this.startButton) {
      this.startButton.show();
    }
  }
  
  private showGameOverScreen(): void {
    this.hideAllScreens();
    
    // Update final score on game over screen
    const scoreText = this.gameOverScreen.getChildByName('scoreText') as PIXI.Text;
    if (scoreText) {
      scoreText.text = `Final Score: ${this.score}`;
    }
    
    this.container.addChild(this.gameOverScreen);
    
    // Show restart button if on touch device
    if (this.isTouchDevice && this.restartButton) {
      this.restartButton.show();
    }
  }
  
  private hideAllScreens(): void {
    if (this.startScreen.parent) {
      this.startScreen.parent.removeChild(this.startScreen);
    }
    
    if (this.gameOverScreen.parent) {
      this.gameOverScreen.parent.removeChild(this.gameOverScreen);
    }
    
    // Hide any buttons
    if (this.isTouchDevice) {
      if (this.startButton) this.startButton.hide();
      if (this.restartButton) this.restartButton.hide();
    }
  }
  
  private resetGame(): void {
    this.difficulty = 1;
    this.timeSinceLastSpawn = 0;
    this.timeSinceLastFoodSpawn = 0;
    this.score = 0;
  }
  
  private initStartScreen(): void {
    // Title
    const title = new PIXI.Text('Fox Escape', {
      fontFamily: 'Arial',
      fontSize: 64,
      fill: 0xFFFFFF,
      align: 'center',
      stroke: 0x000000,
      strokeThickness: 5
    });
    title.anchor.set(0.5);
    title.position.set(window.innerWidth / 2, window.innerHeight / 4);
    
    // Instructions text - different for touch vs keyboard
    let instructionsText = '';
    
    if (this.isTouchDevice) {
      instructionsText = 
        'Help the fox escape from the hunters!\n\n' +
        'Left side controls (Fox):\n' +
        '- Left joystick to move\n' +
        '- HIDE button to hide\n\n' +
        'Right side controls (Dragon):\n' +
        '- Right joystick to move\n' +
        '- FIRE button to shoot fireballs\n\n' +
        'Collect food to increase your score!\n\n' +
        'Tap START button to begin';
    } else {
      instructionsText = 
        'Help the fox escape from the hunters!\n\n' +
        'Player 1 (Fox):\n' +
        '- Arrow keys to move\n' +
        '- Space to hide\n\n' +
        'Player 2 (Dragon):\n' +
        '- WASD to move\n' +
        '- F to shoot fireballs at closest hunter\n\n' +
        'Collect food to increase your score!\n\n' +
        'Press SPACE to start';
    }
    
    const instructions = new PIXI.Text(
      instructionsText, 
      {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xFFFFFF,
        align: 'center',
        stroke: 0x000000,
        strokeThickness: 3
      }
    );
    
    instructions.anchor.set(0.5);
    instructions.position.set(window.innerWidth / 2, window.innerHeight / 2 + 50);
    
    this.startScreen.addChild(title);
    this.startScreen.addChild(instructions);
    
    // Create start button for touch devices
    if (this.isTouchDevice) {
      this.startButton = new StartButton(
        this.container,
        window.innerWidth,
        window.innerHeight,
        'START',
        () => {
          this.setState(GameStateType.PLAYING);
          if (this.startButton) this.startButton.hide();
        }
      );
    }
  }
  
  private initGameOverScreen(): void {
    // Game Over title
    const gameOverTitle = new PIXI.Text('Game Over', {
      fontFamily: 'Arial',
      fontSize: 64,
      fill: 0xFF0000,
      align: 'center',
      stroke: 0x000000,
      strokeThickness: 5
    });
    gameOverTitle.anchor.set(0.5);
    gameOverTitle.position.set(window.innerWidth / 2, window.innerHeight / 3);
    
    // Score text
    const scoreText = new PIXI.Text('Final Score: 0', {
      fontFamily: 'Arial',
      fontSize: 36,
      fill: 0xFFFFFF,
      align: 'center',
      stroke: 0x000000,
      strokeThickness: 3
    });
    scoreText.name = 'scoreText'; // To easily update this later
    scoreText.anchor.set(0.5);
    scoreText.position.set(window.innerWidth / 2, window.innerHeight / 2);
    
    // Restart instructions - different for touch vs keyboard
    const restartText = new PIXI.Text(
      this.isTouchDevice ? 'Tap RESTART button to play again' : 'Press SPACE to play again', 
      {
        fontFamily: 'Arial',
        fontSize: 28,
        fill: 0xFFFFFF,
        align: 'center',
        stroke: 0x000000,
        strokeThickness: 3
      }
    );
    restartText.anchor.set(0.5);
    restartText.position.set(window.innerWidth / 2, window.innerHeight / 2 + 100);
    
    this.gameOverScreen.addChild(gameOverTitle);
    this.gameOverScreen.addChild(scoreText);
    this.gameOverScreen.addChild(restartText);
    
    // Create restart button for touch devices
    if (this.isTouchDevice) {
      this.restartButton = new StartButton(
        this.container,
        window.innerWidth,
        window.innerHeight,
        'RESTART',
        () => {
          // First reset the game world if callback is registered
          if (this.onResetGame) {
            this.onResetGame();
          }
          
          // Then reset the game state and transition to playing
          this.resetGame();
          this.setState(GameStateType.PLAYING);
          if (this.restartButton) this.restartButton.hide();
        }
      );
      this.restartButton.hide(); // Initially hidden
    }
  }
  
  public update(deltaTime: number): void {
    if (this.type === GameStateType.PLAYING) {
      // Increase difficulty over time (every 30 seconds)
      this.difficulty += deltaTime * 0.01;
      
      // Track time since last hunter spawn
      this.timeSinceLastSpawn += deltaTime;
      
      // Track time since last food spawn
      this.timeSinceLastFoodSpawn += deltaTime;
    }
  }
  
  public shouldSpawnHunter(): boolean {
    // Only spawn hunters during gameplay
    if (this.type !== GameStateType.PLAYING) return false;
    
    // Check if it's time to spawn a new hunter
    // As difficulty increases, hunters spawn more frequently
    const spawnTime = this.hunterSpawnInterval / this.difficulty;
    if (this.timeSinceLastSpawn >= spawnTime) {
      this.timeSinceLastSpawn = 0;
      return true;
    }
    
    return false;
  }
  
  public shouldSpawnFood(currentFoodCount: number): boolean {
    // Only spawn food during gameplay
    if (this.type !== GameStateType.PLAYING) return false;
    
    // Don't spawn if we've reached the maximum food count
    if (currentFoodCount >= this.maxFoodOnMap) return false;
    
    // Food spawn interval increases slightly with difficulty
    // This makes food slightly rarer as game progresses
    const adjustedInterval = this.foodSpawnInterval * Math.sqrt(this.difficulty);
    
    // Check if it's time to spawn new food
    if (this.timeSinceLastFoodSpawn >= adjustedInterval) {
      this.timeSinceLastFoodSpawn = 0;
      return true;
    }
    
    return false;
  }
  
  public getDifficulty(): number {
    return this.difficulty;
  }
  
  public increaseScore(amount: number = 1): void {
    this.score += amount;
  }
  
  public getScore(): number {
    return this.score;
  }
  
  public resize(width: number, height: number): void {
    // Update UI positions on resize
    if (this.startScreen) {
      const title = this.startScreen.getChildAt(0) as PIXI.Text;
      const instructions = this.startScreen.getChildAt(1) as PIXI.Text;
      
      title.position.set(width / 2, height / 4);
      instructions.position.set(width / 2, height / 2 + 50);
    }
    
    if (this.gameOverScreen) {
      const gameOverTitle = this.gameOverScreen.getChildAt(0) as PIXI.Text;
      const scoreText = this.gameOverScreen.getChildAt(1) as PIXI.Text;
      const restartText = this.gameOverScreen.getChildAt(2) as PIXI.Text;
      
      gameOverTitle.position.set(width / 2, height / 3);
      scoreText.position.set(width / 2, height / 2);
      restartText.position.set(width / 2, height / 2 + 100);
    }
    
    // Resize buttons if they exist
    if (this.startButton) {
      this.startButton.resize(width, height);
    }
    
    if (this.restartButton) {
      this.restartButton.resize(width, height);
    }
  }
  
  /**
   * Returns whether the device supports touch input
   */
  public isTouchSupported(): boolean {
    return this.isTouchDevice;
  }
}