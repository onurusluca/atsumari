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

  // Draw background image
  const worldImg = new Image();
  worldImg.src = canvasImage;

  // Draw character
  const characterImg = new Image();
  characterImg.src = characterImage;

  // Center camera on player
  let cameraX = 0;
  let cameraY = 0;

  // Animate canvas
  const animate = () => {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get my player(the current user)
    const myPlayer = users.find((user) => user.id === myPlayerId);

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
  };

  // Start drawing
  animate();

  // MOUSE INPUT DOUBLE CLICK
  canvas.addEventListener("dblclick", (e) => {
    // Get the x and y position of the mouse based on camera
    const x = e.clientX + cameraX - 8; // -10 to account for character width
    const y = e.clientY + cameraY - 25; // -25 to account for character height

    // Emit event to server
    emitter.emit("doubleClick", { x, y });
  });

  // MOUSE INPUT RIGHT CLICK
  canvas.addEventListener("contextmenu", (e) => {
    // Get right click position
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Get the x and y position of the mouse based on camera
    const worldX = e.clientX + cameraX;
    const worldY = e.clientY + cameraY;

    const mousePos = {
      mouseX,
      mouseY,
    };

    const worldPos = {
      worldX,
      worldY,
    };

    // Emit event to server
    emitter.emit("rightClick", { mousePos, worldPos });

    // Prevent default context menu
    e.preventDefault();
  });

  // KEYBOARD INPUTS
  const inputs = {
    w: false,
    a: false,
    s: false,
    d: false,
  };
  let lastKey = "";
  window.addEventListener("keydown", (e) => {
    switch (e.key.toLowerCase()) {
      case "w":
        inputs.w = true;
        lastKey = "w";
        break;
      case "a":
        inputs.a = true;
        lastKey = "a";
        break;
      case "s":
        inputs.s = true;
        lastKey = "s";
        break;
      case "d":
        inputs.d = true;
        lastKey = "d";
        break;
    }
    emitter.emit("playerMove", inputs);
  });

  window.addEventListener("keyup", (e) => {
    switch (e.key.toLowerCase()) {
      case "w":
        inputs.w = false;
        break;
      case "a":
        inputs.a = false;
        break;
      case "s":
        inputs.s = false;
        break;
      case "d":
        inputs.d = false;
        break;
    }
    emitter.emit("playerMove", inputs);
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
