type TiledJSON = {
  layers: Array<{
    data: number[];
    height: number;
    width: number;
    name: string;
  }>;
};

export function tiledToKaboom(tiled: TiledJSON) {
  const layers = tiled.layers.map((layer) => {
    const grid = [];
    for (let i = 0; i < layer.height; i++) {
      const row = [];
      for (let j = 0; j < layer.width; j++) {
        row.push(layer.data[i * layer.width + j]);
      }
      grid.push(row);
    }
    return {
      name: layer.name,
      grid,
    };
  });

  return layers;
}
