import React from 'react';
import { 
  X, 
  Bot, 
  ShieldCheck, 
  MessageSquare, 
  Clock, 
  Check, 
  CheckCheck,
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  FileText,
  Play,
  Calendar,
  ShieldAlert,
  History
} from 'lucide-react';

export default function AuditResultDetailModal({ 
  isOpen, 
  onClose, 
  numeral, 
  evalItem, 
  areas = [],
  onStartAuditForNumeral
}) {
  if (!isOpen || !numeral) return null;

  const isSubsanado = evalItem?.estadoCompromiso === 'SUBSANADO';
  const isConfirmed = evalItem?.auditorConfirmado === true;
  const estado = evalItem ? (evalItem.estado || 'CUMPLE').toUpperCase() : 'PENDIENTE';
  const dynamicFields = evalItem?.dynamicFields || [];
  const hasCommitment = evalItem && (evalItem.fechaCompromiso || evalItem.accionPropuesta || estado === 'NO CUMPLE' || estado === 'OBSERVACION' || isSubsanado);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-1 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-xl font-mono text-sm font-bold">
              {numeral.codigo}
            </div>
            
            {isSubsanado ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 bg-teal-500/20 text-teal-300 border-teal-500/40">
                <CheckCheck className="w-3.5 h-3.5 text-teal-300" />
                <span>Dictamen: SUBSANADO (Acción Cerrada)</span>
              </span>
            ) : isConfirmed ? (
              <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${
                estado === 'CUMPLE'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : estado === 'NO CUMPLE'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              }`}>
                <Check className="w-3.5 h-3.5" />
                <span>Dictamen Auditor: {estado} (Validado)</span>
              </span>
            ) : evalItem ? (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Evaluación de IA (Pendiente de Aprobación Manual)</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-900 text-slate-400 border border-slate-800 inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Sin Auditar / Pendiente</span>
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar text-xs leading-relaxed">
          
          {/* Requisito Normativo */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Requisito ISO/IEC 17025:
            </span>
            <blockquote className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed bg-slate-900/70 p-4 rounded-2xl border border-slate-800 shadow-inner">
              "{numeral.requisito}"
            </blockquote>
          </div>

          {/* Áreas Asignadas */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Áreas Asignadas:
            </span>
            {(numeral.areaIds || []).map(aId => {
              const areaObj = areas.find(a => a.id === aId);
              if (!areaObj) return null;
              return (
                <span
                  key={aId}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600/15 text-indigo-300 border border-indigo-500/20 text-xs font-medium"
                >
                  {areaObj.nombre}
                </span>
              );
            })}
          </div>

          {/* CASO 1: YA EXISTE EVALUACIÓN DE IA O DEL AUDITOR */}
          {evalItem ? (
            <div className="space-y-6 pt-2">
              
              {/* Sección 1: Evaluación Técnica Preliminar de la IA */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Resultados Generados por Agente IA (Paso 4)
                  </h4>
                </div>

                <ul className="space-y-3.5 text-xs text-slate-200 leading-relaxed pl-1">
                  {dynamicFields.length > 0 ? (
                    dynamicFields.map((field, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <span className="text-indigo-400 font-bold text-base leading-none">•</span>
                        {field.isParagraph ? (
                          <div className="space-y-1.5 w-full">
                            <strong className="text-slate-100 block font-semibold">{field.label}:</strong>
                            <div className="italic text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-[11.5px] leading-relaxed font-mono whitespace-pre-line shadow-inner">
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
                    <li className="text-slate-400 italic">
                      {evalItem.justificacion || 'Evaluación registrada en la auditoría.'}
                    </li>
                  )}
                </ul>
              </div>

              {/* Sección 2: Validación y Dictamen del Auditor */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Dictamen y Conclusiones del Auditor
                    </h4>
                  </div>

                  {isSubsanado ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 text-[11px] font-bold flex items-center gap-1">
                      <CheckCheck className="w-3 h-3" />
                      <span>Acción Subsanada y Cerrada</span>
                    </span>
                  ) : isConfirmed ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Validación Confirmada</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                      Pendiente por Confirmar
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 block font-medium mb-1">Estado de Conformidad Final:</span>
                    {isSubsanado ? (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold border inline-flex items-center gap-1.5 bg-teal-500/20 text-teal-300 border-teal-500/40">
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>SUBSANADO (Cerrado)</span>
                      </span>
                    ) : (
                      <span className={`px-3 py-1 rounded-xl text-xs font-bold border inline-flex items-center gap-1.5 ${
                        estado === 'CUMPLE'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : estado === 'NO CUMPLE'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      }`}>
                        {estado === 'CUMPLE' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{estado}</span>
                      </span>
                    )}
                  </div>

                  {evalItem.fecha && (
                    <div>
                      <span className="text-slate-400 block font-medium mb-1">Fecha de Registro:</span>
                      <span className="text-slate-200 font-mono font-semibold">{evalItem.fecha}</span>
                    </div>
                  )}
                </div>

                {evalItem.comentario && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Comentarios Técnicos del Auditor:</span>
                    </span>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-200 text-xs leading-relaxed whitespace-pre-line">
                      {evalItem.comentario}
                    </div>
                  </div>
                )}
              </div>

              {/* Sección 3: Compromiso y Plan de Acción Correctiva */}
              {hasCommitment && (
                <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 text-amber-400">
                      <ShieldAlert className="w-4 h-4" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">
                        Compromiso de Acción Correctiva / Subsanación
                      </h4>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      isSubsanado
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                        : evalItem.estadoCompromiso === 'EN_PROCESO'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    }`}>
                      Estado: {isSubsanado ? 'Subsanado / Cerrado' : evalItem.estadoCompromiso || 'Abierto'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {evalItem.fechaCompromiso && (
                      <div>
                        <span className="text-slate-400 block font-medium mb-1 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Fecha Programada de Revisión:</span>
                        </span>
                        <span className="text-indigo-300 font-mono font-bold">{evalItem.fechaCompromiso}</span>
                      </div>
                    )}

                    {evalItem.responsableAccion && (
                      <div>
                        <span className="text-slate-400 block font-medium mb-1">Responsable Asignado:</span>
                        <span className="text-slate-200 font-semibold">{evalItem.responsableAccion}</span>
                      </div>
                    )}
                  </div>

                  {evalItem.accionPropuesta && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-slate-300 font-semibold block">Plan de Acción / Medidas de Subsanación:</span>
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-200 text-xs leading-relaxed whitespace-pre-line">
                        {evalItem.accionPropuesta}
                      </div>
                    </div>
                  )}

                  {/* Historial de Trazabilidad */}
                  {evalItem.historialTrazabilidad && evalItem.historialTrazabilidad.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-850">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Historial de Trazabilidad ({evalItem.historialTrazabilidad.length} revisiones)</span>
                      </span>
                      <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-850">
                        {evalItem.historialTrazabilidad.map((h, hIdx) => (
                          <div key={hIdx} className="text-[11px] border-b border-slate-850/60 last:border-0 pb-1.5 last:pb-0">
                            <div className="flex justify-between text-slate-400 font-mono text-[10px]">
                              <span>{h.auditor || 'Auditor'}</span>
                              <span>{h.fecha}</span>
                            </div>
                            <p className="text-slate-200 mt-0.5">{h.comentario}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            /* CASO 2: SIN AUDITAR AÚN */
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
              <FileText className="w-12 h-12 mx-auto text-indigo-400 opacity-40" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Numeral no auditado todavía</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Este numeral no cuenta con evaluación de IA ni dictamen manual del auditor registrado.
                </p>
              </div>

              {onStartAuditForNumeral && (
                <button
                  onClick={() => {
                    onClose();
                    onStartAuditForNumeral(numeral);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Auditar Este Numeral Ahora</span>
                </button>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs rounded-xl transition-all"
          >
            Cerrar Ficha
          </button>
        </div>

      </div>
    </div>
  );
}
