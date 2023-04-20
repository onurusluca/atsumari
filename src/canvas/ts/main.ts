import { emitter } from "@/composables/useEmit";
import type { User } from "@/types/general";

import { loadImage, isColliding } from "./utilities";
import { drawPlayer } from "./draw";
import { updateAnimationFrame } from "./animations";
import { keyDownEventListener, keyUpEventListener } from "./keyboardEvents";
import { rightClickEventListener, wheelEventListener } from "./mouseEvents";

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

  // Load images
  const worldImg = loadImage(spaceMap);
  const characterImg = loadImage(myCharacterSprite);
  const characterImgMyPlayer = loadImage(myCharacterSprite);

  let cameraX = 200;
  let cameraY = 200;

  let myPlayer: User = {
    id: "",
    userName: "",
    x: 0,
    y: 0,
    characterSprite: "",
    facingTo: "",
    userStatus: "",
  };

  // When the user releases right key while still pressing the up key, character should start going up
  let keyPressOrder: string[] = [];
  const pressedKeys: {
    [key: string]: boolean;
  } = {
    w: false,
    a: false,
    s: false,
    d: false,
  };

  let zoomFactor = 1;

  let animationState = "walk-down";
  let animationFrame = 0;
  let animationTick = 0;

  let lastTime = performance.now();
  let fps = 0;

  let refreshInterval = 1000 / canvasFrameRate;
  const userAgent = navigator.userAgent;

  let mouseX = 0;
  let mouseY = 0;

  canvas.addEventListener("mousemove", (e: MouseEvent) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // LISTENERS
  keyDownEventListener(canvas, pressedKeys, keyPressOrder);
  keyUpEventListener(canvas, pressedKeys, keyPressOrder, myPlayer);
  rightClickEventListener(canvas, cameraX, cameraY, zoomFactor, users, myPlayerId);
  wheelEventListener(canvas, zoomFactor);

  /****************************************
   * THE GAME LOOP
   ****************************************/
  const gameLoop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set myPlayer
    myPlayer = users.find((user) => user.id === myPlayerId)!;
    if (myPlayer) {
      // Center camera on my player
      cameraX = myPlayer?.x - canvas.width / (2.2 * zoomFactor);
      cameraY = myPlayer.y - canvas.height / (2.2 * zoomFactor);

      // Draw world
      ctx.drawImage(
        worldImg,
        0,
        0,
        worldImg.width,
        worldImg.height,
        (-cameraX - worldImg.height / 2) * zoomFactor,
        (-cameraY - worldImg.width / 2) * zoomFactor,
        worldImg.width * zoomFactor,
        worldImg.height * zoomFactor
      );

      // Move my player but only if no other key is pressed(prevent diagonal movement). Also, if the user releases the second pressed key, the character should continue moving in the direction of the first pressed key
      if (keyPressOrder.length > 0) {
        let newPlayerX = myPlayer.x;
        let newPlayerY = myPlayer.y;

        const lastValidKey = keyPressOrder[keyPressOrder.length - 1];

        // check if any key is pressed
        if (pressedKeys.w || pressedKeys.a || pressedKeys.s || pressedKeys.d) {
          switch (lastValidKey) {
            case "w":
              newPlayerY -= speed;
              animationState = "walk-up";
              break;
            case "a":
              newPlayerX -= speed;
              animationState = "walk-left";
              break;
            case "s":
              newPlayerY += speed;
              animationState = "walk-down";
              break;
            case "d":
              newPlayerX += speed;
              animationState = "walk-right";
              break;
          }
        }

        // Check for collisions
        const playerWidth = 64 * zoomFactor;
        const playerHeight = 64 * zoomFactor;
        let collision = false;
        for (const user of users) {
          if (
            user.id !== myPlayerId &&
            isColliding(
              {
                x: newPlayerX,
                y: newPlayerY,
                width: playerWidth,
                height: playerHeight,
              },
              { x: user.x, y: user.y, width: playerWidth, height: playerHeight }
            )
          ) {
            collision = true;
            break;
          }
        }

        if (!collision) {
          myPlayer.x = newPlayerX;
          myPlayer.y = newPlayerY;
        }
      }

      // Draw other players
      users.forEach((user) => {
        if (user.id !== myPlayerId) {
          const playerRect = {
            x: (user.x - cameraX - 8) * zoomFactor,
            y: (user.y - cameraY - 8) * zoomFactor,
            width: 96 * zoomFactor,
            height: 96 * zoomFactor,
          };
          const isMouseOver = isColliding(
            { x: mouseX, y: mouseY, width: 1, height: 1 },
            playerRect
          );

          drawPlayer(
            ctx,
            characterImg,
            "walk-down",
            1,
            user,
            cameraX,
            cameraY,
            zoomFactor,
            user.userStatus,
            isMouseOver
          );
        }
      });

      // Draw my player
      const playerRect = {
        x: (myPlayer.x - cameraX - 8) * zoomFactor,
        y: (myPlayer.y - cameraY - 8) * zoomFactor,
        width: 96 * zoomFactor,
        height: 96 * zoomFactor,
      };
      const isMouseOver = isColliding(
        { x: mouseX, y: mouseY, width: 1, height: 1 },
        playerRect
      );

      drawPlayer(
        ctx,
        characterImgMyPlayer,
        animationState,
        animationFrame,
        myPlayer,
        cameraX,
        cameraY,
        zoomFactor,
        myPlayer.userStatus,
        isMouseOver
      );

      // Update animation frame
      [animationFrame, animationTick] = updateAnimationFrame(
        pressedKeys,
        animationState,
        animationFrame,
        animationTick
      );
    }
    // Calculate FPS
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // Draw FPS
    fps = Math.round(1000 / deltaTime);
    ctx.fillStyle = "black";

    // Bold Poppins 16px
    ctx.font = "bold 16px Poppins";
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

  // Init game loop
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

  // Get right click move position confirmation
  emitter.on("rightClickPlayerMoveConfirmed", async (user) => {
    myPlayer.x = user.x - 36;
    myPlayer.y = user.y - 64;

    // Canvas loses focus after right click, so we need to focus it again
    canvas.focus();
  });
}
