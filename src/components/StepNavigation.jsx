import React from 'react';
import { ListOrdered, Files, Play, PieChart, CheckCircle2 } from 'lucide-react';

export default function StepNavigation({ currentStep, setStep, numSubnumerales, numEvidencias, hasResults }) {
  const steps = [
    {
      id: 1,
      title: 'Paso 1: Numerales',
      badge: numSubnumerales > 0 ? `${numSubnumerales} reg.` : '0 reg.',
      icon: ListOrdered
    },
    {
      id: 2,
      title: 'Paso 2: Evidencias',
      badge: numEvidencias > 0 ? `${numEvidencias} doc.` : '0 doc.',
      icon: Files
    },
    {
      id: 3,
      title: 'Paso 3: Analizar',
      badge: hasResults ? 'Ejecutado' : 'Ejecución IA',
      icon: Play
    },
    {
      id: 4,
      title: 'Paso 4: Resultados',
      badge: hasResults ? 'Completado' : 'Pendiente',
      icon: PieChart
    }
  ];

  return (
    <div className="bg-slate-900/60 border-b border-slate-800/80 backdrop-blur-md sticky top-[65px] z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.id;
            const isCompleted = (s.id === 1 && numSubnumerales > 0) || 
                                (s.id === 2 && numEvidencias > 0) || 
                                (s.id === 3 && hasResults) ||
                                (s.id === 4 && hasResults);

            return (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                  isActive
                    ? 'bg-indigo-600/15 border-indigo-500/80 text-white shadow-lg shadow-indigo-500/10'
                    : isCompleted
                    ? 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    : 'bg-slate-900/40 border-slate-800/50 text-slate-500 hover:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isActive 
                      ? 'bg-indigo-600 text-white' 
                      : isCompleted 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold block">{s.title}</span>
                    <span className="text-[11px] opacity-70 block">{s.badge}</span>
                  </div>
                </div>

                {isCompleted && !isActive && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 opacity-80" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
