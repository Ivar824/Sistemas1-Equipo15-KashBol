import React, { useState, useEffect } from 'react';
import { authService } from './services/authService.js';
import Sidebar from './components/common/Sidebar.jsx';
import Header from './components/common/Header.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ClientesPage from './pages/ClientesPage.jsx';
import VehiculosPage from './pages/VehiculosPage.jsx';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // 1. Comprobar sesión activa inicial
    const initAuth = async () => {
      try {
        const sesionActual = await authService.obtenerSesion();
        setSession(sesionActual);
      } catch (err) {
        console.error('Error al inicializar sesión:', err);
      } finally {
        setLoadingAuth(false);
      }
    };

    initAuth();

    // 2. Suscribirse a eventos de autenticación de Supabase (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
    const { data: authListener } = authService.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setLoadingAuth(false);
    });

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.cerrarSesion();
      setSession(null);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  const getModuleTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Panel Principal';
      case 'clientes':
        return 'Gestión de Clientes (HU-01 / HU-02)';
      case 'vehiculos':
        return 'Gestión de Vehículos (HU-03 / HU-04)';
      default:
        return 'Taller Mecánico';
    }
  };

  // Pantalla de carga mientras se verifica el token con Supabase
  if (loadingAuth) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-taller-bg text-gray-300 select-none">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-sm font-medium">Verificando sesión segura...</span>
        </div>
      </div>
    );
  }

  // Si no existe sesión activa, renderizar la página de Login
  if (!session) {
    return <LoginPage onLoginSuccess={(newSession) => setSession(newSession)} />;
  }

  // Si existe sesión activa, permitir acceso a la aplicación
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-taller-bg text-taller-textMain">
      {/* Barra lateral de navegación con control de logout y datos de usuario */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        user={session.user}
      />

      {/* Área de contenido principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header currentModule={getModuleTitle()} user={session.user} />

        <main className="flex-1 overflow-y-auto bg-taller-bg">
          {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
          {activeTab === 'clientes' && <ClientesPage />}
          {activeTab === 'vehiculos' && <VehiculosPage />}
        </main>
      </div>
    </div>
  );
}
