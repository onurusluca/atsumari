import type { User } from "@/types/general";

import { Player } from "./Player";

// Camera
let cameraX = 0;
let cameraY = 0;


// My player
let myPlayer = {
  userName: "",
  x: 0,
  y: 0,
  facingTo: "down",
  isMoving: false,
};

// FPS
let frameX = 0;
let maxFrame = 3;
let elapsed = 0;

export default class TileMap {
  tileSize: number;
  img: HTMLImageElement;

  users: User[];
  myPlayerId: string;
  constructor(
    tileSize: number,
    CanvasImage: string,

    users: User[],
    myPlayerId: string

  ) {
    this.tileSize = tileSize;
    this.img = new Image();
    this.img.src = CanvasImage;

    this.users = users;
    this.myPlayerId = myPlayerId;
  }

  draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    console.log("draw");

    ctx.drawImage(
      this.img,
      0,
      0,
      this.img.width,
      this.img.height,
      -cameraX - this.img.height / 3.1,
      -cameraY - this.img.width / 3.6,
      this.img.width,
      this.img.height
    );

    // Draw players


  }

  #drawPlayer(canvas: HTMLCanvasElement, player: Player) {
        // Get my player
        myPlayer = this.users.find((user) => user.id === this.myPlayerId)!;
        // Center camera on player
        cameraX = myPlayer.x - canvas.width / 2;
        cameraY = myPlayer.y - canvas.height / 2;

        this.users.forEach((user) => {
  }

  /*
  didCollideWithEnvironment(x: number, y: number, direction: number) {} */
}
