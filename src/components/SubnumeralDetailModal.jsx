import React from 'react';
import { X, FileText, Lightbulb, ShieldAlert } from 'lucide-react';
import { getStatusBadge } from './TablaSubnumerales';

export default function SubnumeralDetailModal({ item, onClose }) {
  if (!item) return null;

  const statusBadge = getStatusBadge(item.resultado);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white font-mono tracking-tight flex items-center gap-2">
              <span>{item.subnumeral}</span>
            </h2>
            <div className="h-4 w-px bg-slate-800"></div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
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
          
          {/* Requisito ISO */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
              Requisito ISO/IEC 17025:
            </span>
            <blockquote className="text-sm font-medium text-slate-200 leading-relaxed italic bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
              "{item.requisito}"
            </blockquote>
          </div>

          {/* EVIDENCIA OBJETIVA IDENTIFICADA */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              EVIDENCIA OBJETIVA IDENTIFICADA:
            </span>

            {(!item.evidencias || item.evidencias.length === 0) ? (
              <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-xl text-center text-slate-500 text-xs">
                No se hallaron evidencias documentales o de registros asociadas a este subnumeral.
              </div>
            ) : (
              <div className="border border-slate-800 rounded-xl overflow-x-auto bg-slate-950 shadow-inner">
                <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold text-[11px]">
                      <th className="py-3 px-4 w-[22%]">Documento</th>
                      <th className="py-3 px-3 w-[12%] text-center">Página</th>
                      <th className="py-3 px-4 w-[42%]">Evidencia relevante</th>
                      <th className="py-3 px-4 w-[24%]">Relación con el requisito</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {item.evidencias.map((ev, idx) => (
                      <tr key={ev.id || idx} className="hover:bg-slate-900/50 transition-colors align-top">
                        
                        {/* Documento */}
                        <td className="py-3.5 px-4 font-semibold text-slate-200 break-words">
                          {ev.documento}
                        </td>

                        {/* Página Exacta */}
                        <td className="py-3.5 px-3 text-center text-indigo-300 font-mono text-[11px] font-semibold whitespace-nowrap">
                          {ev.pagina}
                        </td>

                        {/* Evidencia relevante */}
                        <td className="py-3.5 px-4 text-slate-200 leading-relaxed">
                          <p className="italic text-[11.5px] text-slate-300 mb-2">
                            "{ev.fragmento}"
                          </p>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-[10px] text-slate-400 font-mono">
                            <FileText className="w-3 h-3 text-indigo-400" />
                            <span>{ev.documento}</span>
                          </span>
                        </td>

                        {/* Relación con el requisito */}
                        <td className="py-3.5 px-4 text-emerald-300/90 font-normal leading-relaxed text-[11.5px] break-words">
                          {ev.porqueEsRelevante}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Evidencia Faltante y Recomendada (si aplica) */}
          {(item.evidenciaFaltante?.length > 0 || item.evidenciaRecomendada?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              
              {/* Evidencia Faltante */}
              {item.evidenciaFaltante?.length > 0 && (
                <div className="bg-rose-950/15 border border-rose-500/20 rounded-xl p-4 space-y-1.5">
                  <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Evidencia Faltante</span>
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                    {item.evidenciaFaltante.map((ef, i) => (
                      <li key={i}>{ef}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Evidencia Recomendada */}
              {item.evidenciaRecomendada?.length > 0 && (
                <div className="bg-amber-950/15 border border-amber-500/20 rounded-xl p-4 space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Evidencia Recomendada</span>
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                    {item.evidenciaRecomendada.map((er, i) => (
                      <li key={i}>{er}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
}
