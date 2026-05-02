// ── Reloj ─────────────────────────────────────

function actualizarReloj() {
  const ahora = new Date();

  // Horas, minutos y segundos con formato 00
  const horas   = ahora.getHours()  .toString().padStart(2, '0');
  const minutos = ahora.getMinutes().toString().padStart(2, '0');
  const segundos= ahora.getSeconds().toString().padStart(2, '0');

  // Fecha con formato DD/MM/AAAA
  const dia  = ahora.getDate()    .toString().padStart(2, '0');
  const mes  = (ahora.getMonth() + 1).toString().padStart(2, '0'); // +1 porque enero = 0
  const anio = ahora.getFullYear();

  // Inyectamos en el HTML
  document.getElementById('clock-time').textContent = `${horas}:${minutos}:${segundos}`;
  document.getElementById('clock-date').textContent = `${dia}/${mes}/${anio}`;
}

// Ejecuta al cargar la página y luego cada segundo
actualizarReloj();
setInterval(actualizarReloj, 1000);