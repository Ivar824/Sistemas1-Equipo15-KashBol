import React, { useState } from 'react';
import Sidebar from './components/common/Sidebar.jsx';
import Header from './components/common/Header.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ClientesPage from './pages/ClientesPage.jsx';
import VehiculosPage from './pages/VehiculosPage.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-taller-bg text-taller-textMain">
      {/* Barra lateral de navegación */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Área de contenido principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header currentModule={getModuleTitle()} />

        <main className="flex-1 overflow-y-auto bg-taller-bg">
          {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
          {activeTab === 'clientes' && <ClientesPage />}
          {activeTab === 'vehiculos' && <VehiculosPage />}
        </main>
      </div>
    </div>
  );
}
