export default class Pacman {
  x: number;
  y: number;
  tileSize: number;
  velocity: number;
  tileMap: any;
  pacmanImages: HTMLImageElement[] = [];
  pacmanImageIndex: number = 0;

  constructor(x: number, y: number, tileSize: number, velocity: number, tileMap: any) {
    this.x = x;
    this.y = y;
    this.tileSize = tileSize;
    this.velocity = velocity;
    this.tileMap = tileMap;

    document.addEventListener("keydown", this.#handleKeyDown);

    this.#loadPacmanImage();
  }

  draw(ctx: CanvasRenderingContext2D) {}

  #loadPacmanImage() {}
  #handleKeyDown = (event: KeyboardEvent) => {};

  #move() {}

  #animate() {}
}
