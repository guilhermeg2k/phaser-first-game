import * as Phaser from 'phaser';
import GameScene from './scenes/gameScene';

class Game extends Phaser.Game {
  constructor() {
    super({
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 300 },
          debug: false,
        },
      },
      scene: new GameScene(),
    });
  }
}

const game = new Game();
