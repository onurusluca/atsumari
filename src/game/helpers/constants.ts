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

export const PLAYER_INITIAL_POSITION = { x: 500, y: 500 };
export const PLAYER_SPEED = 35;
export const PLAYER_SCALE = 2;
export const PLAYER_BODY_SIZE = { width: 15, height: 15 };
export const PLAYER_BODY_OFFSET = { x: 1, y: 1 };
export const PLAYER_HUD_OFFSET = 15;
