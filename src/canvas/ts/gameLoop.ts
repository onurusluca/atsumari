import { drawPlayer, drawWorld } from "./draw";
import { updateAnimationFrame } from "./animations";
import { matchUserFacingToAnimationState, isColliding } from "./utilities";
import type { User } from "@/types/general";
import type { Camera } from "@/types/canvasTypes";
export function gameLoop(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  myPlayer: User,
  users: User[],
  camera: Camera,
  characterImg: HTMLImageElement,
  characterImgMyPlayer: HTMLImageElement,
  worldImg: HTMLImageElement,
  pressedKeys: Record<string, boolean>,
  animationState: string,
  animationFrame: number,
  animationTick: number,
  mouseX: number,
  mouseY: number,
  speed: number,
  keyPressOrder: string[],
  userAgent: string,
  refreshInterval: number,
  lastTime: number,
  fps: number
) {
  // Your gameLoop function code goes here
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;

  if (myPlayer) {
    camera.cameraX = myPlayer.x - canvas.width / (2.2 * camera.zoomFactor);
    camera.cameraY = myPlayer.y - canvas.height / (2.2 * camera.zoomFactor);

    drawWorld(ctx, worldImg, camera);

    if (keyPressOrder.length > 0) {
      let newPlayerX = myPlayer.x;
      let newPlayerY = myPlayer.y;
      const lastValidKey = keyPressOrder[keyPressOrder.length - 1];

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

      const playerWidth = 48 * camera.zoomFactor;
      const playerHeight = 64 * camera.zoomFactor;
      let collision = false;
      for (const user of users) {
        if (
          user.id !== myPlayer.id &&
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

    users.forEach((user) => {
      if (user.id !== myPlayer.id) {
        const playerRect = {
          x: (user.x - camera.cameraX - 8) * camera.zoomFactor,
          y: (user.y - camera.cameraY - 8) * camera.zoomFactor,
          width: 96 * camera.zoomFactor,
          height: 96 * camera.zoomFactor,
        };

        const isMouseOver = isColliding(
          { x: mouseX, y: mouseY, width: 1, height: 1 },
          playerRect
        );

        const facingToAnimationState = matchUserFacingToAnimationState(user.facingTo);
        drawPlayer(
          ctx,
          characterImg,
          facingToAnimationState,
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

    const myPlayerRect = {
      x: (myPlayer.x - camera.cameraX - 8) * camera.zoomFactor,
      y: (myPlayer.y - camera.cameraY - 8) * camera.zoomFactor,
      width: 96 * camera.zoomFactor,
      height: 96 * camera.zoomFactor,
    };
    const isMouseOver = isColliding(
      { x: mouseX, y: mouseY, width: 1, height: 1 },
      myPlayerRect
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

    [animationFrame, animationTick] = updateAnimationFrame(
      pressedKeys,
      animationState,
      animationFrame,
      animationTick
    );
  }

  const currentTime = performance.now();
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  fps = Math.round(1000 / deltaTime);
  ctx.fillStyle = "black";
  ctx.font = "bold 16px Poppins";
  ctx.fillText(`FPS: ${fps}`, 10, 20);

  if (userAgent.indexOf("Firefox") > -1) {
    requestAnimationFrame(() =>
      gameLoop(
        ctx,
        canvas,
        myPlayer,
        users,
        camera,
        characterImg,
        characterImgMyPlayer,
        worldImg,
        pressedKeys,
        animationState,
        animationFrame,
        animationTick,
        mouseX,
        mouseY,
        speed,
        keyPressOrder,
        userAgent,
        refreshInterval,
        lastTime,
        fps
      )
    );
  } else {
    setTimeout(
      () =>
        gameLoop(
          ctx,
          canvas,
          myPlayer,
          users,
          camera,
          characterImg,
          characterImgMyPlayer,
          worldImg,
          pressedKeys,
          animationState,
          animationFrame,
          animationTick,
          mouseX,
          mouseY,
          speed,
          keyPressOrder,
          userAgent,
          refreshInterval,
          lastTime,
          fps
        ),
      refreshInterval
    );
  }
}
