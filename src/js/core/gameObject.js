export class GameObject{

    constructor(x = 0, y = 0, collisionRadius = 10){

        this.x = x;
        this.y = y;


        // Winkel (zeigt nach oben) und Geschwindigkeit
        this.angle = 90 / 180 * Math.PI;
        this.rotation = 0;


        this.collisionRadius = collisionRadius;

        //Cleanup FLAG - Wenn true wird das Objekt gelöscht
        this.isDestroyed = false;


    }


    update(deltaTime){}
    draw(canvasContext){}


    drawCollisionRadius(canvasContext) {
        canvasContext.beginPath();
        canvasContext.arc(this.x, this.y, this.collisionRadius, 0, 2 * Math.PI);
        canvasContext.closePath();
        canvasContext.strokeStyle = "red";
        canvasContext.stroke();
    }

}