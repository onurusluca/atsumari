import LocalPlayer from "./LocalPlayer";
import RemotePlayer from "./RemotePlayer";
import { User, Room, Direction } from "@/types/canvasTypes";
import { MAP_SCALE_FACTOR } from "../helpers/constants";

const EMITTER_PLAYER_IN_ROOM_EVENT = "playerInRoom";

export default class PlayerManager {
  private localPlayer!: LocalPlayer;
  private remotePlayers: Record<string, RemotePlayer> = {};
  private isPlayerInARoom: boolean = false;

  constructor(private scene: Phaser.Scene, private rooms: Room[]) {}

  public addLocalPlayer(user: User): void {
    this.localPlayer = new LocalPlayer(this.scene, user);
    console.log("New local player added. PlayerManager.ts");
  }

  public addRemotePlayer(newUser: User): void {
    this.remotePlayers[newUser.id] = new RemotePlayer(this.scene, newUser);
    /*
    this.remotePlayers[newUser.id].updatePlayerBanner();
    this.remotePlayers[newUser.id].updateShadow(); */

    console.log("New remote player added. PlayerManager.ts");
  }

  public destroyRemotePlayer(userId: string): void {
    this.remotePlayers[userId]?.destroyPlayer();
    delete this.remotePlayers[userId];
  }

  public moveRemotePlayer(
    id: string,
    x: number,
    y: number,
    direction: Direction
  ): void {
    console.log("Moving remote player. PlayerManager.ts", id, x, y, direction);

    this.remotePlayers[id]?.movePlayer(x, y, direction);
  }

  public stopRemotePlayer(id: string, direction: Direction): void {
    this.remotePlayers[id]?.stopPlayer(direction);
  }

  public handleLocalPlayerMovement(): void {
    this.localPlayer.handlePlayerMovement();

    const playerX = this.localPlayer.getPlayer().x;
    const playerY = this.localPlayer.getPlayer().y;
    const playerIsInARoom = this.rooms.some((room) =>
      this.isPlayerInRoom(room, playerX, playerY)
    );

    if (playerIsInARoom !== this.isPlayerInARoom) {
      this.isPlayerInARoom = playerIsInARoom;
      emitter.emit(EMITTER_PLAYER_IN_ROOM_EVENT, {
        isPlayerInARoom: this.isPlayerInARoom,
      });
    }
  }

  private isPlayerInRoom(room: Room, x: number, y: number): boolean {
    const roomX = room.x * MAP_SCALE_FACTOR;
    const roomY = room.y * MAP_SCALE_FACTOR;
    const roomWidth = room.width * MAP_SCALE_FACTOR;
    const roomHeight = room.height * MAP_SCALE_FACTOR;

    return x > roomX && x < roomX + roomWidth && y > roomY && y < roomY + roomHeight;
  }

  public getLocalPlayer(): LocalPlayer {
    return this.localPlayer;
  }

  public getRemotePlayers(): Record<string, RemotePlayer> {
    return this.remotePlayers;
  }

  public getRemotePlayer(id: string): RemotePlayer | undefined {
    return this.remotePlayers[id];
  }
}
