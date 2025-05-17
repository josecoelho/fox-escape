import * as PIXI from 'pixi.js';
import { Vector2 } from '../utils/Vector2';
import { InputManager } from '../core/InputManager';

export type EntityType = 'fox' | 'dragon' | 'hunter' | 'food' | 'obstacle' | 'fireball' | 'poo';

export abstract class Entity {
  public position: Vector2;
  public velocity: Vector2;
  public acceleration: Vector2;
  public sprite: PIXI.Sprite;
  public width: number;
  public height: number;
  public isActive: boolean = true;
  public type: EntityType;
  
  constructor(
    position: Vector2,
    texture: PIXI.Texture,
    type: EntityType,
    width?: number,
    height?: number
  ) {
    this.position = position;
    this.velocity = new Vector2(0, 0);
    this.acceleration = new Vector2(0, 0);
    this.type = type;
    
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.anchor.set(0.5);
    this.sprite.position.set(position.x, position.y);
    
    this.width = width || this.sprite.width;
    this.height = height || this.sprite.height;
  }
  
  public update(deltaTime: number, inputManager?: InputManager, playerType?: string): void {
    // Apply acceleration to velocity
    this.velocity = this.velocity.add(
      this.acceleration.scale(deltaTime)
    );
    
    // Apply velocity to position
    this.position = this.position.add(
      this.velocity.scale(deltaTime)
    );
    
    // Update sprite position
    this.sprite.position.set(this.position.x, this.position.y);
  }
  
  public deactivate(): void {
    this.isActive = false;
    this.sprite.visible = false;
  }
  
  public destroy(): void {
    this.sprite.destroy();
  }
}