import Phaser from "phaser";

export class PlayerBanner extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics;
  private circle: Phaser.GameObjects.Arc;
  private userNameText: Phaser.GameObjects.Text;
  private userStatusText: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    userName: string,
    userStatus: string,
    userTextStatus: string
  ) {
    super(scene, x, y);

    this.bg = scene.add.graphics();
    this.bg.fillStyle(0x000000, 0.5);
    this.bg.fillRoundedRect(-100, -30, 200, 60, 10);

    this.circle = scene.add.circle(-80, 0, 10, this.statusColor(userStatus));
    this.userNameText = scene.add.text(-60, -20, userName, {
      color: "#ffffff",
      fontSize: "16px",
    });
    this.userStatusText = scene.add.text(-60, 0, userTextStatus, {
      color: "#ffffff",
      fontSize: "14px",
    });

    this.add(this.bg);
    this.add(this.circle);
    this.add(this.userNameText);
    this.add(this.userStatusText);

    scene.add.existing(this);
  }

  statusColor(status: string): number {
    switch (status) {
      case "online":
        return 0x00ff00;
      case "offline":
        return 0xff0000;
      case "away":
        return 0xffff00;
      default:
        return 0xffffff;
    }
  }

  updatePosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  updateUserStatus(status: string, textStatus: string) {
    this.circle.fillColor = this.statusColor(status);
    this.userStatusText.text = textStatus;
  }
}
