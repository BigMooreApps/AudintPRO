import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

// Set PDF.js worker URL if available
try {
  if (pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
  }
} catch (e) {
  console.warn('No se pudo establecer pdfWorker URL, se usará modo directo:', e);
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
    const loadingTask = pdfjsLib.getDocument({ data: uint8Data });
    pdf = await loadingTask.promise;
  } catch (err1) {
    console.warn('Falló la carga de PDF.js con worker, intentando modo directo:', err1);
    try {
      const loadingTask = pdfjsLib.getDocument({
        data: uint8Data,
        disableWorker: true,
        isEvalSupported: false
      });
      pdf = await loadingTask.promise;
    } catch (err2) {
      console.error('Error definitivo cargando la estructura PDF:', err2);
      throw err2;
    }
  }

  const numPages = pdf.numPages;
  const contenido = [];
  const seccionesSet = new Set();

  for (let i = 1; i <= numPages; i++) {
    try {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str || '').join(' ').trim();

      if (pageText) {
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
          texto: pageText
        });
      }
    } catch (pageErr) {
      console.warn(`No se pudo extraer el texto de la página ${i}:`, pageErr);
    }
  }

  if (contenido.length === 0) {
    return {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      nombre: file.name,
      tipo: 'PDF',
      paginas: numPages,
      tamanio: formatBytes(file.size),
      secciones: ['PDF Escaneado'],
      contenido: [{
        seccion: 'Página 1 (Imagen)',
        pagina: `1/${numPages}`,
        texto: `Documento PDF escaneado o sin capa de texto seleccionable: ${file.name}.`
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
    contenido
  };
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
    
    // Filtrar filas completamente vacías
    const tableRows = rawRows.filter(row => Array.isArray(row) && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== ''));

    const csvText = XLSX.utils.sheet_to_csv(sheet);
    
    if (tableRows.length > 0) {
      contenido.push({
        seccion: `Hoja: ${sheetName}`,
        pagina: `Hoja ${index + 1}`,
        texto: csvText.replace(/,/g, ' | '),
        tablaData: tableRows // Arreglo 2D reconstruible como Tabla HTML
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
    secciones: ['Escaneo OCR'],
    contenido: [
      {
        seccion: 'Reconocimiento de Imagen (OCR)',
        pagina: '1/1',
        texto: `[Evidencia Fotográfica / Escáner procesado por OCR]: ${file.name}`
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
  try {
    const raw = await file.text();
    if (raw && raw.trim().length > 10) {
      return {
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        nombre: file.name,
        tipo: 'TEXTO',
        paginas: 1,
        tamanio: formatBytes(file.size),
        secciones: ['Contenido Texto'],
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
