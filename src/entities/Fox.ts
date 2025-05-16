import * as PIXI from 'pixi.js';
import { Entity } from './Entity';
import { Vector2 } from '../utils/Vector2';
import { InputManager } from '../core/InputManager';

export class Fox extends Entity {
  private speed: number = 200;
  private foodCollected: number = 0;
  private isHiding: boolean = false;
  private isCaught: boolean = false;
  
  // Hiding mechanics
  private hidingCooldown: number = 10; // Seconds before fox can hide again
  private hidingDuration: number = 2; // Seconds fox stays hidden
  private timeSinceLastHide: number = this.hidingCooldown; // Start with ability to hide
  private hideTimeRemaining: number = 0; // Countdown for current hiding
  
  constructor(position: Vector2, texture: PIXI.Texture) {
    super(position, texture, 'fox', 30, 30);
    
    // Ensure fox is not hidden at start of game
    this.isHiding = false;
    this.timeSinceLastHide = this.hidingCooldown; // Start with ability to hide
    this.hideTimeRemaining = 0;
  }
  
  public override update(deltaTime: number, inputManager?: InputManager, playerType?: string): void {
    if (!this.isActive || this.isCaught) return;
    
    // Update hiding timers
    this.timeSinceLastHide += deltaTime;
    
    // If fox is currently hiding, count down the duration
    if (this.isHiding) {
      this.hideTimeRemaining -= deltaTime;
      if (this.hideTimeRemaining <= 0) {
        this.isHiding = false;
        this.hideTimeRemaining = 0;
      }
    }
    
    if (inputManager && playerType) {
      const direction = inputManager.getDirectionVector(playerType as any);
      
      // Move based on input
      this.velocity.x = direction.x * this.speed;
      this.velocity.y = direction.y * this.speed;
      
      // Try to hide with action button, if cooldown allows
      if (inputManager.isActionPressed(playerType as any)) {
        this.tryHide();
      }
    }
    
    super.update(deltaTime);
    
    // Update visual based on hiding state
    if (this.isHiding) {
      this.sprite.alpha = 0.5;
    } else {
      this.sprite.alpha = 1;
    }
  }
  
  public tryHide(): void {
    // Only allow hiding if cooldown has elapsed and not already hiding
    if (this.timeSinceLastHide >= this.hidingCooldown && !this.isHiding) {
      this.isHiding = true;
      this.hideTimeRemaining = this.hidingDuration;
      this.timeSinceLastHide = 0;
    }
  }
  
  public collectFood(): void {
    this.foodCollected++;
    // Could emit an event or callback here
  }
  
  public getFoodCollected(): number {
    return this.foodCollected;
  }
  
  public handleCollision(): void {
    // Push back slightly when hitting an obstacle
    this.position = this.position.subtract(this.velocity.normalize().scale(10));
    this.velocity = new Vector2(0, 0);
  }
  
  public getCaught(): void {
    if (!this.isHiding) {
      this.isCaught = true;
      this.deactivate();
      // Could emit an event or callback here
    }
  }
  
  public isHidden(): boolean {
    return this.isHiding;
  }
  
  // For debugging and UI
  public getHideCooldownRemaining(): number {
    if (this.isHiding) {
      return 0; // Can't hide while already hiding
    }
    return Math.max(0, this.hidingCooldown - this.timeSinceLastHide);
  }
  
  public getHideDurationRemaining(): number {
    return this.hideTimeRemaining;
  }
  
  public resetHidingState(): void {
    // Reset hiding state (used when game restarts)
    this.isHiding = false;
    this.timeSinceLastHide = this.hidingCooldown; // Start with ability to hide
    this.hideTimeRemaining = 0;
  }
}