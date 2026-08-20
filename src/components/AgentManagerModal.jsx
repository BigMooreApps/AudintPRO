import React, { useState, useEffect } from 'react';
import { X, Bot, Plus, Trash2, Edit3, Check } from 'lucide-react';
import ConfirmDialogModal from './ConfirmDialogModal';

export const DEFAULT_AGENTS = [
  {
    id: 'agent-iso-17025',
    nombre: 'Auditor ISO/IEC 17025 (Imparcialidad y Calidad)',
    descripcion: 'Auditor especializado en la evaluación de la norma ISO/IEC 17025:2017 para laboratorios de ensayo y calibración.',
    instrucciones: `Evaluación de Auditoría ISO/IEC 17025:

Para cada subnumeral generar la siguiente información:

- Estado del cumplimiento (CUMPLE o NO CUMPLE)
- Fragmento de la evidencia utilizada.
- Justificación técnica.
- Nivel de confianza en porcentaje

NOTA 1: Cuando se tengan varias evidencias mencionalas como evidencia 1, evidencia 2 etc y deja un renglon de separacion entre las mismas.

NOTA 2: Cuando NO CUMPLA la respuesta debe ser la descripción del numeral en negación.`
  }
];

export default function AgentManagerModal({ isOpen, onClose, agents, selectedAgentId, initialMode = 'EDIT', targetAgentId, onSelectAgent, onSaveAgents }) {
  const [agentsList, setAgentsList] = useState(agents && agents.length > 0 ? agents : DEFAULT_AGENTS);
  const [activeEditingId, setActiveEditingId] = useState(targetAgentId || selectedAgentId || (agentsList[0] ? agentsList[0].id : ''));
  
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [instrucciones, setInstrucciones] = useState('');

  // Dialog State for custom alerts/confirms
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'ALERT',
    onConfirmAction: null
  });

  // Sync effect when modal opens or active editing ID changes
  useEffect(() => {
    if (isOpen) {
      if (initialMode === 'CREATE') {
        const newId = `agent-${Date.now()}`;
        setActiveEditingId(newId);
        setNombre('Nuevo Agente Auditor');
        setDescripcion('Agente personalizado de auditoría documental');
        setInstrucciones('');
      } else {
        const targetId = targetAgentId || selectedAgentId;
        const current = agentsList.find(a => a.id === targetId) || agentsList[0];
        if (current) {
          setActiveEditingId(current.id);
          setNombre(current.nombre);
          setDescripcion(current.descripcion || '');
          setInstrucciones(current.instrucciones || '');
        }
      }
    }
  }, [isOpen, initialMode, targetAgentId, selectedAgentId]);

  if (!isOpen) return null;

  const handleSelectToEdit = (agent) => {
    setActiveEditingId(agent.id);
    setNombre(agent.nombre);
    setDescripcion(agent.descripcion || '');
    setInstrucciones(agent.instrucciones || '');
  };

  const handleCreateNewAgent = () => {
    const newId = `agent-${Date.now()}`;
    setActiveEditingId(newId);
    setNombre('Nuevo Agente Auditor');
    setDescripcion('Agente personalizado de auditoría documental');
    setInstrucciones('');
  };

  const handleDeleteAgent = (idToDelete, e) => {
    if (e) e.stopPropagation();
    if (agentsList.length <= 1) {
      setDialogState({
        isOpen: true,
        title: 'Acción No Permitida',
        message: 'Debe existir al menos un Agente Auditor en la lista.',
        type: 'ALERT'
      });
      return;
    }

    const agentToDelete = agentsList.find(a => a.id === idToDelete);

    setDialogState({
      isOpen: true,
      title: 'Eliminar Agente Auditor',
      message: `¿Está seguro de eliminar el agente "${agentToDelete?.nombre || 'seleccionado'}"? Esta acción no se puede deshacer.`,
      type: 'DANGER',
      onConfirmAction: () => {
        const updated = agentsList.filter(a => a.id !== idToDelete);
        setAgentsList(updated);
        onSaveAgents(updated);
        if (activeEditingId === idToDelete && updated.length > 0) {
          handleSelectToEdit(updated[0]);
        }
      }
    });
  };

  const handleSaveCurrentAgent = (e) => {
    e.preventDefault();
    let updated;
    const exists = agentsList.some(a => a.id === activeEditingId);

    if (exists) {
      updated = agentsList.map(a => {
        if (a.id === activeEditingId) {
          return { ...a, nombre, descripcion, instrucciones };
        }
        return a;
      });
    } else {
      updated = [...agentsList, { id: activeEditingId, nombre, descripcion, instrucciones }];
    }

    setAgentsList(updated);
    onSaveAgents(updated);
    onSelectAgent(activeEditingId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white shadow-lg shadow-indigo-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Configuración de Agentes de Auditoría IA</h3>
              <p className="text-xs text-slate-400">Cree y edite las instrucciones del Agente Auditor que evaluará sus documentos</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Sidebar (Agents List) / Right Form (Agent Instructions) */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Left Sidebar: Agents List (4/12 cols) */}
          <div className="md:col-span-4 bg-slate-950/60 border-r border-slate-800 p-4 space-y-3 flex flex-col justify-between overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tus Agentes ({agentsList.length})</span>
                <button
                  onClick={handleCreateNewAgent}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear Agente</span>
                </button>
              </div>

              {agentsList.map((agent) => {
                const isEditing = agent.id === activeEditingId;
                const isSelectedForAudit = agent.id === selectedAgentId;

                return (
                  <div
                    key={agent.id}
                    onClick={() => handleSelectToEdit(agent)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all space-y-1.5 ${
                      isEditing
                        ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                        <Bot className={`w-3.5 h-3.5 shrink-0 ${isEditing ? 'text-indigo-400' : 'text-slate-400'}`} />
                        <span className="truncate">{agent.nombre}</span>
                      </h4>
                      {isSelectedForAudit && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Activo
                        </span>
                      )}
                    </div>
                    {agent.descripcion && (
                      <p className="text-[11px] text-slate-400 line-clamp-1">{agent.descripcion}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Agent Configuration & Instructions (8/12 cols) */}
          <form onSubmit={handleSaveCurrentAgent} className="md:col-span-8 p-6 space-y-4 flex flex-col justify-between overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Nombre del Agente Auditor
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="ej. Auditor ISO 17025 Imparcialidad"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Descripción Corta
                </label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="ej. Evalúa imparcialidad y confidencialidad en laboratorios"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-200">
                    Instrucciones del Agente (System Prompt & Estructura de Respuesta)
                  </label>
                  <button
                    type="button"
                    onClick={() => setInstrucciones('')}
                    className="text-[11px] text-rose-400 hover:text-rose-300"
                  >
                    Limpiar Instrucciones
                  </button>
                </div>
                <textarea
                  rows={9}
                  value={instrucciones}
                  onChange={(e) => setInstrucciones(e.target.value)}
                  placeholder="Ingrese las instrucciones del agente auditor y la lista de viñetas que debe incluir en la respuesta final..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-indigo-500 custom-scrollbar"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  💡 Este Agente evaluará la evidencia basándose strictly en estas instrucciones.
                </p>
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-4 flex justify-between items-center border-t border-slate-800">
              <button
                type="button"
                onClick={(e) => handleDeleteAgent(activeEditingId, e)}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Agente</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/30"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar</span>
                </button>
              </div>
            </div>
          </form>

        </div>
      </div>

      {/* Custom App Confirm Dialog */}
      <ConfirmDialogModal
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={dialogState.onConfirmAction}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
      />
    </div>
  );
}
