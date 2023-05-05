import { characterAnimations } from "./animations";
import type { User } from "@/types/general";
import { loadImage } from "./utilities";
import shadowImage from "../images/shadow.png";
import type { Camera, TileMap } from "@/types/canvasTypes";
// Load images
let shadowSprite: HTMLImageElement;
async function loadAssets(): Promise<void> {
  shadowSprite = await loadImage(shadowImage);
}
loadAssets();

const mapZoomFactor = 3;

function drawShadow(
  ctx: CanvasRenderingContext2D,
  shadowX: number,
  shadowY: number,
  zoomFactor: number,
  isMouseOver: boolean
): void {
  const shadowSize = 48 / mapZoomFactor;
  ctx.drawImage(
    shadowSprite,
    shadowX + 3 * zoomFactor,
    shadowY + 8 * zoomFactor,
    shadowSize * zoomFactor,
    shadowSize * zoomFactor
  );

  //TODO: Do something on mouse over
}

function drawCharacter(
  ctx: CanvasRenderingContext2D,
  characterImg: HTMLImageElement,
  animation: string,
  frame: number,
  shadowX: number,
  shadowY: number,
  zoomFactor: number
): void {
  const frameCoords = characterAnimations[animation][frame];
  ctx.drawImage(
    characterImg,
    frameCoords[0],
    frameCoords[1],
    16,
    16,
    shadowX,
    shadowY,
    (64 / mapZoomFactor) * zoomFactor,
    (64 / mapZoomFactor) * zoomFactor
  );
}

function userStatusColors(userStatus: string): string {
  switch (userStatus) {
    case "online":
      return "#2CC56F";
    case "busy":
      return "orange";
    case "away":
      return "gray";
    default:
      return "gray";
  }
}

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  characterImg: HTMLImageElement,
  animation: string,
  frame: number,
  player: User,
  cameraX: number,
  cameraY: number,
  zoomFactor: number,
  userStatus: string,
  isMouseOver: boolean
): void {
  const characterX = (player.x - cameraX - 4) * zoomFactor;
  const characterY = (player.y - cameraY - 4) * zoomFactor;

  drawShadow(ctx, characterX, characterY, zoomFactor, isMouseOver);
  drawCharacter(
    ctx,
    characterImg,
    animation,
    frame,
    characterX,
    characterY,
    zoomFactor
  );
}

// Player name background, player name, and user status
export function drawPlayerBanner(
  ctx: CanvasRenderingContext2D,
  player: User,
  cameraX: number,
  cameraY: number,
  zoomFactor: number
) {
  // Calculate character position
  const characterX = (player.x - cameraX) * zoomFactor;
  const characterY = (player.y - cameraY) * zoomFactor;

  // Calculate background position
  const userNameTextWidth = ctx.measureText(player.userName).width;
  const backgroundX = characterX + (4 * zoomFactor - userNameTextWidth) / 2;
  const backgroundY = characterY - 14 * zoomFactor;

  // Draw player name background
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.font = `${(14 / mapZoomFactor) * zoomFactor}px Poppins`;

  const padding = (10 / mapZoomFactor) * zoomFactor;
  const backgroundHeight = (20 / mapZoomFactor) * zoomFactor;
  const playerNameTextWidth = ctx.measureText(player.userName).width;
  const backgroundWidth = playerNameTextWidth + padding * 3;

  ctx.beginPath();

  // Left half circle
  ctx.arc(
    backgroundX + backgroundHeight / 2,
    backgroundY + backgroundHeight / 2,
    backgroundHeight / 2,
    Math.PI / 2,
    (3 * Math.PI) / 2
  );

  // Right half circle
  ctx.arc(
    backgroundX + backgroundWidth - backgroundHeight / 2,
    backgroundY + backgroundHeight / 2,
    backgroundHeight / 2,
    (3 * Math.PI) / 2,
    Math.PI / 2
  );

  ctx.closePath();
  ctx.fill();

  // Draw user status icon
  const statusRadius = (6 * zoomFactor) / mapZoomFactor;
  ctx.fillStyle = userStatusColors(player.userStatus);
  ctx.beginPath();
  ctx.arc(
    backgroundX + padding,
    backgroundY + (7 * zoomFactor) / 2,
    statusRadius,
    0,
    2 * Math.PI
  );
  ctx.fill();

  // Draw player name
  ctx.fillStyle = "white";
  ctx.font = `${(14 / mapZoomFactor) * zoomFactor}px Poppins`;
  ctx.fillText(
    player.userName,
    backgroundX + padding * 2,
    backgroundY + 5 * zoomFactor
  );
}

// Draw the map
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
            x * tileWidth * camera.zoomFactor + offsetX,
            y * tileHeight * camera.zoomFactor + offsetY,
            tileWidth * camera.zoomFactor,
            tileHeight * camera.zoomFactor
          );
        }
      }
    }
  }
}
