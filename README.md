# Asteroids

## Audio Volume

Die Lautstärke der einzelnen Sounds wird in `src/js/core/soundManager.js` im Constructor geregelt. 

### Anpassen

  ```js                                                                                                                                                                                                
  this.setVolume('thrust',    0.3);
  this.setVolume('fire',      0.2);
  this.setVolume('bangSmall', 0.2);
  this.setVolume('bangMedium',0.2);
  this.setVolume('bangLarge', 0.2);
  this.setVolume('damage',    0.2);
  this.setVolume('gameover',  1.0);

  Wichtig:
  - Werte müssen zwischen 0.0 (stumm) und 1.0 (maximale Lautstärke) liegen
  - Werte außerhalb dieses Bereichs führen zu einem Browser-Fehler
  - Änderungen gelten beim nächsten Spielstart