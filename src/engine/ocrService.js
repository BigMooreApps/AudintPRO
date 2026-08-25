import * as pdfjsLib from 'pdfjs-dist';
import { getCachedFile, isTrueBlobOrFile } from './fileCache';

// Configurar worker de PDF.js para renderizado de canvas
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  try {
    const version = pdfjsLib.version || '4.10.38';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('Aviso al configurar workerSrc en ocrService:', e);
  }
}

// Cache temporal de modelos disponibles de Gemini
let cachedGeminiModels = null;
let lastModelFetchTime = 0;

/**
 * Parsea un rango de páginas en un arreglo de números de página válidos.
 * Soporta formatos: 'all', '1, 3, 5-10, 24', '12-15'
 */
export function parsePageRange(rangeStr, totalPages = 1) {
  if (!rangeStr || !rangeStr.trim() || rangeStr.trim().toLowerCase() === 'all' || rangeStr.trim().toLowerCase() === 'todas') {
    return null; // null representa todas las páginas
  }

  const pagesSet = new Set();
  const parts = rangeStr.split(/[,;\s]+/).map(p => p.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(totalPages, Math.max(start, end));
        for (let p = min; p <= max; p++) {
          pagesSet.add(p);
        }
      }
    } else {
      const page = parseInt(part, 10);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        pagesSet.add(page);
      }
    }
  }

  const sorted = Array.from(pagesSet).sort((a, b) => a - b);
  return sorted.length > 0 ? sorted : null;
}

/**
 * Consulta dinámicamente a la API de Google los modelos soportados por la clave API
 */
