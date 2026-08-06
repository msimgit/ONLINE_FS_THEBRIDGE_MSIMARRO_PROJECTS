import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { login } from "../../store/authSlice";
import FormInput from "../../components/FormInput/FormInput";
import Button from "../../components/Button/Button";

function LoginPage() {
  // Un estado por campo: React es el dueño del valor (formulario controlado)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Errores de validación por campo + error global del backend
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Paso 8: ref al primer input para el autofocus
  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current.focus();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = "El email es obligatorio";
    else if (!email.includes("@")) newErrors.email = "El email no es válido";
    if (!password) newErrors.password = "La contraseña es obligatoria";
    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // sin esto, el navegador recarga la página

    const newErrors = validate();
    setErrors(newErrors);
    setApiError(null);

    // Si hay errores de validación, no llamamos al backend
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    try {
      // .unwrap() hace que el rejectWithValue del thunk se lance como
      // excepción aquí, así podemos seguir usando try/catch como antes.
      await dispatch(login({ email, password })).unwrap();

      // Si PrivateRoute nos mandó a /login guardando de dónde veníamos,
      // volvemos ahí; si no, a la home.
      const redirectTo = location.state?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setApiError(
        typeof err === "string"
          ? err
          : "No se pudo iniciar sesión. Revisa tus credenciales.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <h1>Iniciar sesión</h1>

      <form onSubmit={handleSubmit} noValidate>
        <FormInput
          ref={emailRef}
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <FormInput
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />

        {apiError && <p className="form-error">{apiError}</p>}

        <Button type="submit" disabled={submitting}>
          {submitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className="auth-switch">
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </section>
  );
}

export default LoginPage;
