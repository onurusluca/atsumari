import Phaser from "phaser";
import { TileMap } from "@/types/canvasTypes";
import { User } from "@/types/canvasTypes";

import CharacterSpriteFrames from "./images/character-sprite-frames.json";
import ShadowSprite from "./images/shadow.png";

let avatarUrls: Record<string, string> = {};
const loadAvatars = async (avatarNames: string[]) => {
  const images = import.meta.globEager("./images/characters/*.png");
  for (let avatarName of avatarNames) {
    const avatarImportFunction = images[`./images/characters/${avatarName}.png`];
    if (avatarImportFunction) {
      const avatar = await avatarImportFunction();
      avatarUrls[avatarName] = avatar.default;
    }
  }
};

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
    this.load.image("shadow", ShadowSprite);
    this.load.on("complete", this.onLoadComplete, this);
  }

  create() {
    // Remove the listener to avoid it being called again on next preloading
    this.load.off("complete", this.onLoadComplete, this);
  }

  loadCharacterSprites() {
    // character-sprite-frame is same for all characters so it doesn't need to be passed in. Made with: https://asyed94.github.io/sprite-sheet-to-json/
    loadAvatars(this.users.map((user) => user.characterSpriteName));

    this.users.forEach((user: User) => {
      this.load.atlas(
        user.id,
        avatarUrls[user.characterSpriteName],
        CharacterSpriteFrames
      );
    });
  }
  onLoadComplete() {
    console.log("wowwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww", avatarUrls);

    // After all the load requests are complete, start the game-scene
    this.scene.start("game-scene");
  }

  update() {}
}
