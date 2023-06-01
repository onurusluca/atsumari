import Phaser from "phaser";
import { User } from "@/types/canvasTypes";
import { Direction, ControlKeys, UserConstants } from "../helpers/constants";
import { PlayerBanner } from "./PlayerBanner";

export default class RemotePlayer {
  private user: User;
  private remotePlayer!: Phaser.Physics.Arcade.Sprite;
  private playerBanner!: PlayerBanner;

  constructor(private scene: Phaser.Scene, user: User) {
    this.user = user;
    this.createPlayer();
  }

  private createPlayer() {
    // walk-down-0 is the name of the frame in the .json file
    this.remotePlayer = this.scene.physics.add
      .sprite(
        this.user.lastPosition.x,
        this.user.lastPosition.y,
        this.user.id,
        "walk-down-0"
      )
      .setScale(UserConstants.PLAYER_SCALE);

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
  private createPlayerBanner() {
    this.playerBanner = new PlayerBanner(
      this.scene,
      0,
      0,
      this.user.userStatus,
      this.user.userName,
      "remote",
      "Hello, world!",
      "#ffffff",
      "#2020204d"
    );
    this.updatePlayerBanner();
  }

  private updatePlayerBanner() {
    this.playerBanner.updatePosition(
      this.remotePlayer.body!.center.x - this.playerBanner.getBannerWidth() / 2,
      this.remotePlayer.body!.center.y - UserConstants.PLAYER_HUD_OFFSET.y
    );
  }

  public movePlayer() {
    this.remotePlayer.setPosition(this.user.x, this.user.y);
  }

  // Function to get the sprite. It can be used when you need to interact with the sprite (e.g., for collisions)
  getPlayer() {
    return this.remotePlayer;
  }

  // ... rest of the methods
}
