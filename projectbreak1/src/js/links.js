// ── Semilla — siempre presente al cargar ───
const SEMILLA = [
  {
    id: 'seed-1',
    titulo: 'The Pragmatic Programmer',
    url: 'https://www.amazon.com/Pragmatic-Programmer-Journeyman-Master/dp/020161622X',
    categoria: 'Essential "Must-Read" Books',
    esSemilla: true
  },
  {
    id: 'seed-2',
    titulo: 'Clean Code',
    url: 'https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882',
    categoria: 'Essential "Must-Read" Books',
    esSemilla: true
  },
  {
    id: 'seed-3',
    titulo: 'Dev.to — Software Architecture',
    url: 'https://dev.to/hamedi/software-architecture-for-developers-4g56',
    categoria: 'Software Architecture',
    esSemilla: true
  },
  {
    id: 'seed-4',
    titulo: 'Bytebytego',
    url: 'https://bytebytego.com/guides/the-ultimate-software-architect-knowledge-map/',
    categoria: 'Software Architecture',
    esSemilla: true
  },
  {
    id: 'seed-5',
    titulo: 'Devôt — Design Patterns',
    url: 'https://devot.team/blog/design-patterns',
    categoria: 'Design Patterns',
    esSemilla: true
  },
  {
    id: 'seed-6',
    titulo: 'MDN Web Docs',
    url: 'https://developer.mozilla.org/es/',
    categoria: 'Web Development & Languages',
    esSemilla: true
  },
  {
    id: 'seed-7',
    titulo: 'W3Schools',
    url: 'https://www.w3schools.com/tags/tag_link.asp',
    categoria: 'Web Development & Languages',
    esSemilla: true
  },
  {
    id: 'seed-8',
    titulo: 'GitHub Copilot',
    url: 'https://github.com/features/copilot',
    categoria: 'Data Science, AI & Algorithms',
    esSemilla: true
  },
  {
    id: 'seed-9',
    titulo: 'Air.dev',
    url: 'https://air.dev',
    categoria: 'Data Science, AI & Algorithms',
    esSemilla: true
  },
  {
    id: 'seed-10',
    titulo: 'The Odin Project',
    url: 'https://www.theodinproject.com',
    categoria: 'Top Free Resources',
    esSemilla: true
  }
];

// ── Orden fijo de categorías ───────────────
const CATEGORIAS = [
  'Essential "Must-Read" Books',
  'Software Architecture',
  'Design Patterns',
  'Web Development & Languages',
  'Data Science, AI & Algorithms',
  'Top Free Resources',
  'Miscellaneous'
];

// ── localStorage — solo links del usuario ──
const KEY = 'ms-links-usuario';

const cargarUsuario = () => {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
};

const guardarUsuario = (links) => {
  localStorage.setItem(KEY, JSON.stringify(links));
};

const todosLosLinks = () => [...SEMILLA, ...cargarUsuario()];

// ── Renderizar grid ────────────────────────
const renderTodo = () => {
  const grid  = document.getElementById('links-grid');
  const links = todosLosLinks();
  grid.innerHTML = '';

  // Agrupamos por categoría con reduce
  const porCategoria = links.reduce((acc, link) => {
    if (!acc[link.categoria]) acc[link.categoria] = [];
    acc[link.categoria].push(link);
    return acc;
  }, {});

  // Cada categoría es una .card igual que en index.html
  CATEGORIAS.forEach(categoria => {
    const items = porCategoria[categoria] || [];

    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.categoria = categoria;

    // Título — igual que card-title del index
    const titulo = document.createElement('h2');
    titulo.classList.add('card-title');
    titulo.textContent = categoria;
    card.appendChild(titulo);

    // Lista de links dentro de la card
    if (items.length === 0) {
      const vacio = document.createElement('p');
      vacio.classList.add('card-desc');
      vacio.textContent = 'Sin enlaces aún. Añade el primero.';
      card.appendChild(vacio);
    } else {
      const lista = document.createElement('ul');
      lista.classList.add('links-lista');

      items.forEach(link => {
        const li = document.createElement('li');
        li.classList.add('links-item');
        li.dataset.id = link.id;

        li.innerHTML = `
          <a href="${link.url}" target="_blank" rel="noopener" class="links-enlace">
            <img class="links-favicon"
                 src="https://www.google.com/s2/favicons?domain=${link.url}&sz=32"
                 alt="" />
            <span class="links-titulo">${link.titulo}</span>
          </a>
          <button class="links-delete"
                  data-id="${link.id}"
                  data-semilla="${link.esSemilla ? 'true' : 'false'}"
                  title="Eliminar">✕</button>
        `;
        lista.appendChild(li);
      });

      card.appendChild(lista);
    }

    grid.appendChild(card);
  });
};

// ── Añadir enlace ──────────────────────────
document.getElementById('btn-añadir').addEventListener('click', () => {
  const titulo    = document.getElementById('input-titulo').value.trim();
  const url       = document.getElementById('input-url').value.trim();
  const categoria = document.getElementById('input-categoria').value;
  const error     = document.getElementById('links-error');

  if (!titulo || !url || !url.startsWith('http') || !categoria) {
    error.classList.remove('hidden');
    setTimeout(() => error.classList.add('hidden'), 3000);
    return;
  }

  const nuevoLink = { id: Date.now(), titulo, url, categoria, esSemilla: false };

  const usuario = cargarUsuario();
  usuario.push(nuevoLink);
  guardarUsuario(usuario);
  renderTodo();

  document.getElementById('input-titulo').value    = '';
  document.getElementById('input-url').value       = '';
  document.getElementById('input-categoria').value = '';
});

// ── Eliminar enlace ────────────────────────
document.getElementById('links-grid').addEventListener('click', (e) => {
  const btn = e.target.closest('.links-delete');
  if (!btn) return;

  const esSemilla = btn.dataset.semilla === 'true';
  const id        = btn.dataset.id;

  if (esSemilla) {
    // Semilla: desaparece en la sesión, vuelve al refrescar
    btn.closest('.links-item').remove();
  } else {
    // Usuario: se borra de localStorage definitivamente
    const usuario = cargarUsuario().filter(l => String(l.id) !== String(id));
    guardarUsuario(usuario);
    renderTodo();
  }
});

// ── Arranque ───────────────────────────────
renderTodo();
