import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

// Configurar worker de PDF.js para navegadores y entornos de producción
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  try {
    // Usar worker CDN compatible con la versión activa de pdfjs-dist
    const version = pdfjsLib.version || '4.10.38';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('Aviso al configurar workerSrc:', e);
  }
}

/**
 * Extract structured text, sections, and pages from various document types
 */
export async function parseDocument(file) {
  const extension = file.name.split('.').pop().toLowerCase();

  try {
    if (extension === 'pdf') {
      return await parsePDF(file);
    } else if (extension === 'docx' || extension === 'doc') {
      return await parseDOCX(file);
    } else if (extension === 'xlsx' || extension === 'xls') {
      return await parseExcel(file);
    } else if (extension === 'csv') {
      return await parseCSV(file);
    } else if (['png', 'jpg', 'jpeg', 'bmp', 'webp'].includes(extension)) {
      return await parseImage(file);
    } else {
      return await parseText(file);
    }
  } catch (err) {
    console.error(`Error procesando el archivo ${file.name}:`, err);
    return await fallbackTextParse(file, err);
  }
}

async function parsePDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Data = new Uint8Array(arrayBuffer);
  let pdf = null;

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Data,
      useSystemFonts: true,
      stopAtErrors: false
    });
    pdf = await loadingTask.promise;
  } catch (err1) {
    console.warn('Reintentando carga de PDF con configuración alternativa:', err1);
    try {
      if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;
      }
      const loadingTask = pdfjsLib.getDocument({
        data: uint8Data,
        disableFontFace: true
      });
      pdf = await loadingTask.promise;
    } catch (err2) {
      console.warn('PDF.js falló, usando extractor de texto binario/stream de respaldo:', err2);
      const streamRes = extractTextFromPDFBuffer(uint8Data, file);
      streamRes.rawFile = file;
      return streamRes;
    }
  }

  const numPages = pdf.numPages;
  const contenido = [];
  const seccionesSet = new Set();
  let totalCharsExtracted = 0;

  for (let i = 1; i <= numPages; i++) {
    try {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str || '').join(' ').trim();

      if (pageText && pageText.length > 5) {
        totalCharsExtracted += pageText.length;
        const lines = pageText.split('\n').filter(l => l.trim().length > 0);
        let detectedSection = `Página ${i}`;
        for (const line of lines.slice(0, 3)) {
          const trimmed = line.trim();
          if (/^\d+(\.\d+)*\s+[A-Z]/.test(trimmed) || (trimmed === trimmed.toUpperCase() && trimmed.length > 5 && trimmed.length < 60)) {
            detectedSection = trimmed;
            break;
          }
        }
        seccionesSet.add(detectedSection);

        contenido.push({
          seccion: detectedSection,
          pagina: `${i}/${numPages}`,
          texto: cleanExtractedText(pageText)
        });
      }
    } catch (pageErr) {
      console.warn(`No se pudo extraer el texto de la página ${i}:`, pageErr);
    }
  }

  // Detectar si es un PDF escaneado (sin capa de texto directa o con texto casi nulo)
  const isLikelyScanned = contenido.length === 0 || totalCharsExtracted < (numPages * 20);

  if (isLikelyScanned) {
    const streamExtraction = extractTextFromPDFBuffer(uint8Data, file);
    if (streamExtraction.contenido && streamExtraction.contenido[0]?.texto?.length > 80) {
      streamExtraction.rawFile = file;
      return streamExtraction;
    }

    return {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      nombre: file.name,
      tipo: 'PDF',
      paginas: numPages,
      tamanio: formatBytes(file.size),
      secciones: ['Documento Escaneado / OCR Pendiente'],
      isScanned: true,
      needsOCR: true,
      rawFile: file,
      contenido: [{
        seccion: 'Escaneo Pendiente de OCR',
        pagina: `1/${numPages}`,
        texto: `Documento PDF escaneado o basado en imágenes: ${file.name} (${numPages} páginas, ${formatBytes(file.size)}). No contiene capa de texto vectorial directa. Utilice la función "Forzar Lectura con IA (OCR)" para transcribir su contenido.`
      }]
    };
  }

  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    nombre: file.name,
    tipo: 'PDF',
    paginas: numPages,
    tamanio: formatBytes(file.size),
    secciones: Array.from(seccionesSet),
    isScanned: false,
    rawFile: file,
    contenido
  };
}

/**
 * Extractor de respaldo que analiza los streams de texto en el binario del PDF
 */
function extractTextFromPDFBuffer(uint8Data, file) {
  try {
    const decoder = new TextDecoder('latin1');
    const rawString = decoder.decode(uint8Data);

    const textPieces = [];
    const tjRegex = /\(([^)]+)\)\s*Tj/g;
    let match;
    while ((match = tjRegex.exec(rawString)) !== null) {
      if (match[1] && match[1].trim().length > 1) {
        textPieces.push(match[1].trim());
      }
    }

    if (textPieces.length > 5) {
      const fullText = cleanExtractedText(textPieces.join(' '));
      return {
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        nombre: file.name,
        tipo: 'PDF',
        paginas: 1,
        tamanio: formatBytes(file.size),
        secciones: ['Contenido Extraído'],
        isScanned: false,
        rawFile: file,
        contenido: [{
          seccion: 'Texto del Procedimiento / Registro',
          pagina: '1/1',
          texto: fullText
        }]
      };
    }
  } catch (e) {
    console.warn('Error en extractor stream:', e);
  }

  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    nombre: file.name,
    tipo: 'PDF',
    paginas: 1,
    tamanio: formatBytes(file.size),
    secciones: ['Documento PDF'],
    isScanned: true,
    needsOCR: true,
    rawFile: file,
    contenido: [{
      seccion: 'Documento Escaneado',
      pagina: '1/1',
      texto: `Documento PDF validado: ${file.name}. Tamaño: ${formatBytes(file.size)}.`
    }]
  };
}

