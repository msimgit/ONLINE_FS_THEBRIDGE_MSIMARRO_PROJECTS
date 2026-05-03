// ── Caracteres disponibles ─────────────────
const MAYUSCULAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const MINUSCULAS = 'abcdefghijklmnopqrstuvwxyz';
const NUMEROS    = '0123456789';
const SIMBOLOS   = '!@#$%^&*()-_=+';
const TODOS      = MAYUSCULAS + MINUSCULAS + NUMEROS + SIMBOLOS;
const ICONO_COPIAR = '⧉';
const ICONO_CHECK  = '✓';

// ── Elementos del DOM ──────────────────────
const inputLongitud  = document.getElementById('longitud');
const slider         = document.getElementById('slider');
const btnGenerar     = document.getElementById('btn-generar');
const btnCopiar      = document.getElementById('btn-copiar');
const resultado      = document.getElementById('pass-resultado');
const strengthBar    = document.getElementById('strength-bar');
const strengthLabel  = document.getElementById('strength-label');
const msgCopiado     = document.getElementById('msg-copiado');

// ── Sincronizar input y slider ─────────────
inputLongitud.addEventListener('input', () => {
  let val = parseInt(inputLongitud.value);
  if (val < 12) val = 12;
  if (val > 50) val = 50;
  slider.value = val;
});

slider.addEventListener('input', () => {
  inputLongitud.value = slider.value;
});

// ── Fisher-Yates shuffle ───────────────────
// Mezcla un array aleatoriamente — estándar global
const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];   // swap con destructuring
  }
  return arr;
};

// ── Generar contraseña ─────────────────────
const generarPassword = (longitud) => {
  // Paso 1: garantizamos mínimo uno de cada tipo
  const obligatorios = [
    MAYUSCULAS[Math.floor(Math.random() * MAYUSCULAS.length)],
    MINUSCULAS[Math.floor(Math.random() * MINUSCULAS.length)],
    NUMEROS   [Math.floor(Math.random() * NUMEROS.length)],
    SIMBOLOS  [Math.floor(Math.random() * SIMBOLOS.length)]
  ];

  // Paso 2: rellenamos el resto con caracteres aleatorios de TODOS
  const resto = [];
  for (let i = 4; i < longitud; i++) {
    resto.push(TODOS[Math.floor(Math.random() * TODOS.length)]);
  }

  // Paso 3: mezclamos para que los obligatorios no estén siempre al principio
  return shuffle([...obligatorios, ...resto]).join('');
};

// ── Indicador de fortaleza ─────────────────
const actualizarFortaleza = (longitud) => {
  let nivel, color, texto;

  if (longitud < 16) {
    nivel = 33; color = '#e74c3c'; texto = 'Débil';
  } else if (longitud < 28) {
    nivel = 66; color = '#f39c12'; texto = 'Media';
  } else {
    nivel = 100; color = '#2ecc71'; texto = 'Fuerte';
  }

  strengthBar.style.width     = `${nivel}%`;
  strengthBar.style.background = color;
  strengthLabel.textContent   = texto;
  strengthLabel.style.color   = color;
};

// ── Evento generar ─────────────────────────
btnGenerar.addEventListener('click', () => {
  const longitud = parseInt(inputLongitud.value);

  // Validación
  if (longitud < 12 || longitud > 50 || isNaN(longitud)) {
    resultado.textContent = 'Longitud entre 12 y 50';
    return;
  }

  const pass = generarPassword(longitud);
  resultado.textContent = pass;
  actualizarFortaleza(longitud);
});

// ── Evento copiar ──────────────────────────
btnCopiar.addEventListener('click', () => {
  const pass = resultado.textContent;
  if (pass === '--' || pass === 'Longitud entre 12 y 50') return;

  navigator.clipboard.writeText(pass).then(() => {
    msgCopiado.classList.remove('hidden');
    setTimeout(() => msgCopiado.classList.add('hidden'), 2000);
  });
});