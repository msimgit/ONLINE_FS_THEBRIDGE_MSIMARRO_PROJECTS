// Sprint 13 - Ruta comodín (path: '*') de React Router para URLs no definidas.
import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="not-found">
      <h1>404</h1>
      <p>La página que buscas no existe.</p>
      <Link to="/" className="btn btn-primary">
        Volver al inicio
      </Link>
    </section>
  );
}

export default NotFoundPage;
