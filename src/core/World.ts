import * as PIXI from 'pixi.js';
import { Fox } from '../entities/Fox';
import { Dragon } from '../entities/Dragon';
import { Hunter } from '../entities/Hunter';
import { Food } from '../entities/Food';
import { Obstacle } from '../entities/Obstacle';
import { AssetManager } from './AssetManager';
import { InputManager } from './InputManager';
import { MapConfig } from '../config/MapConfig';
import { Entity } from '../entities/Entity';
import { CollisionSystem } from '../systems/CollisionSystem';
import { Vector2 } from '../utils/Vector2';

export class World {
  private container: PIXI.Container;
  private entities: Entity[] = [];
  private fox: Fox | null = null;
  private dragon: Dragon | null = null;
  private hunters: Hunter[] = [];
  private foods: Food[] = [];
  private obstacles: Obstacle[] = [];
  private collisionSystem: CollisionSystem;
  private mapConfig: MapConfig;
  private assetManager: AssetManager;
  
  constructor(
    stage: PIXI.Container,
    assetManager: AssetManager,
    mapConfig: MapConfig
  ) {
    this.container = new PIXI.Container();
    stage.addChild(this.container);
    
    this.assetManager = assetManager;
    this.mapConfig = mapConfig;
    this.collisionSystem = new CollisionSystem();
  }
  
  public init(): void {
    this.createBackground();
    this.createObstacles();
    this.createFood();
    this.createFox();
    this.createDragon();
    this.createHunters();
  }
  
  private createBackground(): void {
    // Create a tiling sprite for the background
    const texture = this.assetManager.getTexture(this.mapConfig.textures.background);
    
    // Define the size of a single tile (smaller than full size)
    const tileWidth = 256;
    const tileHeight = 256;
    
    // Create a TilingSprite that repeats the texture
    const tilingSprite = new PIXI.TilingSprite(
      texture,
      this.mapConfig.width,
      this.mapConfig.height
    );
    
    // Set the tile size to create a repeating pattern
    tilingSprite.tileScale.set(0.25, 0.25);
    
    // Add the tiling sprite to the container
    this.container.addChild(tilingSprite);
  }
  
  private createObstacles(): void {
    this.mapConfig.obstacles.forEach(obstacleConfig => {
      const textureKey = this.mapConfig.textures.obstacles[
        Math.floor(Math.random() * this.mapConfig.textures.obstacles.length)
      ];
      
      const obstacle = new Obstacle(
        new Vector2(obstacleConfig.x, obstacleConfig.y),
        obstacleConfig.width,
        obstacleConfig.height,
        this.assetManager.getTexture(textureKey)
      );
      
      this.obstacles.push(obstacle);
      this.addEntity(obstacle);
    });
  }
  
  private createFood(): void {
    for (let i = 0; i < this.mapConfig.foodCount; i++) {
      let position: Vector2;
      let isValidPosition = false;
      
      // Find a position that doesn't overlap with obstacles
      while (!isValidPosition) {
        position = new Vector2(
          Math.random() * this.mapConfig.width,
          Math.random() * this.mapConfig.height
        );
        
        isValidPosition = !this.obstacles.some(obstacle => 
          this.collisionSystem.checkCollision(
            position.x, position.y, 20, 20,
            obstacle.position.x, obstacle.position.y, 
            obstacle.width, obstacle.height
          )
        );
        
        if (isValidPosition) {
          const food = new Food(position, this.assetManager.getTexture('food.png'));
          this.foods.push(food);
          this.addEntity(food);
        }
      }
    }
  }
  
  private createFox(): void {
    this.fox = new Fox(
      new Vector2(this.mapConfig.width / 2, this.mapConfig.height / 2),
      this.assetManager.getTexture('fox.png')
    );
    this.addEntity(this.fox);
  }
  
  private createDragon(): void {
    this.dragon = new Dragon(
      new Vector2(this.mapConfig.width / 2 + 50, this.mapConfig.height / 2 + 50),
      this.assetManager.getTexture('dragon.png')
    );
    this.addEntity(this.dragon);
  }
  
  private createHunters(): void {
    for (let i = 0; i < this.mapConfig.hunterCount; i++) {
      let position: Vector2;
      let isValidPosition = false;
      
      // Place hunters away from the fox and dragon at the start
      while (!isValidPosition) {
        position = new Vector2(
          Math.random() * this.mapConfig.width,
          Math.random() * this.mapConfig.height
        );
        
        const distanceToFox = Vector2.distance(position, this.fox!.position);
        const distanceToDragon = Vector2.distance(position, this.dragon!.position);
        
        isValidPosition = distanceToFox > 300 && distanceToDragon > 300 &&
          !this.obstacles.some(obstacle => 
            this.collisionSystem.checkCollision(
              position.x, position.y, 30, 30,
              obstacle.position.x, obstacle.position.y, 
              obstacle.width, obstacle.height
            )
          );
        
        if (isValidPosition) {
          const hunter = new Hunter(
            position,
            this.assetManager.getTexture('hunter.png')
          );
          
          this.hunters.push(hunter);
          this.addEntity(hunter);
        }
      }
    }
  }
  
  private addEntity(entity: Entity): void {
    this.entities.push(entity);
    this.container.addChild(entity.sprite);
  }
  
