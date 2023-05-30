import Phaser from "phaser";
import { TileMap } from "@/types/canvasTypes";

import CharacterSpriteFrames from "./images/character-sprite-frames.json";
// import PlayerShadowSprite from "./images/shadow.png";

export default class Preloader extends Phaser.Scene {
  private tileSetSprite: string;
  private mapJson: TileMap;
  private characterSprite: string;
  constructor(tileSetSprite: string, mapJson: TileMap, characterSprite: string) {
    super("preloader-scene");
    this.tileSetSprite = tileSetSprite;
    this.mapJson = mapJson;
    this.characterSprite = characterSprite;
  }

  preload() {
    this.load.image("world-tiles", this.tileSetSprite);
    this.load.tilemapTiledJSON("world-map", this.mapJson);

    // character-sprite-frame is same for all characters so it doesn't need to be passed in. Made with: https://asyed94.github.io/sprite-sheet-to-json/
    this.load.atlas("character-sprite", this.characterSprite, CharacterSpriteFrames);
  }

  create() {
    this.scene.start("game-scene");
  }

  update() {}
}
