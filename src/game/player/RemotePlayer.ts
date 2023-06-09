import Phaser from "phaser";
import type { User } from "@/types/canvasTypes";
import { Direction, UserConstants, Depths } from "../helpers/constants";
import { PlayerBanner } from "./PlayerBanner";

export default class RemotePlayer {
  private user: User;
  private remotePlayer!: Phaser.Physics.Arcade.Sprite;

  private playerBanner!: PlayerBanner;
  private playerBannerWidth!: number;
  private shadow!: Phaser.GameObjects.Sprite;

  constructor(private scene: Phaser.Scene, user: User) {
    this.user = user;
    this.createPlayer();
    this.playerBannerWidth = this.playerBanner.getBannerWidth();
  }

  private createPlayer() {
    // walk-down-0 is the name of the frame in the .json file
    this.remotePlayer = this.scene.physics.add
      .sprite(
        this.user.lastPosition.x,
        this.user.lastPosition.y,
        "character-sprite-name" /* this.user.id */, // sprite sheet name set in preload for each user
        "walk-down-0"
      )
      .setScale(UserConstants.PLAYER_SCALE)
      .setDepth(Depths.RemotePlayer);

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

    this.createShadow();
    this.createPlayerBanner();
    this.createAnimations();
  }

  private createAnimations() {
    const directions = Object.values(Direction);
    directions.forEach((direction) => {
      this.createIdleAnimation(direction);
    });
  }

  private createIdleAnimation(direction: Direction) {
    const animationKey = this.getAnimationKey(
      `remotePlayer${this.user.id}`,
      "idle",
      direction
    );

    // If the animation already exists, don't recreate it
    if (this.scene.anims.exists(animationKey)) return;
    this.scene.anims.create({
      key: animationKey,
      frames: [
        {
          key: this.user.id,
          frame: `walk-${direction}-0`,
        },
      ],
    });
  }

  private getAnimationKey(character: string, action: string, direction: Direction) {
    return `${character}-${action}-${direction}`;
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
      this.user.userPersonalMessage || "",
      "#ffffff",
      "#FFA5004d",
      Depths.RemotePlayerBanner
    );
    this.updatePlayerBanner();
  }

  updatePlayerBanner() {
    this.playerBanner.updatePosition(
      this.user.x - this.playerBannerWidth / 2,
      this.user.y - UserConstants.PLAYER_HUD_OFFSET.y
    );
  }

  private createShadow() {
    this.shadow = this.scene.add.sprite(0, 0, "shadow");
    this.shadow.setScale(4);
    this.shadow.setDepth(Depths.Shadow); // Render shadow below the player but above the map/background
    this.updateShadow();
  }

  private updateShadow() {
    this.shadow.setPosition(this.user.x, this.user.y + this.remotePlayer.height - 10);
  }

  public movePlayer(x: number, y: number, direction: Direction) {
    this.user.x = x;
    this.user.y = y;
    this.remotePlayer.setPosition(x, y);

    this.remotePlayer.anims.play(
      this.getAnimationKey(`remotePlayer${this.user.id}`, "idle", direction),
      true
    );
    this.updatePlayerBanner();
    this.updateShadow();
  }

  public destroyPlayer() {
    this.remotePlayer.destroy();
    this.playerBanner.destroy();
    this.shadow.destroy();
  }

  // Function to get the sprite. It can be used when you need to interact with the sprite (e.g., for collisions)
  public getPlayer() {
    return this.remotePlayer;
  }
}
