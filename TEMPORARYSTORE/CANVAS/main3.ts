import { emitter } from "@/composables/useEmit";
import type { User } from "@/types/general";
import type { CanvasAppOptions, Camera } from "../types";
import { loadImage, isColliding } from "./utilities";
import { drawPlayer } from "./draw";
import { updateAnimationFrame } from "./animations";
import { keyDownEventListener, keyUpEventListener } from "./keyboardEvents";
import { rightClickEventListener, wheelEventListener } from "./mouseEvents";

export async function createCanvasApp(options: CanvasAppOptions) {
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

  const [worldImg, characterImg, characterImgMyPlayer] = await loadImages(
    spaceMap,
    myCharacterSprite
  );

  const camera = createCamera();
  let myPlayer = createMyPlayer();

  const keyPressData = {
    keyPressOrder: [] as string[],
    pressedKeys: { w: false, a: false, s: false, d: false },
  };

  let animationState = "walk-down";
  let animationFrame = 0;
  let animationTick = 0;

  let lastTime = performance.now();
  let fps = 0;

  const refreshInterval = 1000 / canvasFrameRate;
  const userAgent = navigator.userAgent;

  let mouseX = 0;
  let mouseY = 0;
  canvas.addEventListener("mousemove", updateMousePosition);

  function updateMousePosition(e: MouseEvent) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  if (isInitialSetupValid()) {
    startGameLoop();
  } else {
    waitForInitialSetup(startGameLoop);
  }

  const getCamera = () => {
    return {
      cameraX: myPlayer?.x - canvas.width / (2.2 * camera.zoomFactor),
      cameraY: myPlayer.y - canvas.height / (2.2 * camera.zoomFactor),
      zoomFactor: camera.zoomFactor,
    };
  };

  // LISTENERS
  keyDownEventListener(
    canvas,
    keyPressData.pressedKeys,
    keyPressData.keyPressOrder,
    () => myPlayer
  );
  keyUpEventListener(
    canvas,
    keyPressData.pressedKeys,
    keyPressData.keyPressOrder,
    () => myPlayer
  );
  rightClickEventListener(canvas, getCamera, users, myPlayerId);
  wheelEventListener(canvas, camera.zoomFactor);

  // Get right click move position confirmation
  emitter.on("rightClickPlayerMoveConfirmed", async (user) => {
    myPlayer.x = user.x - 36;
    myPlayer.y = user.y - 64;
    // Canvas loses focus after right click, so we need to focus it again
    canvas.focus();
  });

  function loadImages(spaceMap: string, myCharacterSprite: string) {
    return Promise.all([
      loadImage(spaceMap),
      loadImage(myCharacterSprite),
      loadImage(myCharacterSprite),
    ]);
  }

  function createCamera(): Camera {
    return {
      cameraX: 200,
      cameraY: 200,
      zoomFactor: 1,
    };
  }

  function createMyPlayer(): User {
    return {
      id: "",
      userName: "",
      x: 0,
      y: 0,
      characterSprite: "",
      facingTo: "",
      userStatus: "",
    };
  }

  function isInitialSetupValid() {
    return (
      users.length > 0 &&
      myPlayerId !== "" &&
      speed !== 0 &&
      spaceMap !== "" &&
      initialSetupCompleted
    );
  }

  function startGameLoop() {
    gameLoop();
  }

  function waitForInitialSetup(callback: () => void) {
    const checkConditionsBeforeLoop = setInterval(() => {
      if (isInitialSetupValid()) {
        callback();
        clearInterval(checkConditionsBeforeLoop);
        // Emit event to notify that the canvas is loaded
        emitter.emit("canvasLoaded");
      }
    }, 0);
  }

  // Remove this line:
  // waitForInitialSetup(gameLoop);

  function gameLoop() {
    clearCanvas();
    myPlayer = users.find((user) => user.id === myPlayerId)!;
    if (myPlayer) {
      updateCamera();
      drawWorld();
      handlePlayerMovement();
      drawOtherPlayers();
      drawMyPlayer();
      updateAnimation();
      drawFPS();
      requestNextFrame();
    }
  }

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function updateCamera() {
    camera.cameraX = myPlayer.x - canvas.width / (2.2 * camera.zoomFactor);
    camera.cameraY = myPlayer.y - canvas.height / (2.2 * camera.zoomFactor);
  }

  function drawWorld() {
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
  }

  function handlePlayerMovement() {
    if (keyPressData.keyPressOrder.length > 0) {
      let newPlayerX = myPlayer.x;
      let newPlayerY = myPlayer.y;
      const lastValidKey =
        keyPressData.keyPressOrder[keyPressData.keyPressOrder.length - 1];

      if (
        keyPressData.pressedKeys.w ||
        keyPressData.pressedKeys.a ||
        keyPressData.pressedKeys.s ||
        keyPressData.pressedKeys.d
      ) {
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

      if (!hasCollision(newPlayerX, newPlayerY)) {
        myPlayer.x = newPlayerX;
        myPlayer.y = newPlayerY;
      }
    }
  }

  function hasCollision(newPlayerX: number, newPlayerY: number): boolean {
    const playerWidth = 64 * camera.zoomFactor;
    const playerHeight = 64 * camera.zoomFactor;
    return users.some(
      (user) =>
        user.id !== myPlayerId &&
        isColliding(
          { x: newPlayerX, y: newPlayerY, width: playerWidth, height: playerHeight },
          { x: user.x, y: user.y, width: playerWidth, height: playerHeight }
        )
    );
  }

  function drawOtherPlayers() {
    users.forEach((user) => {
      if (user.id !== myPlayerId) {
        const playerRect = getPlayerRect(user);
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
    const playerRect = getPlayerRect(myPlayer);
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

  function getPlayerRect(player: User) {
    return {
      x: (player.x - camera.cameraX - 8) * camera.zoomFactor,
      y: (player.y - camera.cameraY - 8) * camera.zoomFactor,
      width: 96 * camera.zoomFactor,
      height: 96 * camera.zoomFactor,
    };
  }

  function updateAnimation() {
    [animationFrame, animationTick] = updateAnimationFrame(
      keyPressData.pressedKeys,
      animationState,
      animationFrame,
      animationTick
    );
  }

  function drawFPS() {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    fps = Math.round(1000 / deltaTime);
    ctx.fillStyle = "black";
    ctx.font = "bold 16px Poppins";
    ctx.fillText(`FPS: ${fps}`, 10, 20);
  }
  function requestNextFrame() {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;
    const timeToWait = Math.max(0, refreshInterval - deltaTime);
    setTimeout(gameLoop, timeToWait);
  }

  waitForInitialSetup(gameLoop);
}
