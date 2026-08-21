import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Info, 
  Trash2, 
  X, 
  Check, 
  ShieldAlert, 
  ArrowRight, 
  ArrowLeft,
  Lock,
  Flame
} from 'lucide-react';

export default function ConfirmDialogModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  onCancel,
  title, 
  message, 
  type = 'ALERT', // 'ALERT' | 'CONFIRM' | 'DANGER' | 'WARNING'
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar' 
}) {
  // Estado para la doble confirmación en acciones críticas/eliminaciones
  const [step, setStep] = useState(1); // 1 = Primera confirmación, 2 = Segunda confirmación de seguridad

  useEffect(() => {
    if (isOpen) {
      setStep(1); // Reset al abrir
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isDanger = type === 'DANGER';

  const handleFirstStep = () => {
    if (isDanger) {
      setStep(2); // Pasa a la segunda confirmación
    } else {
      if (onConfirm) onConfirm();
      onClose();
    }
  };

  const handleFinalConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 selection:bg-rose-500 selection:text-white">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header con Colores de la App */}
        <div className={`px-6 py-4 bg-slate-950 border-b flex items-center justify-between ${
          isDanger && step === 2 ? 'border-rose-500/30' : 'border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            {isDanger ? (
              <div className={`p-2.5 rounded-2xl border transition-all ${
                step === 2 
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse shadow-lg shadow-rose-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {step === 2 ? <ShieldAlert className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
              </div>
            ) : type === 'WARNING' ? (
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                <Info className="w-5 h-5" />
              </div>
            )}

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                {isDanger ? (step === 2 ? 'Paso 2 de 2 • Doble Confirmación' : 'Paso 1 de 2 • Advertencia') : 'Aviso del Sistema'}
              </span>
              <h3 className="font-bold text-white text-sm">
                {step === 2 ? '⚠️ ¿Confirmar Eliminación Definitiva?' : (title || 'Confirmar Acción')}
              </h3>
            </div>
          </div>
          
          <button 
            onClick={handleCancel} 
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Body */}
        <div className="p-6 text-xs text-slate-300 leading-relaxed space-y-3.5">
          {step === 1 ? (
            <div className="space-y-2">
              <p className="text-slate-200 font-normal">{message}</p>
              {isDanger && (
                <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/20 text-rose-300 text-[11.5px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Esta operación afectará la información almacenada en el sistema.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-rose-400 text-xs">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Segunda Confirmación de Seguridad Requerida</span>
                </div>
                <p className="text-[11.5px] text-slate-300 leading-relaxed">
                  ¿Está 100% seguro de proceder? Los datos eliminados <strong className="text-white">no se podrán recuperar</strong> ni restaurar posteriormente.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer con Estilo y Botones de la App */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          
          {type === 'ALERT' ? (
            <button
              onClick={onClose}
              className="w-full py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95"
            >
              Aceptar
            </button>
          ) : (
            <>
              {/* Botón Cancelar / Volver */}
              <button
                type="button"
                onClick={step === 2 ? () => setStep(1) : handleCancel}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-semibold text-xs rounded-xl transition-all"
              >
                {step === 2 ? '← Volver' : cancelText}
              </button>

              {/* Botón de Acción Principal */}
              {step === 1 ? (
                <button
                  type="button"
                  onClick={handleFirstStep}
                  className={`px-5 py-2.5 text-white font-bold text-xs rounded-xl transition-all shadow-lg flex items-center gap-1.5 transform active:scale-95 ${
                    isDanger
                      ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                  }`}
                >
                  <span>{confirmText}</span>
                  {isDanger && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinalConfirm}
                  className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs rounded-xl shadow-xl shadow-rose-600/40 flex items-center gap-2 transition-all transform active:scale-95 animate-pulse"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sí, Eliminar Definitivamente</span>
                </button>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
