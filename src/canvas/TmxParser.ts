interface TilemapData {
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  layers: LayerData[];
}

interface LayerData {
  tiles: number[];
}

export function parseTmxFile(file: string | File): Promise<TilemapData> {
  return new Promise<TilemapData>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (!event.target?.result) {
        reject(new Error("Failed to load file"));
        return;
      }

      const xml = new DOMParser().parseFromString(
        event.target.result as string,
        "application/xml"
      );
      const map = xml.getElementsByTagName("map")[0];
      console.log(map);

      if (!map) {
        reject(new Error("Failed to parse tilemap"));
        return;
      }

      const width = parseInt(map.getAttribute("width")!);
      const height = parseInt(map.getAttribute("height")!);
      const tileWidth = parseInt(map.getAttribute("tilewidth")!);
      const tileHeight = parseInt(map.getAttribute("tileheight")!);

      const layers = Array.from(xml.getElementsByTagName("layer")).map((layer) => {
        const data = layer.getElementsByTagName("data")[0];
        const csv = data.textContent!.trim();
        const tiles = csv.split(",").map((x) => parseInt(x.trim(), 10));
        return { tiles };
      });

      resolve({ width, height, tileWidth, tileHeight, layers });
    };

    reader.onerror = () => {
      reject(new Error("Failed to load file"));
    };

    if (typeof file === "string") {
      reader.readAsText(new File([file], "file.tmx"));
    } else {
      reader.readAsText(file);
    }
  });
}
