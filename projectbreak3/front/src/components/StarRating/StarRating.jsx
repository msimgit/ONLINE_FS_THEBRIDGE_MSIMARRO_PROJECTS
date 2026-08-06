// Modo lectura (como antes): <StarRating rating={4} />
// Modo interactivo (nuevo): <StarRating rating={value} onChange={setValue} />
function StarRating({ rating, max = 5, onChange }) {
  const isInteractive = typeof onChange === "function";

  if (!isInteractive) {
    return (
      <span className="star-rating" aria-label={`${rating} de ${max}`}>
        {"★".repeat(rating)}
        {"☆".repeat(max - rating)}
      </span>
    );
  }

  return (
    <div
      className="star-rating star-rating-interactive"
      role="radiogroup"
      aria-label="Puntuación"
    >
      {Array.from({ length: max }, (_, index) => index + 1).map((value) => (
        <button
          key={value}
          type="button"
          className="star-rating-star"
          onClick={() => onChange(value)}
          aria-label={`${value} estrella${value > 1 ? "s" : ""}`}
          aria-pressed={value <= rating}
        >
          {value <= rating ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}

export default StarRating;
