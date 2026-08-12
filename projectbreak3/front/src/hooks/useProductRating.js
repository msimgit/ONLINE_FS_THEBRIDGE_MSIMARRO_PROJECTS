// Sprint 14 - Hook personalizado: useEffect para recalcular datos derivados de forma asíncrona.
import { useState, useEffect } from "react";
import { getReviews } from "../api/reviews";

// Sin endpoint de media en el backend: pedimos las reviews del producto y
// calculamos aquí. OJO: esto dispara una petición extra POR CADA card que
// se pinta (grid de ProductsPage = hasta 34 peticiones de golpe). Si el
// rate limiter empieza a dar problemas, la solución de fondo es que el
// backend calcule y devuelva la media directamente en GET /products.
export const useProductRating = (productId) => {
  const [average, setAverage] = useState(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getReviews(productId)
      .then((reviews) => {
        if (cancelled || reviews.length === 0) return;
        const avg =
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        setAverage(avg);
        setCount(reviews.length);
      })
      .catch(() => {
        // Silencioso a propósito: si falla (ej. 429), la card simplemente
        // no muestra el badge de valoración, no rompe el resto de la UI.
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  return { average, count };
};
