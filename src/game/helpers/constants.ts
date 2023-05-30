export enum Direction {
  Up = "up",
  Down = "down",
  Left = "left",
  Right = "right",
}

export enum ControlKeys {
  W = "W",
  A = "A",
  S = "S",
  D = "D",
}

export const PLAYER_INITIAL_POSITION = { x: 100, y: 100 };
export const PLAYER_SPEED = 350;
export const PLAYER_SCALE = 4;
export const PLAYER_BODY_SIZE = { width: 16, height: 16 };
export const PLAYER_BODY_OFFSET = { x: 1, y: 1 };
export const PLAYER_HUD_OFFSET = 15;
export const MAP_SCALE_FACTOR = 2;
