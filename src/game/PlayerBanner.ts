import Phaser from "phaser";

export class PlayerBanner extends Phaser.GameObjects.Container {
  private statusIcon: Phaser.GameObjects.Image;
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

    this.statusIcon = scene.add.image(0, 0, userStatus);
    this.playerName = scene.add.text(50, 0, userName, {
      color: userNameColor,
      fontSize: "20px",
      fontStyle: "bold",
    });
    this.playerType = scene.add.text(200, 0, `(${userType})`, {
      color: "rgba(255,255,255,0.8)",
      fontSize: "15px",
    });
    this.playerStatus = scene.add.text(0, 30, userCustomTextStatus, {
      color: "rgba(255,255,255,0.8)",
      fontSize: "15px",
    });

    this.add([this.statusIcon, this.playerName, this.playerType, this.playerStatus]);
    scene.add.existing(this);
  }
  public updatePosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
