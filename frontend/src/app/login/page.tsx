import './login.css';

// export default function ProductosPage() {
//   return (
//     <main className="min-h-screen bg-white p-6">
//       <h1 className="text-3xl font-bold mb-6">🛍️ Productos</h1>
//       {/* Contenido de la página */}
//       <BackHomeButton />
//     </main>
//   );
// }
export default function LoginPage() {
  return (
    <main className="container">
      <div className="card">
        <img
          src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"
          alt="Google logo"
          className="google-logo"
        />
        <h1>Accede a tu cuenta</h1>
        <p>Usa tu Cuenta de Google</p>
        <form>
          <div className="input-group">
            <input type="email" placeholder="Correo electrónico o teléfono" />
          </div>
          <a href="#" className="forgot-link">
            ¿Olvidaste el correo electrónico?
          </a>
          <p className="guest-info">
            ¿Esta no es tu computadora? Usa una ventana de navegación privada para acceder.{" "}
            <a href="#">Más información para usar el modo de invitado</a>
          </p>
          <div className="buttons-container">
            <a href="#" className="create-account-link">
              Crear cuenta
            </a>
            <button type="submit" className="next-button">
              Siguiente
            </button>
          </div>
        </form>
      </div>
      <div className="footer">
        <div className="lang-selector">
          <select name="lang">
            <option value="es-la">Español (Latinoamérica)</option>
            <option value="en">English (United States)</option>
          </select>
        </div>
        <div className="footer-links">
          <a href="#">Ayuda</a>
          <a href="#">Privacidad</a>
          <a href="#">Condiciones</a>
        </div>
      </div>
    </main>
  );
}