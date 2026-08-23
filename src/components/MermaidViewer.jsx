import React, { useEffect, useRef, useState } from 'react';

export default function MermaidViewer({ chartCode }) {
  const containerRef = useRef(null);
  const [svgContent, setSvgContent] = useState('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function renderChart() {
      if (!chartCode || !chartCode.trim()) return;

      try {
        setHasError(false);
        // Cargar Mermaid dinámicamente desde CDN sin inflar el bundle local
        let mermaid;
        if (typeof window !== 'undefined' && window.mermaid) {
          mermaid = window.mermaid;
        } else {
          const module = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs');
          mermaid = module.default || module;
          window.mermaid = mermaid;
        }
        
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          themeVariables: {
            darkMode: true,
            background: '#090d16',
            primaryColor: '#4f46e5',
            primaryTextColor: '#ffffff',
            primaryBorderColor: '#6366f1',
            lineColor: '#10b981',
            secondaryColor: '#059669',
            tertiaryColor: '#1e293b'
          }
        });

        const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const cleanChart = chartCode.trim().replace(/^```mermaid\s*/i, '').replace(/```\s*$/, '').trim();
        
        const { svg } = await mermaid.render(uniqueId, cleanChart);
        if (isMounted && svg) {
          setSvgContent(svg);
        }
      } catch (err) {
        console.warn('Renderizado alternativo para diagrama Mermaid:', err);
        if (isMounted) {
          setHasError(true);
        }
      }
    }

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chartCode]);

  if (hasError || !svgContent) {
    return (
      <div className="my-2 p-3.5 bg-slate-950/90 border border-indigo-500/20 rounded-xl overflow-x-auto">
        <div className="flex items-center gap-2 text-[11px] text-indigo-300 font-mono mb-1.5 font-bold">
          <span>📊 Estructura y Flujo del Diagrama:</span>
        </div>
        <pre className="text-[11px] text-emerald-300 font-mono whitespace-pre-wrap leading-relaxed">
          {chartCode.trim().replace(/^```mermaid\s*/i, '').replace(/```\s*$/, '').trim()}
        </pre>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="my-3 p-4 bg-slate-950/90 border border-indigo-500/20 rounded-2xl overflow-x-auto flex items-center justify-center custom-scrollbar shadow-inner"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
