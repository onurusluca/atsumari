import Phaser from "phaser";
import type { User } from "@/types/canvasTypes";
import { UserConstants } from "../helpers/constants";
import { PlayerBanner } from "./PlayerBanner";

export default class RemotePlayer {
  private user: User;
  private remotePlayer!: Phaser.Physics.Arcade.Sprite;
  private playerBanner!: PlayerBanner;
  private playerBannerWidth!: number;

  constructor(private scene: Phaser.Scene, user: User) {
    this.user = user;
    this.createPlayer();
    this.playerBannerWidth = this.playerBanner.getBannerWidth();
  }

  createPlayer() {
    // walk-down-0 is the name of the frame in the .json file
    this.remotePlayer = this.scene.physics.add
      .sprite(
        this.user.lastPosition.x,
        this.user.lastPosition.y,
        this.user.id,
        "walk-down-0"
      )
      .setScale(UserConstants.PLAYER_SCALE)
      .setDepth(3);

    // Player hitbox
    const { body } = this.remotePlayer;
    body!.setSize(
      UserConstants.PLAYER_BODY_SIZE.width,
      UserConstants.PLAYER_BODY_SIZE.height
    );
    body!.setOffset(
      UserConstants.PLAYER_BODY_OFFSET.x,
      UserConstants.PLAYER_BODY_OFFSET.y
    );

    this.createPlayerBanner();
  }

  // Create name text above the player
  createPlayerBanner() {
    this.playerBanner = new PlayerBanner(
      this.scene,
      0,
      0,
      this.user.userStatus,
      this.user.userName,
      "remote",
      "I AM REMOTE!",
      "#ffffff",
      "#FFA5004d"
    );
    this.playerBanner.setScrollFactor(0);
    this.updatePlayerBanner();
  }

  private updatePlayerBanner() {
    this.playerBanner.updatePosition(
      this.remotePlayer.body!.center.x - this.playerBannerWidth / 2,
      this.remotePlayer.body!.center.y - UserConstants.PLAYER_HUD_OFFSET.y
    );
  }

  public movePlayer() {
    this.remotePlayer.setPosition(this.user.x, this.user.y);
    this.updatePlayerBanner();
  }

  // Function to get the sprite. It can be used when you need to interact with the sprite (e.g., for collisions)
  getPlayer() {
    return this.remotePlayer;
  }
}
