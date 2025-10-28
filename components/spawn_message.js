AFRAME.registerComponent('spawn-message', {
  schema: {
    text: { default: 'Пройдите через мост и найдите дом' },
    duration: { default: 4000 } // время в мс
  },

  init: function () {
    const msg = document.createElement('div');
    msg.textContent = this.data.text;
    msg.style.position = 'fixed';
    msg.style.top = '20px';
    msg.style.left = '50%';
    msg.style.transform = 'translateX(-50%)';
    msg.style.padding = '10px 20px';
    msg.style.background = 'rgba(0, 0, 0, 0.6)';
    msg.style.color = 'white';
    msg.style.fontFamily = 'Arial, sans-serif';
    msg.style.fontSize = '18px';
    msg.style.borderRadius = '8px';
    msg.style.zIndex = '9999';
    msg.style.textAlign = 'center';
    msg.style.opacity = '1';
    msg.style.transition = 'opacity 0.8s ease';

    document.body.appendChild(msg);

    // Через duration — плавное исчезновение
    setTimeout(() => {
      msg.style.opacity = '0';
      setTimeout(() => msg.remove(), 800);
    }, this.data.duration);
  }
});
