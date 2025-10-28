AFRAME.registerComponent('toggle-campfire', {
  schema: {
    light: { type: 'selector' } // ссылка на <a-entity> с light
  },

  init: function () {
    const el = this.el;
    const light = this.data.light;
    const mixer = el.components['animation-mixer'];

    this.isOn = true; // костёр изначально горит

    el.addEventListener('click', () => {
      this.isOn = !this.isOn;

      // 🔥 Управляем анимацией
      if (mixer && mixer.mixer) {
        mixer.mixer.timeScale = this.isOn ? 1 : 0;
      }

      // 💡 Управляем светом
      if (light && light.setAttribute) {
        light.setAttribute('light', 'intensity', this.isOn ? 5 : 0);
      }
    });
  }
});