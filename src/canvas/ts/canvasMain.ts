import { emitter } from "@/composables/useEmit";
import type { User } from "@/types/general";
import type { CanvasAppOptions, Camera } from "@/types/canvasTypes";

import {
  loadImage,
  isColliding,
  matchUserFacingToAnimationState,
  parseCollisionLayer,
} from "./utilities";
import { drawTileMap, drawPlayerBanner, drawPlayer } from "./draw";
import { updateAnimationFrame } from "./animations";
import { keyDownEventListener, keyUpEventListener } from "./keyboardEvents";
import { rightClickEventListener, wheelEventListener } from "./mouseEvents";

import WorldMapJson from "../images/newworld.json";
import WorldMapTileset from "../images/tileset.png";

async function createCanvasApp(options: CanvasAppOptions): Promise<void> {
  const {
    users,
    myPlayerId,
    speed,
    canvas,
    canvasFrameRate,
    spaceMap,
    myCharacterSprite,
    initialSetupCompleted,
  } = options;

  const ctx = canvas.getContext("2d")!;

  const [characterImg, characterImgMyPlayer, worldMap] = await Promise.all([
    loadImage(myCharacterSprite),
    loadImage(myCharacterSprite),
    loadImage(WorldMapTileset),
  ]);

  let camera: Camera = {
    cameraX: 200,
    cameraY: 200,
    zoomFactor: 3,
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

  // FPS limiting
  let lastUpdateTime = 0;
  const frameDuration = 1000 / canvasFrameRate;

  let mouseX = 0;
  let mouseY = 0;

  const collisionData = parseCollisionLayer(WorldMapJson);

  // Track mouse position (used for checking if mouse is hovering over a player)
  canvas.addEventListener("mousemove", (e: MouseEvent) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function gameLoop(timestamp: number) {
    // Calculate the elapsed time since the last update
    let elapsedTime = timestamp - lastUpdateTime;

    if (elapsedTime >= frameDuration) {
      // Clear the canvas before drawing to prevent ghosting effect
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

        drawAllPlayerNames();

        updateAnimation();

        drawFPS();
      }
      lastUpdateTime = timestamp;
    }

    requestAnimationFrame(gameLoop);
  }

  // HELPER FUNCTIONS

  async function drawMap() {
    drawTileMap(ctx, camera, WorldMapJson, worldMap);
    // drawCollisionSpots(ctx, collisionData, camera);
  }

  // Move my player but only if no other key is pressed(prevent diagonal movement). Also, if the user releases the second pressed key, the character should continue moving in the direction of the first pressed key
  function handlePlayerMovement() {
    if (keyPressOrder.length > 0) {
      let newPlayerX = myPlayer.x;
      let newPlayerY = myPlayer.y;
      const lastValidKey = keyPressOrder[keyPressOrder.length - 1];

      let tempPlayerX = newPlayerX;
      let tempPlayerY = newPlayerY;

      if (pressedKeys.w || pressedKeys.a || pressedKeys.s || pressedKeys.d) {
        switch (lastValidKey) {
          case "w":
            tempPlayerY -= speed;
            animationState = "walk-up";
            myPlayer.facingTo = "up";
            break;
          case "a":
            tempPlayerX -= speed;
            animationState = "walk-left";
            myPlayer.facingTo = "left";
            break;
          case "s":
            tempPlayerY += speed;
            animationState = "walk-down";
            myPlayer.facingTo = "down";
            break;
          case "d":
            tempPlayerX += speed;
            animationState = "walk-right";
            myPlayer.facingTo = "right";
            break;
        }
      }

      const playerWidth = (18 * camera.zoomFactor) / 3;
      const playerHeight = (22 * camera.zoomFactor) / 3;
      let collisionWithOtherUsers = false;
      for (const user of users) {
        if (
          user.id !== myPlayerId &&
          isColliding(
            {
              x: tempPlayerX,
              y: tempPlayerY,
              width: playerWidth,
              height: playerHeight,
            },
            { x: user.x, y: user.y, width: playerWidth, height: playerHeight }
          )
        ) {
          collisionWithOtherUsers = true;
          break;
        }
      }

      const mapCollision = checkCollisionWithMap(
        tempPlayerX,
        tempPlayerY,
        playerWidth,
        playerHeight
      );

      if (!collisionWithOtherUsers) {
        myPlayer.x = tempPlayerX;
        myPlayer.y = tempPlayerY;
      }
      if (mapCollision) {
        console.log("map collision");
        emitter.emit("playerInRoom", true);
      } else {
        emitter.emit("playerInRoom", false);
      }

      // console.log(`x: ${myPlayer.x}, y: ${myPlayer.y}`);
    }
  }

  function drawOtherPlayers() {
    users.forEach((user) => {
      if (user.id !== myPlayerId) {
        const playerRect = {
          x: (user.x - camera.cameraX) * camera.zoomFactor,
          y: (user.y - camera.cameraY) * camera.zoomFactor,
          width: 18 * camera.zoomFactor,
          height: 18 * camera.zoomFactor,
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
  }

  function drawMyPlayer() {
    const playerRect = {
      x: (myPlayer.x - camera.cameraX) * camera.zoomFactor,
      y: (myPlayer.y - camera.cameraY) * camera.zoomFactor,
      width: 18 * camera.zoomFactor,
      height: 18 * camera.zoomFactor,
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
  }

  // We need to draw the names separately because we want them to be drawn on top of everything else
  function drawAllPlayerNames() {
    // Draw other players' names

    users.forEach((user) => {
      if (user.id !== myPlayerId) {
        drawPlayerBanner(ctx, user, camera.cameraX, camera.cameraY, camera.zoomFactor);
      }
    });

    // Draw your player's name

    //FIXME: For some reason, players' names won't stay in place
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

  /*   function drawCollisionSpots(
    ctx: CanvasRenderingContext2D,
    collisionData: CollisionData,
    camera: Camera
  ) {
    const tileWidth = WorldMapJson.tilewidth;
    const tileHeight = WorldMapJson.tileheight;

    const offsetX =
      (-camera.cameraX - (WorldMapJson.width * WorldMapJson.tilewidth) / 2) *
      camera.zoomFactor;
    const offsetY =
      (-camera.cameraY - (WorldMapJson.height * WorldMapJson.tileheight) / 2) *
      camera.zoomFactor;

    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    for (let y = 0; y < collisionData.height; y++) {
      for (let x = 0; x < collisionData.width; x++) {
        if (collisionData.data[y][x] !== 0) {
          ctx.fillRect(
            x * tileWidth * camera.zoomFactor + offsetX,
            y * tileHeight * camera.zoomFactor + offsetY,
            tileWidth * camera.zoomFactor,
            tileHeight * camera.zoomFactor
          );
        }
      }
    }
  } */

  function checkCollisionWithMap(
    tempPlayerX: number,
    tempPlayerY: number,
    playerWidth: number,
    playerHeight: number
  ) {
    const tileWidth = WorldMapJson.tilewidth;
    const tileHeight = WorldMapJson.tileheight;

    const offsetYCorrection = 4; // Add an offset to the player's Y position

    const offsetX =
      (-camera.cameraX - (WorldMapJson.width * WorldMapJson.tilewidth) / 2) *
      camera.zoomFactor;
    const offsetY =
      (-camera.cameraY - (WorldMapJson.height * WorldMapJson.tileheight) / 2) *
      camera.zoomFactor;

    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    for (let y = 0; y < collisionData.height; y++) {
      for (let x = 0; x < collisionData.width; x++) {
        // Check if the player is colliding with the map
        if (collisionData.data[y][x] !== 0) {
          const tileRect = {
            x: x * tileWidth * camera.zoomFactor + offsetX,
            y: y * tileHeight * camera.zoomFactor + offsetY,
            width: tileWidth * camera.zoomFactor,
            height: tileHeight * camera.zoomFactor,
          };

          const playerRect = {
            x: (tempPlayerX - camera.cameraX) * camera.zoomFactor,
            y: (tempPlayerY - camera.cameraY + offsetYCorrection) * camera.zoomFactor,
            width: playerWidth,
            height: playerHeight,
          };
          if (isColliding(playerRect, tileRect)) {
            return true;
          }
        }
      }
    }
    return false; // No collision detected
  }

  // Start the game loop
  function initGameLoop() {
    if (
      users.length > 0 &&
      myPlayerId !== "" &&
      spaceMap !== "" &&
      initialSetupCompleted
    ) {
      requestAnimationFrame(gameLoop);
    } else {
      const checkConditionsBeforeLoop = setInterval(() => {
        if (
          users.length > 0 &&
          myPlayerId !== "" &&
          spaceMap !== "" &&
          initialSetupCompleted
        ) {
          requestAnimationFrame(gameLoop);
          clearInterval(checkConditionsBeforeLoop);

          // Emit event to notify Space.vue that the canvas is loaded
          emitter.emit("canvasLoaded");
        }
      }, 0);
    }
  }

  /*   function getCamera(): Camera {
    return {
      cameraX: myPlayer?.x - canvas.width / (2.2 * camera.zoomFactor),
      cameraY: myPlayer.y - canvas.height / (2.2 * camera.zoomFactor),
      zoomFactor: camera.zoomFactor,
    };
  } */

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
