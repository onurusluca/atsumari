import { emitter } from "@/composables/useEmit";

interface User {
  id: string;
  x: number;
  y: number;
}

export function createCanvasApp(
  // Data from Room.vue
  users: User[],
  myPlayerId: string,
  speed: number,
  canvas: HTMLCanvasElement,
  canvasImage: string,
  characterImage: string
) {
  const ctx = canvas.getContext("2d")!;

  // Draw background image
  const worldImg = new Image();
  worldImg.src = canvasImage;

  // Draw character
  const characterImg = new Image();
  characterImg.src = characterImage;

  let cameraX = 0;
  let cameraY = 0;

  // Fps related
  let lastTime = performance.now();
  let frameCount = 0;
  let fps = 0;
  const FRAME_RATE = 30; // Limit frame rate to 30 FPS
  const FRAME_TIME = 1000 / FRAME_RATE;

  // Get my player(the current user)
  let myPlayer = {
    x: 0,
    y: 0,
  };
  if (users.length > 0) {
    myPlayer = users.find((user) => user.id === myPlayerId)!;
  }
  // Keyboard inputs
  const inputs = {
    w: false,
    a: false,
    s: false,
    d: false,
  };
  let lastKey = "";

  // Animate canvas
  const animate = () => {
    // Request next frame
    setTimeout(() => {
      requestAnimationFrame(animate);
    }, FRAME_TIME);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Center camera on player
    cameraX = parseInt(myPlayer.x - canvas.width / 2);
    cameraY = parseInt(myPlayer.y - canvas.height / 2);

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

    // Draw users on center except for my player
    users.forEach((user) => {
      if (user.id === myPlayerId) return;
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

    // Draw my player on center
    if (users.length > 0) {
      ctx.drawImage(
        characterImg,
        0,
        0,
        characterImg.width / 4,
        characterImg.height,
        myPlayer.x - cameraX - characterImg.width / 8,
        myPlayer.y - cameraY - characterImg.height / 8,
        characterImg.width / 4,
        characterImg.height
      );
    }

    // Calculate elapsed time since last frame
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // Update frame count and FPS value
    frameCount++;
    fps = Math.round(1000 / deltaTime);

    // Clear canvas and draw FPS value
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText(`FPS: ${fps}`, 10, 20);

    if (inputs.w && (lastKey === "w" || lastKey === "W")) {
      myPlayer.y -= speed;
    }
    if (inputs.a && (lastKey === "a" || lastKey === "A")) {
      myPlayer.x -= speed;
    }
    if (inputs.s && (lastKey === "s" || lastKey === "S")) {
      myPlayer.y += speed;
    }
    if (inputs.d && (lastKey === "d" || lastKey === "D")) {
      myPlayer.x += speed;
    }
  };

  // Start drawing
  animate();

  /******************
   * Mouse events *
   ******************/
  // Listen to double click
  canvas.addEventListener("dblclick", (e: MouseEvent) => {
    const x = e.clientX + cameraX - 8;
    const y = e.clientY + cameraY - 25;

    // Emit double click event
    emitter.emit("doubleClick", { x, y });

    myPlayer.x = x;
    myPlayer.y = y;
  });

  // Listen to right click
  canvas.addEventListener("contextmenu", (e: MouseEvent) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

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

    // myPlayer.x = worldX;
    // myPlayer.y = worldY;

    // Emit right click event
    emitter.emit("rightClick", { mousePos, worldPos });

    e.preventDefault();
  });

  // Get right click move position confirmation
  emitter.on("rightClickPlayerMoveConfirmed", async (user) => {
    myPlayer.x = user.x;
    myPlayer.y = user.y;
  });

  /******************
   * Keyboard inputs *
   ******************/

  window.addEventListener("keydown", (e: KeyboardEvent) => {
    // Listen to both lower and upper case
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
  });

  window.addEventListener("keyup", (e: KeyboardEvent) => {
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

    // Emit player move event
    // Only emit after user has stopped moving
    emitter.emit("playerMove", myPlayer);
  });
}
