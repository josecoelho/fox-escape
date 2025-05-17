import * as PIXI from 'pixi.js';
import { Entity } from './Entity';
import { Vector2 } from '../utils/Vector2';

export class Poo extends Entity {
  private lifespan: number = 15; // How long the poo stays on the ground (seconds)
  private remainingLifespan: number = 15;
  
  constructor(position: Vector2, texture: PIXI.Texture) {
    super(position, texture, 'poo' as any, 30, 30);
    
    // Set the color tint of the sprite to brown
    this.sprite.tint = 0x663300;
    
    // Make sure the sprite is visible
    this.sprite.alpha = 1;
    
    // Create a custom poo appearance
    this.drawPooShape();
  }
  
  private drawPooShape(): void {
    // Create a new graphic for the poo
    const pooGraphic = new PIXI.Graphics();
    
    // Make it brown
    pooGraphic.beginFill(0x663300, 1);
    
    // Draw a main blob (larger size)
    pooGraphic.drawCircle(0, 0, 15);
    
    // Draw some smaller blobs on top to make it look like a pile
    pooGraphic.drawCircle(-8, -8, 10);
    pooGraphic.drawCircle(8, -9, 12);
    pooGraphic.drawCircle(-5, -14, 9);
    pooGraphic.drawCircle(6, -15, 8);
    
    // Add some darker brown details
    pooGraphic.beginFill(0x442200, 1);
    pooGraphic.drawCircle(3, -3, 5);
    pooGraphic.drawCircle(-6, -10, 3);
    
    pooGraphic.endFill();
    
    // Add the graphic to the sprite as a child
    this.sprite.addChild(pooGraphic);
  }
  
  public override update(deltaTime: number): void {
    if (!this.isActive) return;
    
    // Count down lifespan
    this.remainingLifespan -= deltaTime;
    if (this.remainingLifespan <= 0) {
      this.deactivate();
      return;
    }
    
    // Make poo fade out when nearing the end of its lifespan
    if (this.remainingLifespan < 3) {
      const alpha = this.remainingLifespan / 3;
      this.sprite.alpha = alpha;
    }
    
    super.update(deltaTime);
  }
  
  public getRemainingLifespan(): number {
    return this.remainingLifespan;
  }
  
  public override destroy(): void {
    // Remove all child graphics from the sprite
    if (this.sprite && this.sprite.children && this.sprite.children.length > 0) {
      // Remove all children (cleanup graphics)
      this.sprite.removeChildren();
    }
    
    super.destroy();
  }
}