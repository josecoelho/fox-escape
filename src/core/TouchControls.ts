import * as PIXI from 'pixi.js';
import { InputManager } from './InputManager';

// TypeScript has issues with PIXI.js events
// Let's use any for proper compatibility with both test environment and runtime
type AnyEvent = any;

export class TouchControls {
  private container: PIXI.Container;
  private leftJoystick: PIXI.Container;
  private rightJoystick: PIXI.Container;
  private hideButton: PIXI.Container;
  private fireButton: PIXI.Container;
  
  // Current joystick states
  private leftJoystickActive: boolean = false;
  private rightJoystickActive: boolean = false;
  private leftJoystickDirection = { x: 0, y: 0 };
  private rightJoystickDirection = { x: 0, y: 0 };
  
  // Track active touch points by identifier
  private activeTouches: { [id: number]: {
    control: string,
    startX: number,
    startY: number,
    currentX: number, 
    currentY: number
  }} = {};
  
  // Constant values for controls
  private static readonly LEFT_JOYSTICK = 'leftJoystick';
  private static readonly RIGHT_JOYSTICK = 'rightJoystick';
  private static readonly HIDE_BUTTON = 'hideButton';
  private static readonly FIRE_BUTTON = 'fireButton';
  
  // Track if hide/fire buttons are pressed
  private hideButtonPressed: boolean = false;
  private fireButtonPressed: boolean = false;
  
  constructor(
    private stage: PIXI.Container,
    private inputManager: InputManager,
    private width: number,
    private height: number
  ) {
    this.container = new PIXI.Container();
    this.container.zIndex = 1000; // Ensure it's above game elements
    this.stage.addChild(this.container);
    
    // Left side controls (fox)
    this.leftJoystick = this.createJoystick(0x44AA44, 100, this.height - 150);
    this.container.addChild(this.leftJoystick);
    
    // Right side controls (dragon)
    this.rightJoystick = this.createJoystick(0xAA4444, this.width - 100, this.height - 150);
    this.container.addChild(this.rightJoystick);
    
    // Action buttons
    this.hideButton = this.createActionButton(
      0x44AA44, 
      "HIDE", 
      100, 
      this.height - 300,
      this.createHideIcon()
    );
    this.container.addChild(this.hideButton);
    
    this.fireButton = this.createActionButton(
      0xAA4444, 
      "FIRE", 
      this.width - 100, 
      this.height - 300,
      this.createFireIcon()
    );
    this.container.addChild(this.fireButton);
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Sort the container's children by zIndex
    if (typeof this.container.sortChildren === 'function') {
      this.container.sortChildren();
    }
  }
  
  private createJoystick(color: number, x: number, y: number): PIXI.Container {
    const joystick = new PIXI.Container();
    
    // Create the base (outer circle)
    const base = new PIXI.Graphics();
    base.beginFill(color, 0.3);
    base.lineStyle(3, color, 0.8);
    base.drawCircle(0, 0, 80);
    base.endFill();
    
    // Create the knob (inner circle)
    const knob = new PIXI.Graphics();
    knob.beginFill(color, 0.6);
    knob.lineStyle(2, color, 0.9);
    knob.drawCircle(0, 0, 40);
    knob.endFill();
    
    // Add to joystick container
    joystick.addChild(base);
    joystick.addChild(knob);
    
    // Store knob as a property for easy access
    (joystick as any).knob = knob;
    
    // Position the joystick
    joystick.position.set(x, y);
    
    // Make it interactive
    joystick.interactive = true;
    // Set cursor style if buttonMode exists
    (joystick as any).buttonMode = true;
    
    return joystick;
  }
  
  private createActionButton(color: number, label: string, x: number, y: number, icon: PIXI.Graphics): PIXI.Container {
    const button = new PIXI.Container();
    
    // Create the button background
    const background = new PIXI.Graphics();
    background.beginFill(color, 0.3);
    background.lineStyle(3, color, 0.8);
    background.drawCircle(0, 0, 50);
    background.endFill();
    
    // Create the text label
    const text = new PIXI.Text(label, {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xFFFFFF,
      align: 'center'
    });
    text.anchor.set(0.5);
    text.position.set(0, 50);
    
    // Add to button container
    button.addChild(background);
    button.addChild(icon);
    button.addChild(text);
    
    // Position the button
    button.position.set(x, y);
    
    // Make it interactive
    button.interactive = true;
    // Set cursor style if buttonMode exists
    (button as any).buttonMode = true;
    
    return button;
  }
  
