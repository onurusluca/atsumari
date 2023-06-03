import LocalPlayer from "./LocalPlayer";
import RemotePlayer from "./RemotePlayers";
import type { User } from "@/types/canvasTypes";

const authStore = useAuthStore();

export default class PlayerManager {
  private localPlayer!: LocalPlayer;
  private remotePlayers: Record<string, RemotePlayer> = {};

  constructor(private scene: Phaser.Scene, users: User[]) {
    this.createLocalPlayer(users);
    this.createRemotePlayers(users);
  }

  private createLocalPlayer(users: User[]) {
    const myUserId = authStore.user?.id!;
    const myUser = users.find((user) => user.id === myUserId);
    if (myUser) {
      this.localPlayer = new LocalPlayer(this.scene, myUser);
    }
  }

  private createRemotePlayers(users: User[]) {
    users.forEach((user) => {
      // Except for the local player
      if (user.id !== authStore.user?.id) {
        this.remotePlayers[user.id] = new RemotePlayer(this.scene, user);
      }
    });
  }

  public updateUsers(newUser: User) {
    this.remotePlayers[newUser.id] = new RemotePlayer(this.scene, newUser);
    console.log(this.remotePlayers);

    // Handle users leaving the game: remove their RemotePlayer instances
    Object.keys(this.remotePlayers).forEach((userId) => {
      if (!newUser.id.includes(userId)) {
        delete this.remotePlayers[userId];
      }
    });
  }

  public moveRemotePlayers() {
    Object.keys(this.remotePlayers).forEach((userId) => {
      if (userId !== authStore.user?.id) {
        this.remotePlayers[userId].movePlayer();
      }
    });
  }

  public getLocalPlayer(): LocalPlayer {
    return this.localPlayer;
  }

  public getRemotePlayers(): Record<string, RemotePlayer> {
    return this.remotePlayers;
  }

  public handlePlayerMovement() {
    this.localPlayer.handlePlayerMovement();
  }
}
