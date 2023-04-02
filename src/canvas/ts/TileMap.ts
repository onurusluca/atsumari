export default class TileMap {
  tileSize: number;

  constructor(tileSize: number) {
    this.tileSize = tileSize;
  }

  draw(ctx: CanvasRenderingContext2D) {}

  setCanvasSize(canvas: HTMLCanvasElement) {
    canvas.width = this.map[0].length * this.tileSize; // First row
    canvas.height = this.map.length * this.tileSize;
  }

  didCollideWithEnvironment(x: number, y: number, direction: number) {}
}
