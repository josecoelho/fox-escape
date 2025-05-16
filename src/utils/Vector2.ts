export class Vector2 {
  constructor(public x: number, public y: number) {}
  
  public static add(a: Vector2, b: Vector2): Vector2 {
    return new Vector2(a.x + b.x, a.y + b.y);
  }
  
  public static subtract(a: Vector2, b: Vector2): Vector2 {
    return new Vector2(a.x - b.x, a.y - b.y);
  }
  
  public static scale(vector: Vector2, scalar: number): Vector2 {
    return new Vector2(vector.x * scalar, vector.y * scalar);
  }
  
  public static distance(a: Vector2, b: Vector2): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  public static normalize(vector: Vector2): Vector2 {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (length === 0) {
      return new Vector2(0, 0);
    }
    return new Vector2(vector.x / length, vector.y / length);
  }
  
  public static dot(a: Vector2, b: Vector2): number {
    return a.x * b.x + a.y * b.y;
  }
  
  public add(other: Vector2): Vector2 {
    return Vector2.add(this, other);
  }
  
  public subtract(other: Vector2): Vector2 {
    return Vector2.subtract(this, other);
  }
  
  public scale(scalar: number): Vector2 {
    return Vector2.scale(this, scalar);
  }
  
  public distanceTo(other: Vector2): number {
    return Vector2.distance(this, other);
  }
  
  public normalize(): Vector2 {
    return Vector2.normalize(this);
  }
  
  public dot(other: Vector2): number {
    return Vector2.dot(this, other);
  }
  
  public copy(): Vector2 {
    return new Vector2(this.x, this.y);
  }
}