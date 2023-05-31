import Phaser from "phaser";
import { debugDraw } from "./helpers/debug";
import PlayerManager from "./player/PlayerManager";
import { User } from "@/types/canvasTypes";
import { MAP_SCALE_FACTOR } from "./helpers/constants";

export default class Game extends Phaser.Scene {
  private playerManager!: PlayerManager;
  private users: User[] = [];

  constructor(users: User[]) {
    super("game-scene");
    this.users = users;
  }

  create() {
    this.createPlayersAndStartGame();
  }

  update(/* time: number, delta: number */) {
    if (this.playerManager) {
      this.playerManager.handlePlayerMovement();
    }
  }

  createPlayersAndStartGame() {
    const { wallsLayer } = this.createMapLayers();

    // Create player instance
    this.playerManager = new PlayerManager(this, this.users);

    // Follow player with camera
    this.cameras.main.startFollow(this.playerManager.getLocalPlayer().getPlayer());
    // Wall collisions
    wallsLayer!.setCollisionByProperty({ collides: true });

    // Add collision between player and walls
    this.physics.add.collider(
      this.playerManager.getLocalPlayer().getPlayer(),
      wallsLayer!
    );

    // Debug: draw borders and color for collision tiles
    debugDraw(wallsLayer!, this);
  }

  private createMapLayers() {
    // Using 16x16 tiles, so scale up by 2x. Instead of zooming in, we scale up the tilemap and sprites to keep the ui elements on screen and keep the picture crisp.

    // Create map
    const map = this.make.tilemap({ key: "world-map" });
    const tileset = map.addTilesetImage("phaser-tiles", "world-tiles", 16, 16, 1, 2);
    const groundLayer = map.createLayer("ground-layer", tileset!, 0, 0);
    const wallsLayer = map.createLayer("walls-layer", tileset!, 0, 0);

    groundLayer?.setScale(MAP_SCALE_FACTOR);
    wallsLayer?.setScale(MAP_SCALE_FACTOR);

    // Set camera bounds so the camera won't go outside the game world
    this.cameras.main.setBounds(
      0,
      0,
      map.widthInPixels * MAP_SCALE_FACTOR,
      map.heightInPixels * MAP_SCALE_FACTOR
    );

    // Set world bounds to the size of the map so the user can't walk outside the map
    this.physics.world.setBounds(
      0,
      0,
      map.widthInPixels * MAP_SCALE_FACTOR,
      map.heightInPixels * MAP_SCALE_FACTOR
    );

    // When Phaser is ready, log a message in the console
    emitter.emit("canvasLoaded");

    return { groundLayer, wallsLayer };
  }
}
