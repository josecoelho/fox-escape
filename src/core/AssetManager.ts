import * as PIXI from 'pixi.js';

interface AssetDefinition {
  key: string;
  url: string;
}

export class AssetManager {
  private textures: { [key: string]: PIXI.Texture } = {};
  private assetList: AssetDefinition[] = [
    { key: 'fox.png', url: './assets/characters/fox.png' },
    { key: 'dragon.png', url: './assets/characters/dragon.png' },
    { key: 'hunter.png', url: './assets/characters/hunter.png' },
    { key: 'food.png', url: './assets/items/food.png' },
    { key: 'tree.png', url: './assets/obstacles/tree.png' },
    { key: 'rock.png', url: './assets/obstacles/rock.png' },
    { key: 'fireball.png', url: './assets/effects/fireball.png' },
    { key: 'forest_bg.png', url: './assets/backgrounds/forest_bg.png' },
    { key: 'meadow_bg.png', url: './assets/backgrounds/meadow_bg.png' }
  ];
  
  public async loadAssets(): Promise<void> {
    return new Promise((resolve) => {
      this.assetList.forEach(asset => {
        PIXI.Assets.load(asset.url).then(texture => {
          this.textures[asset.key] = texture;
          
          // When all textures are loaded, resolve
          if (Object.keys(this.textures).length === this.assetList.length) {
            resolve();
          }
        });
      });
    });
  }
  
  public getTexture(key: string): PIXI.Texture {
    if (!this.textures[key]) {
      console.warn(`Texture with key ${key} not found. Using placeholder.`);
      return PIXI.Texture.WHITE;
    }
    
    return this.textures[key];
  }
  
  public addTexture(key: string, texture: PIXI.Texture): void {
    this.textures[key] = texture;
  }
}