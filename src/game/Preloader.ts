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

    // Listener for when all the load requests have completed
    this.load.on("complete", this.onLoadComplete, this);
  }

  create() {
    // Remove the listener to avoid it being called again on next preloading
    this.load.off("complete", this.onLoadComplete, this);
  }

  loadCharacterSprites() {
    // character-sprite-frame is same for all characters so it doesn't need to be passed in. Made with: https://asyed94.github.io/sprite-sheet-to-json/
    this.users.forEach((user: User) => {
      this.load.atlas(user.id, user.characterSprite, CharacterSpriteFrames);
      /*     this.load.atlas(user.id, user.characterSprite, CharacterSpriteFrames); */
    });
  }
  onLoadComplete() {
    // After all the load requests are complete, start the game-scene
    this.scene.start("game-scene");
  }

  update() {}
}
