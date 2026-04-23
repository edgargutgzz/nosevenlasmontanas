import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  private advanced = false;
  private pad: Phaser.Input.Gamepad.Gamepad | null = null;

  constructor() { super("BootScene"); }

  preload() {
    this.load.audio("sfx_alarm",      "/assets/sfx/dark_intro.ogg");
    this.load.audio("sfx_typewriter", "/assets/sfx/typewriter.wav");
    this.load.audio("intro_jingle",   "/assets/sfx/intro_jingle.wav");
    this.load.audio("venus",          "/assets/sfx/battle.mp3");
    this.load.audio("sfx_select",     "/assets/sfx/vgmenuselect.ogg");
    this.load.audio("mercury",        "/assets/sfx/mercury.wav");
    this.load.audio("arcade_puzzler", "/assets/sfx/arcade_puzzler.ogg");
    this.load.audio("nature_sketch",  "/assets/sfx/nature_sketch.wav");
    this.load.audio("sfx_boss_enter", "/assets/sfx/BossIntro.wav");
  }

  create() {
    this.advanced = false;
    this.pad      = null;

    const W = this.scale.width;
    const H = this.scale.height;

    this.add.rectangle(0, 0, W, H, 0x000000).setOrigin(0);

    const prompt = this.add.text(W / 2, H / 2, "PRESIONA PARA INICIAR", {
      fontSize: "20px", fontFamily: "'Press Start 2P'",
      color: "#ffffff",
    }).setOrigin(0.5);

    this.tweens.add({
      targets: prompt, alpha: 0,
      duration: 800, ease: "Sine.easeInOut", yoyo: true, repeat: -1,
    });

    this.cameras.main.fadeIn(400, 0, 0, 0);

    this.input.keyboard!.once("keydown", () => this.advance());
    this.input.gamepad!.on("connected", (pad: Phaser.Input.Gamepad.Gamepad) => {
      this.pad = pad;
      this.advance();
    });
    if (this.input.gamepad!.total > 0) this.pad = this.input.gamepad!.getPad(0);
  }

  update() {
    if (this.advanced || !this.pad) return;
    const btn = this.pad.buttons[0]?.pressed || this.pad.buttons[1]?.pressed
              || this.pad.left || this.pad.right || this.pad.up || this.pad.down;
    if (btn) this.advance();
  }

  private advance() {
    if (this.advanced) return;
    this.advanced = true;
    this.sound.play("intro_jingle", { loop: false, volume: 0.6 });
    this.cameras.main.fadeOut(300, 0, 0, 0);
    // DEV: skip DataScene — revert before shipping
    this.cameras.main.once("camerafadeoutcomplete", () => this.scene.start("StartScene"));
  }
}
