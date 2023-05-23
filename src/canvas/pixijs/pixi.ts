import * as PIXI from "pixi.js";
import dog_image_url from "@/canvas/images/dog.png";
import world_image_url from "@/canvas/images/newworld.png";
import Stats from "stats.js";

type KeyType = "w" | "a" | "s" | "d" | "";
async function createCanvasApp(canvas: HTMLCanvasElement) {
  // Setup Pixi Application
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

  // Create frames for each direction of character movement
  const dogSheet = PIXI.BaseTexture.from(dog_image_url);
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

  const walkFrames: Record<string, PIXI.Texture[]> = {};
  for (const direction in walkDirections) {
    walkFrames[direction] = walkDirections[direction].map(
      ([x, y]) => new PIXI.Texture(dogSheet, new PIXI.Rectangle(x, y, 16, 16))
    );
  }

  // Create character sprite
  const dogSheetAnim = new PIXI.AnimatedSprite(walkFrames["walk-down"]);
  dogSheetAnim.position.set(app.view.width / 2, app.view.height / 2);
  dogSheetAnim.scale.set(4, 4);
  dogSheetAnim.animationSpeed = 0.1;

  // Create container for map and character sprite
  const worldContainer = new PIXI.Container();
  worldContainer.addChild(worldMapSprite);
  worldContainer.addChild(dogSheetAnim);
  app.stage.addChild(worldContainer);

  // Lower movement speed
  const speed = 3;

  // Keyboard controls
  let lastKey: KeyType = "";
  window.addEventListener("keydown", (event) => {
    lastKey = event.key as KeyType;
  });
  window.addEventListener("keyup", () => {
    lastKey = "";
  });

  // Ticker for handling map movement and character animation
  app.ticker.add(() => {
    const directions: Record<KeyType, [string, () => void]> = {
      w: ["walk-up", () => (worldMapSprite.y += speed)],
      a: ["walk-left", () => (worldMapSprite.x += speed)],
      s: ["walk-down", () => (worldMapSprite.y -= speed)],
      d: ["walk-right", () => (worldMapSprite.x -= speed)],
      "": ["walk-down", () => {}], // No movement
    };

    const [direction, movement] = directions[lastKey];
    dogSheetAnim.textures = walkFrames[direction];
    dogSheetAnim.gotoAndPlay(0);
    movement();

    if (lastKey === "") {
      dogSheetAnim.gotoAndStop(0);
    }
  });

  // Add Stats for FPS, MS, MB...
  const stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  stats.dom.style.position = "absolute";
  stats.dom.style.left = "1.4rem";
  stats.dom.style.top = ".8rem";
  stats.dom.style.transform = "scale(1.5)";
  document.body.appendChild(stats.dom);
  app.ticker.add(() => stats.update());
}

export { createCanvasApp };
