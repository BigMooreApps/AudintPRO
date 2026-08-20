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
  Check
} from 'lucide-react';

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
  
  // Estado para desplegar el formulario de actualización de un compromiso específico
  const [updatingCommitmentCode, setUpdatingCommitmentCode] = useState(null);
  const [newStatus, setNewStatus] = useState('EN_PROCESO');
  const [followupComment, setFollowupComment] = useState('');
  const [auditorName, setAuditorName] = useState(currentUser?.nombre || 'Auditor ISO 17025');

  const todayStr = new Date().toISOString().split('T')[0];

  // Extraer todos los compromisos generados a partir de No Conformidades y Observaciones (HOOKS SIEMPRE AL INICIO)
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

    return list;
  }, [evaluationsHistory, mapeoNumerales, todayStr]);

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
        if (!matchesCode && !matchesReq && !matchesAccion) return false;
      }

      return true;
    });
  }, [compromisosList, filterStatus, filterArea, searchTerm]);

  const handleOpenUpdate = (c) => {
    setUpdatingCommitmentCode(c.codigo);
    setNewStatus(c.estadoCompromiso === 'ABIERTO' ? 'EN_PROCESO' : c.estadoCompromiso);
    setFollowupComment('');
  };

  const handleSaveFollowup = (codigo) => {
    if (!followupComment.trim()) {
      alert('Por favor ingrese un comentario o nota de seguimiento técnico.');
      return;
    }

    if (onUpdateCommitment) {
      onUpdateCommitment(codigo, {
        nuevoEstadoCompromiso: newStatus,
        notaSeguimiento: followupComment,
        auditor: auditorName || 'Auditor'
      });
    }

    setUpdatingCommitmentCode(null);
    setFollowupComment('');
  };

  // RETORNO CONDICIONAL DESPUÉS DE TODOS LOS HOOKS (Cumpliendo reglas de React)
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Seguimiento de Compromisos y Planes de Acción</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
                  ISO/IEC 17025 Cláusula 8.7
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Monitoreo de no conformidades, oportunidades de mejora, fechas de revisión y trazabilidad de acciones.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar text-xs">
          
          {/* KPI Cards de Compromisos */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                filterStatus === 'ALL'
                  ? 'bg-indigo-950/50 border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                  : 'bg-slate-900/80 border-slate-800 hover:bg-slate-850'
              }`}
            >
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Total</span>
              <span className="text-xl font-black text-white font-mono">{stats.total}</span>
            </button>

            <button
              onClick={() => setFilterStatus('ABIERTO')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                filterStatus === 'ABIERTO'
                  ? 'bg-amber-950/50 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/40'
                  : 'bg-slate-900/80 border-slate-800 hover:bg-slate-850'
              }`}
            >
              <span className="text-[10.5px] font-bold text-amber-400 uppercase tracking-wider block">Abiertos</span>
              <span className="text-xl font-black text-amber-400 font-mono">{stats.abiertos}</span>
            </button>

            <button
              onClick={() => setFilterStatus('EN_PROCESO')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                filterStatus === 'EN_PROCESO'
                  ? 'bg-blue-950/50 border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/40'
                  : 'bg-slate-900/80 border-slate-800 hover:bg-slate-850'
              }`}
            >
              <span className="text-[10.5px] font-bold text-blue-400 uppercase tracking-wider block">En Proceso</span>
              <span className="text-xl font-black text-blue-400 font-mono">{stats.enProceso}</span>
            </button>

            <button
              onClick={() => setFilterStatus('VENCIDO')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                filterStatus === 'VENCIDO'
                  ? 'bg-rose-950/50 border-rose-500 shadow-md shadow-rose-500/10 ring-1 ring-rose-500/40'
                  : 'bg-slate-900/80 border-slate-800 hover:bg-slate-850'
              }`}
            >
              <span className="text-[10.5px] font-bold text-rose-400 uppercase tracking-wider block">⚠️ Vencidos</span>
              <span className="text-xl font-black text-rose-400 font-mono">{stats.vencidos}</span>
            </button>

            <button
              onClick={() => setFilterStatus('SUBSANADO')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                filterStatus === 'SUBSANADO'
                  ? 'bg-emerald-950/50 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                  : 'bg-slate-900/80 border-slate-800 hover:bg-slate-850'
              }`}
            >
              <span className="text-[10.5px] font-bold text-emerald-400 uppercase tracking-wider block">Subsanados</span>
              <span className="text-xl font-black text-emerald-400 font-mono">{stats.subsanados}</span>
            </button>

          </div>

          {/* Filtros de Búsqueda y Área */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex-1 min-w-[240px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por código, requisito o plan de acción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 min-w-[200px]">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-indigo-300 font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">Todas las Áreas</option>
                {(areas || []).map(a => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Lista de Compromisos */}
          {filteredList.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 opacity-30" />
              <h4 className="text-sm font-bold text-slate-300">No hay compromisos pendientes para este filtro</h4>
              <p className="text-xs text-slate-400">
                Los compromisos se generan automáticamente cuando el auditor confirma un numeral como "NO CUMPLE" o "OBSERVACIÓN" y asigna una fecha de revisión.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredList.map((comp) => {
                const isUpdating = updatingCommitmentCode === comp.codigo;

                return (
                  <div
                    key={comp.codigo}
                    className={`bg-slate-900 border rounded-2xl p-5 space-y-4 shadow-xl transition-all ${
                      comp.estadoTiempo === 'VENCIDO' && comp.estadoCompromiso !== 'SUBSANADO'
                        ? 'border-rose-500/40 shadow-rose-950/20'
                        : comp.estadoCompromiso === 'SUBSANADO'
                        ? 'border-emerald-500/30'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    
                    {/* Header de la tarjeta */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-xs bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg">
                          {comp.codigo}
                        </span>

                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          comp.tipo === 'NO CUMPLE'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}>
                          {comp.tipo}
                        </span>

                        <div className="flex flex-wrap gap-1">
                          {comp.areaIds.map(aId => {
                            const areaObj = (areas || []).find(a => a.id === aId);
                            if (!areaObj) return null;
                            return (
                              <span key={aId} className="px-2 py-0.5 rounded-md bg-indigo-600/10 text-indigo-300 border border-indigo-500/20 text-[10.5px]">
                                {areaObj.nombre}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Badges de Estado y Fecha */}
                      <div className="flex items-center gap-2">
                        {/* Badge de Estado del Compromiso */}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
                          comp.estadoCompromiso === 'SUBSANADO'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : comp.estadoCompromiso === 'EN_PROCESO'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        }`}>
                          {comp.estadoCompromiso === 'SUBSANADO' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          <span>{comp.estadoCompromiso === 'SUBSANADO' ? 'Subsanado / Cerrado' : comp.estadoCompromiso === 'EN_PROCESO' ? 'En Proceso' : 'Abierto'}</span>
                        </span>

                        {/* Badge de Fecha de Revisión */}
                        {comp.fechaCompromiso && (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                            comp.estadoTiempo === 'SUBSANADO'
                              ? 'bg-slate-950 text-slate-400 border-slate-800'
                              : comp.estadoTiempo === 'VENCIDO'
                              ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                              : comp.estadoTiempo === 'PROXIMO'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          }`}>
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {comp.estadoTiempo === 'VENCIDO'
                                ? `⚠️ Venció el ${comp.fechaCompromiso}`
                                : comp.estadoTiempo === 'PROXIMO'
                                ? `⚡ Vence en ${comp.diasDiferencia} días (${comp.fechaCompromiso})`
                                : `Revisión: ${comp.fechaCompromiso}`}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Texto del Requisito */}
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      "{comp.requisito}"
                    </p>

                    {/* Acción Propuesta y Plan de Subsanación */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
                      <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                        Plan de Acción Correctiva / Compromiso Acordado:
                      </span>
                      <p className="text-slate-200 text-xs leading-relaxed whitespace-pre-line">
                        {comp.accionPropuesta || 'Compromiso sin plan detallado redactado.'}
                      </p>
                      {comp.comentarioInicial && (
                        <p className="text-slate-400 text-[11px] italic pt-1 border-t border-slate-850">
                          Hallazgo del Auditor: {comp.comentarioInicial}
                        </p>
                      )}
                    </div>

                    {/* Bitácora de Trazabilidad Histórica */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Historial de Trazabilidad y Revisiones ({comp.historialTrazabilidad.length} registros)</span>
                      </span>

                      <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-xl border border-slate-850">
                        {comp.historialTrazabilidad.map((h, hIdx) => (
                          <div key={hIdx} className="flex items-start gap-2.5 text-[11.5px] border-b border-slate-850/60 last:border-0 pb-2 last:pb-0">
                            <span className="text-indigo-400 font-bold">•</span>
                            <div className="flex-1 space-y-0.5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-bold text-white">{h.auditor || 'Auditor'}</span>
                                <span className="text-[10.5px] font-mono text-slate-400">{h.fecha}</span>
                              </div>
                              <p className="text-slate-300 leading-relaxed">{h.comentario}</p>
                              {h.estado && (
                                <span className="inline-block text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.2 rounded border border-indigo-500/20 mt-1">
                                  Estado: {h.estado}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Botón para Actualizar Estado / Registrar Seguimiento */}
                    <div className="flex justify-end pt-2">
                      {!isUpdating ? (
                        <button
                          onClick={() => handleOpenUpdate(comp)}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-xl text-xs font-bold transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Registrar Seguimiento / Actualizar Estado</span>
                        </button>
                      ) : (
                        <div className="w-full bg-slate-950 border border-indigo-500/40 rounded-2xl p-4 space-y-4 animate-fadeIn shadow-xl">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <h4 className="text-xs font-bold text-white flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>Actualizar Estado y Registrar Bitácora de Seguimiento</span>
                            </h4>
                            <button
                              onClick={() => setUpdatingCommitmentCode(null)}
                              className="text-slate-400 hover:text-white p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                Nuevo Estado del Compromiso:
                              </label>
                              <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500"
                              >
                                <option value="ABIERTO">Abierto (Pendiente)</option>
                                <option value="EN_PROCESO">En Proceso de Implementación</option>
                                <option value="SUBSANADO">Subsanado / Cerrado Satisfactoriamente</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                Auditor / Evaluador Responsable:
                              </label>
                              <input
                                type="text"
                                value={auditorName}
                                onChange={(e) => setAuditorName(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-semibold text-slate-400">
                              Nota de Seguimiento / Conclusión de la Revisión:
                            </label>
                            <textarea
                              rows={2}
                              value={followupComment}
                              onChange={(e) => setFollowupComment(e.target.value)}
                              placeholder="Describa la evidencia revisada, hallazgo del seguimiento o justificación de cierre..."
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setUpdatingCommitmentCode(null)}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleSaveFollowup(comp.codigo)}
                              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Guardar en Bitácora</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900/90 border-t border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-400 font-mono">
            {filteredList.length} compromisos visibles
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs rounded-xl transition-all"
          >
            Cerrar Ventana
          </button>
        </div>

      </div>
    </div>
  );
}
