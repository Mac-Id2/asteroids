import { Scene } from '../core/scene.js';
import { Ship } from '../GameObjects/ship.js';
import { CollisionSystem } from '../systems/collision.js';
import { GameOverScene } from './gameOverScene.js';
import { InputHandler } from '../core/input.js';
import { BulletManager } from '../manager/bulletManager.js';
import { AstroidManager } from '../manager/asteroidsManager.js';
import { Laser } from '../GameObjects/bullet.js';
import { StarBackground } from '../manager/background.js';

export class PlayScene extends Scene {

    constructor(game) {
        super(game);

        this.background = new StarBackground(
            this.game.canvas.width,
            this.game.canvas.height,
            false
        );

        this.input = new InputHandler();
        this.gameTimer = 0;
        //this.cKeyPressed = false;

        // UI Reset
        if  (this.game.ui) {
            this.game.ui.score = 0;
            this.game.ui.currentHealth = 100;
            this.game.ui.lives = 3;
        }

        // Manager
        this.bulletManager = new BulletManager(this.objects, this.game.sound);
        this.astroidManager = new AstroidManager(this.game.canvas.width, this.game.canvas.height, this.objects, this);

        // Ship
        this.ship = new Ship(
            this.game.canvas.width / 2,
            this.game.canvas.height / 2
        );
        this.objects.setPlayer(this.ship);

        // Collision System (WICHTIG)
        this.collisionSystem = new CollisionSystem(
            this.game,
            this.astroidManager,
            this.objects,
            this.ship
        );

        // Asteroiden
        this.astroidManager.initAstroids(
            5,
            this.game.canvas.width,
            this.game.canvas.height
        );
    }

    update(deltaTime) {
        this.gameTimer += deltaTime;

        this.background.update(deltaTime);

        if (this.game.ui) {
            this.game.ui.lives = Math.max(0, this.ship.health);
        }

        if (this.ship.health <= 0) {
            this.game.sound?.stopLoop('thrust');
            this.game.sound?.play('gameover');
            this.game.changeScene(
                new GameOverScene(
                    this.game,
                    this.game.ui.score,
                    this.game.ui.formatTime(this.gameTimer)
                )
            );
            return;
        }

        this.handlePlayerInput(deltaTime);

        this.objects.update(deltaTime);
        this.objects.getAll().forEach(o => this.screenWrap(o));

        this.collisionSystem.checkCollisions(this.objects.getAll());
        this.astroidManager.update(deltaTime);
    }

    handlePlayerInput(deltaTime) {
        if (this.input.isDown('ArrowUp')) {
            this.ship.accelerate(true, deltaTime);
            this.game.sound?.playLoop('thrust');
        } else {
            this.ship.accelerate(false, deltaTime);
            this.game.sound?.stopLoop('thrust');
        }

        if (this.input.isDown('ArrowLeft')) this.ship.rotate(1, deltaTime);
        if (this.input.isDown('ArrowRight')) this.ship.rotate(-1, deltaTime);

        if (this.input.isDown('Space')) {
            this.bulletManager.fireBullet(this.ship);
        }

        // if (this.input.isDown('KeyC')) {
        //     if (!this.cKeyPressed) {
        //         this.ship.switchWeapon();
        //         this.cKeyPressed = true;
        //     }
        // } else {
        //     this.cKeyPressed = false;
        // }
    }

    onDestroy() {
        this.game.sound?.stopLoop('thrust');
    }

    draw(ctx) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);


        this.background.draw(ctx);
        this.objects.draw(ctx);

        this.game.ui?.draw(ctx, this.ship.activeWeapon, this.gameTimer);
    }

    screenWrap(obj) {
        const w = this.game.canvas.width;
        const h = this.game.canvas.height;

        if (obj instanceof Laser) {
            if (obj.x < 0 || obj.x > w || obj.y < 0 || obj.y > h) {
                obj.isDestroyed = true;
            }
            return;
        }

        if (obj.x < -obj.collisionRadius) obj.x = w + obj.collisionRadius;
        else if (obj.x > w + obj.collisionRadius) obj.x = -obj.collisionRadius;

        if (obj.y < -obj.collisionRadius) obj.y = h + obj.collisionRadius;
        else if (obj.y > h + obj.collisionRadius) obj.y = -obj.collisionRadius;
    }
}
