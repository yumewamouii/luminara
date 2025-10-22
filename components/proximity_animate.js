
AFRAME.registerComponent('proximity-animate', {
  schema: {
    player: { type: 'selector' },
    triggerDistance: { type: 'number', default: 10 },
    walkDistance: { type: 'number', default: 5 },
    speed: { type: 'number', default: 2 }
  },

  init: function () {
    this.animating = false;
    this.startPos = this.el.object3D.position.clone();
    this.direction = new THREE.Vector3();
    this.walkedDistance = 0;
    this.returning = false; // флаг возврата на старт
  },

  tick: function (time, delta) {
    if (!this.data.player) return;

    const playerPos = new THREE.Vector3();
    this.data.player.object3D.getWorldPosition(playerPos);

    const deerPos = this.el.object3D.position;
    const distance = deerPos.distanceTo(playerPos);
    const deltaSeconds = delta / 1000;

    if (distance <= this.data.triggerDistance) {
      // игрок близко — идём от него
      this.returning = false;
      this.direction.copy(deerPos).sub(playerPos).normalize();
      const angleOffset = (Math.random() - 0.5) * Math.PI / 4; // ±22.5°
      this.direction.applyAxisAngle(new THREE.Vector3(0,1,0), angleOffset);
      this.direction.y = 0;
      this.direction.normalize();

      // включаем анимацию
      this.el.setAttribute('animation-mixer', 'timeScale: 1');
      this.animating = true;

      // движение
      const moveStep = this.direction.clone().multiplyScalar(this.data.speed * deltaSeconds);
      deerPos.add(moveStep);
      deerPos.y = this.startPos.y;

      // разворот оленя
      const lookTarget = deerPos.clone().add(this.direction);
      lookTarget.y = deerPos.y;
      this.el.object3D.lookAt(lookTarget);

    } else if (!this.returning) {
      // игрок ушёл — начинаем возвращение
      this.returning = true;
      this.animating = true;
      this.direction.copy(this.startPos).sub(deerPos).normalize();
      this.direction.y = 0;
      this.el.setAttribute('animation-mixer', 'timeScale: 1');
    }

    // если в режиме возврата
    if (this.returning && this.animating) {
      const moveStep = this.direction.clone().multiplyScalar(this.data.speed * deltaSeconds);
      deerPos.add(moveStep);
      deerPos.y = this.startPos.y;

      // разворот оленя
      const lookTarget = deerPos.clone().add(this.direction);
      lookTarget.y = deerPos.y;
      this.el.object3D.lookAt(lookTarget);

      // проверка на возвращение на старт
      if (deerPos.distanceTo(this.startPos) < 0.05) {
        deerPos.copy(this.startPos);
        this.el.setAttribute('animation-mixer', 'timeScale: 0');
        this.animating = false;
        this.returning = false;
      }
    }
  }
});
