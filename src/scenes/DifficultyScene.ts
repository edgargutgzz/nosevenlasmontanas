import Phaser from "phaser";

const OPTIONS = [
  {
    key: "buena",
    label: "BUENA",
    color: 0x2ecc87,
    colorHex: "#2ecc87",
    bgSelected: 0x0e1a16,
    multiplier: 0.25,
  },
  {
    key: "aceptable",
    label: "ACEPTABLE",
    color: 0xf0e040,
    colorHex: "#f0e040",
    bgSelected: 0x1a1a0a,
    multiplier: 0.5,
  },
  {
    key: "mala",
    label: "MALA",
    color: 0xff8c00,
    colorHex: "#ff8c00",
    bgSelected: 0x1a1000,
    multiplier: 0.7,
  },
  {
    key: "muy_mala",
    label: "MUY MALA",
    color: 0xff3300,
    colorHex: "#ff3300",
    bgSelected: 0x1a0800,
    multiplier: 0.85,
  },
  {
    key: "extremadamente_mala",
    label: "EXTREMADAMENTE MALA",
    color: 0x9b59b6,
    colorHex: "#9b59b6",
    bgSelected: 0x110a1a,
    multiplier: 1.0,
  },
] as const;

const ROW_H    = 88;
const ROW_GAP  = 12;

export class DifficultyScene extends Phaser.Scene {
  private selected = 0;
  private confirmed = false;
  private inputEnabled = false;
  private inputCooldown = 0;
  private pad: Phaser.Input.Gamepad.Gamepad | null = null;
  private rowBgs: Phaser.GameObjects.Rectangle[] = [];
  private rowBorders: Phaser.GameObjects.Graphics[] = [];
  private flashTween: Phaser.Tweens.Tween | null = null;
  private airQualityLabel!: Phaser.GameObjects.Text;

  constructor() { super("DifficultyScene"); }

  preload() {
    this.load.audio("sfx_select", "/assets/sfx/vgmenuselect.ogg");
  }

