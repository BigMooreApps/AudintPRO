import React from 'react';
import { 
  ShieldCheck, 
  Key, 
  Map, 
  Users, 
  BarChart3, 
  Play, 
  ShieldAlert,
  FolderKanban,
  LogOut
} from 'lucide-react';

export default function Header({
  currentView = 'DASHBOARD',
  onChangeView,
  onOpenApiKeyModal,
  onOpenAuditoresModal,
  onOpenMapeoModal,
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
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        
        {/* Title and Branding (Clicking returns to Dashboard) */}
        <div 
          onClick={() => onChangeView('DASHBOARD')}
          className="flex items-center gap-3 cursor-pointer select-none group"
          title="Ir al Inicio / Dashboard"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white tracking-tight group-hover:text-indigo-300 transition-colors">Audint PRO</h1>
            <p className="text-xs text-slate-400">Auditoria ISO 17025 con IA</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
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

          {/* BOTONES EXCLUSIVOS DE SUPER AUDITOR (Mapeo, Auditores, Clave API) */}
          {isSuperAuditor && (
            <>
              {/* Botón 5: Mapeo */}
              <button
                onClick={onOpenMapeoModal}
                className="flex flex-col items-center justify-center w-16 h-14 bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 rounded-2xl transition-all group"
                title="Mapeo e Interrelación de Numerales vs Áreas"
              >
                <Map className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-transform mb-1" />
                <span className="text-[11px] font-bold text-slate-300 group-hover:text-white">Mapeo</span>
              </button>

              {/* Botón 6: Auditores */}
              <button
                onClick={onOpenAuditoresModal}
                className="flex flex-col items-center justify-center w-16 h-14 bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 rounded-2xl transition-all group"
                title="Gestión de Auditores y Áreas"
              >
                <Users className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform mb-1" />
                <span className="text-[11px] font-bold text-slate-300 group-hover:text-white">Auditores</span>
              </button>

              {/* Botón 7: Clave API */}
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
            </>
          )}

          {/* Botón de Salir (Último botón) */}
          <button
            onClick={onLogout}
            className="flex flex-col items-center justify-center w-16 h-14 bg-slate-950/70 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/50 rounded-2xl transition-all group"
            title={`Cerrar sesión actual (${isSuperAuditor ? 'Super Auditor' : currentUser?.areaNombre})`}
          >
            <LogOut className="w-5 h-5 text-rose-400 group-hover:scale-110 group-hover:text-rose-300 transition-transform mb-1" />
            <span className="text-[11px] font-bold text-slate-300 group-hover:text-rose-200">Salir</span>
          </button>

        </div>
      </div>
    </header>
  );
}
