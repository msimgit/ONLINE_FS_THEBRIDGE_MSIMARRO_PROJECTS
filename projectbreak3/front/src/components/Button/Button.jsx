// Sprint 13 - Props + children: botón reutilizable que recibe variante/tamaño por props.
function Button({ variant = 'primary', children, ...rest }) {
  return (
    <button className={`btn btn-${variant}`} {...rest}>
      {children}
    </button>
  );
}

export default Button;