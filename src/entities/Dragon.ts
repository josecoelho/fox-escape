import * as PIXI from 'pixi.js';
import { Entity } from './Entity';
import { Vector2 } from '../utils/Vector2';
import { InputManager } from '../core/InputManager';
import { Fireball } from './Fireball';

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
  
  public shootFireball(): Fireball | null {
    if (!this.canShoot()) {
      return null;
    }
    
    this.timeSinceLastFireball = 0;
    
    // Create a new fireball starting at dragon's position
    const fireball = new Fireball(
      this.position.copy(),
      PIXI.Texture.from('fireball.png'),
      this.getShootingDirection()
    );
    
    return fireball;
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