import Phaser from "phaser";
import PlayerHealthBar from "./PlayerHUD";
import { debugDraw } from "./helpers/debug";
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

export default class Game extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<ControlKeys, Phaser.Input.Keyboard.Key>;
  private myPlayer!: Phaser.Physics.Arcade.Sprite;
  private keysDown: ControlKeys[] = [];
  private playerHealthBar!: PlayerHealthBar;

  constructor() {
    super("game-scene");
  }

  create() {
    const { /* groundLayer */ wallsLayer } = this.createMapLayers();

    this.createPlayer();
    this.createControls();

    // Add collision between player and walls
    this.physics.add.collider(this.myPlayer, wallsLayer!);

    // Camera follows player
    this.cameras.main.startFollow(this.myPlayer, true);
    // Wall collisions
    // Collides is a custom property for the tile map, set in Tiled
    wallsLayer!.setCollisionByProperty({ collides: true });

    // Debug: draw borders and color for collision tiles
    debugDraw(wallsLayer!, this);
  }

  update() {
    if (!this.cursors) {
      console.warn("Cursors not found. Cannot update the game scene.");
      return;
    }

    const speed = PLAYER_SPEED * this.game.loop.delta;
    this.handlePlayerMovement(speed);

    this.playerHealthBar.updatePosition(
      this.myPlayer.x,
      this.myPlayer.y - PLAYER_HUD_OFFSET
    );
  }

  // FUNCTIONS
  private createMapLayers() {
    const map = this.make.tilemap({ key: "main-map" });

    // phaser-tiles is the name of the tileset in Tiled exported JSON
    const tileset = map.addTilesetImage("phaser-tiles", "main-tiles", 16, 16);

    // ground-layer is the name of the layer in Tiled exported JSON
    const groundLayer = map.createLayer("ground-layer", tileset!);
    const wallsLayer = map.createLayer("walls-layer", tileset!);

    // Set world bounds for camera. When close to the edge of the map, the camera will stop scrolling
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Set world bounds for physics. When close to the edge of the map, the player will stop moving
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    return { groundLayer, wallsLayer };
  }

  private createPlayer() {
    // walk-down-0 is the name of the frame in the .json file
    this.myPlayer = this.physics.add.sprite(
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

    this.playerHealthBar = new PlayerHealthBar(
      this,
      this.myPlayer.x,
      this.myPlayer.y - PLAYER_HUD_OFFSET
    );

    // Don't go out of the map
    this.myPlayer.setCollideWorldBounds(true);

    this.createAnimations();
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

  private createIdleAnimation(direction: Direction) {
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

  private getAnimationKey(character: string, action: string, direction: Direction) {
    return `${character}-${action}-${direction}`;
  }

  private createControls() {
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

  private handlePlayerMovement(speed: number) {
    const lastKey = this.keysDown[this.keysDown.length - 1];

    switch (lastKey) {
      case ControlKeys.W:
        this.movePlayer(0, -speed, Direction.Up);
        break;
      case ControlKeys.S:
        this.movePlayer(0, speed, Direction.Down);
        break;
      case ControlKeys.A:
        this.movePlayer(-speed, 0, Direction.Left);
        break;
      case ControlKeys.D:
        this.movePlayer(speed, 0, Direction.Right);
        break;
      default:
        this.stopPlayer();
        break;
    }
  }

  private movePlayer(xVelocity: number, yVelocity: number, direction: Direction) {
    const animationKey = this.getAnimationKey("character", "walk", direction);
    this.myPlayer.anims.play(animationKey, true);
    this.myPlayer.setVelocity(xVelocity, yVelocity);
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
}
/* NOTES:
The TypeScript error about stuff being null is due to strict null checks in TypeScript configuration. Phaser is written in JavaScript, and when used it with TypeScript, TypeScript's static type checking cause issues with Phaser's JavaScript code. So we add '!', the non-null assertion operator, to tell TypeScript that we know what we're doing and that we're sure that the value is not null.

Phaser is typically synced to the refresh rate of the display it's running on
*/
