const API_KEY = '301e660285164637974134112261804';
const CIUDAD  = 'Madrid';
const URL     = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${CIUDAD}&days=2&aqi=no&lang=es`;
 
// ── Play/Pause forecast ────────────────────
const iniciarPlay = () => {
  const btn    = document.getElementById('forecast-play');
  const scroll = document.getElementById('forecast-scroll');
  let playing  = false;
  let animId   = null;
  const velocidad = 1; // píxeles por frame
 
  const animar = () => {
    if (scroll.scrollLeft >= scroll.scrollWidth - scroll.clientWidth) {
      scroll.scrollLeft = 0;
    } else {
      scroll.scrollLeft += velocidad;
    }
    animId = requestAnimationFrame(animar);
  };
 
  btn.addEventListener('click', () => {
    if (playing) {
      cancelAnimationFrame(animId);
      btn.textContent = '▶';
    } else {
      animId = requestAnimationFrame(animar);
      btn.textContent = '⏸';
    }
    playing = !playing;
  });
};
 
// ── Fetch principal ────────────────────────
const obtenerTiempo = async () => {
  try {
    const res = await fetch(URL);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
 
    const data = await res.json();
 
    // Destructuring completo del JSON
    const {
      location: { name, country },
      current: {
        temp_c,
        feelslike_c, feelslike_f,
        humidity, wind_kph, wind_dir,
        precip_mm, pressure_mb,
        vis_km, uv,
        condition: { text, icon }
      },
      forecast: { forecastday }
    } = data;
 
    // ── Tarjeta principal ──────────────────
    document.getElementById('ciudad').textContent        = name;
    document.getElementById('pais').textContent          = country;
    document.getElementById('condicion').textContent     = text;
    document.getElementById('temperatura').textContent   = `${Math.round(temp_c)}°`;
    document.getElementById('icono').src                 = `https:${icon}`;
    document.getElementById('precipitacion').textContent = `${precip_mm} mm`;
    document.getElementById('humedad').textContent       = `${humidity}%`;
    document.getElementById('viento').textContent        = `${Math.round(wind_kph)} km/h ${wind_dir}`;
    document.getElementById('presion').textContent       = `${pressure_mb} hPa`;
    document.getElementById('sensacion').textContent     = `${feelslike_c}°C / ${feelslike_f}°F`;
    document.getElementById('visibilidad').textContent   = `${vis_km} km`;
    document.getElementById('uv').textContent            = uv;
 
    // Mostrar datos y ocultar loader
    document.getElementById('loader').classList.add('hidden');
    document.getElementById('meteo-data').classList.remove('hidden');
 
    // ── Forecast: horas restantes hoy + mañana completo ──
    const ahora         = new Date().getHours();
    const horasHoy      = forecastday[0].hour.filter(h => new Date(h.time).getHours() >= ahora);
    const horasManana   = forecastday[1].hour;
    const todasLasHoras = [...horasHoy, ...horasManana];
 
    const container = document.getElementById('forecast-scroll');
 
    todasLasHoras.forEach(({ time, temp_c: temp, condition: { icon: ico } }) => {
      const fecha     = new Date(time);
      const hora      = fecha.getHours();
      const esManana  = fecha.getDate() !== new Date().getDate();
 
      const item = document.createElement('div');
      item.classList.add('forecast-item');
 
      item.innerHTML = `
        <span class="forecast-hora">
          ${String(hora).padStart(2, '0')}:00
          ${esManana ? '<br><span class="forecast-manana">mañana</span>' : ''}
        </span>
        <img class="forecast-icon" src="https:${ico}" alt="clima" />
        <span class="forecast-temp">${Math.round(temp)}°</span>
      `;
      container.appendChild(item);
    });
 
    iniciarPlay();
 
  } catch (err) {
    document.getElementById('loader').textContent = '⚠ Error al cargar el tiempo';
    console.error('Error meteo:', err.message);
  }
};
 
obtenerTiempo();