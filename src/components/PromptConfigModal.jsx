import React, { useState } from 'react';
import { X, Sliders, Check, Trash2, Sparkles } from 'lucide-react';

export const DEFAULT_AUDIT_PROMPT = "";

export default function PromptConfigModal({ isOpen, onClose, customPrompt, onSavePrompt }) {
  const [promptText, setPromptText] = useState(customPrompt || "");

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSavePrompt(promptText);
    onClose();
  };

  const handleClear = () => {
    setPromptText("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Caja de Instrucciones y Criterios de Auditoría</h3>
              <p className="text-[11px] text-slate-400">Ingrese las instrucciones exactas con las que la IA debe realizar el análisis de auditoría</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-200">
                Instrucciones de Auditoría (Requerido)
              </label>
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Limpiar Caja</span>
              </button>
            </div>

            <textarea
              rows={10}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-indigo-500 custom-scrollbar"
              placeholder="Ingrese aquí las instrucciones personalizadas de auditoría (ej. 'Evaluar la concordancia de la política de confidencialidad y verificar la matriz de riesgos...'). Si esta caja está vacía, no se generará ningún análisis."
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              ⚠️ El sistema funcionará exclusivamente según las instrucciones que escribas en esta caja.
            </p>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/30"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Instrucciones</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
