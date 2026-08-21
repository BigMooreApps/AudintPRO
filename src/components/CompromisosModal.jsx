import React, { useState, useMemo } from 'react';
import { 
  X, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  FileText, 
  Plus, 
  History, 
  User, 
  MessageSquare, 
  Filter, 
  Search,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  Building2,
  Tag
} from 'lucide-react';
import { compareNumeralCodes } from '../data/defaultMapeo';

export default function CompromisosModal({ 
  isOpen, 
  onClose, 
  evaluationsHistory = {}, 
  mapeoNumerales = [], 
  areas = [],
  onUpdateCommitment,
  currentUser
}) {
  const isAuditor = currentUser?.role === 'AUDITOR' && !!currentUser.areaId;
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'ABIERTO' | 'EN_PROCESO' | 'SUBSANADO' | 'VENCIDO'
  const [filterArea, setFilterArea] = useState(isAuditor ? currentUser.areaId : 'ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para controlar qué tarjetas tienen el historial expandido
  const [expandedHistoryMap, setExpandedHistoryMap] = useState({});

  // Estado para desplegar el formulario de actualización de un compromiso específico
  const [updatingCommitmentCode, setUpdatingCommitmentCode] = useState(null);
  const [newStatus, setNewStatus] = useState('EN_PROCESO');
  const [followupComment, setFollowupComment] = useState('');
  const [auditorName, setAuditorName] = useState(currentUser?.nombre || 'Auditor ISO 17025');

  const todayStr = new Date().toISOString().split('T')[0];

  // Extraer todos los compromisos generados a partir de No Conformidades y Observaciones
  const compromisosList = useMemo(() => {
    const list = [];
    const sourceNumerals = isAuditor 
      ? (mapeoNumerales || []).filter(n => (n.areaIds || []).includes(currentUser.areaId))
      : (mapeoNumerales || []);

    sourceNumerals.forEach(num => {
      const evalItem = (evaluationsHistory || {})[num.codigo] || (evaluationsHistory || {})[num.id];
      if (!evalItem) return;

      const estadoNorma = (evalItem.estado || '').toUpperCase();
      // Si fue evaluado como NO CUMPLE u OBSERVACION, o tiene fechaCompromiso
      if (estadoNorma === 'NO CUMPLE' || estadoNorma === 'OBSERVACION' || evalItem.fechaCompromiso) {
        
        const fechaCompromiso = evalItem.fechaCompromiso || '';
        let estadoTiempo = 'SIN_FECHA';
        let diasDiferencia = 0;

        if (fechaCompromiso) {
          const targetDate = new Date(fechaCompromiso + 'T00:00:00');
          const todayDate = new Date(todayStr + 'T00:00:00');
          const diffTime = targetDate - todayDate;
          diasDiferencia = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diasDiferencia < 0) {
            estadoTiempo = 'VENCIDO';
          } else if (diasDiferencia <= 7) {
            estadoTiempo = 'PROXIMO';
          } else {
            estadoTiempo = 'EN_PLAZO';
          }
        }

        const estadoCompromiso = evalItem.estadoCompromiso || 'ABIERTO';

        list.push({
          id: num.id,
          codigo: num.codigo,
          requisito: num.requisito,
          areaIds: num.areaIds || [],
          tipo: estadoNorma,
          comentarioInicial: evalItem.comentario || '',
          fechaCreacion: evalItem.fecha || new Date().toLocaleDateString(),
          fechaCompromiso: fechaCompromiso,
          accionPropuesta: evalItem.accionPropuesta || '',
          responsableAccion: evalItem.responsableAccion || '',
          estadoCompromiso: estadoCompromiso, // 'ABIERTO' | 'EN_PROCESO' | 'SUBSANADO'
          estadoTiempo: estadoCompromiso === 'SUBSANADO' ? 'SUBSANADO' : estadoTiempo,
          diasDiferencia: diasDiferencia,
          historialTrazabilidad: evalItem.historialTrazabilidad || [
            {
              fecha: evalItem.fecha || new Date().toLocaleString(),
              tipo: 'CREACION',
              estado: estadoCompromiso,
              auditor: 'Auditor ISO 17025',
              comentario: 'Compromiso registrado en la sesión de auditoría.'
            }
          ]
        });
      }
    });

    return list.sort((a, b) => compareNumeralCodes(a.codigo, b.codigo));
  }, [evaluationsHistory, mapeoNumerales, todayStr, isAuditor, currentUser]);

  // Contadores de resumen
  const stats = useMemo(() => {
    let total = compromisosList.length;
    let abiertos = 0;
    let enProceso = 0;
    let subsanados = 0;
    let vencidos = 0;

    compromisosList.forEach(c => {
      if (c.estadoCompromiso === 'SUBSANADO') {
        subsanados++;
      } else {
        if (c.estadoCompromiso === 'EN_PROCESO') enProceso++;
        else abiertos++;

        if (c.estadoTiempo === 'VENCIDO') vencidos++;
      }
    });

    return { total, abiertos, enProceso, subsanados, vencidos };
  }, [compromisosList]);

  // Filtrado de la lista
  const filteredList = useMemo(() => {
    return compromisosList.filter(c => {
      // Filtro de Estado
      if (filterStatus === 'ABIERTO' && c.estadoCompromiso !== 'ABIERTO') return false;
      if (filterStatus === 'EN_PROCESO' && c.estadoCompromiso !== 'EN_PROCESO') return false;
      if (filterStatus === 'SUBSANADO' && c.estadoCompromiso !== 'SUBSANADO') return false;
      if (filterStatus === 'VENCIDO' && (c.estadoTiempo !== 'VENCIDO' || c.estadoCompromiso === 'SUBSANADO')) return false;

      // Filtro de Área
      if (filterArea !== 'ALL' && !c.areaIds.includes(filterArea)) return false;

      // Filtro de Búsqueda
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesCode = (c.codigo || '').toLowerCase().includes(term);
        const matchesReq = (c.requisito || '').toLowerCase().includes(term);
        const matchesAccion = (c.accionPropuesta || '').toLowerCase().includes(term);
        const matchesHallazgo = (c.comentarioInicial || '').toLowerCase().includes(term);
        if (!matchesCode && !matchesReq && !matchesAccion && !matchesHallazgo) return false;
      }

      return true;
    });
  }, [compromisosList, filterStatus, filterArea, searchTerm]);

  if (!isOpen) return null;

  const toggleHistory = (codigo) => {
    setExpandedHistoryMap(prev => ({
      ...prev,
      [codigo]: !prev[codigo]
    }));
  };

  const handleStartUpdate = (comp) => {
    setUpdatingCommitmentCode(comp.codigo);
    setNewStatus(comp.estadoCompromiso === 'SUBSANADO' ? 'SUBSANADO' : (comp.estadoCompromiso === 'ABIERTO' ? 'EN_PROCESO' : 'SUBSANADO'));
    setFollowupComment('');
    setAuditorName(currentUser?.nombre || 'Auditor ISO 17025');
  };

  const handleCancelUpdate = () => {
    setUpdatingCommitmentCode(null);
    setFollowupComment('');
  };

  const handleSaveUpdate = (codigo) => {
    if (!followupComment.trim()) return;

    if (onUpdateCommitment) {
      onUpdateCommitment(codigo, {
        nuevoEstadoCompromiso: newStatus,
        notaSeguimiento: followupComment.trim(),
        auditor: auditorName.trim()
      });
    }

    handleCancelUpdate();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full h-[720px] max-h-[92vh] shadow-2xl overflow-hidden flex flex-col text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-500/10">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Seguimiento de Tareas y Planes de Acción</h3>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 text-[10.5px] font-mono font-bold">
                  ISO 17025 Cl. 8.7
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Monitoreo de no conformidades, observaciones, compromisos de subsanación y bitácora de trazabilidad
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-all"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top KPI Filters Bar */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            
            {/* Total */}
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                filterStatus === 'ALL'
                  ? 'bg-indigo-600/25 border-indigo-500 shadow-md shadow-indigo-600/20 ring-1 ring-indigo-500/40'
                  : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800 text-slate-400'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">Total Tareas</span>
              <span className="text-lg font-black text-white font-mono">{stats.total}</span>
            </button>

            {/* Abiertos */}
            <button
              onClick={() => setFilterStatus('ABIERTO')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                filterStatus === 'ABIERTO'
                  ? 'bg-amber-600/25 border-amber-500 shadow-md shadow-amber-600/20 ring-1 ring-amber-500/40'
                  : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Abiertos</span>
              <span className="text-lg font-black text-amber-400 font-mono">{stats.abiertos}</span>
            </button>

            {/* En Proceso */}
            <button
              onClick={() => setFilterStatus('EN_PROCESO')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                filterStatus === 'EN_PROCESO'
                  ? 'bg-blue-600/25 border-blue-500 shadow-md shadow-blue-600/20 ring-1 ring-blue-500/40'
                  : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">En Proceso</span>
              <span className="text-lg font-black text-blue-400 font-mono">{stats.enProceso}</span>
            </button>

            {/* Vencidos */}
            <button
              onClick={() => setFilterStatus('VENCIDO')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                filterStatus === 'VENCIDO'
                  ? 'bg-rose-600/25 border-rose-500 shadow-md shadow-rose-600/20 ring-1 ring-rose-500/40'
                  : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">⚠️ Vencidos</span>
              <span className="text-lg font-black text-rose-400 font-mono">{stats.vencidos}</span>
            </button>

            {/* Subsanados */}
            <button
              onClick={() => setFilterStatus('SUBSANADO')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                filterStatus === 'SUBSANADO'
                  ? 'bg-emerald-600/25 border-emerald-500 shadow-md shadow-emerald-600/20 ring-1 ring-emerald-500/40'
                  : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Subsanados</span>
              <span className="text-lg font-black text-emerald-400 font-mono">{stats.subsanados}</span>
            </button>

          </div>
        </div>

        {/* Search & Area Filter Bar */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código (ej. 4.1.2), requisito, plan de acción o hallazgo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {!isAuditor && (
            <div className="flex items-center gap-2 min-w-[200px]">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-indigo-300 font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">Todas las Áreas</option>
                {(areas || []).map(a => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Task Cards List (Fixed Height Scrollable Container) */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-4 text-xs">
          {filteredList.length === 0 ? (
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 opacity-40" />
              <h4 className="text-sm font-bold text-slate-300">No hay tareas o compromisos pendientes para este filtro</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Los compromisos se generan automáticamente en el Paso 4 al dictaminar un numeral como "NO CUMPLE" o "OBSERVACIÓN" y asignar un plan correctivo.
              </p>
            </div>
          ) : (
            filteredList.map((comp) => {
              const isUpdating = updatingCommitmentCode === comp.codigo;
              const isHistoryOpen = !!expandedHistoryMap[comp.codigo];
              const isSubsanado = comp.estadoCompromiso === 'SUBSANADO';
              const isVencido = comp.estadoTiempo === 'VENCIDO' && !isSubsanado;

              return (
                <div
                  key={comp.codigo}
                  className={`bg-slate-950 border rounded-2xl p-5 space-y-4 shadow-lg transition-all ${
                    isVencido
                      ? 'border-rose-500/40 shadow-rose-950/20'
                      : isSubsanado
                      ? 'border-emerald-500/30 bg-slate-950/60'
                      : 'border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  
                  {/* Card Header: Metadatos y Estados */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-850 pb-3.5">
                    
                    {/* Izquierda: Código, Severidad y Áreas */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg">
                        {comp.codigo}
                      </span>

                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        comp.tipo === 'NO CUMPLE'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        {comp.tipo === 'NO CUMPLE' ? '● No Conforme' : '▲ Observación'}
                      </span>

                      <div className="flex flex-wrap gap-1">
                        {comp.areaIds.map(aId => {
                          const areaObj = (areas || []).find(a => a.id === aId);
                          if (!areaObj) return null;
                          return (
                            <span key={aId} className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10.5px]">
                              {areaObj.nombre}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Derecha: Estado de la Tarea y Fecha Límite */}
                    <div className="flex flex-wrap items-center gap-2">
                      
                      {/* Estado */}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                        isSubsanado
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : comp.estadoCompromiso === 'EN_PROCESO'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      }`}>
                        {isSubsanado ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        <span>{isSubsanado ? 'Subsanado / Cerrado' : comp.estadoCompromiso === 'EN_PROCESO' ? 'En Proceso' : 'Abierto'}</span>
                      </span>

                      {/* Fecha de Revisión / Vencimiento */}
                      {comp.fechaCompromiso && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                          isSubsanado
                            ? 'bg-slate-900 text-slate-400 border-slate-800'
                            : isVencido
                            ? 'bg-rose-600 text-white border-rose-500 animate-pulse shadow-md shadow-rose-600/30'
                            : comp.estadoTiempo === 'PROXIMO'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                        }`}>
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {isSubsanado
                              ? `Cerrado (${comp.fechaCompromiso})`
                              : isVencido
                              ? `⚠️ Venció el ${comp.fechaCompromiso}`
                              : comp.estadoTiempo === 'PROXIMO'
                              ? `⚡ Vence en ${comp.diasDiferencia} días (${comp.fechaCompromiso})`
                              : `Límite: ${comp.fechaCompromiso}`}
                          </span>
                        </span>
                      )}

                    </div>
                  </div>

                  {/* Card Body: 2-Column Grid (Claro y Estructurado) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Columna Izquierda: Requisito y Hallazgo */}
                    <div className="bg-slate-900/70 border border-slate-850 rounded-xl p-3.5 space-y-2">
                      <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                        Requisito Normativo y Hallazgo:
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        "{comp.requisito}"
                      </p>
                      {comp.comentarioInicial && (
                        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 italic">
                          <strong className="text-slate-300 font-semibold not-italic">Dictamen Inicial: </strong>
                          {comp.comentarioInicial}
                        </div>
                      )}
                    </div>

                    {/* Columna Derecha: Plan de Acción y Responsable */}
                    <div className="bg-slate-900/70 border border-slate-850 rounded-xl p-3.5 space-y-2">
                      <span className="text-[10.5px] font-bold text-indigo-300 uppercase tracking-wider block">
                        Plan de Acción Correctiva (CAPA):
                      </span>
                      <p className="text-xs text-slate-100 leading-relaxed whitespace-pre-line font-medium">
                        {comp.accionPropuesta || 'Compromiso sin plan detallado registrado.'}
                      </p>
                      {comp.responsableAccion && (
                        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Responsable: <strong className="text-slate-200">{comp.responsableAccion}</strong></span>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Formulario Inline de Actualización de Estado */}
                  {isUpdating && (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveUpdate(comp.codigo);
                      }}
                      className="bg-slate-900 border border-indigo-500/40 rounded-xl p-4 space-y-3 animate-fadeIn shadow-xl"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h5 className="text-xs font-bold text-white flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>Actualizar Estado del Compromiso ({comp.codigo})</span>
                        </h5>
                        <button type="button" onClick={handleCancelUpdate} className="text-slate-500 hover:text-slate-300">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Selector de nuevo estado */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-slate-400">Nuevo Estado de la Tarea:</label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setNewStatus('ABIERTO')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                              newStatus === 'ABIERTO'
                                ? 'bg-amber-600/20 border-amber-500 text-amber-300 shadow-sm'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Abierto
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewStatus('EN_PROCESO')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                              newStatus === 'EN_PROCESO'
                                ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            En Proceso
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewStatus('SUBSANADO')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                              newStatus === 'SUBSANADO'
                                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-sm'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            ✓ Subsanado / Cerrado
                          </button>
                        </div>
                      </div>

                      {/* Nota de Seguimiento */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-400">
                          Comentario / Justificación de la Acción Realizada:
                        </label>
                        <textarea
                          rows={2}
                          value={followupComment}
                          onChange={(e) => setFollowupComment(e.target.value)}
                          placeholder="Describa la evidencia revisada, acciones implementadas o motivo del cierre..."
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                          required
                          autoFocus
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={handleCancelUpdate}
                          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/25 transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Guardar Seguimiento</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Card Footer: Bitácora Desplegable y Botón de Acción */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-850">
                    
                    {/* Botón para Desplegar / Colapsar Bitácora */}
                    <button
                      type="button"
                      onClick={() => toggleHistory(comp.codigo)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-300 transition-colors py-1"
                    >
                      <History className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Bitácora de Trazabilidad ({comp.historialTrazabilidad.length})</span>
                      {isHistoryOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {/* Botón Principal para Actualizar */}
                    {!isUpdating && (
                      <button
                        type="button"
                        onClick={() => handleStartUpdate(comp)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all transform active:scale-95 ${
                          isSubsanado
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isSubsanado ? 'Registrar Nota Adicional' : 'Actualizar Estado / Seguimiento'}</span>
                      </button>
                    )}

                  </div>

                  {/* Timeline de Bitácora Histórica (Desplegable) */}
                  {isHistoryOpen && (
                    <div className="space-y-2.5 bg-slate-900/80 p-4 rounded-xl border border-slate-850 animate-fadeIn">
                      <h6 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Historial Cronológico de Revisiones:
                      </h6>
                      <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800 pl-6">
                        {comp.historialTrazabilidad.map((h, hIdx) => (
                          <div key={hIdx} className="relative space-y-1">
                            <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-slate-900" />
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-bold text-white text-xs">{h.auditor || 'Auditor'}</span>
                              <span className="text-[10.5px] font-mono text-slate-400">{h.fecha}</span>
                            </div>
                            <p className="text-slate-300 text-xs leading-relaxed">{h.comentario}</p>
                            {h.estado && (
                              <span className="inline-block text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                Estado: {h.estado}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
