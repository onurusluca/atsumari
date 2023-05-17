import type { Camera } from "@/types/canvasTypes";
import { parseRoomsObjectLayerData } from "./utilities";

export function checkPlayerCollisionWithWalls(
  ctx: CanvasRenderingContext2D,
  WorldMapJson: any,
  camera: Camera,
  tempPlayerX: number,
  tempPlayerY: number,
  playerWidth: number,
  playerHeight: number
) {
  console.log("checkPlayerCollisionWithWalls");

  const wallsData = parseRoomsObjectLayerData(WorldMapJson, "CollisionObjectLayer");

  const tileWidth = WorldMapJson.tilewidth;
  const tileHeight = WorldMapJson.tileheight;

  const offsetYCorrection = 4; // Add an offset to the player's Y position

  const offsetX =
    (-camera.cameraX - (WorldMapJson.width * tileWidth) / 2) * camera.zoomFactor;
  const offsetY =
    (-camera.cameraY - (WorldMapJson.height * tileHeight) / 2) * camera.zoomFactor;

  const playerX = (tempPlayerX - camera.cameraX) * camera.zoomFactor;
  const playerY =
    (tempPlayerY - camera.cameraY + offsetYCorrection) * camera.zoomFactor;
  const playerRect = {
    x: playerX,
    y: playerY,
    width: playerWidth * camera.zoomFactor,
    height: playerHeight * camera.zoomFactor,
  };

  for (let i = 0; i < wallsData.length; i++) {
    const wall = wallsData[i];

    // Converting polygon coordinates to camera's view
    const polygon = wall.polygon.map((point: any) => ({
      x: (wall.x + point.x) * camera.zoomFactor + offsetX,
      y: (wall.y + point.y) * camera.zoomFactor + offsetY,
    }));

    // Debugging: Draw a border around each collision spot
    polygon.forEach((point: any) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI, false);
      ctx.fillStyle = "red";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#003300";
      ctx.stroke();
    });

    if (
      rectInPolygon(
        {
          x: playerRect.x,
          y: playerRect.y,
          width: playerWidth,
          height: playerHeight,
        },
        polygon
      ) ||
      rectInPolygon(
        {
          x: playerRect.x + playerWidth,
          y: playerRect.y + playerHeight,
          width: playerWidth,
          height: playerHeight,
        },
        polygon
      )
    ) {
      console.log("Player collided with wall: " + wall.name);

      // Debugging: Draw a border around the player
      ctx.beginPath();
      ctx.rect(playerRect.x, playerRect.y, playerRect.width, playerRect.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "red";
      ctx.stroke();

      return true;
    }
  }

  return false;
}

function pointInPolygon(point: any, vs: any) {
  var inside = false;
  for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    var xi = vs[i].x,
      yi = vs[i].y;
    var xj = vs[j].x,
      yj = vs[j].y;

    var intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

function rectInPolygon(rect: any, vs: any) {
  const points = [
    { x: rect.x, y: rect.y }, // top-left
    { x: rect.x + rect.width, y: rect.y }, // top-right
    { x: rect.x, y: rect.y + rect.height }, // bottom-left
    { x: rect.x + rect.width, y: rect.y + rect.height }, // bottom-right
  ];

  return points.some((point) => pointInPolygon(point, vs));
}
