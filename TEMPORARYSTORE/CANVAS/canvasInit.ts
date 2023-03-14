export interface Player {
  id: number
  x: number
  y: number

}

/* ctx.drawImage(
    playerImage,
    0,
    0,
    playerImage.width / 4,
    playerImage.height,
    canvasHeight.value / 5,
    canvasWidth.value / 2.5,
    playerImage.width / 4,
    playerImage.height
  ) */

export class Game {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  players: Player[]

  constructor(
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    worldImage: string,
    users: any[]
  ) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.players = users.map((user) => ({
      id: user.id,
      x: user.x,
      y: user.y,
      width: 50,
      height: 50,
    }))
    this.canvas.width = width
    this.canvas.height = height

    for (const player of this.players) {
      console.log(player)
    }
    let image = new Image()
    image.src = worldImage
    image.onload = () => {
      this.ctx.drawImage(image, -300, -280)
    }

    /*   supabase
      .from('game_state')
      .on('*', (payload) => {
        // Handle game state changes received from server
        const { players } = payload.new
        this.players = players
        this.draw()
      })
      .subscribe() */

    this.bindEvents()
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.fillStyle = 'red'

    for (const player of this.players) {
      this.drawPlayer(player)
    }
    requestAnimationFrame(() => this.draw())
  }

  drawPlayer(player: Player) {
    this.ctx.fillStyle = 'red'
    this.ctx.fillRect(player.x, player.y, player.width, player.height)
  }

  bindEvents() {
    window.addEventListener('keydown', (event) => {
      let dx = 0
      let dy = 0
      switch (event.code) {
        case 'ArrowLeft':
          dx = -30
          break
        case 'ArrowRight':
          dx = 30
          break
        case 'ArrowUp':
          dy = -30
          break
        case 'ArrowDown':
          dy = 30
          break
      }
      if (dx !== 0 || dy !== 0) {
        this.updatePlayer(dx, dy)
      }
    })
  }

  updatePlayer(dx: number, dy: number) {
    // Send a request to update the player position in the Supabase database
    const { x, y } = this.players[0]
    /* supabase
      .from('game_state')
      .upsert({ players: [{ id: 1, x: x + dx, y: y + dy, width: 50, height: 50 }] })
      .then(() => {
        console.log('Player position updated')
      })
      .catch((error) => {
        console.error('Error updating player position:', error)
      }) */
  }
}

=====================================================

export class Character {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'blue'
    ctx.fillRect(this.x, this.y, 50, 50)
  }

  moveLeft() {
    this.x -= 10
  }

  moveRight() {
    this.x += 10
  }

  moveUp() {
    this.y -= 10
  }

  moveDown() {
    this.y += 10
  }
}

export class Game {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  character: Character[]

  constructor(
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    worldImage: string,
    users: any[]
  ) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.character = users.map((user) => new Character(user.x, user.y))

    this.canvas.width = width
    this.canvas.height = height

    this.draw()
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.character.forEach((character) => {
      character.draw(this.ctx)
    })

    requestAnimationFrame(() => this.draw())
  }
  /*
  bindEvents() {
    window.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'ArrowLeft':
          this.character.moveLeft()
          break
        case 'ArrowRight':
          this.character.moveRight()
          break
        case 'ArrowUp':
          this.character.moveUp()
          break
        case 'ArrowDown':
          this.character.moveDown()
          break
      }
    })
  } */
}
