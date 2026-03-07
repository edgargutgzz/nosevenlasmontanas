import Phaser from "phaser";

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x111111);

    this.add.text(width / 2, height * 0.35, "YOU RAN OUT OF AIR", {
      fontSize: "60px",
      fontFamily: "monospace",
      color: "#ff4444",
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.52, "the pollution got to you.", {
      fontSize: "22px",
      fontFamily: "monospace",
      color: "#aaaaaa",
    }).setOrigin(0.5);

    const prompt = this.add.text(width / 2, height * 0.7, "press any key to try again", {
      fontSize: "20px",
      fontFamily: "monospace",
      color: "#ffffff",
    }).setOrigin(0.5);

    this.tweens.add({ targets: prompt, alpha: 0, duration: 600, yoyo: true, repeat: -1 });

    this.input.keyboard!.once("keydown", () => this.restart());
    this.input.gamepad!.once("down", () => this.restart());
  }

  private restart() {
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("GameScene");
    });
  }
}
