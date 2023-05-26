import Phaser from "phaser";
import { debugDraw } from "./helpers/debug";

enum Direction {
  Up = "up",
  Down = "down",
  Left = "left",
  Right = "right",
}

enum ControlKeys {
  W = "W",
  A = "A",
  S = "S",
  D = "D",
}

const PLAYER_INITIAL_POSITION = { x: 500, y: 500 };
const PLAYER_SPEED = 30;
const PLAYER_SCALE = 2;
const PLAYER_BODY_SIZE = { width: 15, height: 15 };
const PLAYER_BODY_OFFSET = { x: 1, y: 1 };

export default class Game extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<ControlKeys, Phaser.Input.Keyboard.Key>;
  private myPlayer!: Phaser.Physics.Arcade.Sprite;

  constructor() {
    super("game-scene");
  }

  preload() {}

  create() {
    const { worldLayer, wallsLayer } = this.createMapLayers();

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
    const worldLayer = map.createLayer("ground-layer", tileset!);
    const wallsLayer = map.createLayer("walls-layer", tileset!);

    // Collides is a custom property for the tile map, set in Tiled
    wallsLayer!.setCollisionByProperty({ collides: true });

    // Set world bounds to the size of the map. When close to the edge of the map, the camera will stop scrolling
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    return { worldLayer, wallsLayer };
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
    this.anims.create({
      key: `character-walk-${direction}`,
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
    this.anims.create({
      key: `character-idle-${direction}`,
      frames: [
        {
          key: "character-sprite",
          frame: `walk-${direction}-0`,
        },
      ],
    });
  }

  createControls() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys("W,A,S,D") as Record<
      ControlKeys,
      Phaser.Input.Keyboard.Key
    >;
  }

  update() {
    if (!this.cursors) {
      console.warn("Cursors not found.");
      return;
    }

    const speed = PLAYER_SPEED * this.game.loop.delta;
    this.handlePlayerMovement(speed);
    this.roundPlayerPosition();
  }

  handlePlayerMovement(speed: number) {
    if (this.cursors.up.isDown || this.wasd[ControlKeys.W].isDown) {
      this.movePlayer(0, -speed, Direction.Up);
    } else if (this.cursors.down.isDown || this.wasd[ControlKeys.S].isDown) {
      this.movePlayer(0, speed, Direction.Down);
    } else if (this.cursors.left.isDown || this.wasd[ControlKeys.A].isDown) {
      this.movePlayer(-speed, 0, Direction.Left);
    } else if (this.cursors.right.isDown || this.wasd[ControlKeys.D].isDown) {
      this.movePlayer(speed, 0, Direction.Right);
    } else {
      this.stopPlayer();
    }
  }

  movePlayer(xVelocity: number, yVelocity: number, direction: Direction) {
    this.myPlayer.setVelocity(xVelocity, yVelocity);
    setTimeout(() => {
      this.myPlayer.anims.play(`character-walk-${direction}`, true);
    }, 0);
  }

  stopPlayer() {
    this.myPlayer.setVelocity(0, 0);
    const currentDirection = this.myPlayer.anims.currentAnim?.key;
    if (currentDirection) {
      const direction = currentDirection.split("-")[2];
      this.myPlayer.anims.play(`character-idle-${direction}`, true);
    }
  }

  roundPlayerPosition() {
    this.myPlayer.setPosition(Math.round(this.myPlayer.x), Math.round(this.myPlayer.y));
  }
}

/* NOTES:
The TypeScript error about stuff being null is due to strict null checks in TypeScript configuration. Phaser is written in JavaScript, and when used it with TypeScript, TypeScript's static type checking cause issues with Phaser's JavaScript code. So we add '!', the non-null assertion operator, to tell TypeScript that we know what we're doing and that we're sure that the value is not null.

Phaser is typically synced to the refresh rate of the display it's running on
*/
