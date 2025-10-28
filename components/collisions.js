AFRAME.registerComponent('reset-on-collision', {
  schema: {
    with: { default: '.collision' },
    colliderSize: { default: 0.5 },
    smoothRecovery: { default: true },
    pushBackDistance: { default: 0 }
  },

  init: function () {
    this.el.setAttribute(
      'geometry',
      `width: ${this.data.colliderSize}; depth: ${this.data.colliderSize}; height: ${this.data.colliderSize}`
    );

    this.mesh = this.el.getObject3D('mesh');
    this.boundingBox = new THREE.Box3();
    this.lastKnownGoodPosition = new THREE.Vector3().copy(this.el.object3D.position);
    this.isColliding = false;
    this.collisionRecoverySpeed = 0.3;
    this.previousPosition = new THREE.Vector3().copy(this.el.object3D.position);

    // Собираем все меши из элементов с class="collision"
    this.collideWithMeshes = [];
    this.refreshCollisionMeshes();

    // Автообновление, если модели ещё не успели прогрузиться
    this.el.sceneEl.addEventListener('loaded', () => this.refreshCollisionMeshes());
    this.el.sceneEl.addEventListener('object3dset', () => this.refreshCollisionMeshes());
  },

  refreshCollisionMeshes: function () {
    const collideWiths = this.el.sceneEl.querySelectorAll(this.data.with);
    this.collideWithMeshes = [];

    collideWiths.forEach((collideWith) => {
      const rootMesh = collideWith.getObject3D('mesh');
      if (!rootMesh) return;

      // Рекурсивно находим все меши внутри модели
      rootMesh.traverse((node) => {
        if (node.isMesh) this.collideWithMeshes.push(node);
      });
    });
  },

  tick: function () {
    if (!this.mesh) return;

    this.boundingBox.setFromObject(this.mesh);
    const thisMin = this.boundingBox.min;
    const thisMax = this.boundingBox.max;

    const currentPosition = new THREE.Vector3().copy(this.el.object3D.position);
    const collisionResult = this.checkCollision(thisMin, thisMax);

    if (collisionResult.colliding) {
      const pushBackPosition = this.calculatePushBackPosition(currentPosition, collisionResult);

      if (this.data.smoothRecovery) {
        const newPosition = new THREE.Vector3();
        newPosition.lerpVectors(currentPosition, pushBackPosition, this.collisionRecoverySpeed);
        this.el.setAttribute('position', newPosition);
      } else {
        this.el.setAttribute('position', pushBackPosition);
      }

      this.lastKnownGoodPosition.copy(pushBackPosition);
      this.isColliding = true;
    } else {
      if (!this.isColliding) {
        this.lastKnownGoodPosition.copy(currentPosition);
      }
      this.isColliding = false;
    }

    this.previousPosition.copy(currentPosition);
  },

  checkCollision: function (thisMin, thisMax) {
    const collisions = [];

    for (let i = 0; i < this.collideWithMeshes.length; i++) {
      const mesh = this.collideWithMeshes[i];
      const collideWithBoundingBox = new THREE.Box3().setFromObject(mesh);
      const collideWithMin = collideWithBoundingBox.min;
      const collideWithMax = collideWithBoundingBox.max;

      const isColliding =
        thisMin.x <= collideWithMax.x &&
        thisMax.x >= collideWithMin.x &&
        thisMin.y <= collideWithMax.y &&
        thisMax.y >= collideWithMin.y &&
        thisMin.z <= collideWithMax.z &&
        thisMax.z >= collideWithMin.z;

      if (isColliding) {
        collisions.push({
          collideWithBox: collideWithBoundingBox,
          playerBox: new THREE.Box3().set(thisMin, thisMax)
        });
      }
    }

    return {
      colliding: collisions.length > 0,
      collisions: collisions
    };
  },

  calculatePushBackPosition: function (currentPosition, collision) {
    const pushBack = new THREE.Vector3().copy(currentPosition);

    for (let i = 0; i < collision.collisions.length; i++) {
      const singleCollision = collision.collisions[i];
      const playerBox = singleCollision.playerBox;
      const obstacleBox = singleCollision.collideWithBox;

      const playerCenter = new THREE.Vector3();
      playerBox.getCenter(playerCenter);

      const obstacleCenter = new THREE.Vector3();
      obstacleBox.getCenter(obstacleCenter);

      const direction = new THREE.Vector3().subVectors(playerCenter, obstacleCenter);

      const overlapX = Math.min(
        playerBox.max.x - obstacleBox.min.x,
        obstacleBox.max.x - playerBox.min.x
      );
      const overlapZ = Math.min(
        playerBox.max.z - obstacleBox.min.z,
        obstacleBox.max.z - playerBox.min.z
      );

      if (Math.abs(overlapX) < Math.abs(overlapZ)) {
        // Выталкиваем по X
        if (direction.x > 0) {
          pushBack.x =
            obstacleBox.max.x +
            (playerBox.max.x - playerBox.min.x) / 2 +
            this.data.pushBackDistance;
        } else {
          pushBack.x =
            obstacleBox.min.x -
            (playerBox.max.x - playerBox.min.x) / 2 -
            this.data.pushBackDistance;
        }
      } else {
        // Выталкиваем по Z
        if (direction.z > 0) {
          pushBack.z =
            obstacleBox.max.z +
            (playerBox.max.z - playerBox.min.z) / 2 +
            this.data.pushBackDistance;
        } else {
          pushBack.z =
            obstacleBox.min.z -
            (playerBox.max.z - playerBox.min.z) / 2 -
            this.data.pushBackDistance;
        }
      }
    }

    return pushBack;
  }
});
