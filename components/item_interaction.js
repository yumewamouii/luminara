AFRAME.registerComponent('item-interaction', {
  schema: {
    type: {default: 'generic'} // 'key', 'coin', 'door'
  },
  init: function () {
    const el = this.el;

    el.addEventListener('click', () => {
      const type = this.data.type;

      switch (type) {
        case 'key':
          window.hasKey = true;
          el.parentNode.removeChild(el);
          console.log('%c🔑 Ключ подобран!', 'color: gold');
          break;

        case 'coin':
          el.parentNode.removeChild(el);
          console.log('%c🪙 Монеты собраны!', 'color: yellow');
          break;

        case 'door':
          if (window.hasKey) {
            console.log('%c🚪 Дверь открывается...', 'color: lightblue');
            window.hasKey = false;
            // После короткой паузы — анимация открытия
            setTimeout(() => {
              el.setAttribute('animation-mixer', {
                clip: 'opened',
                loop: 'once',
                crossFadeDuration: 1
              });
            }, 300); // можно подстроить под длину "closed"
          } else {
            console.log('%c🚫 Дверь заперта. Нужен ключ.', 'color: red');
          }
          break;
      }
    });
  }
});
