import * as Phaser from 'phaser';

class GameScene extends Phaser.Scene {
  platforms: Phaser.Physics.Arcade.StaticGroup;
  player: Phaser.Physics.Arcade.Sprite;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  stars: Phaser.Physics.Arcade.Group;
  bombs: Phaser.Physics.Arcade.Group;
  scoreText: Phaser.GameObjects.Text;
  levelText: Phaser.GameObjects.Text;
  score: number;
  level: number;

  constructor() {
    super('game');
  }

  preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    this.score = 0;
    this.level = 1;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.add.image(400, 300, 'sky');
    this.createScenery();
    this.createPlayer();
    this.createUI();
    this.createStars();
    this.createBombs();
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play('right', true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play('turn');
    }
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }

  createScenery() {
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    this.platforms.create(600, 400, 'ground');
    this.platforms.create(50, 250, 'ground');
    this.platforms.create(750, 220, 'ground');
  }

  createPlayer() {
    this.player = this.physics.add.sprite(100, 450, 'dude');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 4 }],
      frameRate: 20,
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });
    this.physics.add.collider(this.player, this.platforms);
  }

  createUI() {
    this.levelText = this.add.text(16, 16, 'Level: 1', {
      fontSize: '32px',
      fill: '#000',
    });
    this.scoreText = this.add.text(16, 44, 'score: 0', {
      fontSize: '32px',
      fill: '#000',
    });
  }

  createStars() {
    this.stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });
    this.stars.children.iterate((child: Phaser.Physics.Arcade.Sprite) => {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar,
      null,
      this
    );
  }

  createBombs() {
    this.bombs = this.physics.add.group();
    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.collider(
      this.player,
      this.bombs,
      this.hitBomb,
      null,
      this
    );
    this.dropBomb(this.player.x);
  }

  collectStar(
    player: Phaser.Physics.Arcade.Sprite,
    star: Phaser.Physics.Arcade.Sprite
  ) {
    star.disableBody(true, true);
    this.score += 10 * this.level;
    this.scoreText.setText(`Score: ${this.score}`);
    if (this.stars.countActive(true) === 0) {
      this.stars.children.iterate((child: Phaser.Physics.Arcade.Sprite) => {
        child.enableBody(true, child.x, 0, true, true);
      });
      this.dropBomb(player.x);
      this.level++;
      this.levelText.setText(`Level: ${this.level}`);
    }
  }

  dropBomb(playerPosition: number) {
    let x =
      playerPosition < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400);
    let bomb = this.bombs.create(x, 16, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  }

  hitBomb(
    player: Phaser.Physics.Arcade.Sprite,
    bomb: Phaser.Physics.Arcade.Sprite
  ) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    this.showGameOverUI();
  }
  showGameOverUI() {
    this.levelText.setVisible(false);
    this.scoreText.setVisible(false);
    this.add.text(
      <number>this.game.config.width / 2 - 110,
      <number>this.game.config.height - 550,
      `Level = ${this.level}`,
      { fontSize: '42px', fill: '#fff', stroke: '#4E89C6', strokeThicknees: 14 }
    );
    this.add.text(
      <number>this.game.config.width / 2 - 110,
      <number>this.game.config.height - 500,
      `Score = ${this.score}`,
      { fontSize: '42px', fill: '#fff', stroke: '#4E89C6', strokeThicknees: 14 }
    );
    let restartText = this.add.text(
      <number>this.game.config.width / 2 - 110,
      <number>this.game.config.height - 450,
      'Try Again',
      { fontSize: '42px', fill: '#fff', stroke: '#4E89C6', strokeThicknees: 14 }
    );
    restartText.setInteractive();
    restartText.on('pointerdown', () => {
      this.scene.start('game');
    });
  }
}

export default GameScene;
