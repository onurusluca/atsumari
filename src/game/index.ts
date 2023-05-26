import * as Phaser from "phaser";
import Preloader from "./Preloader";
import Game from "./Game";
import tileset_sprite_url from "./images/tileset.png";
import map_json from "./images/phaser.json";
import character_sprite_url from "./images/dog.png";

const PreloaderScene: Preloader = new Preloader(
  tileset_sprite_url,
  map_json,
  character_sprite_url
);

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "phaser-game",
  physics: {
    default: "arcade",
    arcade: {
      debug: true, // Enable debug
      // TODO: Add QuadTree
    },
  },
  audio: {
    disableWebAudio: true,
  },
  scene: [PreloaderScene, Game],
  scale: {
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    zoom: 2,
  },

  render: {
    //  roundPixels: true,
    pixelArt: true,
    antialias: false,
  },
};

const game = new Phaser.Game(config);
