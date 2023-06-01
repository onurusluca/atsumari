// Types for canvas users array
export interface User {
  id: string;
  userName: string;
  x: number;
  y: number;
  facingTo: string;
  lastPosition: {
    x: number;
    y: number;
  };
  characterSprite: string;
  userStatus: string;
  userPersonalMessage?: string;
}

export type CanvasAppOptions = {
  gameMapJson: TileMap;
  gameMapTileset: string;
  users: User[];
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
