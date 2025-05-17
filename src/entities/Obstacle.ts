import * as PIXI from 'pixi.js';
import { Entity } from './Entity';
import { Vector2 } from '../utils/Vector2';

export class Obstacle extends Entity {
  private collisionBoundary: PIXI.Graphics | null = null;

  constructor(position: Vector2, width: number, height: number, texture: PIXI.Texture) {
    super(position, texture, 'obstacle', width, height);
    
    // Center the sprite based on the actual dimensions
    this.sprite.width = width;
    this.sprite.height = height;
    
    // Add a collision boundary visualization for debug purposes
    // Uncomment to visualize the collision boundaries
    /*
    this.collisionBoundary = new PIXI.Graphics();
    this.collisionBoundary.lineStyle(2, 0xFF0000, 0.5);
    this.collisionBoundary.drawRect(-width/2, -height/2, width, height);
    this.sprite.addChild(this.collisionBoundary);
    */
    
    // Adjust hitArea to match the collision boundary - only in browser context
    if (typeof window !== 'undefined' && typeof PIXI.Rectangle === 'function') {
      // Only set hit area in game context, not in tests
      this.sprite.hitArea = new PIXI.Rectangle(-width/2, -height/2, width, height);
    }
  }
  
  // Obstacles don't need to update, but we'll override to ensure it's explicit
  public override update(): void {
    // Do nothing - obstacles are static
  }
}