import * as Phaser from "phaser";

// Scenes
import Preloader from "./Preloader";
import Main from "./Main";

export default async function createGame(): Promise<void> {
  let gameInstance = new Phaser.Game({
    type: Phaser.AUTO, // Phaser will use WebGL if available, if not it will use Canvas
    parent: "space__game-parent",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 }, // Top down game, so no gravity
        debug: true, // Enable debugging
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
      parent: "space__game-parent",
      width: window.innerWidth,
      height: window.innerHeight - 60, // Height of the bottom bar
    },
    render: {
      roundPixels: true,
      pixelArt: true,
      // antialias: true,
      // desynchronized: true,
    },
    fps: {
      //limit: 165,
      //limit: 144s
      //limit: 60
      //limit: 40
      //limit: 15
    },
  });

  console.log("gameInstance", gameInstance);

  emitter.on("destroyGame", async () => {
    console.warn("destroying game");

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

    gameInstance.renderer.destroy();

    // Remove game canvas from the DOM
    if (gameInstance.canvas.parentNode) {
      gameInstance.canvas.parentNode.removeChild(gameInstance.canvas);
    }

    // Destroy the game instance
    gameInstance.destroy(true);
  });
}
