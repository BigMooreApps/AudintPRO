import React from 'react';
import { ShieldAlert, Clock, LogOut, CheckCircle2 } from 'lucide-react';

export default function InactivityTimeoutModal({
  isOpen,
  remainingSeconds = 120,
  onStayLoggedIn,
  onLogout
}) {
  if (!isOpen) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  // Porcentaje restante de los 120 segundos de gracia (entre 5 min y 7 min)
  const percentageRemaining = Math.max(0, Math.min(100, (remainingSeconds / 120) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0D1222] border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_20px_70px_rgba(0,0,0,0.8)] space-y-6 relative overflow-hidden animate-in zoom-in-95">
        
        {/* Glow decorativo superior */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500" />
        
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/10 animate-pulse">
            <Clock className="w-7 h-7" />
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-white">
            ¿Desea mantener su sesión activa?
          </h3>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Hemos detectado <strong className="text-slate-200 font-semibold">5 minutos de inactividad</strong>. Por seguridad y protección de los datos de auditoría, su sesión se cerrará automáticamente en:
          </p>
        </div>

        {/* Contador Regresivo */}
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 text-center space-y-2.5">
          <div className="font-mono text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-400 to-amber-400 tracking-wider">
            {formattedTime}
          </div>

          {/* Barra de progreso regresiva */}
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div 
              className="bg-gradient-to-r from-rose-500 to-amber-400 h-full rounded-full transition-all duration-1000"
              style={{ width: `${percentageRemaining}%` }}
            />
          </div>

          <span className="text-[11px] text-slate-500 block">
            Cierre total automático tras 7 minutos sin interacción
          </span>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onLogout}
            className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Cerrar Sesión</span>
          </button>

          <button
            type="button"
            onClick={onStayLoggedIn}
            className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Mantener Sesión</span>
          </button>
        </div>

      </div>
    </div>
  );
}