function cleanExtractedText(text) {
  if (!text) return '';
  return text
    .replace(/\\([()\\])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

async function parseDOCX(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const rawText = result.value || '';
  
  const paragraphs = rawText.split('\n\n').filter(p => p.trim());
  const contenido = [];
  const seccionesSet = new Set();
  
  let currentPage = 1;
  let currentSection = 'Sección 1';
  let accumText = '';

  paragraphs.forEach((p, idx) => {
    if (p.length < 60 && (/^\d+(\.\d+)*\s+/.test(p) || p.toUpperCase() === p)) {
      currentSection = p.trim();
      seccionesSet.add(currentSection);
    }
    accumText += p + '\n';
    
    if (accumText.length > 1500 || idx === paragraphs.length - 1) {
      contenido.push({
        seccion: currentSection,
        pagina: `Pág ${currentPage}`,
        texto: accumText
      });
      currentPage++;
      accumText = '';
    }
  });

  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    nombre: file.name,
    tipo: 'DOCX',
    paginas: Math.max(1, currentPage - 1),
    tamanio: formatBytes(file.size),
    secciones: Array.from(seccionesSet).length > 0 ? Array.from(seccionesSet) : ['General'],
    rawFile: file,
    contenido
  };
}

async function parseExcel(file) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  
  const contenido = [];
  const secciones = workbook.SheetNames;

  workbook.SheetNames.forEach((sheetName, index) => {
    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    
    const tableRows = rawRows.filter(row => Array.isArray(row) && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== ''));
    const csvText = XLSX.utils.sheet_to_csv(sheet);
    
    if (tableRows.length > 0) {
      contenido.push({
        seccion: `Hoja: ${sheetName}`,
        pagina: `Hoja ${index + 1}`,
        texto: csvText.replace(/,/g, ' | '),
        tablaData: tableRows
      });
    }
  });

  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    nombre: file.name,
    tipo: 'XLSX',
    paginas: workbook.SheetNames.length,
    tamanio: formatBytes(file.size),
    secciones,
    rawFile: file,
    contenido
  };
}

async function parseCSV(file) {
  const text = await file.text();
  const parsed = Papa.parse(text, { header: false });
  
  const tableRows = parsed.data.filter(row => Array.isArray(row) && row.some(cell => cell && String(cell).trim() !== ''));
  const formattedRows = tableRows.map(row => row.join(' | ')).join('\n');

  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    nombre: file.name,
    tipo: 'CSV',
    paginas: 1,
    tamanio: formatBytes(file.size),
    secciones: ['Datos CSV'],
    rawFile: file,
    contenido: [
      {
        seccion: 'Tabla de Datos CSV',
        pagina: 'Hoja 1',
        texto: formattedRows,
        tablaData: tableRows
      }
    ]
  };
}

async function parseImage(file) {
  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    nombre: file.name,
    tipo: 'Imagen/OCR',
    paginas: 1,
    tamanio: formatBytes(file.size),
    secciones: ['Escaneo OCR Pendiente'],
    isScanned: true,
    needsOCR: true,
    rawFile: file,
    contenido: [
      {
        seccion: 'Reconocimiento de Imagen (OCR)',
        pagina: '1/1',
        texto: `[Evidencia Fotográfica / Escáner (${file.name})]. Requiere procesamiento OCR con IA para transcribir su texto.`
      }
    ]
  };
}

async function parseText(file) {
  const text = await file.text();
  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    nombre: file.name,
    tipo: 'TXT',
    paginas: 1,
    tamanio: formatBytes(file.size),
    secciones: ['Documento Texto'],
    rawFile: file,
    contenido: [
      {
        seccion: 'Texto plano',
        pagina: '1/1',
        texto
      }
    ]
  };
}

async function fallbackTextParse(file, err) {
  const isPdf = file.name.toLowerCase().endsWith('.pdf');

  if (isPdf) {
    return {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      nombre: file.name,
      tipo: 'PDF',
      paginas: 1,
      tamanio: formatBytes(file.size),
      secciones: ['Documento PDF'],
      isScanned: true,
      needsOCR: true,
      rawFile: file,
      contenido: [{
        seccion: 'Documento PDF',
        pagina: '1/1',
        texto: `Documento PDF procesado para análisis: ${file.name}. Utilice "Forzar Lectura con IA" para extraer su contenido.`
      }]
    };
  }

  try {
    const raw = await file.text();
    if (raw && raw.trim().length > 10 && !raw.startsWith('%PDF')) {
      return {
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        nombre: file.name,
        tipo: 'TEXTO',
        paginas: 1,
        tamanio: formatBytes(file.size),
        secciones: ['Contenido Texto'],
        rawFile: file,
        contenido: [{
          seccion: 'Sección Principal',
          pagina: '1/1',
          texto: raw
        }]
      };
    }
  } catch (e) {
    // Ignore
  }

  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    nombre: file.name,
    tipo: 'DOCUMENTO',
    paginas: 1,
    tamanio: formatBytes(file.size),
    secciones: ['Documento completo'],
    rawFile: file,
    contenido: [{
      seccion: 'Sección principal',
      pagina: 'Página 1',
      texto: `Documento procesado (${file.name})`
    }]
  };
}

function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
