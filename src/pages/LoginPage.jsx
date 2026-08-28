import React, { useState } from 'react';
import { authService } from '../services/authService.js';
import Alert from '../components/common/Alert.jsx';
import { Wrench, Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Por favor ingrese su correo electrónico y contraseña.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await authService.iniciarSesion(email, password);
      if (onLoginSuccess) {
        onLoginSuccess(data.session);
      }
    } catch (err) {
      console.error('Error de autenticación:', err);
      setErrorMessage(
        err.message || 'No se pudo iniciar sesión. Verifique sus credenciales.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-taller-bg p-4 select-none">
      <div className="w-full max-w-md bg-taller-surface border border-taller-border rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        {/* Cabecera del Login */}
        <div className="p-6 border-b border-taller-border text-center bg-taller-card/40">
          <div className="inline-flex p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30 mb-3">
            <Wrench className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-gray-100 uppercase tracking-wide">
            Sistema de Gestión
          </h1>
          <p className="text-xs text-blue-400 font-semibold uppercase tracking-widest mt-0.5">
            Taller Mecánico
          </p>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Acceso Seguro • Control de Identidad</span>
          </div>
        </div>

        {/* Formulario de Inicio de Sesión */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left" noValidate>
          {errorMessage && (
            <Alert
              type="error"
              message={errorMessage}
              onClose={() => setErrorMessage(null)}
            />
          )}

          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5"
            >
              Correo Electrónico
            </label>
            <div className="relative">
              <input
                id="login-email"
                type="email"
                disabled={isLoading}
                placeholder="operador@taller.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-taller-card border border-taller-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                autoComplete="email"
                required
              />
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="login-password"
                type="password"
                disabled={isLoading}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-taller-card border border-taller-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                autoComplete="current-password"
                required
              />
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/60 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-colors shadow-md cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando credenciales...</span>
              </>
            ) : (
              <span>Ingresar al Sistema</span>
            )}
          </button>
        </form>

        {/* Pie de página informativo */}
        <div className="px-6 py-3 bg-taller-card/20 border-t border-taller-border/60 text-center">
          <p className="text-[11px] text-gray-500">
            Acceso restringido a personal autorizado del taller.
          </p>
        </div>
      </div>
    </div>
  );
}
