/* import { createApp } from "vue";
const eventBus = createApp({});
 */
export function createCanvasApp(
  // Get needed data from Room.vue
  myPlayerId,
  users,
  canvas,
  canvasImage,
  characterImage
) {
  const ctx = canvas.getContext("2d");

  // Set width and height of canvas
  canvas.width = 1024;
  canvas.height = 768;

  // Draw background image
  const worldImg = new Image();
  worldImg.src = canvasImage;

  // Draw character
  const characterImg = new Image();
  characterImg.src = characterImage;

  // Constants
  const SPEED = 5;

  // Animate canvas
  function animate() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get my player(the current user)
    const myPlayer = users.find((user) => user.id === myPlayerId);

    // Center camera on player
    let cameraX = 0;
    let cameraY = 0;
    if (myPlayer) {
      // Prevent tearing
      cameraX = parseInt(myPlayer.x - canvas.width / 2);
      cameraY = parseInt(myPlayer.y - canvas.height / 2);
    }

    // Draw background so it covers all canvas and moves with camera
    ctx.drawImage(
      worldImg,
      0,
      0,
      worldImg.width,
      worldImg.height,
      -cameraX - worldImg.height / 3.1,
      -cameraY - worldImg.width / 3.6,
      worldImg.width,
      worldImg.height
    );

    // Draw users on center
    users.forEach((user) => {
      //FIXME: Draw rectangle for each user
      ctx.fillStyle = user.color;
      ctx.fillRect(user.x - cameraX, user.y - cameraY, 50, 50);

      /*      ctx.drawImage(
        characterImg,
        0,
        0,
        characterImg.width / 4,
        characterImg.height,
        canvas.width / 2 - characterImg.width / 8,
        canvas.height / 2 - characterImg.height / 8,
        characterImg.width / 4,
        characterImg.height
      ); */
    });

    // Request next frame
    setTimeout(() => {
      requestAnimationFrame(animate);
    }, 100);
  }

  // Start drawing
  animate();

  // On double click, move player to clicked position but don't move camera
  canvas.addEventListener("dblclick", (e) => {
    // Get my player(the current user)
    const myPlayer = users.find((user) => user.id === myPlayerId);

    // Get mouse position
    const mouse = {
      x: e.clientX,
      y: e.clientY,
    };

    // Get camera position
    const camera = {
      x: parseInt(myPlayer.x - canvas.width / 2),
      y: parseInt(myPlayer.y - canvas.height / 2),
    };

    // Get mouse position relative to canvas
    const mouseOnCanvas = {
      x: mouse.x - canvas.offsetLeft,
      y: mouse.y - canvas.offsetTop,
    };

    // Get mouse position relative to camera
    const mouseOnCamera = {
      x: mouseOnCanvas.x + camera.x,
      y: mouseOnCanvas.y + camera.y,
    };

    // Move player to mouse position
    myPlayer.x = mouseOnCamera.x;
    myPlayer.y = mouseOnCamera.y;
  });
}

/* ctx.drawImage(
  image,
  sx(top-left of x),
  sy(top-left of y),
  swidth(width portion to draw),
  sheight(height portion to draw),
  x(x to draw on),
  y(y to draw on),
  width(width of image to draw on canvas),
  height(height of image to draw on canvas))
  */
