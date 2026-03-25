import Phaser from "phaser";

const PROFILES = [
  {
    key: "general",
    label: "POBLACION GENERAL",
    diffLabel: "FACIL",
    bars: 1,
    color: 0x44dd44,
    desc: "La poblacion general es menos\nsensible a la contaminacion del aire.",
    multiplier: 0.5,
  },
  {
    key: "ninos",
    label: "NINOS MENORES DE 12",
    diffLabel: "NORMAL",
    bars: 3,
    color: 0xbbcc00,
    desc: "Los pulmones en desarrollo los hacen\nmas vulnerables al PM2.5 y ozono.",
    multiplier: 1,
  },
  {
    key: "mayores",
    label: "ADULTOS MAYORES",
    diffLabel: "DIFICIL",
    bars: 5,
    color: 0xffaa00,
    desc: "El sistema inmune debilitado amplifica\nel riesgo ante particulas finas.",
    multiplier: 1.5,
  },
  {
    key: "embarazadas",
    label: "MUJERES EMBARAZADAS",
    diffLabel: "MUY DIFICIL",
    bars: 8,
    color: 0xff6600,
    desc: "La contaminacion afecta tanto a la\nmadre como al bebe en desarrollo.",
    multiplier: 2,
  },
  {
    key: "respiratoria",
    label: "COND. RESPIRATORIA",
    diffLabel: "EXTREMO",
    bars: 10,
    color: 0xff2200,
    desc: "Corazon y pulmones afectados\namplifican cada particula inhalada.",
    multiplier: 3,
  },
] as const;

export class DifficultyScene extends Phaser.Scene {
  private selected = 0;
  private confirmed = false;
  private inputCooldown = 0;
  private inputEnabled = false;

  private pad: Phaser.Input.Gamepad.Gamepad | null = null;

  private cursorArrows: Phaser.GameObjects.Text[] = [];
  private rowHighlights: Phaser.GameObjects.Rectangle[] = [];
  private barGraphics!: Phaser.GameObjects.Graphics;
  private descText!: Phaser.GameObjects.Text;

  constructor() { super("DifficultyScene"); }

  create() {
    // Reset state in case scene is restarted
    this.selected = 0;
    this.confirmed = false;
    this.inputEnabled = false;
    this.inputCooldown = 0;
    this.cursorArrows = [];
    this.rowHighlights = [];

    const W = this.scale.width;
    const H = this.scale.height;

    const bX = W * 0.08;
    const bY = H * 0.05;
    const bW = W * 0.84;
    const bH = H * 0.90;

    // Banner (same style as StartScene)
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.35);
    bg.fillRect(bX + 6, bY + 6, bW, bH);
    bg.fillGradientStyle(0x001833, 0x001833, 0x002f66, 0x002f66, 0.94);
    bg.fillRect(bX, bY, bW, bH);
    bg.lineStyle(4, 0x44aaff, 1);
    bg.strokeRect(bX, bY, bW, bH);
    bg.lineStyle(1.5, 0x1177dd, 0.6);
    bg.strokeRect(bX + 6, bY + 6, bW - 12, bH - 12);

    // Title
    this.add.text(W / 2, bY + 32, "MODO DE DIFICULTAD", {
      fontSize: "22px", fontFamily: "'Press Start 2P'",
      color: "#ffffff", stroke: "#003388", strokeThickness: 8,
    }).setOrigin(0.5, 0);

    // Subtitle
    this.add.text(W / 2, bY + 70, "la calidad del aire no nos afecta a todos por igual", {
      fontSize: "9px", fontFamily: "'Press Start 2P'",
      color: "#88ccff",
    }).setOrigin(0.5, 0);

    // Separator
    const sep = this.add.graphics();
    sep.lineStyle(1, 0x1155aa, 0.6);
    sep.lineBetween(bX + 14, bY + 92, bX + bW - 14, bY + 92);

    // Rows
    const listX = bX + 46;
    const listY = bY + 108;
    const rowH = 66;

    this.barGraphics = this.add.graphics();

