export class CollisionSystem {
  /**
   * Simple AABB (Axis-Aligned Bounding Box) collision detection
   */
  public checkCollision(
    x1: number, y1: number, width1: number, height1: number,
    x2: number, y2: number, width2: number, height2: number
  ): boolean {
    return (
      x1 <= x2 + width2 &&
      x1 + width1 >= x2 &&
      y1 <= y2 + height2 &&
      y1 + height1 >= y2
    );
  }
  
  /**
   * Check if a point is inside a rectangle
   */
  public pointInRect(
    pointX: number, pointY: number,
    rectX: number, rectY: number, rectWidth: number, rectHeight: number
  ): boolean {
    return (
      pointX >= rectX &&
      pointX <= rectX + rectWidth &&
      pointY >= rectY &&
      pointY <= rectY + rectHeight
    );
  }
  
  /**
   * Check if a line (ray) intersects with a rectangle
   * Used for line-of-sight detection
   */
  public lineIntersectsRect(
    x1: number, y1: number, x2: number, y2: number,
    rectX: number, rectY: number, rectWidth: number, rectHeight: number
  ): boolean {
    // Check if either end of the line is inside the rectangle
    if (this.pointInRect(x1, y1, rectX, rectY, rectWidth, rectHeight) ||
        this.pointInRect(x2, y2, rectX, rectY, rectWidth, rectHeight)) {
      return true;
    }
    
    // Check if the line intersects any of the rectangle's sides
    // Top edge
    if (this.lineIntersectsLine(
      x1, y1, x2, y2,
      rectX, rectY, rectX + rectWidth, rectY
    )) {
      return true;
    }
    
    // Right edge
    if (this.lineIntersectsLine(
      x1, y1, x2, y2,
      rectX + rectWidth, rectY, rectX + rectWidth, rectY + rectHeight
    )) {
      return true;
    }
    
    // Bottom edge
    if (this.lineIntersectsLine(
      x1, y1, x2, y2,
      rectX, rectY + rectHeight, rectX + rectWidth, rectY + rectHeight
    )) {
      return true;
    }
    
    // Left edge
    if (this.lineIntersectsLine(
      x1, y1, x2, y2,
      rectX, rectY, rectX, rectY + rectHeight
    )) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Check if two line segments intersect
   */
  private lineIntersectsLine(
    x1: number, y1: number, x2: number, y2: number,
    x3: number, y3: number, x4: number, y4: number
  ): boolean {
    // Calculate the direction of the lines
    const uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) /
               ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    
    const uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) /
               ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    
    // If uA and uB are between 0-1, lines are colliding
    return (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1);
  }
}