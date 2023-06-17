import Phaser from "phaser";
import { Direction, User } from "@/types/canvasTypes";
import { UserConstants, Depths } from "../helpers/constants";
import PlayerBanner from "./PlayerBanner";

export default class RemotePlayer {
  private readonly user: User;
  private remotePlayer!: Phaser.Physics.Arcade.Sprite;

  private playerBanner!: PlayerBanner;
  private playerBannerWidth!: number;
  private shadow!: Phaser.GameObjects.Sprite;
  private moving: boolean = false;

  constructor(private readonly scene: Phaser.Scene, user: User) {
    this.user = user;
    this.createPlayer();
    this.playerBannerWidth = this.playerBanner.getBannerWidth();
  }

  private createPlayer(): void {
    this.remotePlayer = this.scene.physics.add
      .sprite(
        this.user.lastPosition.x,
        this.user.lastPosition.y,
        this.user.id,
        "walk-down-0"
      )
      .setScale(UserConstants.PLAYER_SCALE)
      .setDepth(Depths.RemotePlayer);

    const { body } = this.remotePlayer;
    body?.setSize(
      UserConstants.PLAYER_BODY_SIZE.width,
      UserConstants.PLAYER_BODY_SIZE.height
    );
    body?.setOffset(
      UserConstants.PLAYER_BODY_OFFSET.x,
      UserConstants.PLAYER_BODY_OFFSET.y
    );

    this.createShadow();
    this.createPlayerBanner();
    this.createAnimations();
  }

  private createAnimations(): void {
    Object.values(Direction).forEach((direction) => {
      this.createAnimation("idle", direction);
      this.createAnimation("walk", direction);
    });
  }

  private createAnimation(action: string, direction: Direction): void {
    const animationKey = this.getAnimationKey(action, direction);

    if (this.scene.anims.exists(animationKey)) return;

    const config: Phaser.Types.Animations.Animation = {
      key: animationKey,
      frames: this.scene.anims.generateFrameNames(this.user.id, {
        prefix: `walk-${direction}-`,
        start: 0,
        end: action === "walk" ? 3 : 0,
        zeroPad: 1,
      }),
      frameRate: 10,
    };

    if (action === "walk") {
      config.repeat = -1;
    }

    this.scene.anims.create(config);
  }

  private getAnimationKey(action: string, direction: Direction): string {
    return `remotePlayer${this.user.id}-${action}-${direction}`;
  }

  private createPlayerBanner(): void {
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

  public updatePlayerBanner(): void {
    this.playerBanner.updatePosition(
      this.user.x - this.playerBannerWidth / 2,
      this.user.y - UserConstants.PLAYER_HUD_OFFSET.y
    );
  }

  private createShadow(): void {
    this.shadow = this.scene.add
      .sprite(0, 0, "shadow")
      .setScale(3)
      .setDepth(Depths.Shadow);
  }

  public updateShadow(): void {
    this.shadow.setPosition(this.user.x, this.user.y + this.remotePlayer.height - 10);
  }

  public movePlayer(x: number, y: number, direction: Direction): void {
    console.log("RemotePlayer movePlayer", x, y, direction);

    if (!direction) {
      console.error("Invalid direction:", direction);
      return;
    }

    this.user.x = x;
    this.user.y = y;
    this.remotePlayer.setPosition(x, y);

    this.remotePlayer.anims.play(this.getAnimationKey("walk", direction), true);
    this.moving = true;

    this.updatePlayerBanner();
    this.updateShadow();
  }

  public stopPlayer(direction: Direction): void {
    if (this.moving) {
      this.remotePlayer.anims.play(this.getAnimationKey("idle", direction), true);
    }

    this.moving = false;
  }

  public destroyPlayer(): void {
    this.remotePlayer.destroy();
    this.playerBanner.destroy();
    this.shadow.destroy();
  }

  public getPlayer(): Phaser.Physics.Arcade.Sprite {
    return this.remotePlayer;
  }
}
