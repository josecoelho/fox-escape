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
      // Use a basic red circle texture for the fireball
      // Instead of trying to create a texture from graphics (which causes runtime errors),
      // let's use a basic colored circle using a render texture
      
      // Create a simple 20x20 canvas with a red circle
      const canvas = document.createElement('canvas');
      canvas.width = 20;
      canvas.height = 20;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.arc(10, 10, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#FF0000';
        ctx.fill();
      }
      
      // Create a texture from the canvas
      const fireballTexture = PIXI.Texture.from(canvas);
      
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
      // Use a basic red circle texture for the fireball
      // Instead of trying to create a texture from graphics (which causes runtime errors),
      // let's use a basic colored circle using a render texture
      
      // Create a simple 20x20 canvas with a red circle
      const canvas = document.createElement('canvas');
      canvas.width = 20;
      canvas.height = 20;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.arc(10, 10, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#FF0000';
        ctx.fill();
      }
      
      // Create a texture from the canvas
      const fireballTexture = PIXI.Texture.from(canvas);
      
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