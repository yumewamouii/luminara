  // ------------------------------
  // Гравитация и прыжок с рельефом
  AFRAME.registerComponent('gravity-terrain', {
  schema: {
    target: { type: 'selectorAll' }, // теперь можно указать несколько объектов
    offset: { default: 1.6 },
    jumpHeight: { default: 1.5 }
  },
  init: function () {
    this.velocityY = 0;
    this.isJumping = false;
    window.addEventListener('keydown', e => {
      if (e.code === 'Space' && !this.isJumping) {
        this.velocityY = this.data.jumpHeight * 0.2;
        this.isJumping = true;
      }
    });
  },
  tick: function (time, delta) {
    const el = this.el;
    const pos = el.object3D.position;
    const dt = delta / 1000;

    this.velocityY -= 1.5 * dt; // гравитация
    pos.y += this.velocityY;

    let highestGroundY = -Infinity;
    const raycaster = new THREE.Raycaster(
      new THREE.Vector3(pos.x, pos.y + 10, pos.z),
      new THREE.Vector3(0, -1, 0)
    );

    // Проходим по всем объектам target
    this.data.target.forEach(targetEl => {
      const mesh = targetEl.getObject3D('mesh');
      if (!mesh) return;
      const intersects = raycaster.intersectObject(mesh, true);
      if (intersects.length > 0) {
        const groundY = intersects[0].point.y + this.data.offset;
        if (groundY > highestGroundY) highestGroundY = groundY;
      }
    });

    if (highestGroundY !== -Infinity && pos.y <= highestGroundY) {
      pos.y = highestGroundY;
      this.velocityY = 0;
      this.isJumping = false;
    }

    el.object3D.position.copy(pos);
  }
});


  // ------------------------------
  // Ограничение движения по X/Z
  AFRAME.registerComponent('horizontal-bounds', {
    schema: {
      minX: { type: 'number', default: -100 },
      maxX: { type: 'number', default: 100 },
      minZ: { type: 'number', default: -100 },
      maxZ: { type: 'number', default: 100 }
    },
    tick: function () {
      const pos = this.el.object3D.position;
      pos.x = Math.min(this.data.maxX, Math.max(this.data.minX, pos.x));
      pos.z = Math.min(this.data.maxZ, Math.max(this.data.minZ, pos.z));
    }
  });

  // ------------------------------
 

