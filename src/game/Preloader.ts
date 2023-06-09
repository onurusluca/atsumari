import Phaser from "phaser";
import { TileMap } from "@/types/canvasTypes";
import { User } from "@/types/canvasTypes";

import Tileset from "./images/maps/tileset.png";
import MapJSON from "./images/maps/nature-map.json";

import CharacterSpriteFrames from "./images/characters/character-sprite-frames.json";
import { getCharacterSpriteSheet } from "./images/characters/imports";
import ShadowSprite from "./images/shadow.png";

const authStore = useAuthStore();

export default class Preloader extends Phaser.Scene {
  constructor() {
    super("preloader");
  }

  preload() {
    this.load.atlas("car", getCharacterSpriteSheet("boy.png"), CharacterSpriteFrames);

    this.load.image("shadow", ShadowSprite);

    this.load.image("tiles", Tileset);
    this.load.tilemapTiledJSON("map", MapJSON);

    this.scene.start("main");
  }
}
