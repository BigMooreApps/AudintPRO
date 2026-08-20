import React, { useState } from 'react';
import { X, Users, Plus, Trash2, Edit3, Check, Search, ShieldCheck } from 'lucide-react';

export default function AuditoresModal({
  isOpen,
  onClose,
  areas = [],
  setAreas,
  onSaveAreas,
  mapeoNumerales = []
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAreaId, setEditingAreaId] = useState(null);
  const [nombre, setNombre] = useState('');

  if (!isOpen) return null;

  const saveAreasHandler = onSaveAreas || setAreas || (() => {});

  const handleStartCreate = () => {
    setEditingAreaId('new');
    setNombre('');
  };

  const handleStartEdit = (area) => {
    setEditingAreaId(area.id);
    setNombre(area.nombre);
  };

  const handleCancelForm = () => {
    setEditingAreaId(null);
    setNombre('');
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    if (editingAreaId === 'new') {
      const newArea = {
        id: `area-${Date.now()}`,
        nombre: nombre.trim()
      };
      saveAreasHandler([...areas, newArea]);
    } else {
      const updated = areas.map(a => 
        a.id === editingAreaId 
          ? { ...a, nombre: nombre.trim() }
          : a
      );
      saveAreasHandler(updated);
    }
    handleCancelForm();
  };

  const handleDeleteArea = (id) => {
    if (areas.length <= 1) {
      alert('Debe existir al menos un Área / Auditor en el sistema.');
      return;
    }
    if (confirm('¿Está seguro de eliminar esta Área / Auditor?')) {
      const updated = areas.filter(a => a.id !== id);
      saveAreasHandler(updated);
      if (editingAreaId === id) handleCancelForm();
    }
  };

  const getNumeralCountForArea = (areaId) => {
    return (mapeoNumerales || []).filter(n => (n.areaIds || []).includes(areaId)).length;
  };

  const filteredAreas = (areas || []).filter(a => 
    !searchTerm.trim() || (a.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Gestión de Auditores y Áreas</h3>
              <p className="text-xs text-slate-400">Administre la lista de áreas o equipos de auditoría del laboratorio</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Bar */}
        <div className="px-6 py-3.5 bg-slate-950/50 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-indigo-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar área o auditor..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleStartCreate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Área / Auditor</span>
          </button>
        </div>

        {/* Body Form or List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {editingAreaId && (
            <form onSubmit={handleSaveForm} className="bg-slate-950 border border-indigo-500/30 rounded-2xl p-4 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {editingAreaId === 'new' ? 'Crear Nueva Área' : 'Editar Área'}
                </h4>
                <button type="button" onClick={handleCancelForm} className="text-slate-500 hover:text-slate-300">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nombre del Área / Cargo Auditor:</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Metrología y Calibración, Ensayos Físico-Químicos..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar</span>
                </button>
              </div>
            </form>
          )}

          {/* Lista Vertical de Áreas */}
          <div className="space-y-2.5">
            {filteredAreas.map((area) => {
              const count = getNumeralCountForArea(area.id);

              return (
                <div
                  key={area.id}
                  className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex items-center justify-between gap-4 group transition-all"
                >
                  <div className="flex flex-wrap items-center gap-3 min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white truncate min-w-[200px] flex-1">{area.nombre}</h4>
                    <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 shrink-0">
                      {count} numerales asignados
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => handleStartEdit(area)}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-all"
                      title="Editar nombre"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteArea(area.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                      title="Eliminar área"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-400 font-mono">
            {areas.length} áreas registradas
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
