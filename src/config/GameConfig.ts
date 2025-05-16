export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  debugMode: boolean;
  showFPS: boolean;
  musicVolume: number;
  sfxVolume: number;
}

export const defaultGameConfig: GameConfig = {
  canvasWidth: 1024,
  canvasHeight: 768,
  debugMode: false,
  showFPS: false,
  musicVolume: 0.7,
  sfxVolume: 1.0
};