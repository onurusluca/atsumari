export type User = {
  id: string;
  userName: string;
  x: number;
  y: number;
  characterSprite: string;
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
  myCharacterSprite: string;
  initialSetupCompleted: boolean;
};

export type Camera = {
  cameraX: number;
  cameraY: number;
  zoomFactor: number;
};
