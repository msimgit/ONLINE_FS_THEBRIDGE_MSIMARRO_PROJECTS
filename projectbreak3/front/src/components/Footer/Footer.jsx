// Sprint 13 - Componente de presentación puro, sin props ni estado.
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <p>WorldCup Shop — Camisetas del Mundial 2026</p>
      <p>© {currentYear} Mario' Studio</p>
    </footer>
  );
}

export default Footer;
