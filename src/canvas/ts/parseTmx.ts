import type { Camera } from "@/types/canvasTypes";

interface Layer {
  id: number;
  name: string;
  data: number[];
  width: number;
  height: number;
}

interface TileMap {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: Layer[];
}

export async function loadJson(url: string): Promise<TileMap> {
  const response = await fetch(url);
  const json = await response.json();
  return json as TileMap;
}

export async function drawTileMap(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  tileMap: TileMap,
  tilesetImage: HTMLImageElement
): Promise<void> {
  const tileWidth = tileMap.tilewidth;
  const tileHeight = tileMap.tileheight;

  const offsetX =
    (-camera.cameraX - (tileMap.width * tileWidth) / 2) * camera.zoomFactor;
  const offsetY =
    (-camera.cameraY - (tileMap.height * tileHeight) / 2) * camera.zoomFactor;

  for (const layer of tileMap.layers) {
    for (let y = 0; y < layer.height; y++) {
      for (let x = 0; x < layer.width; x++) {
        const tileId = layer.data[y * layer.width + x] - 1;
        if (tileId >= 0) {
          const tileX = (tileId * tileWidth) % tilesetImage.width;
          const tileY =
            Math.floor((tileId * tileWidth) / tilesetImage.width) * tileHeight;
          ctx.drawImage(
            tilesetImage,
            tileX,
            tileY,
            tileWidth,
            tileHeight,
            x * tileWidth * camera.zoomFactor + offsetX - 45,
            y * tileHeight * camera.zoomFactor + offsetY - 45,
            tileWidth * camera.zoomFactor,
            tileHeight * camera.zoomFactor
          );
        }
      }
    }
  }
}
