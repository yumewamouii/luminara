

AFRAME.registerComponent('hdr-environment', {
  schema: {
    url: { type: 'string' },
    showBackground: { type: 'boolean', default: false },
    showGround: { type: 'boolean', default: false },
    groundSize: { type: 'number', default: 30 }
  },
  init: function () {
    const sceneEl = document.querySelector('a-scene');
    const scene = sceneEl.object3D;
    const renderer = sceneEl.renderer;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const rgbeLoader = new RGBELoader();
    rgbeLoader.load(this.data.url, texture => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;

      if (!this.data.showBackground) return;

      if (this.data.showGround) {
        const envMap = texture;
        // sky
        const skyGeometry = new THREE.SphereGeometry(1, 32, 32, 0, 2 * Math.PI, 0, Math.PI / 2);
        const skyMaterial = new THREE.MeshBasicMaterial({ side: THREE.BackSide, map: envMap });
        const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
        skyMesh.scale.set(this.data.groundSize, this.data.groundSize, -this.data.groundSize);
        skyMesh.position.y = this.data.groundSize * 0.1;
        scene.add(skyMesh);

        // ground
        const groundGeometry = new THREE.SphereGeometry(1, 32, 32, 0, 2 * Math.PI, Math.PI / 2, Math.PI);
        const groundMaterial = new THREE.MeshBasicMaterial({ side: THREE.BackSide, map: envMap });
        const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
        groundMesh.scale.set(this.data.groundSize, this.data.groundSize * 0.1, -this.data.groundSize);
        groundMesh.position.y = this.data.groundSize * 0.1;
        scene.add(groundMesh);
      } else {
        scene.background = texture;
      }
    });
  }
});
