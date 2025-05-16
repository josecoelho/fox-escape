export interface ObstacleConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MapConfig {
  name: string;
  width: number;
  height: number;
  foodCount: number;
  hunterCount: number;
  textures: {
    background: string;
    obstacles: string[];
  };
  obstacles: ObstacleConfig[];
}

export const forestMap: MapConfig = {
  name: 'Forest',
  width: 1600,
  height: 1200,
  foodCount: 10,
  hunterCount: 4,
  textures: {
    background: 'forest_bg.png',
    obstacles: ['tree.png', 'rock.png']
  },
  obstacles: [
    { x: 200, y: 200, width: 120, height: 120 },
    { x: 500, y: 300, width: 120, height: 120 },
    { x: 700, y: 500, width: 100, height: 100 },
    { x: 300, y: 700, width: 120, height: 120 },
    { x: 900, y: 200, width: 120, height: 120 },
    { x: 1100, y: 400, width: 100, height: 100 },
    { x: 1300, y: 600, width: 120, height: 120 },
    { x: 400, y: 900, width: 120, height: 120 },
    { x: 600, y: 1000, width: 100, height: 100 },
    { x: 1000, y: 800, width: 120, height: 120 },
    { x: 1200, y: 900, width: 100, height: 100 }
  ]
};

export const meadowMap: MapConfig = {
  name: 'Meadow',
  width: 1800,
  height: 1400,
  foodCount: 15,
  hunterCount: 5,
  textures: {
    background: 'meadow_bg.png',
    obstacles: ['rock.png']
  },
  obstacles: [
    { x: 300, y: 300, width: 90, height: 90 },
    { x: 600, y: 400, width: 90, height: 90 },
    { x: 900, y: 600, width: 80, height: 80 },
    { x: 400, y: 800, width: 90, height: 90 },
    { x: 1000, y: 300, width: 90, height: 90 },
    { x: 1200, y: 500, width: 80, height: 80 },
    { x: 1400, y: 700, width: 90, height: 90 },
    { x: 500, y: 1000, width: 90, height: 90 },
    { x: 700, y: 1100, width: 80, height: 80 },
    { x: 1100, y: 900, width: 90, height: 90 },
    { x: 1300, y: 1000, width: 80, height: 80 },
    { x: 1500, y: 1200, width: 90, height: 90 }
  ]
};