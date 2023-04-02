import PacmanImg1 from "@/canvas/images/images/pac0.png";
import PacmanImg2 from "@/canvas/images/images/pac1.png";
import PacmanImg3 from "@/canvas/images/images/pac2.png";

import MovingDirection from "@/canvas/MovingDirection";

export default class Pacman {
  x: number;
  y: number;
  tileSize: number;
  velocity: number;
  tileMap: any;
  pacmanImages: HTMLImageElement[] = [];
  pacmanImageIndex: number = 0;
  currentDirection: number | null;
  requestedDirection: number | null;

  pacmanAnimationTimerDefault: number;
  pacmanAnimationTimer: number | null;

  constructor(x: number, y: number, tileSize: number, velocity: number, tileMap: any) {
    this.x = x;
    this.y = y;
    this.tileSize = tileSize;
    this.velocity = velocity;
    this.tileMap = tileMap;

    this.currentDirection = null;
    this.requestedDirection = null;

    this.pacmanAnimationTimerDefault = 10;
    this.pacmanAnimationTimer = null;

    document.addEventListener("keydown", this.#handleKeyDown);

    this.#loadPacmanImage();
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.#move();
    this.#animate();
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

  #handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowUp") {
      if (this.currentDirection === MovingDirection.down) {
        this.currentDirection = MovingDirection.up;
      }
      this.requestedDirection = MovingDirection.up;
    } else if (event.key === "ArrowDown") {
      if (this.currentDirection === MovingDirection.up) {
        this.currentDirection = MovingDirection.down;
      }
      this.requestedDirection = MovingDirection.down;
    } else if (event.key === "ArrowLeft") {
      if (this.currentDirection === MovingDirection.right) {
        this.currentDirection = MovingDirection.left;
      }
      this.requestedDirection = MovingDirection.left;
    } else if (event.key === "ArrowRight") {
      if (this.currentDirection === MovingDirection.left) {
        this.currentDirection = MovingDirection.right;
      }
      this.requestedDirection = MovingDirection.right;
    }
  };

  #move() {
    if (this.currentDirection !== this.requestedDirection) {
      if (
        Number.isInteger(this.x / this.tileSize) &&
        Number.isInteger(this.y / this.tileSize)
      ) {
        if (
          !this.tileMap.didCollideWithEnvironment(
            this.x,
            this.y,
            this.requestedDirection
          )
        ) {
        }

        this.currentDirection = this.requestedDirection;
      }
    }

    if (this.tileMap.didCollideWithEnvironment(this.x, this.y, this.currentDirection)) {
      this.pacmanAnimationTimer = null;
      this.pacmanImageIndex = 1;
      return;
    } else if (this.currentDirection !== null && this.pacmanAnimationTimer === null) {
      this.pacmanAnimationTimer = this.pacmanAnimationTimerDefault;
    }

    switch (this.currentDirection) {
      case MovingDirection.up:
        this.y -= this.velocity;
        break;
      case MovingDirection.down:
        this.y += this.velocity;
        break;
      case MovingDirection.left:
        this.x -= this.velocity;
        break;
      case MovingDirection.right:
        this.x += this.velocity;
        break;

      default:
        break;
    }
  }

  #animate() {
    if (this.pacmanAnimationTimer === null) {
      return;
    }

    this.pacmanAnimationTimer--;

    if (this.pacmanAnimationTimer === 0) {
      this.pacmanAnimationTimer = this.pacmanAnimationTimerDefault;
      this.pacmanImageIndex++;

      if (this.pacmanImageIndex === this.pacmanImages.length) {
        this.pacmanImageIndex = 0;
      }
    }
  }
}
