import * as Phaser from "phaser";
import MainScene from "./MainScene";
import tileset_sprite_url from "./images/tileset.png";
import map_json from "./images/phaser.json";

const scene: MainScene = new MainScene(tileset_sprite_url, map_json);

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  width: 1200,
  height: 800,
  audio: {
    disableWebAudio: true,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
    },
  },
  scene: [scene],
};

const game = new Phaser.Game(config);
