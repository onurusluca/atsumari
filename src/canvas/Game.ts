/****************************************
 * IMPORTS
 ****************************************/
import { emitter } from "@/composables/useEmit";

import TileMap from "./TileMap";

// Types
import type { User } from "@/types/general";

/****************************************
 * DECLARATIONS
 ****************************************/

export async function createCanvasApp(
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
  }

  tileMap.setCanvasSize(canvas);

  // Initiate game loop
  setInterval(gameLoop, 1000 / canvasFrameRate);

  const response = await fetch("./images/world1.tmx");
  const text = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "application/xml");
  /*   const mapElement = doc.getElementsByTagName("map")[0];
    const tileWidth = Number(mapElement.getAttribute("tilewidth"));
    const tileHeight = Number(mapElement.getAttribute("tileheight"));
    const width = Number(mapElement.getAttribute("width"));
    const height = Number(mapElement.getAttribute("height"));
    const layers = Array.from(doc.getElementsByTagName("layer")).map((layerElement) => {
      const name = layerElement.getAttribute("name");
      const dataElement = layerElement.getElementsByTagName("data")[0];
      const data = dataElement
        .textContent!.trim()
        .split(",")
        .map((tile) => Number(tile));
      return { name, data };
    }); */
  console.log(doc);
}
