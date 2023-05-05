type CollisionData = {
  width: number;
  height: number;
  data: number[][];
};

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
