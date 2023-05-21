import type { Camera } from "@/types/canvasTypes";
import { parseRoomsObjectLayerData } from "../utilities";

function checkPlayerInRoom(
  WorldMapJson: any,
  camera: Camera,
  tempPlayerX: number,
  tempPlayerY: number,
  playerWidth: number,
  playerHeight: number
) {
  const roomsData = parseRoomsObjectLayerData(WorldMapJson, "RoomsObjectLayer");

  const tileWidth = WorldMapJson.tilewidth;
  const tileHeight = WorldMapJson.tileheight;

  const offsetYCorrection = 4; // Add an offset to the player's Y position

  const offsetX =
    (-camera.cameraX - (WorldMapJson.width * tileWidth) / 2) * camera.zoomFactor;
  const offsetY =
    (-camera.cameraY - (WorldMapJson.height * tileHeight) / 2) * camera.zoomFactor;

  const playerRect = {
    x: (tempPlayerX - camera.cameraX) * camera.zoomFactor,
    y: (tempPlayerY - camera.cameraY + offsetYCorrection) * camera.zoomFactor,
    width: playerWidth * camera.zoomFactor,
    height: playerHeight * camera.zoomFactor,
  };

  for (let i = 0; i < roomsData.length; i++) {
    const room = roomsData[i];
    const roomRect = {
      x: room.x * camera.zoomFactor + offsetX,
      y: room.y * camera.zoomFactor + offsetY,
      width: room.width * camera.zoomFactor,
      height: room.height * camera.zoomFactor,
    };

    if (
      playerRect.x >= roomRect.x &&
      playerRect.y >= roomRect.y &&
      playerRect.x + playerRect.width <= roomRect.x + roomRect.width &&
      playerRect.y + playerRect.height <= roomRect.y + roomRect.height
    ) {
      // drawRoomBorder(ctx, roomRect);
      return { isPlayerInRoom: true, roomName: room.name };
    }
  }

  return { isPlayerInRoom: false, roomName: "" };
}

// draw a border around the room
/* function drawRoomBorder(ctx: CanvasRenderingContext2D, roomRect: any) {
  ctx.strokeStyle = "#d846ef6e";
  ctx.lineWidth = 10;
  ctx.strokeRect(roomRect.x, roomRect.y, roomRect.width, roomRect.height);
} */

self.onmessage = (event) => {
  const { WorldMapJson, camera, tempPlayerX, tempPlayerY, playerWidth, playerHeight } =
    event.data;
  const { isPlayerInRoom, roomName } = checkPlayerInRoom(
    WorldMapJson,
    camera,
    tempPlayerX,
    tempPlayerY,
    playerWidth,
    playerHeight
  );
  self.postMessage({
    isPlayerInRoom: Boolean(isPlayerInRoom),
    roomName: String(roomName),
  });
};
