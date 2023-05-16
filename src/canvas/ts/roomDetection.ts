import type { RoomsObjectLayerData } from "@/types/canvasTypes";

export function parseRoomsObjectLayerData(mapJson: any): RoomsObjectLayerData[] {
  const roomsObjectLayer = mapJson.layers.find(
    (layer: any) => layer.name === "RoomsObjectLayer"
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
  }));
}
