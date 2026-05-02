function getMensaje(horas) {
  if (horas >= 1  && horas <= 7)  return "Es hora de descansar. Apaga y sigue mañana 🌙";
  if (horas >= 7  && horas <= 12) return "Buenos días, desayuna fuerte y a darle al código ☕";
  if (horas >= 12 && horas <= 14) return "Echa un rato más pero no olvides comer 🍽️";
  if (horas >= 14 && horas <= 16) return "Espero que hayas comido bien 😄";
  if (horas >= 16 && horas <= 18) return "Buenas tardes, el último empujón 💪";
  if (horas >= 18 && horas <= 22) return "Esto ya son horas extras... piensa en parar pronto ⚠️";
  return "Buenas noches, es hora de descansar 😴";
}

function actualizarReloj() {
  const ahora = new Date();

  const horas    = ahora.getHours();
  const minutos  = ahora.getMinutes();
  const segundos = ahora.getSeconds();

  // Formato con ceros delante
  const horasStr = horas.toString().padStart(2, '0');
  const minutosStr = minutos.toString().padStart(2, '0');
  const segundosStr = segundos.toString().padStart(2, '0');

  const dia = ahora.getDate().toString().padStart(2, '0');
  const mes = (ahora.getMonth() + 1).toString().padStart(2, '0');
  const anio = ahora.getFullYear();

  // DOM: inyectamos hora, fecha y mensaje
  document.getElementById('clock-time').textContent = `${horasStr}:${minutosStr}:${segundosStr}`;
  document.getElementById('clock-date').textContent = `${dia}/${mes}/${anio}`;

  // El mensaje solo lo actualizamos si el elemento existe
  const msgEl = document.getElementById('clock-msg');
  if (msgEl) msgEl.textContent = getMensaje(horas);
}

actualizarReloj();
setInterval(actualizarReloj, 1000);