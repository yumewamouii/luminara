  // ------------------------------
  // Гравитация и прыжок с рельефом
  AFRAME.registerComponent('gravity-terrain', {
    schema: {
      target: { type: 'selector' },
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
      const mesh = this.data.target.getObject3D('mesh');
      if (!mesh) return;

      // гравитация
      this.velocityY -= 1.5 * dt;
      pos.y += this.velocityY;

      // проверка земли под игроком
      const raycaster = new THREE.Raycaster(
        new THREE.Vector3(pos.x, pos.y + 10, pos.z),
        new THREE.Vector3(0, -1, 0)
      );
      const intersects = raycaster.intersectObject(mesh, true);

      if (intersects.length > 0) {
        const groundY = intersects[0].point.y + this.data.offset;
        if (pos.y <= groundY) {
          pos.y = groundY;
          this.velocityY = 0;
          this.isJumping = false;
        }
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
  // HDR фон
  AFRAME.registerComponent('hdr-sky', {
    schema: { src: { type: 'string' } },
    init: function() {
      const scene = this.el.sceneEl.object3D;
      const loader = new THREE.RGBELoader();
      loader.setDataType(THREE.UnsignedByteType);
      loader.load(this.data.src, function(texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        scene.background = texture;
      });
    }
  });

  // ------------------------------
  // Коллизии без отталкивания
  AFRAME.registerComponent('no-pass-through', {
  schema: {
    obstacles: { type: 'selectorAll' },
    radius: { default: 0.5 }
  },
  init: function () {
    this.pos = new THREE.Vector3();
    this.temp = new THREE.Vector3();
  },
  tick: function () {
    const el = this.el;
    el.object3D.getWorldPosition(this.pos);

    const obstacles = this.data.obstacles;
    if (!obstacles || obstacles.length === 0) return;

    obstacles.forEach(obstacle => {
      if (!obstacle.getObject3D) return;
      const mesh = obstacle.getObject3D('mesh');
      if (!mesh) return;

      mesh.updateWorldMatrix(true, false);
      const box = new THREE.Box3().setFromObject(mesh);

      // Проверяем пересечение с "сферой игрока"
      const closestPoint = box.clampPoint(this.pos, new THREE.Vector3());
      const distance = closestPoint.distanceTo(this.pos);
      if (distance < this.data.radius) {
        // Сдвигаем игрока от объекта
        const push = this.pos.clone().sub(closestPoint).normalize().multiplyScalar(this.data.radius - distance);
        el.object3D.position.add(push);
      }
    });
  }
});



