import * as PIXI from 'pixi.js';
import { Entity } from './Entity';
import { Vector2 } from '../utils/Vector2';

export class Food extends Entity {
  private collectAnimation: boolean = false;
  private collectAnimationTime: number = 0;
  private maxCollectAnimationTime: number = 0.5; // seconds
  private animationTicker: PIXI.Ticker | null = null;
  
  constructor(position: Vector2, texture: PIXI.Texture) {
    super(position, texture, 'food', 20, 20);
    
    // Add a slight bobbing animation
    this.startBobbingAnimation();
  }
  
  private startBobbingAnimation(): void {
    // Use PIXI's built-in ticker for animation
    this.animationTicker = new PIXI.Ticker();
    this.animationTicker.add((deltaTime) => {
      if (!this.isActive) return;
      
      const deltaSeconds = deltaTime / PIXI.Ticker.shared.FPS;
      
      if (this.collectAnimation) {
        // Collect animation
        this.collectAnimationTime += deltaSeconds;
        
        const progress = this.collectAnimationTime / this.maxCollectAnimationTime;
        
        if (progress >= 1) {
          this.deactivate();
          return;
        }
        
        // Scale down and fade out
        this.sprite.scale.set(1 - progress);
        this.sprite.alpha = 1 - progress;
        
        // Rise up slightly
        this.sprite.position.y = this.position.y - progress * 20;
      } else {
        // Idle bobbing animation
        const time = performance.now() / 1000;
        const yOffset = Math.sin(time * 2) * 3;
        
        this.sprite.position.y = this.position.y + yOffset;
      }
    });
    
    this.animationTicker.start();
  }
  
  public collect(): void {
    if (!this.collectAnimation) {
      this.collectAnimation = true;
      this.collectAnimationTime = 0;
    }
  }
  
  public override update(deltaTime: number): void {
    if (!this.isActive) return;
    
    super.update(deltaTime);
  }
  
  public override destroy(): void {
    if (this.animationTicker) {
      this.animationTicker.destroy();
      this.animationTicker = null;
    }
    
    super.destroy();
  }
}