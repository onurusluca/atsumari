import Phaser from "phaser";
import { Rectangle, TileMap } from "@/types/canvasTypes";

import CharacterSpriteFrames from "./images/character-sprite-frames.json";
import PlayerShadowSprite from "./images/shadow.png";

export default class MainScene extends Phaser.Scene {
  private tileSetSpriteUrl: string;
  private mapJson: TileMap;
  private characterSprite: string;
  constructor(tileSetSpriteUrl: string, mapJson: TileMap, characterSprite: string) {
    super("main-scene");
    this.tileSetSpriteUrl = tileSetSpriteUrl;
    this.mapJson = mapJson;
    this.characterSprite = characterSprite;
  }

  preload() {
    this.load.image("main-tiles", this.tileSetSpriteUrl);
    this.load.tilemapTiledJSON("main-map", this.mapJson);

    // character-sprite-frame is same for all characters so it doesn't need to be passed in. Made with: https://asyed94.github.io/sprite-sheet-to-json/
    this.load.atlas("character-sprite", this.characterSprite, CharacterSpriteFrames);

    this.load.image("player-shadow", PlayerShadowSprite);
  }

  create() {
    this.scene.start("game-scene");
  }

  update() {}
}
