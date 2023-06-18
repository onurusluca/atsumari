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

export default class Main extends Phaser.Scene {
  private playerManager?: PlayerManager;
  private rooms: Room[] = [];

  constructor() {
    super("main-scene");
  }

  create() {
    socket.on("connect", this.handleConnect.bind(this));
    socket.on("disconnect", this.handleDisconnect.bind(this));
    socket.on("currentPlayers", this.handleCurrentPlayers.bind(this));
    socket.on("newPlayer", this.handleNewPlayer.bind(this));
    socket.on("playerDisconnected", this.handlePlayerDisconnected.bind(this));
    socket.on("playerMoved", this.handlePlayerMoved.bind(this));
    socket.on("playerStopped", this.handlePlayerStopped.bind(this));
  }

  update(/* time: number, delta: number */) {
    if (this.playerManager?.getLocalPlayer()) {
      this.playerManager?.handleLocalPlayerMovement();
    }
  }

  private loadPlayerSprite(player: User) {
    this.load.atlas(
      player.id,
      getCharacterSpriteSheet(player.characterSpriteName),
      CharacterSpriteFrames
    );
  }

  private handleConnect() {
    // Send my info to the server
    socket.emit("joinRoom", generalStore.spaceId, {
      id: socket.id,
      userName: generalStore.userName,
      x: 50,
      y: 30,
      direction: "down",
      lastPosition: gameLocalStorage.value.lastPosition || {
        x: 200,
        y: 200,
      },
      characterSpriteName: generalStore.characterSpriteName,
      userStatus: "online",
      userPersonalMessage: `I'm ${generalStore.userName}! I'm new here!`,
    });

    this.playerManager = new PlayerManager(this, this.rooms);
  }

  private handleDisconnect(reason: string) {
    console.error(`Socket disconnected: ${reason}`);
  }

  private handleCurrentPlayers(players: Record<string, User>) {
    Object.values(players).forEach((player) => {
      this.loadPlayerSprite(player);
      const callback =
        player.id === socket.id
          ? () => {
              this.playerManager?.addLocalPlayer(player);
              this.createPlayersAndStartGame();
            }
          : () => this.playerManager?.addRemotePlayer(player);

      this.load.once("complete", callback);
      this.load.start();
    });
  }

  private handleNewPlayer(playerInfo: User) {
    this.onUserJoin(playerInfo);
  }

  private handlePlayerDisconnected(id: string) {
    this.onUserLeave(id);
  }

  private handlePlayerMoved(playerInfo: User) {
    this.playerManager?.moveRemotePlayer(
      playerInfo.id,
      playerInfo.x,
      playerInfo.y,
      playerInfo.direction
    );
  }

  private handlePlayerStopped(playerInfo: User) {
    this.playerManager?.stopRemotePlayer(playerInfo.id, playerInfo.direction);
  }

  private onUserJoin(newUser: User) {
    this.loadPlayerSprite(newUser);

    this.load.once("complete", () => {
      this.playerManager?.addRemotePlayer(newUser);
    });

    this.load.start();
  }
  private onUserLeave(id: string) {
    // Remove user from remote players
    this.playerManager?.destroyRemotePlayer(id);
    // Remove user sprite and animations
    // FIXME: This is not done yet, currently instead of removing the sprite, we keep it but won't load it again
    /*  this.anims.remove(`${user.id}-down`);
    this.textures.remove(user.id);
 */
  }

  private createPlayersAndStartGame() {
    const mapLayers = this.createMapLayers();

    if (mapLayers) {
      const { wallsLayer } = mapLayers;

      const localPlayer = this.playerManager
        ?.getLocalPlayer()
        ?.getPlayer() as Phaser.Physics.Arcade.Sprite;

      if (localPlayer && wallsLayer) {
        // Follow player with camera
        this.cameras.main.startFollow(localPlayer);

        // Add collision between player and walls
        this.physics.add.collider(localPlayer, wallsLayer);

        // Wall collisions
        wallsLayer?.setCollisionByProperty({ collides: true });

        // Debug: draw borders and color for collision tiles
        // debugDraw(wallsLayer!, this);
      }
    }
  }

  private createMapLayers() {
    // Using 16x16 tiles, so scale up by 2x. Instead of zooming in, we scale up the tilemap and sprites to keep the ui elements on screen and keep the picture crisp.

    // Create map using the loaded tilemap in Preloader
    const map = this.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage("phaser-tiles", "tiles", 16, 16, 1, 2);

    if (tileset) {
      const groundLayer = map.createLayer("ground-layer", tileset, 0, 0);
      const wallsLayer = map.createLayer("walls-layer", tileset, 0, 0);
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
}
