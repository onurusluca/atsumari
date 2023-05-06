import type { Rect, CollisionData } from "@/types/canvasTypes";

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

export function parseCollisionLayer(mapJson: any): CollisionData {
  const collisionLayer = mapJson.layers.find(
    (layer: any) => layer.name === "Collision"
  );
  if (!collisionLayer) {
    throw new Error("Collision layer not found");
  }

  const data = [];
  for (let y = 0; y < collisionLayer.height; y++) {
    const row = [];
    for (let x = 0; x < collisionLayer.width; x++) {
      row.push(collisionLayer.data[y * collisionLayer.width + x]);
    }
    data.push(row);
  }

  return {
    width: collisionLayer.width,
    height: collisionLayer.height,
    data: data,
  };
}
