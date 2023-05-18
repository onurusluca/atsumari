import type { Camera } from "@/types/canvasTypes";
import { parseRoomsObjectLayerData } from "./utilities";

interface Point {
  x: number;
  y: number;
}

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

function lineIntersectsRect(p1: Point, p2: Point, rect: Rectangle) {
  return (
    lineIntersectsLine(
      p1,
      p2,
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.width, y: rect.y }
    ) ||
    lineIntersectsLine(
      p1,
      p2,
      { x: rect.x + rect.width, y: rect.y },
      { x: rect.x + rect.width, y: rect.y + rect.height }
    ) ||
    lineIntersectsLine(
      p1,
      p2,
      { x: rect.x + rect.width, y: rect.y + rect.height },
      { x: rect.x, y: rect.y + rect.height }
    ) ||
    lineIntersectsLine(
      p1,
      p2,
      { x: rect.x, y: rect.y + rect.height },
      { x: rect.x, y: rect.y }
    )
  );
}

function lineIntersectsLine(l1p1: Point, l1p2: Point, l2p1: Point, l2p2: Point) {
  const q =
    (l1p1.y - l2p1.y) * (l2p2.x - l2p1.x) - (l1p1.x - l2p1.x) * (l2p2.y - l2p1.y);
  const d =
    (l1p2.x - l1p1.x) * (l2p2.y - l2p1.y) - (l1p2.y - l1p1.y) * (l2p2.x - l2p1.x);

  if (d === 0) {
    return false;
  }

  const r = q / d;

  const q2 =
    (l1p1.y - l2p1.y) * (l1p2.x - l1p1.x) - (l1p1.x - l2p1.x) * (l1p2.y - l1p1.y);
  const s = q2 / d;

  return !(r < 0 || r > 1 || s < 0 || s > 1);
}

export function checkPlayerCollisionWithWalls(
  ctx: CanvasRenderingContext2D,
  WorldMapJson: any,
  camera: Camera,
  tempPlayerX: number,
  tempPlayerY: number,
  playerWidth: number,
  playerHeight: number
) {
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

    // Converting polyline coordinates to camera's view
    const polyline = wall.polyline.map((point: any) => ({
      x: (wall.x + point.x) * camera.zoomFactor + offsetX,
      y: (wall.y + point.y) * camera.zoomFactor + offsetY,
    }));

    // Debugging: Draw a border around each collision spot
    polyline.forEach((point: Point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI, false);
      ctx.fillStyle = "red";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#003300";
      ctx.stroke();
    });

    for (let j = 0; j < polyline.length - 1; j++) {
      if (lineIntersectsRect(polyline[j], polyline[j + 1], playerRect)) {
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
  }

  return false;
}
