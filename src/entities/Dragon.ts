import * as PIXI from 'pixi.js';
import { Entity } from './Entity';
import { Vector2 } from '../utils/Vector2';
import { InputManager } from '../core/InputManager';
import { Fireball } from './Fireball';
import { Hunter } from './Hunter';

export class Dragon extends Entity {
  private speed: number = 150;
  private fireballCooldown: number = 0.5; // in seconds
  private timeSinceLastFireball: number = this.fireballCooldown;
  
  constructor(position: Vector2, texture: PIXI.Texture) {
    super(position, texture, 'dragon', 40, 40);
  }
  
  public override update(deltaTime: number, inputManager?: InputManager, playerType?: string): void {
    if (!this.isActive) return;
    
    // Update fireball cooldown
    this.timeSinceLastFireball += deltaTime;
    
    if (inputManager && playerType) {
      const direction = inputManager.getDirectionVector(playerType as any);
      
      // Move based on input
      this.velocity.x = direction.x * this.speed;
      this.velocity.y = direction.y * this.speed;
    }
    
    super.update(deltaTime);
  }
  
  public canShoot(): boolean {
    return this.timeSinceLastFireball >= this.fireballCooldown;
  }
  
  /**
   * Shoots a fireball in the direction of the dragon's movement
   */
  public shootFireball(): Fireball | null {
    if (!this.canShoot()) {
      return null;
    }
    
    this.timeSinceLastFireball = 0;
    
    // Create a new fireball starting at dragon's position
    try {
      // Create a simple graphic for the fireball in case texture loading fails
      const fireballGraphics = new PIXI.Graphics();
      fireballGraphics.beginFill(0xFF0000);  // Red color
      fireballGraphics.drawCircle(0, 0, 10); // Circle with radius 10
      fireballGraphics.endFill();
      
      const fireballTexture = PIXI.Texture.from(fireballGraphics);
      
      const fireball = new Fireball(
        this.position.copy(),
        fireballTexture,
        this.getShootingDirection()
      );
      
      console.log("Dragon shot a fireball in direction:", this.getShootingDirection());
      return fireball;
    } catch (error) {
      console.error("Error creating fireball:", error);
      return null;
    }
  }
  
  /**
   * Shoots a fireball toward the target position
   */
  public shootFireballAt(targetPosition: Vector2): Fireball | null {
    if (!this.canShoot()) {
      return null;
    }
    
    this.timeSinceLastFireball = 0;
    
    try {
      // Create a simple graphic for the fireball in case texture loading fails
      const fireballGraphics = new PIXI.Graphics();
      fireballGraphics.beginFill(0xFF0000);  // Red color
      fireballGraphics.drawCircle(0, 0, 10); // Circle with radius 10
      fireballGraphics.endFill();
      
      const fireballTexture = PIXI.Texture.from(fireballGraphics);
      
      // Calculate direction to target
      const direction = Vector2.subtract(targetPosition, this.position).normalize();
      
      // Create a new fireball starting at dragon's position
      const fireball = new Fireball(
        this.position.copy(),
        fireballTexture,
        direction
      );
      
      console.log("Dragon shot a fireball at target:", targetPosition.x, targetPosition.y);
      return fireball;
    } catch (error) {
      console.error("Error creating fireball:", error);
      return null;
    }
  }
  
  private getShootingDirection(): Vector2 {
    // For simplicity, we'll shoot in the direction the dragon is moving
    // If not moving, shoot in a default direction (right)
    if (this.velocity.x === 0 && this.velocity.y === 0) {
      return new Vector2(1, 0);
    }
    
    return this.velocity.normalize();
  }
}