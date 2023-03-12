export class Sprite {
  constructor(image, x, y, ctx) {
    this.image = image
    this.x = x
    this.y = y
    this.ctx = ctx
  }

  draw() {
    ctx.drawImage(this.image, this.x, this.y)
  }
}
