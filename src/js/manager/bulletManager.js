import { Laser } from '../GameObjects/bullet.js';
// NEUER IMPORT PFAD:
import { WEAPON_CONFIG } from '../config/weaponConfig.js';

export class BulletManager {
    constructor(objectList, sound) {
        this.objectList = objectList;
        this.sound = sound;
        this.lastShotTime = 0;
    }

    fireBullet(ship) {
        const now = Date.now();
        
        // Zugriff auf die externe Config
        const weaponConfig = WEAPON_CONFIG[ship.activeWeapon];

        if (now > this.lastShotTime + weaponConfig.interval) {
            
            const muzzle = ship.muzzlePosition;

            for (let i = 0; i < weaponConfig.projectiles; i++) {
                
                let spread = 0;
                if (weaponConfig.projectiles > 1) {
                    spread = (i - (weaponConfig.projectiles - 1) / 2) * (weaponConfig.angleSpread / weaponConfig.projectiles);
                }
                
                const shotAngle = muzzle.angle + spread;

                const newLaser = new Laser(
                    muzzle.x, 
                    muzzle.y, 
                    shotAngle,
                    weaponConfig.speed,
                    weaponConfig.lifespan,
                    weaponConfig.damage,
                    weaponConfig.color,
                    weaponConfig.lengthFactor,
                    weaponConfig.areaRadius
                );

                this.objectList.add(newLaser);
            }

            this.sound?.play('fire');
            this.lastShotTime = now;
        }
    }
}