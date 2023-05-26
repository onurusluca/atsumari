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
  gameMapJson: JSON;
  gameMapTileset: string;
  initialSetupCompleted: boolean;
};
