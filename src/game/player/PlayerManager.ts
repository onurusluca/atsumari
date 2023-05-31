import LocalPlayer from "./LocalPlayer";
import RemotePlayer from "./RemotePlayers";
import { User } from "@/types/canvasTypes";
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

  updateUsers(newUsers: User[]) {
    newUsers.forEach((user) => {
      if (user.id !== authStore.user?.id && !this.remotePlayers[user.id]) {
        this.remotePlayers[user.id] = new RemotePlayer(this.scene, user);
      }
    });

    // Handle users leaving the game: remove their RemotePlayer instances
    Object.keys(this.remotePlayers).forEach((userId) => {
      if (!newUsers.some((user) => user.id === userId)) {
        delete this.remotePlayers[userId];
      }
    });
  }

  getLocalPlayer(): LocalPlayer {
    return this.localPlayer;
  }

  handlePlayerMovement() {
    this.localPlayer.handlePlayerMovement();
  }
}
