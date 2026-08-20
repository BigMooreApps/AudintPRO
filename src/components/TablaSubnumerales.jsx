import React from 'react';
import { Eye, ChevronRight, FileText } from 'lucide-react';

export default function TablaSubnumerales({ resultados, onSelectSubnumeral }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="px-6 py-4 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Tabla Principal de Resultados por Subnumeral</h3>
          <p className="text-xs text-slate-400 mt-0.5">Haga clic en cualquier subnumeral para inspeccionar el detalle desplegable y su trazabilidad documental.</p>
        </div>
        <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
          {resultados.length} Subnumerales
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/70 text-slate-400 border-b border-slate-800 font-semibold tracking-wider uppercase text-[11px]">
              <th className="py-3.5 px-4 w-28">Subnumeral</th>
              <th className="py-3.5 px-4 max-w-xs">Requisito ISO</th>
              <th className="py-3.5 px-4 w-44">Resultado</th>
              <th className="py-3.5 px-4 w-24 text-center">Evidencias</th>
              <th className="py-3.5 px-4">Hallazgo / Observación Principal</th>
              <th className="py-3.5 px-4 w-20 text-center">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {resultados.map((item) => {
              const statusBadge = getStatusBadge(item.resultado);

              return (
                <tr
                  key={item.subnumeral}
                  onClick={() => onSelectSubnumeral(item)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                >
                  {/* Code */}
                  <td className="py-3.5 px-4 font-bold font-mono text-indigo-300 text-sm">
                    {item.subnumeral}
                  </td>

                  {/* Requisito */}
                  <td className="py-3.5 px-4 font-medium text-slate-200 line-clamp-2 max-w-xs">
                    {item.requisito}
                  </td>

                  {/* Resultado Badge */}
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusBadge.className}`}>
                      <span>{statusBadge.icon}</span>
                      <span>{statusBadge.label}</span>
                    </span>
                  </td>

                  {/* # Evidencias */}
                  <td className="py-3.5 px-4 text-center font-bold text-slate-300 font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {item.numEvidencias}
                    </span>
                  </td>

                  {/* Hallazgo */}
                  <td className="py-3.5 px-4 text-slate-300 text-xs">
                    {item.hallazgo}
                  </td>

                  {/* Detail Arrow */}
                  <td className="py-3.5 px-4 text-center">
                    <button className="p-1.5 text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-600/10 rounded-lg transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function getStatusBadge(resultado) {
  switch (resultado) {
    case 'CONFORME':
      return {
        label: '🟢 Conforme',
        icon: '',
        className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      };
    case 'PARCIALMENTE_CONFORME':
      return {
        label: '🟡 Parcial',
        icon: '',
        className: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      };
    case 'NO_CONFORME':
      return {
        label: '🔴 No Conforme',
        icon: '',
        className: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
      };
    case 'SIN_EVIDENCIA':
    default:
      return {
        label: '⚪ Sin Evidencia',
        icon: '',
        className: 'bg-slate-800 text-slate-400 border-slate-700'
      };
  }
}
