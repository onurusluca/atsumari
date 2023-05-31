import Phaser from "phaser";
import { TileMap } from "@/types/canvasTypes";
import { User } from "@/types/canvasTypes";

import CharacterSpriteFrames from "./images/character-sprite-frames.json";
// import PlayerShadowSprite from "./images/shadow.png";

export default class Preloader extends Phaser.Scene {
  private tileSetSprite: string;
  private mapJson: TileMap;
  private users: User[] = [];

  constructor(tileSetSprite: string, mapJson: TileMap, users: User[]) {
    super("preloader-scene");
    this.tileSetSprite = tileSetSprite;
    this.mapJson = mapJson;
    this.users = users;
  }

  preload() {
    this.load.image("world-tiles", this.tileSetSprite);
    this.load.tilemapTiledJSON("world-map", this.mapJson);

    this.loadCharacterSprites();

    // Let Phaser know to wait for these to finish loading before calling create.
    this.load.once("complete", () => {
      console.log("All assets loaded");
      // Tell the game scene that all assets have been loaded
      this.scene.get("game-scene").events.emit("allAssetsLoaded");

      // Starting the game scene here.
      this.scene.start("game-scene");
    });
  }

  create() {}

  loadCharacterSprites() {
    // character-sprite-frame is same for all characters so it doesn't need to be passed in. Made with: https://asyed94.github.io/sprite-sheet-to-json/
    this.users.forEach((user) => {
      this.load.atlas(user.id, user.characterSprite, CharacterSpriteFrames);
    });
  }

  update() {}
}
