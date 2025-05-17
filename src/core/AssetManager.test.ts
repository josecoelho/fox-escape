import { AssetManager } from './AssetManager';
import * as PIXI from 'pixi.js';

// Mock PIXI Assets
jest.mock('pixi.js', () => {
  const mockTextureWithUrl = (url: string) => ({
    _mockUrlProperty: url
  });
  
  return {
    Assets: {
      load: jest.fn().mockImplementation((url: string) => {
        return Promise.resolve(mockTextureWithUrl(url));
      })
    },
    Texture: {
      WHITE: { _white: true }
    }
  };
});

describe('AssetManager', () => {
  let assetManager: AssetManager;
  
  beforeEach(() => {
    assetManager = new AssetManager();
  });
  
  test('loadAssets should load all predefined assets', async () => {
    await assetManager.loadAssets();
    
    // Check if PIXI.Assets.load was called for each asset
    // @ts-ignore - access private property for testing
    const assetCount = assetManager['assetList'].length;
    expect(PIXI.Assets.load).toHaveBeenCalledTimes(assetCount);
    
    // Verify that textures were stored
    // @ts-ignore - access private property for testing
    expect(Object.keys(assetManager['textures']).length).toBe(assetCount);
  });
  
  test('getTexture should return the correct texture', async () => {
    await assetManager.loadAssets();
    
    const texture = assetManager.getTexture('fox.png');
    expect(texture).toBeDefined();
    // @ts-ignore - access mock property
    expect(texture._mockUrlProperty).toBe('./assets/characters/fox.png');
  });
  
  test('getTexture should return WHITE texture for nonexistent key', async () => {
    await assetManager.loadAssets();
    
    // Spy on console.warn
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    const texture = assetManager.getTexture('nonexistent_key');
    
    expect(texture).toBe(PIXI.Texture.WHITE);
    expect(consoleWarnSpy).toHaveBeenCalled();
    
    consoleWarnSpy.mockRestore();
  });
  
  test('addTexture should add a new texture', async () => {
    const mockTexture = { mockTexture: true } as unknown as PIXI.Texture;
    
    assetManager.addTexture('custom_texture', mockTexture);
    
    const texture = assetManager.getTexture('custom_texture');
    expect(texture).toBe(mockTexture);
  });
});