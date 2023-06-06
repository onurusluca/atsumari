import Phaser from "phaser";

export default class Quadtree {
  private bounds: Phaser.Geom.Rectangle;
  private capacity: number;
  private objects: Phaser.GameObjects.GameObject[];
  private subdivided: boolean;
  private children: Quadtree[];

  constructor(bounds: Phaser.Geom.Rectangle, capacity = 4) {
    this.bounds = bounds;
    this.capacity = capacity;
    this.objects = [];
    this.subdivided = false;
    this.children = [];
  }

  public subdivide(): void {
    const { x, y, width, height } = this.bounds;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const nw = new Quadtree(new Phaser.Geom.Rectangle(x, y, halfWidth, halfHeight), this.capacity);
    const ne = new Quadtree(new Phaser.Geom.Rectangle(x + halfWidth, y, halfWidth, halfHeight), this.capacity);
    const sw = new Quadtree(new Phaser.Geom.Rectangle(x, y + halfHeight, halfWidth, halfHeight), this.capacity);
    const se = new Quadtree(new Phaser.Geom.Rectangle(x + halfWidth, y + halfHeight, halfWidth, halfHeight), this.capacity);

    this.children = [nw, ne, sw, se];
    this.subdivided = true;
  }

  public insert(object: Phaser.GameObjects.GameObject): void {
    if (!this.bounds.contains(object.x, object.y)) {
      return;
    }

    if (this.objects.length < this.capacity || !this.subdivided) {
      this.objects.push(object);
    } else {
      if (!this.subdivided) {
        this.subdivide();
      }

      for (const child of this.children) {
        child.insert(object);
      }
    }
  }

  public retrieve(object: Phaser.GameObjects.GameObject): Phaser.GameObjects.GameObject[] {
    const foundObjects: Phaser.GameObjects.GameObject[] = [];

    if (!this.bounds.intersects(object.getBounds())) {
      return foundObjects;
    }

    for (const obj of this.objects) {
      if (obj !== object && obj.getBounds().intersects(object.getBounds())) {
        foundObjects.push(obj);
      }
    }

    for (const child of this.children) {
      foundObjects.push(...child.retrieve(object));
    }

    return foundObjects;
  }

  public clear(): void {
    this.objects = [];
    this.subdivided = false;

    for (const child of this.children) {
      child.clear();
    }

    this.children = [];
  }
}
