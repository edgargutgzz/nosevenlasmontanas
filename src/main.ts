import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { DataScene } from "./scenes/DataScene";
import { StartScene } from "./scenes/StartScene";
import { DifficultyScene } from "./scenes/DifficultyScene";
import { CharacterScene } from "./scenes/CharacterScene";
import { GameScene } from "./scenes/GameScene";
import { BossScene } from "./scenes/BossScene";
import { LevelCompleteScene } from "./scenes/LevelCompleteScene";
import { GameOverScene } from "./scenes/GameOverScene";

const startGame = () => new Phaser.Game({
  type: Phaser.CANVAS,
  width: 1280,
  height: 720,
  render: {
    antialias: false,
    pixelArt: true,
  },
  backgroundColor: "#000000",
  input: {
    gamepad: true,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 600 },
      debug: false,
    },
  },
  scene: [BootScene, DataScene, StartScene, DifficultyScene, CharacterScene, GameScene, BossScene, LevelCompleteScene, GameOverScene],
  scale: {
    mode: Phaser.Scale.ENVELOP,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});

document.fonts.ready.then(startGame);
