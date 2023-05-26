import * as Phaser from "phaser";
import type { CanvasAppOptions } from "@/types/canvasTypes";
import Preloader from "./Preloader";
import Game from "./Game";
import character_sprite_url from "./images/dog.png";

export async function createGame(options: CanvasAppOptions): Promise<void> {
  const { users, myPlayerId, gameMapJson, gameMapTileset, initialSetupCompleted } =
    options;

  const PreloaderScene: Preloader = new Preloader(
    gameMapTileset,
    gameMapJson,
    character_sprite_url
  );

  /* const GameScene: Game = new Game(

  ); */

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: "phaser-game",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0, x: 0 },
        debug: false, // Enable debug
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
      roundPixels: true,
      pixelArt: true,
      antialias: false,
    },
  };

  const game = new Phaser.Game(config);
}
