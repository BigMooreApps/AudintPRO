import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, Copy, Check, Eye, ListTree } from 'lucide-react';

export default function MermaidViewer({ chartCode }) {
  const containerRef = useRef(null);
  const [svgContent, setSvgContent] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('diagram'); // 'diagram' | 'code'

  const cleanChart = (chartCode || '')
    .trim()
    .replace(/^```mermaid\s*/i, '')
    .replace(/```\s*$/, '')
    .trim();

  useEffect(() => {
    let isMounted = true;

    async function renderChart() {
      if (!cleanChart) return;

      try {
        setHasError(false);
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
          flowchart: {
            useMaxWidth: false,
            htmlLabels: true,
            curve: 'basis',
            nodeSpacing: 50,
            rankSpacing: 60
          },
          themeVariables: {
            darkMode: true,
            background: '#090d16',
            primaryColor: '#312e81',
            primaryTextColor: '#ffffff',
            primaryBorderColor: '#6366f1',
            lineColor: '#10b981',
            secondaryColor: '#064e3b',
            tertiaryColor: '#1e1b4b',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            fontSize: '13px'
          }
        });

        const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
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
  }, [cleanChart]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(cleanChart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  if (hasError || !svgContent) {
    return (
      <div className="my-2 p-3.5 bg-slate-950/90 border border-indigo-500/20 rounded-xl overflow-x-auto">
        <div className="flex items-center gap-2 text-[11px] text-indigo-300 font-mono mb-1.5 font-bold">
          <span>📊 Estructura y Flujo del Diagrama:</span>
        </div>
        <pre className="text-[11px] text-emerald-300 font-mono whitespace-pre-wrap leading-relaxed">
          {cleanChart}
        </pre>
      </div>
    );
  }

  const DiagramContent = () => (
    <div className="w-full overflow-auto custom-scrollbar flex items-center justify-center p-4 min-h-[220px]">
      <div 
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.2s ease-out' }}
        className="flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );

  return (
    <>
      <div className="my-2 bg-slate-950/90 border border-indigo-500/30 rounded-2xl overflow-hidden shadow-xl">
        
        {/* Barra Superior de Herramientas del Diagrama */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('diagram')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'diagram'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Diagrama Visual</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'code'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListTree className="w-3.5 h-3.5" />
              <span>Código de Flujo</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            {activeTab === 'diagram' && (
              <>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title="Alejar"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono text-slate-400 px-1 min-w-[36px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title="Acercar"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title="Restablecer tamaño"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            <button
              onClick={handleCopyCode}
              className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-colors ml-1"
              title="Copiar sintaxis Mermaid"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setIsFullscreen(true)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-indigo-300 hover:text-white hover:bg-indigo-600/20 border border-indigo-500/30 rounded-lg transition-all"
              title="Abrir en pantalla completa"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Ampliar</span>
            </button>
          </div>
        </div>

        {/* Contenido según pestaña */}
        {activeTab === 'diagram' ? (
          <DiagramContent />
        ) : (
          <div className="p-4 bg-slate-950/80 overflow-x-auto font-mono text-xs">
            <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed">
              {cleanChart}
            </pre>
          </div>
        )}
      </div>

      {/* Modal Pantalla Completa / Ampliación */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95">
            
            {/* Header del Modal */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Maximize2 className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">Visualizador Ampliado de Diagrama / Organigrama</h4>
                  <p className="text-xs text-slate-400">Inspección de relaciones, jerarquías y procesos</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl"
                  title="Alejar"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-indigo-300 font-bold px-2">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl"
                  title="Acercar"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl"
                  title="Restablecer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl ml-2 transition-colors"
                  title="Cerrar ampliación"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contenido Ampliado con Scroll / Zoom */}
            <div className="flex-1 bg-slate-950 overflow-auto custom-scrollbar flex items-center justify-center p-8">
              <div 
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.2s ease-out' }}
                className="flex items-center justify-center min-w-max"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>

          </div>
        </div>
      )}
    </>
  );
}
