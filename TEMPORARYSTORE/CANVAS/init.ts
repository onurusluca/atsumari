export function createCanvasApp(users, canvas, canvasImage, characterImage) {
  const ctx = canvas.getContext('2d')
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw background image
  const worldImg = new Image()
  worldImg.src = canvasImage

  // Draw character image
  const characterImg = new Image()
  characterImg.src = characterImage

  class Sprite {
    constructor({ x, y, width, height, image }) {
      this.x = x
      this.y = y
      this.width = width
      this.height = height
      this.image = image
    }

    draw() {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
    }
  }
  const background = new Sprite({
    x: -785,
    y: -650,
    height: canvas.width,
    width: canvas.height,
    image: worldImg,
  })

  function animate() {
    // Request next frame
    setTimeout(() => {
      requestAnimationFrame(animate)
    }, 1000)

    background.draw()
    // Draw users
    /*     users.forEach((user) => {
      ctx.drawImage(
        characterImg,
        0,
        0,
        characterImage.width / 4,
        characterImage.width,
        user.x,
        user.y,
        characterImage.width / 4,
        characterImage.width
      ) */

    /*    ctx.beginPath()
      ctx.arc(user.x, user.y, 10, 0, 2 * Math.PI)
      ctx.fillStyle = user.color
      ctx.fill()
      ctx.stroke() */
  }
  animate()
}
