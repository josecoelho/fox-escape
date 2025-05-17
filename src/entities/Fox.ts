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
  
  // Store map boundaries to prevent fox from leaving the playable area
  private mapWidth: number = 0;
  private mapHeight: number = 0;
  
  // Set map boundaries
  public setMapBoundaries(width: number, height: number): void {
    this.mapWidth = width;
    this.mapHeight = height;
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
    
    // Save position before update to use for boundary checking
    const prevPosition = this.position.copy();
    
    super.update(deltaTime);
    
    // Update visual based on hiding state
    if (this.isHiding) {
      // Use a higher alpha (0.7) so fox is still visible to the player
      // but hunters can't see it (in game logic)
      this.sprite.alpha = 0.7;
    } else {
      this.sprite.alpha = 1;
    }
    
    // Keep fox within map boundaries (if boundaries have been set)
    if (this.mapWidth > 0 && this.mapHeight > 0) {
      // Calculate fox's edges accounting for its dimensions
      const halfWidth = this.width / 2;
      const halfHeight = this.height / 2;
      
      // Create padding to ensure fox doesn't partially go out of bounds
      const padding = 5;
      
      // Check horizontal boundaries
      if (this.position.x - halfWidth < padding) {
        // Hitting left boundary
        this.position.x = halfWidth + padding;
        this.velocity.x = 0;
      } else if (this.position.x + halfWidth > this.mapWidth - padding) {
        // Hitting right boundary
        this.position.x = this.mapWidth - halfWidth - padding;
        this.velocity.x = 0;
      }
      
      // Check vertical boundaries
      if (this.position.y - halfHeight < padding) {
        // Hitting top boundary
        this.position.y = halfHeight + padding;
        this.velocity.y = 0;
      } else if (this.position.y + halfHeight > this.mapHeight - padding) {
        // Hitting bottom boundary
        this.position.y = this.mapHeight - halfHeight - padding;
        this.velocity.y = 0;
      }
      
      // Update sprite position if we had to adjust for boundaries
      this.sprite.position.set(this.position.x, this.position.y);
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
    // Fox has collected food and will create poo
    // The actual poo creation happens in the World class
    // We'll just increment the food counter here
  }
  
  /**
   * Creates poo at the fox's current position
   * Called by the World after the fox has eaten food
   * @returns the position where poo should be created
   */
  public createPoo(): Vector2 {
    // Return a copy of the current position
    return this.position.copy();
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