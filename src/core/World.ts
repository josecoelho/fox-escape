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
import { GameState, GameStateType } from './GameState';

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
  private gameState: GameState | null = null;
  private scoreText: PIXI.Text | null = null;
  
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
    
    // Create game state manager
    this.gameState = new GameState(stage);
    
    // Create UI elements
    this.createUI();
  }
  
  private foxAbilityText: PIXI.Text | null = null;
  
  private createUI(): void {
    // Score display
    this.scoreText = new PIXI.Text('Score: 0', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xFFFFFF,
      stroke: 0x000000,
      strokeThickness: 3
    });
    this.scoreText.position.set(20, 20);
    this.container.addChild(this.scoreText);
    
    // Fox ability cooldown display
    this.foxAbilityText = new PIXI.Text('Hide: Ready', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0x00FF00, // Start with green for "ready"
      stroke: 0x000000,
      strokeThickness: 3,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 4,
      dropShadowDistance: 2
    });
    // Position it in the top center of the screen
    this.foxAbilityText.position.set(this.mapConfig.width / 2 - 80, 20);
    this.container.addChild(this.foxAbilityText);
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
    // Position the fox in the center of the visible area
    this.fox = new Fox(
      new Vector2(this.mapConfig.width / 2, this.mapConfig.height / 2),
      this.assetManager.getTexture('fox.png')
    );
    this.addEntity(this.fox);
  }
  
  private createDragon(): void {
    // Position the dragon near the fox but offset slightly
    const offsetDistance = Math.min(70, Math.min(this.mapConfig.width, this.mapConfig.height) * 0.1);
    this.dragon = new Dragon(
      new Vector2(this.mapConfig.width / 2 + offsetDistance, this.mapConfig.height / 2 + offsetDistance),
      this.assetManager.getTexture('dragon.png')
    );
    this.addEntity(this.dragon);
  }
  
  private createHunters(): void {
    for (let i = 0; i < this.mapConfig.hunterCount; i++) {
      this.spawnHunter();
    }
  }
  
  /**
   * Spawns a single hunter at a random valid position
   */
  public spawnHunter(): Hunter | null {
    if (!this.fox || !this.dragon) return null;
    
    let position: Vector2 = new Vector2(0, 0); // Initialize with a default
    let isValidPosition = false;
    let attempts = 0;
    const maxAttempts = 50; // Prevent infinite loops
    
    // Place hunters away from the fox and dragon
    while (!isValidPosition && attempts < maxAttempts) {
      attempts++;
      
      // Generate position near the edge of the map for more challenge
      const useEdgeSpawn = Math.random() < 0.7; // 70% chance for edge spawn
      
      if (useEdgeSpawn) {
        // Choose a random edge (0: top, 1: right, 2: bottom, 3: left)
        const edge = Math.floor(Math.random() * 4);
        
        switch (edge) {
          case 0: // Top edge
            position = new Vector2(
              Math.random() * this.mapConfig.width,
              Math.random() * 100
            );
            break;
          case 1: // Right edge
            position = new Vector2(
              this.mapConfig.width - Math.random() * 100,
              Math.random() * this.mapConfig.height
            );
            break;
          case 2: // Bottom edge
            position = new Vector2(
              Math.random() * this.mapConfig.width,
              this.mapConfig.height - Math.random() * 100
            );
            break;
          case 3: // Left edge
            position = new Vector2(
              Math.random() * 100,
              Math.random() * this.mapConfig.height
            );
            break;
          default:
            position = new Vector2(0, 0); // Fallback
        }
      } else {
        // Random position anywhere on the map
        position = new Vector2(
          Math.random() * this.mapConfig.width,
          Math.random() * this.mapConfig.height
        );
      }
      
      const distanceToFox = Vector2.distance(position, this.fox.position);
      const distanceToDragon = Vector2.distance(position, this.dragon.position);
      
      // Minimum spawn distance decreases as game progresses, making it harder
      const minDistance = Math.max(200, 300 - (this.gameState?.getDifficulty() || 1) * 20);
      
      isValidPosition = distanceToFox > minDistance && distanceToDragon > minDistance &&
        !this.obstacles.some(obstacle => 
          this.collisionSystem.checkCollision(
            position.x, position.y, 30, 30,
            obstacle.position.x, obstacle.position.y, 
            obstacle.width, obstacle.height
          )
        );
    }
    
    if (isValidPosition) {
      const hunter = new Hunter(
        position,
        this.assetManager.getTexture('hunter.png')
      );
      
      // Make hunters faster as difficulty increases
      const difficulty = this.gameState?.getDifficulty() || 1;
      hunter.setSpeedMultiplier(1 + (difficulty - 1) * 0.2); // Increase speed by up to 20% per difficulty level
      
      this.hunters.push(hunter);
      this.addEntity(hunter);
      return hunter;
    }
    
    return null;
  }
  
  private addEntity(entity: Entity): void {
    this.entities.push(entity);
    this.container.addChild(entity.sprite);
  }
  
  public update(deltaTime: number, inputManager: InputManager): void {
    if (!this.gameState) return;
    
    // Update the game state
    this.gameState.update(deltaTime);
    
    // Handle game state transitions
    if (this.gameState.getState() === GameStateType.START_SCREEN) {
      // Start the game when Space is pressed on the start screen
      const spacePressed = inputManager.isKeyPressed('Space');
      if (spacePressed) {
        console.log("Space pressed on start screen, starting game");
        this.gameState.setState(GameStateType.PLAYING);
      }
      return; // Don't update the game world while on start screen
    } else if (this.gameState.getState() === GameStateType.GAME_OVER) {
      // Restart the game when Space is pressed on game over screen
      const spacePressed = inputManager.isKeyPressed('Space');
      if (spacePressed) {
        console.log("Space pressed on game over screen, restarting game");
        this.resetGame();
        this.gameState.setState(GameStateType.PLAYING);
      }
      return; // Don't update the game world while on game over screen
    }
    
    // Check for respawning hunters
    if (this.gameState.shouldSpawnHunter()) {
      this.spawnHunter();
    }
    
    // Update fox based on player 1 input
    if (this.fox) {
      this.fox.update(deltaTime, inputManager, 'player1');
      
      // Update score based on food collected
      if (this.scoreText) {
        this.scoreText.text = `Score: ${this.gameState.getScore()}`;
      }
      
      // Update fox ability cooldown UI
      if (this.foxAbilityText && this.foxAbilityText.style) {
        if (this.fox.isHidden()) {
          const durationRemaining = Math.ceil(this.fox.getHideDurationRemaining());
          this.foxAbilityText.text = `HIDING: ${durationRemaining}s left`;
          if (this.foxAbilityText.style.fill !== undefined) {
            this.foxAbilityText.style.fill = 0x00FF00; // Green when active
          }
        } else {
          const cooldownRemaining = Math.ceil(this.fox.getHideCooldownRemaining());
          if (cooldownRemaining > 0) {
            this.foxAbilityText.text = `HIDE COOLDOWN: ${cooldownRemaining}s`;
            if (this.foxAbilityText.style.fill !== undefined) {
              this.foxAbilityText.style.fill = 0xFF0000; // Red while on cooldown
            }
          } else {
            this.foxAbilityText.text = `HIDE: READY! [SPACE]`;
            if (this.foxAbilityText.style.fill !== undefined) {
              this.foxAbilityText.style.fill = 0x00FF00; // Green when ready
            }
          }
        }
      }
    }
    
    // Update dragon based on player 2 input
    if (this.dragon) {
      this.dragon.update(deltaTime, inputManager, 'player2');
      
      // Use only 'f' key to shoot at the closest hunter
      if (inputManager.isKeyPressed('f') && this.dragon.canShoot() && this.gameState.getState() === GameStateType.PLAYING) {
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
    
    // Clean up inactive entities (but keep track of removed hunters)
    const previousHunterCount = this.hunters.length;
    this.hunters = this.hunters.filter(hunter => hunter.isActive);
    const removedHunterCount = previousHunterCount - this.hunters.length;
    
    // Award points for defeating hunters
    if (removedHunterCount > 0 && this.gameState) {
      this.gameState.increaseScore(removedHunterCount * 10);
    }
    
    // Clean up all inactive entities
    this.entities = this.entities.filter(entity => entity.isActive);
    
    // Check if fox is caught (game over)
    if (this.fox && !this.fox.isActive && this.gameState.getState() === GameStateType.PLAYING) {
      this.gameState.setState(GameStateType.GAME_OVER);
    }
  }
  
  /**
   * Reset the game to its initial state
   */
  private resetGame(): void {
    // Clear existing entities
    this.entities.forEach(entity => {
      entity.destroy();
    });
    this.entities = [];
    this.hunters = [];
    this.foods = [];
    this.obstacles = [];
    this.fox = null;
    this.dragon = null;
    
    // Reinitialize the game
    this.init();
    
    // Ensure the fox is not hidden at game start
    // Resetting happens in the Fox constructor now, so no need to call explicitly
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
          
          // Increase score when food is collected
          if (this.gameState) {
            this.gameState.increaseScore(5);
          }
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
    // Resize game state UI
    if (this.gameState) {
      this.gameState.resize(width, height);
    }
    
    // Reposition score text
    if (this.scoreText) {
      this.scoreText.position.set(20, 20);
    }
    
    // Reposition fox ability text
    if (this.foxAbilityText) {
      this.foxAbilityText.position.set(width / 2 - 80, 20); // Center top position for better visibility
    }
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