AFRAME.registerComponent('item-interaction', {
  schema: {
    type: { default: 'generic' } // 'key', 'coin', 'door'
  },

  init: function () {
    const el = this.el;

    // Создаём HUD, если его ещё нет
    if (!document.querySelector('#hud-message')) {
      const hud = document.createElement('div');
      hud.id = 'hud-message';
      Object.assign(hud.style, {
        position: 'fixed',
        bottom: '30px',
        left: '30px',
        fontFamily: 'monospace',
        fontSize: '16px',
        color: 'white',
        background: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(6px)',
        padding: '10px 14px',
        borderRadius: '10px',
        maxWidth: '300px',
        pointerEvents: 'none',
        opacity: '0',
        transform: 'translateY(10px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        zIndex: '999'
      });
      document.body.appendChild(hud);
    }

    const showMessage = (text, color = 'white') => {
      const hud = document.querySelector('#hud-message');
      hud.style.color = color;
      hud.innerHTML = text;
      hud.style.opacity = '1';
      hud.style.transform = 'translateY(0)';

      // Сбрасываем предыдущий таймер
      clearTimeout(hud.timeout);
      hud.timeout = setTimeout(() => {
        hud.style.opacity = '0';
        hud.style.transform = 'translateY(10px)';
      }, 2500);
    };

    el.addEventListener('click', () => {
      const type = this.data.type;

      switch (type) {
        case 'key':
          window.hasKey = true;
          el.parentNode.removeChild(el);
          showMessage('🔑 Ключ подобран!', 'gold');
          break;

        case 'coin':
          el.parentNode.removeChild(el);
          showMessage('🪙 Монета собрана!', 'yellow');
          break;

        case 'door':
          if (window.hasKey) {
            showMessage('🚪 Дверь открывается...', 'lightblue');
            window.hasKey = false;
            setTimeout(() => {
              el.setAttribute('animation-mixer', {
                clip: 'opened',
                loop: 'once',
                crossFadeDuration: 1
              });
            }, 300);
          } else {
            showMessage('🚫 Дверь заперта. Нужен ключ.', 'red');
          }
          break;

        default:
          showMessage('❔ Что-то произошло...', 'white');
      }
    });
  }
});
