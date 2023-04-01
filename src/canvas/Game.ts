/****************************************
 * IMPORTS
 ****************************************/
import TileMap from "./TileMap";

import { emitter } from "@/composables/useEmit";

// Types
import type { User } from "@/types/general";

/****************************************
 * DECLARATIONS
 ****************************************/

export function createCanvasApp(
  // Data from parent(Space.vue)
  users: User[],
  myPlayerId: string,
  speed: number,
  canvas: HTMLCanvasElement,
  canvasFrameRate: number
) {
  const ctx = canvas.getContext("2d")!;

  const tileSize = 32;
  const velocity = 2;

  const tileMap = new TileMap(tileSize);
  const pacMan = tileMap.getPacman(velocity);

  // GAME LOOP
  function gameLoop() {
    tileMap.draw(ctx);
    pacMan!.draw(ctx);
  }

  tileMap.setCanvasSize(canvas);

  // Initiate game loop
  setInterval(gameLoop, 1000 / canvasFrameRate);
}
