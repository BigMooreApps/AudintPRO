import React, { useState, useMemo } from 'react';
import { 
  PieChart, 
  Bot, 
  ChevronDown, 
  ChevronRight, 
  ChevronsUpDown, 
  ChevronsDownUp, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Check, 
  MessageSquare,
  Save,
  ArrowRight,
  Calendar,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { compareNumeralCodes } from '../data/defaultMapeo';

export default function ResultadosDashboard({ 
  auditResult, 
  numerales, 
  evidencias, 
  selectedAgent, 
  onUpdateEvaluationsHistory,
  onSaveDraft,
  onSaveDefinitive
}) {
  const [expandedMap, setExpandedMap] = useState({});

  // Estado de confirmación manual del auditor por subnumeral
  const [auditorReviews, setAuditorReviews] = useState({});

  const rawSubnumerales = auditResult?.subnumeralesResultados || [];

  const subnumeralesResultados = useMemo(() => {
    return [...rawSubnumerales].sort((a, b) => compareNumeralCodes(a.subnumeral, b.subnumeral));
  }, [rawSubnumerales]);

  if (!auditResult) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 shadow-xl">
        <PieChart className="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-400" />
        <h3 className="text-base font-semibold text-white">Auditoría no ejecutada aún</h3>
        <p className="text-xs text-slate-400 mt-1">
          Complete el Paso 1 (Numerales) y Paso 2 (Evidencias), y haga clic en "Ejecutar Análisis con Agente" en el Paso 3.
        </p>
      </div>
    );
  }

  // Extraer estado recomendado por la IA
  const getAiRecommendedState = (dynamicFields = []) => {
    const estadoField = dynamicFields.find(f => 
      f.label.toLowerCase().includes('estado') || 
      f.label.toLowerCase().includes('cumplimiento') ||
      (typeof f.value === 'string' && (f.value.toUpperCase().includes('CUMPLE') || f.value.toUpperCase().includes('NO CUMPLE')))
    );

    if (!estadoField) return 'CUMPLE';
    const val = (estadoField.value || '').toUpperCase();
    if (val.includes('NO CUMPLE')) return 'NO CUMPLE';
    if (val.includes('CUMPLE')) return 'CUMPLE';
    return 'CUMPLE';
  };

  // Obtener o inicializar la revisión del auditor para un subnumeral
  const getReviewFor = (subnumeral, dynamicFields = []) => {
    if (auditorReviews[subnumeral]) {
      return auditorReviews[subnumeral];
    }
    return {
      estado: getAiRecommendedState(dynamicFields),
      comentario: '',
      fechaCompromiso: '',
      accionPropuesta: '',
      responsableAccion: '',
      confirmado: false
    };
  };

  // Actualizar estado o campos del auditor
  const handleUpdateReview = (subnumeral, field, value) => {
    const current = auditorReviews[subnumeral] || {
      estado: 'CUMPLE',
      comentario: '',
      fechaCompromiso: '',
      accionPropuesta: '',
      responsableAccion: '',
      confirmado: false
    };
    const updatedReview = {
      ...current,
      [field]: value
    };
    const newReviews = {
      ...auditorReviews,
      [subnumeral]: updatedReview
    };
    setAuditorReviews(newReviews);
    if (onUpdateEvaluationsHistory) {
      onUpdateEvaluationsHistory(subnumeral, updatedReview);
    }
  };

  // Confirmar dictamen del auditor para un subnumeral
  const handleToggleConfirm = (subnumeral) => {
    const current = auditorReviews[subnumeral] || {
      estado: 'CUMPLE',
      comentario: '',
      fechaCompromiso: '',
      accionPropuesta: '',
      responsableAccion: '',
      confirmado: false
    };
    const willBeConfirmed = !current.confirmado;
    const updatedReview = {
      ...current,
      confirmado: willBeConfirmed
    };
    const newReviews = {
      ...auditorReviews,
      [subnumeral]: updatedReview
    };
    setAuditorReviews(newReviews);
    if (onUpdateEvaluationsHistory) {
      onUpdateEvaluationsHistory(subnumeral, updatedReview);
    }

    // Al confirmar manualmente, reducir/colapsar el numeral automáticamente
    if (willBeConfirmed) {
      setExpandedMap(prev => ({
        ...prev,
        [subnumeral]: false
      }));
    }
  };

  // Acordeón helpers (reducidos por defecto)
  const isExpanded = (subnumeral) => {
    return expandedMap[subnumeral] !== undefined ? expandedMap[subnumeral] : false;
  };

  const handleToggleExpand = (subnumeral) => {
    setExpandedMap(prev => ({
      ...prev,
      [subnumeral]: !isExpanded(subnumeral)
    }));
  };

  const handleExpandAll = () => {
    const newMap = {};
    subnumeralesResultados.forEach(item => {
      newMap[item.subnumeral] = true;
    });
    setExpandedMap(newMap);
  };

  const handleCollapseAll = () => {
    const newMap = {};
    subnumeralesResultados.forEach(item => {
      newMap[item.subnumeral] = false;
    });
    setExpandedMap(newMap);
  };

  // Conteo de confirmados
  const numConfirmados = subnumeralesResultados.filter(item => {
    const rev = getReviewFor(item.subnumeral, item.dynamicFields);
    return rev.confirmado;
  }).length;

  const hasAtLeastOneConfirmed = numConfirmados > 0;

  // Handlers para guardar borrador y definitivo
  const handleTriggerSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft(auditorReviews);
    }
  };

  const handleTriggerSaveDefinitive = () => {
    if (onSaveDefinitive) {
      onSaveDefinitive(auditorReviews);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* ========================================================
          LISTA DETALLADA DE NUMERALES CON VALIDACIÓN DEL AUDITOR
         ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-slate-100">
        
        {/* Header con Título, Etiqueta del Agente y Botones de Guardado */}
        <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Resumen de Auditoria
            </h2>
            {selectedAgent && (
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Agente: {selectedAgent.nombre}</span>
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Botón Guardar Borrador */}
            <button
              onClick={handleTriggerSaveDraft}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
              title="Guardar como borrador para retomar después"
            >
              <Save className="w-4 h-4 text-indigo-400" />
              <span>Guardar Borrador</span>
            </button>

            {/* Botón Guardar Definitivo */}
            {hasAtLeastOneConfirmed && (
              <button
                onClick={handleTriggerSaveDefinitive}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 transform active:scale-95 animate-pulse"
                title="Consolidar dictámenes confirmados en el Dashboard General"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Definitivo ({numConfirmados})</span>
              </button>
            )}

            {/* Action Buttons: Expandir / Colapsar solo iconos */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={handleExpandAll}
                className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-all"
                title="Expandir todos los numerales"
              >
                <ChevronsUpDown className="w-4 h-4" />
              </button>
              <button
                onClick={handleCollapseAll}
                className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-all"
                title="Reducir todos los numerales"
              >
                <ChevronsDownUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Resultados de Subnumerales con Acordeón y Confirmación Manual */}
        <div className="space-y-4">
          {subnumeralesResultados.map((item, itemIdx) => {
            const itemKey = item.subnumeral || `item-${itemIdx}`;
            const expanded = isExpanded(itemKey);
            const review = getReviewFor(itemKey, item.dynamicFields);
            const aiRecommended = getAiRecommendedState(item.dynamicFields);
            const requiresActionPlan = review.estado === 'NO CUMPLE' || review.estado === 'OBSERVACION';

            return (
              <div
                key={itemKey}
                className={`bg-slate-950/90 border rounded-2xl overflow-hidden transition-all shadow-md ${
                  review.confirmado
                    ? 'border-emerald-500/40 shadow-emerald-950/20'
                    : 'border-slate-800 hover:border-slate-700/80'
                }`}
              >
                {/* Header Clickeable para Ampliar / Reducir */}
                <div
                  onClick={() => handleToggleExpand(itemKey)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer bg-slate-900/40 hover:bg-slate-850/60 transition-colors select-none"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-1 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors shrink-0">
                      {expanded ? (
                        <ChevronDown className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      )}
                    </div>

                    <div className="flex flex-wrap items-baseline gap-2 min-w-0">
                      <span className="bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold shrink-0">
                        {item.subnumeral}
                      </span>
                      {item.requisito && (
                        <span className="text-xs font-semibold text-slate-200 truncate max-w-2xl font-sans">
                          — {item.requisito}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Estado Visible en el Header: Dictamen Auditor o Sugerencia IA */}
                  <div className="flex items-center gap-2 shrink-0">
                    {review.confirmado ? (
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 shadow-sm ${
                        review.estado === 'CUMPLE'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : review.estado === 'NO CUMPLE'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      }`}>
                        <Check className="w-3 h-3" />
                        <span>Auditor: {review.estado}</span>
                        {review.fechaCompromiso && (
                          <span className="ml-1 text-[10px] font-mono opacity-80">
                            (Rev: {review.fechaCompromiso})
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        aiRecommended === 'CUMPLE'
                          ? 'bg-slate-800 text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-800 text-rose-400 border-rose-500/20'
                      }`}>
                        IA: {aiRecommended}
                      </span>
                    )}
                  </div>
                </div>

                {/* Contenido Detallado Expandible */}
                {expanded && (
                  <div className="px-6 pb-6 pt-3 border-t border-slate-900/80 space-y-5">
                    
                    {/* Informe Generado por la IA */}
                    <div className="space-y-3">
                      <h4 className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5" />
                        <span>Evaluación Técnica Preliminar (IA)</span>
                      </h4>

                      <ul className="space-y-3.5 text-xs text-slate-200 leading-relaxed pl-1">
                        {item.dynamicFields && item.dynamicFields.length > 0 ? (
                          item.dynamicFields.map((field, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-2.5">
                              <span className="text-slate-500 font-bold text-base leading-none">•</span>
                              {field.isParagraph ? (
                                <div className="space-y-1.5 w-full">
                                  <strong className="text-slate-100 block font-semibold">{field.label}:</strong>
                                  <div className="italic text-slate-300 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-[11.5px] leading-relaxed font-mono whitespace-pre-line">
                                    {field.value}
                                  </div>
                                </div>
                              ) : (
                                <span>
                                  <strong className="text-slate-100">{field.label}:</strong>{' '}
                                  {field.isBadge ? (
                                    <span className={`ml-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                      (field.value || '').toUpperCase().includes('CUMPLE') && !(field.value || '').toUpperCase().includes('NO CUMPLE')
                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                        : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                    }`}>
                                      {field.value}
                                    </span>
                                  ) : (
                                    <span className="text-slate-200 font-medium">{field.value}</span>
                                  )}
                                </span>
                              )}
                            </li>
                          ))
                        ) : (
                          <li className="text-slate-400 italic">La IA no generó campos de respuesta para este subnumeral.</li>
                        )}
                      </ul>
                    </div>

                    {/* SECCIÓN DE VALIDACIÓN Y COMENTARIOS DEL AUDITOR HUMANO */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-inner">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-xs font-bold text-white">Validación y Dictamen del Auditor</h4>
                        </div>

                        {review.confirmado && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Dictamen Confirmado</span>
                          </span>
                        )}
                      </div>

                      {/* Selector de Estado del Auditor */}
                      <div className="space-y-2">
                        <label className="block text-[11px] font-semibold text-slate-400">
                          Decisión de Conformidad del Auditor:
                        </label>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateReview(itemKey, 'estado', 'CUMPLE')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                              review.estado === 'CUMPLE'
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Conforme (CUMPLE)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateReview(itemKey, 'estado', 'NO CUMPLE')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                              review.estado === 'NO CUMPLE'
                                ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-md shadow-rose-500/10'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            <span>No Conforme (NO CUMPLE)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateReview(itemKey, 'estado', 'OBSERVACION')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                              review.estado === 'OBSERVACION'
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            <span>Observación / Oportunidad de Mejora</span>
                          </button>
                        </div>
                      </div>

                      {/* Textarea de Comentarios del Auditor */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Comentarios Técnicos y Conclusión del Auditor:</span>
                        </label>
                        <textarea
                          rows={2}
                          value={review.comentario}
                          onChange={(e) => handleUpdateReview(itemKey, 'comentario', e.target.value)}
                          placeholder="Ingrese sus comentarios técnicos, conclusiones o justificación de auditoría para este subnumeral..."
                          className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
                        />
                      </div>

                      {/* CAMPOS ADICIONALES PARA NO CONFORMIDADES U OBSERVACIONES: FECHA DE REVISIÓN Y PLAN DE ACCIÓN */}
                      {requiresActionPlan && (
                        <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-3 animate-fadeIn">
                          <div className="flex items-center gap-2 text-amber-400 border-b border-slate-850 pb-2">
                            <ShieldAlert className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-bold">Compromiso de Acción Correctiva / Oportunidad de Mejora</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Fecha Límite de Revisión / Compromiso:</span>
                              </label>
                              <input
                                type="date"
                                value={review.fechaCompromiso || ''}
                                onChange={(e) => handleUpdateReview(itemKey, 'fechaCompromiso', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                Responsable de la Subsanación (Área / Cargo):
                              </label>
                              <input
                                type="text"
                                value={review.responsableAccion || ''}
                                onChange={(e) => handleUpdateReview(itemKey, 'responsableAccion', e.target.value)}
                                placeholder="Ej. Líder de Calidad / Metrología"
                                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-semibold text-slate-400">
                              Plan de Acción Correctiva Propuesto:
                            </label>
                            <textarea
                              rows={2}
                              value={review.accionPropuesta || ''}
                              onChange={(e) => handleUpdateReview(itemKey, 'accionPropuesta', e.target.value)}
                              placeholder="Describa el plan de subsanación o acción acordada para subsanar el hallazgo..."
                              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      )}

                      {/* Botón de Confirmación */}
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => handleToggleConfirm(itemKey)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all ${
                            review.confirmado
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 transform active:scale-95'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                          <span>{review.confirmado ? 'Dictamen Confirmado ✓' : 'Confirmar Dictamen'}</span>
                        </button>
                      </div>

                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Panel Inferior de Acciones de Guardado */}
        {hasAtLeastOneConfirmed && (
          <div className="mt-8 bg-gradient-to-r from-slate-950 via-indigo-950/30 to-slate-950 border border-indigo-500/30 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {numConfirmados} de {subnumeralesResultados.length} numerales confirmados manualmente
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Guarde su avance para retomarlo en cualquier momento o consolide de forma definitiva en el Dashboard.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleTriggerSaveDraft}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <Save className="w-4 h-4 text-indigo-400" />
                <span>Guardar Borrador</span>
              </button>

              <button
                onClick={handleTriggerSaveDefinitive}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all transform active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Definitivo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
