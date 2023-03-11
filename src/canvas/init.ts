// initialize canvas

export function initCanvas(canvasElement: HTMLCanvasElement) {
  console.log('init canvas', canvasElement)

  /*   const canvas = document.getElementById('canvas') as HTMLCanvasElement
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  const width = canvas.width
  const height = canvas.height

  // set up canvas
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, width, height)

  // set up socket
  const socket = io.connect('http://localhost:3000')
  socket.on('connect', () => {
    console.log('connected')
  })

  // set up mouse
  const mouse = {
    x: 0,
    y: 0,
    down: false,
  }

  canvas.addEventListener('mousedown', (e) => {
    mouse.down = true
  })

  canvas.addEventListener('mouseup', (e) => {
    mouse.down = false
  })

  canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX
    mouse.y = e.clientY
  })

  // set up drawing
  let drawing = false
  let lastX = 0
  let lastY = 0

  function draw(x: number, y: number) {
    if (!drawing) return

    ctx.beginPath()
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 5
    ctx.lineCap = 'round'
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.closePath()

    lastX = x
    lastY = y
  }

  // set up animation loop
  function animate() {
    requestAnimationFrame(animate)
    draw(mouse.x, mouse.y)
  }

  animate() */
}
