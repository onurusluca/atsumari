import { emitter } from "@/composables/useEmit";

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
      // Draw character
      ctx.drawImage(
        characterImg,
        0,
        0,
        characterImg.width / 4,
        characterImg.height,
        user.x - cameraX - characterImg.width / 8,
        user.y - cameraY - characterImg.height / 8,
        characterImg.width / 4,
        characterImg.height
      );
    });

    // Request next frame
    requestAnimationFrame(animate);
  }

  // Start drawing
  animate();

  // MOUSE INPUT
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

    // Emit event to server
    emitter.emit("playerMove", myPlayer);
  });

  // KEYBOARD INPUT
  const inputs = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  window.addEventListener("keydown", (e) => {
    if (e.key === "w") {
      inputs["up"] = true;
    } else if (e.key === "s") {
      inputs["down"] = true;
    } else if (e.key === "d") {
      inputs["right"] = true;
    } else if (e.key === "a") {
      inputs["left"] = true;
    }
    if (["a", "s", "w", "d"].includes(e.key)) {
      console.log(inputs);
      emitter.emit("playerMove", inputs);
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.key === "w") {
      inputs["up"] = false;
    } else if (e.key === "s") {
      inputs["down"] = false;
    } else if (e.key === "d") {
      inputs["right"] = false;
    } else if (e.key === "a") {
      inputs["left"] = false;
    }
    if (["a", "s", "w", "d"].includes(e.key)) {
      console.log();
    }
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
