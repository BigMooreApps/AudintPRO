import React, { useState } from 'react';
import { UploadCloud, File, Trash2, Check, Layers, Eye, EyeOff, X, AlertCircle } from 'lucide-react';
import { parseDocument } from '../engine/textExtractor';

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

  // Texto estándar para PDF, DOCX, TXT
  return (
    <p className="text-slate-200 bg-slate-900/50 p-3 rounded-lg border border-slate-800 leading-relaxed font-mono">
      {item.texto}
    </p>
  );
}

export default function EvidenciasSection({ evidencias, setEvidencias, onNextStep }) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState(null);

  // Upload user files
  const handleFilesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const parsedDocs = [];
      for (const file of files) {
        const docData = await parseDocument(file);
        parsedDocs.push(docData);
      }
      setEvidencias([...evidencias, ...parsedDocs]);
    } catch (err) {
      console.error('Error cargando archivos:', err);
    } finally {
      setIsUploading(false);
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

  // Remove uploaded evidence
  const handleRemoveDoc = (id) => {
    setEvidencias(evidencias.filter(e => e.id !== id));
    if (selectedPreviewDoc?.id === id) setSelectedPreviewDoc(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-emerald-400" />
            <span>Paso 2: Cargar Documentos de Evidencia de Auditoría</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cargue los archivos que corresponden a las evidencias de auditoría (PDF, DOCX, XLSX, CSV, Imágenes con OCR).
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
      <div className="bg-slate-900/80 border-2 border-dashed border-slate-700/80 hover:border-indigo-500/60 rounded-2xl p-8 text-center transition-all">
        <input
          type="file"
          id="file-upload-input"
          multiple
          accept=".pdf, .docx, .doc, .xlsx, .xls, .csv, .png, .jpg, .jpeg"
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
              Soporta PDF (con OCR), DOCX, Excel (XLSX), CSV e Imágenes (PNG, JPG)
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
        
        {/* Left: Document List (4/12 cols - Compacta) */}
        <div className="lg:col-span-4 space-y-3">
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

                return (
                  <div
                    key={doc.id}
                    onClick={() => handleTogglePreviewDoc(doc)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-800 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/50'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`p-2 rounded-lg text-xs font-bold shrink-0 ${
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
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                          <span>Pág: {doc.paginas}</span>
                          <span>•</span>
                          <span>{doc.tamanio}</span>
                          <span>•</span>
                          <span>Secc: {doc.secciones?.length || 1}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleTogglePreviewDoc(doc); }}
                        className={`p-1.5 rounded-lg transition-all ${
                          isSelected 
                            ? 'text-indigo-400 bg-indigo-500/20 border border-indigo-500/30' 
                            : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800'
                        }`}
                        title={isSelected ? "Ocultar estructura" : "Ver estructura"}
                      >
                        {isSelected ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveDoc(doc.id); }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Eliminar documento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Structure Inspection Panel (8/12 cols - Mucho más amplio) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl h-fit space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-semibold text-white">Inspección de Contenido y Secciones</h3>
            </div>
            {selectedPreviewDoc && (
              <button
                onClick={() => setSelectedPreviewDoc(null)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1 transition-all"
                title="Ocultar inspección"
              >
                <X className="w-4 h-4" />
                <span>Ocultar</span>
              </button>
            )}
          </div>

          {selectedPreviewDoc ? (
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">Documento Seleccionado:</span>
                <span className="text-xs font-semibold text-indigo-300 font-mono">{selectedPreviewDoc.nombre}</span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-slate-400 block mb-1.5">
                  Fragmento de Muestra Extraído por la IA:
                </span>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 font-mono max-h-80 overflow-y-auto custom-scrollbar space-y-3 leading-relaxed">
                  {selectedPreviewDoc.contenido?.map((c, i) => (
                    <div key={i} className="border-b border-slate-900 pb-3">
                      <span className="text-amber-400 font-bold block text-[11px] mb-1">
                        📌 {c.seccion} ({c.pagina})
                      </span>
                      <RenderExtractedContent item={c} docType={selectedPreviewDoc.tipo} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              <Eye className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-400" />
              <p className="text-xs font-medium text-slate-400">Seleccione un documento a la izquierda para inspeccionar sus secciones y contenido extraído.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
