import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  File, 
  Trash2, 
  Check, 
  Layers, 
  Eye, 
  EyeOff, 
  X, 
  AlertCircle, 
  Sparkles, 
  FileSearch, 
  Loader2, 
  Key, 
  CheckCircle2,
  Copy,
  ScanLine,
  Sliders,
  FileText,
  HelpCircle
} from 'lucide-react';
import { parseDocument } from '../engine/textExtractor';
import { performAIOcrExtraction, parsePageRange } from '../engine/ocrService';
import { setCachedFile, getCachedFile, isTrueBlobOrFile } from '../engine/fileCache';
import ConfirmDialogModal from './ConfirmDialogModal';
import MermaidViewer from './MermaidViewer';

function RenderExtractedContent({ item, docType }) {
  // Si tablaData está presente (desde parseExcel o parseCSV)
  if (item.tablaData && Array.isArray(item.tablaData) && item.tablaData.length > 0) {
    const headerRow = item.tablaData[0];
    const dataRows = item.tablaData.slice(1);

    return (
      <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950 my-2 custom-scrollbar shadow-inner max-h-72">
        <table className="w-full text-left text-[11px] border-collapse min-w-max">
          <thead>
            <tr className="bg-slate-900 text-indigo-300 border-b border-slate-800 font-bold font-mono sticky top-0 z-10">
              {headerRow.map((cell, colIdx) => (
                <th key={colIdx} className="py-2.5 px-3 border-r border-slate-800/80 whitespace-nowrap bg-slate-900">
                  {cell !== undefined && cell !== null ? String(cell) : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {dataRows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-slate-900/60 transition-colors">
                {row.map((cell, colIdx) => (
                  <td key={colIdx} className="py-2 px-3 border-r border-slate-800/40 text-slate-300 whitespace-nowrap font-mono text-[10.5px]">
                    {cell !== undefined && cell !== null ? String(cell) : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Si el texto es de formato tabular delimitado por tuberías |
  if (item.texto && (docType === 'XLSX' || docType === 'CSV' || item.texto.includes(' | '))) {
    const lines = item.texto.split('\n').filter(l => l.trim());
    if (lines.length > 1) {
      const rows = lines.map(line => line.split('|').map(cell => cell.trim()));
      const maxCols = Math.max(...rows.map(r => r.length));
      if (maxCols >= 2) {
        const headerRow = rows[0];
        const dataRows = rows.slice(1);

        return (
          <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950 my-2 custom-scrollbar shadow-inner max-h-72">
            <table className="w-full text-left text-[11px] border-collapse min-w-max">
              <thead>
                <tr className="bg-slate-900 text-indigo-300 border-b border-slate-800 font-bold font-mono sticky top-0 z-10">
                  {headerRow.map((cell, colIdx) => (
                    <th key={colIdx} className="py-2.5 px-3 border-r border-slate-800/80 whitespace-nowrap bg-slate-900">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {dataRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-slate-900/60 transition-colors">
                    {row.map((cell, colIdx) => (
                      <td key={colIdx} className="py-2 px-3 border-r border-slate-800/40 text-slate-300 whitespace-nowrap font-mono text-[10.5px]">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }
  }

  const rawText = item.texto || '';

  // Detección y renderizado interactivo de diagramas Mermaid y análisis de organigramas/procesos
  const mermaidMatch = rawText.match(/```mermaid([\s\S]*?)```/i);

  if (mermaidMatch) {
    const mermaidCode = mermaidMatch[1].trim();
    const textBefore = rawText.substring(0, mermaidMatch.index).trim();
    const textAfter = rawText.substring(mermaidMatch.index + mermaidMatch[0].length).trim();

    return (
      <div className="space-y-3 font-sans">
        {textBefore && (
          <div className="text-slate-200 bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 leading-relaxed font-mono whitespace-pre-line text-[11.5px] select-text">
            {textBefore}
          </div>
        )}

        {/* Bloque interactivo de Diagrama / Organigrama */}
        <div className="border border-indigo-500/30 rounded-2xl bg-slate-950 p-4 shadow-xl space-y-2.5">
          <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Diagrama / Organigrama Estructurado por IA</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
              ✓ Renderizado Interactivo
            </span>
          </div>

          <MermaidViewer chartCode={mermaidCode} />
        </div>

        {textAfter && (
          <div className="text-slate-200 bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 leading-relaxed font-mono whitespace-pre-line text-[11.5px] select-text">
            {textAfter}
          </div>
        )}
      </div>
    );
  }

  // Texto estándar para PDF, DOCX, TXT u OCR con formato de párrafos
  return (
    <div className="text-slate-200 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 leading-relaxed font-mono whitespace-pre-line text-[11.5px] select-text">
      {item.texto}
    </div>
  );
}

export default function EvidenciasSection({ 
  evidencias, 
  setEvidencias, 
  onNextStep,
  apiConfig,
  onOpenApiKeyModal
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState(null);
  
  // Estado para seguimiento de OCR en ejecución con porcentaje
  const [ocrLoadingState, setOcrLoadingState] = useState({
    activeDocId: null,
    message: '',
    progressText: '',
    page: 0,
    total: 0,
    percentage: 0
  });
  const [copiedDocId, setCopiedDocId] = useState(null);

  // Estado para diálogo de doble confirmación
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  // Estado para modal de selección de páginas para IA / OCR
  const [pageModalState, setPageModalState] = useState({
    isOpen: false,
    doc: null,
    mode: 'all', // 'all' | 'custom'
    customPages: ''
  });

  const fileInputRef = useRef(null);
  const reuploadDocRef = useRef(null);
  const [pendingOcrDoc, setPendingOcrDoc] = useState(null);

  // Upload user files
  const handleFilesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const parsedDocs = [];
      for (const file of files) {
        const docData = await parseDocument(file);
        setCachedFile(docData.id, file);
        parsedDocs.push(docData);
      }
      const updatedList = [...evidencias, ...parsedDocs];
      setEvidencias(updatedList);
      if (parsedDocs.length > 0) {
        setSelectedPreviewDoc(parsedDocs[0]);
      }
    } catch (err) {
      console.error('Error cargando archivos:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Toggle preview of document structure
  const handleTogglePreviewDoc = (doc) => {
    if (selectedPreviewDoc?.id === doc.id) {
      setSelectedPreviewDoc(null);
    } else {
      setSelectedPreviewDoc(doc);
    }
  };

  const executeRemoveDoc = (id) => {
    const nextList = evidencias.filter(e => e.id !== id);
    setEvidencias(nextList);
    if (selectedPreviewDoc?.id === id) setSelectedPreviewDoc(null);
  };

  const handleRemoveDoc = (doc) => {
    setConfirmDialog({
      isOpen: true,
      title: `¿Eliminar "${doc.nombre}"?`,
      message: `Está a punto de eliminar el archivo de evidencia "${doc.nombre}" (${doc.tipo}). Los fragmentos extraídos ya no serán utilizados para evaluar los numerales.`,
      onConfirm: () => executeRemoveDoc(doc.id)
    });
  };

  // ─────────────────────────────────────────────
  // EJECUCIÓN DE OCR / VISIÓN CON IA
  // ─────────────────────────────────────────────
  const handleTriggerAIOcr = async (doc, forceOpenModal = false) => {
    if (!apiConfig?.apiKey) {
      if (onOpenApiKeyModal) {
        onOpenApiKeyModal();
      } else {
        alert('Por favor configure su Clave API de Gemini u OpenAI en la barra superior para usar la extracción con Visión IA.');
      }
      return;
    }

    // Verificar si el archivo está en memoria o en fileCache
    const hasValidBlob = isTrueBlobOrFile(doc.rawFile) || isTrueBlobOrFile(doc._file) || getCachedFile(doc.id);

    if (!hasValidBlob) {
      setPendingOcrDoc(doc);
      if (reuploadDocRef.current) {
        reuploadDocRef.current.click();
      }
      return;
    }

    const totalDocPages = doc.paginas || (doc.contenido ? doc.contenido.length : 1);
    const isPdf = doc.nombre.toLowerCase().endsWith('.pdf') || doc.tipo === 'PDF';

    // Si es un PDF de múltiples páginas, abrir el selector de páginas
    if ((isPdf && totalDocPages > 1) || forceOpenModal) {
      setPageModalState({
        isOpen: true,
        doc,
        mode: 'all',
        customPages: ''
      });
      return;
    }

    // Si es 1 página o imagen, ejecutar directamente
    await executeOcrProcess(doc, null);
  };

  const handleReuploadForOcr = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !pendingOcrDoc) return;

    setCachedFile(pendingOcrDoc.id, file);

    const docWithFile = {
      ...pendingOcrDoc,
      rawFile: file
    };

    setPendingOcrDoc(null);
    if (reuploadDocRef.current) reuploadDocRef.current.value = '';

    const totalDocPages = docWithFile.paginas || 1;
    if (totalDocPages > 1) {
      setPageModalState({
        isOpen: true,
        doc: docWithFile,
        mode: 'all',
        customPages: ''
      });
    } else {
      await executeOcrProcess(docWithFile, null);
    }
  };

  const handleStartOcrFromModal = async () => {
    if (!pageModalState.doc) return;
    const doc = pageModalState.doc;
    const totalDocPages = doc.paginas || (doc.contenido ? doc.contenido.length : 1);

    let targetPages = null;
    if (pageModalState.mode === 'custom') {
      targetPages = parsePageRange(pageModalState.customPages, totalDocPages);
      if (!targetPages || targetPages.length === 0) {
        alert(`Por favor ingrese un rango o lista de páginas válido entre 1 y ${totalDocPages}.`);
        return;
      }
    }

    setPageModalState(prev => ({ ...prev, isOpen: false }));
    await executeOcrProcess(doc, targetPages);
  };

  const executeOcrProcess = async (doc, targetPages = null) => {
    const totalSelected = Array.isArray(targetPages) && targetPages.length > 0 
      ? targetPages.length 
      : (doc.paginas || 1);

    setOcrLoadingState({
      activeDocId: doc.id,
      message: 'Iniciando motor de Visión Artificial...',
      progressText: `Preparando ${totalSelected} página(s)...`,
      page: 0,
      total: totalSelected,
      percentage: 5
    });

    try {
      const updatedDoc = await performAIOcrExtraction(doc, apiConfig, (prog) => {
        const page = prog.page || 0;
        const total = prog.total || totalSelected;
        const percentage = total > 0 ? Math.min(100, Math.round((page / total) * 100)) : 10;

        setOcrLoadingState({
          activeDocId: doc.id,
          message: prog.message || 'Extrayendo texto con IA...',
          progressText: prog.page ? `Pág. ${prog.actualPageNumber || prog.page} (${prog.page} de ${prog.total})` : 'Procesando...',
          page,
          total,
          percentage
        });
      }, targetPages);

      const nextEvidencias = evidencias.map(e => e.id === doc.id ? updatedDoc : e);
      setEvidencias(nextEvidencias);
      setSelectedPreviewDoc(updatedDoc);
    } catch (err) {
      console.error('Error durante la extracción OCR:', err);
      alert(`Error al procesar con Visión IA: ${err.message || err}`);
    } finally {
      setOcrLoadingState({
        activeDocId: null,
        message: '',
        progressText: '',
        page: 0,
        total: 0,
        percentage: 0
      });
    }
  };

  const handleCopyExtractedText = (doc) => {
    if (!doc || !doc.contenido) return;
    const fullText = doc.contenido.map(c => `[${c.seccion} (${c.pagina})]\n${c.texto}`).join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopiedDocId(doc.id);
    setTimeout(() => setCopiedDocId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Input oculto para reasociar archivo en caso de recarga */}
      <input
        type="file"
        ref={reuploadDocRef}
        onChange={handleReuploadForOcr}
        className="hidden"
      />

      {/* Top Banner Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-emerald-400" />
            <span>Paso 2: Cargar Documentos de Evidencia de Auditoría</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cargue archivos PDF (digitales o escaneados con OCR IA), DOCX, Excel (XLSX), CSV e Imágenes.
          </p>
        </div>

        {evidencias.length > 0 && (
          <button
            onClick={onNextStep}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95 shrink-0"
          >
            <span>Continuar al Paso 3: Ejecutar Motor de Auditoría ({evidencias.length})</span>
            <Check className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* File Dropzone */}
      <div className="bg-slate-900/80 border-2 border-dashed border-slate-700/80 hover:border-indigo-500/60 rounded-2xl p-6 sm:p-8 text-center transition-all">
        <input
          type="file"
          id="file-upload-input"
          ref={fileInputRef}
          multiple
          accept=".pdf, .docx, .doc, .xlsx, .xls, .csv, .png, .jpg, .jpeg, .webp"
          onChange={handleFilesUpload}
          className="hidden"
        />
        <label htmlFor="file-upload-input" className="cursor-pointer space-y-3 block">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              Haga clic para seleccionar o arrastre sus archivos de evidencia aquí
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Soporta PDF (digitales y escaneados con OCR), DOCX, Excel (XLSX), CSV e Imágenes (PNG, JPG)
            </p>
          </div>
        </label>

        {isUploading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-indigo-400">
            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Procesando y extrayendo estructura de documentos...</span>
          </div>
        )}
      </div>

      {/* Uploaded Files Grid & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Document List (5/12 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Documentos Cargados ({evidencias.length})
            </h3>
            {evidencias.length > 0 && (
              <span className="text-[11px] text-slate-500">
                Indexado por IA
              </span>
            )}
          </div>

          {evidencias.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
              <File className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-400" />
              <p className="text-xs font-semibold text-slate-300">No hay documentos de evidencia cargados.</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Seleccione o arrastre sus archivos en la zona superior.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {evidencias.map((doc) => {
                const isSelected = selectedPreviewDoc?.id === doc.id;
                const isOcrLoading = ocrLoadingState.activeDocId === doc.id;
                const isScannedOrNeedsOcr = doc.isScanned || doc.needsOCR || doc.tipo === 'Imagen/OCR';

                return (
                  <div
                    key={doc.id}
                    onClick={() => handleTogglePreviewDoc(doc)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? 'bg-slate-800/90 border-indigo-500 shadow-lg ring-1 ring-indigo-500/40'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`p-2 rounded-xl text-xs font-bold shrink-0 ${
                          doc.tipo === 'PDF' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          doc.tipo === 'XLSX' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          doc.tipo === 'DOCX' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}>
                          {doc.tipo}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-semibold text-white leading-snug break-words pr-2" title={doc.nombre}>
                            {doc.nombre}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-[10.5px] text-slate-400 mt-0.5">
                            <span>Pág: {doc.paginas}</span>
                            <span>•</span>
                            <span>{doc.tamanio}</span>
                            <span>•</span>
                            <span>Secc: {doc.secciones?.length || 1}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleTogglePreviewDoc(doc); }}
                          className={`p-2 rounded-xl transition-all ${
                            isSelected 
                              ? 'text-indigo-400 bg-indigo-500/20 border border-indigo-500/30' 
                              : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800'
                          }`}
                          title={isSelected ? "Ocultar estructura" : "Ver estructura"}
                        >
                          {isSelected ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveDoc(doc); }}
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                          title="Eliminar documento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Structure Inspection Panel (7/12 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl h-fit space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-semibold text-white">Inspección de Contenido y Secciones</h3>
            </div>
            
            <div className="flex items-center gap-2">
              {selectedPreviewDoc && (
                <>
                  <button
                    onClick={() => handleCopyExtractedText(selectedPreviewDoc)}
                    className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1 transition-all"
                    title="Copiar texto extraído"
                  >
                    {copiedDocId === selectedPreviewDoc.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span className="text-[11px]">{copiedDocId === selectedPreviewDoc.id ? '¡Copiado!' : 'Copiar'}</span>
                  </button>

                  <button
                    onClick={() => setSelectedPreviewDoc(null)}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1 transition-all"
                    title="Ocultar inspección"
                  >
                    <X className="w-4 h-4" />
                    <span>Ocultar</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {selectedPreviewDoc ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Documento Seleccionado:</span>
                  <span className="text-xs font-semibold text-indigo-300 font-mono">{selectedPreviewDoc.nombre}</span>
                </div>

                {/* Botón de acción de OCR / Visión con IA */}
                <div className="flex items-center gap-2">
                  {(selectedPreviewDoc.paginas > 1 || (selectedPreviewDoc.contenido && selectedPreviewDoc.contenido.length > 1)) && (
                    <button
                      type="button"
                      onClick={() => handleTriggerAIOcr(selectedPreviewDoc, true)}
                      disabled={ocrLoadingState.activeDocId === selectedPreviewDoc.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all active:scale-95 shadow-sm"
                      title="Elegir hojas específicas a leer con IA"
                    >
                      <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Elegir Hojas...</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleTriggerAIOcr(selectedPreviewDoc)}
                    disabled={ocrLoadingState.activeDocId === selectedPreviewDoc.id}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 ${
                      ocrLoadingState.activeDocId === selectedPreviewDoc.id
                        ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/30 cursor-wait'
                        : 'bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white shadow-indigo-600/30'
                    }`}
                  >
                    {ocrLoadingState.activeDocId === selectedPreviewDoc.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                        <span>Extrayendo ({ocrLoadingState.percentage}%)...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>{selectedPreviewDoc.ocrApplied ? 'Re-escanear con IA (OCR)' : 'Forzar Lectura con IA (OCR)'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Barra de Progreso Dinámica con Porcentaje Reactivo */}
              {ocrLoadingState.activeDocId === selectedPreviewDoc.id && (
                <div className="w-full bg-slate-950 border border-indigo-500/30 rounded-2xl p-3.5 space-y-2.5 shadow-2xl animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-indigo-300 font-semibold min-w-0">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
                      <span className="truncate">{ocrLoadingState.message}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-mono font-bold">
                      <span className="text-slate-400 text-[11px]">{ocrLoadingState.progressText}</span>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs">
                        {ocrLoadingState.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Barra de progreso interactiva con ancho reactivo */}
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 h-full rounded-full transition-all duration-500 ease-out shadow-lg shadow-indigo-500/20"
                      style={{ width: `${Math.max(5, ocrLoadingState.percentage)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Banner informativo para documentos escaneados */}
              {(selectedPreviewDoc.isScanned || selectedPreviewDoc.needsOCR) && !selectedPreviewDoc.ocrApplied && !ocrLoadingState.activeDocId && (
                <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-200 leading-relaxed">
                  <ScanLine className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-amber-300">Documento Escaneado o Imagen Detectada</span>
                    <span>
                      Este archivo no cuenta con texto vectorial directo. Haga clic en <strong>"Forzar Lectura con IA"</strong> para transcribir todas las páginas o seleccione únicamente las hojas que necesite.
                    </span>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium text-slate-400">
                    Contenido Extraído e Indexado para la Auditoría ({selectedPreviewDoc.contenido?.length || 0} fragmentos):
                  </span>
                  {selectedPreviewDoc.ocrApplied && (
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                      ✓ Transcrito con Visión IA {selectedPreviewDoc.ocrTargetPages && selectedPreviewDoc.ocrTargetPages !== 'ALL' ? `(Hojas: ${Array.isArray(selectedPreviewDoc.ocrTargetPages) ? selectedPreviewDoc.ocrTargetPages.join(', ') : selectedPreviewDoc.ocrTargetPages})` : ''}
                    </span>
                  )}
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 font-mono max-h-96 overflow-y-auto custom-scrollbar space-y-3 leading-relaxed">
                  {selectedPreviewDoc.contenido?.map((c, i) => (
                    <div key={i} className="border-b border-slate-900 pb-3 last:border-b-0">
                      <span className="text-amber-400 font-bold block text-[11px] mb-1.5 flex items-center gap-1.5">
                        <span>📌 {c.seccion}</span>
                        <span className="text-slate-500 font-normal">({c.pagina})</span>
                      </span>
                      <RenderExtractedContent item={c} docType={selectedPreviewDoc.tipo} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              <FileSearch className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-400" />
              <p className="text-xs font-medium text-slate-400">
                Seleccione un documento a la izquierda para inspeccionar su contenido o forzar la lectura con IA.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Selección de Páginas para Visión con IA */}
      {pageModalState.isOpen && pageModalState.doc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 border border-indigo-500/30 text-indigo-400">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Extracción con Visión IA (OCR)</h3>
                  <p className="text-xs text-slate-400 font-mono truncate max-w-[240px]" title={pageModalState.doc.nombre}>
                    {pageModalState.doc.nombre}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPageModalState(prev => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selector de Modo */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-300 block">¿Qué páginas desea procesar con IA?</span>
              
              {/* Opción 1: Todas las páginas */}
              <label 
                onClick={() => setPageModalState(prev => ({ ...prev, mode: 'all' }))}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  pageModalState.mode === 'all'
                    ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-md ring-1 ring-indigo-500/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input 
                  type="radio" 
                  name="ocrPageMode" 
                  checked={pageModalState.mode === 'all'} 
                  onChange={() => setPageModalState(prev => ({ ...prev, mode: 'all' }))}
                  className="mt-0.5 text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <div className="text-xs space-y-0.5 flex-1">
                  <div className="font-semibold text-white flex items-center justify-between">
                    <span>Todas las páginas</span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-[10.5px]">
                      1 a {pageModalState.doc.paginas || 1}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Transcribe el documento completo de inicio a fin ({pageModalState.doc.paginas || 1} páginas).
                  </p>
                </div>
              </label>

              {/* Opción 2: Páginas específicas */}
              <label 
                onClick={() => setPageModalState(prev => ({ ...prev, mode: 'custom' }))}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  pageModalState.mode === 'custom'
                    ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-md ring-1 ring-indigo-500/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input 
                  type="radio" 
                  name="ocrPageMode" 
                  checked={pageModalState.mode === 'custom'} 
                  onChange={() => setPageModalState(prev => ({ ...prev, mode: 'custom' }))}
                  className="mt-0.5 text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <div className="text-xs space-y-2 flex-1">
                  <div className="font-semibold text-white flex items-center justify-between">
                    <span>Páginas específicas</span>
                    <span className="text-[10.5px] text-amber-300 font-mono">
                      Solo hojas seleccionadas
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Ideal para documentos grandes donde solo ciertas hojas contienen tablas escaneadas o firmas.
                  </p>

                  {pageModalState.mode === 'custom' && (
                    <div className="space-y-1.5 pt-1 animate-in fade-in duration-150">
                      <input
                        type="text"
                        value={pageModalState.customPages}
                        onChange={(e) => setPageModalState(prev => ({ ...prev, customPages: e.target.value }))}
                        placeholder="Ej: 1, 3, 5-8, 12, 24-26"
                        className="w-full bg-slate-900 border border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-400"
                        autoFocus
                      />
                      
                      {/* Visualizador / Preview de páginas parseadas */}
                      {(() => {
                        const parsed = parsePageRange(pageModalState.customPages, pageModalState.doc.paginas || 1);
                        if (parsed && parsed.length > 0) {
                          return (
                            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              <span>Se procesarán {parsed.length} página(s): [{parsed.join(', ')}]</span>
                            </div>
                          );
                        } else if (pageModalState.customPages.trim()) {
                          return (
                            <div className="flex items-center gap-1.5 text-[11px] text-amber-400">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>Ingrese páginas válidas entre 1 y {pageModalState.doc.paginas || 1}</span>
                            </div>
                          );
                        }
                        return (
                          <span className="text-[10.5px] text-slate-500 block">
                            Formato permitido: números separados por coma o guión para rangos (ej. 10-15).
                          </span>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Nota informativa */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed">
              <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                Las páginas que no selecciones conservarán su texto original intacto y no gastarán cuota innecesaria de IA.
              </span>
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPageModalState(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleStartOcrFromModal}
                disabled={pageModalState.mode === 'custom' && (!parsePageRange(pageModalState.customPages, pageModalState.doc.paginas || 1) || parsePageRange(pageModalState.customPages, pageModalState.doc.paginas || 1).length === 0)}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {pageModalState.mode === 'custom' 
                    ? `Iniciar en ${parsePageRange(pageModalState.customPages, pageModalState.doc.paginas || 1)?.length || 0} página(s)`
                    : `Iniciar en ${pageModalState.doc.paginas || 1} páginas`
                  }
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal de Doble Confirmación con Estilos y Colores de la App */}
      <ConfirmDialogModal
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type="DANGER"
        confirmText="Continuar con la Eliminación"
        cancelText="Cancelar"
        onConfirm={() => {
          if (confirmDialog.onConfirm) confirmDialog.onConfirm();
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }}
      />
    </div>
  );
}
