interface Position {
  readonly x: number;
  readonly y: number;
}

export const UserConstants = {
  PLAYER_INITIAL_POSITION: { x: 600, y: 600 } as Position,
  PLAYER_SPEED: 500 as const,
  PLAYER_SCALE: 3 as const,
  PLAYER_BODY_SIZE: { width: 15, height: 15 },
  PLAYER_BODY_OFFSET: { x: 1, y: 1 } as Position,
  PLAYER_HUD_OFFSET: { /*  x: 60, */ y: 70 } as Position,
};

export const MAP_SCALE_FACTOR: number = 1.5;

export const Depths = {
  // Higher number means on top
  Map: 0,
  Player: 4,
  PlayerBanner: 5,
  RemotePlayer: 3,
  RemotePlayerBanner: 5,
  Shadow: 1,

  /*
  my banner
  remote player banner
  my player
  remote player
  shadow
  */
};