  private createHideIcon(): PIXI.Graphics {
    // Create an icon that represents hiding (eye with slash)
    const icon = new PIXI.Graphics();
    
    // Draw eye
    icon.lineStyle(3, 0xFFFFFF, 0.9);
    icon.beginFill(0x000000, 0);
    icon.drawEllipse(0, 0, 20, 12);
    icon.endFill();
    
    // Draw pupil
    icon.beginFill(0xFFFFFF, 0.9);
    icon.drawCircle(0, 0, 5);
    icon.endFill();
    
    // Draw slash
    icon.lineStyle(3, 0xFF0000, 0.9);
    icon.moveTo(-25, -15);
    icon.lineTo(25, 15);
    
    return icon;
  }
  
  private createFireIcon(): PIXI.Graphics {
    // Create an icon that represents fire (flame)
    const icon = new PIXI.Graphics();
    
    // Draw flame
    icon.beginFill(0xFF6600, 0.9);
    
    // Starting point
    icon.moveTo(0, -20);
    
    // Right curve
    icon.bezierCurveTo(15, -10, 20, 0, 10, 15);
    
    // Bottom
    icon.lineTo(0, 20);
    
    // Left curve
    icon.lineTo(-10, 15);
    icon.bezierCurveTo(-20, 0, -15, -10, 0, -20);
    
    icon.endFill();
    
    // Add inner flame
    icon.beginFill(0xFFCC00, 0.9);
    icon.moveTo(0, -10);
    icon.bezierCurveTo(8, -5, 10, 0, 5, 10);
    icon.lineTo(0, 15);
    icon.lineTo(-5, 10);
    icon.bezierCurveTo(-10, 0, -8, -5, 0, -10);
    icon.endFill();
    
    return icon;
  }
  
  private setupEventListeners(): void {
    // Explicitly enable touch events on all interactive elements
    this.container.interactive = true;
    this.container.interactiveChildren = true;
    
    // Touch/pointer events for the joysticks
    this.leftJoystick.on('pointerdown', this.onLeftJoystickDown.bind(this));
    this.leftJoystick.on('touchstart', this.onLeftJoystickDown.bind(this));
    
    this.rightJoystick.on('pointerdown', this.onRightJoystickDown.bind(this));
    this.rightJoystick.on('touchstart', this.onRightJoystickDown.bind(this));
    
    // Action buttons
    this.hideButton.on('pointerdown', this.onHideButtonDown.bind(this));
    this.hideButton.on('touchstart', this.onHideButtonDown.bind(this));
    this.hideButton.on('pointerup', this.onHideButtonUp.bind(this));
    this.hideButton.on('touchend', this.onHideButtonUp.bind(this));
    this.hideButton.on('pointerupoutside', this.onHideButtonUp.bind(this));
    this.hideButton.on('touchendoutside', this.onHideButtonUp.bind(this));
    
    this.fireButton.on('pointerdown', this.onFireButtonDown.bind(this));
    this.fireButton.on('touchstart', this.onFireButtonDown.bind(this));
    this.fireButton.on('pointerup', this.onFireButtonUp.bind(this));
    this.fireButton.on('touchend', this.onFireButtonUp.bind(this));
    this.fireButton.on('pointerupoutside', this.onFireButtonUp.bind(this));
    this.fireButton.on('touchendoutside', this.onFireButtonUp.bind(this));
    
    // Global events
    this.stage.interactive = true;
    this.stage.on('pointermove', this.onPointerMove.bind(this));
    this.stage.on('touchmove', this.onPointerMove.bind(this));
    this.stage.on('pointerup', this.onPointerUp.bind(this));
    this.stage.on('touchend', this.onPointerUp.bind(this));
    this.stage.on('pointerupoutside', this.onPointerUp.bind(this));
    this.stage.on('touchendoutside', this.onPointerUp.bind(this));
  }
  
  private onLeftJoystickDown(event: AnyEvent): void {
    const id = event.data.identifier;
    const x = event.data.global.x;
    const y = event.data.global.y;
    
    // Register this touch with the left joystick
    this.leftJoystickActive = true;
    this.activeTouches[id] = {
      control: TouchControls.LEFT_JOYSTICK,
      startX: this.leftJoystick.position.x,
      startY: this.leftJoystick.position.y,
      currentX: x,
      currentY: y
    };
    
    // Update joystick position
    this.updateLeftJoystickPosition(x, y);
  }
  
