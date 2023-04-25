import { characterAnimations } from "./animations";
import type { User } from "@/types/general";

function drawShadow(
  ctx: CanvasRenderingContext2D,
  shadowX: number,
  shadowY: number,
  zoomFactor: number,
  isMouseOver: boolean
): void {
  // Draw shadow
  const shadowRadius = 30 * zoomFactor;
  ctx.fillStyle = "rgba(200, 200, 200, 0.5)";
  ctx.beginPath();
  ctx.arc(
    shadowX + 48 * zoomFactor,
    shadowY + 80 * zoomFactor,
    shadowRadius,
    0,
    2 * Math.PI
  );
  ctx.closePath();

  // Draw shadow border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 4 * zoomFactor;
  ctx.beginPath();
  ctx.arc(
    shadowX + 48 * zoomFactor,
    shadowY + 80 * zoomFactor,
    shadowRadius,
    0,
    2 * Math.PI
  );
  ctx.closePath();
  if (isMouseOver) {
    ctx.fill();
    ctx.stroke();
  }
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
    24,
    24,
    shadowX,
    shadowY,
    96 * zoomFactor,
    96 * zoomFactor
  );
}

function drawPlayerNameBackground(
  ctx: CanvasRenderingContext2D,
  player: User,
  zoomFactor: number,
  backgroundX: number,
  backgroundY: number
): void {
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.font = `${14 * zoomFactor}px Poppins`;
  const userNameTextWidth = ctx.measureText(player.userName).width;
  const padding = 15 * zoomFactor;
  const backgroundHeight = 20 * zoomFactor;
  const backgroundWidth = userNameTextWidth + padding * 3;
  ctx.beginPath();
  ctx.arc(
    backgroundX + backgroundHeight / 2,
    backgroundY + backgroundHeight / 2,
    backgroundHeight / 2,
    Math.PI / 2,
    (3 * Math.PI) / 2
  );
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
  switch (userStatus) {
    case "online":
      ctx.fillStyle = "#2CC56F";
      break;
    case "busy":
      ctx.fillStyle = "orange";
      break;
    case "away":
      ctx.fillStyle = "gray";
      break;
    default:
      ctx.fillStyle = "gray";
  }
  ctx.beginPath();
  ctx.arc(statusX, statusY, statusRadius, 0, 2 * Math.PI);
  ctx.fill();
}

function drawPlayerName(
  ctx: CanvasRenderingContext2D,
  player: User,
  zoomFactor: number,
  backgroundX: number,
  backgroundY: number,
  padding: number
): void {
  ctx.fillStyle = "white";
  ctx.fillText(
    player.userName,
    backgroundX + 10 + padding,
    backgroundY * zoomFactor + 15
  );
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
  const shadowX = (player.x - cameraX - 8) * zoomFactor;
  const shadowY = (player.y - cameraY - 8) * zoomFactor;

  drawShadow(ctx, shadowX, shadowY, zoomFactor, isMouseOver);
  drawCharacter(ctx, characterImg, animation, frame, shadowX, shadowY, zoomFactor);

  const backgroundX =
    (player.x - cameraX - ctx.measureText(player.userName).width / 24) * zoomFactor;
  const backgroundY = (player.y - cameraY - characterImg.height / 4) * zoomFactor;

  drawPlayerNameBackground(ctx, player, zoomFactor, backgroundX, backgroundY);

  const padding = 15 * zoomFactor;
  drawUserStatusIcon(
    ctx,
    userStatus,
    zoomFactor,
    backgroundX + padding,
    backgroundY + (20 * zoomFactor) / 2
  );

  drawPlayerName(ctx, player, zoomFactor, backgroundX, backgroundY, padding);
}
