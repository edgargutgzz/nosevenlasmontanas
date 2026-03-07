import Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private pad: Phaser.Input.Gamepad.Gamepad | null = null;

  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.image("ground", "/assets/ground.png");

    this.load.image("char_idle", "/assets/character/character_malePerson_idle.png");
    this.load.image("char_jump", "/assets/character/character_malePerson_jump.png");
    this.load.image("char_fall", "/assets/character/character_malePerson_fall.png");
    for (let i = 0; i < 8; i++) {
      this.load.image(`char_walk${i}`, `/assets/character/character_malePerson_walk${i}.png`);
    }
  }

  create() {
    // Ground texture (plain colored canvas)
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#4a9eff";
    ctx.fillRect(0, 0, 64, 64);
    this.textures.addCanvas("ground", canvas);

    // Platforms
    this.platforms = this.physics.add.staticGroup();

    for (let x = 0; x < 1280; x += 64) {
      this.platforms.create(x + 32, 720 - 32, "ground");
    }
    this.platforms.create(300, 550, "ground");
    this.platforms.create(364, 550, "ground");
    this.platforms.create(428, 550, "ground");
    this.platforms.create(650, 430, "ground");
    this.platforms.create(714, 430, "ground");
    this.platforms.create(950, 520, "ground");
    this.platforms.create(1014, 520, "ground");
    this.platforms.create(1078, 520, "ground");

    // Player
    this.player = this.physics.add.sprite(100, 500, "char_idle");
    this.player.setCollideWorldBounds(true);
    this.player.setScale(0.5);

    // Animations
    this.anims.create({
      key: "walk",
      frames: Array.from({ length: 8 }, (_, i) => ({ key: `char_walk${i}` })),
      frameRate: 12,
      repeat: -1,
    });

    this.physics.add.collider(this.player, this.platforms);

    // Keyboard
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Gamepad
    this.input.gamepad!.once("connected", (pad: Phaser.Input.Gamepad.Gamepad) => {
      this.pad = pad;
    });
  }

  update() {
    const onGround = this.player.body!.blocked.down;
    const leftStickX = this.pad?.leftStick.x ?? 0;
    const buttonA = this.pad?.isButtonDown(0) ?? false;
    const dpadLeft = this.pad?.left ?? false;
    const dpadRight = this.pad?.right ?? false;

    const goLeft = this.cursors.left.isDown || leftStickX < -0.3 || dpadLeft;
    const goRight = this.cursors.right.isDown || leftStickX > 0.3 || dpadRight;
    const jump =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space!) ||
      buttonA;

    if (goLeft) {
      this.player.setVelocityX(-220);
      this.player.setFlipX(true);
    } else if (goRight) {
      this.player.setVelocityX(220);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    if (jump && onGround) {
      this.player.setVelocityY(-520);
    }

    // Animations
    if (!onGround) {
      const goingUp = (this.player.body!.velocity.y ?? 0) < 0;
      this.player.anims.stop();
      this.player.setTexture(goingUp ? "char_jump" : "char_fall");
    } else if (goLeft || goRight) {
      if (!this.player.anims.isPlaying) this.player.play("walk");
    } else {
      this.player.anims.stop();
      this.player.setTexture("char_idle");
    }
  }
}
