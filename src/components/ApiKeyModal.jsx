import React, { useState, useEffect } from 'react';
import { X, Key, Check, Zap, Sparkles } from 'lucide-react';

export default function ApiKeyModal({ 
  isOpen, 
  onClose, 
  apiConfig = {}, 
  onSave, 
  setApiConfig 
}) {
  const [provider, setProvider] = useState(apiConfig?.provider || 'gemini');
  const [apiKey, setApiKey] = useState(apiConfig?.apiKey || '');
  const [model, setModel] = useState(apiConfig?.model || 'gemini-2.0-flash');

  useEffect(() => {
    if (apiConfig) {
      setProvider(apiConfig.provider || 'gemini');
      setApiKey(apiConfig.apiKey || '');
      setModel(apiConfig.model || 'gemini-2.0-flash');
    }
  }, [apiConfig, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const newConfig = { provider, apiKey: apiKey.trim(), model };
    
    if (typeof onSave === 'function') {
      onSave(newConfig);
    }
    if (typeof setApiConfig === 'function') {
      setApiConfig(newConfig);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white">Configuración del Motor de IA</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Proveedor de IA</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setProvider('gemini'); setModel('gemini-2.0-flash'); }}
                className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                  provider === 'gemini'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                }`}
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Google Gemini</span>
              </button>
              <button
                type="button"
                onClick={() => { setProvider('openai'); setModel('gpt-4o-mini'); }}
                className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                  provider === 'openai'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                }`}
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>OpenAI</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Pegue aquí su clave de API..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
            <p className="text-[10px] text-slate-500 mt-1">
              La API Key es obligatoria para ejecutar el análisis con el Agente de IA.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Modelo</label>
            {provider === 'gemini' ? (
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="gemini-2.0-flash">Gemini 2.0 Flash (Recomendado / Alta Disponibilidad)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Máxima Cuota Gratuita)</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              </select>
            ) : (
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="gpt-4o-mini">GPT-4o Mini (Recomendado)</option>
                <option value="gpt-4o">GPT-4o (Completo)</option>
              </select>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
