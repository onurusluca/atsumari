import * as Phaser from "phaser";
import socket from "@/composables/useSocketIO";

// Scenes
import Preloader from "./Preloader";
import Main from "./Main";

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  backgroundColor: "#e63956",
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
  fps: {
    // target: 60,
  },
};

async function createGame(): Promise<void> {
  let gameInstance = new Phaser.Game(gameConfig);

  console.log("Game instance created", gameInstance);

  // Resize game to fit window
  window.addEventListener("resize", () => {
    gameInstance.scale.resize(window.innerWidth, window.innerHeight - 60);
  });

  // Destroy game instance on unmount
  emitter.on("destroyGame", async () => {
    destroyGame(gameInstance);
  });
}

export default async function startGame() {
  socket.on("connect", createGame);
  console.log("Socket connected");
}

function destroyGame(gameInstance: Phaser.Game) {
  // Stop game loop
  gameInstance.loop.stop();

  // Stop and remove all scenes
  gameInstance.scene.getScenes(true).forEach((scene) => {
    scene.sys.settings.active = false; // Deactivate the scene
    scene.input.shutdown(); // Shutdown scene input
    scene.sys.shutdown(); // Shutdown the scene
    gameInstance.scene.remove(scene.sys.settings.key); // Remove the scene from the game
  });

  // Remove any canvas elements added by Phaser
  if (gameInstance.canvas.parentNode) {
    gameInstance.canvas.parentNode.removeChild(gameInstance.canvas);
  }

  // Destroy the game instance
  gameInstance.destroy(true, false);

  window.removeEventListener("resize", () => {
    gameInstance.scale.resize(window.innerWidth, window.innerHeight - 60);
  });
  console.log("Destroying game instance");
}
