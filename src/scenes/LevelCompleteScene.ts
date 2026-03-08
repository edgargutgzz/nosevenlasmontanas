import Phaser from "phaser";

export class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super("LevelCompleteScene");
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0xc8d8e0);
    this.add.rectangle(width / 2, height * 0.75, width, height * 0.5, 0xb0b8a8, 0.35);

    this.add.text(width / 2, height * 0.35, "¡LLEGASTE!", {
      fontSize: "72px",
      fontFamily: "'Press Start 2P'",
      color: "#2d2d2d",
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.52, "pero el aire te siguió.", {
      fontSize: "24px",
      fontFamily: "'Press Start 2P'",
      color: "#555555",
    }).setOrigin(0.5);

    const prompt = this.add.text(width / 2, height * 0.7, "presiona cualquier tecla para jugar de nuevo", {
      fontSize: "20px",
      fontFamily: "'Press Start 2P'",
      color: "#2d2d2d",
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
