import React, { useState, useMemo } from 'react';
import { 
  X, 
  FolderKanban, 
  Plus, 
  Check, 
  CheckCheck,
  CheckCircle2, 
  XCircle, 
  Clock, 
  Edit3, 
  Trash2, 
  Play, 
  Lock, 
  Unlock, 
  Copy, 
  Calendar, 
  UserCheck, 
  Building2, 
  Search,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { AUDIT_TYPES, createDefaultAuditCycle } from '../engine/auditCyclesService';

export default function AuditoriasModal({
  isOpen,
  onClose,
  auditCycles = [],
  activeAuditId,
  onSelectAudit,
  onCreateAudit,
  onUpdateAudit,
  onDeleteAudit
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAuditId, setEditingAuditId] = useState(null); // 'new' | existingId

  // Form Fields
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    tipo: AUDIT_TYPES[0],
    laboratorio: 'Laboratorio de Ensayos y Calibración',
    auditorLider: 'Auditor Líder ISO 17025',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: '',
    estado: 'EN_PROCESO',
    observacionesGenerales: '',
    cloneFromCurrent: true
  });

  const filteredAudits = useMemo(() => {
    return (auditCycles || []).filter(a => {
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = (a.nombre || '').toLowerCase().includes(term);
        const matchCode = (a.codigo || '').toLowerCase().includes(term);
        const matchLeader = (a.auditorLider || '').toLowerCase().includes(term);
        if (!matchName && !matchCode && !matchLeader) return false;
      }
      return true;
    });
  }, [auditCycles, searchTerm]);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    const currentYear = new Date().getFullYear();
    const count = (auditCycles || []).length + 1;
    setEditingAuditId('new');
    setFormData({
      codigo: `AUD-${currentYear}-0${count}`,
      nombre: `Auditoría Interna ISO/IEC 17025 - Ciclo ${currentYear} (${count})`,
      tipo: AUDIT_TYPES[0],
      laboratorio: 'Laboratorio de Ensayos y Calibración',
      auditorLider: 'Auditor Líder ISO 17025',
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: '',
      estado: 'EN_PROCESO',
      observacionesGenerales: '',
      cloneFromCurrent: true
    });
    setIsFormOpen(true);
  };

  const handleStartEdit = (audit) => {
    setEditingAuditId(audit.id);
    setFormData({
      codigo: audit.codigo || '',
      nombre: audit.nombre || '',
      tipo: audit.tipo || AUDIT_TYPES[0],
      laboratorio: audit.laboratorio || '',
      auditorLider: audit.auditorLider || '',
      fechaInicio: audit.fechaInicio || '',
      fechaFin: audit.fechaFin || '',
      estado: audit.estado || 'EN_PROCESO',
      observacionesGenerales: audit.observacionesGenerales || '',
      cloneFromCurrent: false
    });
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingAuditId(null);
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.codigo.trim()) return;

    if (editingAuditId === 'new') {
      onCreateAudit(formData);
    } else {
      onUpdateAudit(editingAuditId, formData);
    }

    handleCancelForm();
  };

  const handleToggleEstado = (audit) => {
    const nuevoEstado = audit.estado === 'CERRADA' ? 'EN_PROCESO' : 'CERRADA';
    onUpdateAudit(audit.id, {
      ...audit,
      estado: nuevoEstado,
      fechaFin: nuevoEstado === 'CERRADA' && !audit.fechaFin ? new Date().toISOString().split('T')[0] : audit.fechaFin
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Gestión de Auditorías e Historial Periódico</h3>
              <p className="text-xs text-slate-400">
                Administre, cree y alterne entre las diferentes auditorías anuales o periódicas de la norma ISO/IEC 17025
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

        {/* Filter and Action Bar */}
        <div className="px-6 py-3.5 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar auditoría por nombre, código o auditor líder..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleStartCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/25 transition-all transform active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nueva Auditoría</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar text-xs">
          
          {/* Formulario de Creación / Edición */}
          {isFormOpen && (
            <form onSubmit={handleSaveForm} className="bg-slate-950 border border-indigo-500/30 rounded-2xl p-5 space-y-4 shadow-xl animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-indigo-400" />
                  <span>{editingAuditId === 'new' ? 'Registrar Nuevo Ciclo de Auditoría' : 'Editar Información de la Auditoría'}</span>
                </h4>
                <button type="button" onClick={handleCancelForm} className="text-slate-500 hover:text-slate-300">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Código de Auditoría:</label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    placeholder="Ej. AUD-2026-01"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-indigo-300 font-mono font-bold focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nombre Descriptivo de la Auditoría:</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej. Auditoría Interna Anual ISO/IEC 17025 - 2026"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tipo de Auditoría:</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-indigo-300 font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    {AUDIT_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Auditor Líder:</label>
                  <input
                    type="text"
                    value={formData.auditorLider}
                    onChange={(e) => setFormData({ ...formData, auditorLider: e.target.value })}
                    placeholder="Nombre del Auditor Líder"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Laboratorio / Alcance:</label>
                  <input
                    type="text"
                    value={formData.laboratorio}
                    onChange={(e) => setFormData({ ...formData, laboratorio: e.target.value })}
                    placeholder="Laboratorio de Ensayos / Calibración"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Fecha de Inicio:</label>
                  <input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-indigo-300 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Fecha de Cierre / Finalización:</label>
                  <input
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Estado:</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="EN_PROCESO">En Proceso (Abierta)</option>
                    <option value="PLANIFICADA">Planificada</option>
                    <option value="CERRADA">Cerrada / Concluida</option>
                  </select>
                </div>
              </div>

              {editingAuditId === 'new' && (
                <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="cloneCheckbox"
                    checked={formData.cloneFromCurrent}
                    onChange={(e) => setFormData({ ...formData, cloneFromCurrent: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="cloneCheckbox" className="text-xs text-slate-200 cursor-pointer">
                    Heredar catálogo de <strong>Áreas de Auditoría y Mapeo de Numerales</strong> de la auditoría activa (iniciando las evaluaciones en 0).
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/25 transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingAuditId === 'new' ? 'Crear e Iniciar Auditoría' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Lista de Auditorías Registradas */}
          <div className="space-y-3.5">
            {filteredAudits.map((audit) => {
              const isActive = audit.id === activeAuditId;
              const isCerrada = audit.estado === 'CERRADA';
              const evaluations = audit.evaluationsHistory || {};
              const mapeo = audit.mapeoNumerales || [];
              const totalNums = mapeo.length || 127;

              // Métricas de esta auditoría
              let evaluados = 0;
              let conformes = 0;
              let noConformes = 0;
              let subsanados = 0;

              mapeo.forEach(num => {
                const evalItem = evaluations[num.codigo] || evaluations[num.id];
                if (evalItem && evalItem.estadoCompromiso === 'SUBSANADO') {
                  subsanados++;
                  evaluados++;
                  conformes++;
                } else if (evalItem && evalItem.auditorConfirmado === true) {
                  evaluados++;
                  const est = (evalItem.estado || '').toUpperCase();
                  if (est === 'CUMPLE') conformes++;
                  else if (est === 'NO CUMPLE') noConformes++;
                  else conformes++;
                }
              });

              const pctAvance = totalNums > 0 ? Math.round((evaluados / totalNums) * 100) : 0;
              const pctConformidad = evaluados > 0 ? Math.round((conformes / evaluados) * 100) : 0;

              return (
                <div
                  key={audit.id}
                  className={`border rounded-3xl p-5 transition-all relative overflow-hidden group ${
                    isActive 
                      ? 'bg-slate-950/90 border-indigo-500 shadow-xl shadow-indigo-950/40 ring-1 ring-indigo-500/50' 
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    
                    {/* Bloque Izquierdo: Info Principal */}
                    <div className="space-y-2 flex-1 min-w-[280px]">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-xs font-black text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/20">
                          {audit.codigo}
                        </span>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${
                          isCerrada
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : audit.estado === 'PLANIFICADA'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {isCerrada ? 'Cerrada / Concluida' : audit.estado === 'PLANIFICADA' ? 'Planificada' : 'En Proceso'}
                        </span>

                        {isActive && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-indigo-600 text-white flex items-center gap-1 shadow-md shadow-indigo-600/30 animate-pulse">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Auditoría Activa</span>
                          </span>
                        )}

                        <span className="text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                          {audit.tipo}
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-white leading-tight">
                        {audit.nombre}
                      </h4>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400 pt-1">
                        <span className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Líder: <strong className="text-slate-200">{audit.auditorLider}</strong></span>
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Inicio: <strong className="text-slate-200">{audit.fechaInicio}</strong></span>
                          {audit.fechaFin && <span> - Cierre: <strong className="text-slate-200">{audit.fechaFin}</strong></span>}
                        </span>
                      </div>
                    </div>

                    {/* Bloque Central: Métricas Rápidas */}
                    <div className="flex items-center gap-4 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 shrink-0">
                      <div className="text-center px-2">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Avance</span>
                        <span className="text-lg font-black text-white font-mono">{pctAvance}%</span>
                      </div>

                      <div className="w-px h-8 bg-slate-800" />

                      <div className="text-center px-2">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Validados</span>
                        <span className="text-lg font-black text-indigo-300 font-mono">{evaluados}/{totalNums}</span>
                      </div>

                      <div className="w-px h-8 bg-slate-800" />

                      <div className="text-center px-2">
                        <span className="text-[10px] text-rose-400 block uppercase font-bold">Hallazgos</span>
                        <span className="text-lg font-black text-rose-400 font-mono">{noConformes}</span>
                      </div>

                      <div className="w-px h-8 bg-slate-800" />

                      <div className="text-center px-2">
                        <span className="text-[10px] text-teal-400 block uppercase font-bold">Subsanados</span>
                        <span className="text-lg font-black text-teal-300 font-mono">{subsanados}</span>
                      </div>
                    </div>

                    {/* Bloque Derecho: Acciones */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0">
                      {!isActive ? (
                        <button
                          onClick={() => onSelectAudit(audit.id)}
                          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Abrir Auditoría</span>
                        </button>
                      ) : (
                        <span className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-xl text-xs font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>En Ejecución</span>
                        </span>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleEstado(audit)}
                          className={`p-2 rounded-xl border transition-all ${
                            isCerrada
                              ? 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 border-slate-800'
                              : 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 border-slate-800'
                          }`}
                          title={isCerrada ? 'Reabrir Auditoría' : 'Cerrar / Concluir Auditoría'}
                        >
                          {isCerrada ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => handleStartEdit(audit)}
                          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-xl border border-slate-800 transition-all"
                          title="Editar Datos de la Auditoría"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {auditCycles.length > 1 && (
                          <button
                            onClick={() => {
                              if (confirm(`¿Está seguro de eliminar la auditoría "${audit.nombre}"? Todos sus registros se perderán.`)) {
                                onDeleteAudit(audit.id);
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl border border-slate-800 transition-all"
                            title="Eliminar Auditoría"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-400 font-mono">
            {auditCycles.length} auditorías registradas en el sistema
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            Listo
          </button>
        </div>

      </div>
    </div>
  );
}
