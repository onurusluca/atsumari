export default class UiScene extends Phaser.Scene {
  private fpsText!: Phaser.GameObjects.Text;
  private frameTimes: number[] = [];

  constructor() {
    super({ key: "ui-scene", active: true });
  }

  create() {
    // FPS
    this.fpsText = this.add
      .text(10, 10, "FPS: 0", {
        font: "bold 12px Arial",
        fill: "#000",
      })
      .setDepth(1);
  }

  update(time: number, delta: number): void {
    // Reference to the main scene's camera
    const mainCamera = this.scene.get("game-scene").cameras.main;

    // Set fpsText position relative to the main camera
    this.fpsText.setPosition(mainCamera.scrollX + 10, mainCamera.scrollY + 10);

    // Update frameTimes
    this.frameTimes.push(delta);
    if (this.frameTimes.length > 10) {
      // Or whatever number you want for averaging
      this.frameTimes.shift();
    }
    // Compute average frame time and convert to FPS
    const averageFrameTime =
      this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const fps = 1000 / averageFrameTime;

    // Update FPS text
    this.fpsText.setText(`FPS: ${Math.round(fps)}`);
  }
}
