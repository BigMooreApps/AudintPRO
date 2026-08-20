import React, { useState } from 'react';
import { X, Map, Plus, Trash2, Edit3, Check, Filter, CheckSquare, Square, Search } from 'lucide-react';

export default function MapeoModal({
  isOpen,
  onClose,
  numeralesMapeo,
  mapeoNumerales,
  setMapeoNumerales,
  onSaveMapeo,
  areas = []
}) {
  const [filterAreaId, setFilterAreaId] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editingNumeralId, setEditingNumeralId] = useState(null);
  const [codigo, setCodigo] = useState('');
  const [requisito, setRequisito] = useState('');
  const [selectedAreaIds, setSelectedAreaIds] = useState([]);

  if (!isOpen) return null;

  const currentMapeo = numeralesMapeo || mapeoNumerales || [];
  const saveMapeoHandler = onSaveMapeo || setMapeoNumerales || (() => {});

  const handleStartCreate = () => {
    setEditingNumeralId('new');
    setCodigo('');
    setRequisito('');
    setSelectedAreaIds(filterAreaId !== 'ALL' ? [filterAreaId] : (areas[0] ? [areas[0].id] : []));
  };

  const handleStartEdit = (numeral) => {
    setEditingNumeralId(numeral.id);
    setCodigo(numeral.codigo);
    setRequisito(numeral.requisito || '');
    setSelectedAreaIds(numeral.areaIds || []);
  };

  const handleCancelForm = () => {
    setEditingNumeralId(null);
    setCodigo('');
    setRequisito('');
    setSelectedAreaIds([]);
  };

  const handleToggleAreaCheckbox = (areaId) => {
    if (selectedAreaIds.includes(areaId)) {
      setSelectedAreaIds(selectedAreaIds.filter(id => id !== areaId));
    } else {
      setSelectedAreaIds([...selectedAreaIds, areaId]);
    }
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!codigo.trim() || !requisito.trim()) return;

    if (editingNumeralId === 'new') {
      const newNumeral = {
        id: `num-${Date.now()}`,
        codigo: codigo.trim(),
        requisito: requisito.trim(),
        areaIds: selectedAreaIds
      };
      saveMapeoHandler([...currentMapeo, newNumeral]);
    } else {
      const updated = currentMapeo.map(n => 
        n.id === editingNumeralId
          ? { ...n, codigo: codigo.trim(), requisito: requisito.trim(), areaIds: selectedAreaIds }
          : n
      );
      saveMapeoHandler(updated);
    }
    handleCancelForm();
  };

  const handleDeleteNumeral = (id) => {
    if (confirm('¿Está seguro de eliminar este subnumeral del mapeo general?')) {
      const updated = currentMapeo.filter(n => n.id !== id);
      saveMapeoHandler(updated);
      if (editingNumeralId === id) handleCancelForm();
    }
  };

  const filteredMapeo = currentMapeo.filter(n => {
    if (filterAreaId !== 'ALL' && !(n.areaIds || []).includes(filterAreaId)) {
      return false;
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchCode = (n.codigo || '').toLowerCase().includes(term);
      const matchReq = (n.requisito || '').toLowerCase().includes(term);
      if (!matchCode && !matchReq) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Mapeo e Interrelación de Numerales vs Áreas</h3>
              <p className="text-xs text-slate-400">Configure qué numerales de la norma ISO/IEC 17025 aplican a cada área o auditor</p>
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
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="flex items-center gap-2 min-w-[200px]">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterAreaId}
                onChange={(e) => setFilterAreaId(e.target.value)}
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

            <div className="flex items-center gap-2 flex-1 min-w-[200px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar código o texto del requisito..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            onClick={handleStartCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/25 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Numeral</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar text-xs">
          {editingNumeralId && (
            <form onSubmit={handleSaveForm} className="bg-slate-950 border border-indigo-500/30 rounded-2xl p-5 space-y-4 animate-fadeIn shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {editingNumeralId === 'new' ? 'Registrar Nuevo Numeral' : 'Editar Numeral y Áreas Asignadas'}
                </h4>
                <button type="button" onClick={handleCancelForm} className="text-slate-500 hover:text-slate-300">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Código / Numeral:</label>
                  <input
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Ej. 4.1.1"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-indigo-300 font-mono font-bold focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Texto del Requisito:</label>
                  <input
                    type="text"
                    value={requisito}
                    onChange={(e) => setRequisito(e.target.value)}
                    placeholder="Texto completo de la exigencia ISO/IEC 17025..."
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-2">
                  Seleccione las Áreas o Equipos que deben auditar este numeral:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  {(areas || []).map(a => {
                    const isChecked = selectedAreaIds.includes(a.id);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => handleToggleAreaCheckbox(a.id)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs transition-all ${
                          isChecked 
                            ? 'bg-indigo-600/25 text-indigo-200 border border-indigo-500/40 font-semibold shadow-sm' 
                            : 'text-slate-400 hover:bg-slate-800 border border-transparent'
                        }`}
                      >
                        {isChecked ? <CheckSquare className="w-4 h-4 text-indigo-400 shrink-0" /> : <Square className="w-4 h-4 text-slate-600 shrink-0" />}
                        <span className="truncate">{a.nombre}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1 border-t border-slate-800">
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
                  <span>Guardar Numeral</span>
                </button>
              </div>
            </form>
          )}

          {/* Tabla de Numerales Mapeados */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-3 px-4 w-28">Código</th>
                  <th className="py-3 px-4">Requisito ISO/IEC 17025</th>
                  <th className="py-3 px-4 w-64">Áreas Asignadas</th>
                  <th className="py-3 px-4 w-20 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 font-sans">
                {filteredMapeo.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500 italic">
                      No se encontraron numerales con el filtro actual.
                    </td>
                  </tr>
                ) : (
                  filteredMapeo.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-900/40 transition-colors align-top">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                        {n.codigo}
                      </td>
                      <td className="py-3.5 px-4 text-slate-200 leading-relaxed">
                        {n.requisito}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(n.areaIds || []).map(aId => {
                            const aObj = (areas || []).find(a => a.id === aId);
                            if (!aObj) return null;
                            return (
                              <span key={aId} className="px-2 py-0.5 rounded-lg bg-indigo-600/15 text-indigo-300 border border-indigo-500/20 text-[10.5px] font-medium">
                                {aObj.nombre}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleStartEdit(n)}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-all"
                            title="Editar numeral y asignación de áreas"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteNumeral(n.id)}
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

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-400 font-mono">
            {filteredMapeo.length} numerales listados
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
