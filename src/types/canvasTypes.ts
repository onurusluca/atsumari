export type User = {
  id: string;
  userName: string;
  x: number;
  y: number;
  characterSprite: HTMLImageElement;
  facingTo: string;
  userStatus: string;
};

export type CanvasAppOptions = {
  users: User[];
  myPlayerId: string;
  gameMapJson: TileMap;
  gameMapTileset: string;
  initialSetupCompleted: boolean;
};

export type TileMap = {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: Layer[];
};
