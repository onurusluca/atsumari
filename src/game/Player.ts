import Phaser from "phaser";
import {
  Direction,
  ControlKeys,
  PLAYER_INITIAL_POSITION,
  PLAYER_SPEED,
  PLAYER_SCALE,
  PLAYER_BODY_SIZE,
  PLAYER_BODY_OFFSET,
} from "./helpers/constants";

export default class Player {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<ControlKeys, Phaser.Input.Keyboard.Key>;
  private myPlayer!: Phaser.Physics.Arcade.Sprite;
  private keysDown: ControlKeys[] = [];

  constructor(private scene: Phaser.Scene) {
    this.createPlayer();
    this.createControls();
  }

  createPlayer() {
    // walk-down-0 is the name of the frame in the .json file
    this.myPlayer = this.scene.physics.add.sprite(
      PLAYER_INITIAL_POSITION.x,
      PLAYER_INITIAL_POSITION.y,
      "character-sprite",
      "walk-down-0"
    );
    this.myPlayer.setScale(PLAYER_SCALE);

    // Player hitbox
    const { body } = this.myPlayer;
    body!.setSize(PLAYER_BODY_SIZE.width, PLAYER_BODY_SIZE.height);
    body!.setOffset(PLAYER_BODY_OFFSET.x, PLAYER_BODY_OFFSET.y);

    // Don't go out of the map
    this.myPlayer.setCollideWorldBounds(true);

    this.createAnimations();
  }

  createAnimations() {
    const directions = Object.values(Direction);
    directions.forEach((direction) => {
      this.createWalkAnimation(direction);
      this.createIdleAnimation(direction);
    });
  }

  createWalkAnimation(direction: Direction) {
    const animationKey = this.getAnimationKey("character", "walk", direction);
    this.scene.anims.create({
      key: animationKey,
      frames: this.scene.anims.generateFrameNames("character-sprite", {
        prefix: `walk-${direction}-`,
        start: 0,
        end: 3,
      }),
      frameRate: 8,
      repeat: -1,
    });
  }

  createIdleAnimation(direction: Direction) {
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

  getAnimationKey(character: string, action: string, direction: Direction) {
    return `${character}-${action}-${direction}`;
  }

  createControls() {
    this.cursors = this.scene.input.keyboard!.createCursorKeys();
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
        this.keysDown = this.keysDown.filter((k) => k !== direction);
      });
    });
  }

  handlePlayerMovement() {
    const speed = PLAYER_SPEED * Math.round(this.scene.game.loop.delta);
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
      this.stopPlayer();
    }
  }

  movePlayer(xVelocity: number, yVelocity: number, direction: Direction) {
    const animationKey = this.getAnimationKey("character", "walk", direction);
    this.myPlayer.anims.play(animationKey, true);
    this.myPlayer.setVelocity(xVelocity, yVelocity);
  }

  stopPlayer() {
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

  getPlayer() {
    return this.myPlayer;
  }
}
