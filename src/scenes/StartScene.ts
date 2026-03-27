import Phaser from "phaser";

export class StartScene extends Phaser.Scene {
  constructor() {
    super("StartScene");
  }

  preload() {
    // this.load.audio("bgmusic", "/assets/music/bgmusic.wav");
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // ── Fade in ───────────────────────────────────────────────────
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // ── Background: cielo contaminado ─────────────────────────────
    const bg = this.add.graphics();
    bg.fillStyle(0x2a1200, 1);
    bg.fillRect(0, 0, W, H);

    // Siluetas de edificios (fondo, más pequeños)
    bg.fillStyle(0x0d0600, 1);
    const buildingsBack = [
      [0, 0.72, 0.08, 0.28], [0.06, 0.65, 0.07, 0.35], [0.12, 0.70, 0.05, 0.30],
      [0.16, 0.60, 0.09, 0.40], [0.24, 0.68, 0.06, 0.32], [0.29, 0.63, 0.08, 0.37],
      [0.36, 0.58, 0.07, 0.42], [0.42, 0.66, 0.06, 0.34], [0.47, 0.61, 0.09, 0.39],
      [0.55, 0.69, 0.07, 0.31], [0.61, 0.55, 0.08, 0.45], [0.68, 0.64, 0.06, 0.36],
      [0.73, 0.70, 0.08, 0.30], [0.80, 0.59, 0.07, 0.41], [0.86, 0.67, 0.06, 0.33],
      [0.91, 0.62, 0.09, 0.38],
    ];
    for (const [x, y, w, h] of buildingsBack) {
      bg.fillRect(W * x, H * y, W * w, H * h);
    }

    // Siluetas de edificios (frente, más grandes y oscuros)
    bg.fillStyle(0x050300, 1);
    const buildingsFront = [
      [0, 0.78, 0.10, 0.22], [0.09, 0.72, 0.08, 0.28], [0.16, 0.75, 0.11, 0.25],
      [0.26, 0.68, 0.09, 0.32], [0.34, 0.74, 0.10, 0.26], [0.43, 0.70, 0.08, 0.30],
      [0.50, 0.76, 0.11, 0.24], [0.60, 0.71, 0.09, 0.29], [0.68, 0.77, 0.10, 0.23],
      [0.77, 0.69, 0.08, 0.31], [0.84, 0.75, 0.10, 0.25], [0.93, 0.72, 0.07, 0.28],
    ];
    for (const [x, y, w, h] of buildingsFront) {
      bg.fillRect(W * x, H * y, W * w, H * h);
    }

    // Ventanas en edificios de fondo — objetos individuales para poder animarlos
    const windowPositions = [
      [0.07, 0.67], [0.09, 0.67], [0.07, 0.71], [0.09, 0.71],
      [0.07, 0.75], [0.09, 0.75], [0.07, 0.79], [0.09, 0.79],
      [0.17, 0.62], [0.19, 0.62], [0.21, 0.62],
      [0.17, 0.66], [0.19, 0.66], [0.21, 0.66],
      [0.17, 0.70], [0.19, 0.70], [0.21, 0.70],
      [0.17, 0.74], [0.19, 0.74], [0.17, 0.78], [0.21, 0.78],
      [0.30, 0.65], [0.32, 0.65], [0.34, 0.65],
      [0.30, 0.69], [0.32, 0.69], [0.34, 0.69],
      [0.30, 0.73], [0.32, 0.73],
      [0.37, 0.60], [0.39, 0.60], [0.37, 0.64], [0.39, 0.64],
      [0.37, 0.68], [0.39, 0.68], [0.37, 0.72], [0.39, 0.72],
      [0.48, 0.63], [0.50, 0.63], [0.52, 0.63],
      [0.48, 0.67], [0.50, 0.67], [0.52, 0.67],
      [0.48, 0.71], [0.52, 0.71],
      [0.62, 0.57], [0.64, 0.57], [0.66, 0.57],
      [0.62, 0.61], [0.64, 0.61], [0.66, 0.61],
      [0.62, 0.65], [0.64, 0.65], [0.66, 0.65],
      [0.62, 0.69], [0.64, 0.69], [0.62, 0.73], [0.66, 0.73],
      [0.81, 0.61], [0.83, 0.61], [0.85, 0.61],
      [0.81, 0.65], [0.83, 0.65], [0.85, 0.65],
      [0.81, 0.69], [0.83, 0.69], [0.81, 0.73], [0.85, 0.73], [0.83, 0.77],
      [0.92, 0.64], [0.94, 0.64], [0.96, 0.64],
      [0.92, 0.68], [0.94, 0.68], [0.92, 0.72], [0.96, 0.72], [0.94, 0.76],
    ];
    const winW = W * 0.012;
    const winH = H * 0.018;
    for (const [wx, wy] of windowPositions) {
      const startOn = Math.random() > 0.25;
      const win = this.add.rectangle(W * wx, H * wy, winW, winH, 0xffcc44)
        .setOrigin(0)
        .setAlpha(startOn ? 0.7 + Math.random() * 0.3 : 0);

      // parpadeo aleatorio: cada ventana tiene su propio intervalo
      const blinkDelay = 2000 + Math.random() * 8000;
      const blinkDuration = 80 + Math.random() * 200;
      this.time.addEvent({
        delay: blinkDelay,
        loop: true,
        callback: () => {
          const isOn = win.alpha > 0;
          // solo algunas se apagan al parpadear, la mayoría solo titilan
          const goOff = Math.random() > 0.6;
          this.tweens.add({
            targets: win,
            alpha: isOn ? (goOff ? 0 : 0.5) : 0.7 + Math.random() * 0.3,
            duration: blinkDuration,
            yoyo: !goOff,
            ease: "Stepped",
          });
        },
      });
    }

    // ── Banner del título ─────────────────────────────────────────
    const bannerW = W * 0.78;
    const bannerH = H * 0.38;
    const bannerX = W / 2 - bannerW / 2;
    const bannerY = H * 0.06;
    const bannerG = this.add.graphics();
    bannerG.fillStyle(0x000000, 0.55);
    bannerG.fillRect(bannerX + 6, bannerY + 6, bannerW, bannerH);
    bannerG.fillGradientStyle(0x1a0800, 0x1a0800, 0x2e1000, 0x2e1000, 0.92);
    bannerG.fillRect(bannerX, bannerY, bannerW, bannerH);
    bannerG.lineStyle(3, 0xcc5500, 1);
    bannerG.strokeRect(bannerX, bannerY, bannerW, bannerH);
    bannerG.lineStyle(1.5, 0x883300, 0.6);
    bannerG.strokeRect(bannerX + 6, bannerY + 6, bannerW - 12, bannerH - 12);

    // ── Título ────────────────────────────────────────────────────
    const title = this.add.text(W / 2, H * 0.25, "NO SE VEN\nLAS MONTAÑAS", {
      fontSize: "52px", fontFamily: "'Press Start 2P'",
      color: "#ffffff", stroke: "#3d1200", strokeThickness: 10,
      align: "center", lineSpacing: 18,
      shadow: { offsetX: 5, offsetY: 5, color: "#1a0800", blur: 0, fill: true },
    }).setOrigin(0.5);

    // ── Prompt parpadeante ────────────────────────────────────────
    const prompt = this.add.text(W / 2, H * 0.81, "PRESIONA PARA INICIAR", {
      fontSize: "16px", fontFamily: "'Press Start 2P'",
      color: "#ffffff", stroke: "#3d1200", strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.container(0, 0, [bannerG, title, prompt]);

    this.tweens.add({
      targets: prompt, alpha: 0.15,
      duration: 1200, ease: "Sine.easeInOut", yoyo: true, repeat: -1,
    });

    // Start music on first input (browser autoplay policy requires user gesture)
    // const startMusic = () => {
    //   if (!this.sound.get("bgmusic")) {
    //     this.sound.play("bgmusic", { loop: true, volume: 0.6 });
    //   }
    // };

    // this.input.keyboard!.once("keydown", () => { /* startMusic(); */ this.startGame(); });
    // this.input.gamepad!.once("down", () => { /* startMusic(); */ this.startGame(); });
  }

  protected startGame() {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => this.scene.start("DifficultyScene"));
  }
}
