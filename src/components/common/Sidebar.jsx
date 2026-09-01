import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Wrench, 
  Package, 
  CreditCard, 
  BarChart3, 
  LogOut,
  ShieldCheck 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onLogout, user }) {
  const navItems = [
    { id: 'dashboard', label: 'PANEL', icon: LayoutDashboard, enabled: true },
    { id: 'clientes', label: 'CLIENTES', icon: Users, enabled: true, badge: 'HU-01 / HU-02' },
    { id: 'vehiculos', label: 'VEHÍCULOS', icon: Car, enabled: true, badge: 'HU-03 / HU-04' },
    { id: 'servicios', label: 'SERVICIOS', icon: Wrench, enabled: true, badge: 'Sprint 2' },
    { id: 'repuestos', label: 'REPUESTOS', icon: Package, enabled: false, badge: 'Sprint 2' },
    { id: 'pagos', label: 'PAGOS', icon: CreditCard, enabled: false, badge: 'Sprint 3' },
    { id: 'informes', label: 'INFORMES', icon: BarChart3, enabled: false, badge: 'Sprint 3' },
  ];

  return (
    <aside className="w-64 bg-taller-surface border-r border-taller-border flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand / Title */}
        <div className="p-5 border-b border-taller-border">
          <div className="text-xs font-semibold tracking-widest text-taller-textMuted uppercase mb-1">
            Menú Principal
          </div>
          <div className="font-bold text-gray-100 text-lg tracking-tight flex items-center gap-2">
            <span className="text-blue-500">TALLER</span> MECÁNICO
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => item.enabled && setActiveTab(item.id)}
                disabled={!item.enabled}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : item.enabled
                    ? 'text-gray-300 hover:bg-taller-card hover:text-white'
                    : 'text-gray-600 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.enabled ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isActive
                        ? 'bg-blue-700/80 text-blue-100'
                        : item.enabled
                        ? 'bg-blue-950/60 text-blue-400 border border-blue-800/40'
                        : 'bg-neutral-800 text-neutral-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / User info & Logout button */}
      <div className="p-3 border-t border-taller-border space-y-2">
        {user && (
          <div className="px-3.5 py-2 bg-taller-card/60 border border-taller-border/60 rounded-lg">
            <div className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Sesión Activa</span>
            </div>
            <div className="text-xs font-mono text-gray-200 truncate mt-0.5" title={user.email}>
              {user.email}
            </div>
          </div>
        )}

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>CERRAR SESIÓN</span>
        </button>
      </div>
    </aside>
  );
}
