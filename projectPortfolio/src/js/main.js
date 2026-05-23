// ── Imágenes de fondo aleatorias en el footer ──
const imagenes = [
  "https://images.unsplash.com/photo-1638369304934-2aee38e939c7?w=1600",
  "https://images.unsplash.com/photo-1772631289758-eadba33eb221?w=1600",
  "https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?w=1600",
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=1600",
  "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1600",
  "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1600",
  "https://images.unsplash.com/photo-1507908708918-778587c9e563?w=1600",
  "https://images.unsplash.com/photo-1572099606223-6e29045d7de3?w=1600",
  "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=1600",
  "https://images.unsplash.com/photo-1510519138101-570d1dca3d66?w=1600"
];

let indiceActual = 0;

function cambiarImagen() {
  let nuevoIndice;
  do {
    nuevoIndice = Math.floor(Math.random() * imagenes.length);
  } while (nuevoIndice === indiceActual);

  indiceActual = nuevoIndice;

  const franja = document.getElementById('bg-franja');
  if (franja) {
    franja.style.backgroundImage = `url('${imagenes[indiceActual]}')`;
  }
}

cambiarImagen();
setInterval(cambiarImagen, 15000);

// ── Animación de entrada escalonada en las cards ──
const cards = document.querySelectorAll('.card');

cards.forEach((card, i) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = `opacity 400ms ease ${i * 100}ms,
                            transform 400ms ease ${i * 100}ms,
                            border-color 200ms ease`;

  setTimeout(() => {
    card.style.opacity = '1';
    card.style.transform = 'translateY(0)';
  }, 100 + i * 100);
});
