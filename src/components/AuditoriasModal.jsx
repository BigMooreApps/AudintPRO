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
  Settings,
  Filter,
  CheckSquare,
  Square,
  KeyRound
} from 'lucide-react';
import { AUDIT_TYPES, createDefaultAuditCycle } from '../engine/auditCyclesService';
import { DEFAULT_AREAS, DEFAULT_NUMERALES_MAPEO, compareNumeralCodes } from '../data/defaultMapeo';

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

  // Áreas personalizadas para la auditoría (Paso 2)
  const [wizardAreas, setWizardAreas] = useState(DEFAULT_AREAS);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaPassword, setNewAreaPassword] = useState('1');
  const [editingAreaId, setEditingAreaId] = useState(null);
  const [editingAreaName, setEditingAreaName] = useState('');
  const [editingAreaPassword, setEditingAreaPassword] = useState('1');

  // Mapeo personalizado para la auditoría (Paso 3)
  const [wizardMapeo, setWizardMapeo] = useState(DEFAULT_NUMERALES_MAPEO);
  const [mapeoFilterAreaId, setMapeoFilterAreaId] = useState('ALL');
  const [mapeoSearchTerm, setMapeoSearchTerm] = useState('');
  const [editingMapeoNumeralId, setEditingMapeoNumeralId] = useState(null);
  const [mapeoCodigo, setMapeoCodigo] = useState('');
  const [mapeoRequisito, setMapeoRequisito] = useState('');
  const [mapeoSelectedAreaIds, setMapeoSelectedAreaIds] = useState([]);

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

  // Numerales filtrados para el paso 3 (ordenados de menor a mayor)
  const filteredWizardMapeo = useMemo(() => {
    const list = (wizardMapeo || []).filter(n => {
      if (mapeoFilterAreaId !== 'ALL' && !(n.areaIds || []).includes(mapeoFilterAreaId)) {
        return false;
      }
      if (mapeoSearchTerm.trim()) {
        const term = mapeoSearchTerm.toLowerCase();
        const matchCode = (n.codigo || '').toLowerCase().includes(term);
        const matchReq = (n.requisito || '').toLowerCase().includes(term);
        if (!matchCode && !matchReq) return false;
      }
      return true;
    });

    return list.sort(compareNumeralCodes);
  }, [wizardMapeo, mapeoFilterAreaId, mapeoSearchTerm]);

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
    setWizardAreas(DEFAULT_AREAS.map(a => ({ password: '1', ...a })));
    setWizardMapeo(DEFAULT_NUMERALES_MAPEO.map(n => ({ ...n, areaIds: [...(n.areaIds || [])] })));
    setMapeoFilterAreaId('ALL');
    setMapeoSearchTerm('');
    setEditingMapeoNumeralId(null);
    setNewAreaName('');
    setNewAreaPassword('1');
    setIsFormOpen(true);
  };

  const handleStartEdit = (audit) => {
    setEditingAuditId(audit.id);
    setCreationStep(1);
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
    setWizardAreas((audit.areas || DEFAULT_AREAS).map(a => ({ password: '1', ...a })));
    setWizardMapeo((audit.mapeoNumerales || DEFAULT_NUMERALES_MAPEO).map(n => ({ ...n, areaIds: [...(n.areaIds || [])] })));
    setMapeoFilterAreaId('ALL');
    setMapeoSearchTerm('');
    setEditingMapeoNumeralId(null);
    setNewAreaName('');
    setNewAreaPassword('1');
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingAuditId(null);
    setCreationStep(1);
    setEditingMapeoNumeralId(null);
    setNewAreaName('');
    setNewAreaPassword('1');
  };

  // Gestión de Áreas en Paso 2
  const handleAddArea = (e) => {
    e?.preventDefault();
    if (!newAreaName.trim()) return;
    const newId = `area-${Date.now()}`;
    const newArea = {
      id: newId,
      nombre: newAreaName.trim(),
      password: newAreaPassword.trim() || '1',
      color: 'indigo'
    };
    setWizardAreas([...wizardAreas, newArea]);
    setNewAreaName('');
    setNewAreaPassword('1');
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
    setWizardAreas(wizardAreas.map(a => a.id === areaId ? { 
      ...a, 
      nombre: editingAreaName.trim(),
      password: editingAreaPassword.trim() || '1'
    } : a));
    setEditingAreaId(null);
    setEditingAreaName('');
    setEditingAreaPassword('1');
  };

  // Gestión de Numerales en Paso 3 (exactamente como MapeoModal)
  const handleStartCreateNumeral = () => {
    setEditingMapeoNumeralId('new');
    setMapeoCodigo('');
    setMapeoRequisito('');
    setMapeoSelectedAreaIds(mapeoFilterAreaId !== 'ALL' ? [mapeoFilterAreaId] : (wizardAreas[0] ? [wizardAreas[0].id] : []));
  };

  const handleStartEditNumeral = (numeral) => {
    setEditingMapeoNumeralId(numeral.id);
    setMapeoCodigo(numeral.codigo);
    setMapeoRequisito(numeral.requisito || '');
    setMapeoSelectedAreaIds(numeral.areaIds || []);
  };

  const handleCancelMapeoForm = () => {
    setEditingMapeoNumeralId(null);
    setMapeoCodigo('');
    setMapeoRequisito('');
    setMapeoSelectedAreaIds([]);
  };

  const handleToggleAreaCheckbox = (areaId) => {
    if (mapeoSelectedAreaIds.includes(areaId)) {
      setMapeoSelectedAreaIds(mapeoSelectedAreaIds.filter(id => id !== areaId));
    } else {
      setMapeoSelectedAreaIds([...mapeoSelectedAreaIds, areaId]);
    }
  };

  const handleSaveMapeoForm = (e) => {
    e.preventDefault();
    if (!mapeoCodigo.trim() || !mapeoRequisito.trim()) return;

    if (editingMapeoNumeralId === 'new') {
      const newNumeral = {
        id: `num-${Date.now()}`,
        codigo: mapeoCodigo.trim(),
        requisito: mapeoRequisito.trim(),
        areaIds: mapeoSelectedAreaIds
      };
      setWizardMapeo([...wizardMapeo, newNumeral]);
    } else {
      const updated = wizardMapeo.map(n =>
        n.id === editingMapeoNumeralId
          ? { ...n, codigo: mapeoCodigo.trim(), requisito: mapeoRequisito.trim(), areaIds: mapeoSelectedAreaIds }
          : n
      );
      setWizardMapeo(updated);
    }
    handleCancelMapeoForm();
  };

  const handleDeleteMapeoNumeral = (id) => {
    setWizardMapeo(wizardMapeo.filter(n => n.id !== id));
    if (editingMapeoNumeralId === id) handleCancelMapeoForm();
  };

  // Guardar y Finalizar Auditoría (tanto para nueva como para edición)
  const handleFinalizeSave = () => {
    if (!formData.nombre.trim() || !formData.codigo.trim()) return;

    if (editingAuditId === 'new') {
      onCreateAudit({
        ...formData,
        customAreas: wizardAreas,
        customMapeo: wizardMapeo
      });
    } else {
      onUpdateAudit(editingAuditId, {
        ...formData,
        areas: wizardAreas,
        mapeoNumerales: wizardMapeo
      });
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full h-[720px] max-h-[92vh] shadow-2xl overflow-hidden flex flex-col text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
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

        {/* Filter and Action Bar (Solo si no está en el asistente) */}
        {!isFormOpen && (
          <div className="px-6 py-3.5 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
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

        {/* Body Content (Fixed Height Container) */}
        <div className="p-6 flex-1 flex flex-col overflow-hidden text-xs">
          
          {/* ========================================================
              FLUJO GUIADO DE 3 PASOS (CREAR Y EDITAR AUDITORÍA)
             ======================================================== */}
          {isFormOpen && (
            <div className="bg-slate-950 border border-indigo-500/30 rounded-2xl p-5 shadow-xl animate-fadeIn flex flex-col h-full overflow-hidden justify-between">

              {/* Progress Steps Indicators (Barra fija superior) */}
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 shrink-0 mb-4">
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
                  <span>1. Parámetros Generales</span>
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
                  <span>2. Crear / Editar Auditores</span>
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
                  <span>3. Crear / Editar Mapeo</span>
                </button>
              </div>

              {/* PASO 1: PARÁMETROS GENERALES */}
              {creationStep === 1 && (
                <div className="flex-1 flex flex-col justify-between overflow-y-auto space-y-4 animate-fadeIn pr-1 custom-scrollbar">
                  <div className="space-y-3.5">
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
                        rows={3}
                        value={formData.observacionesGenerales}
                        onChange={(e) => setFormData({ ...formData, observacionesGenerales: e.target.value })}
                        placeholder="Detalles sobre ensayos, calibraciones, matrices o requisitos a auditar..."
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800 mt-auto shrink-0">
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

              {/* PASO 2: CREAR / EDITAR AUDITORES (ÁREAS DEL LABORATORIO) */}
              {creationStep === 2 && (
                <div className="flex-1 flex flex-col justify-between overflow-hidden animate-fadeIn space-y-3">
                  
                  {/* Formulario rápido para agregar área */}
                  <form onSubmit={handleAddArea} className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center gap-2 shrink-0">
                    <input
                      type="text"
                      placeholder="Nombre de la nueva área / equipo auditor..."
                      value={newAreaName}
                      onChange={(e) => setNewAreaName(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-w-[200px]"
                    />

                    {/* Input de Contraseña de Acceso */}
                    <div className="relative flex items-center shrink-0">
                      <KeyRound className="w-3.5 h-3.5 text-slate-500 absolute left-3 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Clave (def: 1)"
                        value={newAreaPassword}
                        onChange={(e) => setNewAreaPassword(e.target.value)}
                        className="w-36 bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-indigo-300 font-mono focus:outline-none focus:border-indigo-500"
                        title="Contraseña para el inicio de sesión de este auditor (Por defecto: 1)"
                      />
                    </div>

                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/25 transition-all transform active:scale-95 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar Área</span>
                    </button>
                  </form>

                  {/* Lista vertical de áreas configuradas (con scroll interno fluido) */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 min-h-[260px]">
                    {wizardAreas.map((area) => {
                      const isEditing = editingAreaId === area.id;

                      return (
                        <div
                          key={area.id}
                          className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3"
                        >
                          {isEditing ? (
                            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                              <input
                                type="text"
                                value={editingAreaName}
                                onChange={(e) => setEditingAreaName(e.target.value)}
                                className="bg-slate-950 border border-indigo-500 rounded-lg px-2.5 py-1 text-xs text-white flex-1 min-w-[160px]"
                                autoFocus
                              />
                              <div className="relative flex items-center shrink-0">
                                <KeyRound className="w-3 h-3 text-slate-500 absolute left-2.5 pointer-events-none" />
                                <input
                                  type="text"
                                  placeholder="Clave"
                                  value={editingAreaPassword}
                                  onChange={(e) => setEditingAreaPassword(e.target.value)}
                                  className="w-24 bg-slate-950 border border-indigo-500 rounded-lg pl-7 pr-2 py-1 text-xs text-indigo-300 font-mono"
                                  title="Contraseña del auditor"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shrink-0" />
                              <span className="text-xs font-semibold text-slate-200 truncate">{area.nombre}</span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10.5px] font-mono text-indigo-300 flex items-center gap-1 shrink-0">
                                <KeyRound className="w-3 h-3 text-slate-500" />
                                <span>Clave: <strong className="text-white">{area.password || '1'}</strong></span>
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isEditing ? (
                              <button
                                type="button"
                                onClick={() => handleSaveEditArea(area.id)}
                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold shadow-sm transition-all"
                              >
                                Guardar
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingAreaId(area.id);
                                  setEditingAreaName(area.nombre);
                                  setEditingAreaPassword(area.password || '1');
                                }}
                                className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg"
                                title="Editar nombre y contraseña"
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

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800 mt-auto shrink-0">
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

              {/* PASO 3: CREAR / EDITAR MAPEO (EXACTAMENTE IGUAL A MAPEO MODAL) */}
              {creationStep === 3 && (
                <div className="flex-1 flex flex-col justify-between overflow-hidden animate-fadeIn space-y-3">
                  
                  {/* Filter and Action Bar idéntico a MapeoModal */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl shrink-0">
                    <div className="flex flex-wrap items-center gap-3 flex-1">
                      
                      {/* Desplegable de Filtro de Área */}
                      <div className="flex items-center gap-2 min-w-[180px]">
                        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                        <select
                          value={mapeoFilterAreaId}
                          onChange={(e) => setMapeoFilterAreaId(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-indigo-300 font-semibold focus:outline-none focus:border-indigo-500"
                        >
                          <option value="ALL">Todas las Áreas</option>
                          {wizardAreas.map(a => (
                            <option key={a.id} value={a.id}>
                              {a.nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Buscador de código o requisito */}
                      <div className="flex items-center gap-2 flex-1 min-w-[200px] relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Buscar código o texto del requisito..."
                          value={mapeoSearchTerm}
                          onChange={(e) => setMapeoSearchTerm(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartCreateNumeral}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/25 transition-all transform active:scale-95 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Nuevo Numeral</span>
                    </button>
                  </div>

                  {/* Formulario de Creación / Edición de Numeral (si aplica) */}
                  {editingMapeoNumeralId && (
                    <form onSubmit={handleSaveMapeoForm} className="bg-slate-950 border border-indigo-500/30 rounded-2xl p-4 space-y-3 animate-fadeIn shadow-xl shrink-0">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          {editingMapeoNumeralId === 'new' ? 'Registrar Nuevo Numeral' : 'Editar Numeral y Áreas Asignadas'}
                        </h4>
                        <button type="button" onClick={handleCancelMapeoForm} className="text-slate-500 hover:text-slate-300">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-1">
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Código / Numeral:</label>
                          <input
                            type="text"
                            value={mapeoCodigo}
                            onChange={(e) => setMapeoCodigo(e.target.value)}
                            placeholder="Ej. 4.1.1"
                            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-indigo-300 font-mono font-bold focus:outline-none focus:border-indigo-500"
                            autoFocus
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Texto del Requisito:</label>
                          <input
                            type="text"
                            value={mapeoRequisito}
                            onChange={(e) => setMapeoRequisito(e.target.value)}
                            placeholder="Texto completo de la exigencia ISO/IEC 17025..."
                            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Seleccione las Áreas o Equipos que deben auditar este numeral:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 max-h-[100px] overflow-y-auto custom-scrollbar">
                          {wizardAreas.map(a => {
                            const isChecked = mapeoSelectedAreaIds.includes(a.id);
                            return (
                              <button
                                key={a.id}
                                type="button"
                                onClick={() => handleToggleAreaCheckbox(a.id)}
                                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-xs transition-all ${
                                  isChecked 
                                    ? 'bg-indigo-600/25 text-indigo-200 border border-indigo-500/40 font-semibold shadow-sm' 
                                    : 'text-slate-400 hover:bg-slate-800 border border-transparent'
                                }`}
                              >
                                {isChecked ? <CheckSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> : <Square className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                                <span className="truncate">{a.nombre}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={handleCancelMapeoForm}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/25 transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Guardar Numeral</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Tabla de Numerales Mapeados */}
                  <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-lg flex flex-col min-h-[220px]">
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold z-10">
                          <tr>
                            <th className="py-2.5 px-4 w-28">Código</th>
                            <th className="py-2.5 px-4">Requisito ISO/IEC 17025</th>
                            <th className="py-2.5 px-4 w-64">Áreas Asignadas</th>
                            <th className="py-2.5 px-4 w-20 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/70 font-sans">
                          {filteredWizardMapeo.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-8 text-center text-slate-500 italic">
                                No se encontraron numerales con el filtro actual.
                              </td>
                            </tr>
                          ) : (
                            filteredWizardMapeo.map((n) => (
                              <tr key={n.id} className="hover:bg-slate-900/40 transition-colors align-top">
                                <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                                  {n.codigo}
                                </td>
                                <td className="py-3 px-4 text-slate-200 leading-relaxed">
                                  {n.requisito}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex flex-wrap gap-1">
                                    {(n.areaIds || []).map(aId => {
                                      const aObj = wizardAreas.find(a => a.id === aId);
                                      if (!aObj) return null;
                                      return (
                                        <span key={aId} className="px-2 py-0.5 rounded-lg bg-indigo-600/15 text-indigo-300 border border-indigo-500/20 text-[10.5px] font-medium">
                                          {aObj.nombre}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditNumeral(n)}
                                      className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-all"
                                      title="Editar numeral y asignación de áreas"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteMapeoNumeral(n.id)}
                                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                                      title="Eliminar del mapeo"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Footer de navegación del Paso 3 */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 mt-auto shrink-0">
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
                      onClick={handleFinalizeSave}
                      className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all transform active:scale-95"
                    >
                      <Check className="w-4 h-4" />
                      <span>{editingAuditId === 'new' ? '✓ Finalizar y Crear Auditoría' : '✓ Guardar Cambios de la Auditoría'}</span>
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* Listado de Auditorías Existentes */}
          {!isFormOpen && (
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
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
                          
                          {/* Seleccionar / Abrir esta Auditoría (Siempre Visible) */}
                          <button
                            onClick={() => onSelectAudit(audit.id)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all transform active:scale-95"
                            title="Abrir esta auditoría e ir al Dashboard Principal"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Abrir Auditoría</span>
                          </button>

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

                          {/* Editar (Abre el wizard de 3 pasos) */}
                          <button
                            onClick={() => handleStartEdit(audit)}
                            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-indigo-300 rounded-xl transition-all"
                            title="Editar configuración completa de esta auditoría (3 pasos)"
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

      </div>
    </div>
  );
}
