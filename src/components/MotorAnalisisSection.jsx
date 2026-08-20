import React, { useState } from 'react';
import { Play, Sparkles, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw, Cpu, Sliders, Check, Bot, Plus, Edit3, Trash2 } from 'lucide-react';
import { runAIAuditAnalysis } from '../engine/aiService';
import ConfirmDialogModal from './ConfirmDialogModal';

export default function MotorAnalisisSection({
  numerales,
  evidencias,
  apiConfig,
  customPrompt,
  agents = [],
  selectedAgentId,
  onSelectAgent,
  onOpenAgentManager,
  onDeleteAgent,
  onAuditComplete,
  onGoToResults
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalyzingIndex, setCurrentAnalyzingIndex] = useState(-1);
  const [progressPercent, setProgressPercent] = useState(0);
  const [logMessages, setLogMessages] = useState([]);
  const [analysisFinished, setAnalysisFinished] = useState(false);

  // Dialog State for custom alerts
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'ALERT'
  });

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  const startAuditProcess = async () => {
    // REGLA ABSOLUTA 1: Si no hay API Key configurada, BLOQUEAR y MOSTRAR ALERTA
    if (!apiConfig || !apiConfig.apiKey || !apiConfig.apiKey.trim()) {
      setDialogState({
        isOpen: true,
        title: 'API Key No Configurada',
        message: 'No se ha configurado una clave API para conectar con el servicio de IA (Gemini / OpenAI).\n\nPor favor haga clic en "Configurar API Key" en la barra superior e ingrese su clave API para poder ejecutar el análisis.',
        type: 'WARNING'
      });
      return;
    }

    // REGLA ABSOLUTA 2: Si el agente no tiene instrucciones
    if (!customPrompt || !customPrompt.trim()) {
      setDialogState({
        isOpen: true,
        title: 'Instrucciones del Agente Requeridas',
        message: "El Agente seleccionado no tiene instrucciones de auditoría configuradas. Por favor edita sus instrucciones para proceder con el análisis.",
        type: 'WARNING'
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisFinished(false);
    setLogMessages([]);
    setProgressPercent(0);

    const total = numerales.length;

    addLog(`Conectando con la API de IA para el Agente: "${selectedAgent?.nombre || 'Auditor IA'}"...`);

    for (let i = 0; i < total; i++) {
      setCurrentAnalyzingIndex(i);
      const sub = numerales[i];

      addLog(`Enviando Subnumeral ${sub.codigo} a la IA...`);
      addLog(`  ↳ Procesando con el System Prompt del Agente...`);
      await delay(100);

      setProgressPercent(Math.round(((i + 1) / total) * 100));
    }

    addLog('Recibiendo respuesta directa de la API de IA...');

    try {
      const auditOutput = await runAIAuditAnalysis(numerales, evidencias, apiConfig, customPrompt);
      onAuditComplete(auditOutput);
      setAnalysisFinished(true);
      addLog('✅ Auditoría finalizada con éxito por la API de IA.');
      
      // NAVEGACIÓN AUTOMÁTICA AL PASO 4 (RESULTADOS)
      if (onGoToResults) {
        onGoToResults();
      }
    } catch (err) {
      console.error('Error durante el análisis:', err);
      setIsAnalyzing(false);
      setAnalysisFinished(false);
      
      // BLOQUEAR Y MOSTRAR ALERTA DE ERROR DE API (SIN HACER NADA MÁS)
      setDialogState({
        isOpen: true,
        title: 'Error de Ejecución en la API de IA',
        message: `La llamada a la API de IA falló o fue rechazada:\n\n${err.message || 'Verifica tu API Key o conexión a internet.'}`,
        type: 'DANGER'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addLog = (msg) => {
    setLogMessages((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  return (
    <div className="space-y-6">
      
      {/* Top Banner Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <span>Paso 3: Motor de Análisis de Auditoría por Agentes IA</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Evaluación independiente de cada subnumeral ejecutada directamente por el Agente en la API de IA.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {!isAnalyzing && !analysisFinished && (
            <button
              onClick={startAuditProcess}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Ejecutar Análisis con Agente ({numerales.length})</span>
            </button>
          )}

          {analysisFinished && (
            <button
              onClick={onGoToResults}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95"
            >
              <span>Ver Resultados de Auditoría</span>
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* AGENT SELECTION CARD (Selección y Gestión Directa de Agentes) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Agentes de Auditoría IA</h3>
          </div>
          <button
            onClick={() => onOpenAgentManager({ mode: 'CREATE' })}
            className="flex items-center gap-1.5 text-xs text-white font-bold bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Agente</span>
          </button>
        </div>

        {/* Agent Selector Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {agents.map((ag) => {
            const isSelected = ag.id === selectedAgentId;
            return (
              <div
                key={ag.id}
                onClick={() => onSelectAgent(ag.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2.5 relative group ${
                  isSelected
                    ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-lg ring-1 ring-indigo-500/50'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      <Bot className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-white truncate max-w-[140px]">
                      {ag.nombre}
                    </h4>
                  </div>
                  
                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAgentManager({ mode: 'EDIT', targetId: ag.id });
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/20 rounded-lg transition-all"
                      title="Editar instrucciones de este Agente"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {agents.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteAgent(ag.id);
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Eliminar este Agente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {ag.descripcion && (
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{ag.descripcion}</p>
                )}

                <div className="pt-1 flex items-center justify-between border-t border-slate-800/80 text-[10px]">
                  <span className={isSelected ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {isSelected ? '● Seleccionado para Auditoría' : 'Hacer clic para activar'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress & Live Console */}
      {(isAnalyzing || analysisFinished) && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center text-xs text-slate-300 font-semibold mb-2">
              <span>Progreso de Auditoría por Agente IA</span>
              <span className="text-indigo-400 font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
              <div
                className="bg-gradient-to-r from-indigo-500 via-emerald-400 to-indigo-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Subnumeral Progress Checklist */}
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {numerales.map((sub, idx) => (
              <div
                key={sub.id}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  idx === currentAnalyzingIndex && isAnalyzing
                    ? 'bg-indigo-600/10 border-indigo-500 text-white'
                    : idx < currentAnalyzingIndex || analysisFinished
                    ? 'bg-slate-950/80 border-slate-800/80 text-slate-300'
                    : 'bg-slate-950/30 border-slate-900 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold font-mono text-indigo-400">{sub.codigo}</span>
                  <span className="truncate max-w-md text-slate-300">{sub.requisito}</span>
                </div>

                <div className="flex items-center gap-2">
                  {idx < currentAnalyzingIndex || analysisFinished ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Auditado
                    </span>
                  ) : idx === currentAnalyzingIndex && isAnalyzing ? (
                    <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium animate-pulse">
                      <Sparkles className="w-3 h-3" /> Analizando...
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-600">Pendiente</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Console Log Terminal */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">
              Registro del Proceso de Análisis por Agente (Log de Trazabilidad):
            </span>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] text-emerald-400 font-mono h-32 overflow-y-auto custom-scrollbar space-y-1">
              {logMessages.map((msg, i) => (
                <div key={i}>{msg}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Custom App Confirm Dialog */}
      <ConfirmDialogModal
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState(prev => ({ ...prev, isOpen: false }))}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
      />
    </div>
  );
}