export async function getAvailableGeminiModels(apiKey) {
  const now = Date.now();
  if (cachedGeminiModels && (now - lastModelFetchTime < 120000)) {
    return cachedGeminiModels;
  }

  const cleanKey = (apiKey || '').trim();
  if (!cleanKey) return [];

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(cleanKey)}`, {
      headers: { 'x-goog-api-key': cleanKey }
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.models)) {
        const validModels = data.models
          .filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
          .map(m => m.name.replace(/^models\//, ''))
          .filter(name => {
            const isInvalid = name.includes('tts') || 
                              name.includes('embedding') || 
                              name.includes('imagen') || 
                              name.includes('aqa');
            return !isInvalid && (name.startsWith('gemini') || name.startsWith('gemma'));
          });
        
        if (validModels.length > 0) {
          cachedGeminiModels = validModels;
          lastModelFetchTime = now;
          return validModels;
        }
      }
    }
  } catch (e) {
    console.warn('No se pudo listar modelos dinámicamente de Gemini:', e);
  }

  // Lista de modelos oficiales estables por compatibilidad universal
  return [
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro'
  ];
}

/**
 * Renderiza páginas específicas de un archivo PDF a imágenes JPEG en Base64
 */
export async function renderPdfPagesToImages(fileOrBlob, targetPages = null, maxPages = 100) {
  let uint8Data;

  if (fileOrBlob instanceof Uint8Array) {
    uint8Data = fileOrBlob;
  } else if (fileOrBlob instanceof ArrayBuffer) {
    uint8Data = new Uint8Array(fileOrBlob);
  } else if (typeof fileOrBlob?.arrayBuffer === 'function') {
    const arrayBuffer = await fileOrBlob.arrayBuffer();
    uint8Data = new Uint8Array(arrayBuffer);
  } else if (typeof fileOrBlob === 'string' && fileOrBlob.startsWith('data:')) {
    const base64 = fileOrBlob.split(',')[1] || fileOrBlob;
    const binaryStr = atob(base64);
    uint8Data = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      uint8Data[i] = binaryStr.charCodeAt(i);
    }
  } else {
    throw new Error('El archivo PDF no es un Blob, File o ArrayBuffer válido.');
  }

  const loadingTask = pdfjsLib.getDocument({
    data: uint8Data,
    useSystemFonts: true,
    stopAtErrors: false
  });

  const pdf = await loadingTask.promise;
  const totalDocPages = pdf.numPages;

  // Determinar qué páginas procesar
  let pagesToProcess = [];
  if (Array.isArray(targetPages) && targetPages.length > 0) {
    pagesToProcess = targetPages.filter(p => p >= 1 && p <= totalDocPages);
  } else {
    const limit = Math.min(totalDocPages, maxPages);
    for (let i = 1; i <= limit; i++) {
      pagesToProcess.push(i);
    }
  }

  const pageImages = [];

  for (const pageNum of pagesToProcess) {
    try {
      const page = await pdf.getPage(pageNum);
      // Escala 1.5 para óptima resolución y velocidad de OCR
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const base64Data = dataUrl.split(',')[1];

      pageImages.push({
        pageNumber: pageNum,
        totalPages: totalDocPages,
        mimeType: 'image/jpeg',
        base64Data,
        dataUrl
      });
    } catch (pageErr) {
      console.warn(`Error al renderizar página ${pageNum} a imagen:`, pageErr);
    }
  }

  return pageImages;
}

/**
 * Convierte un archivo de imagen (PNG, JPG, WEBP, BMP) a Base64
 */
export async function renderImageFileToBase64(fileOrBlob) {
  if (typeof fileOrBlob === 'string' && fileOrBlob.startsWith('data:')) {
    const mimeType = fileOrBlob.includes('png') ? 'image/png' : 'image/jpeg';
    const base64Data = fileOrBlob.split(',')[1];
    return [{
      pageNumber: 1,
      totalPages: 1,
      mimeType,
      base64Data,
      dataUrl: fileOrBlob
    }];
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const mimeType = fileOrBlob.type || 'image/jpeg';
      const base64Data = dataUrl.split(',')[1];
      resolve([{
        pageNumber: 1,
        totalPages: 1,
        mimeType: mimeType.includes('png') ? 'image/png' : 'image/jpeg',
        base64Data,
        dataUrl
      }]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(fileOrBlob);
  });
}

/**
 * Transcribe un documento escaneado o páginas seleccionadas utilizando la API de Visión de Gemini u OpenAI
 */
export async function performAIOcrExtraction(doc, apiConfig, onProgress, targetPages = null) {
  const { provider = 'gemini', apiKey, model } = apiConfig || {};

  if (!apiKey || !apiKey.trim()) {
    throw new Error('API_KEY_REQUIRED');
  }

  // Buscar archivo en memoria, en cache o en propiedades del doc
  let rawFile = null;
  if (isTrueBlobOrFile(doc.rawFile)) {
    rawFile = doc.rawFile;
  } else if (isTrueBlobOrFile(doc._file)) {
    rawFile = doc._file;
  } else if (getCachedFile(doc.id)) {
    rawFile = getCachedFile(doc.id);
  }

  if (!rawFile) {
    throw new Error('FILE_NOT_IN_MEMORY');
  }

  const isPdf = doc.nombre.toLowerCase().endsWith('.pdf') || doc.tipo === 'PDF';
  
  if (onProgress) onProgress({ step: 'RENDERING', message: 'Preparando páginas seleccionadas para visión artificial...' });

  let pageImages = [];
  if (isPdf) {
    pageImages = await renderPdfPagesToImages(rawFile, targetPages, 100);
  } else {
    pageImages = await renderImageFileToBase64(rawFile);
  }

  if (pageImages.length === 0) {
    throw new Error('No se pudieron extraer imágenes de las páginas seleccionadas.');
  }

  const totalSelected = pageImages.length;
  const newOcrPagesMap = new Map();

  for (let idx = 0; idx < pageImages.length; idx++) {
    const pImg = pageImages[idx];
    const pageNum = pImg.pageNumber;
    const totalDocPages = pImg.totalPages;

    if (onProgress) {
      onProgress({ 
        step: 'OCR_PAGE', 
        page: idx + 1, 
        total: totalSelected,
        actualPageNumber: pageNum,
        totalPagesInDoc: totalDocPages,
        message: `Extrayendo texto con IA de la página ${pageNum} (${idx + 1} de ${totalSelected})...` 
      });
    }

    const ocrText = provider === 'openai'
      ? await ocrPageWithOpenAI(pImg, apiKey.trim(), model)
      : await ocrPageWithGemini(pImg, apiKey.trim(), model);

    if (ocrText && ocrText.trim().length > 0) {
      const lines = ocrText.split('\n').filter(l => l.trim().length > 0);
      let detectedSection = `Página ${pageNum}`;
      for (const line of lines.slice(0, 4)) {
        const trimmed = line.trim();
        if (/^[A-Z0-9ÁÉÍÓÚÑ\s:.-]{4,70}$/.test(trimmed) && trimmed.length < 80) {
          detectedSection = trimmed;
          break;
        }
      }

      newOcrPagesMap.set(pageNum, {
        seccion: detectedSection,
        pagina: `${pageNum}/${totalDocPages}`,
        texto: ocrText.trim(),
        isOcr: true
      });
    } else {
      newOcrPagesMap.set(pageNum, {
        seccion: `Página ${pageNum}`,
        pagina: `${pageNum}/${totalDocPages}`,
        texto: `[Página ${pageNum}: No se detectó texto legible por OCR en la imagen]`,
        isOcr: true
      });
    }
  }

  // Fusión inteligente: Si se procesaron páginas específicas, combinar con el contenido previo
  let finalContenido = [];
  const existingContenido = Array.isArray(doc.contenido) ? [...doc.contenido] : [];

  if (targetPages && targetPages.length > 0 && existingContenido.length > 0) {
    const existingMap = new Map();
    existingContenido.forEach(item => {
      const match = String(item.pagina).match(/^(\d+)/);
      const pNum = match ? parseInt(match[1], 10) : null;
      if (pNum) {
        existingMap.set(pNum, item);
      }
    });

    // Sobrescribir con las páginas transcritas por OCR
    newOcrPagesMap.forEach((newItem, pNum) => {
      existingMap.set(pNum, newItem);
    });

    // Convertir de vuelta y ordenar por número de página
    finalContenido = Array.from(existingMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(entry => entry[1]);
  } else {
    finalContenido = Array.from(newOcrPagesMap.values());
  }

  // Actualizar lista de secciones
  const seccionesSet = new Set();
  finalContenido.forEach(item => {
    if (item.seccion) seccionesSet.add(item.seccion);
  });

  const updatedDoc = {
    ...doc,
    paginas: doc.paginas || pageImages[0]?.totalPages || 1,
    secciones: Array.from(seccionesSet).length > 0 ? Array.from(seccionesSet) : ['Documento Transcrito por IA'],
    contenido: finalContenido,
    isScanned: false,
    needsOCR: false,
    ocrApplied: true,
    ocrProvider: provider,
    ocrDate: new Date().toLocaleDateString(),
    ocrTargetPages: targetPages || 'ALL'
  };

  return updatedDoc;
}

// ─────────────────────────────────────────────
// LIMPIEZA DE TRAZAS DE RAZONAMIENTO Y FORMATO
// ─────────────────────────────────────────────
export function cleanExtractedOcrText(rawText) {
  if (!rawText) return '';

  let cleaned = rawText.trim();

  // Si el modelo incluyó un marcador de borrador final
  if (cleaned.includes('*Drafting the final response...*')) {
    const parts = cleaned.split('*Drafting the final response...*');
    cleaned = parts[parts.length - 1].trim();
  }
  if (cleaned.includes('Drafting the final response...')) {
    const parts = cleaned.split('Drafting the final response...');
    cleaned = parts[parts.length - 1].trim();
  }

  // Filtrar líneas de metadatos mecánicos de razonamiento al inicio
  const lines = cleaned.split('\n');
  const filteredLines = [];
  let skippingPreamble = true;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (skippingPreamble) {
      if (
        trimmed.startsWith('* Role:') ||
        trimmed.startsWith('* Task:') ||
        trimmed.startsWith('* Input:') ||
        trimmed.startsWith('* Constraints:') ||
        trimmed.startsWith('* Specific Requirements:') ||
        trimmed.startsWith('* *Header (to be ignored):') ||
        trimmed.startsWith('* *Watermark (to be ignored):') ||
        trimmed.startsWith('* *Process Map Content:') ||
        trimmed.startsWith('* *Executive Explanation:*') ||
        trimmed.startsWith('* *Breakdown:*') ||
        trimmed.startsWith('* *Audit Relevance') ||
        trimmed.startsWith('* Step 1:') ||
        trimmed.startsWith('* Step 2:') ||
        trimmed.startsWith('* Step 3:') ||
        trimmed.startsWith('Role:') ||
        trimmed.startsWith('Task:') ||
        trimmed.startsWith('Constraints:') ||
        trimmed.startsWith('(Self-Correction') ||
        trimmed.startsWith('*Check against') ||
        trimmed.includes('Drafting the final response')
      ) {
        if (trimmed.startsWith('* *Executive Explanation:*')) {
          skippingPreamble = false;
          filteredLines.push(trimmed.replace('* *Executive Explanation:*', '').trim());
        }
        continue;
      }

      if (trimmed.length > 0) {
        skippingPreamble = false;
        filteredLines.push(line);
      }
    } else {
      if (
        trimmed.startsWith('(Self-Correction') ||
        trimmed.startsWith('*Check against') ||
        trimmed.startsWith('(This matches the provided')
      ) {
        continue;
      }
      filteredLines.push(line);
    }
  }

  return filteredLines.join('\n').trim();
}

// ─────────────────────────────────────────────
// OCR CON GEMINI VISION (Detección Dinámica de Modelos)
// ─────────────────────────────────────────────
async function ocrPageWithGemini(pageImg, apiKey, preferredModel) {
  const cleanKey = (apiKey || '').trim();
  const availableModels = await getAvailableGeminiModels(cleanKey);

  const candidateModels = [];
  if (preferredModel && availableModels.includes(preferredModel)) {
    candidateModels.push(preferredModel);
  }
  
  availableModels.forEach(m => {
    if (!candidateModels.includes(m)) candidateModels.push(m);
  });

  const systemPrompt = `Eres un especialista en extracción estructurada y fiel de documentos para auditorías.
