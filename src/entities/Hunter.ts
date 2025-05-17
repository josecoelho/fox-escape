import * as PIXI from 'pixi.js';
import { Entity } from './Entity';
import { Vector2 } from '../utils/Vector2';
import { Fox } from './Fox';
import { Obstacle } from './Obstacle';
import { CollisionSystem } from '../systems/CollisionSystem';

export enum HunterState {
  PATROLLING,
  CHASING,
  STUNNED,
  STUCK_IN_POO
}

export class Hunter extends Entity {
  private speed: number = 120; // Increased base speed
  private patrolSpeed: number = 70; // Increased from 50
  private chaseSpeed: number = 180; // Increased from 150
  private patrolPoints: Vector2[] = [];
  private currentPatrolIndex: number = 0;
  private patrolWaitTime: number = 0;
  private maxPatrolWait: number = 1.5; // Reduced wait time from 2 seconds
  private state: HunterState = HunterState.PATROLLING;
  private targetFox: Fox | null = null;
  private visionRange: number = 300; // Increased from 250
  private visionAngle: number = Math.PI * 0.6; // Increased from PI/2 (90 degrees) to ~108 degrees
  private collisionSystem: CollisionSystem = new CollisionSystem();
  private stunTime: number = 0;
  private maxStunTime: number = 3; // seconds
  private stuckTime: number = 0;
  private maxStuckTime: number = 5; // seconds
  private health: number = 2;
  private speedMultiplier: number = 1.0; // For difficulty scaling
  
  // Graphics for smell effect when hunter is stuck in poo
  private smellGraphic: PIXI.Graphics | null = null;
  
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
  
  public override destroy(): void {
    // Clean up smell graphic if it exists
    if (this.smellGraphic) {
      this.smellGraphic.destroy();
      this.smellGraphic = null;
    }
    super.destroy();
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
    
    // Update stuck time if stuck in poo
    if (this.state === HunterState.STUCK_IN_POO) {
      this.stuckTime -= deltaTime;
      
      // Update smell graphic position to follow hunter
      if (this.smellGraphic) {
        this.smellGraphic.position.set(this.position.x, this.position.y - 40); // Position above hunter
      }
      
      if (this.stuckTime <= 0) {
        this.state = HunterState.PATROLLING;
        
        // Remove smell graphic when no longer stuck
        if (this.smellGraphic) {
          if (this.smellGraphic.parent) {
            this.smellGraphic.parent.removeChild(this.smellGraphic);
          }
          this.smellGraphic = null;
        }
      } else {
        // Don't move while stuck in poo
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
    // If fox is hiding or inactive, the hunter can't see it
    if (!fox.isActive || fox.isHidden()) return false;
    
    // Check distance - hunters have limited vision range
    const distance = Vector2.distance(this.position, fox.position);
    if (distance > this.visionRange) return false;
    
    // Check angle - hunters can only see in front of them in a cone
    const toFox = Vector2.subtract(fox.position, this.position).normalize();
    const hunterDirection = this.velocity.normalize();
    
    // If hunter isn't moving, reduce their field of view to make hiding more effective
    if (hunterDirection.x === 0 && hunterDirection.y === 0) {
      // Instead of skipping the angle check, use the last known direction
      // Or default to a narrower "idle" vision cone
      const idleVisionAngle = this.visionAngle * 0.7; // Narrower vision when stationary
      
      // For idle hunters, use the last non-zero velocity direction if available
      // Or default to looking right if no previous movement
      const defaultDirection = new Vector2(1, 0); // Looking right by default
      const angle = Math.acos(Vector2.dot(defaultDirection, toFox));
      if (angle > idleVisionAngle / 2) return false;
    } else {
      const angle = Math.acos(Vector2.dot(hunterDirection, toFox));
      if (angle > this.visionAngle / 2) return false;
    }
    
    // Check for obstacles blocking line of sight - multiple rays for better accuracy
    for (const obstacle of obstacles) {
      // Skip obstacles with no position (might happen in tests)
      if (!obstacle || !obstacle.position) continue;
      
      if (this.collisionSystem.lineIntersectsRect(
        this.position.x, this.position.y,
        fox.position.x, fox.position.y,
        obstacle.position.x - obstacle.width / 2, obstacle.position.y - obstacle.height / 2,
        obstacle.width, obstacle.height
      )) {
        // If any ray is blocked, hunter can't see fox
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
  
  /**
   * Makes the hunter step in poo and get stuck
   * @param container The PIXI container to add the smell graphic to
   */
  public stepInPoo(container: PIXI.Container): void {
    // Only get stuck if not already stuck or stunned
    if (this.state !== HunterState.STUCK_IN_POO && this.state !== HunterState.STUNNED) {
      this.state = HunterState.STUCK_IN_POO;
      this.stuckTime = this.maxStuckTime;
      this.velocity = new Vector2(0, 0);
      
      // Create smell graphic effect
      this.createSmellGraphic(container);
    }
  }
  
  /**
   * Creates a visual smell effect above the hunter
   */
  private createSmellGraphic(container: PIXI.Container): void {
    // Remove any existing smell graphic
    if (this.smellGraphic && this.smellGraphic.parent) {
      this.smellGraphic.parent.removeChild(this.smellGraphic);
    }
    
    // Create a new graphic for the smell
    this.smellGraphic = new PIXI.Graphics();
    
    // Position above the hunter
    this.smellGraphic.position.set(this.position.x, this.position.y - 40);
    
    // Draw the smell effect - a combination of poo emoji and stink lines
    
    // First draw the stink lines in green
    this.smellGraphic.lineStyle(2, 0x00AA00, 0.8);
    
    // Draw multiple wavy lines (stink lines)
    for (let i = 0; i < 5; i++) {
      const startX = -15 + i * 8;
      const waveHeight = 5 + Math.random() * 5;
      const waveCount = 2 + Math.floor(Math.random() * 2);
      
      this.smellGraphic.moveTo(startX, 0);
      
      for (let j = 0; j < waveCount; j++) {
        const y = -5 - j * 7;
        // Draw a wavy line
        this.smellGraphic.bezierCurveTo(
          startX - waveHeight, y - 5,
          startX + waveHeight, y - 10,
          startX, y - 15
        );
      }
    }
    
    // Now draw tiny poo emojis at the end of some stink lines
    for (let i = 0; i < 3; i++) {
      const x = -10 + i * 10;
      const y = -25 - Math.random() * 15;
      
      // Draw a small poo emoji
      // Main brown body
      this.smellGraphic.beginFill(0x663300, 0.9);
      this.smellGraphic.drawCircle(x, y, 5);
      this.smellGraphic.drawCircle(x - 2, y - 3, 3);
      this.smellGraphic.drawCircle(x + 2, y - 3, 4);
      this.smellGraphic.endFill();
      
      // Darker accents
      this.smellGraphic.beginFill(0x442200, 0.9);
      this.smellGraphic.drawCircle(x + 1, y - 1, 1.5);
      this.smellGraphic.drawCircle(x - 2, y - 3, 1);
      this.smellGraphic.endFill();
    }
    
    // Add to container
    container.addChild(this.smellGraphic);
    
    // Ensure it's always on top
    this.smellGraphic.zIndex = 100;
    
    // In production this would sort children by zIndex, but our mock doesn't need it
    if (typeof container.sortChildren === 'function') {
      container.sortChildren();
    }
  }
  
  public getState(): HunterState {
    return this.state;
  }
  
  /**
   * Checks if the hunter is currently stuck in poo
   */
  public isStuckInPoo(): boolean {
    return this.state === HunterState.STUCK_IN_POO;
  }
}