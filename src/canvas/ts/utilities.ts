import type { Rect, RoomsObjectLayerData } from "@/types/canvasTypes";

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = src;
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
  });
}

export function isColliding(rect1: Rect, rect2: Rect): boolean {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

export function matchUserFacingToAnimationState(facingTo: string): string {
  switch (facingTo) {
    case "up":
      return "walk-up";
    case "left":
      return "walk-left";
    case "down":
      return "walk-down";
    case "right":
      return "walk-right";
    default:
      return "walk-down";
  }
}

// What to do when the player is in the room
export function handleInRoomState(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
) {
  // Draw a transparent black rectangle over the canvas except for the room
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Parse the layers of the tile map from the .json file
export function parseRoomsObjectLayerData(
  mapJson: any,
  objectLayerName: string
): RoomsObjectLayerData[] {
  const roomsObjectLayer = mapJson.layers.find(
    (layer: any) => layer.name === objectLayerName
  );
  if (!roomsObjectLayer) {
    throw new Error("Rooms object layer not found");
  }

  return roomsObjectLayer.objects.map((room: any) => ({
    id: room.id,
    name: room.name,
    x: room.x,
    y: room.y,
    width: room.width,
    height: room.height,
    polyline: room.polyline,
  }));
}
