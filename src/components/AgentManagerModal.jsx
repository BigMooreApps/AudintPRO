import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bot, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Globe, 
  Lock, 
  User, 
  ShieldCheck, 
  Users, 
  CheckSquare, 
  Square, 
  Building2 
} from 'lucide-react';
import ConfirmDialogModal from './ConfirmDialogModal';
import { DEFAULT_AREAS } from '../data/defaultMapeo';

export const DEFAULT_AGENTS = [
  {
    id: 'agent-iso-17025',
    nombre: 'Auditor ISO/IEC 17025 (Imparcialidad y Calidad)',
    descripcion: 'Auditor especializado en la evaluación de la norma ISO/IEC 17025:2017 para laboratorios de ensayo y calibración.',
    esPublico: true,
    creadoPor: 'SISTEMA',
    creadorNombre: 'Sistema Auditor',
    instrucciones: `# Motor de Evaluación de Auditoría ISO/IEC 17025

## Objetivo

Evaluar objetivamente cada subnumeral de la norma ISO/IEC 17025 frente a las evidencias suministradas, determinando si existe evidencia suficiente para demostrar el cumplimiento del requisito.

## Reglas fundamentales

1. Analiza **cada subnumeral de manera independiente**.
2. Identifica primero qué exige exactamente el subnumeral.
3. Compara el requisito únicamente contra las evidencias proporcionadas.
4. **No inventes, supongas ni completes información que no esté explícitamente contenida en las evidencias.**
5. No consideres que una evidencia cumple un requisito únicamente porque esté relacionada con el tema. La evidencia debe demostrar de manera suficiente el cumplimiento del requisito específico.
6. Si el requisito contiene varios elementos, verifica cada uno de ellos. Si falta evidencia de uno de los elementos exigidos, el resultado será **NO CUMPLE**, salvo que el propio requisito permita demostrarlo mediante una alternativa que sí esté evidenciada.
7. La ausencia de evidencia suficiente debe considerarse **NO CUMPLE**.
8. No utilices conocimiento general de la organización para complementar las evidencias.
9. No otorgues cumplimiento por intención, posibilidad, declaración verbal, supuesto o buena práctica que no esté demostrada en la evidencia.
10. Si una evidencia contradice otra, identifica la contradicción y basa la conclusión en la evidencia más objetiva, verificable y directamente relacionada con el requisito. Si la contradicción impide determinar el cumplimiento, clasifica como **NO CUMPLE**.
11. El nivel de confianza representa la confianza del análisis realizado con base en la calidad, suficiencia y relación de las evidencias con el requisito. **No representa la probabilidad de que la organización cumpla en la realidad.**

## Criterio para determinar el estado

### CUMPLE

Utiliza **CUMPLE** únicamente cuando las evidencias proporcionadas demuestren de manera suficiente, objetiva y directa el cumplimiento de todos los elementos aplicables del subnumeral.

### NO CUMPLE

Utiliza **NO CUMPLE** cuando:

* No existe evidencia para demostrar el requisito.
* La evidencia es insuficiente.
* La evidencia solo demuestra parcialmente el requisito.
* Falta alguno de los elementos exigidos por el subnumeral.
* La evidencia contradice el requisito.
* La conclusión de cumplimiento requeriría realizar una suposición o inferencia no demostrada.

### Importante

No confundas:

* "Existe un documento relacionado" con "el requisito está implementado".
* "El procedimiento existe" con "el procedimiento se cumple".
* "La actividad se realiza" con "está controlada conforme al requisito".
* "La organización declara cumplir" con "existe evidencia objetiva de cumplimiento".

## Tratamiento de las evidencias

Para cada subnumeral:

1. Identifica las evidencias que realmente aportan información para evaluar el requisito.
2. Descarta las evidencias que no tengan relación suficiente con el requisito.
3. Utiliza únicamente las evidencias relevantes para sustentar la conclusión.
4. Cuando existan varias evidencias relevantes, identifícalas como:

**Evidencia 1:**
[Fragmento relevante]

**Evidencia 2:**
[Fragmento relevante]

Deja un renglón en blanco entre cada evidencia.

5. El fragmento citado debe ser textual o representar fielmente la información contenida en la evidencia.
6. No fabriques fragmentos de evidencia.
7. Si no existe evidencia suficiente, indícalo expresamente.

## Evaluación de requisitos con múltiples condiciones

Cuando un subnumeral exija varios elementos, descompón mentalmente el requisito en condiciones individuales.

Ejemplo conceptual:

Requisito:

* A debe estar definido.
* B debe estar documentado.
* C debe ser implementado.

Evidencia:

* Demuestra A.
* Demuestra B.
* No existe evidencia de C.

Resultado:

**NO CUMPLE**

La justificación debe indicar específicamente que A y B están evidenciados, pero no existe evidencia suficiente para demostrar C.

## Regla especial para NO CUMPLE

Cuando el resultado sea **NO CUMPLE**, la respuesta debe expresar la **descripción del requisito en sentido negativo**, indicando específicamente qué elemento exigido por el subnumeral no está demostrado.

No utilices únicamente frases genéricas como:

* "No cumple con el numeral."
* "La evidencia es insuficiente."
* "No se encontró información."

En su lugar, especifica qué exige el requisito y qué parte no fue demostrada.

Ejemplo conceptual:

**Requisito:** El laboratorio debe conservar registros que demuestren X.

**Resultado:** NO CUMPLE.

**Justificación:** No se presentó evidencia que demuestre la conservación de los registros requeridos para X.

## Nivel de confianza

Asigna un porcentaje de confianza entre 0 % y 100 %.

El porcentaje debe reflejar exclusivamente la solidez del análisis frente a las evidencias disponibles.

### Referencia orientativa

* **90–100 %:** Evidencia directa, objetiva, suficiente y claramente relacionada con el requisito.
* **75–89 %:** Evidencia suficiente, pero con alguna limitación menor.
* **50–74 %:** Evidencia parcial, ambigua o con limitaciones importantes.
* **25–49 %:** Evidencia muy limitada o débil.
* **0–24 %:** No existe evidencia relevante o la información disponible no permite realizar una evaluación confiable.

La confianza nunca debe utilizarse para convertir un cumplimiento parcial en **CUMPLE**.

## Formato obligatorio de salida

Para cada subnumeral responde exactamente con esta estructura:

### Subnumeral: [número]

**Estado:** CUMPLE / NO CUMPLE

**Evidencia utilizada:**

**Evidencia 1:**
[Fragmento de evidencia]

**Evidencia 2:**
[Fragmento de evidencia]

[Continuar según corresponda]

**Justificación técnica:**
[Explicar de forma objetiva la relación entre el requisito y las evidencias. Indicar qué elementos están demostrados y, cuando corresponda, qué elementos no están demostrados.]

**Nivel de confianza:** [XX] %

## Reglas finales de consistencia

* Nunca emitas ambos estados para un mismo subnumeral.
* Nunca emitas "CUMPLE PARCIALMENTE". El resultado únicamente puede ser **CUMPLE** o **NO CUMPLE**.
* La justificación debe poder ser entendida por un auditor sin necesidad de interpretar las evidencias por su cuenta.
* No agregues requisitos que no pertenezcan al subnumeral evaluado.
* No mezcles requisitos de otros subnumerales.
* No uses información externa para justificar el cumplimiento.
* Prioriza evidencia objetiva, verificable y directamente relacionada con el requisito.
* Si existe duda razonable por falta de evidencia, el resultado será **NO CUMPLE**.`
  }
];

