import Phaser from "phaser";
import { Direction, User } from "@/types/canvasTypes";
import { UserConstants, Depths } from "../helpers/constants";
import { PlayerBanner } from "./PlayerBanner";

export default class RemotePlayer {
  private user: User;
  private remotePlayer!: Phaser.Physics.Arcade.Sprite;

  private playerBanner!: PlayerBanner;
  private playerBannerWidth!: number;
  private shadow!: Phaser.GameObjects.Sprite;
  private moving: boolean;

  constructor(private scene: Phaser.Scene, user: User) {
    this.user = user;
    this.createPlayer();
    this.playerBannerWidth = this.playerBanner.getBannerWidth();
    this.moving = false;
  }

  private createPlayer() {
    // walk-down-0 is the name of the frame in the .json file
    console.log("user", this.user);

    this.remotePlayer = this.scene.physics.add
      .sprite(
        this.user.lastPosition.x,
        this.user.lastPosition.y,
        this.user.id /* this.user.id */, // sprite sheet name set in preload for each user
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
      this.createWalkAnimation(direction); // Create walk animation for each direction
    });
  }

  private createWalkAnimation(direction: Direction) {
    const animationKey = this.getAnimationKey(
      `remotePlayer${this.user.id}`,
      "walk",
      direction
    );

    // If the animation already exists, don't recreate it
    if (this.scene.anims.exists(animationKey)) return;
    this.scene.anims.create({
      key: animationKey,
      frames: this.scene.anims.generateFrameNames(this.user.id, {
        prefix: `walk-${direction}-`,
        start: 0,
        end: 3,
        zeroPad: 1,
      }),
      frameRate: 8,
      repeat: -1,
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
      frameRate: 10,
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
  }

  updatePlayerBanner() {
    this.playerBanner.updatePosition(
      this.user.x - this.playerBannerWidth / 2,
      this.user.y - UserConstants.PLAYER_HUD_OFFSET.y
    );
  }

  private createShadow() {
    this.shadow = this.scene.add.sprite(0, 0, "shadow");
    this.shadow.setScale(3);
    this.shadow.setDepth(Depths.Shadow); // Render shadow below the player but above the map/background
  }

  private updateShadow() {
    this.shadow.setPosition(this.user.x, this.user.y + this.remotePlayer.height - 10);
  }

  public movePlayer(x: number, y: number, direction: Direction) {
    this.user.x = x;
    this.user.y = y;
    this.remotePlayer.setPosition(x, y);

    // Only start the walking animation if the player was not moving before
    this.remotePlayer.anims.play(
      this.getAnimationKey(`remotePlayer${this.user.id}`, "walk", direction),
      true
    );

    // Now the player is moving
    this.moving = true;

    this.updatePlayerBanner();
    this.updateShadow();
  }

  public stopPlayer(x: number, y: number, direction: Direction) {
    // Only play the idle animation if the player was moving before
    if (this.moving) {
      this.remotePlayer.anims.play(
        this.getAnimationKey(`remotePlayer${this.user.id}`, "idle", direction),
        true
      );
    }

    // Now the player is not moving
    this.moving = false;
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
