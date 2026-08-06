// src/components/FormInput/FormInput.jsx
function FormInput({ label, error, ref, ...rest }) {
  return (
    <div className="form-input">
      <label>
        {label}
        <input ref={ref} {...rest} />
      </label>
      {error && <p className="form-input-error">{error}</p>}
    </div>
  );
}

export default FormInput;