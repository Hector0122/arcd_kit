(function () {
// Toggle de tema claro/oscuro.
var toggle = document.getElementById('themeToggle');
var root = document.documentElement;
function syncLabel() {
  var explicit = root.getAttribute('data-theme');
  var sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var isDark = explicit ? explicit === 'dark' : sysDark;
  toggle.textContent = isDark ? 'Modo claro' : 'Modo oscuro';
}
toggle.addEventListener('click', function () {
  var sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var current = root.getAttribute('data-theme') || (sysDark ? 'dark' : 'light');
  root.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
  syncLabel();
});
syncLabel();

// Botón "Probar" de cada tarjeta de motion — un solo listener delegado
// para las 5 tarjetas, la duración sale de data-ms (ver Fig. 05).
var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.getElementById('motionGrid').addEventListener('click', function (e) {
  var btn = e.target.closest('button[data-ms]');
  if (!btn) return;
  var ms = Number(btn.dataset.ms);
  var fill = btn.closest('.motion-card').querySelector('.fill');
  fill.style.transition = 'none';
  fill.style.width = '0%';
  requestAnimationFrame(function () {
    fill.style.transition = reduced ? 'none' : 'width ' + ms + 'ms cubic-bezier(0.2,0,0,1)';
    fill.style.width = '100%';
  });
  setTimeout(function () {
    fill.style.transition = 'none';
    fill.style.width = '0%';
  }, ms + 650);
});
})();
