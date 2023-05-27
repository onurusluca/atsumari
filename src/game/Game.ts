import Phaser from "phaser";
import { PlayerBanner } from "./PlayerBanner";
import { debugDraw } from "./helpers/debug";
import {
  Direction,
  ControlKeys,
  PLAYER_INITIAL_POSITION,
  PLAYER_SPEED,
  PLAYER_SCALE,
  PLAYER_BODY_SIZE,
  PLAYER_BODY_OFFSET,
} from "./helpers/constants";

export default class Game extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<ControlKeys, Phaser.Input.Keyboard.Key>;
  private myPlayer!: Phaser.Physics.Arcade.Sprite;
  private keysDown: ControlKeys[] = [];
  private myPlayerBanner!: PlayerBanner;
  constructor() {
    super("game-scene");
  }

  // PHASER CREATE FUNCTION
  create() {
    const { groundLayer, wallsLayer } = this.createMapLayers();

    this.createPlayer();
    this.createControls();

    // Add collision between player and walls
    this.physics.add.collider(this.myPlayer, wallsLayer!);

    // Camera follows player
    this.cameras.main.startFollow(this.myPlayer, true);

    // Debug
    debugDraw(wallsLayer!, this);
  }

  createMapLayers() {
    const map = this.make.tilemap({ key: "main-map" });

    // phaser-tiles is the name of the tileset in Tiled exported JSON
    const tileset = map.addTilesetImage("phaser-tiles", "main-tiles", 16, 16);

    // ground-layer is the name of the layer in Tiled exported JSON
    const groundLayer = map.createLayer("ground-layer", tileset!);
    const wallsLayer = map.createLayer("walls-layer", tileset!);

    // Collides is a custom property for the tile map, set in Tiled
    wallsLayer!.setCollisionByProperty({ collides: true });

    // Set world bounds to the size of the map. When close to the edge of the map, the camera will stop scrolling
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    return { groundLayer, wallsLayer };
  }

  createPlayer() {
    // walk-down-0 is the name of the frame in the .json file
    this.myPlayer = this.physics.add.sprite(
      PLAYER_INITIAL_POSITION.x,
      PLAYER_INITIAL_POSITION.y,
      "character-sprite",
      "walk-down-0"
    );
    this.myPlayer.setScale(PLAYER_SCALE);

    // Player hitbox
    this.myPlayer.body!.setSize(PLAYER_BODY_SIZE.width, PLAYER_BODY_SIZE.height);
    this.myPlayer.body!.setOffset(PLAYER_BODY_OFFSET.x, PLAYER_BODY_OFFSET.y);

    this.myPlayerBanner = new PlayerBanner(
      this,
      PLAYER_INITIAL_POSITION.x,
      PLAYER_INITIAL_POSITION.y,
      "UserName",
      "online",
      "Status Text"
    );

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
    this.anims.create({
      key: animationKey,
      frames: this.anims.generateFrameNames("character-sprite", {
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
    this.anims.create({
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
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      [ControlKeys.W]: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      [ControlKeys.A]: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      [ControlKeys.S]: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      [ControlKeys.D]: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
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

  handlePlayerMovement(speed: number) {
    const lastKey = this.keysDown[this.keysDown.length - 1];

    switch (lastKey) {
      case ControlKeys.W:
        this.movePlayerUp(speed);
        break;
      case ControlKeys.S:
        this.movePlayerDown(speed);
        break;
      case ControlKeys.A:
        this.movePlayerLeft(speed);
        break;
      case ControlKeys.D:
        this.movePlayerRight(speed);
        break;
      default:
        this.stopPlayer();
        break;
    }
  }

  movePlayerUp(speed: number) {
    this.movePlayer(0, -speed, Direction.Up);
  }

  movePlayerDown(speed: number) {
    this.movePlayer(0, speed, Direction.Down);
  }

  movePlayerLeft(speed: number) {
    this.movePlayer(-speed, 0, Direction.Left);
  }

  movePlayerRight(speed: number) {
    this.movePlayer(speed, 0, Direction.Right);
  }

  movePlayer(xVelocity: number, yVelocity: number, direction: Direction) {
    const animationKey = this.getAnimationKey("character", "walk", direction);

    // If the correct animation is not playing yet, play it and don't move the player yet.
    if (this.myPlayer.anims.currentAnim?.key !== animationKey) {
      this.myPlayer.anims.play(animationKey, true);
      return;
    }
    this.myPlayer.setVelocity(xVelocity, yVelocity);
  }

  stopPlayer() {
    this.myPlayer.setVelocity(0, 0);
    const currentDirection = this.myPlayer.anims.currentAnim?.key;
    if (currentDirection) {
      const direction = currentDirection.split("-")[2] as Direction;
      this.myPlayer.anims.play(
        this.getAnimationKey("character", "idle", direction),
        true
      );
    }
  }

  // TODO: Use this function to update the player's status
  // Update user status
  /*   onUserStatusUpdate(status: string, textStatus: string) {
    this.myPlayerBanner.updateUserStatus(status, textStatus);
  } */

  // PHASER UPDATE FUNCTION
  update() {
    if (!this.cursors) {
      console.warn("Cursors not found. Cannot update the game scene.");
      return;
    }

    const speed = PLAYER_SPEED * this.game.loop.delta;
    this.handlePlayerMovement(speed);

    this.myPlayerBanner.updatePosition(this.myPlayer.x, this.myPlayer.y - 50); // 50 is the offset to display banner above player, adjust it as needed
  }
}

/* NOTES:
The TypeScript error about stuff being null is due to strict null checks in TypeScript configuration. Phaser is written in JavaScript, and when used it with TypeScript, TypeScript's static type checking cause issues with Phaser's JavaScript code. So we add '!', the non-null assertion operator, to tell TypeScript that we know what we're doing and that we're sure that the value is not null.

Phaser is typically synced to the refresh rate of the display it's running on
*/
