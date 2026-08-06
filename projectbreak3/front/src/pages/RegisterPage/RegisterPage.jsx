import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../store/authSlice";
import FormInput from "../../components/FormInput/FormInput";
import Button from "../../components/Button/Button";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current.focus();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = "El email es obligatorio";
    else if (!email.includes("@")) newErrors.email = "El email no es válido";

    if (!password) newErrors.password = "La contraseña es obligatoria";
    else if (password.length < 6) newErrors.password = "Mínimo 6 caracteres";

    if (confirmPassword !== password)
      newErrors.confirmPassword = "Las contraseñas no coinciden";

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = validate();
    setErrors(newErrors);
    setApiError(null);

    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    try {
      // El backend loguea también en el registro (pone la cookie),
      // así que tras esto el usuario ya está autenticado de verdad.
      await dispatch(register({ email, password })).unwrap();
      setSuccess(true);
    } catch (err) {
      setApiError(
        typeof err === "string" ? err : "No se pudo completar el registro.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <section className="auth-page">
        <h1>¡Cuenta creada!</h1>
        <p>Ya has iniciado sesión con tu nueva cuenta.</p>
        <Button onClick={() => navigate("/")}>Continuar</Button>
      </section>
    );
  }

  return (
    <section className="auth-page">
      <h1>Crear cuenta</h1>

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

        <FormInput
          label="Repite la contraseña"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
        />

        {apiError && <p className="form-error">{apiError}</p>}

        <Button type="submit" disabled={submitting}>
          {submitting ? "Creando cuenta..." : "Registrarme"}
        </Button>
      </form>

      <p className="auth-switch">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </section>
  );
}

export default RegisterPage;
