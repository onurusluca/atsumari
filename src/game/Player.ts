import Phaser from "phaser";
import {
  Direction,
  ControlKeys,
  PLAYER_INITIAL_POSITION,
  PLAYER_SPEED,
  PLAYER_SCALE,
  PLAYER_BODY_SIZE,
  PLAYER_BODY_OFFSET,
  PLAYER_HUD_OFFSET,
} from "./helpers/constants";

export default class Player extends Phaser.GameObjects.Container {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<ControlKeys, Phaser.Input.Keyboard.Key>;
  private myPlayer!: Phaser.Physics.Arcade.Sprite;
  private keysDown: ControlKeys[] = [];
  private playerName!: Phaser.GameObjects.Text;

  private playerNameStr: string;

  constructor(scene: Phaser.Scene, playerNameStr: string) {
    super(scene, PLAYER_INITIAL_POSITION.x, PLAYER_INITIAL_POSITION.y);
    this.playerNameStr = playerNameStr;
    this.createPlayer();
    this.createControls();
    this.createName();
  }

  createPlayer() {
    // walk-down-0 is the name of the frame in the .json file
    this.myPlayer = this.scene.physics.add.sprite(
      0, // Update position values to be relative to the container
      0,
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

    // Add player sprite to the container
    this.add(this.myPlayer);
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
      frameRate: 10,
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

  createName() {
    this.playerName = this.scene.add.text(
      0, // Update position values to be relative to the container
      -PLAYER_HUD_OFFSET,
      this.playerNameStr,
      {
        fontSize: "16px",
        color: "#ffffff",
      }
    );

    // Add player name to the container
    this.add(this.playerName);
  }

  updateNamePosition() {
    this.playerName.setPosition(this.myPlayer.x, this.myPlayer.y - PLAYER_HUD_OFFSET);
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
        this.keysDown = this.keysDown.filter((k) => k !== direction);
        this.keysDown.push(direction as ControlKeys);
      });

      key.on("up", () => {
        this.keysDown = this.keysDown.filter((k) => k !== direction);
      });
    });
  }

  handlePlayerMovement() {
    // Update method to change the container's position
    const speed = PLAYER_SPEED * this.scene.game.loop.delta;
    const lastKey = this.keysDown[this.keysDown.length - 1];

    switch (lastKey) {
      case ControlKeys.W:
        this.setPosition(this.x, this.y - speed);
        this.movePlayer(0, -speed, Direction.Up);
        break;
      case ControlKeys.S:
        this.setPosition(this.x, this.y + speed);
        this.movePlayer(0, speed, Direction.Down);
        break;
      case ControlKeys.A:
        this.setPosition(this.x - speed, this.y);
        this.movePlayer(-speed, 0, Direction.Left);
        break;
      case ControlKeys.D:
        this.setPosition(this.x + speed, this.y);
        this.movePlayer(speed, 0, Direction.Right);
        break;
      default:
        this.stopPlayer();
        break;
    }

    // Make sure the sprite stays at the center of the container
    this.myPlayer.setPosition(0, 0);

    this.updateNamePosition();
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

  setCollidersWith(layer: Phaser.Tilemaps.TilemapLayer) {
    this.scene.physics.add.collider(this.myPlayer, layer);
  }

  getPlayer() {
    return this.myPlayer;
  }
}
