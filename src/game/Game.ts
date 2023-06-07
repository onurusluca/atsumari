import Phaser from "phaser";
import { debugDraw } from "./helpers/debug";
import PlayerManager from "./player/PlayerManager";
import type { User, Room } from "@/types/canvasTypes";
import { getCharacterSpriteSheet } from "./images/characters/imports";
import CharacterSpriteFrames from "./images/character-sprite-frames.json";

import { MAP_SCALE_FACTOR } from "./helpers/constants";

export default class Game extends Phaser.Scene {
  private readonly users: User[] = [];
  private playerManager?: PlayerManager;
  private rooms: Room[];

  constructor(users: User[]) {
    super("game-scene");
    this.users = users;

    this.rooms = [];
  }

  create() {
    this.playerManager = new PlayerManager(this, this.users, this.rooms);
    this.createPlayersAndStartGame();

    emitter.on("newUserJoined", (user) => this.onUserJoin(user));
    emitter.on("userLeft", (user) => this.onUserLeave(user));
    emitter.on("userPositionUpdated", (user) =>
      this.playerManager!.moveRemotePlayer(user)
    );

    this.playerManager.initialMoveRemotePlayers(this.users);
  }

  update(/* time: number, delta: number */) {
    this.playerManager!.handleLocalPlayerMovement();
  }

  private onUserJoin(newUser: User) {
    console.log(`New user joined:`, newUser);

    // Load the atlas for the new user and then create the player
    this.load.atlas(
      newUser.id,
      getCharacterSpriteSheet(newUser.characterSpriteName),
      CharacterSpriteFrames
    );

    this.load.once("complete", () => {
      this.playerManager!.addRemotePlayer(newUser);
      console.log(this.users);
    });

    this.load.start();
  }

  private onUserLeave(user: User) {
    console.log(`User has left:`, user);
    // Remove user from remote players
    this.playerManager!.removeRemotePlayer(user.id);
    // Remove user sprite and animations
    // FIXME: This is not done yet, currently instead of removing the sprite, we keep it but won't load it again
    /*  this.anims.remove(`${user.id}-down`);
    this.textures.remove(user.id);
 */
  }

  private createPlayersAndStartGame() {
    const { wallsLayer } = this.createMapLayers();

    let localPlayer = this.playerManager
      ?.getLocalPlayer()
      .getPlayer() as Phaser.Physics.Arcade.Sprite;

    // Follow player with camera
    this.cameras.main.startFollow(localPlayer);

    // Add collision between player and walls
    this.physics.add.collider(localPlayer, wallsLayer!);

    // Wall collisions
    wallsLayer!.setCollisionByProperty({ collides: true });

    // FIXME: For some reason, when players collide they vibrate and glitch
    // Add collision between local and remote players
    /* Object.keys(this.playerManager.getRemotePlayers()).forEach((userId) => {
      this.physics.add.collider(
        this.playerManager.getLocalPlayer().getPlayer(),
        this.playerManager.getRemotePlayers()[userId].getPlayer()
      );
    }); */

    // Debug: draw borders and color for collision tiles
    // debugDraw(wallsLayer!, this);
  }

  private createMapLayers() {
    // Using 16x16 tiles, so scale up by 2x. Instead of zooming in, we scale up the tilemap and sprites to keep the ui elements on screen and keep the picture crisp.

    // Create map using the loaded tilemap in Preloader
    const map = this.make.tilemap({ key: "world-map" });
    const tileset = map.addTilesetImage("phaser-tiles", "world-tiles", 16, 16, 1, 2);
    const groundLayer = map.createLayer("ground-layer", tileset!, 0, 0);
    const wallsLayer = map.createLayer("walls-layer", tileset!, 0, 0);
    const roomObjectLayer = map.getObjectLayer("roomObjectLayer")!["objects"];
    roomObjectLayer.forEach((obj: any) => {
      this.rooms.push(obj);
    });

    groundLayer?.setScale(MAP_SCALE_FACTOR);
    wallsLayer?.setScale(MAP_SCALE_FACTOR);

    // Set camera bounds so the camera won't go outside the game world
    this.cameras.main.setBounds(
      0,
      0,
      map.widthInPixels * MAP_SCALE_FACTOR,
      map.heightInPixels * MAP_SCALE_FACTOR
    );

    // Set world bounds to the size of the map so the user can't walk outside the map
    this.physics.world.setBounds(
      0,
      0,
      map.widthInPixels * MAP_SCALE_FACTOR,
      map.heightInPixels * MAP_SCALE_FACTOR
    );

    // When Phaser is ready, log a message in the console
    emitter.emit("gameLoaded");

    return { groundLayer, wallsLayer };
  }
}
