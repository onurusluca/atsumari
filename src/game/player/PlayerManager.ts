import LocalPlayer from "./LocalPlayer";
import RemotePlayer from "./RemotePlayer";
import { User, Room, Direction } from "@/types/canvasTypes";
import { MAP_SCALE_FACTOR } from "../helpers/constants";

export default class PlayerManager {
  private localPlayer!: LocalPlayer;
  private remotePlayers: Record<string, RemotePlayer> = {};
  private isPlayerInARoom: boolean = false;

  constructor(private scene: Phaser.Scene, private rooms: Room[]) {}

  public addLocalPlayer(user: User) {
    this.localPlayer = new LocalPlayer(this.scene, user);

    console.log("New local player added. PlayerManager.ts");
  }

  public addRemotePlayer(newUser: User) {
    // Create new remote player if it doesn't exist and the user is not the local player

    this.remotePlayers[newUser.id] = new RemotePlayer(this.scene, newUser);
    this.remotePlayers[newUser.id].movePlayer(
      newUser.lastPosition.x,
      newUser.lastPosition.y,
      newUser.facingTo as Direction
    );

    console.log("New remote player added. PlayerManager.ts");
  }

  public destroyRemotePlayer(userId: string) {
    console.log(this.remotePlayers);

    if (this.remotePlayers[userId]) {
      this.remotePlayers[userId].destroyPlayer();
      delete this.remotePlayers[userId];
    } else {
      console.log(`No remote player with the id: ${userId}`);
    }
  }

  public moveRemotePlayer(id: string, x: number, y: number, direction: Direction) {
    if (this.remotePlayers[id]) {
      this.remotePlayers[id].movePlayer(x, y, direction);
    }
  }

  public handleLocalPlayerMovement() {
    this.localPlayer.handlePlayerMovement();

    const playerX = this.localPlayer.getPlayer().x;
    const playerY = this.localPlayer.getPlayer().y;
    let inRoom: Room | null = null;

    for (let room of this.rooms) {
      // Check if the player is in the room;
      const roomX = room.x * MAP_SCALE_FACTOR;
      const roomY = room.y * MAP_SCALE_FACTOR;
      const roomWidth = room.width * MAP_SCALE_FACTOR;
      const roomHeight = room.height * MAP_SCALE_FACTOR;

      const inRoomX = playerX > roomX && playerX < roomX + roomWidth;
      const inRoomY = playerY > roomY && playerY < roomY + roomHeight;

      if (inRoomX && inRoomY) {
        inRoom = room;
        break; // If player is found in a room, break the loop
      }
    }

    // If the player is in a room, emit an event
    if (inRoom !== null) {
      if (!this.isPlayerInARoom) {
        this.isPlayerInARoom = true;
        emitter.emit("playerInRoom", {
          isPlayerInARoom: true,
          roomName: inRoom.name,
        });
        console.log("Player is in a room. PlayerManager.ts");
      }
    } else if (this.isPlayerInARoom) {
      this.isPlayerInARoom = false;
      emitter.emit("playerInRoom", { isPlayerInARoom: false, roomName: "" });
      console.log("Player is not in a room. PlayerManager.ts");
    }
  }

  public getLocalPlayer(): LocalPlayer {
    return this.localPlayer;
  }

  public getRemotePlayers(): Record<string, RemotePlayer> {
    return this.remotePlayers as Record<string, RemotePlayer>;
  }
}