  private onRightJoystickDown(event: AnyEvent): void {
    const id = event.data.identifier;
    const x = event.data.global.x;
    const y = event.data.global.y;
    
    // Register this touch with the right joystick
    this.rightJoystickActive = true;
    this.activeTouches[id] = {
      control: TouchControls.RIGHT_JOYSTICK,
      startX: this.rightJoystick.position.x,
      startY: this.rightJoystick.position.y,
      currentX: x,
      currentY: y
    };
    
    // Update joystick position
    this.updateRightJoystickPosition(x, y);
  }
  
  private onHideButtonDown(event: AnyEvent): void {
    const id = event.data.identifier;
    const x = event.data.global.x;
    const y = event.data.global.y;
    
    // Register this touch with the hide button
    this.hideButtonPressed = true;
    this.activeTouches[id] = {
      control: TouchControls.HIDE_BUTTON,
      startX: x,
      startY: y,
      currentX: x,
      currentY: y
    };
    
    // Trigger the action
    this.inputManager.setActionPressed('player1', true);
    
    // Visual feedback
    (this.hideButton.children[0] as PIXI.Graphics).tint = 0x22FF22;
  }
  
  private onHideButtonUp(event: AnyEvent): void {
    const id = event.data.identifier;
    
    // Check if this was a touch on the hide button
    if (this.activeTouches[id] && this.activeTouches[id].control === TouchControls.HIDE_BUTTON) {
      this.hideButtonPressed = false;
      delete this.activeTouches[id];
      this.inputManager.setActionPressed('player1', false);
      
      // Visual feedback
      (this.hideButton.children[0] as PIXI.Graphics).tint = 0xFFFFFF;
    }
  }
  
  private onFireButtonDown(event: AnyEvent): void {
    const id = event.data.identifier;
    const x = event.data.global.x;
    const y = event.data.global.y;
    
    // Register this touch with the fire button
    this.fireButtonPressed = true;
    this.activeTouches[id] = {
      control: TouchControls.FIRE_BUTTON,
      startX: x,
      startY: y,
      currentX: x,
      currentY: y
    };
    
    // Trigger the action
    this.inputManager.setKeyPressed('f', true);
    
    // Visual feedback
    (this.fireButton.children[0] as PIXI.Graphics).tint = 0xFF2222;
  }
  
  private onFireButtonUp(event: AnyEvent): void {
    const id = event.data.identifier;
    
    // Check if this was a touch on the fire button
    if (this.activeTouches[id] && this.activeTouches[id].control === TouchControls.FIRE_BUTTON) {
      this.fireButtonPressed = false;
      delete this.activeTouches[id];
      this.inputManager.setKeyPressed('f', false);
      
      // Visual feedback
      (this.fireButton.children[0] as PIXI.Graphics).tint = 0xFFFFFF;
    }
  }
  
  private onPointerMove(event: AnyEvent): void {
    const id = event.data.identifier;
    const x = event.data.global.x;
    const y = event.data.global.y;
    
    // Check if we're tracking this touch point
    if (this.activeTouches[id]) {
      // Update current position
      this.activeTouches[id].currentX = x;
      this.activeTouches[id].currentY = y;
      
      // Handle based on which control this touch is associated with
      const control = this.activeTouches[id].control;
      
      if (control === TouchControls.LEFT_JOYSTICK) {
        this.updateLeftJoystickPosition(x, y);
      } else if (control === TouchControls.RIGHT_JOYSTICK) {
        this.updateRightJoystickPosition(x, y);
      }
      // Buttons don't need updates on move
    }
  }
  
  private onPointerUp(event: AnyEvent): void {
    const id = event.data.identifier;
    
    // Check if we're tracking this touch point
    if (this.activeTouches[id]) {
      const control = this.activeTouches[id].control;
      
      // Handle based on which control this touch is associated with
      if (control === TouchControls.LEFT_JOYSTICK) {
        this.leftJoystickActive = false;
        this.resetLeftJoystick();
      } else if (control === TouchControls.RIGHT_JOYSTICK) {
        this.rightJoystickActive = false;
        this.resetRightJoystick();
      } else if (control === TouchControls.HIDE_BUTTON) {
        this.onHideButtonUp(event);
      } else if (control === TouchControls.FIRE_BUTTON) {
        this.onFireButtonUp(event);
      }
      
      // Remove this touch from tracking
      delete this.activeTouches[id];
    }
  }
  
