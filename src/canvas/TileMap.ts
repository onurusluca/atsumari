import YellowDotImg from "@/canvas/images/images/yellowDot.png";
import WallImg from "@/canvas/images/images/wall.png";
import Pacman from "@/canvas/Pacman";
import MovingDirection from "@/canvas/MovingDirection";

export default class TileMap {
  tileSize: number;
  yellowDot: HTMLImageElement;
  wall: HTMLImageElement;

  constructor(tileSize: number) {
    this.tileSize = tileSize;

    this.yellowDot = new Image();
    this.yellowDot.src = YellowDotImg;

    this.wall = new Image();
    this.wall.src = WallImg;
  }

  // 1 = wall
  // 0 = dot
  // 4 = pacman

  map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  draw(ctx: CanvasRenderingContext2D) {
    for (let row = 0; row < this.map.length; row++) {
      for (let column = 0; column < this.map[row].length; column++) {
        let tile = this.map[row][column];
        if (tile === 1) {
          this.#drawWall(ctx, column, row, this.tileSize);
        } else if (tile === 0) {
          this.#drawDot(ctx, column, row, this.tileSize);
        }

        // Debug (grid)
        /*    ctx.strokeStyle = "yellow";
        ctx.strokeRect(
          column * this.tileSize,
          row * this.tileSize,
          this.tileSize,
          this.tileSize
        ); */
      }
    }
  }

  #drawWall(ctx: CanvasRenderingContext2D, column: number, row: number, size: number) {
    ctx.drawImage(this.wall, column * this.tileSize, row * this.tileSize, size, size);
  }

  #drawDot(ctx: CanvasRenderingContext2D, column: number, row: number, size: number) {
    ctx.drawImage(
      this.yellowDot,
      column * this.tileSize,
      row * this.tileSize,
      size,
      size
    );
  }

  getPacman(velocity: number) {
    for (let row = 0; row < this.map.length; row++) {
      for (let column = 0; column < this.map[row].length; column++) {
        let tile = this.map[row][column];
        if (tile === 4) {
          this.map[row][column] = 0;
          return new Pacman(
            column * this.tileSize,
            row * this.tileSize,
            this.tileSize,
            velocity,
            this
          );
        }
      }
    }
  }

  setCanvasSize(canvas: HTMLCanvasElement) {
    canvas.width = this.map[0].length * this.tileSize; // First row
    canvas.height = this.map.length * this.tileSize;
  }

  didCollideWithEnvironment(x: number, y: number, direction: number) {
    if (Number.isInteger(x / this.tileSize) && Number.isInteger(y / this.tileSize)) {
      let column = 0;
      let row = 0;
      let nextColumn = 0;
      let nextRow = 0;

      switch (direction) {
        case MovingDirection.right:
          nextColumn = x + this.tileSize;
          column = nextColumn / this.tileSize;
          row = y / this.tileSize;
          break;
        case MovingDirection.left:
          nextColumn = x - this.tileSize;
          column = nextColumn / this.tileSize;
          row = y / this.tileSize;

          break;
        case MovingDirection.up:
          nextRow = y - this.tileSize;
          column = x / this.tileSize;
          row = nextRow / this.tileSize;
          break;
        case MovingDirection.down:
          nextRow = y + this.tileSize;
          column = x / this.tileSize;
          row = nextRow / this.tileSize;
          break;
      }

      const tile = this.map[row][column];
      if (tile === 1) {
        return true;
      }
    }
    return false;
  }
}
