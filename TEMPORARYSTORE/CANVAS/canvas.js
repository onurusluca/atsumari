import { createApp } from "vue";
const eventBus = createApp({});

export function createCanvasApp(
  // Get needed data from Space.vue
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

  // Key states
  const keys = {
    w: {
      pressed: false,
    },
    a: {
      pressed: false,
    },
    s: {
      pressed: false,
    },
    d: {
      pressed: false,
    },
  };

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
      -cameraX,
      -cameraY,
      worldImg.width,
      worldImg.height
    );

    // Draw users on center
    users.forEach((user) => {
      ctx.drawImage(
        characterImg,
        0,
        0,
        characterImg.width / 4,
        characterImg.height,
        canvas.width / 2 - characterImg.width / 8,
        canvas.height / 2 - characterImg.height / 8,
        characterImg.width / 4,
        characterImg.height
      );
    });

    // Request next frame
    setTimeout(() => {
      requestAnimationFrame(animate);
    }, 100);
  }

  // Start drawing
  animate();

  // Key presses
  window.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "w":
        keys.w.pressed = true;
        break;
      case "a":
        keys.a.pressed = true;
        break;
      case "s":
        keys.s.pressed = true;
        break;
      case "d":
        keys.d.pressed = true;
        break;

      default:
        break;
    }
  });

  // Key releases
  window.addEventListener("keyup", (e) => {
    switch (e.key) {
      case "w":
        keys.w.pressed = false;
        break;
      case "a":
        keys.a.pressed = false;
        break;
      case "s":
        keys.s.pressed = false;
        break;
      case "d":
        keys.d.pressed = false;
        break;

      default:
        break;
    }
  });
}

//ctx.drawImage(image, sx(top-left of x), sy(top-left of y), swidth(width portion to draw), sheight(height portion to draw), x(x to draw on), y(y to draw on), width(width of image to draw on canvas), height(height of image to draw on canvas))
