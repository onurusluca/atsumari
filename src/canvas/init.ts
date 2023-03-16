export class Character {
  x: number
  y: number
  speed: number

  constructor(x: number, y: number, speed: number) {
    this.x = x
    this.y = y
    this.speed = speed
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'blue'
    ctx.fillRect(this.x, this.y, 50, 50)
  }

  update(x: number, y: number, ctx: CanvasRenderingContext2D) {
    this.x = x
    this.y = y
    this.draw(ctx)
  }

  moveLeft() {
    this.x -= this.speed
  }

  moveRight() {
    this.x += this.speed
  }

  moveUp() {
    this.y -= this.speed
  }

  moveDown() {
    this.y += this.speed
  }
}

export class Game {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  characters: Character[]

  constructor(
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    worldImage: string,
    users: any[]
  ) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.characters = []

    this.canvas.width = width
    this.canvas.height = height

    let worldBackground = new Image()
    worldBackground.src = worldImage
    worldBackground.onload = () => {
      this.ctx.drawImage(worldBackground, 0, 0, width, height)
    }

    users.forEach((user) => {
      const character = new Character(user.x, user.y, user.speed)
      this.characters.push(character)
    })

    this.draw()
  }

  draw() {
    requestAnimationFrame(() => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.characters.forEach((character) => {
        character.draw(this.ctx)
      })
      this.draw()
    })
  }
}
