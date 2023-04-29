import { characterAnimations } from "./animations";
import type { User } from "@/types/general";
import { loadImage } from "./utilities";
import shadowImage from "../images/shadow.png";

// Load images
const [shadowSprite] = await Promise.all([loadImage(shadowImage)]);

function drawShadow(
  ctx: CanvasRenderingContext2D,
  shadowX: number,
  shadowY: number,
  zoomFactor: number,
  isMouseOver: boolean
): void {
  // Draw shadow
  const shadowRadiusX = 20 * zoomFactor;
  const shadowRadiusY = 10 * zoomFactor;
  const rotation = 0;
  const startAngle = 0;
  const endAngle = 2 * Math.PI;

  ctx.fillStyle = "#0000004b";
  ctx.beginPath();
  ctx.ellipse(
    shadowX + 32 * zoomFactor,
    shadowY + 62 * zoomFactor,
    shadowRadiusX,
    shadowRadiusY,
    rotation,
    startAngle,
    endAngle
  );
  ctx.closePath();
  ctx.fill();

  if (isMouseOver) {
    // Draw ellipse around the shadow
    const ellipseRadiusX = 20 * zoomFactor;
    const ellipseRadiusY = 10 * zoomFactor;
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(
      shadowX + 32 * zoomFactor,
      shadowY + 60 * zoomFactor,
      ellipseRadiusX,
      ellipseRadiusY,
      rotation,
      startAngle,
      endAngle
    );
    ctx.closePath();
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
    16,
    16,
    shadowX,
    shadowY,
    64 * zoomFactor,
    64 * zoomFactor
  );
}

// Draw player name
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

// Draw status icon
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
  const shadowX = (player.x - cameraX - 4) * zoomFactor;
  const shadowY = (player.y - cameraY - 4) * zoomFactor;

  drawShadow(ctx, shadowX, shadowY, zoomFactor, isMouseOver);
  drawCharacter(ctx, characterImg, animation, frame, shadowX, shadowY, zoomFactor);

  const backgroundX =
    (player.x - cameraX - ctx.measureText(player.userName).width / 16) * zoomFactor;
  const backgroundY = (player.y - cameraY - characterImg.height / 4) * zoomFactor;

  drawPlayerNameBackground(ctx, player, zoomFactor, backgroundX, backgroundY);

  const padding = 10 * zoomFactor;
  drawUserStatusIcon(
    ctx,
    userStatus,
    zoomFactor,
    backgroundX + padding,
    backgroundY + (20 * zoomFactor) / 2
  );

  drawPlayerName(ctx, player, zoomFactor, backgroundX, backgroundY, padding);
}
