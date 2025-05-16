import * as PIXI from 'pixi.js';
import { Entity } from './Entity';
import { Vector2 } from '../utils/Vector2';

export class Obstacle extends Entity {
  constructor(position: Vector2, width: number, height: number, texture: PIXI.Texture) {
    super(position, texture, 'obstacle', width, height);
    
    // Center the sprite based on the actual dimensions
    this.sprite.width = width;
    this.sprite.height = height;
  }
  
  // Obstacles don't need to update, but we'll override to ensure it's explicit
  public override update(): void {
    // Do nothing - obstacles are static
  }
}