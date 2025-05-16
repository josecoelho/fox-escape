import * as PIXI from 'pixi.js';
import { Entity } from './Entity';
import { Vector2 } from '../utils/Vector2';

export class Fireball extends Entity {
  private speed: number = 400;
  private lifetime: number = 2; // in seconds
  private currentLifetime: number = 0;
  
  constructor(position: Vector2, texture: PIXI.Texture, direction: Vector2) {
    super(position, texture, 'fireball', 20, 20);
    
    // Set velocity based on direction
    this.velocity = direction.scale(this.speed);
    
    // Add a glow effect
    this.sprite.filters = [this.createGlowFilter()];
  }
  
  private createGlowFilter(): PIXI.Filter {
    const blurFilter = new PIXI.BlurFilter();
    blurFilter.blur = 5;
    return blurFilter;
  }
  
  public override update(deltaTime: number): void {
    if (!this.isActive) return;
    
    // Update lifetime
    this.currentLifetime += deltaTime;
    
    // Deactivate when lifetime expires
    if (this.currentLifetime >= this.lifetime) {
      this.deactivate();
      return;
    }
    
    super.update(deltaTime);
    
    // Add rotation effect
    this.sprite.rotation += deltaTime * 5;
  }
}