import * as PIXI from 'pixi.js';
import { World } from './World';
import { InputManager } from './InputManager';
import { AssetManager } from './AssetManager';
import { TouchControls } from './TouchControls';
import { MapConfig } from '../config/MapConfig';

export class Game {
  private app: PIXI.Application;
  private world: World | null = null;
  private inputManager: InputManager;
  private assetManager: AssetManager;
  private touchControls: TouchControls | null = null;
  private isRunning: boolean = false;

  constructor(width: number, height: number) {
    this.app = new PIXI.Application({
      width,
      height,
      backgroundColor: 0x5ba85c,
      antialias: true,
    });
    
    this.inputManager = new InputManager();
    this.assetManager = new AssetManager();
  }

  public async init(): Promise<void> {
    document.body.appendChild(this.app.view as HTMLCanvasElement);
    
    this.inputManager.init();
    await this.assetManager.loadAssets();
    
    // Initialize touch controls if on a touch device
    if (this.inputManager.isTouchEnabled()) {
      this.touchControls = new TouchControls(
        this.app.stage,
        this.inputManager,
        this.app.renderer.width,
        this.app.renderer.height
      );
    }
    
    this.isRunning = true;
    this.app.ticker.add(() => this.update());
  }

  public loadMap(mapConfig: MapConfig): void {
    if (this.world) {
      this.world.destroy();
    }
    
    this.world = new World(this.app.stage, this.assetManager, mapConfig);
    this.world.init();
  }

  private update(): void {
    if (!this.isRunning || !this.world) return;
    
    const deltaTime = this.app.ticker.deltaMS / 1000;
    
    // Update touch controls if they exist
    if (this.touchControls) {
      this.touchControls.update();
    }
    
    this.world.update(deltaTime, this.inputManager);
  }

  public resize(width: number, height: number): void {
    this.app.renderer.resize(width, height);
    
    if (this.world) {
      this.world.resize(width, height);
    }
    
    if (this.touchControls) {
      this.touchControls.resize(width, height);
    }
  }

  public destroy(): void {
    this.isRunning = false;
    this.inputManager.destroy();
    
    if (this.touchControls) {
      this.touchControls.destroy();
      this.touchControls = null;
    }
    
    if (this.world) {
      this.world.destroy();
    }
    
    this.app.destroy(true, {
      children: true,
      texture: true,
      baseTexture: true,
    });
  }
}