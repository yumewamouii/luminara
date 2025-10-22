
AFRAME.registerComponent('light-reactive', {
  schema: {
    player: { type: 'selector', default: '#player' },
    normalColor: { type: 'color', default: '#fff9e5' },
    flickerColor: { type: 'color', default: '#ffdca0' },
    normalIntensity: { type: 'number', default: 1.5 },
    distance: { type: 'number', default: 8 },  // радиус реакции
    flickerSpeed: { type: 'number', default: 30 } // частота мигания
  },
  init: function () {
    this.time = 0;
  },
  tick: function (time, delta) {
    if (!this.data.player) return;
    this.time += delta / 1000;

    const light = this.el.getAttribute('light');
    const playerPos = this.data.player.object3D.position;
    const lightPos = this.el.object3D.getWorldPosition(new THREE.Vector3());
    const dist = lightPos.distanceTo(playerPos);

    if (dist < this.data.distance) {
      // 💥 Игрок близко — мигаем
      const flicker = Math.abs(Math.sin(this.time * this.data.flickerSpeed)) * 0.8 + 0.2;
      const intensity = this.data.normalIntensity * flicker;
      const c1 = new THREE.Color(this.data.normalColor);
      const c2 = new THREE.Color(this.data.flickerColor);
      const currentColor = c1.clone().lerp(c2, flicker);

      this.el.setAttribute('light', 'intensity', intensity);
      this.el.setAttribute('light', 'color', `#${currentColor.getHexString()}`);
    } else {
      // 🌙 Игрок далеко — мягкое свечение
      const calm = (Math.sin(this.time * 1.2) + 1) / 2;
      const intensity = this.data.normalIntensity * (0.9 + calm * 0.1);
      this.el.setAttribute('light', 'intensity', intensity);
      this.el.setAttribute('light', 'color', this.data.normalColor);
    }
  }
});
