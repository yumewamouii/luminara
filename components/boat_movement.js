AFRAME.registerComponent('boat-movement', {
  schema: {
    player: { type: 'selector' },
    speed: { default: 0.5 },
    activationDistance: { default: 3.0 },
    forwardAxis: { default: 'z' } // можно 'x', '-x', 'z', '-z'
  },

  init: function () {
    this.tempBoatPos = new THREE.Vector3();
    this.tempPlayerPos = new THREE.Vector3();
    this.localDir = new THREE.Vector3();
    this.worldDir = new THREE.Vector3();
  },

  tick: function (time, deltaTime) {
    const el = this.el;
    const player = this.data.player;
    if (!player) return;

    el.object3D.getWorldPosition(this.tempBoatPos);
    player.object3D.getWorldPosition(this.tempPlayerPos);

    const distance = this.tempBoatPos.distanceTo(this.tempPlayerPos);
    const heightDiff = Math.abs(this.tempPlayerPos.y - this.tempBoatPos.y);
    const onBoat = (distance < this.data.activationDistance && heightDiff < 2);

    if (onBoat) {
      const delta = deltaTime / 1000;

      // Вычисляем направление в локальных координатах
      switch (this.data.forwardAxis) {
        case 'x': this.localDir.set(1, 0, 0); break;
        case '-x': this.localDir.set(-1, 0, 0); break;
        case 'z': this.localDir.set(0, 0, 1); break;
        case '-z': this.localDir.set(0, 0, -1); break;
      }

      // Преобразуем локальное направление в мировое
      el.object3D.localToWorld(this.worldDir.copy(this.localDir)).sub(this.tempBoatPos).normalize();

      // Двигаем лодку
      el.object3D.position.addScaledVector(this.worldDir, this.data.speed * delta);
    }
  }
});
