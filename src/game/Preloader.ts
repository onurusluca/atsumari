import Phaser from "phaser";
import Tileset from "./images/maps/tileset_nature-map.png";
import MapJSON from "./images/maps/nature-map.json";

import ShadowSprite from "./images/shadow.png";

export default class Preloader extends Phaser.Scene {
  constructor() {
    super("preloader");
  }

  preload() {
    this.load.image("shadow", ShadowSprite);

    this.load.image("tiles", Tileset);
    this.load.tilemapTiledJSON("map", MapJSON);

    this.load.on("complete", () => {
      this.scene.start("main-scene");
    });
  }
}