Tu misión es extraer y transcribir fielmente lo que está presente en la página o imagen, en ESPAÑOL, sin agregar interpretaciones teóricas ni ensayos adicionales.
REGLAS OBLIGATORIAS:
- RESPONDE EXCLUSIVAMENTE EN ESPAÑOL.
- Limítate a mostrar con fidelidad lo que contiene el documento.
- NUNCA agregues párrafos de interpretación o teoría de auditoría inventada.
- Omite tablas de encabezados repetitivas (logos, código MCL-001, versión, fechas, número de página) y marcas de agua.
- Transcribe con fidelidad el texto sustantivo y la estructura visible del gráfico.`;

  const userPrompt = `Extrae fielmente el contenido de esta imagen en ESPAÑOL, limitándote a lo que está en el documento:

1. Si la imagen contiene un MAPA DE PROCESOS o DIAGRAMA:
- Breve descripción inicial del gráfico y su propósito según lo que indica el documento.
- **Desglose estructurado:**
  * **Entradas (Izquierda):** [Elementos visibles de entrada]
  * **Procesos Estratégicos (Arriba):** [Elementos visibles de dirección/planeación]
  * **Procesos Operativos / Clave (Centro):** [Elementos visibles misionales/técnicos]
  * **Procesos de Apoyo / Soporte (Abajo):** [Elementos visibles de apoyo]
  * **Salidas (Derecha):** [Elementos visibles de salida]
