import { Scene } from '../core/scene.js';
import { Asteroid } from '../GameObjects/asteroid.js';
import { GameOverScene } from './gameOverScene.js';
import { CollisionSystem } from '../systems/collision.js'; 
import { InputHandler } from '../core/inputHandler.js';
import { BulletManager } from '../manager/bulletManager.js';
import { AsteroidManager } from '../manager/asteroidsManager.js';
import { Laser } from '../GameObjects/laser.js';
import { StarBackground } from '../manager/background.js';
import { Ship } from '../GameObjects/ship.js';

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
        
        // --- GAMEPLAY-VARIABLEN FÜR LED-EFFEKTE ---
        this.currentWave = 1;
        this.nextLifeScore = 10000;
        
        this.levelTransitionTimer = 0;
        this.isTransitioningLevel = false;

        // UI Zurücksetzen
        if (this.game.ui) {
            this.game.ui.score = 0;
            this.game.ui.currentHealth = 100;
            this.game.ui.lives = 3;
        }

        // Manager initialisieren
        this.bulletManager = new BulletManager(this.objects, this.game.sound);
        this.astroidManager = new AsteroidManager(this.game.canvas.width, this.game.canvas.height, this.objects, this);

        // Spieler-Schiff erstellen
        this.ship = new Ship(this.game.canvas.width / 2, this.game.canvas.height / 2);
        this.objects.setPlayer(this.ship);

        // Kollisions-System aktivieren
        this.collisionSystem = new CollisionSystem(this.game, this.astroidManager, this.objects, this.ship);

        // Erste Welle starten
        this.astroidManager.initAstroids(5);

        this.game.sound?.playLoop('gameMusic');
    }

    update(deltaTime) {
        this.gameTimer += deltaTime;
        this.background.update(deltaTime);

        // Merken der Leben VOR den Kollisionen für die Schadens-Erkennung
        const prevHealth = this.ship.health;

        this.handlePlayerInput(deltaTime);
        this.objects.update(deltaTime);
        this.objects.getAll().forEach(o => this.screenWrap(o));

        // Kollisionen ausführen (Hier verringert sich ggf. das Leben des Schiffs)
        this.collisionSystem.checkCollisions();

        // UI-Anzeige aktualisieren
        if (this.game.ui) {
            this.game.ui.lives = Math.max(0, this.ship.health);
        }

        // --- 1. AUTOMATISCHES EXTRA-LEBEN SYSTEM (`ast_life`) ---
        if (this.game.ui && this.game.ui.score >= this.nextLifeScore) {
            this.ship.health++; // Leben im Objekt erhöhen
            
            console.log(`[PlayScene]  Extra Leben erreicht bei ${this.nextLifeScore} Punkten!`);
            this.game.led?.triggerEvent('ast_life'); // Goldenes Lauflicht zünden!
            
            this.nextLifeScore += 10000; // Nächstes Ziel setzen (z.B. bei 10100)
        }

        // --- 3. GAME OVER LOGIK (`ast_gameover`) ---
        if (this.ship.health <= 0) {
            try {
                this.game.sound?.stopLoop('thrust');
                this.game.sound?.play('gameover');
                this.game.led?.triggerEvent('ast_gameover'); // Roter Full-Streifen
                
                this.game.changeScene(
                    new GameOverScene(
                        this.game, 
                        this.game.ui.score, 
                        this.game.ui.formatTime(this.gameTimer)
                    )
                );
            } catch (err) { 
                console.error("[PlayScene] Fehler beim Ausführen des Game Over:", err); 
            }
            return; // Loop hier sofort abbrechen!
        }

        // --- 4. WAVE-UP / LEVEL COMPLETE SYSTEM (`ast_level`) ---
        if (this.objects.getAstroids) {
            const currentAsteroidsCount = this.objects.getAsteroids().length;
            
            if (currentAsteroidsCount === 0 && !this.isTransitioningLevel) {
                console.log(`[PlayScene] Welle ${this.currentWave} geklärt! Starte Lightshow.`);
                this.game.led?.triggerEvent('ast_level'); // Regenbogen-Effekt zünden
                this.isTransitioningLevel = true;
                this.levelTransitionTimer = 3.5; // 3.5 Sekunden Pause für die Animation
            }
        }

        // Weichensteuerung für den Levelübergang (Verhindert feindliche Spawns während des Regenbogens)
        if (this.isTransitioningLevel) {
            this.levelTransitionTimer -= deltaTime;
            if (this.levelTransitionTimer <= 0) {
                this.isTransitioningLevel = false;
                this.currentWave++;
                const spawnCount = 5 + (this.currentWave * 2);
                console.log(`[PlayScene] 🚀Starte Welle ${this.currentWave} mit ${spawnCount} Asteroiden.`);
                this.astroidManager.initAstroids(spawnCount);
            }
        } else {
            // Manager darf nur arbeiten, wenn wir nicht in der Level-Pause sind
            this.astroidManager.update(deltaTime);
        }
    }

    handlePlayerInput(deltaTime) {
        if (this.input.isDown('KeyW')) {
            this.ship.accelerate(true, deltaTime);
            this.game.sound?.playLoop('thrust');
        } else {
            this.ship.accelerate(false, deltaTime);
            this.game.sound?.stopLoop('thrust');
        }

        if (this.input.isDown('KeyA')) this.ship.rotate(1, deltaTime);
        if (this.input.isDown('KeyD')) this.ship.rotate(-1, deltaTime);

        if (this.input.isDown('Space')) {
            this.bulletManager.fireBullet(this.ship);
        }
    }

    onDestroy() {
        this.game.sound?.stopLoop('thrust');
        this.game.sound?.stopLoop('gameMusic');
    }

    draw(ctx) {
        ctx.fillStyle = 'black'; 
        ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        
        this.background.draw(ctx);
        this.objects.draw(ctx);

        // Text-Anzeige während der Level-Pause
        if (this.isTransitioningLevel) {
            ctx.save();
            ctx.fillStyle = "#00FFFF"; 
            ctx.font = "bold 30px monospace"; 
            ctx.textAlign = "center";
            ctx.fillText(`WELLE ${this.currentWave} ERLEDIGT!`, this.game.canvas.width / 2, this.game.canvas.height / 2 - 50);
            ctx.font = "20px monospace"; 
            ctx.fillStyle = "white";
            ctx.fillText(`Nächste Welle startet gleich...`, this.game.canvas.width / 2, this.game.canvas.height / 2);
            ctx.restore();
        }
        
        this.game.ui?.draw(ctx, this.ship.activeWeapon, this.gameTimer);
    }

    screenWrap(obj) {
        const w = this.game.canvas.width; 
        const h = this.game.canvas.height;
        
        if (obj instanceof Laser) { 
            if (obj.x < 0 || obj.x > w || obj.y < 0 || obj.y > h) obj.isDestroyed = true; 
            return; 
        }
        
        if (obj.x < -obj.collisionRadius) obj.x = w + obj.collisionRadius; 
        else if (obj.x > w + obj.collisionRadius) obj.x = -obj.collisionRadius;
        
        if (obj.y < -obj.collisionRadius) obj.y = h + obj.collisionRadius; 
        else if (obj.y > h + obj.collisionRadius) obj.y = -obj.collisionRadius;
    }
}