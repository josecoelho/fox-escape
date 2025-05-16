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
  
  // Store map boundaries to prevent dragon from leaving the playable area
  private mapWidth: number = 0;
  private mapHeight: number = 0;
  
  constructor(position: Vector2, texture: PIXI.Texture) {
    super(position, texture, 'dragon', 40, 40);
  }
  
  // Set map boundaries
  public setMapBoundaries(width: number, height: number): void {
    this.mapWidth = width;
    this.mapHeight = height;
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
    
    // Keep dragon within map boundaries (if boundaries have been set)
    if (this.mapWidth > 0 && this.mapHeight > 0) {
      // Calculate dragon's edges accounting for its dimensions
      const halfWidth = this.width / 2;
      const halfHeight = this.height / 2;
      
      // Create padding to ensure dragon doesn't partially go out of bounds
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