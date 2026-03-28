import Phaser from "phaser";

const FONT       = "'Press Start 2P'";
const W          = 1280;
const H          = 720;
const CHAR_DELAY = 45;
const LINE_PAUSE = 300;

const LINES: { text: string; gap?: boolean; big?: boolean }[] = [
  { text: "Llegaste a casa.", big: true },
  { text: "", gap: true },
  { text: "", gap: true },
  { text: "Hoy sobreviviste." },
  { text: "", gap: true },
  { text: "Pero en el AMM, el 60% de los dias" },
  { text: "tienen mala calidad del aire." },
  { text: "", gap: true },
  { text: "3,000 muertes prematuras cada año." },
  { text: "", gap: true },
  { text: "El smog no descansa." },
  { text: "Pero tampoco tú." },
];

export class LevelCompleteScene extends Phaser.Scene {
  private inputEnabled = false;

  constructor() { super("LevelCompleteScene"); }

  create() {
    this.inputEnabled = false;

    // ── Background: warm indoor scene ─────────────────────────────
    this.add.rectangle(W / 2, H / 2, W, H, 0x0d0906);

    // Warm light from above (lamp glow)
    const glow = this.add.rectangle(W / 2, 0, W * 0.7, H * 0.6, 0xc47a2a).setOrigin(0.5, 0).setAlpha(0.06);
    this.tweens.add({ targets: glow, alpha: 0.12, duration: 3000, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    // Floor line
    this.add.rectangle(W / 2, H * 0.72, W, 3, 0x3a2a1a).setAlpha(0.6);
    this.add.rectangle(W / 2, H * 0.74 + (H - H * 0.72) / 2, W, H - H * 0.72, 0x1a0e06);

    // ── Characters ────────────────────────────────────────────────
    const charY = H * 0.62;

    if (this.textures.exists("char_idle")) {
      this.add.image(W / 2 - 80, charY, "char_idle")
        .setOrigin(0.5, 1).setScale(2.0).setAlpha(0.92);
    }
    if (this.textures.exists("other_idle")) {
      this.add.image(W / 2 + 80, charY, "other_idle")
        .setOrigin(0.5, 1).setScale(2.0).setFlipX(true).setAlpha(0.92);
    }

    // ── Typewriter text ───────────────────────────────────────────
    const startX = W * 0.08;
    const startY = H * 0.06;
    const LINE_H = 44;
    const GAP_H  = 22;
    let currentY = startY;

    const typeEntry = (index: number) => {
      if (index >= LINES.length) {
        showPrompt();
        return;
      }

      const line = LINES[index];

      if (line.gap) {
        currentY += GAP_H;
        this.time.delayedCall(LINE_PAUSE / 2, () => typeEntry(index + 1));
        return;
      }

      const posY = currentY;
      currentY += line.big ? LINE_H + 12 : LINE_H;

      const textObj = this.add.text(startX, posY, "", {
        fontSize: line.big ? "22px" : "14px",
        fontFamily: FONT,
        color: "#ffffff",
      }).setOrigin(0, 0).setDepth(4);

      const grad = textObj.context.createLinearGradient(0, 0, 0, textObj.height || 24);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(1, "#ff8833");
      textObj.setFill(grad);

      const text = line.text;
      let charIndex = 0;
      const typeChar = () => {
        if (charIndex >= text.length) {
          this.time.delayedCall(LINE_PAUSE, () => typeEntry(index + 1));
          return;
        }
        textObj.setText(text.slice(0, charIndex + 1));
        charIndex++;
        this.time.delayedCall(CHAR_DELAY, typeChar);
      };
      typeChar();
    };

    // ── Prompt ────────────────────────────────────────────────────
    const showPrompt = () => {
      this.time.delayedCall(1200, () => {
        const prompt = this.add.text(W / 2, H * 0.88, "PRESIONA PARA CONTINUAR", {
          fontSize: "14px", fontFamily: FONT, color: "#ffffff",
        }).setOrigin(0.5).setAlpha(0).setDepth(10);

        const grad = prompt.context.createLinearGradient(0, 0, 0, prompt.height);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(1, "#ff8833");
        prompt.setFill(grad);

        this.tweens.add({ targets: prompt, alpha: 1, duration: 600 });
        this.tweens.add({ targets: prompt, alpha: 0.2, duration: 900,
          delay: 600, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });

        this.inputEnabled = true;
        this.input.keyboard!.once("keydown", () => this.finish());
        const gp = this.input.gamepad!;
        gp.on("connected", () => {});
        if (gp.total > 0) {
          const pad = gp.getPad(0);
          const check = () => {
            if (!this.inputEnabled) return;
            if (pad.buttons[0]?.pressed || pad.buttons[1]?.pressed) { this.finish(); return; }
            this.time.delayedCall(100, check);
          };
          this.time.delayedCall(100, check);
        }
      });
    };

    this.cameras.main.fadeIn(800, 0, 0, 0);
    this.time.delayedCall(600, () => typeEntry(0));
  }

  private finish() {
    if (!this.inputEnabled) return;
    this.inputEnabled = false;
    if (this.cache.audio.exists("sfx_select")) this.sound.play("sfx_select", { volume: 1.0 });
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.sound.stopAll();
      this.scene.start("BootScene");
    });
  }
}
