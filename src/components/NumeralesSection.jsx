import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trash2, 
  FileText, 
  Check, 
  CheckCheck, 
  CheckSquare, 
  Square, 
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const TITULOS_GRUPOS = {
  '4.1': '4.1 Imparcialidad',
  '4.2': '4.2 Confidencialidad',
  '5.1': '5.1 Entidad legal',
  '5.2': '5.2 Personal de dirección',
  '5.3': '5.3 Alcance de actividades',
  '5.4': '5.4 Instalaciones y cumplimiento',
  '5.5': '5.5 Organización y estructura',
  '5.6': '5.6 Autoridad y recursos',
  '5.7': '5.7 Comunicación e integridad',
  '6.1': '6.1 Generalidades',
  '6.2': '6.2 Personal',
  '6.3': '6.3 Instalaciones y ambiente',
  '6.4': '6.4 Equipamiento',
  '6.5': '6.5 Trazabilidad metrológica',
  '6.6': '6.6 Compras y proveedores externos',
  '7.1': '7.1 Solicitudes, ofertas y contratos',
  '7.2': '7.2 Métodos y validación',
  '7.3': '7.3 Muestreo',
  '7.4': '7.4 Manipulación de ítems',
  '7.5': '7.5 Registros técnicos',
  '7.6': '7.6 Incertidumbre de medición',
  '7.7': '7.7 Aseguramiento de la validez',
  '7.8': '7.8 Informe de resultados',
  '7.9': '7.9 Quejas',
  '7.10': '7.10 Trabajo no conforme',
  '7.11': '7.11 Control de datos y LIMS',
  '8.1': '8.1 Opciones de gestión',
  '8.2': '8.2 Documentación del sistema',
  '8.3': '8.3 Control de documentos',
  '8.4': '8.4 Control de registros',
  '8.5': '8.5 Riesgos y oportunidades',
  '8.6': '8.6 Mejora',
  '8.7': '8.7 Acciones correctivas',
  '8.8': '8.8 Auditorías internas',
  '8.9': '8.9 Revisiones por la dirección'
};

function AutoResizeTextarea({ value, onChange, placeholder, className }) {
  const textareaRef = React.useRef(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(42, textareaRef.current.scrollHeight)}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      rows={1}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`${className} overflow-hidden resize-none transition-all duration-150`}
    />
  );
}

