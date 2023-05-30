import Phaser from "phaser";
import { Direction, ControlKeys, UserConstants } from "./helpers/constants";
import { PlayerBanner } from "./PlayerBanner";

export default class Player {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<ControlKeys, Phaser.Input.Keyboard.Key>;
  private myPlayer!: Phaser.Physics.Arcade.Sprite;
  private keysDown: ControlKeys[] = [];
  private playerName!: string;
  private playerNameText!: Phaser.GameObjects.Text;
  private playerBanner!: PlayerBanner;

  constructor(private scene: Phaser.Scene) {
    this.createPlayer();
    this.createControls();
  }

  private createPlayer() {
    // walk-down-0 is the name of the frame in the .json file
    this.myPlayer = this.scene.physics.add
      .sprite(
        UserConstants.PLAYER_INITIAL_POSITION.x,
        UserConstants.PLAYER_INITIAL_POSITION.y,
        "character-sprite",
        "walk-down-0"
      )
      .setScale(UserConstants.PLAYER_SCALE);

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
    this.updatePlayerBanner();
  }

  private createAnimations() {
    const directions = Object.values(Direction);
    directions.forEach((direction) => {
      this.createWalkAnimation(direction);
      this.createIdleAnimation(direction);
    });
  }

  private createWalkAnimation(direction: Direction) {
    const animationKey = this.getAnimationKey("character", "walk", direction);
    this.scene.anims.create({
      key: animationKey,
      frames: this.scene.anims.generateFrameNames("character-sprite", {
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
    const animationKey = this.getAnimationKey("character", "idle", direction);
    this.scene.anims.create({
      key: animationKey,
      frames: [
        {
          key: "character-sprite",
          frame: `walk-${direction}-0`,
        },
      ],
    });
  }

  private getAnimationKey(character: string, action: string, direction: Direction) {
    return `${character}-${action}-${direction}`;
  }

  // Create nam text above the player
  private createPlayerBanner() {
    this.playerBanner = new PlayerBanner(
      this.scene,
      10,
      10,
      "online",
      "John Doe",
      "guest",
      "Hello, world!",
      "#ffffff",
      "#000000"
    );
  }

  private updatePlayerBanner() {
    this.playerBanner.updatePosition(
      this.myPlayer.body!.center.x - UserConstants.PLAYER_HUD_OFFSET.x,
      this.myPlayer.body!.center.y - UserConstants.PLAYER_HUD_OFFSET.y
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
    }

    if (this.keysDown.includes(ControlKeys.S)) {
      yVelocity += speed;
      direction = Direction.Down;
    }

    if (this.keysDown.includes(ControlKeys.A)) {
      xVelocity -= speed;
      direction = Direction.Left;
    }

    if (this.keysDown.includes(ControlKeys.D)) {
      xVelocity += speed;
      direction = Direction.Right;
    }

    if (direction) {
      this.movePlayer(xVelocity, yVelocity, direction);
    } else {
      // only stop the player if there's no keys pressed
      if (this.keysDown.length === 0) {
        this.stopPlayer();
      }
    }
  }

  movePlayer(xVelocity: number, yVelocity: number, direction: Direction) {
    // Stop any previous movement from the last frame
    this.myPlayer.setVelocity(0);

    const animationKey = this.getAnimationKey("character", "walk", direction);
    this.myPlayer.anims.play(animationKey, true);
    this.myPlayer.setVelocity(xVelocity, yVelocity);

    this.updatePlayerBanner();

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    this.myPlayer.body!.velocity.normalize().scale(UserConstants.PLAYER_SPEED);
  }

  private stopPlayer() {
    this.myPlayer.setVelocity(0, 0);
    const currentDirection = this.myPlayer.anims.currentAnim?.key?.split(
      "-"
    )[2] as Direction;
    if (currentDirection) {
      this.myPlayer.anims.play(
        this.getAnimationKey("character", "idle", currentDirection),
        true
      );
    }
  }

  public getPlayer() {
    return this.myPlayer;
  }
}
