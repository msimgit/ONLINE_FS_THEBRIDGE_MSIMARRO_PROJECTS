import { useState, useEffect, useCallback } from 'react';
import { getReviews } from '../api/reviews';

export const useReviews = (productId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const reviews = await getReviews(productId);
      setData(reviews);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // refetch es nuevo: lo usa ReviewForm para recargar la lista tras un POST
  return { data, loading, error, refetch: fetchReviews };
};