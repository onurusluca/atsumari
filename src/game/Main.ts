import Phaser from "phaser";
import { debugDraw } from "./helpers/debug";
import PlayerManager from "./player/PlayerManager";
import type { User, Room } from "@/types/canvasTypes";

import { MAP_SCALE_FACTOR } from "./helpers/constants";
import socket from "@/composables/useSocketIO";

import CharacterSpriteFrames from "./images/characters/character-sprite-frames.json";
import { getCharacterSpriteSheet } from "./images/characters/imports";

const generalStore = useGeneralStore();
const gameLocalStorage = useStorage("atsumari_game", {
  lastPosition: { x: 0, y: 0 },
});

export default class Maim extends Phaser.Scene {
  private playerManager?: PlayerManager;
  private rooms: Room[];

  constructor() {
    super("main-scene");

    this.rooms = [];
  }

  create() {
    socket.on("connect", () => {
      socket.emit("joinRoom", generalStore.spaceId, {
        id: socket.id,
        userName: generalStore.userName,
        x: 50,
        y: 30,
        facingTo: "down",
        lastPosition: gameLocalStorage.value.lastPosition || {
          x: 200,
          y: 200,
        },
        characterSpriteName: generalStore.characterSpriteName,
        userStatus: "online",
        userPersonalMessage: `I'm ${generalStore.userName}! I'm new here!`,
      });

      this.playerManager = new PlayerManager(this, this.rooms);
    });

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${reason}`);
    });

    socket.on("currentPlayers", (players: any) => {
      console.log("currentPlayers", players);

      Object.keys(players).forEach((id) => {
        if (players[id].id === socket.id) {
          this.load.atlas(
            players[id].id,
            getCharacterSpriteSheet(players[id].characterSpriteName),
            CharacterSpriteFrames
          );

          this.load.once("complete", () => {
            this.playerManager!.addLocalPlayer(players[id]);
            console.log(id);
            this.createPlayersAndStartGame();
          });

          this.load.start();
        } else {
          this.load.atlas(
            players[id].id,
            getCharacterSpriteSheet(players[id].characterSpriteName),
            CharacterSpriteFrames
          );

          this.load.once("complete", () => {
            this.playerManager!.addRemotePlayer(players[id]);
            console.log(id);
          });

          this.load.start();
        }
      });
    });

    socket.on("newPlayer", (playerInfo) => {
      console.log("newPlayer", playerInfo);

      this.onUserJoin(playerInfo);
    });

    socket.on("playerDisconnected", (id) => {
      this.onUserLeave(id);
    });

    socket.on("playerMoved", (playerInfo) => {
      console.log("Main: playerMoved", playerInfo);

      this.playerManager!.moveRemotePlayer(
        playerInfo.id,
        playerInfo.x,
        playerInfo.y,
        playerInfo.facingTo
      );
    });

    socket.on("playerStopped", (playerInfo) => {
      console.log("Main: playerStopped", playerInfo);
      this.playerManager!.stopRemotePlayer(
        playerInfo.id,
        playerInfo.x,
        playerInfo.y,
        playerInfo.facingTo
      );
    });
  }

  update(/* time: number, delta: number */) {
    if (this.playerManager?.getLocalPlayer()) {
      this.playerManager!.handleLocalPlayerMovement();
    }
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
    });

    this.load.start();
  }

  private onUserLeave(id: string) {
    console.log(`User has left:`, id);
    // Remove user from remote players
    this.playerManager!.destroyRemotePlayer(id);
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
    const map = this.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage("phaser-tiles", "tiles", 16, 16, 1, 2);
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

    return { groundLayer, wallsLayer };
  }
}