- (NO agregues párrafos de teoría o justificación de auditoría).

2. Si es un ORGANIGRAMA:
- Breve descripción del organigrama.
- **Desglose estructurado por niveles:**
  * **Nivel Directivo / Asamblea:** [Cargos visibles]
  * **Órganos de Asesoría / Control:** [Cargos visibles]
  * **Gerencia General:** [Cargos visibles]
  * **Gerencias / Direcciones y Dependencias:** [Cargos y áreas visibles]

3. Si hay TEXTO TÉCNICO o PÁRRAFOS en el cuerpo:
- Transcribe íntegramente las frases del cuerpo (omitiendo encabezados y pies de página).`;

  const requestBody = {
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: [
      {
        role: 'user',
        parts: [
          { text: userPrompt },
          {
            inlineData: {
              mimeType: pageImg.mimeType,
              data: pageImg.base64Data
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1
    }
  };

  let lastError = null;

  for (const model of candidateModels) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(cleanKey)}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-goog-api-key': cleanKey
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0];
        const parts = candidate?.content?.parts || [];
        // Filtrar cualquier bloque de pensamiento interno (thought: true) de Gemini 2.0
        const nonThoughtParts = parts.filter(p => !p.thought);
        const selectedParts = nonThoughtParts.length > 0 ? nonThoughtParts : parts;
        const textPart = selectedParts.map(p => p.text || '').join('\n').trim();

        if (textPart) {
          return cleanExtractedOcrText(textPart);
        }
      } else {
        const errText = await response.text();
        let parsedMsg = errText;
        try {
          const errJson = JSON.parse(errText);
          if (errJson.error?.message) {
            parsedMsg = errJson.error.message;
          }
        } catch (_) {}
        lastError = new Error(`Error en API Gemini (${model}): ${response.status} - ${parsedMsg}`);
      }
    } catch (fetchErr) {
      lastError = fetchErr;
    }
  }

  throw lastError || new Error('No se pudo transcribir la página con Gemini Vision.');
}

// ─────────────────────────────────────────────
// OCR CON OPENAI VISION
// ─────────────────────────────────────────────
async function ocrPageWithOpenAI(pageImg, apiKey, preferredModel) {
  const cleanKey = (apiKey || '').trim();
  const model = preferredModel || 'gpt-4o-mini';

  const systemPrompt = `Eres un especialista en extracción estructurada y fiel de documentos para auditorías.
