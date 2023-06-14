import Phaser from "phaser";
import { UserConstants, Depths } from "../helpers/constants";
import { PlayerBanner } from "./PlayerBanner";
import { User, Direction, ControlKeys } from "@/types/canvasTypes";
import socket from "@/composables/useSocketIO";

const gameLocalStorage = useStorage("atsumari_game", {
  lastPosition: { x: 0, y: 0 },
});

export default class Player {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<ControlKeys, Phaser.Input.Keyboard.Key>;
  private keysDown: ControlKeys[] = [];

  private myPlayer!: Phaser.Physics.Arcade.Sprite;
  private myUser: User;

  private playerBanner!: PlayerBanner;
  private playerBannerWidth!: number;
  private shadow!: Phaser.GameObjects.Sprite;

  constructor(private scene: Phaser.Scene, myUser: User) {
    this.myUser = myUser;
    this.createPlayer();
    this.createControls();
    this.playerBannerWidth = this.playerBanner.getBannerWidth();
  }

  private createPlayer() {
    // walk-down-0 is the name of the frame in the .json file
    this.myPlayer = this.scene.physics.add
      .sprite(
        this.myUser.lastPosition.x,
        this.myUser.lastPosition.y,
        this.myUser.id /* this.myUser.id */, // sprite sheet name set in preload for each user
        "walk-down-0"
      )
      .setScale(UserConstants.PLAYER_SCALE)
      .setDepth(Depths.Player);

    // Player hitbox
    const { body } = this.myPlayer;
    body!.setSize(
      UserConstants.PLAYER_BODY_SIZE.width,
      UserConstants.PLAYER_BODY_SIZE.height
    );
    body!.setOffset(
      UserConstants.PLAYER_BODY_OFFSET.x,
      UserConstants.PLAYER_BODY_OFFSET.y
    );

    // Don't go out of the map
    this.myPlayer.setCollideWorldBounds(true);

    this.createAnimations();
    this.createPlayerBanner();
    this.createShadow();
  }

  private createAnimations() {
    const directions = Object.values(Direction);
    directions.forEach((direction) => {
      this.createWalkAnimation(direction);
      this.createIdleAnimation(direction);
    });
  }

  private createWalkAnimation(direction: Direction) {
    const animationKey = this.getAnimationKey("localPlayer", "walk", direction);
    this.scene.anims.create({
      key: animationKey,
      frames: this.scene.anims.generateFrameNames(this.myUser.id, {
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
    const animationKey = this.getAnimationKey("localPlayer", "idle", direction);
    this.scene.anims.create({
      key: animationKey,
      frames: [
        {
          key: this.myUser.id,
          frame: `walk-${direction}-0`,
        },
      ],
    });
  }

  private getAnimationKey(localPlayer: string, action: string, direction: Direction) {
    return `${localPlayer}-${action}-${direction}`;
  }

  // Create name text above the player
  private createPlayerBanner() {
    this.playerBanner = new PlayerBanner(
      this.scene,
      0,
      0,
      this.myUser.userStatus,
      this.myUser.userName,
      "admin",
      this.myUser.userPersonalMessage || "",
      "#ffffff",
      "#2020204d",
      Depths.PlayerBanner
    );
    this.updatePlayerBanner();
  }

  private updatePlayerBanner() {
    this.playerBanner.updatePosition(
      this.myPlayer.body!.center.x - this.playerBannerWidth / 2,
      this.myPlayer.body!.center.y - UserConstants.PLAYER_HUD_OFFSET.y
    );
  }

  private createShadow() {
    this.shadow = this.scene.add.sprite(this.myPlayer.x, this.myPlayer.y, "shadow");
    this.shadow.setScale(3);
    this.shadow.setDepth(Depths.Shadow); // Render shadow below the player but above the map/background
  }

  private updateShadow() {
    this.shadow.setPosition(
      this.myPlayer.body!.center.x,
      this.myPlayer.body!.center.y + this.myPlayer.height - 10
    );
  }

  private createControls() {
    this.cursors = this.scene.input.keyboard!.createCursorKeys();

    // WASD
    this.wasd = {
      [ControlKeys.W]: this.scene.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.W
      ),
      [ControlKeys.A]: this.scene.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.A
      ),
      [ControlKeys.S]: this.scene.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.S
      ),
      [ControlKeys.D]: this.scene.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.D
      ),
    };

    Object.entries(this.wasd).forEach(([direction, key]) => {
      key.on("down", () => {
        this.keysDown.push(direction as ControlKeys);
      });

      key.on("up", () => {
        this.keysDown = this.keysDown.filter((keyDown) => keyDown !== direction);
        if (this.keysDown.length === 0) {
          this.myPlayer.setVelocity(0);

          /*    socket.emit("playerMovement", {
            x: this.myPlayer.x,
            y: this.myPlayer.y,
            facingTo: this.myUser.facingTo,
          }); */

          // Emit player stopped moving to stop animation on other clients
          socket.emit("playerStop", {
            x: this.myPlayer.x,
            y: this.myPlayer.y,
            facingTo: this.myUser.facingTo,
          });

          // Save last position in local storage
          gameLocalStorage.value.lastPosition = {
            x: this.myPlayer.x,
            y: this.myPlayer.y,
          };
        }
      });
    });
  }

  public handlePlayerMovement() {
    const speed = UserConstants.PLAYER_SPEED * this.scene.game.loop.delta;
    let xVelocity = 0;
    let yVelocity = 0;
    let direction = null;

    if (this.keysDown.includes(ControlKeys.W)) {
      yVelocity -= speed;
      direction = Direction.Up;
      this.myUser.facingTo = "up";
    }

    if (this.keysDown.includes(ControlKeys.S)) {
      yVelocity += speed;
      direction = Direction.Down;
      this.myUser.facingTo = "down";
    }

    if (this.keysDown.includes(ControlKeys.A)) {
      xVelocity -= speed;
      direction = Direction.Left;
      this.myUser.facingTo = "left";
    }

    if (this.keysDown.includes(ControlKeys.D)) {
      xVelocity += speed;
      direction = Direction.Right;
      this.myUser.facingTo = "right";
    }

    if (direction) {
      this.movePlayer(xVelocity, yVelocity, direction);
    } else {
      // only stop the player if there's no keys pressed
      if (this.keysDown.length === 0) {
        this.stopPlayer();
      }
    }

    this.updatePlayerBanner();
    this.updateShadow();
  }

  movePlayer(xVelocity: number, yVelocity: number, direction: Direction) {
    // Stop any previous movement from the last frame
    this.myPlayer.setVelocity(0);

    const animationKey = this.getAnimationKey("localPlayer", "walk", direction);
    this.myPlayer.anims.play(animationKey, true);
    this.myPlayer.setVelocity(xVelocity, yVelocity);

    this.myUser.x = this.myPlayer.x;
    this.myUser.y = this.myPlayer.y;

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    this.myPlayer.body!.velocity.normalize().scale(UserConstants.PLAYER_SPEED);

    socket.emit("playerMovement", {
      x: this.myPlayer.x,
      y: this.myPlayer.y,
      facingTo: this.myUser.facingTo,
    });
  }

  private stopPlayer() {
    this.myPlayer.setVelocity(0, 0);
    const currentDirection = this.myPlayer.anims.currentAnim?.key?.split(
      "-"
    )[2] as Direction;
    if (currentDirection) {
      this.myPlayer.anims.play(
        this.getAnimationKey("localPlayer", "idle", currentDirection),
        true
      );
    }
  }

  public getPlayer() {
    return this.myPlayer;
  }
}
