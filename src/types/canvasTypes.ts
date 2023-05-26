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
  speed: number;
  canvas: HTMLCanvasElement;
  canvasFrameRate: number;
  spaceMap: string;
  initialSetupCompleted: boolean;
};

export type RoomsObjectLayerData = {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  polyline: Array<{ x: number; y: number }>;
};

export type Layer = {
  id: number;
  name: string;
  data: number[];
  width: number;
  height: number;
};

export type TileMap = {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: Layer[];
};

export type Rectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};
