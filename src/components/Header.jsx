import React from 'react';
import { 
  ShieldCheck, 
  Key, 
  BarChart3, 
  Play, 
  ShieldAlert,
  FolderKanban,
  LogOut,
  User
} from 'lucide-react';

export default function Header({
  currentView = 'DASHBOARD',
  onChangeView,
  onOpenApiKeyModal,
  onOpenCompromisosModal,
  onOpenAuditoriasModal,
  activeAudit,
  compromisosPendientesCount = 0,
  apiConfig,
  currentUser,
  onLogout
}) {
  const isSuperAuditor = currentUser?.role === 'SUPER_AUDITOR';

  return (
    <>
      {/* Top Header Bar */}
      <header className="bg-slate-900/95 border-b border-slate-800/80 sticky top-0 z-30 shadow-xl backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          
          {/* Title and Branding (Clicking returns to Dashboard) */}
          <div 
            onClick={() => onChangeView('DASHBOARD')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group min-w-0"
            title="Ir al Inicio / Dashboard"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                  Audint <span className="text-indigo-400">PRO</span>
                </h1>
                <span className="hidden xs:inline-block px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  ISO 17025
                </span>
              </div>
              <p className="text-[10.5px] sm:text-xs text-slate-400 truncate">
                {isSuperAuditor ? 'Super Auditor' : (currentUser?.areaNombre || 'Auditor de Área')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Buttons (hidden on mobile, replaced by bottom bar) */}
          <div className="hidden sm:flex items-center gap-2">
            
            {/* Botón 1: New AU (Primera opción para Super Auditor) */}
            {isSuperAuditor && (
              <button
                onClick={onOpenAuditoriasModal}
                className="flex flex-col items-center justify-center w-16 h-14 bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 rounded-2xl transition-all group"
                title="Historial y Gestión de Ciclos de Auditoría ISO 17025"
              >
                <FolderKanban className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform mb-1" />
                <span className="text-[11px] font-bold text-slate-300 group-hover:text-white">New AU</span>
              </button>
            )}

            {/* Botón 2: Dashboard */}
            <button
              onClick={() => onChangeView('DASHBOARD')}
              className={`flex flex-col items-center justify-center w-16 h-14 border rounded-2xl transition-all group ${
                currentView === 'DASHBOARD'
                  ? 'bg-indigo-600/25 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-600/20 ring-1 ring-indigo-500/40'
                  : 'bg-slate-950/70 hover:bg-slate-800 border-slate-800 hover:border-indigo-500/40 text-slate-300'
              }`}
              title="Pantalla de Inicio: Dashboard de Avance"
            >
              <BarChart3 className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[11px] font-bold group-hover:text-white">Dashboard</span>
            </button>

            {/* Botón 3: Auditoría */}
            <button
              onClick={() => onChangeView('AUDIT')}
              className={`flex flex-col items-center justify-center w-16 h-14 border rounded-2xl transition-all group ${
                currentView === 'AUDIT'
                  ? 'bg-indigo-600/25 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-600/20 ring-1 ring-indigo-500/40'
                  : 'bg-slate-950/70 hover:bg-slate-800 border-slate-800 hover:border-indigo-500/40 text-slate-300'
              }`}
              title="Ejecutar Auditoría Guiada (4 Pasos)"
            >
              <Play className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[11px] font-bold group-hover:text-white">Auditoría</span>
            </button>

            {/* Botón 4: Tareas */}
            <button
              onClick={onOpenCompromisosModal}
              className="flex flex-col items-center justify-center w-16 h-14 bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-2xl transition-all group relative"
              title="Seguimiento de Tareas, Compromisos y Fechas de Revisión"
            >
              <ShieldAlert className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[11px] font-bold text-slate-300 group-hover:text-white">Tareas</span>
              {compromisosPendientesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {compromisosPendientesCount}
                </span>
              )}
            </button>

            {/* Botón 5: Clave API (Exclusivo de Super Auditor) */}
            {isSuperAuditor && (
              <button
                onClick={onOpenApiKeyModal}
                className={`flex flex-col items-center justify-center w-16 h-14 bg-slate-950/70 hover:bg-slate-800 border rounded-2xl transition-all group ${
                  apiConfig?.apiKey
                    ? 'border-emerald-500/40 text-emerald-300'
                    : 'border-slate-800 hover:border-emerald-500/50 text-slate-300'
                }`}
                title={apiConfig?.apiKey ? 'Clave API Conectada' : 'Configurar Clave API'}
              >
                <Key className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform mb-1" />
                <span className="text-[11px] font-bold group-hover:text-white">
                  {apiConfig?.apiKey ? 'API Lista' : 'Clave API'}
                </span>
              </button>
            )}

            {/* Botón de Salir (Desktop) */}
            <button
              onClick={() => onLogout && onLogout()}
              className="flex flex-col items-center justify-center w-16 h-14 bg-slate-950/70 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/50 rounded-2xl transition-all group cursor-pointer"
              title={`Cerrar sesión actual (${isSuperAuditor ? 'Super Auditor' : currentUser?.areaNombre})`}
            >
              <LogOut className="w-5 h-5 text-rose-400 group-hover:scale-110 group-hover:text-rose-300 transition-transform mb-1" />
              <span className="text-[11px] font-bold text-slate-300 group-hover:text-rose-200">Salir</span>
            </button>

          </div>

          {/* Quick Header Actions for Mobile Only */}
          <div className="flex sm:hidden items-center gap-1.5">
            {isSuperAuditor && (
              <button
                onClick={onOpenApiKeyModal}
                className={`p-2 rounded-xl border transition-all ${
                  apiConfig?.apiKey
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
                title="Clave API"
              >
                <Key className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onLogout && onLogout()}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-rose-400 hover:bg-rose-950/30 transition-all cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* ========================================================
          MOBILE NATIVE-STYLE BOTTOM NAVIGATION BAR (Fixed on Mobile)
         ======================================================== */}
      <nav aria-label="Navegación Móvil" className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/80 px-2 py-1.5 shadow-[0_-10px_30px_rgba(0,0,0,0.6)]">
        <div className="grid grid-cols-4 xs:grid-cols-5 gap-1 items-center justify-around max-w-md mx-auto">
          
          {/* Tab 1: Dashboard */}
          <button
            onClick={() => onChangeView('DASHBOARD')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all relative ${
              currentView === 'DASHBOARD'
                ? 'text-indigo-400 bg-indigo-500/15 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Inicio</span>
            {currentView === 'DASHBOARD' && (
              <span className="w-1 h-1 rounded-full bg-indigo-400 absolute bottom-0.5" />
            )}
          </button>

          {/* Tab 2: Auditoría */}
          <button
            onClick={() => onChangeView('AUDIT')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all relative ${
              currentView === 'AUDIT'
                ? 'text-emerald-400 bg-emerald-500/15 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Auditar</span>
            {currentView === 'AUDIT' && (
              <span className="w-1 h-1 rounded-full bg-emerald-400 absolute bottom-0.5" />
            )}
          </button>

          {/* Tab 3: Tareas */}
          <button
            onClick={onOpenCompromisosModal}
            className="flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl text-slate-400 hover:text-amber-300 transition-all relative"
          >
            <div className="relative">
              <ShieldAlert className="w-5 h-5 mb-0.5 text-amber-400" />
              {compromisosPendientesCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-amber-500 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {compromisosPendientesCount}
                </span>
              )}
            </div>
            <span className="text-[10px]">Tareas</span>
          </button>

          {/* Tab 4: Ciclos AU (Super Auditor) */}
          {isSuperAuditor && (
            <button
              onClick={onOpenAuditoriasModal}
              className="flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl text-slate-400 hover:text-indigo-300 transition-all"
            >
              <FolderKanban className="w-5 h-5 mb-0.5 text-indigo-400" />
              <span className="text-[10px]">Auditorías</span>
            </button>
          )}

          {/* Tab 5: Salir */}
          <button
            onClick={onLogout}
            className="flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl text-slate-400 hover:text-rose-400 transition-all"
          >
            <LogOut className="w-5 h-5 mb-0.5 text-rose-400" />
            <span className="text-[10px]">Salir</span>
          </button>

        </div>
      </nav>
    </>
  );
}
