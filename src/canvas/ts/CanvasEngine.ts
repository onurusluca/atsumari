import { emitter } from "@/composables/useEmit";
import type { User } from "@/types/general";

interface CharacterAnimation {
  [key: string]: number[][];
}

const characterAnimations: CharacterAnimation = {
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
};

function loadImage(src: string): HTMLImageElement {
  const image = new Image();
  image.src = src;
  return image;
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  characterImg: HTMLImageElement,
  animation: string,
  frame: number,
  player: User,
  cameraX: number,
  cameraY: number
) {
  const frameCoords = characterAnimations[animation][frame];
  ctx.drawImage(
    characterImg,
    frameCoords[0],
    frameCoords[1],
    24,
    24,
    player.x - cameraX - 8,
    player.y - cameraY - 8,
    96,
    96
  );

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  const userNameTextWidth = ctx.measureText(player.userName).width;
  ctx.fillText(
    player.userName,
    player.x - cameraX - userNameTextWidth / 24,
    player.y - cameraY - characterImg.height / 4 + 20
  );
}

function updateAnimationFrame(
  pressedKeys: { [key: string]: boolean },
  animationState: string,
  animationFrame: number,
  animationTick: number
): [number, number] {
  if (pressedKeys.w || pressedKeys.a || pressedKeys.s || pressedKeys.d) {
    animationTick++;
  } else {
    animationFrame = 1;
  }

  if (animationTick >= 7) {
    animationFrame++;
    if (animationFrame >= characterAnimations[animationState].length) {
      animationFrame = 0;
    }
    animationTick = 0;
  }

  return [animationFrame, animationTick];
}

export function createCanvasApp(
  users: User[],
  myPlayerId: string,
  speed: number,
  canvas: HTMLCanvasElement,
  canvasFrameRate: number,
  spaceMap: string,
  myCharacterSprite: string,
  initialSetupCompleted: boolean
) {
  const ctx = canvas.getContext("2d")!;

  const worldImg = loadImage(spaceMap);
  const characterImg = loadImage(myCharacterSprite);
  const characterImgMyPlayer = loadImage(myCharacterSprite);

  let cameraX = 0;
  let cameraY = 0;

  let myPlayer: User = {
    id: "",
    userName: "",
    x: 0,
    y: 0,
    characterSprite: "",
    facingTo: "",
  };

  const pressedKeys = {
    w: false,
    a: false,
    s: false,
    d: false,
  };

  let lastPressedKey = "null";

  let animationState = "walk-down";
  let animationFrame = 0;
  let animationTick = 0;

  let lastTime = performance.now();
  let fps = 0;

  let refreshInterval = 1000 / canvasFrameRate;
  const userAgent = navigator.userAgent;

  const gameLoop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Center camera on my player
    myPlayer = users.find((user) => user.id === myPlayerId)!;
    if (myPlayer) {
      cameraX = myPlayer.x - canvas.width / 2.2;
      cameraY = myPlayer.y - canvas.height / 2.2;
    }

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
    drawPlayer(
      ctx,
      characterImgMyPlayer,
      animationState,
      animationFrame,
      myPlayer,
      cameraX,
      cameraY
    );

    // Update animation frame
    [animationFrame, animationTick] = updateAnimationFrame(
      pressedKeys,
      animationState,
      animationFrame,
      animationTick
    );

    // Draw other players
    users.forEach((user) => {
      if (user.id !== myPlayerId) {
        drawPlayer(ctx, characterImg, "walk-down", 1, user, cameraX, cameraY);
      }
    });

    // Calculate FPS
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // Draw FPS
    fps = Math.round(1000 / deltaTime);
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText(`FPS: ${fps}`, 10, 20);

    // Check the browser and use the appropriate fps limiter because every browser has its own way of doing it
    if (userAgent.indexOf("Firefox") > -1) {
      // FIXME: Can't limit fps in Firefox
      requestAnimationFrame(gameLoop);
    } else if (userAgent.indexOf("Chrome") > -1) {
      setTimeout(gameLoop, refreshInterval);
    } else {
      setTimeout(gameLoop, refreshInterval);
    }
  };

  if (
    users.length > 0 &&
    myPlayerId !== "" &&
    speed !== 0 &&
    spaceMap !== "" &&
    initialSetupCompleted
  ) {
    gameLoop();
  } else {
    const checkConditionsBeforeLoop = setInterval(() => {
      if (
        users.length > 0 &&
        myPlayerId !== "" &&
        speed !== 0 &&
        spaceMap !== "" &&
        initialSetupCompleted
      ) {
        gameLoop();
        clearInterval(checkConditionsBeforeLoop);

        // Emit event to notify that the canvas is loaded
        emitter.emit("canvasLoaded");
      }
    }, 0);
  }

  /******************
   * KEYBOARD EVENTS *
   ******************/
  canvas.addEventListener("keydown", (e: KeyboardEvent) => {
    // TODO: Prevent diagonal movement

    // Listen to both lower and upper case
    switch (e.key.toLowerCase()) {
      case "w":
        pressedKeys.w = true;
        lastPressedKey = "w";
        break;
      case "a":
        pressedKeys.a = true;
        lastPressedKey = "a";
        break;
      case "s":
        pressedKeys.s = true;
        lastPressedKey = "s";
        break;
      case "d":
        pressedKeys.d = true;
        lastPressedKey = "d";
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
    switch (lastPressedKey as string) {
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
}
