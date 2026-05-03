# Project Break 1 — Dashboard

**Full Stack Developer + IA · The Bridge · Promoción marzo 2026**

Primer proyecto de consolidación del bootcamp. Un dashboard personal construido íntegramente con **HTML5, CSS3 y JavaScript vanilla** — sin frameworks, sin librerías, sin atajos. Cada línea de código refleja los conceptos trabajados durante las unidades 1 a 6 del curso.

---

## Demo

[Ver proyecto en GitHub Pages](https://msimgit.github.io/ONLINE_FS_THEBRIDGE_MSIMARRO_PROJECTS/)

---

## Ejercicios

### Reloj digital
Reloj 24h con fecha actual y mensajes contextuales según la franja horaria.

**Técnicas aplicadas:**
- `new Date()` y sus métodos: `getHours()`, `getMinutes()`, `getSeconds()`, `getDate()`, `getMonth()`, `getFullYear()`
- `setInterval()` para actualización automática cada segundo
- `padStart(2, '0')` para formateo de dígitos
- Condicionales para mensajes por franja horaria
- `font-variant-numeric: tabular-nums` para estabilidad visual

**Referencias:**
- [MDN — Date constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date)
- [MDN — Date methods](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [MDN — setInterval](https://developer.mozilla.org/es/docs/Web/API/setInterval)

---

### Estación meteorológica
Datos del tiempo en tiempo real para Madrid: condición actual, temperatura, precipitación, humedad, viento, presión, visibilidad y UV. Previsión de las próximas 24h con scroll animado.

**Técnicas aplicadas:**
- `fetch()` con `async/await` y `try/catch` — patrón recomendado del Cheatsheet Sprint 6
- Destructuring anidado del JSON de respuesta — Cheatsheet Sprint 5
- `res.ok` para control de errores HTTP (no solo errores de red)
- Spread operator `[...horasHoy, ...horasManana]` para combinar arrays
- `Array.filter()` para filtrar horas pasadas
- `requestAnimationFrame` para animación fluida del scroll (60fps)
- Patrón loader/hidden con clases CSS para estados de carga
- `days=2` en el endpoint para obtener previsión de 48h

**API utilizada:**
- [WeatherAPI](https://www.weatherapi.com/) — endpoint `forecast.json`
- [Documentación completa WeatherAPI](https://www.weatherapi.com/docs/)
- [API Explorer](https://www.weatherapi.com/api-explorer.aspx)

**Referencias:**
- [MDN — fetch](https://developer.mozilla.org/es/docs/Web/API/fetch)
- [MDN — async/await](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/async_function)
- Cheatsheet Sprint 6 — Asincronía, async/await, promesas, fetch

---

### Generador de contraseñas seguras
Genera contraseñas de entre 12 y 50 caracteres con garantía de incluir mayúsculas, minúsculas, números y símbolos. Indicador de fortaleza y copia al portapapeles.

**Técnicas aplicadas:**
- `Math.random()` para generación de aleatoriedad
- Algoritmo **Fisher-Yates shuffle** para mezcla imparcial del array de caracteres
- Swap con destructuring: `[arr[i], arr[j]] = [arr[j], arr[i]]` — Cheatsheet Sprint 5
- `addEventListener` con eventos `input` para sincronía bidireccional slider ↔ input
- `navigator.clipboard.writeText()` — API moderna para copiar al portapapeles (devuelve Promise)
- Validación de inputs con feedback visual
- SVG embebido para iconos sin dependencias externas

**Referencias:**
- [MDN — Math.random](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Math/random)
- [MDN — Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText)
- Cheatsheet Sprint 5 — Destructuring y Spread

---

### Gestor de enlaces
Listado de recursos para developers organizado por categorías. Permite añadir y eliminar enlaces con persistencia en localStorage. Datos semilla siempre presentes al recargar.

**Técnicas aplicadas:**
- `localStorage` — `setItem`, `getItem`, `JSON.stringify`, `JSON.parse`
- Patrón CRUD con localStorage — Cheatsheet Sprint 5
- `Array.reduce()` para agrupación de links por categoría
- `createElement` + `appendChild` para renderizado dinámico del DOM
- `innerHTML` con template strings para generación de HTML
- Delegación de eventos — un solo listener en el contenedor padre
- `Date.now()` como ID único por timestamp
- Separación arquitectónica: datos **semilla** (en código, siempre presentes) vs datos de **usuario** (en localStorage, persistentes entre sesiones)
- `closest()` para detección del elemento clicado en delegación de eventos
- Favicon automático via Google S2 API: `https://www.google.com/s2/favicons?domain=`

**Referencias:**
- [MDN — localStorage](https://developer.mozilla.org/es/docs/Web/API/Window/localStorage)
- [MDN — createElement](https://developer.mozilla.org/es/docs/Web/API/Document/createElement)
- Cheatsheet Sprint 5 — LocalStorage, Destructuring, Spread, Bucles Avanzados

---

## Elementos transversales

Aplicados en todos los ejercicios del dashboard:

- **Navbar fijo** con `position: fixed` y `z-index` — siempre visible durante el scroll
- **CSS custom properties** (`--accent`, `--nav-height`, `--logo-size`) para coherencia visual
- **Imágenes de fondo aleatorias** en el footer con `Math.random()` y `setInterval` — colección de texturas de [Unsplash](https://unsplash.com/t/textures-patterns)
- **Grid responsivo** con `repeat(auto-fill, minmax())` y breakpoints explícitos
- **CSS Grid + Flexbox** combinados para layouts complejos
- **Transiciones y animaciones CSS** (`transition`, `@keyframes`, `animation`)
- `backdrop-filter: blur()` para efecto cristal en el footer
- Logo personal en formato SVG/PNG con fondo transparente — diseñado para el proyecto
- CSS por página (`reloj.css`, `meteo.css`, `pass.css`, `links.css`) + estilos globales compartidos (`styles.css`)

---

## Estructura del proyecto

```
projectbreak1/
├── index.html                 # Dashboard principal
├── README.md
├── assets/
│   └── ms_logo.png            # Logo personal MS
└── src/
    ├── css/
    │   ├── styles.css         # Estilos globales compartidos
    │   ├── reloj.css
    │   ├── meteo.css
    │   ├── pass.css
    │   └── links.css
    ├── js/
    │   ├── main.js            # Lógica de las imágenes aleatorias
    │   ├── reloj.js           # Lógica del reloj
    │   ├── meteo.js
    │   ├── pass.js
    │   └── links.js
    └── pages/
        ├── reloj.html
        ├── meteo.html
        ├── pass.html
        └── links.html
```

---

## Tecnologías

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

- **HTML5** — semántica, atributos `data-*`, formularios nativos
- **CSS3** — Grid, Flexbox, custom properties, animaciones, `backdrop-filter`
- **JavaScript ES6+** — async/await, destructuring, spread, arrow functions, template literals

---

## Recursos y referencias del curso

| Recurso | Descripción |
|---------|-------------|
| Cheatsheet Sprint 5 | Destructuring, Spread, Bucles Avanzados, LocalStorage |
| Cheatsheet Sprint 6 | Asincronía, async/await, Promesas, fetch |
| [MDN Web Docs](https://developer.mozilla.org/es/) | Referencia principal de HTML, CSS y JS |
| [W3Schools](https://www.w3schools.com) | Consulta rápida de sintaxis |
| [WeatherAPI](https://www.weatherapi.com/docs/) | API meteorológica del ejercicio Meteo |
| [Unsplash — Textures](https://unsplash.com/t/textures-patterns) | Imágenes de fondo aleatorias |
| [Bootstrap Icons](https://icons.getbootstrap.com) | Librería de iconos SVG |
| [Claude](https://claude.com/) | IA para depuración y ayuda |

---

## Autor

**Mario Simarro**
Full Stack Developer · The Bridge, promoción marzo 2026

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/mariosimarro)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/msimgit)