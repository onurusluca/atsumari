import * as PIXI from "pixi.js";
import { addStats, Stats } from "pixi-stats";
import bunny_image_url from "./bunny.png";
import shadow_image_url from "@/canvas/images/shadow.png";
import dog_image_url from "@/canvas/images/dog.png";
async function createCanvasApp(canvas: HTMLCanvasElement) {
  // Empty canvas
  // Create a Pixi Application
  const app = new PIXI.Application({
    width: 1000,
    height: 500,
    backgroundColor: 0x0000ff,
    antialias: true,
    view: canvas,
  });

  // Add Bunny
  const texture = PIXI.Texture.from(bunny_image_url);
  const bunny = new PIXI.Sprite(texture);
  bunny.x = app.view.width / 2;
  bunny.y = app.view.height / 2;

  // When click is on on canvas, add 10 bunnies at random positions
  app.stage.eventMode = "dynamic";
  app.stage.on("click", (event) => {
    for (let i = 0; i < 1510; i++) {
      const bunny = new PIXI.Sprite(texture);
      bunny.x = Math.random() * app.view.width;
      bunny.y = Math.random() * app.view.height;
      bunny.anchor.x = Math.random() * 4;
      bunny.anchor.y = Math.random() * 4;
      bunny.scale.x = Math.random() * 4;
      bunny.scale.y = Math.random() * 4;
      bunny.rotation = Math.random() * 4;
      // Rotate around center constantly
      bunny.pivot.x = bunny.width / 2;
      bunny.pivot.y = bunny.height / 2;

      app.stage.addChild(bunny);
    }
  });

  // Add Keyboard
  const keys: {
    [key: string]: boolean;
  } = {
    w: false,
    a: false,
    s: false,
    d: false,
  };
  window.addEventListener("keydown", (event) => (keys[event.key] = true));
  window.addEventListener("keyup", (event) => (keys[event.key] = false));

  // Add Rectangle
  const Graphics = PIXI.Graphics;
  const rectangle = new Graphics();
  rectangle.beginFill("red").lineStyle(4).drawRect(111, 111, 64, 64).endFill();
  app.stage.addChild(rectangle);

  // Add Polygon
  const poly = new Graphics();
  poly
    .beginFill(0x00ff00)
    .lineStyle(4)
    .drawPolygon([0, 0, 32, 64, 64, 0, 22, 51])
    .endFill();
  poly.x = 64;
  poly.y = 130;
  app.stage.addChild(poly);

  // Add Circle
  const circle = new Graphics();
  circle.beginFill(0xff0000).drawCircle(0, 0, 32).endFill();
  circle.x = 64;
  circle.y = 64;
  app.stage.addChild(circle);

  // Add Text
  const textStyles = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 36,
    fontStyle: "italic",
    fontWeight: "bold",
    fill: ["#ffffff", "#00ff99"], // gradient
    stroke: "#4a1850",
    strokeThickness: 5,
    dropShadow: true,
    dropShadowColor: "#000000",
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
    wordWrap: true,
    wordWrapWidth: 440,
  });
  const myText = new PIXI.Text("Hello Pixi!", textStyles);
  myText.x = 100;
  myText.y = 100;
  myText.text = "Text changed!";

  // Loop
  /*   app.ticker.add((delta) => loop(delta));
  function loop(delta: number) {
    // Add Rectangle that is created at random position every frame
    const rect = new Graphics();
    rect
      .beginFill(0x66ccff)
      .drawRect(
        Math.random() * app.screen.width,
        Math.random() * app.screen.height,
        Math.random() * 10,
        Math.random() * 10
      )
      .endFill();

    app.stage.addChild(rect);
  } */

  // Add Image
  const image = PIXI.Texture.from("https://picsum.photos/200/300");
  const imageSprite = new PIXI.Sprite(image);
  imageSprite.x = 100;
  imageSprite.y = 100;
  imageSprite.width = 200;
  imageSprite.height = 300;
  imageSprite.scale.set(0.5, 0.5);
  app.stage.addChild(imageSprite);

  // Loop
  app.ticker.add((delta) => loop(delta));
  function loop(delta: number) {
    // Bounce the image on canvas edges

    // center the sprite's anchor point
    bunny.anchor.set(0.5);
    imageSprite.x += 0.1;
    imageSprite.y += 0.1;
    imageSprite.scale.set(+1, +1);
  }

  // CONTAINERS
  // Containers in pixi are like divs in html. They are used to group elements together. They can be nested.
  const container = new PIXI.Container();

  const bunnyImg = PIXI.Texture.from(bunny_image_url);
  const bunnySprite = new PIXI.Sprite(bunnyImg);
  container.addChild(bunnySprite);

  const shadowImg = PIXI.Texture.from(shadow_image_url);
  const shadowSprite = new PIXI.Sprite(shadowImg);
  container.addChild(shadowSprite);

  app.stage.addChild(container);
  shadowSprite.scale.set(10, 10);

  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2;

  /*   console.log(container.width, container.height);
  console.log(container.getBounds());
  console.log(bunnySprite.getBounds());
 */
  // Add keyboard movement logic to app
  app.ticker.add(() => {
    if (keys.w) bunny.y -= 1;
    if (keys.a) bunny.x -= 1;
    if (keys.s) bunny.y += 1;
    if (keys.d) bunny.x += 1;
  });

  // Particle Container
  const particleContainer = new PIXI.ParticleContainer(1000, {
    position: true,
    rotation: true,
    vertices: true,
    tint: true,
    uvs: true,
  });

  /*  for (let i = 0; i < 100; ++i) {
    let sprite = PIXI.Sprite.from(dog_image_url);
    particleContainer.addChild(sprite);
  } */
  app.stage.addChild(particleContainer);

  // Add Stats for FPS, MS, MB...
  const stats: Stats = addStats(document, app);
  app.ticker.add(stats.update, stats, PIXI.UPDATE_PRIORITY.UTILITY);

  // Change stats position

  // Tile Sets
  const tileset = PIXI.Texture.from(dog_image_url);
  console.log(tileset);
  tileset.baseTexture.width = 64;
  tileset.baseTexture.height = 64;

  const rect = new PIXI.Rectangle(0, 0, 16, 16);
  tileset.frame = rect;
  const tile = new PIXI.Sprite(tileset);
  tile.scale.set(2, 2);
  app.stage.addChild(tile);
}

export { createCanvasApp };
