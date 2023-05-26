// Types for canvas users array
export interface User {
  id: string;
  userName: string;
  x: number;
  y: number;
  facingTo: string;
  characterSprite: string;
  characterSpriteName?: string;
  userStatus: string;
  userPersonalMessage?: string;
}