Tu misión es extraer y transcribir fielmente lo que está presente en la página o imagen, en ESPAÑOL, sin agregar interpretaciones teóricas ni ensayos adicionales.
Omite tablas de encabezados repetitivas (logos, código MCL-001, versión, fechas, número de página) y marcas de agua.`;

  const userPrompt = `Extrae fielmente el contenido de esta imagen en ESPAÑOL, limitándote a lo que está en el documento:
1. Si es MAPA DE PROCESOS o DIAGRAMA:
- Breve descripción del gráfico.
- **Desglose estructurado:**
  * **Entradas (Izquierda):** [Elementos visibles]
  * **Procesos Estratégicos (Arriba):** [Elementos visibles]
  * **Procesos Operativos / Clave (Centro):** [Elementos visibles]
  * **Procesos de Apoyo / Soporte (Abajo):** [Elementos visibles]
  * **Salidas (Derecha):** [Elementos visibles]
2. Si es ORGANIGRAMA: Desglose por niveles jerárquicos visibles.
3. Si hay TEXTO TÉCNICO en el cuerpo: Transcríbelo íntegramente (sin encabezados ni pies de página).`;

  const requestBody = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: userPrompt },
          {
            type: 'image_url',
            image_url: {
              url: `data:${pageImg.mimeType};base64,${pageImg.base64Data}`
            }
          }
        ]
      }
    ],
    temperature: 0.05
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cleanKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errText = await response.text();
    let parsedMsg = errText;
    try {
      const errJson = JSON.parse(errText);
      if (errJson.error?.message) {
        parsedMsg = errJson.error.message;
      }
    } catch (_) {}
    throw new Error(`Error en API OpenAI (${model}): ${response.status} - ${parsedMsg}`);
  }

  const data = await response.json();
  const textContent = data.choices?.[0]?.message?.content?.trim() || '';
  return cleanExtractedOcrText(textContent);
}
