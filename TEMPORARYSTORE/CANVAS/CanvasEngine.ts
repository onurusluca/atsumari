import { emitter } from "@/composables/useEmit";
import type { User } from "@/types/general";

export function createCanvasApp(
  // Data from Space.vue
  users: User[],
  myPlayerId: string,
  speed: number,
  canvas: HTMLCanvasElement,
  canvasFrameRate: number,
  spaceMap: string,
  myCharacterSprite: string
) {
  const ctx = canvas?.getContext("2d")!;

  const worldImg = new Image();
  worldImg.src = spaceMap;

  let cameraX = 0;
  let cameraY = 0;

  // Get my player(the current user)
  let myPlayer = {
    userName: "",
    x: 0,
    y: 0,
  };

  // Keyboard pressedKeys
  const pressedKeys = {
    w: false,
    a: false,
    s: false,
    d: false,
  };

  let lastpressedKey = "null";

  // Character images
  const characterImg = new Image();
  characterImg.src = myCharacterSprite;
  const characterImgMyPlayer = new Image();
  characterImgMyPlayer.src = myCharacterSprite;

  // 72x96 sprite sheet(3 rows, 4 columns)
  const characterAnimations = {
    "walk-down": [
      [0, 0],
      [24, 1],
      [48, 0],
    ],
    "walk-left": [
      [0, 24],
      [24, 25],
      [48, 24],
    ],
    "walk-right": [
      [0, 48],
      [24, 49],
      [48, 48],
    ],
    "walk-up": [
      [0, 72],
      [24, 73],
      [48, 72],
    ],
  } as const;

  // Sprite sheet animation related
  let animationState = "walk-down";
  let animationFrame = 0;
  let animationTick = 0;

  // Fps related
  let lastTime = performance.now();
  let fps = 0;

  let refreshInterval = 1000 / canvasFrameRate;
  const userAgent = navigator.userAgent;

  /******************
   * ANIMATION LOOP *
   ******************/
  const gameLoop = () => {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get my player
    myPlayer = users.find((user) => user.id === myPlayerId)!;
    // Center camera on player
    cameraX = myPlayer.x - canvas.width / 2;
    cameraY = myPlayer.y - canvas.height / 2;

    // Draw background so it covers all canvas and moves with camera
    ctx.drawImage(
      worldImg,
      0,
      0,
      worldImg.width,
      worldImg.height,
      -cameraX - worldImg.height / 2,
      -cameraY - worldImg.width / 2,
      worldImg.width,
      worldImg.height
    );

    // Move my player
    if (pressedKeys.w) {
      myPlayer.y -= speed;
      animationState = "walk-up";
    }
    if (pressedKeys.a) {
      myPlayer.x -= speed;
      animationState = "walk-left";
    }
    if (pressedKeys.s) {
      myPlayer.y += speed;
      animationState = "walk-down";
    }
    if (pressedKeys.d) {
      myPlayer.x += speed;
      animationState = "walk-right";
    }

    // Draw my player
    const frameCoords =
      characterAnimations[animationState as keyof typeof characterAnimations][
        animationFrame
      ];
    ctx.drawImage(
      characterImgMyPlayer,
      frameCoords[0],
      frameCoords[1],
      24,
      24,
      myPlayer.x - cameraX - 8,
      myPlayer.y - cameraY - 8,
      96,
      96
    );

    // Update animation frame
    if (pressedKeys.w || pressedKeys.a || pressedKeys.s || pressedKeys.d) {
      animationTick++;
    } else {
      // Reset to idle animation
      animationFrame = 1;
    }

    // Animation speed
    if (animationTick >= 7) {
      animationFrame++;
      if (
        animationFrame >=
        characterAnimations[animationState as keyof typeof characterAnimations].length
      ) {
        animationFrame = 0;
      }
      animationTick = 0;
    }

    // Draw my player name and center the text based on the length of the name
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    const userNameTextWidth = ctx.measureText(myPlayer.userName).width;
    ctx.fillText(
      myPlayer.userName,
      myPlayer.x - cameraX - userNameTextWidth / 24,
      myPlayer.y - cameraY - characterImg.height / 4 + 20
    );
    // ----- end Draw my player -----

    // Draw other players (don't draw my player)
    users.forEach((user) => {
      if (user.id !== myPlayerId) {
        // Draw other players
        ctx.drawImage(
          characterImg,
          0,
          0,
          24,
          24,
          user.x - cameraX,
          user.y - cameraY,
          96,
          96
        );

        // Draw other players' name
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        const userNameTextWidth = ctx.measureText(user.userName).width;
        ctx.fillText(
          user.userName,
          user.x - cameraX - userNameTextWidth / 24,
          user.y - cameraY - characterImg.height / 4 + 20
        );
      }
    });
    // ----- end Draw other players -----

    // Calculate elapsed time since last frame
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // Update frame count and FPS value. Draw FPS value
    fps = Math.round(1000 / deltaTime);
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText(`FPS: ${fps}`, 10, 20);

    // Request next frame
    // Check the browser and use the appropriate fps limiter because every browser has its own way of doing it
    if (userAgent.indexOf("Firefox") > -1) {
      // Use Firefox-specific code
      // FIXME: Can't limit fps in Firefox
      requestAnimationFrame(gameLoop);
    } else if (userAgent.indexOf("Chrome") > -1) {
      // Use Chrome-specific code
      setTimeout(gameLoop, refreshInterval);
    } else {
      // Use default code for other browsers
      setTimeout(gameLoop, refreshInterval);
    }
  };
  // ----- end Animation loop -----

  /******************
   * INITIATE LOOP *
   ******************/
  // Start drawing after users array is populated
  if (users.length > 0 && myPlayerId !== "" && speed !== 0 && spaceMap !== "") {
    //setInterval(gameLoop, 1000 / canvasFrameRate);
    gameLoop();
  } else {
    // Check if users array is empty
    const checkUsers = setInterval(() => {
      if (users.length > 0) {
        gameLoop();
        //setInterval(gameLoop, 1000 / canvasFrameRate);
        clearInterval(checkUsers);

        // Emit canvas loaded event
        emitter.emit("canvasLoaded");
      }
    }, 0);
  }

  /******************
   * MOUSE EVENTS *
   ******************/
  // Listen to double click
  /*   canvas.addEventListener("dblclick", (e: MouseEvent) => {
    const x = e.clientX + cameraX - 8;
    const y = e.clientY + cameraY - 25;

    // Emit double click event
    emitter.emit("doubleClick", { x, y });

    myPlayer.x = x;
    myPlayer.y = y;
  }); */

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

    // Emit right click event
    emitter.emit("rightClick", { mousePos, worldPos });

    e.preventDefault();
  });

  // Get right click move position confirmation
  emitter.on("rightClickPlayerMoveConfirmed", async (user) => {
    myPlayer.x = user.x - 36;
    myPlayer.y = user.y - 64;
  });

  /******************
   * KEYBOARD EVENTS *
   ******************/
  canvas.addEventListener("keydown", (e: KeyboardEvent) => {
    // TODO: Prevent diagonal movement

    // Listen to both lower and upper case
    switch (e.key.toLowerCase()) {
      case "w":
        pressedKeys.w = true;
        lastpressedKey = "w";
        break;
      case "a":
        pressedKeys.a = true;
        lastpressedKey = "a";
        break;
      case "s":
        pressedKeys.s = true;
        lastpressedKey = "s";
        break;
      case "d":
        pressedKeys.d = true;
        lastpressedKey = "d";
        break;
    }
  });

  canvas.addEventListener("keyup", (e: KeyboardEvent) => {
    switch (e.key.toLowerCase()) {
      case "w":
        pressedKeys.w = false;
        break;
      case "a":
        pressedKeys.a = false;
        break;
      case "s":
        pressedKeys.s = false;
        break;
      case "d":
        pressedKeys.d = false;
        break;
    }

    // Go back to the last key pressed after the second key is released
    switch (lastpressedKey as string) {
      case "w":
        myPlayer.y -= speed;
        animationState = "walk-up";
        break;
      case "a":
        myPlayer.x -= speed;
        animationState = "walk-left";
        break;
      case "s":
        myPlayer.y += speed;
        animationState = "walk-down";
        break;
      case "d":
        myPlayer.x += speed;
        animationState = "walk-right";
        break;
    }

    // Only emit if key is w,a,s,d or W,A,S,D and after user has stopped moving
    const validKeys = ["w", "a", "s", "d"];

    if (validKeys.includes(e.key.toLocaleLowerCase())) {
      // Emit player move event
      emitter.emit("playerMove", myPlayer);
    }
  });

  // FIXME: Zooming is not working properly
  /******************
   * ZOOM EVENTS *
   * **************/
  let scale = 1;
  const zoomSpeed = 0.1;
  canvas.addEventListener("wheel", (e) => {
    if (e.ctrlKey) {
      console.log("Zooming");

      e.preventDefault();
      // Zoom in
      /*  if (e.deltaY < 0) {
        scale = Math.max(0.1, Math.min(scale + zoomSpeed, 10));
        const x = e.offsetX / scale;
        const y = e.offsetY / scale;
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.translate(-x, -y);
        // Zoom out
      } else {

      } */
      // Smooth zoom
      canvas.style.transition = "transform 0.1s ease-in-out";
    }
  });
}
