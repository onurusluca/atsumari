import * as PIXI from "pixi.js";
import character_sprite_url from "@/canvas/images/dog.png";
import world_image_url from "@/canvas/images/newworld.png";
import Stats from "stats.js";

const keysPressed: Record<string, boolean> = {
  w: false,
  a: false,
  s: false,
  d: false,
};

async function createCanvasApp(canvas: HTMLCanvasElement) {
  // Crispy pixels!
  PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;

  // Create PIXI application
  const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x0000ff,
    antialias: true,
    view: canvas,
  });

  // Load map texture and create sprite
  const worldMap = PIXI.Texture.from(world_image_url);
  const worldMapSprite = new PIXI.Sprite(worldMap);
  worldMapSprite.scale.set(3, 3);

  // Set initial position of map sprite
  worldMapSprite.position.set(-2000, -2200);

  // Create frames for each direction of character movement
  const characterSprite = PIXI.BaseTexture.from(character_sprite_url);
  const walkDirections: Record<string, [number, number][]> = {
    "walk-down": [
      [0, 0],
      [0, 16],
      [0, 32],
      [0, 48],
    ],
    "walk-up": [
      [16, 0],
      [16, 16],
      [16, 32],
      [16, 48],
    ],
    "walk-left": [
      [32, 0],
      [32, 16],
      [32, 32],
      [32, 48],
    ],
    "walk-right": [
      [48, 0],
      [48, 16],
      [48, 32],
      [48, 48],
    ],
  };

  // Create textures for each frame
  const walkFrames: Record<string, PIXI.Texture[]> = {};
  for (const direction in walkDirections) {
    walkFrames[direction] = walkDirections[direction].map(
      ([x, y]) => new PIXI.Texture(characterSprite, new PIXI.Rectangle(x, y, 16, 16))
    );
  }

  // Create character sprite
  const characterSpriteAnimation = new PIXI.AnimatedSprite(
    walkFrames["walk-down"],
    true
  );
  characterSpriteAnimation.scale.set(4, 4);
  characterSpriteAnimation.animationSpeed = 0.2;

  // Center character sprite on screen
  characterSpriteAnimation.position.set(app.view.width / 2.1, app.view.height / 2.3);

  // Add sprites to container and add container to stage
  const worldContainer = new PIXI.Container();
  worldContainer.addChild(worldMapSprite);
  worldContainer.addChild(characterSpriteAnimation);
  app.stage.addChild(worldContainer);

  const speed = 3;

  const directions: Record<string, [string, () => void]> = {
    w: ["walk-up", () => (worldMapSprite.y += speed)],
    a: ["walk-left", () => (worldMapSprite.x += speed)],
    s: ["walk-down", () => (worldMapSprite.y -= speed)],
    d: ["walk-right", () => (worldMapSprite.x -= speed)],
  };

  // Handle keypress
  const keysOrder: string[] = [];
  window.addEventListener("keydown", (event) => {
    if (event.key in keysPressed) {
      keysPressed[event.key] = true;

      // Remove key from array if it already exists, then push it to the end
      const index = keysOrder.indexOf(event.key);
      if (index > -1) {
        keysOrder.splice(index, 1);
      }
      keysOrder.push(event.key);

      const lastKey = keysOrder[keysOrder.length - 1];
      const direction = directions[lastKey][0];
      if (
        !characterSpriteAnimation.playing ||
        characterSpriteAnimation.textures !== walkFrames[direction]
      ) {
        characterSpriteAnimation.textures = walkFrames[direction];
        characterSpriteAnimation.gotoAndPlay(0);
      }
    }
  });

  window.addEventListener("keyup", (event) => {
    if (event.key in keysPressed) {
      keysPressed[event.key] = false;

      // Remove key from array
      const index = keysOrder.indexOf(event.key);
      if (index > -1) {
        keysOrder.splice(index, 1);
      }

      // If there are other keys still being pressed, update direction
      // Otherwise, stop animation
      if (keysOrder.length > 0) {
        const lastKey = keysOrder[keysOrder.length - 1];
        const direction = directions[lastKey][0];
        if (characterSpriteAnimation.textures !== walkFrames[direction]) {
          characterSpriteAnimation.textures = walkFrames[direction];
          characterSpriteAnimation.gotoAndPlay(0);
        }
      } else {
        characterSpriteAnimation.gotoAndStop(0);
      }
    }
  });

  // Game loop
  app.ticker.add(() => {
    let movement = () => {};

    if (keysOrder.length > 0) {
      const lastKey = keysOrder[keysOrder.length - 1];
      [, movement] = directions[lastKey];
    }

    movement();
  });

  // Stats
  const stats = new Stats();
  stats.showPanel(0);
  stats.dom.style.position = "absolute";
  stats.dom.style.left = "1.4rem";
  stats.dom.style.top = ".8rem";
  stats.dom.style.transform = "scale(1.5)";
  document.body.appendChild(stats.dom);
  app.ticker.add(() => stats.update());
}

export { createCanvasApp };
