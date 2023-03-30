import PacmanImg1 from "@/canvas/images/images/pac0.png";
import PacmanImg2 from "@/canvas/images/images/pac1.png";
import PacmanImg3 from "@/canvas/images/images/pac2.png";

export default class Pacman {
  x: number;
  y: number;
  tileSize: number;
  velocity: number;
  tileMap: number[][];
  pacmanImages: HTMLImageElement[] = [];
  pacmanImageIndex: number = 0;

  constructor(
    x: number,
    y: number,
    tileSize: number,
    velocity: number,
    tileMap: number[][]
  ) {
    this.x = x;
    this.y = y;
    this.tileSize = tileSize;
    this.velocity = velocity;
    this.tileMap = tileMap;
    this.#loadPacmanImage();
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(
      this.pacmanImages[this.pacmanImageIndex],
      this.x,
      this.y,
      this.tileSize,
      this.tileSize
    );
  }

  #loadPacmanImage() {
    const pacman1 = new Image();
    pacman1.src = PacmanImg1;

    const pacman2 = new Image();
    pacman2.src = PacmanImg2;

    const pacman3 = new Image();
    pacman3.src = PacmanImg3;

    this.pacmanImages = [pacman1, pacman2, pacman3, pacman2];

    this.pacmanImageIndex = 1;
  }
}
