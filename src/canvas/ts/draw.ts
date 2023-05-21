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

// Zoom factor for resizing the map
const mapZoomFactor = 3;
const CHARACTER_SIZE = 64;

function drawShadow(
  ctx: CanvasRenderingContext2D,
  shadowX: number,
  shadowY: number,
  zoomFactor: number,
  isMouseOver: boolean
): void {
  const shadowSize = 64 / mapZoomFactor;
  const shadowOffsetX = 0;
  const shadowOffsetY = 4;
  ctx.drawImage(
    shadowSprite,
    shadowX + shadowOffsetX * zoomFactor,
    shadowY + shadowOffsetY * zoomFactor,
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
    (CHARACTER_SIZE / mapZoomFactor) * zoomFactor,
    (CHARACTER_SIZE / mapZoomFactor) * zoomFactor
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
  isMouseOver: boolean
): void {
  const characterX = (player.x - cameraX) * zoomFactor;
  const characterY = (player.y - cameraY) * zoomFactor;

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

  // Draw a border around the player
  if (isMouseOver) {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      characterX,
      characterY,
      (CHARACTER_SIZE / mapZoomFactor) * zoomFactor,
      (CHARACTER_SIZE / mapZoomFactor) * zoomFactor
    );
  }
}

// Player name background, player name, and user status
export function drawPlayerBanner(
  ctx: CanvasRenderingContext2D,
  player: User,
  cameraX: number,
  cameraY: number,
  zoomFactor: number
) {
  // Define constants
  const paddingValue = 10;
  const bannerHeightValue = 20;
  const statusRadiusValue = 6;
  const fontScaleFactor = 14;
  const bannerYOffsetFactor = 7;

  // Calculate character position
  const characterCenterX = player.x + zoomFactor;
  const characterX = (characterCenterX - cameraX) * zoomFactor;
  const characterY = (player.y - cameraY) * zoomFactor;

  // Calculate background position
  ctx.font = `${(fontScaleFactor / mapZoomFactor) * zoomFactor}px Poppins`;
  const userNameTextWidth = ctx.measureText(player.userName).width;
  const backgroundX = characterX - userNameTextWidth / 2.5; // Centered on character
  const backgroundY = characterY - bannerYOffsetFactor * zoomFactor;

  // Define banner parameters
  const padding = (paddingValue / mapZoomFactor) * zoomFactor;
  const backgroundHeight = (bannerHeightValue / mapZoomFactor) * zoomFactor;
  const backgroundWidth = userNameTextWidth + padding * 3; // added additional padding space

  // Draw player name background
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.beginPath();

  const semicircle_factor = 2;
  // Left half circle
  ctx.arc(
    backgroundX + backgroundHeight / semicircle_factor,
    backgroundY + backgroundHeight / semicircle_factor,
    backgroundHeight / semicircle_factor,
    Math.PI / semicircle_factor,
    (3 * Math.PI) / semicircle_factor
  );

  // Right half circle
  ctx.arc(
    backgroundX + backgroundWidth - backgroundHeight / semicircle_factor,
    backgroundY + backgroundHeight / semicircle_factor,
    backgroundHeight / semicircle_factor,
    (3 * Math.PI) / semicircle_factor,
    Math.PI / semicircle_factor
  );

  ctx.closePath();
  ctx.fill();

  // Draw user status icon
  const statusRadius = (statusRadiusValue * zoomFactor) / mapZoomFactor;
  ctx.fillStyle = userStatusColors(player.userStatus);
  ctx.beginPath();
  ctx.arc(backgroundX + padding, backgroundY + padding, statusRadius, 0, 2 * Math.PI);
  ctx.fill();

  // Draw player name
  ctx.fillStyle = "white";
  /*   ctx.fillText(
    player.userName,
    backgroundX + padding * 2,
    backgroundY + padding + statusRadius
  ); */
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
