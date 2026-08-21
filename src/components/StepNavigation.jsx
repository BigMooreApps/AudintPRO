import React from 'react';
import { ListOrdered, Files, Play, PieChart, CheckCircle2 } from 'lucide-react';

export default function StepNavigation({ currentStep, setStep, numSubnumerales, numEvidencias, hasResults }) {
  const steps = [
    {
      id: 1,
      title: 'Paso 1: Numerales',
      shortTitle: '1. Numerales',
      badge: numSubnumerales > 0 ? `${numSubnumerales} reg.` : '0 reg.',
      icon: ListOrdered
    },
    {
      id: 2,
      title: 'Paso 2: Evidencias',
      shortTitle: '2. Evidencias',
      badge: numEvidencias > 0 ? `${numEvidencias} doc.` : '0 doc.',
      icon: Files
    },
    {
      id: 3,
      title: 'Paso 3: Analizar',
      shortTitle: '3. Analizar',
      badge: hasResults ? 'Ejecutado' : 'Motor IA',
      icon: Play
    },
    {
      id: 4,
      title: 'Paso 4: Resultados',
      shortTitle: '4. Resultados',
      badge: hasResults ? 'Completado' : 'Pendiente',
      icon: PieChart
    }
  ];

  return (
    <div className="bg-slate-900/80 border-b border-slate-800/80 backdrop-blur-xl sticky top-[53px] sm:top-[65px] z-20">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-3">
        
        {/* Responsive Grid: 4 compact columns on mobile, 4 full columns on desktop */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-4">
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
                className={`flex flex-col sm:flex-row items-center sm:justify-between p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition-all text-center sm:text-left relative overflow-hidden group ${
                  isActive
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/15 ring-1 ring-indigo-500/50'
                    : isCompleted
                    ? 'bg-slate-800/70 border-slate-700/70 text-slate-200 hover:bg-slate-800'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-500 hover:text-slate-400'
                }`}
              >
                {/* Active Indicator Bar on Mobile Top */}
                {isActive && (
                  <div className="sm:hidden absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-emerald-400" />
                )}

                <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 min-w-0 w-full">
                  <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl shrink-0 ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                      : isCompleted 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-slate-900 text-slate-500'
                  }`}>
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] sm:text-xs font-bold block truncate">
                      <span className="sm:hidden">{s.shortTitle}</span>
                      <span className="hidden sm:inline">{s.title}</span>
                    </span>
                    <span className="text-[9px] sm:text-[11px] opacity-70 block truncate font-mono">
                      {s.badge}
                    </span>
                  </div>
                </div>

                {isCompleted && !isActive && (
                  <CheckCircle2 className="hidden sm:block w-4 h-4 text-emerald-400 opacity-80 shrink-0 ml-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
