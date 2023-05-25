import kaboom from "kaboom";
import * as Phaser from "phaser";
import bean_sprite_url from "./sprites/bean.png";
import tileset_sprite_url from "./images/tileset.png";
import jsonnnnnnnnnnnn from "./images/test-map.json";
import { tiledToKaboom } from "./helpers/tileMapParser";

const k = kaboom();

// Load your tileset image
k.loadSprite("tileset", tileset_sprite_url);

// Define your game objects
const GAME_OBJECTS = {
  0: "empty",
  129: {
    sprite: "tileset", // the sprite name
    frame: 0, // the frame number in the sprite
  },
  // Add more objects if needed
};

const layers = tiledToKaboom(jsonnnnnnnnnnnn);

layers.forEach((layer) => {
  k.addLevel(layer.grid, GAME_OBJECTS);
});