export default function AgentManagerModal({ 
  isOpen, 
  onClose, 
  agents, 
  selectedAgentId, 
  initialMode = 'EDIT', 
  targetAgentId, 
  onSelectAgent, 
  onSaveAgents,
  currentUser,
  areas = []
}) {
  const availableAreas = areas && areas.length > 0 ? areas : DEFAULT_AREAS;
  const [agentsList, setAgentsList] = useState(agents && agents.length > 0 ? agents : DEFAULT_AGENTS);
  const [activeEditingId, setActiveEditingId] = useState(targetAgentId || selectedAgentId || (agentsList[0] ? agentsList[0].id : ''));
  
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [instrucciones, setInstrucciones] = useState('');
  
  // Modos de visibilidad: 'PUBLIC' (Todos) | 'CUSTOM' (Áreas / Usuarios Específicos) | 'PRIVATE' (Solo Autor y Super Auditor)
  const [visibilidadMode, setVisibilidadMode] = useState('PUBLIC');
  const [allowedAreaIds, setAllowedAreaIds] = useState([]);
  const [creadoPor, setCreadoPor] = useState(currentUser?.id || 'user-super-auditor');
  const [creadorNombre, setCreadorNombre] = useState(currentUser?.nombre || 'Super Auditor');

  // Dialog State for custom alerts/confirms
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'ALERT',
    onConfirmAction: null
  });

  // Sync agents list from props
  useEffect(() => {
    if (agents && agents.length > 0) {
      setAgentsList(agents);
    }
  }, [agents]);

  // Sync effect when modal opens or active editing ID changes
  useEffect(() => {
    if (isOpen) {
      if (initialMode === 'CREATE') {
        const newId = `agent-${Date.now()}`;
        setActiveEditingId(newId);
        setNombre('Nuevo Agente Auditor');
        setDescripcion('Agente personalizado de auditoría documental');
        setInstrucciones('');
        setVisibilidadMode('PUBLIC');
        setAllowedAreaIds([]);
        setCreadoPor(currentUser?.id || 'user-super-auditor');
        setCreadorNombre(currentUser?.nombre || 'Auditor');
      } else {
        const targetId = targetAgentId || selectedAgentId;
        const current = (agents && agents.find(a => a.id === targetId)) || agentsList.find(a => a.id === targetId) || agentsList[0];
        if (current) {
          setActiveEditingId(current.id);
          setNombre(current.nombre);
          setDescripcion(current.descripcion || '');
          setInstrucciones(current.instrucciones || '');
          setCreadoPor(current.creadoPor || currentUser?.id || 'user-super-auditor');
          setCreadorNombre(current.creadorNombre || currentUser?.nombre || 'Auditor');
          
          if (Array.isArray(current.allowedAreaIds) && current.allowedAreaIds.length > 0) {
            setVisibilidadMode('CUSTOM');
            setAllowedAreaIds(current.allowedAreaIds);
          } else if (current.esPublico === false) {
            setVisibilidadMode('PRIVATE');
            setAllowedAreaIds([]);
          } else {
            setVisibilidadMode('PUBLIC');
            setAllowedAreaIds([]);
          }
        }
      }
    }
  }, [isOpen, initialMode, targetAgentId, selectedAgentId, agents, currentUser]);

  if (!isOpen) return null;

  // Filtrar agentes visibles según rol y área del usuario actual
  const visibleAgentsList = agentsList.filter(agent => {
    if (!currentUser || currentUser.role === 'SUPER_AUDITOR') return true;
    if (agent.creadoPor && agent.creadoPor === currentUser.id) return true;
    if (Array.isArray(agent.allowedAreaIds) && agent.allowedAreaIds.length > 0) {
      return currentUser.areaId && agent.allowedAreaIds.includes(currentUser.areaId);
    }
    return agent.esPublico !== false;
  });

  const handleSelectToEdit = (agent) => {
    setActiveEditingId(agent.id);
    setNombre(agent.nombre);
    setDescripcion(agent.descripcion || '');
    setInstrucciones(agent.instrucciones || '');
    setCreadoPor(agent.creadoPor || currentUser?.id || 'user-super-auditor');
    setCreadorNombre(agent.creadorNombre || currentUser?.nombre || 'Auditor');

    if (Array.isArray(agent.allowedAreaIds) && agent.allowedAreaIds.length > 0) {
      setVisibilidadMode('CUSTOM');
      setAllowedAreaIds(agent.allowedAreaIds);
    } else if (agent.esPublico === false) {
      setVisibilidadMode('PRIVATE');
      setAllowedAreaIds([]);
    } else {
      setVisibilidadMode('PUBLIC');
      setAllowedAreaIds([]);
    }
  };

  const handleCreateNewAgent = () => {
    const newId = `agent-${Date.now()}`;
    setActiveEditingId(newId);
    setNombre('Nuevo Agente Auditor');
    setDescripcion('Agente personalizado de auditoría documental');
    setInstrucciones('');
    setVisibilidadMode('PUBLIC');
    setAllowedAreaIds([]);
    setCreadoPor(currentUser?.id || 'user-super-auditor');
    setCreadorNombre(currentUser?.nombre || 'Auditor');
  };

  const handleToggleArea = (areaId) => {
    setAllowedAreaIds(prev => 
      prev.includes(areaId) ? prev.filter(id => id !== areaId) : [...prev, areaId]
    );
  };

  const handleSelectAllAreas = () => {
    setAllowedAreaIds(availableAreas.map(a => a.id));
  };

  const handleDeselectAllAreas = () => {
    setAllowedAreaIds([]);
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

    // Protección: agentes privados de otros usuarios no pueden ser borrados por auditores comunes
    if (currentUser?.role !== 'SUPER_AUDITOR' && agentToDelete?.creadoPor && agentToDelete.creadoPor !== currentUser?.id) {
      setDialogState({
        isOpen: true,
        title: 'Permiso Denegado',
        message: 'Solo el autor de este agente o el Super Auditor pueden eliminarlo.',
        type: 'ALERT'
      });
      return;
    }

    setDialogState({
      isOpen: true,
      title: 'Eliminar Agente Auditor',
      message: `¿Está seguro de eliminar el agente "${agentToDelete?.nombre || 'seleccionado'}"? Esta acción no se puede deshacer.`,
      type: 'DANGER',
      onConfirmAction: () => {
        const updated = agentsList.filter(a => a.id !== idToDelete);
        setAgentsList(updated);
        if (onSaveAgents) onSaveAgents(updated);
        if (activeEditingId === idToDelete && updated.length > 0) {
          handleSelectToEdit(updated[0]);
        }
      }
    });
  };

  const handleSaveCurrentAgent = (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setDialogState({
        isOpen: true,
        title: 'Nombre Requerido',
        message: 'Por favor ingrese un nombre para el Agente Auditor.',
        type: 'ALERT'
      });
      return;
    }

    if (visibilidadMode === 'CUSTOM' && allowedAreaIds.length === 0) {
      setDialogState({
        isOpen: true,
        title: 'Áreas Requeridas',
        message: 'Ha seleccionado visibilidad específica pero no ha marcado ninguna área. Por favor seleccione al menos un área o cambie a Público/Privado.',
        type: 'WARNING'
      });
      return;
    }

    let updated;
    const exists = agentsList.some(a => a.id === activeEditingId);

    const payload = {
      id: activeEditingId,
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      instrucciones,
      esPublico: visibilidadMode === 'PUBLIC',
      allowedAreaIds: visibilidadMode === 'CUSTOM' ? allowedAreaIds : [],
      creadoPor: creadoPor || currentUser?.id || 'user-super-auditor',
      creadorNombre: creadorNombre || currentUser?.nombre || 'Auditor',
      updatedAt: new Date().toISOString()
    };

    if (exists) {
      updated = agentsList.map(a => {
        if (a.id === activeEditingId) {
          return { ...a, ...payload };
        }
        return a;
      });
    } else {
      updated = [...agentsList, { ...payload, createdAt: new Date().toISOString() }];
    }

    setAgentsList(updated);
    if (onSaveAgents) onSaveAgents(updated);
    if (onSelectAgent) onSelectAgent(activeEditingId);
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
              <p className="text-xs text-slate-400">Cree, personalice y comparta las instrucciones del Agente Auditor con áreas específicas</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-all cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Sidebar (Agents List) / Right Form (Agent Instructions) */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Left Sidebar: Agents List (4/12 cols) */}
          <div className="md:col-span-4 bg-slate-950/60 border-r border-slate-800 p-4 space-y-3 flex flex-col justify-between overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Agentes ({visibleAgentsList.length})</span>
                <button
                  onClick={handleCreateNewAgent}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear Agente</span>
                </button>
              </div>

              {visibleAgentsList.map((agent) => {
                const isEditing = agent.id === activeEditingId;
                const isSelectedForAudit = agent.id === selectedAgentId;
                const hasCustomAreas = Array.isArray(agent.allowedAreaIds) && agent.allowedAreaIds.length > 0;
                const isAgentPrivate = agent.esPublico === false && !hasCustomAreas;

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
                    <div className="flex items-center justify-between gap-1.5">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                        <Bot className={`w-3.5 h-3.5 shrink-0 ${isEditing ? 'text-indigo-400' : 'text-slate-400'}`} />
                        <span className="truncate">{agent.nombre}</span>
                      </h4>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        {isSelectedForAudit && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Activo
                          </span>
                        )}
                        {hasCustomAreas ? (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 flex items-center gap-0.5" title={`Visible para ${agent.allowedAreaIds.length} áreas específicas`}>
                            <Users className="w-2.5 h-2.5" />
                            <span>{agent.allowedAreaIds.length}</span>
                          </span>
                        ) : isAgentPrivate ? (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-0.5" title="Privado (Solo autor)">
                            <Lock className="w-2.5 h-2.5" />
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-0.5" title="Visible para todos">
                            <Globe className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </div>

                    {agent.descripcion && (
                      <p className="text-[11px] text-slate-400 line-clamp-1">{agent.descripcion}</p>
                    )}

                    {agent.creadorNombre && (
                      <p className="text-[10px] text-slate-400/80 flex items-center gap-1">
                        <User className="w-2.5 h-2.5 text-slate-500" />
                        <span>Por: {agent.creadorNombre}</span>
                      </p>
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

              {/* Selector de Visibilidad (3 Opciones: Público, Áreas Específicas, Privado) */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>Visibilidad y Permisos de Acceso</span>
                  <span className="text-[10.5px] font-normal text-slate-400">
                    {visibilidadMode === 'PUBLIC' && '🌐 Visible para todos los auditores'}
                    {visibilidadMode === 'CUSTOM' && `👥 Compartido con ${allowedAreaIds.length} áreas seleccionadas`}
                    {visibilidadMode === 'PRIVATE' && '🔒 Solo visible para mi usuario'}
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Opción 1: Público */}
                  <button
                    type="button"
                    onClick={() => setVisibilidadMode('PUBLIC')}
                    className={`p-2.5 rounded-2xl border text-left transition-all flex items-start gap-2 cursor-pointer ${
                      visibilidadMode === 'PUBLIC'
                        ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-300 ring-1 ring-emerald-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-1.5 rounded-xl shrink-0 ${visibilidadMode === 'PUBLIC' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                      <Globe className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        <span>Público</span>
                        {visibilidadMode === 'PUBLIC' && <Check className="w-3 h-3 text-emerald-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                        Todos los auditores de cualquier área.
                      </p>
                    </div>
                  </button>

                  {/* Opción 2: Áreas Específicas */}
                  <button
                    type="button"
                    onClick={() => setVisibilidadMode('CUSTOM')}
                    className={`p-2.5 rounded-2xl border text-left transition-all flex items-start gap-2 cursor-pointer ${
                      visibilidadMode === 'CUSTOM'
                        ? 'bg-blue-500/10 border-blue-500/60 text-blue-300 ring-1 ring-blue-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-1.5 rounded-xl shrink-0 ${visibilidadMode === 'CUSTOM' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        <span>Específicos</span>
                        {visibilidadMode === 'CUSTOM' && <Check className="w-3 h-3 text-blue-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                        Solo áreas / usuarios elegidos.
                      </p>
                    </div>
                  </button>

                  {/* Opción 3: Privado */}
                  <button
                    type="button"
                    onClick={() => setVisibilidadMode('PRIVATE')}
                    className={`p-2.5 rounded-2xl border text-left transition-all flex items-start gap-2 cursor-pointer ${
                      visibilidadMode === 'PRIVATE'
                        ? 'bg-amber-500/10 border-amber-500/60 text-amber-300 ring-1 ring-amber-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-1.5 rounded-xl shrink-0 ${visibilidadMode === 'PRIVATE' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        <span>Privado</span>
                        {visibilidadMode === 'PRIVATE' && <Check className="w-3 h-3 text-amber-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                        Solo tú y el Super Auditor.
                      </p>
                    </div>
                  </button>
                </div>

                {/* Panel de Selección de Áreas / Usuarios (Visible cuando visibilidadMode === 'CUSTOM') */}
                {visibilidadMode === 'CUSTOM' && (
                  <div className="bg-slate-950/80 border border-blue-500/30 rounded-2xl p-3.5 space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>Seleccione los Auditores / Áreas con Acceso ({allowedAreaIds.length}/{availableAreas.length})</span>
                      </span>
                      <div className="flex items-center gap-2 text-[10.5px]">
                        <button
                          type="button"
                          onClick={handleSelectAllAreas}
                          className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                        >
                          Marcar Todas
                        </button>
                        <span className="text-slate-600">•</span>
                        <button
                          type="button"
                          onClick={handleDeselectAllAreas}
                          className="text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          Desmarcar
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                      {availableAreas.map(area => {
                        const isChecked = allowedAreaIds.includes(area.id);
                        return (
                          <div
                            key={area.id}
                            onClick={() => handleToggleArea(area.id)}
                            className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-blue-500/15 border-blue-500/60 text-white shadow-sm ring-1 ring-blue-500/30'
                                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                            }`}
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-blue-400 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-500 shrink-0" />
                            )}
                            <span className="text-xs font-semibold leading-snug">
                              {area.nombre}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-200">
                    Instrucciones del Agente (System Prompt & Estructura de Respuesta)
                  </label>
                  <button
                    type="button"
                    onClick={() => setInstrucciones('')}
                    className="text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
                  >
                    Limpiar Instrucciones
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={instrucciones}
                  onChange={(e) => setInstrucciones(e.target.value)}
                  placeholder="Ingrese las instrucciones del agente auditor y la lista de viñetas que debe incluir en la respuesta final..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-indigo-500 custom-scrollbar"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  💡 Este Agente evaluará la evidencia basándose estrictamente en estas instrucciones.
                </p>
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-4 flex justify-between items-center border-t border-slate-800">
              <button
                type="button"
                onClick={(e) => handleDeleteAgent(activeEditingId, e)}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Agente</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar y Sincronizar</span>
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
