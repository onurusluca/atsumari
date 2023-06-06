import LocalPlayer from "./LocalPlayer";
import RemotePlayer from "./RemotePlayers";
import type { User } from "@/types/canvasTypes";
import { MAP_SCALE_FACTOR } from "../helpers/constants";

const authStore = useAuthStore();

export default class PlayerManager {
  private localPlayer!: LocalPlayer;
  private remotePlayers: Record<string, RemotePlayer> = {};

  constructor(private scene: Phaser.Scene, users: User[], private rooms: [{}]) {
    this.initializePlayers(users);
  }

  private initializePlayers(users: User[]) {
    const myUserId = authStore.user?.id!;
    users.forEach((user) => {
      if (user.id === myUserId) {
        this.localPlayer = new LocalPlayer(this.scene, user);
      } else {
        this.remotePlayers[user.id] = new RemotePlayer(this.scene, user);
      }
    });
  }

  public addRemotePlayer(newUser: User) {
    // Create new remote player if it doesn't exist and the user is not the local player

    if (this.isUserLocal(newUser)) {
      this.remotePlayers[newUser.id] = new RemotePlayer(this.scene, newUser);
      this.remotePlayers[newUser.id].movePlayer(newUser);
    }
  }

  public removeRemotePlayer(userId: string) {
    this.remotePlayers[userId].destroyPlayer();
    delete this.remotePlayers[userId];
  }

  public initialMoveRemotePlayers(users: User[]) {
    users
      .filter((user) => !this.isUserLocal(user))
      .forEach((user) => this.remotePlayers[user.id].movePlayer(user));
  }

  public moveRemotePlayer(user: User) {
    if (this.remotePlayers[user.id]) {
      this.remotePlayers[user.id].movePlayer(user);
    }
  }

  public handleLocalPlayerMovement() {
    this.localPlayer.handlePlayerMovement();

    const playerX = this.localPlayer.getPlayer().x;
    const playerY = this.localPlayer.getPlayer().y;

    this.rooms.forEach((room) => {
      // Check if the player is in the room;
      const roomX = room.x * MAP_SCALE_FACTOR;
      const roomY = room.y * MAP_SCALE_FACTOR;
      const roomWidth = room.width * MAP_SCALE_FACTOR;
      const roomHeight = room.height * MAP_SCALE_FACTOR;

      const inRoomX = playerX > roomX && playerX < roomX + roomWidth;
      const inRoomY = playerY > roomY && playerY < roomY + roomHeight;

      if (inRoomX && inRoomY) {
        console.log(`Player is in room: ${room.name}`);

        emitter.emit("playerInRoom", { isPlayerInARoom: true, roomName: room.name });
      } else {
        emitter.emit("playerInRoom", {
          isPlayerInARoom: false,
          roomName: "",
        });
      }
    });
  }

  public getLocalPlayer(): LocalPlayer {
    return this.localPlayer;
  }

  public getRemotePlayers(): Record<string, RemotePlayer> {
    return this.remotePlayers;
  }

  private isUserLocal(user: User) {
    return authStore.user?.id === user.id;
  }
}