    PROFILES.forEach((p, i) => {
      const ry = listY + i * rowH;

      // Highlight
      const hl = this.add.rectangle(W / 2, ry + rowH / 2 - 4, bW - 20, rowH - 8, 0x1155aa, 0);
      this.rowHighlights.push(hl);

      // Cursor arrow
      const arrow = this.add.text(listX - 20, ry + 10, ">", {
        fontSize: "14px", fontFamily: "'Press Start 2P'",
        color: "#44aaff",
      }).setAlpha(0);
      this.cursorArrows.push(arrow);

      // Label
      this.add.text(listX, ry + 10, p.label, {
        fontSize: "14px", fontFamily: "'Press Start 2P'",
        color: "#ffffff",
      });

      // Difficulty label (right-aligned)
      this.add.text(bX + bW - 22, ry + 10, p.diffLabel, {
        fontSize: "11px", fontFamily: "'Press Start 2P'",
        color: "#" + p.color.toString(16).padStart(6, "0"),
      }).setOrigin(1, 0);

      // Row divider
      if (i < PROFILES.length - 1) {
        const dv = this.add.graphics();
        dv.lineStyle(1, 0x1155aa, 0.3);
        dv.lineBetween(bX + 14, ry + rowH - 2, bX + bW - 14, ry + rowH - 2);
      }
    });

    // Description box
    const descY = listY + PROFILES.length * rowH + 14;
    const descBoxH = 76;
    const descBox = this.add.graphics();
    descBox.fillStyle(0x001133, 0.7);
    descBox.lineStyle(1.5, 0x1177dd, 0.7);
    descBox.fillRoundedRect(bX + 14, descY, bW - 28, descBoxH, 6);
    descBox.strokeRoundedRect(bX + 14, descY, bW - 28, descBoxH, 6);

    this.descText = this.add.text(W / 2, descY + descBoxH / 2, "", {
      fontSize: "11px", fontFamily: "'Press Start 2P'",
      color: "#aaddff", align: "center", lineSpacing: 10,
    }).setOrigin(0.5);


    // Input via events — simple and reliable
    this.time.delayedCall(300, () => {
      this.inputEnabled = true;

      this.input.keyboard!.on("keydown", (e: KeyboardEvent) => {
        if (!this.inputEnabled || this.confirmed) return;
        if (e.code === "ArrowUp") {
          this.selected = (this.selected - 1 + PROFILES.length) % PROFILES.length;
          this.updateUI();
        } else if (e.code === "ArrowDown") {
          this.selected = (this.selected + 1) % PROFILES.length;
          this.updateUI();
        } else if (e.code === "Enter" || e.code === "Space") {
          this.confirm();
        }
      });

      this.input.gamepad!.on("connected", (pad: Phaser.Input.Gamepad.Gamepad) => { this.pad = pad; });
      if (this.input.gamepad!.total > 0) this.pad = this.input.gamepad!.getPad(0);
    });

    this.cameras.main.fadeIn(300, 0, 0, 0);
    this.updateUI();
  }

  update(_t: number, delta: number) {
    if (this.confirmed || !this.inputEnabled) return;

    // Gamepad navigation (polling)
    this.inputCooldown -= delta;
    if (this.inputCooldown > 0 || !this.pad) return;

    const up = (this.pad.leftStick.y < -0.5) || this.pad.up;
    const dn = (this.pad.leftStick.y > 0.5) || this.pad.down;
    const btn = this.pad.buttons[0]?.pressed || this.pad.buttons[1]?.pressed;

    if (btn) { this.confirm(); return; }
    if (up) { this.selected = (this.selected - 1 + PROFILES.length) % PROFILES.length; this.inputCooldown = 200; this.updateUI(); }
    else if (dn) { this.selected = (this.selected + 1) % PROFILES.length; this.inputCooldown = 200; this.updateUI(); }
  }

  private updateUI() {
    const SEG = 10;
    const SW = 24;
    const SH = 14;
    const GAP = 4;
    const listX = this.scale.width * 0.08 + 46;
    const listY = this.scale.height * 0.05 + 108;
    const rowH = 66;

    this.cursorArrows.forEach((a, i) => a.setAlpha(i === this.selected ? 1 : 0));
    this.rowHighlights.forEach((r, i) => r.setFillStyle(0x1155aa, i === this.selected ? 0.3 : 0));

    this.barGraphics.clear();
    PROFILES.forEach((p, i) => {
      const ry = listY + i * rowH;
      const barY = ry + 38;
      const isSelected = i === this.selected;
      for (let b = 0; b < SEG; b++) {
        const filled = b < p.bars;
        this.barGraphics.fillStyle(filled ? p.color : 0x223344, isSelected ? 1 : (filled ? 0.5 : 0.25));
        this.barGraphics.fillRect(listX + b * (SW + GAP), barY, SW, SH);
      }
    });

    this.descText.setText(PROFILES[this.selected].desc);
  }

  private confirm() {
    if (this.confirmed) return;
    this.confirmed = true;
    const p = PROFILES[this.selected];
    this.registry.set("difficulty", p.key);
    this.registry.set("difficultyMultiplier", p.multiplier);
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => this.scene.start("GameScene"));
  }
}
