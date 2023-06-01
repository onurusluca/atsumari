import * as Phaser from "phaser";
import type { CanvasAppOptions } from "@/types/canvasTypes";
import Preloader from "./Preloader";
import Game from "./Game";

export async function createGame(options: CanvasAppOptions): Promise<void> {
  // Get stuff sent from Space.vue
  const { gameMapJson, gameMapTileset, users } = options;

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO, // Phaser will use WebGL if available, if not it will use Canvas
    parent: "atsumari-game",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 }, // Top down game, so no gravity
        debug: true, // Enable debug
        // TODO: Add QuadTree
      },
    },
    backgroundColor: "#38393D",
    dom: {
      createContainer: true,
    },
    autoFocus: true,
    input: {
      touch: true,
      keyboard: true,
    },
    audio: {
      disableWebAudio: true,
    },
    scene: [new Preloader(gameMapTileset, gameMapJson, users), new Game(users)],
    scale: {
      mode: Phaser.Scale.FIT, // Fit to window
      autoCenter: Phaser.Scale.CENTER_BOTH, // Center game
      parent: "phaser-game", // ID of the DOM element to which the canvas should be added
      width: window.innerWidth,
      height: window.innerHeight,
    },
    render: {
      roundPixels: true,
      pixelArt: true,
      // antialias: true,

      // desynchronized: true,
    },
    fps: {
      //limit: 165,
      //limit: 144
      //limit: 60
      //limit: 40
      //limit: 15
    },
  };

  const checkConditionsBeforeLoop = setInterval(() => {
    if (users.length > 0) {
      clearInterval(checkConditionsBeforeLoop);
      console.log("creating game!!!!!!!!!!!!!!!!!!!!!", users);

      new Phaser.Game(config);
    }
  }, 100);
}
