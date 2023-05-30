import Phaser from "phaser";

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

    this.background = scene.add.graphics({ x: 0, y: 0 });
    this.background.fillStyle(parseInt(userBannerColor.replace(/^#/, ""), 16), 1);
    this.background.fillRect(0, 0, 220, 60);

    this.statusIcon = scene.add.graphics({ x: 0, y: 0 });
    this.statusIcon.fillStyle(this.getStatusColor(userStatus), 1);
    this.statusIcon.fillCircle(10, 20, 10);

    this.playerName = scene.add.text(50, 0, userName, {
      color: userNameColor,
      fontSize: "20px",
      fontStyle: "bold",
    });
    this.playerType = scene.add.text(150, 2, `(${userType})`, {
      color: "rgba(255,255,255,0.8)",
      fontSize: "15px",
    });
    this.playerStatus = scene.add.text(0, 30, userCustomTextStatus, {
      color: "rgba(255,255,255,0.8)",
      fontSize: "15px",
    });

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

  public updatePosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
