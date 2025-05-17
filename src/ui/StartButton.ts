import * as PIXI from 'pixi.js';

/**
 * A class representing a start/restart button for touch devices
 */
export class StartButton {
  private button: PIXI.Container;
  private isPressed: boolean = false;
  
  constructor(
    private stage: PIXI.Container,
    private width: number, 
    private height: number,
    private text: string = 'START',
    private onClick: () => void
  ) {
    // Create the button container
    this.button = new PIXI.Container();
    this.button.zIndex = 1200; // Higher than game controls
    this.stage.addChild(this.button);
    
    this.createButton();
    this.setupEventListeners();
  }
  
  private createButton(): void {
    // Clear any previous children
    while (this.button.children[0]) {
      this.button.removeChild(this.button.children[0]);
    }
    
    // Create the button background
    const background = new PIXI.Graphics();
    background.beginFill(0x44AA44, 0.9);
    background.lineStyle(4, 0x338833, 1);
    background.drawRoundedRect(-100, -40, 200, 80, 15);
    background.endFill();
    
    // Create the text
    const buttonText = new PIXI.Text(this.text, {
      fontFamily: 'Arial',
      fontSize: 32,
      fontWeight: 'bold',
      fill: 0xFFFFFF,
      align: 'center',
      stroke: 0x000000,
      strokeThickness: 4
    });
    buttonText.anchor.set(0.5);
    
    // Add to button container
    this.button.addChild(background);
    this.button.addChild(buttonText);
    
    // Position the button
    this.button.position.set(this.width / 2, this.height - 100);
    
    // Make it interactive
    this.button.interactive = true;
    (this.button as any).buttonMode = true;
  }
  
  private setupEventListeners(): void {
    this.button.on('pointerdown', this.onButtonDown.bind(this));
    this.button.on('pointerup', this.onButtonUp.bind(this));
    this.button.on('pointerupoutside', this.onButtonUp.bind(this));
  }
  
  private onButtonDown(): void {
    // Visual feedback
    this.button.scale.set(0.95, 0.95);
    this.isPressed = true;
    
    // Trigger the click handler
    this.onClick();
  }
  
  private onButtonUp(): void {
    // Reset scale
    this.button.scale.set(1, 1);
    this.isPressed = false;
  }
  
  /**
   * Update button text
   */
  public setText(text: string): void {
    this.text = text;
    if (this.button.children.length > 1) {
      const textElement = this.button.children[1] as PIXI.Text;
      textElement.text = text;
    }
  }
  
  /**
   * Reposition the button on resize
   */
  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.button.position.set(width / 2, height - 100);
  }
  
  /**
   * Show the button
   */
  public show(): void {
    this.button.visible = true;
  }
  
  /**
   * Hide the button
   */
  public hide(): void {
    this.button.visible = false;
  }
  
  /**
   * Clean up resources
   */
  public destroy(): void {
    this.button.off('pointerdown');
    this.button.off('pointerup');
    this.button.off('pointerupoutside');
    
    if (this.button.parent) {
      this.button.parent.removeChild(this.button);
    }
    
    this.button.destroy({ children: true });
  }
}