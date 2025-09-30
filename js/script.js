import AFRAME from 'aframe';


AFRAME.registerComponent('my-component', {
    init: function () {
        console.log('Component initialized');
    }
});

AFRAME.registerComponent("jump-controls", {
  schema: { height: { type: "number", default: 2 }, duration: { type: "number", default: 400 } },
  init: function () {
    this.isJumping = false;
    window.addEventListener("keydown", e => {
      if (e.code === "Space" && !this.isJumping) {
        this.jump();
      }
    });
  },
  jump: function () {
    const el = this.el;
    const startY = el.object3D.position.y;
    const peakY = startY + this.data.height;

    this.isJumping = true;

    // Вверх
    el.setAttribute("animation__up", {
      property: "position",
      to: `0 ${peakY} 0`,
      dur: this.data.duration / 2,
      easing: "easeOutQuad"
    });

    // Вниз
    el.setAttribute("animation__down", {
      property: "position",
      to: `0 ${startY} 0`,
      dur: this.data.duration / 2,
      delay: this.data.duration / 2,
      easing: "easeInQuad"
    });

    // Сбрасываем флаг после всей анимации
    setTimeout(() => {
      this.isJumping = false;
    }, this.data.duration);
  }
});
