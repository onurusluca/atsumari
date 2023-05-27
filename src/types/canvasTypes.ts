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

export type Layer = {
  data: number[];
  height: number;
  width: number;
  name: string;
  opacity: number;
  type: string;
  visible: boolean;
  x: number;
  y: number;
  properties: Property[];
};

export type Property = {
  name: string;
  type: string;
  value: string;
};
