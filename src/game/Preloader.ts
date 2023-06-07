import Phaser from "phaser";
import { TileMap } from "@/types/canvasTypes";
import { User } from "@/types/canvasTypes";

import CharacterSpriteFrames from "./images/character-sprite-frames.json";
import ShadowSprite from "./images/shadow.png";
import { getCharacterSpriteSheet } from "./images/characters/imports";
const authStore = useAuthStore();

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
    console.log("ALL USERS", this.users);
    this.loadCharacterSprites();
    this.load.image("world-tiles", this.tileSetSprite);
    this.load.tilemapTiledJSON("world-map", this.mapJson);
    this.load.image("shadow", ShadowSprite);
    this.load.on("complete", this.onLoadComplete, this);
  }

  create() {
    // Remove the listener to avoid it being called again on next preloading
    this.load.off("complete", this.onLoadComplete, this);
  }

  private async loadCharacterSprites() {
    console.log("ALLLL USERS", this.users);

    for (let user of this.users) {
      if (!this.textures.exists(user.id)) {
        console.log(`Loading character sprite for ${user}`);
        this.load.atlas(
          user.id,
          getCharacterSpriteSheet(user.characterSpriteName),
          CharacterSpriteFrames
        );

        await new Promise((resolve) => setTimeout(resolve, 100)); // Add delay
      }
    }
  }

  private onLoadComplete() {
    this.scene.start("game-scene");
  }
}
