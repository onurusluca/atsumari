import Phaser from "phaser";
import { debugDraw } from "./helpers/debug";
import Player from "./Player";

export default class Game extends Phaser.Scene {
  private myPlayer!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private controls!: Phaser.Cameras.Controls.FixedKeyControl;
  private player;
  private playerName;
  private playerNameText;

  constructor() {
    super("game-scene");
  }

  create() {
    const { wallsLayer } = this.createMapLayers();

    // Create player instance
    //this.myPlayer = new Player(this);

    // Add collision between player and walls
    // this.physics.add.collider(this.this.myPlayer.getPlayer(), wallsLayer!);

    const camera = this.cameras.main;
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.controls = new Phaser.Cameras.Controls.FixedKeyControl({
      camera: camera,
      left: this.cursors.left,
      right: this.cursors.right,
      up: this.cursors.up,
      down: this.cursors.down,
      speed: 0.5,
    });
    camera.roundPixels = true; // avoid tile bleed
    camera.zoom = 2;
    // Camera follows player
    // this.cameras.main.startFollow(this.this.myPlayer.getPlayer(), true, 0.08, 0.08);

    // Wall collisions
    wallsLayer!.setCollisionByProperty({ collides: true });
    this.player = this.physics.add
      .sprite(400, 350, "character-sprite", "walk-down-0")
      .setSize(16, 16)
      .setOffset(0, 0)
      .setScale(2);
    this.physics.add.collider(this.player, wallsLayer!);
    // Debug: draw borders and color for collision tiles
    debugDraw(wallsLayer!, this);

    this.add
      .text(16 / camera.zoom, 16 / camera.zoom, "Arrow keys to scroll", {
        font: "18px monospace",
        color: "#ffffff",
        padding: { x: 20, y: 10 },
        backgroundColor: "#000000",
      })
      .setScrollFactor(0);

    const anims = this.anims;
    anims.create({
      key: "walk-down",
      frames: anims.generateFrameNames("character-sprite", {
        prefix: "walk-down-",
        start: 0,
        end: 3,
        zeroPad: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: "walk-right",
      frames: anims.generateFrameNames("character-sprite", {
        prefix: "walk-right-",
        start: 0,
        end: 3,
        zeroPad: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: "walk-left",
      frames: anims.generateFrameNames("character-sprite", {
        prefix: "walk-left-",
        start: 0,
        end: 3,
        zeroPad: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: "walk-up",
      frames: anims.generateFrameNames("character-sprite", {
        prefix: "walk-up-",
        start: 0,
        end: 3,
        zeroPad: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });
    camera.startFollow(this.player);

    // Add 'my-user-name' text above player:
    // Define player name
    this.playerName = "my-user-name";

    // Add player name text above the player
    this.playerNameText = this.add.text(0, 0, this.playerName, {
      font: "18px monospace",
      color: "#ffffff",
      align: "center",
    });
  }

  update(time, delta) {
    const speed = 175;
    const prevVelocity = this.player.body.velocity.clone();

    // Stop any previous movement from the last frame
    this.player.body.setVelocity(0);

    // Horizontal movement
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(speed);
    }

    // Vertical movement
    if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(speed);
    }

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    this.player.body.velocity.normalize().scale(speed);

    // Update the animation last and give left/right animations precedence over up/down animations
    if (this.cursors.left.isDown) {
      this.player.anims.play("walk-left", true);
    } else if (this.cursors.right.isDown) {
      this.player.anims.play("walk-right", true);
    } else if (this.cursors.up.isDown) {
      this.player.anims.play("walk-up", true);
    } else if (this.cursors.down.isDown) {
      this.player.anims.play("walk-down", true);
    } else {
      this.player.anims.stop();

      // If we were moving, pick and idle frame to use
      if (prevVelocity.x < 0) this.player.setTexture("character-sprite", "walk-left-0");
      else if (prevVelocity.x > 0)
        this.player.setTexture("character-sprite", "walk-right-0");
      else if (prevVelocity.y < 0)
        this.player.setTexture("character-sprite", "walk-up-0");
      else if (prevVelocity.y > 0)
        this.player.setTexture("character-sprite", "walk-down-0");
    }

    this.playerNameText.setPosition(
      this.player.body.center.x,
      this.player.body.center.y - this.player.height / 2
    );
  }

  private createMapLayers() {
    const map = this.make.tilemap({ key: "world-map" });
    const tileset = map.addTilesetImage("phaser-tiles", "world-tiles", 16, 16, 1, 2);
    const groundLayer = map.createLayer("ground-layer", tileset!, 0, 0);
    const wallsLayer = map.createLayer("walls-layer", tileset!, 0, 0);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    return { groundLayer, wallsLayer };
  }
}
