import { characterAnimations } from "./animations";
import type { User } from "@/types/general";
import { loadImage } from "./utilities";
import shadowImage from "../images/shadow.png";

// Load images
let shadowSprite: HTMLImageElement;
async function loadAssets(): Promise<void> {
  shadowSprite = await loadImage(shadowImage);
}
loadAssets();

function drawShadow(
  ctx: CanvasRenderingContext2D,
  shadowX: number,
  shadowY: number,
  zoomFactor: number,
  isMouseOver: boolean
): void {
  const shadowSize = 48;
  ctx.drawImage(
    shadowSprite,
    shadowX + 8,
    shadowY + 24,
    shadowSize * zoomFactor,
    shadowSize * zoomFactor
  );
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
    64 * zoomFactor,
    64 * zoomFactor
  );
}

function drawPlayerNameBackground(
  ctx: CanvasRenderingContext2D,
  textWidth: number,
  zoomFactor: number,
  backgroundX: number,
  backgroundY: number
): void {
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.font = `${14 * zoomFactor}px Poppins`;

  const padding = 10 * zoomFactor;
  const backgroundHeight = 20 * zoomFactor;
  const backgroundWidth = textWidth + padding * 3;

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
}

function drawUserStatusIcon(
  ctx: CanvasRenderingContext2D,
  userStatus: string,
  zoomFactor: number,
  statusX: number,
  statusY: number
): void {
  const statusRadius = 5 * zoomFactor;
  ctx.fillStyle = userStatusColors(userStatus);
  ctx.beginPath();
  ctx.arc(statusX, statusY, statusRadius, 0, 2 * Math.PI);
  ctx.fill();
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

function drawPlayerName(
  ctx: CanvasRenderingContext2D,
  playerName: string,
  zoomFactor: number,
  backgroundX: number,
  backgroundY: number,
  padding: number
): void {
  ctx.fillStyle = "white";
  ctx.fillText(playerName, backgroundX + 10 + padding, backgroundY * zoomFactor + 15);
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

  ctx.font = `${14 * zoomFactor}px Poppins`;
  const userNameTextWidth = ctx.measureText(player.userName).width;

  const backgroundX = characterX + (32 * zoomFactor - userNameTextWidth) / 2;
  const backgroundY = characterY - 30 * zoomFactor;

  drawPlayerNameBackground(
    ctx,
    userNameTextWidth,
    zoomFactor,
    backgroundX,
    backgroundY
  );

  const padding = 10 * zoomFactor;
  drawUserStatusIcon(
    ctx,
    userStatus,
    zoomFactor,
    backgroundX + padding,
    backgroundY + (20 * zoomFactor) / 2
  );

  drawPlayerName(ctx, player.userName, zoomFactor, backgroundX, backgroundY, padding);
}
