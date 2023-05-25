import Phaser from "phaser";

interface IMapJson {
  // Define your structure here
}

export default class MainScene extends Phaser.Scene {
  private tilesetSpriteUrl: string;
  private mapJson: IMapJson;
  private rectangle: Phaser.GameObjects.Rectangle;
  private speed: number;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private fpsText: Phaser.GameObjects.Text;
  private frameTimes: number[] = [];

  constructor(tilesetSpriteUrl: string, mapJson: IMapJson) {
    super("main-scene");
    this.tilesetSpriteUrl = tilesetSpriteUrl;
    this.mapJson = mapJson;
    this.speed = 500; // Adjust the movement speed as needed
  }

  preload() {
    this.load.image("tiles", this.tilesetSpriteUrl);
    this.load.tilemapTiledJSON("map", this.mapJson);
  }

  create() {
    const map = this.make.tilemap({
      key: "map",
      tileWidth: 16,
      tileHeight: 16,
    });
    const tileset = map.addTilesetImage("phaser-tiles", "tiles");
    const layer = map.createLayer("ground-layer", tileset, 0, 0);
    const { width, height } = this.sys.game.canvas;
    this.rectangle = this.add.rectangle(width / 2, height / 2, 50, 50, 0xff0000);

    // Enable cursor keys for WASD movement
    const { W, A, S, D } = Phaser.Input.Keyboard.KeyCodes;
    this.cursors = this.input.keyboard.createCursorKeys({
      up: W,
      down: S,
      left: A,
      right: D,
    });

    // Create the FPS counter text and initialize it with "FPS: 0"
    // Phaser is typically synced to the refresh rate of the display it's running on
    this.fpsText = this.add.text(10, 10, "FPS: 0", {
      font: "16px Arial",
      fill: "#ffffff",
    });
  }

  update(time: number, delta: number) {
    // Update frameTimes
    this.frameTimes.push(delta);
    if (this.frameTimes.length > this.frameTimeWindow) {
      this.frameTimes.shift();
    }

    // Compute average frame time and convert to FPS
    const averageFrameTime =
      this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const fps = 1000 / averageFrameTime;

    // Update FPS text
    this.fpsText.setText(`FPS: ${Math.round(fps)}`);

    // Handle movement
    this.handleMovement(delta);
  }

  handleMovement(delta: number) {
    // Games can run at different speeds on different machines if they don't take into account the time passed between frames, which is known as "delta time". So we need to multiply our speed by delta time to ensure that the movement speed is consistent across different machines.
    const upDown = this.cursors.up?.isDown;
    const downDown = this.cursors.down?.isDown;
    const leftDown = this.cursors.left?.isDown;
    const rightDown = this.cursors.right?.isDown;
    const deltaSpeed = (this.speed * delta) / 1000; // Now speed is in units per second

    if (upDown) {
      this.rectangle.y -= deltaSpeed;
    }
    if (downDown) {
      this.rectangle.y += deltaSpeed;
    }
    if (leftDown) {
      this.rectangle.x -= deltaSpeed;
    }
    if (rightDown) {
      this.rectangle.x += deltaSpeed;
    }
  }
}
