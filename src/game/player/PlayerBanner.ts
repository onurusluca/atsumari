import Phaser from "phaser";

const statusIconPosition = {
  x: 12,
  y: 12,
};

const playerNamePosition = {
  x: 22,
  y: 13,
};

const playerTypePosition = {
  x: 0,
  y: 13,
};

const playerStatusPosition = {
  x: 22,
  y: 30,
};

let bannerWidth = 0;
const bannerHeight = 42;
const bannerPadding = 30;

export class PlayerBanner extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Graphics;
  private statusIcon: Phaser.GameObjects.Graphics;
  private playerName: Phaser.GameObjects.Text;
  private playerType: Phaser.GameObjects.Text;
  private playerStatus: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    userStatus: string,
    userName: string,
    userType: string,
    userCustomTextStatus: string,
    userNameColor: string,
    userBannerColor: string
  ) {
    super(scene, x, y);
    this.setDepth(4);
    this.statusIcon = scene.add.graphics({ x: 0, y: 0 });
    this.statusIcon.fillStyle(this.getStatusColor(userStatus), 1);
    this.statusIcon.fillCircle(statusIconPosition.x, statusIconPosition.y, 5); // Status icon size

    // Player name
    this.playerName = scene.add
      .text(playerNamePosition.x, playerNamePosition.y, userName, {
        color: userNameColor,
        fontSize: "16px",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5);

    // Guest, admin, etc.
    this.playerType = scene.add
      .text(
        this.playerName.x + this.playerName.width + playerTypePosition.x,
        playerTypePosition.y,
        `(${userType})`,
        {
          color: "rgba(255,255,255,0.8)",
          fontSize: "14px",
        }
      )
      .setOrigin(0, 0.5);

    // Online, offline, away, etc.
    this.playerStatus = scene.add
      .text(playerStatusPosition.x, playerStatusPosition.y, userCustomTextStatus, {
        color: "rgba(255,255,255,0.8)",
        fontSize: "14px",
      })
      .setOrigin(0, 0.5);

    // Banner body
    // Calculate the banner width
    bannerWidth =
      this.playerStatus.width > this.playerName.width + this.playerType.width
        ? this.playerStatus.width + bannerPadding
        : this.playerName.width + this.playerType.width + bannerPadding;
    this.background = scene.add.graphics({ x: 0, y: 0 });
    this.background.fillStyle(parseInt(userBannerColor.replace(/^#/, ""), 16), 1);
    this.background.fillRoundedRect(0, 0, bannerWidth, bannerHeight, 10); // Rounded corners

    this.add([
      this.background,
      this.statusIcon,
      this.playerName,
      this.playerType,
      this.playerStatus,
    ]);
    scene.add.existing(this);
  }

  private getStatusColor(status: string): number {
    // hexadecimal color codes
    // In JavaScript and TypeScript, a hexadecimal color code can be represented as a number by removing the # and prefixing with 0x. So, #1c9c55 would be written as 0x1c9c55.
    switch (status) {
      case "online":
        return 0x00ff00; // green
      case "offline":
        return 0xff0000; // red
      case "away":
        return 0xffff00; // yellow
      default:
        return 0xffffff; // white
    }
  }

  public getBannerWidth(): number {
    return bannerWidth;
  }

  public updatePosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
