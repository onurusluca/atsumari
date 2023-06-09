import Phaser from "phaser";
import socket from "@/composables/useSocketIO";

export default class Main extends Phaser.Scene {
  otherPlayers: Phaser.Physics.Arcade.Group;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  car!: Phaser.Physics.Arcade.Image;
  constructor() {
    super("main");
    this.otherPlayers = null!;
  }

  create() {
    socket.on("connect", () => {
      console.log("Connected to server");
    });
    this.cameras.main.setBackgroundColor("rgb(0, 0, 255)");
    this.otherPlayers = this.physics.add.group();
    socket.on("currentPlayers", (players: any) => {
      console.log("currentPlayers", players);

      Object.keys(players).forEach((id) => {
        if (players[id].playerId === socket.id) {
          this.addPlayer(players[id]);
        } else {
          this.addOtherPlayers(players[id]);
        }
      });
    });

    socket.on("newPlayer", (playerInfo) => {
      this.addOtherPlayers(playerInfo);
    });

    socket.on("playerDisconnected", (playerId) => {
      this.otherPlayers.getChildren().forEach((otherPlayer) => {
        if (playerId === otherPlayer.playerId) {
          otherPlayer.destroy();
        }
      });
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    socket.on("playerMoved", (playerInfo) => {
      this.otherPlayers.getChildren().forEach((otherPlayer) => {
        if (playerInfo.playerId === otherPlayer.playerId) {
          otherPlayer.setRotation(playerInfo.rotation);
          otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        }
      });
    });
  }

  private addPlayer(playerInfo: any) {
    this.car = this.physics.add
      .image(playerInfo.x, playerInfo.y, "car")
      .setOrigin(0.5, 0.5)
      .setDisplaySize(50, 50);

    this.car.setCollideWorldBounds(true);
    this.car.setTint(playerInfo.color);
    this.car.setDrag(1000);
  }

  private addOtherPlayers(playerInfo: any) {
    const otherPlayer = this.physics.add
      .image(playerInfo.x, playerInfo.y, "car")
      .setOrigin(0.5, 0.5)
      .setDisplaySize(50, 50)
      .setRotation(playerInfo.rotation);

    otherPlayer.playerId = playerInfo.playerId;
    otherPlayer.setTint(playerInfo.color);
    this.otherPlayers.add(otherPlayer);
  }

  update() {
    if (this.car) {
      if (
        this.cursors.left.isDown &&
        (this.cursors.up.isDown || this.cursors.down.isDown)
      ) {
        this.car.setAngularVelocity(-100);
      } else if (
        this.cursors.right.isDown &&
        (this.cursors.up.isDown || this.cursors.down.isDown)
      ) {
        this.car.setAngularVelocity(100);
      } else {
        this.car.setAngularVelocity(0);
      }

      const velX = Math.cos((this.car.angle - 360) * 0.01745);
      const velY = Math.sin((this.car.angle - 360) * 0.01745);
      if (this.cursors.up.isDown) {
        this.car.setVelocityX(200 * velX);
        this.car.setVelocityY(200 * velY);
      } else if (this.cursors.down.isDown) {
        this.car.setVelocityX(-100 * velX);
        this.car.setVelocityY(-100 * velY);
      } else {
        this.car.setVelocity(0);
      }

      const currPosition = {
        x: this.car.x,
        y: this.car.y,
        rotation: this.car.rotation,
      };
      if (
        this.car.oldPosition &&
        (currPosition.x !== this.car.oldPosition.x ||
          currPosition.y !== this.car.oldPosition.y ||
          currPosition.rotation !== this.car.oldPosition.rotation)
      ) {
        socket.emit("playerMovement", currPosition);
      }

      this.car.oldPosition = currPosition;
    }
  }
}
