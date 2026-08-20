import React from 'react';
import { AlertTriangle, Info, Trash2, X, Check } from 'lucide-react';

export default function ConfirmDialogModal({ isOpen, onClose, onConfirm, title, message, type = 'ALERT', confirmText = 'Confirmar', cancelText = 'Cancelar' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {type === 'DANGER' ? (
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Trash2 className="w-5 h-5" />
              </div>
            ) : type === 'WARNING' ? (
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Info className="w-5 h-5" />
              </div>
            )}
            <h3 className="font-bold text-white text-sm">{title || 'Aviso del Sistema'}</h3>
          </div>
          
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Body */}
        <div className="p-6 text-xs text-slate-300 leading-relaxed space-y-2">
          <p>{message}</p>
        </div>

        {/* Action Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex justify-end gap-2">
          {type === 'ALERT' ? (
            <button
              onClick={onClose}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
            >
              Aceptar
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition-all"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  if (onConfirm) onConfirm();
                  onClose();
                }}
                className={`px-5 py-2 text-white font-bold text-xs rounded-xl transition-all shadow-lg ${
                  type === 'DANGER'
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                }`}
              >
                {confirmText}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
