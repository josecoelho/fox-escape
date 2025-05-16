import * as PIXI from 'pixi.js';
import { Entity } from './Entity';
import { Vector2 } from '../utils/Vector2';
import { InputManager } from '../core/InputManager';

export class Fox extends Entity {
  private speed: number = 200;
  private foodCollected: number = 0;
  private isHiding: boolean = false;
  private isCaught: boolean = false;
  
  constructor(position: Vector2, texture: PIXI.Texture) {
    super(position, texture, 'fox', 30, 30);
  }
  
  public override update(deltaTime: number, inputManager?: InputManager, playerType?: string): void {
    if (!this.isActive || this.isCaught) return;
    
    if (inputManager && playerType) {
      const direction = inputManager.getDirectionVector(playerType as any);
      
      // Move based on input
      this.velocity.x = direction.x * this.speed;
      this.velocity.y = direction.y * this.speed;
      
      // Toggle hiding with action button
      if (inputManager.isActionPressed(playerType as any)) {
        this.toggleHiding();
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
  
  public toggleHiding(): void {
    // Only toggle if not recently toggled (prevent rapid toggling)
    this.isHiding = !this.isHiding;
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
}