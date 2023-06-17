import * as Phaser from "phaser";

// Scenes
import Preloader from "./Preloader";
import Main from "./Main";

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "space__game-parent",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
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
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: "space__game-parent",
    /*   width: window.innerWidth,
    height: window.innerHeight - 60, */
  },
  render: {
    roundPixels: true,
    pixelArt: true,
  },
  fps: {},
};

export default async function createGame(): Promise<void> {
  let gameInstance = new Phaser.Game(gameConfig);

  // Resize game to fit window
  window.addEventListener("resize", () => {
    gameInstance.scale.resize(window.innerWidth, window.innerHeight - 60);
  });

  // Destroy game instance on unmount
  emitter.on("destroyGame", async () => {
    gameInstance.loop.stop();

    for (let scene of gameInstance.scene.getScenes(true)) {
      scene.sys.events.shutdown();
      scene.scene.stop();
      gameInstance.scene.remove(scene.sys.settings.key);
    }

    gameInstance.renderer.destroy();

    if (gameInstance.canvas.parentNode) {
      gameInstance.canvas.parentNode.removeChild(gameInstance.canvas);
    }

    gameInstance.destroy(true);
  });
}
