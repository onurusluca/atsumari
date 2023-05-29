import Phaser from "phaser";
import { debugDraw } from "./helpers/debug";
import Player from "./Player";

export default class Game extends Phaser.Scene {
  private myPlayer!: Player;
  private groundLayer!: Phaser.Tilemaps.TilemapLayer;

  constructor() {
    super("game-scene");
  }

  create() {
    const { groundLayer, wallsLayer } = this.createMapLayers();

    // Create player instance
    this.myPlayer = new Player(this, "myPlayer");
    this.add.existing(this.myPlayer); // Add player to the scene

    // Add collision between player and walls
    //this.physics.add.collider(this.myPlayer, wallsLayer!);
    this.myPlayer.setCollidersWith(wallsLayer!);

    // Camera follows player
    this.cameras.main.startFollow(this.myPlayer, true);

    // Wall collisions
    wallsLayer!.setCollisionByProperty({ collides: true });

    // Debug: draw borders and color for collision tiles
    debugDraw(wallsLayer!, this);
  }

  update() {
    this.myPlayer.handlePlayerMovement();
  }

  private createMapLayers() {
    const map = this.make.tilemap({ key: "main-map" });
    const tileset = map.addTilesetImage("phaser-tiles", "main-tiles", 16, 16);
    const groundLayer = map.createLayer("ground-layer", tileset!);
    const wallsLayer = map.createLayer("walls-layer", tileset!);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    return { groundLayer, wallsLayer };
  }
}
