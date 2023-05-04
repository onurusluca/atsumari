import { emitter } from "@/composables/useEmit";
import type { User } from "@/types/general";
import type { CanvasAppOptions, Camera } from "@/types/canvasTypes";
import { loadImage, isColliding, matchUserFacingToAnimationState } from "./utilities";
import { drawPlayer } from "./draw";
import { updateAnimationFrame } from "./animations";
import { keyDownEventListener, keyUpEventListener } from "./keyboardEvents";
import { rightClickEventListener, wheelEventListener } from "./mouseEvents";

export async function createCanvasApp({
  users,
  myPlayerId,
  speed,
  canvas,
  canvasFrameRate,
  spaceMap,
  myCharacterSprite,
  initialSetupCompleted,
}: CanvasAppOptions) {
  const ctx = canvas.getContext("2d")!;

  // Mismatched canvas and display resolutions can cause blurry content.:
  /*
  const devicePixelRatio = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
  */

  // Load images
  const [worldImg, characterImg, characterImgMyPlayer] = await Promise.all([
    loadImage(spaceMap),
    loadImage(myCharacterSprite),
    loadImage(myCharacterSprite),
  ]);

  let camera: Camera = {
    cameraX: 200,
    cameraY: 200,
    zoomFactor: 1,
  };

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
  const pressedKeys: Record<string, boolean> = {
    w: false,
    a: false,
    s: false,
    d: false,
  };

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

  /****************************************
   * THE GAME LOOP
   ****************************************/
  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Anti-aliasing in browsers smooths images, which can blur pixel art or low-res graphics:
    ctx.imageSmoothingEnabled = false;

    // Set myPlayer
    myPlayer = users.find((user) => user.id === myPlayerId)!;
    if (myPlayer) {
      // Center camera on my player
      camera.cameraX = myPlayer.x - canvas.width / (2.2 * camera.zoomFactor);
      camera.cameraY = myPlayer.y - canvas.height / (2.2 * camera.zoomFactor);

      // Draw world
      ctx.drawImage(
        worldImg,
        0,
        0,
        worldImg.width,
        worldImg.height,
        (-camera.cameraX - worldImg.height / 2) * camera.zoomFactor,
        (-camera.cameraY - worldImg.width / 2) * camera.zoomFactor,
        worldImg.width * camera.zoomFactor,
        worldImg.height * camera.zoomFactor
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
              myPlayer.facingTo = "up";
              break;
            case "a":
              newPlayerX -= speed;
              animationState = "walk-left";
              myPlayer.facingTo = "left";
              break;
            case "s":
              newPlayerY += speed;
              animationState = "walk-down";
              myPlayer.facingTo = "down";
              break;
            case "d":
              newPlayerX += speed;
              animationState = "walk-right";
              myPlayer.facingTo = "right";
              break;
          }
        }

        // Check for collisions
        const playerWidth = 48 * camera.zoomFactor;
        const playerHeight = 64 * camera.zoomFactor;
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
            x: (user.x - camera.cameraX - 8) * camera.zoomFactor,
            y: (user.y - camera.cameraY - 8) * camera.zoomFactor,
            width: 96 * camera.zoomFactor,
            height: 96 * camera.zoomFactor,
          };

          // Check if mouse is over the player
          const isMouseOver = isColliding(
            { x: mouseX, y: mouseY, width: 1, height: 1 },
            playerRect
          );

          drawPlayer(
            ctx,
            characterImg,
            matchUserFacingToAnimationState(user.facingTo),
            1,
            user,
            camera.cameraX,
            camera.cameraY,
            camera.zoomFactor,
            user.userStatus,
            isMouseOver
          );
        }
      });

      // Draw my player
      const playerRect = {
        x: (myPlayer.x - camera.cameraX - 8) * camera.zoomFactor,
        y: (myPlayer.y - camera.cameraY - 8) * camera.zoomFactor,
        width: 96 * camera.zoomFactor,
        height: 96 * camera.zoomFactor,
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
        camera.cameraX,
        camera.cameraY,
        camera.zoomFactor,
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
    } else {
      setTimeout(gameLoop, refreshInterval);
    }
  }

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

  const getCamera = () => {
    return {
      cameraX: myPlayer?.x - canvas.width / (2.2 * camera.zoomFactor),
      cameraY: myPlayer.y - canvas.height / (2.2 * camera.zoomFactor),
      zoomFactor: camera.zoomFactor,
    };
  };

  // LISTENERS
  keyDownEventListener(canvas, pressedKeys, keyPressOrder, () => myPlayer);
  keyUpEventListener(canvas, pressedKeys, keyPressOrder, () => myPlayer);
  rightClickEventListener(canvas, getCamera, users, myPlayerId);
  wheelEventListener(canvas, camera);

  // Get right click move position confirmation and move the player
  emitter.on("rightClickPlayerMoveConfirmed", async (user) => {
    myPlayer.x = user.x;
    myPlayer.y = user.y;
    // Canvas loses focus after right click, so we need to focus it again
    canvas.focus();
  });

  // Get joystick move
  emitter.on("joystickMove", async (direction: string) => {
    console.log("joystickMove", direction);

    if (direction === "up") {
      pressedKeys.w = true;
      keyPressOrder.push("w");
    } else if (direction === "left") {
      pressedKeys.a = true;
      keyPressOrder.push("a");
    } else if (direction === "down") {
      pressedKeys.s = true;
      keyPressOrder.push("s");
    } else if (direction === "right") {
      pressedKeys.d = true;
      keyPressOrder.push("d");
    }

    if (direction === "none") {
      console.log("no direction");

      pressedKeys.w = false;
      pressedKeys.a = false;
      pressedKeys.s = false;
      pressedKeys.d = false;
      keyPressOrder = [];

      emitter.emit("playerMove", myPlayer);
    }
  });
}
