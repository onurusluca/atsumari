import { emitter } from "@/composables/useEmit";
import { getOS } from "@/utils/getOS";
import type { User } from "@/types/general";
import type { CanvasAppOptions, Camera, TileMap } from "@/types/canvasTypes";

import { loadImage, isColliding, matchUserFacingToAnimationState } from "./utilities";
import { checkPlayerCollisionWithWalls } from "./collisionDetection";
import { checkPlayerInRoom } from "./roomDetection";
import { drawTileMap, drawPlayerBanner, drawPlayer } from "./draw";
import { updateAnimationFrame } from "./animations";
import { keyDownEventListener, keyUpEventListener } from "./keyboardEvents";
import { rightClickEventListener, wheelEventListener } from "./mouseEvents";

import WorldMapJson from "../images/test-map.json";
import WorldMapTileSet from "../images/tileset.png";

async function createCanvasApp(options: CanvasAppOptions): Promise<void> {
  const {
    users,
    myPlayerId,
    speed,
    canvas,
    canvasFrameRate,
    spaceMap,
    initialSetupCompleted,
  } = options;

  const ctx = canvas.getContext("2d")!;

  const [worldMap] = await Promise.all([loadImage(WorldMapTileSet)]);

  function loadAnImage(src: string) {
    const img = new Image();
    img.src = src;
    return img as HTMLImageElement;
  }

  let camera: Camera = {
    cameraX: 200,
    cameraY: 200,
    zoomFactor: 3,
  };

  // If zoomFactor local storage exists, use it, otherwise use the default zoomFactor
  if (localStorage.getItem("zoomFactor")) {
    camera.zoomFactor = Number(localStorage.getItem("zoomFactor"));
  }

  let myPlayer: User = {
    id: "",
    userName: "",
    x: 0,
    y: 0,
    facingTo: "",
    characterSprite: "",
    characterSpriteName: "",
    userStatus: "",
    userPersonalMessage: "",
  };

  const PLAYER_SIZE = 16;

  let tempPlayerPosition: { x: number; y: number } = { x: 0, y: 0 };

  // Tracks the order of movement keys (W, A, S, D) being pressed. It helps determine the character's movement direction when multiple keys are pressed, prioritizing the last valid key pressed.
  let keyPressOrder: string[] = [];
  const pressedKeys: Record<string, boolean> = {
    w: false,
    a: false,
    s: false,
    d: false,
  };

  // Animation related
  let animationState = "walk-down";
  let animationFrame = 0;
  let animationTick = 0;

  // FPS counter
  let lastTime = performance.now();
  let fps = 0;
  const refreshInterval = 1000 / canvasFrameRate;

  let userOs = getOS();

  let mouseX = 0;
  let mouseY = 0;

  // Track mouse position (used for checking if mouse is hovering over a player)
  canvas.addEventListener("mousemove", (e: MouseEvent) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Anti-aliasing in browsers smooths images, which can blur pixel art or low-res graphics
    ctx.imageSmoothingEnabled = false;

    myPlayer = users.find((user) => user.id === myPlayerId)!;
    if (myPlayer) {
      // Center camera on my player
      camera.cameraX = myPlayer.x - canvas.width / (2.2 * camera.zoomFactor);
      camera.cameraY = myPlayer.y - canvas.height / (2.2 * camera.zoomFactor);

      drawMap();

      handlePlayerMovement();

      drawOtherPlayers();

      drawMyPlayer();

      drawAllPlayerBanners();

      updateAnimation();

      drawFPS();

      checkIfPlayerIsInRoom();
    }

    // On MacOS use requestAnimationFrame, on other OS use setInterval
    if (userOs === "MacOS") {
      requestAnimationFrame(gameLoop);
    } else {
      setTimeout(gameLoop, refreshInterval);
    }
  }
  // end of gameLoop

  // HELPER FUNCTIONS

  async function drawMap() {
    drawTileMap(ctx, camera, WorldMapJson as TileMap, worldMap);
  }

  // Move my player but only if no other key is pressed(prevent diagonal movement). Also, if the user releases the second pressed key, the character should continue moving in the direction of the first pressed key

  function handlePlayerMovement() {
    if (keyPressOrder.length > 0) {
      const lastValidKey = keyPressOrder[keyPressOrder.length - 1];

      tempPlayerPosition.x = myPlayer.x;
      tempPlayerPosition.y = myPlayer.y;

      if (pressedKeys.w || pressedKeys.a || pressedKeys.s || pressedKeys.d) {
        switch (lastValidKey) {
          case "w":
            tempPlayerPosition.y -= speed;
            animationState = "walk-up";
            myPlayer.facingTo = "up";
            break;
          case "a":
            tempPlayerPosition.x -= speed;
            animationState = "walk-left";
            myPlayer.facingTo = "left";
            break;
          case "s":
            tempPlayerPosition.y += speed;
            animationState = "walk-down";
            myPlayer.facingTo = "down";
            break;
          case "d":
            tempPlayerPosition.x += speed;
            animationState = "walk-right";
            myPlayer.facingTo = "right";
            break;
        }
      }

      // Check for collision with other players
      let collisionWithOtherUsers = false;
      for (const user of users) {
        if (
          user.id !== myPlayerId &&
          isColliding(
            {
              x: tempPlayerPosition.x,
              y: tempPlayerPosition.y,
              width: PLAYER_SIZE,
              height: PLAYER_SIZE,
            },
            { x: user.x, y: user.y, width: PLAYER_SIZE, height: PLAYER_SIZE }
          )
        ) {
          collisionWithOtherUsers = true;
          break;
        }
      }
      if (!collisionWithOtherUsers) {
        myPlayer.x = tempPlayerPosition.x;
        myPlayer.y = tempPlayerPosition.y;
      }

      // Check for collision with map
      const collisionWithMap = checkPlayerCollisionWithWalls(
        ctx,
        WorldMapJson,
        camera,
        myPlayer.x,
        myPlayer.y,
        PLAYER_SIZE,
        PLAYER_SIZE
      );

      if (collisionWithMap) {
        // Stop player movement

        switch (lastValidKey) {
          case "w":
            myPlayer.y += speed;
            break;
          case "a":
            myPlayer.x += speed;
            break;
          case "s":
            myPlayer.y -= speed;
            break;
          case "d":
            myPlayer.x -= speed;
            break;
        }
      } else {
      }
    }
  }

  function drawOtherPlayers() {
    users.forEach((user) => {
      if (user.id !== myPlayerId) {
        const playerRect = {
          x: (user.x - camera.cameraX) * camera.zoomFactor,
          y: (user.y - camera.cameraY) * camera.zoomFactor,
          width: PLAYER_SIZE * camera.zoomFactor,
          height: PLAYER_SIZE * camera.zoomFactor,
        };

        // Check if mouse is over the player
        const isMouseOver = isColliding(
          { x: mouseX, y: mouseY, width: 1, height: 1 },
          playerRect
        );

        drawPlayer(
          ctx,
          loadAnImage(user.characterSprite),
          matchUserFacingToAnimationState(user.facingTo),
          1,
          user,
          camera.cameraX,
          camera.cameraY,
          camera.zoomFactor,
          isMouseOver
        );
      }
    });
  }

  function drawMyPlayer() {
    const playerRect = {
      x: (myPlayer.x - camera.cameraX) * camera.zoomFactor,
      y: (myPlayer.y - camera.cameraY) * camera.zoomFactor,
      width: PLAYER_SIZE * camera.zoomFactor,
      height: PLAYER_SIZE * camera.zoomFactor,
    };
    const isMouseOver = isColliding(
      { x: mouseX, y: mouseY, width: 1, height: 1 },
      playerRect
    );

    drawPlayer(
      ctx,
      loadAnImage(myPlayer?.characterSprite),
      animationState,
      animationFrame,
      myPlayer,
      camera.cameraX,
      camera.cameraY,
      camera.zoomFactor,
      isMouseOver
    );
  }

  // We need to draw the names separately because we want them to be drawn on top of everything else
  function drawAllPlayerBanners() {
    // Draw other players' names
    users.forEach((user) => {
      if (user.id !== myPlayerId) {
        drawPlayerBanner(ctx, user, camera.cameraX, camera.cameraY, camera.zoomFactor);
      }
    });

    // Draw your player's name
    drawPlayerBanner(ctx, myPlayer, camera.cameraX, camera.cameraY, camera.zoomFactor);
  }

  function updateAnimation() {
    [animationFrame, animationTick] = updateAnimationFrame(
      pressedKeys,
      animationState,
      animationFrame,
      animationTick
    );
  }

  function drawFPS() {
    // Calculate FPS
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // Draw FPS
    fps = Math.round(1000 / deltaTime);
    ctx.fillStyle = "black";
    ctx.font = "bold 16px Poppins";
    ctx.fillText(`FPS: ${fps}`, 10, 20);
  }

  function checkIfPlayerIsInRoom() {
    const { isPlayerInRoom, roomName } = checkPlayerInRoom(
      ctx,
      WorldMapJson,
      camera,
      myPlayer.x,
      myPlayer.y,
      PLAYER_SIZE,
      PLAYER_SIZE
    );

    if (isPlayerInRoom) {
      emitter.emit("playerInRoom", {
        isPlayerInARoom: true,
        roomName,
      });
    } else {
      emitter.emit("playerInRoom", {
        isPlayerInARoom: false,
        roomName: "",
      });
    }
  }

  // Start the game loop
  function initGameLoop() {
    if (
      users.length > 0 &&
      myPlayerId !== "" &&
      spaceMap !== "" &&
      initialSetupCompleted
    ) {
      gameLoop();

      //requestAnimationFrame(gameLoop);
    } else {
      const checkConditionsBeforeLoop = setInterval(() => {
        if (
          users.length > 0 &&
          myPlayerId !== "" &&
          spaceMap !== "" &&
          initialSetupCompleted
        ) {
          gameLoop();

          //requestAnimationFrame(gameLoop);

          clearInterval(checkConditionsBeforeLoop);

          // Emit event to notify Space.vue that the canvas is loaded
          emitter.emit("canvasLoaded");
        }
      }, 0);
    }
  }

  keyDownEventListener(canvas, pressedKeys, keyPressOrder, () => myPlayer);
  keyUpEventListener(canvas, pressedKeys, keyPressOrder, () => myPlayer);
  rightClickEventListener(canvas, camera, users, myPlayerId);
  wheelEventListener(canvas, camera);

  // Get right click move position confirmation from Space.vue and move the player
  emitter.on("rightClickPlayerMoveConfirmed", async (user) => {
    myPlayer.x = user.x;
    myPlayer.y = user.y;

    // Canvas loses focus after right click, so we need to focus it again
    canvas.focus();
  });

  // Get joystick move event from Joystick.vue and move the player
  emitter.on("joystickMove", async (direction: string) => {
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
      pressedKeys.w = false;
      pressedKeys.a = false;
      pressedKeys.s = false;
      pressedKeys.d = false;
      keyPressOrder = [];

      emitter.emit("playerMove", myPlayer);
    }
  });

  // Start the game loop
  initGameLoop();
}

export { createCanvasApp };
