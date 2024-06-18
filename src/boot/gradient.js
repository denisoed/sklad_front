import { boot } from 'quasar/wrappers'

function drawCircle(context, xPos, yPos, radius, color) {
  context.beginPath();
  context.arc(xPos, yPos, radius, 0, 360, false);
  context.fillStyle = color;
  context.fill();
}

export default boot(async ({ app }) => {
  app.directive('gradient', {
    mounted(el) {
      let bg = document.createElement('div');
      bg.classList.add('gradient-background');
      bg.innerHTML = "<canvas id='gradient-canvas'></canvas>";
      el.prepend(bg);
      const canvas = document.getElementById("gradient-canvas");
      if (!canvas) return;
      const context = canvas.getContext("2d");
      const maxRadius = 50;
      const minRadius = 3;
      const colors = ["#00ff00", "#0000ff"];
      const numColors = colors.length;

      for (let i = 0; i < 50; i++) {
        const xPos = Math.random() * canvas.width;
        const yPos = Math.random() * 10;
        const radius = minRadius + (Math.random() * (maxRadius - minRadius));
        let colorIndex = Math.random() * (numColors - 1);
        colorIndex = Math.round(colorIndex);
        const color = colors[colorIndex];
        drawCircle(context, xPos, yPos, radius, color);
      }
    }
  })
})
