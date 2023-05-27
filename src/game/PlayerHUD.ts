import Phaser from "phaser";

export default class PlayerHealthBar {
  private scene: Phaser.Scene;
  private health: number;
  private healthBar: Phaser.GameObjects.Graphics;
  private container: Phaser.GameObjects.Container; // added this

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.health = 100; // Assuming health is between 0 and 100

    this.healthBar = this.scene.add.graphics();
    this.container = this.scene.add.container(x, y); // added this
    this.container.add(this.healthBar); // added this

    this.draw();
  }

  decrease(amount: number) {
    this.health = Math.max(this.health - amount, 0);
    this.draw();
  }

  increase(amount: number) {
    this.health = Math.min(this.health + amount, 100);
    this.draw();
  }

  draw() {
    this.healthBar.clear();
    // Assuming the health bar is 40 px wide, change as needed
    let width = 40 * (this.health / 100);
    this.healthBar.fillStyle(0xffffff);
    this.healthBar.fillRect(0, 0, width, 5); // changed this
  }

  updatePosition(x: number, y: number) {
    this.container.x = x; // changed this
    this.container.y = y; // changed this
    this.draw();
  }
}