  create() {
    this.selected = 0;
    this.confirmed = false;
    this.inputEnabled = false;
    this.inputCooldown = 0;
    this.rowBgs = [];
    this.rowBorders = [];

    if (!this.sound.get("venus")?.isPlaying) {
      this.sound.play("venus", { loop: true, volume: 0.6 });
    }

    const W = this.scale.width;
    const H = this.scale.height;

    // ── Background ────────────────────────────────────────────────
    this.add.rectangle(0, 0, W, H, 0x000000).setOrigin(0);

    // ── Título ────────────────────────────────────────────────────
    const titleText = this.add.text(W / 2, H * 0.055, "NIVEL DE DIFICULTAD", {
      fontSize: "22px", fontFamily: "'Press Start 2P'",
      color: "#ffffff",
    }).setOrigin(0.5, 0);
    const titleGrad = titleText.context.createLinearGradient(0, 0, 0, titleText.height);
    titleGrad.addColorStop(0, "#ffffff");
    titleGrad.addColorStop(1, "#ff8833");
    titleText.setFill(titleGrad);

    // ── Rows ──────────────────────────────────────────────────────
    const totalH = OPTIONS.length * ROW_H + (OPTIONS.length - 1) * ROW_GAP;
    const startY = Math.round((H - totalH) / 2) + 20;
    const rowW   = Math.round(W * 0.62);
    const rowX   = Math.round((W - rowW) / 2);
    const circleR = 18;

    OPTIONS.forEach((opt, i) => {
      const ry = startY + i * (ROW_H + ROW_GAP);

      const bg = this.add.rectangle(rowX, ry, rowW, ROW_H, 0x111111).setOrigin(0);
      this.rowBgs.push(bg);

      // Top accent bar
      this.add.rectangle(rowX, ry, rowW, 4, opt.color).setOrigin(0);

      const border = this.add.graphics();
      this.rowBorders.push(border);

      // Circle
      const gfx = this.add.graphics();
      gfx.fillStyle(opt.color, 1);
      gfx.fillCircle(rowX + 48, ry + ROW_H / 2, circleR);

      // Label
      this.add.text(rowX + 90, ry + ROW_H / 2, opt.label, {
        fontSize: "18px", fontFamily: "'Press Start 2P'",
        color: opt.colorHex,
        padding: { top: 6, bottom: 6 },
      }).setOrigin(0, 0.5);
    });

    // ── "Calidad del Aire" label — repositions to selected row ────
    const labelRowW = Math.round(W * 0.62);
    const labelRowX = Math.round((W - labelRowW) / 2);
    this.airQualityLabel = this.add.text(labelRowX + labelRowW - 12, 0, "CALIDAD DEL AIRE", {
      fontSize: "9px", fontFamily: "'Press Start 2P'",
      color: "#888888",
    }).setOrigin(1, 0.5);

    // ── Input ─────────────────────────────────────────────────────
    this.time.delayedCall(300, () => {
      this.inputEnabled = true;
      this.input.keyboard!.on("keydown", (e: KeyboardEvent) => {
        if (!this.inputEnabled || this.confirmed) return;
        if (e.code === "ArrowUp" || e.code === "ArrowLeft") {
          this.selected = Math.max(0, this.selected - 1);
          this.sound.play("sfx_select", { volume: 1.0 });
          this.updateUI();
        } else if (e.code === "ArrowDown" || e.code === "ArrowRight") {
          this.selected = Math.min(OPTIONS.length - 1, this.selected + 1);
          this.sound.play("sfx_select", { volume: 1.0 });
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
    this.inputCooldown -= delta;
    if (this.inputCooldown > 0 || !this.pad) return;

    const up   = this.pad.up   || this.pad.left;
    const down = this.pad.down || this.pad.right;
    const btn  = this.pad.buttons[0]?.pressed || this.pad.buttons[1]?.pressed;

    if (btn) { this.confirm(); return; }
    if (up) {
      this.selected = Math.max(0, this.selected - 1);
      this.inputCooldown = 200;
      this.sound.play("sfx_select", { volume: 1.0 });
      this.updateUI();
    } else if (down) {
      this.selected = Math.min(OPTIONS.length - 1, this.selected + 1);
      this.inputCooldown = 200;
      this.sound.play("sfx_select", { volume: 1.0 });
      this.updateUI();
    }
  }

  private updateUI() {
    const W    = this.scale.width;
    const rowW = Math.round(W * 0.62);
    const rowX = Math.round((W - rowW) / 2);
    const H    = this.scale.height;
    const totalH = OPTIONS.length * ROW_H + (OPTIONS.length - 1) * ROW_GAP;
    const startY = Math.round((H - totalH) / 2) + 20;

    if (this.flashTween) { this.flashTween.stop(); this.flashTween = null; }

    this.rowBgs.forEach((bg, i) => {
      bg.setFillStyle(i === this.selected ? OPTIONS[i].bgSelected : 0x111111);
    });

    this.rowBorders.forEach((g, i) => {
      g.clear();
      const opt = OPTIONS[i];
      const ry  = startY + i * (ROW_H + ROW_GAP);
      const isSelected = i === this.selected;
      g.lineStyle(isSelected ? 3 : 1, isSelected ? opt.color : 0x333333, 1);
      g.strokeRect(rowX, ry, rowW, ROW_H);
    });

    const selBorder = this.rowBorders[this.selected];
    this.flashTween = this.tweens.add({
      targets: selBorder, alpha: 0.4,
      duration: 500, ease: "Sine.easeInOut",
      yoyo: true, repeat: -1,
    });

    const selRy = startY + this.selected * (ROW_H + ROW_GAP);
    this.airQualityLabel.setY(selRy + 22);
  }

  private confirm() {
    if (this.confirmed) return;
    this.confirmed = true;
    this.sound.play("sfx_select", { volume: 1.0 });
    const opt = OPTIONS[this.selected];
    this.registry.set("difficulty", opt.key);
    this.registry.set("difficultyMultiplier", opt.multiplier);
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => this.scene.start("CharacterScene"));
  }
}
