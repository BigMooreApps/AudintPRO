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
  ArrowLeft,
  TrendingUp,
  AlertTriangle,
  Users,
  Map,
  Layers,
  Settings
} from 'lucide-react';
import { AUDIT_TYPES, createDefaultAuditCycle } from '../engine/auditCyclesService';
import { DEFAULT_AREAS, DEFAULT_NUMERALES_MAPEO } from '../data/defaultMapeo';

const COLOR_OPTIONS = [
  { id: 'indigo', label: 'Índigo', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  { id: 'emerald', label: 'Verde', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { id: 'blue', label: 'Azul', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { id: 'cyan', label: 'Cian', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  { id: 'purple', label: 'Púrpura', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  { id: 'amber', label: 'Ámbar', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { id: 'rose', label: 'Rosa', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  { id: 'teal', label: 'Turquesa', bg: 'bg-teal-500/20 text-teal-300 border-teal-500/30' }
];

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
  const [creationStep, setCreationStep] = useState(1); // 1: Parámetros Generales, 2: Crear Auditores, 3: Crear Mapeo

  // Form Fields (Paso 1)
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

  // Áreas personalizadas para la nueva auditoría (Paso 2)
  const [wizardAreas, setWizardAreas] = useState(DEFAULT_AREAS);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaColor, setNewAreaColor] = useState('indigo');
  const [editingAreaId, setEditingAreaId] = useState(null);
  const [editingAreaName, setEditingAreaName] = useState('');

  // Mapeo personalizado para la nueva auditoría (Paso 3)
  const [wizardMapeo, setWizardMapeo] = useState(DEFAULT_NUMERALES_MAPEO);
  const [mapeoSearchTerm, setMapeoSearchTerm] = useState('');

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

  // Numerales filtrados para el paso 3
  const filteredWizardMapeo = useMemo(() => {
    if (!mapeoSearchTerm.trim()) return wizardMapeo;
    const term = mapeoSearchTerm.toLowerCase();
    return wizardMapeo.filter(n => 
      (n.codigo || '').toLowerCase().includes(term) || 
      (n.requisito || '').toLowerCase().includes(term)
    );
  }, [wizardMapeo, mapeoSearchTerm]);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    const currentYear = new Date().getFullYear();
    const count = (auditCycles || []).length + 1;
    setEditingAuditId('new');
    setCreationStep(1);
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
    setWizardAreas(DEFAULT_AREAS.map(a => ({ ...a })));
    setWizardMapeo(DEFAULT_NUMERALES_MAPEO.map(n => ({ ...n, areaIds: [...(n.areaIds || [])] })));
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
    setCreationStep(1);
  };

  // Gestión de Áreas en Paso 2
  const handleAddArea = (e) => {
    e?.preventDefault();
    if (!newAreaName.trim()) return;
    const newId = `area-${Date.now()}`;
    const newArea = {
      id: newId,
      nombre: newAreaName.trim(),
      color: newAreaColor
    };
    setWizardAreas([...wizardAreas, newArea]);
    setNewAreaName('');
  };

  const handleDeleteArea = (areaId) => {
    if (wizardAreas.length <= 1) return;
    setWizardAreas(wizardAreas.filter(a => a.id !== areaId));
    // Limpiar del mapeo
    setWizardMapeo(wizardMapeo.map(n => ({
      ...n,
      areaIds: (n.areaIds || []).filter(id => id !== areaId)
    })));
  };

  const handleSaveEditArea = (areaId) => {
    if (!editingAreaName.trim()) return;
    setWizardAreas(wizardAreas.map(a => a.id === areaId ? { ...a, nombre: editingAreaName.trim() } : a));
    setEditingAreaId(null);
    setEditingAreaName('');
  };

  // Gestión de Mapeo en Paso 3
  const handleToggleAreaForNumeral = (numeralId, areaId) => {
    setWizardMapeo(wizardMapeo.map(n => {
      if (n.id !== numeralId) return n;
      const currentAreaIds = n.areaIds || [];
      const hasArea = currentAreaIds.includes(areaId);
      return {
        ...n,
        areaIds: hasArea 
          ? currentAreaIds.filter(id => id !== areaId)
          : [...currentAreaIds, areaId]
      };
    }));
  };

  // Guardar y Finalizar Auditoría
  const handleFinalizeCreate = () => {
    if (!formData.nombre.trim() || !formData.codigo.trim()) return;

    onCreateAudit({
      ...formData,
      customAreas: wizardAreas,
      customMapeo: wizardMapeo
    });

    handleCancelForm();
  };

  const handleSaveSingleEdit = (e) => {
    e?.preventDefault();
    if (!formData.nombre.trim() || !formData.codigo.trim()) return;
    onUpdateAudit(editingAuditId, formData);
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

        {/* Filter and Action Bar (Solo si no está creando/editando) */}
        {!isFormOpen && (
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
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar text-xs">
          
          {/* ========================================================
              FLUJO DE CREACIÓN GUIADO (3 PASOS) PARA NUEVA AUDITORÍA
             ======================================================== */}
          {isFormOpen && editingAuditId === 'new' && (
            <div className="bg-slate-950 border border-indigo-500/30 rounded-2xl p-5 space-y-5 shadow-xl animate-fadeIn">
              
              {/* Stepper Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-indigo-400" />
                    <span>Crear Nuevo Ciclo de Auditoría</span>
                  </h4>
                  <p className="text-[11.5px] text-slate-400 mt-0.5">
                    Configure los parámetros generales, equipos auditores y matriz de mapeo para este ciclo.
                  </p>
                </div>
                
                <button type="button" onClick={handleCancelForm} className="text-slate-500 hover:text-slate-300">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Steps Indicators */}
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreationStep(1)}
                  className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    creationStep === 1
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-slate-950 flex items-center justify-center text-[10px] font-mono">1</span>
                  <span>Parámetros Generales</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCreationStep(2)}
                  className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    creationStep === 2
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-slate-950 flex items-center justify-center text-[10px] font-mono">2</span>
                  <span>Crear Auditores</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCreationStep(3)}
                  className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    creationStep === 3
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-slate-950 flex items-center justify-center text-[10px] font-mono">3</span>
                  <span>Crear Mapeo</span>
                </button>
              </div>

              {/* PASO 1: PARÁMETROS GENERALES */}
              {creationStep === 1 && (
                <div className="space-y-4 animate-fadeIn">
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
                        placeholder="Nombre del Laboratorio"
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Fecha de Inicio Programada:</label>
                      <input
                        type="date"
                        value={formData.fechaInicio}
                        onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Fecha de Cierre Estimada (Opcional):</label>
                      <input
                        type="date"
                        value={formData.fechaFin}
                        onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Observaciones / Alcance Específico:</label>
                    <textarea
                      rows={2}
                      value={formData.observacionesGenerales}
                      onChange={(e) => setFormData({ ...formData, observacionesGenerales: e.target.value })}
                      placeholder="Detalles sobre ensayos, calibraciones, matrices o requisitos a auditar..."
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleCancelForm}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-xl text-xs font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!formData.codigo.trim() || !formData.nombre.trim()) return;
                        setCreationStep(2);
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30"
                    >
                      <span>Siguiente: Crear Auditores</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 2: CREAR AUDITORES (ÁREAS DEL LABORATORIO) */}
              {creationStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-white text-xs">Equipos y Áreas Auditoras Asignadas</h5>
                      <p className="text-[11px] text-slate-400">
                        Defina los departamentos o equipos que participarán en esta auditoría ({wizardAreas.length} configurados).
                      </p>
                    </div>
                  </div>

                  {/* Formulario rápido para agregar área */}
                  <form onSubmit={handleAddArea} className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      placeholder="Nombre de la nueva área / equipo auditor..."
                      value={newAreaName}
                      onChange={(e) => setNewAreaName(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-w-[200px]"
                    />

                    <select
                      value={newAreaColor}
                      onChange={(e) => setNewAreaColor(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-indigo-300 focus:outline-none focus:border-indigo-500"
                    >
                      {COLOR_OPTIONS.map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>

                    <button
                      type="submit"
                      className="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar Área</span>
                    </button>
                  </form>

                  {/* Lista vertical de áreas configuradas */}
                  <div className="space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
                    {wizardAreas.map((area) => {
                      const isEditing = editingAreaId === area.id;

                      return (
                        <div
                          key={area.id}
                          className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shrink-0" />
                            {isEditing ? (
                              <input
                                type="text"
                                value={editingAreaName}
                                onChange={(e) => setEditingAreaName(e.target.value)}
                                className="bg-slate-950 border border-indigo-500 rounded-lg px-2.5 py-1 text-xs text-white flex-1"
                                autoFocus
                              />
                            ) : (
                              <span className="text-xs font-semibold text-slate-200 truncate">{area.nombre}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isEditing ? (
                              <button
                                type="button"
                                onClick={() => handleSaveEditArea(area.id)}
                                className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold"
                              >
                                Guardar
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingAreaId(area.id);
                                  setEditingAreaName(area.nombre);
                                }}
                                className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg"
                                title="Editar nombre"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {wizardAreas.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteArea(area.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                                title="Eliminar área"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setCreationStep(1)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Anterior: Parámetros</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCreationStep(3)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30"
                    >
                      <span>Siguiente: Crear Mapeo</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 3: CREAR MAPEO DE NUMERALES */}
              {creationStep === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h5 className="font-bold text-white text-xs">Asignación de Numerales ISO/IEC 17025 a las Áreas</h5>
                      <p className="text-[11px] text-slate-400">
                        Haga clic en las etiquetas de áreas para asignar o desasignar los numerales de la norma.
                      </p>
                    </div>

                    <div className="w-64 relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Buscar numeral o requisito..."
                        value={mapeoSearchTerm}
                        onChange={(e) => setMapeoSearchTerm(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Tabla interactiva de mapeo */}
                  <div className="max-h-[340px] overflow-y-auto custom-scrollbar border border-slate-800 rounded-2xl bg-slate-900/50">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold z-10">
                        <tr>
                          <th className="py-2.5 px-3 w-20">Código</th>
                          <th className="py-2.5 px-3">Requisito Normativo</th>
                          <th className="py-2.5 px-3 w-72">Áreas Responsables Asignadas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredWizardMapeo.map((num) => {
                          const assignedIds = num.areaIds || [];

                          return (
                            <tr key={num.id} className="hover:bg-indigo-950/20 transition-colors">
                              <td className="py-2.5 px-3 align-top font-mono font-bold text-indigo-400">
                                {num.codigo}
                              </td>
                              <td className="py-2.5 px-3 align-top text-slate-300 leading-relaxed text-[11.5px]">
                                {num.requisito}
                              </td>
                              <td className="py-2.5 px-3 align-top">
                                <div className="flex flex-wrap gap-1">
                                  {wizardAreas.map((area) => {
                                    const isAssigned = assignedIds.includes(area.id);

                                    return (
                                      <button
                                        key={area.id}
                                        type="button"
                                        onClick={() => handleToggleAreaForNumeral(num.id, area.id)}
                                        className={`px-2 py-0.5 rounded-md text-[10.5px] font-medium border transition-all ${
                                          isAssigned
                                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                                            : 'bg-slate-950/80 text-slate-500 border-slate-800 hover:border-slate-600 hover:text-slate-300'
                                        }`}
                                      >
                                        {area.nombre}
                                      </button>
                                    );
                                  })}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setCreationStep(2)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Anterior: Auditores</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleFinalizeCreate}
                      className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all transform active:scale-95"
                    >
                      <Check className="w-4 h-4" />
                      <span>✓ Finalizar y Crear Auditoría</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Formulario Simple de Edición para Auditoría Existente */}
          {isFormOpen && editingAuditId !== 'new' && (
            <form onSubmit={handleSaveSingleEdit} className="bg-slate-950 border border-indigo-500/30 rounded-2xl p-5 space-y-4 shadow-xl animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-indigo-400" />
                  <span>Editar Parámetros de la Auditoría</span>
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
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-indigo-300 font-mono font-bold focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nombre Descriptivo:</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
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
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Laboratorio:</label>
                  <input
                    type="text"
                    value={formData.laboratorio}
                    onChange={(e) => setFormData({ ...formData, laboratorio: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          )}

          {/* Listado de Auditorías Existentes */}
          {!isFormOpen && (
            <div className="space-y-3">
              {filteredAudits.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-500">
                  <FolderKanban className="w-8 h-8 mx-auto mb-2 opacity-40 text-indigo-400" />
                  <p className="text-xs">No se encontraron auditorías registradas con ese criterio.</p>
                </div>
              ) : (
                filteredAudits.map((audit) => {
                  const isActive = audit.id === activeAuditId;
                  const isClosed = audit.estado === 'CERRADA';

                  // Contar estadísticas rápidas de esta auditoría
                  const totalEval = Object.keys(audit.evaluationsHistory || {}).length;
                  const conformes = Object.values(audit.evaluationsHistory || {}).filter(e => 
                    e.estadoCompromiso === 'SUBSANADO' || (e.auditorConfirmado && (e.estado === 'CUMPLE'))
                  ).length;
                  const noConformes = Object.values(audit.evaluationsHistory || {}).filter(e => 
                    e.estadoCompromiso !== 'SUBSANADO' && e.auditorConfirmado && (e.estado === 'NO CUMPLE')
                  ).length;

                  return (
                    <div
                      key={audit.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isActive
                          ? 'bg-indigo-950/30 border-indigo-500/60 shadow-xl shadow-indigo-500/10'
                          : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        
                        {/* Info Principal */}
                        <div className="space-y-1.5 flex-1 min-w-[260px]">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-black bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 uppercase">
                              {audit.codigo}
                            </span>

                            {isActive && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span>Auditoría Activa</span>
                              </span>
                            )}

                            <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${
                              isClosed
                                ? 'bg-slate-800 text-slate-400 border-slate-700'
                                : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25'
                            }`}>
                              {isClosed ? '🔒 CERRADA' : '⚡ EN PROCESO'}
                            </span>

                            <span className="text-[11px] text-slate-400 font-medium">
                              • {audit.tipo}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-white leading-snug">
                            {audit.nombre}
                          </h4>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1">
                            <span className="flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                              <span>{audit.auditorLider || 'Auditor Líder no asignado'}</span>
                            </span>

                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-500" />
                              <span>Inicio: {audit.fechaInicio || 'No definida'}</span>
                            </span>

                            {audit.fechaFin && (
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-500" />
                                <span>Cierre: {audit.fechaFin}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Botones de Acción */}
                        <div className="flex flex-wrap items-center gap-2">
                          
                          {/* Seleccionar / Abrir esta Auditoría */}
                          {!isActive && (
                            <button
                              onClick={() => onSelectAudit(audit.id)}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all transform active:scale-95"
                            >
                              <Play className="w-3.5 h-3.5 fill-white" />
                              <span>Abrir Auditoría</span>
                            </button>
                          )}

                          {/* Cerrar o Reabrir Ciclo */}
                          <button
                            onClick={() => handleToggleEstado(audit)}
                            className={`p-2 rounded-xl border text-xs font-medium transition-all ${
                              isClosed
                                ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                            }`}
                            title={isClosed ? 'Reabrir auditoría para nuevas evaluaciones' : 'Cerrar formalmente este ciclo de auditoría'}
                          >
                            {isClosed ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>

                          {/* Editar */}
                          <button
                            onClick={() => handleStartEdit(audit)}
                            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-indigo-300 rounded-xl transition-all"
                            title="Editar información de esta auditoría"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Eliminar (si hay más de una) */}
                          {auditCycles.length > 1 && (
                            <button
                              onClick={() => onDeleteAudit(audit.id)}
                              className="p-2 bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 rounded-xl transition-all"
                              title="Eliminar este ciclo de auditoría"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                        </div>
                      </div>

                      {/* Métricas Resumidas del Ciclo */}
                      <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px]">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-slate-400">
                            Evaluaciones Registradas: <strong className="text-white font-mono">{totalEval}</strong>
                          </span>
                          <span className="text-emerald-400">
                            Conformes/Subsanados: <strong className="font-mono">{conformes}</strong>
                          </span>
                          <span className="text-rose-400">
                            No Conformes: <strong className="font-mono">{noConformes}</strong>
                          </span>
                        </div>

                        <span className="text-slate-500 font-mono text-[10.5px]">
                          {(audit.areas || []).length} Áreas • {(audit.mapeoNumerales || []).length} Numerales Mapeados
                        </span>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>{auditCycles.length} Ciclos de Auditoría Registrados</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl font-semibold transition-all"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
