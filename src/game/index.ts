import * as Phaser from "phaser";

// Scenes
import Preloader from "./Preloader";
import Main from "./Main";

export default async function createGame(): Promise<void> {
  let gameInstance = new Phaser.Game({
    type: Phaser.AUTO, // Phaser will use WebGL if available, if not it will use Canvas
    parent: "atsumari-game",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 }, // Top down game, so no gravity
        debug: false, // Enable debug
        // TODO: Add QuadTree
      },
    },
    backgroundColor: "#38393D",
    dom: {
      createContainer: false,
    },
    autoFocus: true,
    input: {
      touch: true,
      keyboard: true,
    },
    audio: {
      disableWebAudio: true,
    },
    scene: [Preloader, Main],
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
  });

  emitter.on("destroyGame", async () => {
    // Stop game loop
    gameInstance.loop.stop();

    // Loop through each scene in the game
    for (let scene of gameInstance.scene.getScenes(true)) {
      scene.sys.events.shutdown();
      // Stop the scene
      scene.scene.stop();

      // Remove the scene from the game
      gameInstance.scene.remove(scene.sys.settings.key);
    }

    // Remove game canvas from the DOM
    if (gameInstance.canvas.parentNode) {
      gameInstance.canvas.parentNode.removeChild(gameInstance.canvas);
    }

    // Destroy the game instance
    gameInstance.destroy(true);
  });
}
