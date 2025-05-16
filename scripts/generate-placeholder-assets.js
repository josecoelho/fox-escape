import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from 'canvas';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create directory if it doesn't exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Generate a simple colored square with a shape in the middle
const generatePlaceholderImage = (name, mainColor, shapeColor, size = 32) => {
  // Create canvas
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Draw background
  ctx.fillStyle = mainColor;
  ctx.fillRect(0, 0, size, size);

  // Draw simple shape in the middle
  ctx.fillStyle = shapeColor;
  
  // Different shapes based on asset type
  switch(name) {
    case 'fox':
      // Draw a fox-like shape
      ctx.beginPath();
      ctx.moveTo(size/2, size/4);
      ctx.lineTo(size/4, size/2);
      ctx.lineTo(size/2, 3*size/4);
      ctx.lineTo(3*size/4, size/2);
      ctx.closePath();
      ctx.fill();
      break;
    case 'dragon':
      // Draw a dragon-like shape
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/4, 0, 2 * Math.PI);
      ctx.fill();
      // Wings
      ctx.fillRect(size/4, size/4, size/8, size/3);
      ctx.fillRect(3*size/4 - size/8, size/4, size/8, size/3);
      break;
    case 'hunter':
      // Draw a person-like shape
      ctx.beginPath();
      ctx.arc(size/2, size/3, size/6, 0, 2 * Math.PI); // Head
      ctx.fill();
      ctx.fillRect(size*0.4, size/3, size*0.2, size/2); // Body
      break;
    case 'food':
      // Draw a berry-like shape
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#006600';
      ctx.fillRect(size*0.45, size/4, size*0.1, size/6); // Stem
      break;
    case 'tree':
      // Draw a tree-like shape
      ctx.fillStyle = '#663300'; // Brown trunk
      ctx.fillRect(size*0.4, size/2, size*0.2, size/2); // Trunk
      ctx.fillStyle = shapeColor; // Green foliage
      ctx.beginPath();
      ctx.arc(size/2, size/3, size/3, 0, 2 * Math.PI); // Foliage
      ctx.fill();
      break;
    case 'rock':
      // Draw a rock-like shape
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/3, 0, 2 * Math.PI);
      ctx.fill();
      break;
    case 'fireball':
      // Draw a fireball-like shape
      // Flame base
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/3, 0, 2 * Math.PI);
      ctx.fill();
      // Flame tip
      ctx.beginPath();
      ctx.moveTo(size/4, size/2);
      ctx.lineTo(size/2, size/4);
      ctx.lineTo(3*size/4, size/2);
      ctx.closePath();
      ctx.fill();
      break;
    case 'forest_bg':
      // Draw a simple forest background
      ctx.fillStyle = '#006600'; // Green
      ctx.fillRect(0, 0, size, size);
      // Draw some tree shapes
      ctx.fillStyle = '#003300';
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = 2 + Math.random() * 5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();
      }
      break;
    case 'meadow_bg':
      // Draw a simple meadow background
      ctx.fillStyle = '#88cc88'; // Light green
      ctx.fillRect(0, 0, size, size);
      // Draw some flower shapes
      ctx.fillStyle = '#ffff00'; // Yellow
      for (let i = 0; i < 7; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = 1 + Math.random() * 2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();
      }
      break;
    default:
      // Default shape
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/4, 0, 2 * Math.PI);
      ctx.fill();
  }

  // Add a border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, size, size);

  // Return PNG image data as buffer
  return canvas.toBuffer('image/png');
};

// Asset definitions
const assets = [
  { name: 'fox', directory: 'characters', color: '#ff6600', shapeColor: '#ffffff', size: 32 },
  { name: 'dragon', directory: 'characters', color: '#cc0000', shapeColor: '#ffcc00', size: 32 },
  { name: 'hunter', directory: 'characters', color: '#663300', shapeColor: '#ffcc99', size: 32 },
  { name: 'food', directory: 'items', color: '#ff0000', shapeColor: '#ff0000', size: 20 },
  { name: 'tree', directory: 'obstacles', color: '#005500', shapeColor: '#00aa00', size: 40 },
  { name: 'rock', directory: 'obstacles', color: '#666666', shapeColor: '#999999', size: 30 },
  { name: 'fireball', directory: 'effects', color: '#000000', shapeColor: '#ff6600', size: 16 },
  { name: 'forest_bg', directory: 'backgrounds', color: '#005500', shapeColor: '#003300', size: 64 },
  { name: 'meadow_bg', directory: 'backgrounds', color: '#88cc88', shapeColor: '#ffff00', size: 64 }
];

// Generate all placeholder assets
const generatePlaceholderAssets = () => {
  console.log('Generating placeholder assets...');
  
  assets.forEach(asset => {
    const dirPath = path.join(__dirname, '..', 'public', 'assets', asset.directory);
    ensureDirectoryExists(dirPath);
    
    const filePath = path.join(dirPath, `${asset.name}.png`);
    const imageData = generatePlaceholderImage(asset.name, asset.color, asset.shapeColor, asset.size);
    
    fs.writeFileSync(filePath, imageData);
    console.log(`Generated: ${filePath}`);
  });
  
  console.log('All placeholder assets generated!');
};

// Run the asset generation
generatePlaceholderAssets();