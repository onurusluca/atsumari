import { emitter } from "@/composables/useEmit";

import TileMap from "./TileMap";
import { KeyEventListener, MouseEventListener } from "./EventListeners";
import { Player, MyPlayer } from "./Player";

// Types
import type { User } from "@/types/general";

export function createCanvasApp(
  // Data from parent(Space.vue)
  users: User[],
  myPlayerId: string,
  speed: number,
  canvas: HTMLCanvasElement,
  canvasFrameRate: number
) {
  const ctx = canvas.getContext("2d")!;

  const tileSize = 16;
  const velocity = 2;

  const tileMap = new TileMap(tileSize);

  // GAME LOOP
  function gameLoop() {
    tileMap.draw(ctx);
    //    pacMan!.draw(ctx);
  }

  tileMap.setCanvasSize(canvas);

  // Initiate game loop
  setInterval(gameLoop, 1000 / canvasFrameRate);
}