export default function NumeralesSection({
  numerales,
  setNumerales,
  onNextStep,
  areas = [],
  mapeoNumerales = [],
  selectedAreaId: externalSelectedAreaId = 'ALL',
  onSelectAreaId,
  evaluationsHistory = {},
  currentUser
}) {
  const isAuditor = currentUser?.role === 'AUDITOR' && !!currentUser.areaId;
  const initialAreaId = isAuditor ? currentUser.areaId : externalSelectedAreaId;
  const [selectedAreaId, setSelectedAreaId] = useState(initialAreaId);
  const [selectedGroupId, setSelectedGroupId] = useState('ALL');
  const [auditMode, setAuditMode] = useState('ALL'); // 'ALL' = todos los numerales del filtro, 'CUSTOM' = selección manual
  const [selectedNumeralIds, setSelectedNumeralIds] = useState([]);

  // Estado para expandir/reducir la sección completa de numerales (idéntico al Dashboard)
  const [isTableSectionExpanded, setIsTableSectionExpanded] = useState(false);

  // Estado para expandir/reducir filas individuales
  const [expandedRows, setExpandedRows] = useState({});

  // Sincronizar automáticamente si cambia el área seleccionada desde el Dashboard de Inicio
  useEffect(() => {
    const targetArea = isAuditor ? currentUser.areaId : externalSelectedAreaId;
    if (targetArea) {
      setSelectedAreaId(targetArea);
      setSelectedGroupId('ALL');
      
      let filtered = targetArea === 'ALL'
        ? mapeoNumerales.map(n => ({ ...n }))
        : mapeoNumerales.filter(n => (n.areaIds || []).includes(targetArea)).map(n => ({ ...n }));
      
      setNumerales(filtered);
      setSelectedNumeralIds(filtered.map(n => n.id));
      setAuditMode('ALL');
    }
  }, [externalSelectedAreaId, mapeoNumerales, isAuditor, currentUser]);

  // Helper para extraer la clave de grupo de un código (ej. "4.1.1" -> "4.1", "5.5 a)" -> "5.5")
  const getGroupKey = (codigo) => {
    if (!codigo) return 'OTHER';
    const match = codigo.match(/^(\d+\.\d+)/);
    return match ? match[1] : 'OTHER';
  };

  // Obtener los numerales base según el área seleccionada
  const baseNumeralsByArea = useMemo(() => {
    if (selectedAreaId === 'ALL') {
      return mapeoNumerales.map(n => ({ ...n }));
    }
    return mapeoNumerales
      .filter(n => (n.areaIds || []).includes(selectedAreaId))
      .map(n => ({ ...n }));
  }, [selectedAreaId, mapeoNumerales]);

  // Grupos disponibles presentes en los numerales del área seleccionada
  const availableGroups = useMemo(() => {
    const groupKeys = new Set();
    baseNumeralsByArea.forEach(n => {
      groupKeys.add(getGroupKey(n.codigo));
    });
    
    return Array.from(groupKeys).map(key => ({
      key,
      label: TITULOS_GRUPOS[key] || `Numerales ${key}`
    })).sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }));
  }, [baseNumeralsByArea]);

  // Actualizar lista cuando cambia el Área o el Grupo
  const applyFilters = (areaId, groupId) => {
    let filtered = areaId === 'ALL'
      ? mapeoNumerales.map(n => ({ ...n }))
      : mapeoNumerales.filter(n => (n.areaIds || []).includes(areaId)).map(n => ({ ...n }));

    if (groupId !== 'ALL') {
      filtered = filtered.filter(n => getGroupKey(n.codigo) === groupId);
    }

    setNumerales(filtered);
    setSelectedNumeralIds(filtered.map(n => n.id));
    setAuditMode('ALL');
  };

  // Cambio de Grupo de Numerales
  const handleSelectGroup = (groupId) => {
    setSelectedGroupId(groupId);
    applyFilters(selectedAreaId, groupId);
  };

  // Mantener sincronizados los seleccionados por defecto cuando cambia la lista de numerales
  useEffect(() => {
    if (auditMode === 'ALL') {
      setSelectedNumeralIds(numerales.map(n => n.id));
    }
  }, [numerales, auditMode]);

  // Toggle individual numeral checkbox
  const handleToggleNumeralSelect = (id) => {
    setAuditMode('CUSTOM');
    if (selectedNumeralIds.includes(id)) {
      setSelectedNumeralIds(selectedNumeralIds.filter(i => i !== id));
    } else {
      setSelectedNumeralIds([...selectedNumeralIds, id]);
    }
  };

  // Toggle select all / unselect all
  const handleToggleSelectAll = () => {
    if (selectedNumeralIds.length === numerales.length) {
      setSelectedNumeralIds([]);
      setAuditMode('CUSTOM');
    } else {
      setSelectedNumeralIds(numerales.map(n => n.id));
      setAuditMode('ALL');
    }
  };

  // Manejo de expandir / reducir individual y global
  const isRowExpanded = (id) => !!expandedRows[id];

  const handleToggleRowExpand = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const areAllExpanded = numerales.length > 0 && numerales.every(n => !!expandedRows[n.id]);

  const handleToggleExpandAll = () => {
    if (areAllExpanded) {
      setExpandedRows({});
    } else {
      const allExp = {};
      numerales.forEach(n => { allExp[n.id] = true; });
      setExpandedRows(allExp);
    }
  };

  // Actualizar campo de fila
  const handleUpdateRow = (id, field, value) => {
    setNumerales(
      numerales.map(n => (n.id === id ? { ...n, [field]: value } : n))
    );
  };

  // Filtrar los numerales que están activos para la auditoría
  const activeSelectedNumerales = numerales.filter(n => selectedNumeralIds.includes(n.id));

  const handleProceedToStep2 = () => {
    if (activeSelectedNumerales.length === 0) {
      alert('Por favor seleccione al menos un subnumeral para auditar.');
      return;
    }
    // Asegurar que solo los numerales seleccionados pasen a los siguientes pasos
    setNumerales(activeSelectedNumerales);
    onNextStep();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>Paso 1: Configuración y Asignación de Numerales ISO por Área y Grupo</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Seleccione opcionalmente el Grupo de numerales para auditar (ej. solo 4.1, 4.2, 6.4, etc.).
          </p>
        </div>

        {activeSelectedNumerales.length > 0 && (
          <button
            onClick={handleProceedToStep2}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95 shrink-0"
          >
            <span>Continuar al Paso 2: Cargar Evidencias ({activeSelectedNumerales.length} activos)</span>
            <Check className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Area & Group Scope Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          
          {/* Área Seleccionada (Fijada desde el Dashboard) */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">
              Área de Auditoría en Curso:
            </label>
            <div className="bg-slate-950 border border-indigo-500/30 rounded-xl px-4 py-2.5 flex items-center shadow-inner">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white">
                  {areas.find(a => a.id === selectedAreaId)?.nombre || 'Todas las Áreas del Laboratorio'}
                </span>
              </div>
            </div>
          </div>

          {/* Desplegable: Grupo de Numerales */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Filtrar por Grupo de Numerales:
            </label>
            <select
              value={selectedGroupId}
              onChange={(e) => handleSelectGroup(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-indigo-300 font-semibold focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Todos los Grupos</option>
              {availableGroups.map(g => (
                <option key={g.key} value={g.key}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* ========================================================
          TABLA DE NUMERALES ASIGNADOS (COLAPSABLE / EXPANDIBLE ESTILO DASHBOARD)
         ======================================================== */}
      <div className={`bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl transition-all ${
        isTableSectionExpanded ? 'p-6 sm:p-7 space-y-4' : 'p-4 sm:p-5'
      }`}>
        
        {/* Encabezado colapsable idéntico al Dashboard */}
        <div 
          onClick={() => setIsTableSectionExpanded(!isTableSectionExpanded)}
          className="flex flex-wrap items-center justify-between gap-4 cursor-pointer select-none group"
          title="Haga clic para expandir o reducir esta sección"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 group-hover:bg-teal-500/20 group-hover:text-teal-300 transition-all">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                Numerales Asignados: {areas.find(a => a.id === selectedAreaId)?.nombre || 'Todas las Áreas'}
              </h3>
              <p className="text-xs text-slate-400">
                Seleccione o configure los subnumerales que formarán parte de esta sesión de auditoría
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-semibold text-slate-400">
              {activeSelectedNumerales.length} de {numerales.length} Numerales
            </span>
            <div className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 group-hover:text-white group-hover:border-slate-700 transition-all">
              {isTableSectionExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>

        {/* Contenido desplegable cuando la sección está expandida */}
        {isTableSectionExpanded && (
          <div className="space-y-4 pt-2 border-t border-slate-800/80 animate-fadeIn">
            <div className="px-1 py-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleToggleSelectAll}
                  className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  title="Seleccionar o deseleccionar todos"
                >
                  {selectedNumeralIds.length === numerales.length && numerales.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500" />
                  )}
                  <span>{selectedNumeralIds.length === numerales.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}</span>
                </button>
                
                <span className="text-slate-600 hidden sm:inline">•</span>

                {/* Botón Global para Expandir / Reducir Filas de Requisitos */}
                <button
                  onClick={handleToggleExpandAll}
                  className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/80 font-medium transition-all shadow-sm"
                  title={areAllExpanded ? 'Reducir filas de requisitos' : 'Expandir filas de requisitos'}
                >
                  {areAllExpanded ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Reducir Filas</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Expandir Filas</span>
                    </>
                  )}
                </button>

                <span className="text-xs text-slate-400">
                  ({selectedNumeralIds.length} de {numerales.length} seleccionados para auditar)
                </span>
              </div>
            </div>

            {numerales.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30 text-indigo-400" />
                <p className="text-sm font-semibold text-slate-300">No hay numerales para este filtro de Área y Grupo.</p>
                <p className="text-xs mt-1 text-slate-400">
                  Seleccione otro grupo o área para cargar los subnumerales correspondientes.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-800/80 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-medium">
                      <th className="py-3 px-2 w-10 text-center align-middle"></th>
                      <th className="py-3 px-3 w-12 text-center align-middle">Auditar</th>
                      <th className="py-3 px-4 w-32 align-middle">Código / Subnumeral</th>
                      <th className="py-3 px-4 align-middle">Texto del Requisito</th>
                      <th className="py-3 px-4 w-44 text-center align-middle">Estado Auditoría</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {numerales.map((row) => {
                      const isChecked = selectedNumeralIds.includes(row.id);
                      const isExpanded = isRowExpanded(row.id);
                      const evalItem = evaluationsHistory[row.codigo] || evaluationsHistory[row.id];
                      const isSubsanado = evalItem?.estadoCompromiso === 'SUBSANADO';
                      const isConfirmed = evalItem?.auditorConfirmado === true;
                      const estado = evalItem ? (evalItem.estado || 'CUMPLE').toUpperCase() : 'PENDIENTE';

                      return (
                        <tr
                          key={row.id}
                          className={`transition-colors ${
                            isChecked ? 'bg-indigo-950/20 hover:bg-indigo-950/30' : 'opacity-60 hover:bg-slate-800/30'
                          }`}
                        >
                          {/* Botón de expandir / reducir individual */}
                          <td className="py-3 px-2 text-center align-middle">
                            <button
                              type="button"
                              onClick={() => handleToggleRowExpand(row.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              title={isExpanded ? 'Reducir numeral' : 'Expandir numeral para editar'}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-indigo-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </td>

                          {/* Checkbox */}
                          <td className="py-3 px-3 text-center align-middle">
                            <button
                              type="button"
                              onClick={() => handleToggleNumeralSelect(row.id)}
                              className="p-1 text-slate-400 hover:text-indigo-400 transition-colors"
                            >
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-indigo-400" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-600" />
                              )}
                            </button>
                          </td>

                          {/* Código */}
                          <td className="py-3 px-4 align-middle">
                            {isExpanded ? (
                              <input
                                type="text"
                                value={row.codigo}
                                onChange={(e) => handleUpdateRow(row.id, 'codigo', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-indigo-300 font-semibold focus:outline-none focus:border-indigo-500 font-mono"
                                placeholder="Ej. 4.1.1"
                              />
                            ) : (
                              <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-indigo-300 font-mono font-bold inline-block">
                                {row.codigo}
                              </span>
                            )}
                          </td>

                          {/* Requisito: Reducido vs Expandido */}
                          <td className="py-3 px-4 align-middle">
                            {isExpanded ? (
                              <div className="space-y-1.5">
                                <AutoResizeTextarea
                                  value={row.requisito}
                                  onChange={(e) => handleUpdateRow(row.id, 'requisito', e.target.value)}
                                  className="w-full bg-slate-950 border border-indigo-500/50 rounded-lg px-3 py-2 text-xs text-white leading-relaxed focus:outline-none focus:border-indigo-400 shadow-inner"
                                  placeholder="Ingrese la exigencia técnica del subnumeral..."
                                />
                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleRowExpand(row.id)}
                                    className="text-[11px] font-semibold text-slate-400 hover:text-indigo-300 flex items-center gap-1"
                                  >
                                    <ChevronUp className="w-3 h-3" />
                                    <span>Reducir</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div 
                                onClick={() => handleToggleRowExpand(row.id)}
                                className="cursor-pointer group flex items-center justify-between gap-3 bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-indigo-500/40 rounded-xl px-3.5 py-2 transition-all"
                                title="Haga clic para expandir y ver o editar el requisito completo"
                              >
                                <p className="text-xs text-slate-300 truncate max-w-2xl font-normal group-hover:text-white leading-tight">
                                  {row.requisito || <span className="italic text-slate-500">Sin texto de requisito definido</span>}
                                </p>
                                <span className="text-[11px] text-indigo-400 group-hover:text-indigo-300 font-semibold shrink-0 flex items-center gap-1 opacity-80 group-hover:opacity-100">
                                  <span>Expandir</span>
                                  <ChevronDown className="w-3 h-3" />
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Estado Auditoría (Idéntico al Dashboard) */}
                          <td className="py-3 px-4 align-middle text-center">
                            {isSubsanado ? (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold border inline-flex items-center gap-1.5 shadow-sm bg-teal-500/20 text-teal-300 border-teal-500/40">
                                <CheckCheck className="w-3.5 h-3.5 text-teal-300" />
                                <span>SUBSANADO (Cerrado)</span>
                              </span>
                            ) : isConfirmed ? (
                              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-flex items-center gap-1.5 shadow-sm ${
                                estado === 'CUMPLE'
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                  : estado === 'NO CUMPLE'
                                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                  : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              }`}>
                                <Check className="w-3 h-3" />
                                <span>{estado} (Validado)</span>
                              </span>
                            ) : evalItem ? (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/25 inline-flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>Pendiente por Aprobar</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-900 text-slate-500 border border-slate-800 inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Pendiente</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
