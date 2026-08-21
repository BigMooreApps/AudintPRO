import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight, 
  TrendingUp, 
  FileText, 
  Layers, 
  Check, 
  CheckCheck,
  Eye, 
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  UserCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import AuditResultDetailModal from './AuditResultDetailModal';

export default function MainAreaDashboard({
  areas = [],
  mapeoNumerales = [],
  evaluationsHistory = {},
  onStartAuditForArea,
  onNavigateToAudit,
  onOpenCompromisosModal,
  currentUser
}) {
  const isAuditor = currentUser?.role === 'AUDITOR' && !!currentUser.areaId;
  const [selectedAreaId, setSelectedAreaId] = useState(isAuditor ? currentUser.areaId : 'ALL');
  const [selectedDetailNumeral, setSelectedDetailNumeral] = useState(null);

  useEffect(() => {
    if (isAuditor) {
      setSelectedAreaId(currentUser.areaId);
    }
  }, [currentUser, isAuditor]);

  // Estado para colapsar/expandir la sección de áreas
  const [isAreaSectionExpanded, setIsAreaSectionExpanded] = useState(true);

  // Filtros interactivos para la tabla de numerales del Dashboard
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const [tableFilterEstado, setTableFilterEstado] = useState('ALL'); // 'ALL' | 'CUMPLE' | 'SUBSANADO' | 'NO_CUMPLE' | 'PENDIENTE_APROBAR' | 'PENDIENTE'

  // Cálculos estadísticos globales y por área
  const dashboardData = useMemo(() => {
    const areaStats = areas.map(area => {
      const assignedNumerals = mapeoNumerales.filter(n => (n.areaIds || []).includes(area.id));
      const total = assignedNumerals.length;

      let evaluados = 0;
      let conformes = 0;
      let noConformes = 0;
      let observaciones = 0;
      let subsanados = 0;
      let pendientes = 0;

      assignedNumerals.forEach(num => {
        const evalItem = evaluationsHistory[num.codigo] || evaluationsHistory[num.id];
        
        // Si el compromiso fue subsanado
        if (evalItem && evalItem.estadoCompromiso === 'SUBSANADO') {
          subsanados++;
          evaluados++;
          conformes++;
        } else if (evalItem && evalItem.auditorConfirmado === true) {
          evaluados++;
          const est = (evalItem.estado || '').toUpperCase();
          if (est === 'CUMPLE') conformes++;
          else if (est === 'NO CUMPLE') noConformes++;
          else if (est === 'OBSERVACION') observaciones++;
          else conformes++;
        } else {
          pendientes++;
        }
      });

      const pctAvance = total > 0 ? Math.round((evaluados / total) * 100) : 0;
      const pctConformidad = evaluados > 0 ? Math.round((conformes / evaluados) * 100) : 0;

      return {
        area,
        total,
        evaluados,
        conformes,
        noConformes,
        observaciones,
        subsanados,
        pendientes,
        pctAvance,
        pctConformidad,
        assignedNumerals
      };
    });

    // Totales globales
    const targetNumerals = isAuditor
      ? mapeoNumerales.filter(n => (n.areaIds || []).includes(currentUser.areaId))
      : mapeoNumerales;

    const totalGlobalNumerals = targetNumerals.length;
    let globalEvaluados = 0;
    let globalConformes = 0;
    let globalNoConformes = 0;
    let globalObservaciones = 0;
    let globalSubsanados = 0;
    let globalPendientes = 0;

    targetNumerals.forEach(num => {
      const evalItem = evaluationsHistory[num.codigo] || evaluationsHistory[num.id];
      
      if (evalItem && evalItem.estadoCompromiso === 'SUBSANADO') {
        globalSubsanados++;
        globalEvaluados++;
        globalConformes++;
      } else if (evalItem && evalItem.auditorConfirmado === true) {
        globalEvaluados++;
        const est = (evalItem.estado || '').toUpperCase();
        if (est === 'CUMPLE') globalConformes++;
        else if (est === 'NO CUMPLE') globalNoConformes++;
        else if (est === 'OBSERVACION') globalObservaciones++;
        else globalConformes++;
      } else {
        globalPendientes++;
      }
    });

    const globalPctAvance = totalGlobalNumerals > 0 ? Math.round((globalEvaluados / totalGlobalNumerals) * 100) : 0;
    const globalPctConformidad = globalEvaluados > 0 ? Math.round((globalConformes / globalEvaluados) * 100) : 0;

    return {
      areaStats,
      global: {
        total: totalGlobalNumerals,
        evaluados: globalEvaluados,
        conformes: globalConformes,
        noConformes: globalNoConformes,
        observaciones: globalObservaciones,
        subsanados: globalSubsanados,
        pendientes: globalPendientes,
        pctAvance: globalPctAvance,
        pctConformidad: globalPctConformidad
      }
    };
  }, [areas, mapeoNumerales, evaluationsHistory, isAuditor, currentUser]);

  // Alerta de Tareas y Fechas de Revisión
  const compromisosAlertStats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    let total = 0;
    let vencidos = 0;
    let proximos = 0;

    const scopedNumerals = isAuditor
      ? mapeoNumerales.filter(n => (n.areaIds || []).includes(currentUser.areaId))
      : mapeoNumerales;

    scopedNumerals.forEach(num => {
      const evalItem = evaluationsHistory[num.codigo] || evaluationsHistory[num.id];
      if (!evalItem) return;

      const estadoNorma = (evalItem.estado || '').toUpperCase();
      if ((estadoNorma === 'NO CUMPLE' || estadoNorma === 'OBSERVACION' || evalItem.fechaCompromiso) && evalItem.estadoCompromiso !== 'SUBSANADO') {
        total++;
        if (evalItem.fechaCompromiso) {
          const targetDate = new Date(evalItem.fechaCompromiso + 'T00:00:00');
          const todayDate = new Date(todayStr + 'T00:00:00');
          const diffTime = targetDate - todayDate;
          const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (dias < 0) vencidos++;
          else if (dias <= 7) proximos++;
        }
      }
    });

    return { total, vencidos, proximos };
  }, [evaluationsHistory, mapeoNumerales, isAuditor, currentUser]);

  // Área activa seleccionada
  const activeAreaStat = useMemo(() => {
    const targetId = isAuditor ? currentUser.areaId : selectedAreaId;
    if (targetId === 'ALL') return null;
    return dashboardData.areaStats.find(a => a.area.id === targetId) || null;
  }, [selectedAreaId, dashboardData, isAuditor, currentUser]);

  // Lista base según el área seleccionada
  const baseAreaNumerals = useMemo(() => {
    const targetId = isAuditor ? currentUser.areaId : selectedAreaId;
    if (targetId === 'ALL') {
      return mapeoNumerales;
    }
    return mapeoNumerales.filter(n => (n.areaIds || []).includes(targetId));
  }, [selectedAreaId, mapeoNumerales, isAuditor, currentUser]);

  // Lista filtrada para la tabla inferior con búsqueda y estado
  const filteredTableNumerals = useMemo(() => {
    return baseAreaNumerals.filter(num => {
      const evalItem = evaluationsHistory[num.codigo] || evaluationsHistory[num.id];
      const isSubsanado = evalItem?.estadoCompromiso === 'SUBSANADO';
      const isConfirmed = evalItem?.auditorConfirmado === true;
      const estado = evalItem ? (evalItem.estado || 'CUMPLE').toUpperCase() : 'PENDIENTE';

      // Filtro por Estado Auditoría
      if (tableFilterEstado === 'CUMPLE' && (!isConfirmed || estado !== 'CUMPLE' || isSubsanado)) return false;
      if (tableFilterEstado === 'SUBSANADO' && !isSubsanado) return false;
      if (tableFilterEstado === 'NO_CUMPLE' && (!isConfirmed || estado !== 'NO CUMPLE' || isSubsanado)) return false;
      if (tableFilterEstado === 'PENDIENTE_APROBAR' && (!evalItem || isConfirmed || isSubsanado)) return false;
      if (tableFilterEstado === 'PENDIENTE' && (evalItem || isSubsanado)) return false;

      // Filtro de Búsqueda
      if (tableSearchTerm.trim()) {
        const term = tableSearchTerm.toLowerCase();
        const matchCode = (num.codigo || '').toLowerCase().includes(term);
        const matchReq = (num.requisito || '').toLowerCase().includes(term);
        if (!matchCode && !matchReq) return false;
      }

      return true;
    });
  }, [baseAreaNumerals, evaluationsHistory, tableFilterEstado, tableSearchTerm]);

  // SVG Circular Chart metrics
  const activePct = activeAreaStat ? activeAreaStat.pctAvance : dashboardData.global.pctAvance;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (activePct / 100) * circumference;

  // Numeral activo para el modal de detalle
  const activeDetailEvalItem = selectedDetailNumeral
    ? evaluationsHistory[selectedDetailNumeral.codigo] || evaluationsHistory[selectedDetailNumeral.id] || null
    : null;

  // Áreas visibles en el grid
  const visibleAreaStats = useMemo(() => {
    if (isAuditor) {
      return dashboardData.areaStats.filter(item => item.area.id === currentUser.areaId);
    }
    return dashboardData.areaStats;
  }, [dashboardData.areaStats, isAuditor, currentUser]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* ========================================================
          HERO BANNER PRINCIPAL: PANEL DE INICIO
         ======================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isAuditor ? currentUser.areaNombre : 'Avance de Auditoría por Áreas'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isAuditor 
              ? `Supervise los ${baseAreaNumerals.length} numerales asignados a su equipo según el mapeo de la norma ISO/IEC 17025.`
              : 'Supervise en tiempo real el cumplimiento y avance de los numerales asignados a cada equipo auditor y área del laboratorio.'}
          </p>
        </div>
      </div>

      {/* ========================================================
          TARJETAS KPI DINÁMICAS (5 TARJETAS CON SUBSANADOS)
         ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* KPI 1: Avance % Confirmado */}
        <div className="bg-slate-900/90 border border-indigo-500/20 hover:border-indigo-500/40 rounded-3xl p-4 sm:p-5 shadow-xl flex items-center justify-between transition-all group">
          <div className="space-y-1">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Avance</span>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono flex items-baseline gap-1">
              <span>{activePct}%</span>
              <span className="text-[11px] text-slate-500 font-normal">
                ({activeAreaStat ? activeAreaStat.evaluados : dashboardData.global.evaluados}/{activeAreaStat ? activeAreaStat.total : dashboardData.global.total})
              </span>
            </div>
            <div className="w-28 sm:w-32 bg-slate-950 h-2 rounded-full overflow-hidden mt-2 border border-slate-800">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${activePct}%` }}
              />
            </div>
          </div>

          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={radius} stroke="#1e293b" strokeWidth="8" fill="transparent" />
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="url(#kpiGradient)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="kpiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <TrendingUp className="w-4 h-4 text-indigo-400 absolute" />
          </div>
        </div>

        {/* KPI 2: Conformes (CUMPLE) */}
        <div className="bg-slate-900/90 border border-emerald-500/20 hover:border-emerald-500/40 rounded-3xl p-4 sm:p-5 shadow-xl flex items-center justify-between transition-all group">
          <div className="space-y-1">
            <span className="text-[10.5px] font-bold text-emerald-400 uppercase tracking-wider">Conformes (Cumple)</span>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono flex items-baseline gap-1">
              <span className="text-emerald-400">
                {activeAreaStat ? activeAreaStat.conformes : dashboardData.global.conformes}
              </span>
              <span className="text-[11px] text-slate-500 font-normal">
                {activeAreaStat?.evaluados > 0 
                  ? `${Math.round((activeAreaStat.conformes / activeAreaStat.evaluados) * 100)}%`
                  : dashboardData.global.evaluados > 0
                  ? `${Math.round((dashboardData.global.conformes / dashboardData.global.evaluados) * 100)}%`
                  : '0%'}
              </span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Subsanados (Acción Cerrada) */}
        <div className="bg-slate-900/90 border border-teal-500/20 hover:border-teal-500/40 rounded-3xl p-4 sm:p-5 shadow-xl flex items-center justify-between transition-all group">
          <div className="space-y-1">
            <span className="text-[10.5px] font-bold text-teal-400 uppercase tracking-wider">Subsanados</span>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono flex items-baseline gap-1">
              <span className="text-teal-300">
                {activeAreaStat ? activeAreaStat.subsanados : dashboardData.global.subsanados}
              </span>
              <span className="text-[11px] text-slate-500 font-normal">
                cerrados
              </span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-300 border border-teal-500/20 shrink-0 shadow-lg shadow-teal-500/10">
            <CheckCheck className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: No Conformes (NO CUMPLE) */}
        <div className="bg-slate-900/90 border border-rose-500/20 hover:border-rose-500/40 rounded-3xl p-4 sm:p-5 shadow-xl flex items-center justify-between transition-all group">
          <div className="space-y-1">
            <span className="text-[10.5px] font-bold text-rose-400 uppercase tracking-wider">No Conformes</span>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono flex items-baseline gap-1">
              <span className="text-rose-400">
                {activeAreaStat ? activeAreaStat.noConformes : dashboardData.global.noConformes}
              </span>
              <span className="text-[11px] text-slate-500 font-normal">
                hallazgos
              </span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0 shadow-lg shadow-rose-500/10">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 5: Pendientes de Aprobar */}
        <div className="bg-slate-900/90 border border-amber-500/20 hover:border-amber-500/40 rounded-3xl p-4 sm:p-5 shadow-xl flex items-center justify-between transition-all group">
          <div className="space-y-1">
            <span className="text-[10.5px] font-bold text-amber-400 uppercase tracking-wider">Pendientes</span>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono flex items-baseline gap-1">
              <span className="text-amber-400">
                {activeAreaStat ? activeAreaStat.pendientes : dashboardData.global.pendientes}
              </span>
              <span className="text-[11px] text-slate-500 font-normal">
                por validar
              </span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 shadow-lg shadow-amber-500/10">
            <Clock className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* ========================================================
          TARJETAS DE AVANCE POR ÁREA (GRID DINÁMICO COLAPSABLE)
         ======================================================== */}
      <div className={`bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl transition-all ${
        isAreaSectionExpanded ? 'p-6 sm:p-7 space-y-6' : 'p-4 sm:p-5'
      }`}>
        <div 
          onClick={() => setIsAreaSectionExpanded(!isAreaSectionExpanded)}
          className="flex flex-wrap items-center justify-between gap-4 cursor-pointer select-none group"
          title="Haga clic para expandir o reducir esta sección"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-all">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                {isAuditor ? `Área de Auditoría Asignada: ${currentUser.areaNombre}` : 'Estado y Avance por Cada Área de Auditoría'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAuditor ? 'Área asignada para auditar y validar requisitos' : 'Haga clic en cualquier área para auditarla o ver sus numerales'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-semibold text-slate-400">
              {visibleAreaStats.length} {visibleAreaStats.length === 1 ? 'Área Asignada' : 'Áreas Configuradas'}
            </span>
            <div className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 group-hover:text-white group-hover:border-slate-700 transition-all">
              {isAreaSectionExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {isAreaSectionExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2 border-t border-slate-800 animate-fadeIn">
            {visibleAreaStats.map((item) => {
              const isSelected = !isAuditor && selectedAreaId === item.area.id;

              return (
                <div
                  key={item.area.id}
                  onClick={() => !isAuditor && setSelectedAreaId(item.area.id)}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60 cursor-pointer'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11px] font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                        {item.pctAvance}%
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                      {item.area.nombre}
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {/* Progress bar */}
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden flex">
                      <div 
                        style={{ width: `${item.pctAvance}%` }} 
                        className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
                      />
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartAuditForArea(item.area.id);
                      }}
                      className="w-full py-1.5 px-3 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-xl text-[10.5px] font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>Auditar Área</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================
          TABLA DE NUMERALES ASIGNADOS CON FILTROS DINÁMICOS
         ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
        
        {/* Encabezado de la tabla */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Numerales Asignados: {selectedAreaId === 'ALL' ? 'Todas las Áreas' : activeAreaStat?.area.nombre}
              </h3>
              <p className="text-xs text-slate-400">
                Haga clic en cualquier numeral para ver su informe técnico de IA, plan de acción y dictamen del auditor
              </p>
            </div>
          </div>

          <span className="text-xs font-mono font-semibold text-slate-400">
            {filteredTableNumerals.length} de {baseAreaNumerals.length} Numerales
          </span>
        </div>

        {/* BARRA DE FILTROS Y BÚSQUEDA INTERACTIVA */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
          
          {/* Buscador de texto o código */}
          <div className="flex-1 min-w-[220px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código (ej. 4.1.1) o texto..."
              value={tableSearchTerm}
              onChange={(e) => setTableSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filtro por Estado Auditoría */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={tableFilterEstado}
              onChange={(e) => setTableFilterEstado(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-indigo-300 font-semibold focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="CUMPLE">✓ Conformes (CUMPLE)</option>
              <option value="SUBSANADO">✓ Subsanados (Cerrados)</option>
              <option value="NO_CUMPLE">✕ No Conformes (NO CUMPLE)</option>
              <option value="PENDIENTE_APROBAR">⏳ Pendientes por Aprobar</option>
              <option value="PENDIENTE">⚪ Sin Evaluar (Pendiente)</option>
            </select>
          </div>

        </div>

        {/* Tabla de Numerales */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-semibold">
                  <th className="py-3 px-4 w-28">Código</th>
                  <th className="py-3 px-4">Requisito Normativo</th>
                  <th className="py-3 px-4 w-60">Áreas Responsables</th>
                  <th className="py-3 px-4 w-52 text-center">Estado Auditoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredTableNumerals.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500 italic">
                      No se encontraron numerales con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredTableNumerals.map((num) => {
                    const evalItem = evaluationsHistory[num.codigo] || evaluationsHistory[num.id];
                    const isSubsanado = evalItem?.estadoCompromiso === 'SUBSANADO';
                    const isConfirmed = evalItem?.auditorConfirmado === true;
                    const estado = evalItem ? (evalItem.estado || 'CUMPLE').toUpperCase() : 'PENDIENTE';

                    return (
                      <tr 
                        key={num.id} 
                        onClick={() => setSelectedDetailNumeral(num)}
                        className="hover:bg-indigo-950/25 cursor-pointer transition-colors group select-none"
                        title="Haga clic para ver el informe detallado de auditoría"
                      >
                        <td className="py-3.5 px-4 align-top font-mono font-bold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-indigo-400 transition-opacity" />
                          <span>{num.codigo}</span>
                        </td>
                        <td className="py-3.5 px-4 align-top text-slate-200 group-hover:text-white leading-relaxed">
                          {num.requisito}
                        </td>
                        <td className="py-3.5 px-4 align-top">
                          <div className="flex flex-wrap gap-1">
                            {(num.areaIds || []).map(aId => {
                              const areaObj = areas.find(a => a.id === aId);
                              if (!areaObj) return null;
                              return (
                                <span
                                  key={aId}
                                  className="px-2 py-0.5 rounded-lg bg-indigo-600/15 text-indigo-300 border border-indigo-500/20 text-[10.5px] font-medium"
                                >
                                  {areaObj.nombre}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 align-top text-center">
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
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Interactivo de Ficha de Auditoría al hacer clic en un numeral */}
      <AuditResultDetailModal
        isOpen={!!selectedDetailNumeral}
        onClose={() => setSelectedDetailNumeral(null)}
        numeral={selectedDetailNumeral}
        evalItem={activeDetailEvalItem}
        areas={areas}
        onStartAuditForNumeral={(num) => {
          setSelectedDetailNumeral(null);
          if (onStartAuditForArea) {
            onStartAuditForArea(selectedAreaId);
          }
        }}
      />

    </div>
  );
}
