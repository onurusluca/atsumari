type RoomLayer = {
  data: number[];
};

type TilePosition = {
  x: number;
  y: number;
};

export function isPlayerInRoom(
  roomLayer: RoomLayer,
  playerPosition: TilePosition,
  mapWidth: number
): boolean {
  const { data } = roomLayer;
  const { x, y } = playerPosition;

  const index = y * mapWidth + x;

  // A non-zero value means the player is in a room
  return data[index] !== 0;
}
