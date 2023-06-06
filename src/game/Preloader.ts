import Phaser from "phaser";
import { TileMap } from "@/types/canvasTypes";
import { User } from "@/types/canvasTypes";

import CharacterSpriteFrames from "./images/character-sprite-frames.json";
import ShadowSprite from "./images/shadow.png";
import { getCharacterSpriteSheet } from "./images/characters/imports";

export default class Preloader extends Phaser.Scene {
  private readonly tileSetSprite: string;
  private readonly mapJson: TileMap;
  private readonly users: User[];

  constructor(tileSetSprite: string, mapJson: TileMap, users: User[] = []) {
    super("preloader-scene");
    this.tileSetSprite = tileSetSprite;
    this.mapJson = mapJson;
    this.users = users;
  }

  preload() {
    this.load.image("world-tiles", this.tileSetSprite);
    this.load.tilemapTiledJSON("world-map", this.mapJson);
    this.loadCharacterSprites();
    this.load.image("shadow", ShadowSprite);
    this.load.on("complete", this.onLoadComplete, this);
  }

  create() {
    // Remove the listener to avoid it being called again on next preloading
    this.load.off("complete", this.onLoadComplete, this);
  }

  private loadCharacterSprites() {
    // character-sprite-frame is same for all characters so it doesn't need to be passed in. Made with: https://asyed94.github.io/sprite-sheet-to-json/
    this.users.forEach((user: User) => {
      this.load.atlas(
        user.id,
        getCharacterSpriteSheet(user.characterSpriteName),
        CharacterSpriteFrames
      );
    });
  }

  private onLoadComplete() {
    this.scene.start("game-scene");
  }
}