  public update(deltaTime: number, inputManager: InputManager): void {
    // Update fox based on player 1 input
    if (this.fox) {
      this.fox.update(deltaTime, inputManager, 'player1');
    }
    
    // Update dragon based on player 2 input
    if (this.dragon) {
      this.dragon.update(deltaTime, inputManager, 'player2');
      
      // Handle dragon shooting fireballs
      // Use Space for regular fireballs
      if (inputManager.isKeyPressed('Space') && this.dragon.canShoot()) {
        this.createFireball();
      }
      
      // Use 'f' key to shoot at the closest hunter
      if (inputManager.isKeyPressed('f') && this.dragon.canShoot()) {
        this.createFireballAtClosestHunter();
      }
    }
    
    // Update hunters AI
    this.hunters.forEach(hunter => {
      if (this.fox) {
        hunter.updateAI(deltaTime, this.fox, this.obstacles);
      }
    });
    
    // Update all entities
    this.entities.forEach(entity => {
      if (entity.isActive) {
        entity.update(deltaTime, inputManager);
      }
    });
    
    // Handle collisions
    this.handleCollisions();
    
    // Clean up inactive entities
    this.entities = this.entities.filter(entity => entity.isActive);
  }
  
  private createFireball(): void {
    if (!this.dragon) return;
    
    const fireball = this.dragon.shootFireball();
    if (fireball) {
      this.addEntity(fireball);
    }
  }
  
  /**
   * Creates a fireball that targets the closest active hunter
   */
  private createFireballAtClosestHunter(): void {
    if (!this.dragon) return;
    
    // Get active hunters only
    const activeHunters = this.hunters.filter(hunter => hunter.isActive);
    
    if (activeHunters.length === 0) return;
    
    // Find the closest hunter to the dragon
    let closestHunter = activeHunters[0];
    let closestDistance = Vector2.distance(this.dragon.position, closestHunter.position);
    
    for (let i = 1; i < activeHunters.length; i++) {
      const hunter = activeHunters[i];
      const distance = Vector2.distance(this.dragon.position, hunter.position);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestHunter = hunter;
      }
    }
    
    // Create a fireball targeted at the closest hunter
    const fireball = this.dragon.shootFireballAt(closestHunter.position);
    if (fireball) {
      this.addEntity(fireball);
      
      // Visual indicator for debugging
      console.log(`Dragon shooting at hunter at position (${closestHunter.position.x.toFixed(0)}, ${closestHunter.position.y.toFixed(0)})`);
    }
  }
  
  private handleCollisions(): void {
    // Handle fox collecting food
    if (this.fox) {
      this.foods.forEach(food => {
        if (food.isActive && this.collisionSystem.checkCollision(
          this.fox!.position.x, this.fox!.position.y, this.fox!.width, this.fox!.height,
          food.position.x, food.position.y, food.width, food.height
        )) {
          food.collect();
          this.fox!.collectFood();
        }
      });
      
      // Handle fox colliding with obstacles
      this.obstacles.forEach(obstacle => {
        if (this.collisionSystem.checkCollision(
          this.fox!.position.x, this.fox!.position.y, this.fox!.width, this.fox!.height,
          obstacle.position.x, obstacle.position.y, obstacle.width, obstacle.height
        )) {
          this.fox!.handleCollision();
        }
      });
      
      // Check if hunters can see the fox
      this.hunters.forEach(hunter => {
        if (hunter.canSee(this.fox!, this.obstacles)) {
          hunter.startChasing(this.fox!);
        } else {
          hunter.stopChasing();
        }
      });
    }
    
    // Handle fireballs hitting hunters
    const fireballs = this.entities.filter(entity => entity.type === 'fireball');
    fireballs.forEach(fireball => {
      this.hunters.forEach(hunter => {
        if (hunter.isActive && fireball.isActive && this.collisionSystem.checkCollision(
          fireball.position.x, fireball.position.y, fireball.width, fireball.height,
          hunter.position.x, hunter.position.y, hunter.width, hunter.height
        )) {
          fireball.deactivate();
          hunter.takeHit();
        }
      });
      
      // Fireballs collide with obstacles
      this.obstacles.forEach(obstacle => {
        if (fireball.isActive && this.collisionSystem.checkCollision(
          fireball.position.x, fireball.position.y, fireball.width, fireball.height,
          obstacle.position.x, obstacle.position.y, obstacle.width, obstacle.height
        )) {
          fireball.deactivate();
        }
      });
    });
    
    // Handle hunters catching the fox
    if (this.fox) {
      this.hunters.forEach(hunter => {
        if (hunter.isActive && this.fox!.isActive && this.collisionSystem.checkCollision(
          hunter.position.x, hunter.position.y, hunter.width, hunter.height,
          this.fox!.position.x, this.fox!.position.y, this.fox!.width, this.fox!.height
        )) {
          this.fox!.getCaught();
        }
      });
    }
  }
  
  public resize(width: number, height: number): void {
    // Adjust view if needed
  }
  
  public destroy(): void {
    this.entities.forEach(entity => {
      entity.destroy();
    });
    
    this.container.destroy({
      children: true,
      texture: true,
      baseTexture: true
    });
  }
}