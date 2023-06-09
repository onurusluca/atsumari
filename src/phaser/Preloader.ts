import Phaser from "phaser";
import { TileMap } from "@/types/canvasTypes";
import { User } from "@/types/canvasTypes";

import CharacterSpriteFrames from "./images/character-sprite-frames.json";
import ShadowSprite from "./images/shadow.png";
import { getCharacterSpriteSheet } from "./images/characters/imports";

const authStore = useAuthStore();

export default class Preloader extends Phaser.Scene {
  constructor() {
    super("preloader");
  }

  preload() {
    this.load.image("car", getCharacterSpriteSheet("car.png"));

    this.scene.start("main");
  }
}
