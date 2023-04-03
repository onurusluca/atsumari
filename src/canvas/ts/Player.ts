export default class Character {
  private x: number;
  private y: number;
  private direction: string;
  private isMoving: boolean;
  private img: HTMLImageElement;
  private frameX: number;
  private maxFrame: number;
  private elapsed: number;

  constructor(x: number, y: number, img: HTMLImageElement) {
    this.x = x;
    this.y = y;
    this.direction = "down";
    this.isMoving = false;
    this.img = img;
    this.frameX = 0;
    this.maxFrame = 3;
    this.elapsed = 0;
  }

  public move(x: number, y: number) {
    this.x += x;
    this.y += y;
  }

  public setDirection(direction: string) {
    this.direction = direction;
  }

  public setIsMoving(isMoving: boolean) {
    this.isMoving = isMoving;
  }

  public draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    if (this.isMoving) {
      this.elapsed += 1;
      if (this.elapsed > 3) {
        this.elapsed = 0;
        if (this.frameX < this.maxFrame) this.frameX++;
        else this.frameX = 0;
      }
    } else {
      this.frameX = 0;
    }

    ctx.drawImage(
      this.img,
      (this.frameX * this.img.width) / 4,
      0,
      this.img.width / 4,
      this.img.height,
      this.x - cameraX - this.img.width / 8,
      this.y - cameraY - this.img.height / 8,
      this.img.width / 4,
      this.img.height
    );
  }

  public getX() {
    return this.x;
  }

  public getY() {
    return this.y;
  }

  public getDirection() {
    return this.direction;
  }
}
