import { checkPlayerCollisionWithWalls } from "../collisionDetection";

self.onmessage = (event: MessageEvent) => {
  const { WorldMapJson, camera, tempPlayerX, tempPlayerY, playerWidth, playerHeight } =
    event.data;

  const collision = checkPlayerCollisionWithWalls(
    WorldMapJson,
    camera,
    tempPlayerX,
    tempPlayerY,
    playerWidth,
    playerHeight
  );

  self.postMessage(collision);
};