  private updateLeftJoystickPosition(x: number, y: number): void {
    const joystickX = this.leftJoystick.position.x;
    const joystickY = this.leftJoystick.position.y;
    
    // Calculate distance from center
    let deltaX = x - joystickX;
    let deltaY = y - joystickY;
    
    // Limit the distance to the joystick radius
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 80; // Same as joystick radius
    
    if (distance > maxDistance) {
      deltaX = (deltaX / distance) * maxDistance;
      deltaY = (deltaY / distance) * maxDistance;
    }
    
    // Update knob position
    const knob = (this.leftJoystick as any).knob;
    knob.position.set(deltaX, deltaY);
    
    // Update input direction (normalized -1 to 1)
    this.leftJoystickDirection.x = deltaX / maxDistance;
    this.leftJoystickDirection.y = deltaY / maxDistance;
    
    // Update input manager
    this.inputManager.setDirectionVector('player1', {
      x: this.leftJoystickDirection.x,
      y: this.leftJoystickDirection.y
    });
  }
  
  private updateRightJoystickPosition(x: number, y: number): void {
    const joystickX = this.rightJoystick.position.x;
    const joystickY = this.rightJoystick.position.y;
    
    // Calculate distance from center
    let deltaX = x - joystickX;
    let deltaY = y - joystickY;
    
    // Limit the distance to the joystick radius
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 80; // Same as joystick radius
    
    if (distance > maxDistance) {
      deltaX = (deltaX / distance) * maxDistance;
      deltaY = (deltaY / distance) * maxDistance;
    }
    
    // Update knob position
    const knob = (this.rightJoystick as any).knob;
    knob.position.set(deltaX, deltaY);
    
    // Update input direction (normalized -1 to 1)
    this.rightJoystickDirection.x = deltaX / maxDistance;
    this.rightJoystickDirection.y = deltaY / maxDistance;
    
    // Update input manager
    this.inputManager.setDirectionVector('player2', {
      x: this.rightJoystickDirection.x,
      y: this.rightJoystickDirection.y
    });
  }
  
  private resetLeftJoystick(): void {
    const knob = (this.leftJoystick as any).knob;
    knob.position.set(0, 0);
    
    this.leftJoystickDirection.x = 0;
    this.leftJoystickDirection.y = 0;
    
    // Update input manager
    this.inputManager.setDirectionVector('player1', {
      x: 0,
      y: 0
    });
  }
  
  private resetRightJoystick(): void {
    const knob = (this.rightJoystick as any).knob;
    knob.position.set(0, 0);
    
    this.rightJoystickDirection.x = 0;
    this.rightJoystickDirection.y = 0;
    
    // Update input manager
    this.inputManager.setDirectionVector('player2', {
      x: 0,
      y: 0
    });
  }
  
  public update(): void {
    // Handle any ongoing touch interactions or animations
    // Currently nothing to update on each frame
  }
  
  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    
    // Update positions of controls
    this.leftJoystick.position.set(100, height - 150);
    this.rightJoystick.position.set(width - 100, height - 150);
    this.hideButton.position.set(100, height - 300);
    this.fireButton.position.set(width - 100, height - 300);
  }
  
  public show(): void {
    this.container.visible = true;
  }
  
  public hide(): void {
    this.container.visible = false;
  }
  
  public destroy(): void {
    // Remove event listeners
    this.leftJoystick.off('pointerdown');
    this.leftJoystick.off('touchstart');
    
    this.rightJoystick.off('pointerdown');
    this.rightJoystick.off('touchstart');
    
    this.hideButton.off('pointerdown');
    this.hideButton.off('touchstart');
    this.hideButton.off('pointerup');
    this.hideButton.off('touchend');
    this.hideButton.off('pointerupoutside');
    this.hideButton.off('touchendoutside');
    
    this.fireButton.off('pointerdown');
    this.fireButton.off('touchstart');
    this.fireButton.off('pointerup');
    this.fireButton.off('touchend');
    this.fireButton.off('pointerupoutside');
    this.fireButton.off('touchendoutside');
    
    this.stage.off('pointermove');
    this.stage.off('touchmove');
    this.stage.off('pointerup');
    this.stage.off('touchend');
    this.stage.off('pointerupoutside');
    this.stage.off('touchendoutside');
    
    // Clear active touches
    this.activeTouches = {};
    
    // Reset input states
    this.leftJoystickActive = false;
    this.rightJoystickActive = false;
    this.hideButtonPressed = false;
    this.fireButtonPressed = false;
    
    // Reset input manager
    this.inputManager.setDirectionVector('player1', { x: 0, y: 0 });
    this.inputManager.setDirectionVector('player2', { x: 0, y: 0 });
    this.inputManager.setActionPressed('player1', false);
    this.inputManager.setKeyPressed('f', false);
    
    // Remove from stage
    this.stage.removeChild(this.container);
    
    // Destroy container and its children
    this.container.destroy({ children: true });
  }
}