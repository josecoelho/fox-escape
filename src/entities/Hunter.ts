import * as PIXI from 'pixi.js';
import { Entity } from './Entity';
import { Vector2 } from '../utils/Vector2';
import { Fox } from './Fox';
import { Obstacle } from './Obstacle';
import { CollisionSystem } from '../systems/CollisionSystem';

export enum HunterState {
  PATROLLING,
  CHASING,
  STUNNED
}

export class Hunter extends Entity {
  private speed: number = 100;
  private patrolSpeed: number = 50;
  private chaseSpeed: number = 150;
  private patrolPoints: Vector2[] = [];
  private currentPatrolIndex: number = 0;
  private patrolWaitTime: number = 0;
  private maxPatrolWait: number = 2; // seconds
  private state: HunterState = HunterState.PATROLLING;
  private targetFox: Fox | null = null;
  private visionRange: number = 250;
  private visionAngle: number = Math.PI / 2; // 90 degrees
  private collisionSystem: CollisionSystem = new CollisionSystem();
  private stunTime: number = 0;
  private maxStunTime: number = 3; // seconds
  private health: number = 2;
  private speedMultiplier: number = 1.0; // For difficulty scaling
  
  constructor(position: Vector2, texture: PIXI.Texture) {
    super(position, texture, 'hunter', 30, 30);
    
    // Generate random patrol points around spawn position
    this.generatePatrolPoints();
  }
  
  private generatePatrolPoints(): void {
    const patrolRadius = 200;
    const pointCount = 3 + Math.floor(Math.random() * 3); // 3-5 points
    
    for (let i = 0; i < pointCount; i++) {
      const angle = (i / pointCount) * Math.PI * 2;
      const distance = 50 + Math.random() * patrolRadius;
      
      this.patrolPoints.push(new Vector2(
        this.position.x + Math.cos(angle) * distance,
        this.position.y + Math.sin(angle) * distance
      ));
    }
  }
  
  public override update(deltaTime: number): void {
    if (!this.isActive) return;
    
    super.update(deltaTime);
  }
  
  public updateAI(deltaTime: number, fox: Fox, obstacles: Obstacle[]): void {
    if (!this.isActive) return;
    
    // Update stun time if stunned
    if (this.state === HunterState.STUNNED) {
      this.stunTime -= deltaTime;
      if (this.stunTime <= 0) {
        this.state = HunterState.PATROLLING;
      } else {
        // Don't move while stunned
        this.velocity = new Vector2(0, 0);
        return;
      }
    }
    
    // Update based on current state
    switch (this.state) {
      case HunterState.PATROLLING:
        this.updatePatrolling(deltaTime);
        break;
      case HunterState.CHASING:
        this.updateChasing(deltaTime, fox, obstacles);
        break;
    }
  }
  
  private updatePatrolling(deltaTime: number): void {
    if (this.patrolPoints.length === 0) return;
    
    // Check if waiting at patrol point
    if (this.patrolWaitTime > 0) {
      this.patrolWaitTime -= deltaTime;
      this.velocity = new Vector2(0, 0);
      return;
    }
    
    const currentTarget = this.patrolPoints[this.currentPatrolIndex];
    const distance = Vector2.distance(this.position, currentTarget);
    
    if (distance < 10) {
      // Reached patrol point, move to next one
      this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
      this.patrolWaitTime = Math.random() * this.maxPatrolWait;
    } else {
      // Move towards patrol point
      const direction = Vector2.subtract(currentTarget, this.position).normalize();
      // Apply speed multiplier for difficulty scaling
      this.velocity = direction.scale(this.patrolSpeed * this.speedMultiplier);
    }
  }
  
  private updateChasing(deltaTime: number, fox: Fox, obstacles: Obstacle[]): void {
    if (!this.targetFox || !this.targetFox.isActive) {
      this.state = HunterState.PATROLLING;
      return;
    }
    
    // If fox is hiding, return to patrolling
    if (this.targetFox.isHidden()) {
      this.state = HunterState.PATROLLING;
      return;
    }
    
    // Check if fox is still visible
    if (!this.canSee(this.targetFox, obstacles)) {
      this.state = HunterState.PATROLLING;
      return;
    }
    
    // Move towards fox
    const direction = Vector2.subtract(this.targetFox.position, this.position).normalize();
    // Apply speed multiplier for difficulty scaling
    this.velocity = direction.scale(this.chaseSpeed * this.speedMultiplier);
  }
  
  /**
   * Sets the speed multiplier for this hunter (for difficulty scaling)
   */
  public setSpeedMultiplier(multiplier: number): void {
    this.speedMultiplier = Math.max(0.5, Math.min(multiplier, 2.5)); // Clamp between 0.5x and 2.5x speed
  }
  
  public canSee(fox: Fox, obstacles: Obstacle[]): boolean {
    if (!fox.isActive || fox.isHidden()) return false;
    
    // Check distance
    const distance = Vector2.distance(this.position, fox.position);
    if (distance > this.visionRange) return false;
    
    // Check angle
    const toFox = Vector2.subtract(fox.position, this.position).normalize();
    const hunterDirection = this.velocity.normalize();
    
    // If not moving, assume the hunter can see in all directions
    if (hunterDirection.x === 0 && hunterDirection.y === 0) {
      // Skip angle check
    } else {
      const angle = Math.acos(Vector2.dot(hunterDirection, toFox));
      if (angle > this.visionAngle / 2) return false;
    }
    
    // Check for obstacles blocking line of sight
    for (const obstacle of obstacles) {
      // Skip obstacles with no position (might happen in tests)
      if (!obstacle || !obstacle.position) continue;
      
      if (this.collisionSystem.lineIntersectsRect(
        this.position.x, this.position.y,
        fox.position.x, fox.position.y,
        obstacle.position.x - obstacle.width / 2, obstacle.position.y - obstacle.height / 2,
        obstacle.width, obstacle.height
      )) {
        return false;
      }
    }
    
    return true;
  }
  
  public startChasing(fox: Fox): void {
    this.state = HunterState.CHASING;
    this.targetFox = fox;
  }
  
  public stopChasing(): void {
    if (this.state === HunterState.CHASING) {
      this.state = HunterState.PATROLLING;
      this.targetFox = null;
    }
  }
  
  public takeHit(): void {
    this.health--;
    
    if (this.health <= 0) {
      this.deactivate();
    } else {
      // Stun hunter
      this.state = HunterState.STUNNED;
      this.stunTime = this.maxStunTime;
      this.velocity = new Vector2(0, 0);
    }
  }
  
  public getState(): HunterState {
    return this.state;
  }
}