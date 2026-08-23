import * as pdfjsLib from 'pdfjs-dist';

// Configurar worker de PDF.js para renderizado de canvas
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  try {
    const version = pdfjsLib.version || '4.10.38';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('Aviso al configurar workerSrc en ocrService:', e);
  }
}

/**
 * Renderiza las páginas de un archivo PDF a imágenes JPEG en Base64
 */
export async function renderPdfPagesToImages(fileOrBlob, maxPages = 20) {
  const arrayBuffer = await fileOrBlob.arrayBuffer();
  const uint8Data = new Uint8Array(arrayBuffer);

  const loadingTask = pdfjsLib.getDocument({
    data: uint8Data,
    useSystemFonts: true,
    stopAtErrors: false
  });

  const pdf = await loadingTask.promise;
  const numPages = Math.min(pdf.numPages, maxPages);
  const pageImages = [];

  for (let i = 1; i <= numPages; i++) {
    try {
      const page = await pdf.getPage(i);
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
        pageNumber: i,
        totalPages: pdf.numPages,
        mimeType: 'image/jpeg',
        base64Data,
        dataUrl
      });
    } catch (pageErr) {
      console.warn(`Error al renderizar página ${i} a imagen:`, pageErr);
    }
  }

  return pageImages;
}

/**
 * Convierte un archivo de imagen (PNG, JPG, WEBP, BMP) a Base64
 */
export async function renderImageFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const mimeType = file.type || 'image/jpeg';
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
    reader.readAsDataURL(file);
  });
}

/**
 * Transcribe un documento escaneado o imagen utilizando la API de Visión de Gemini u OpenAI
 */
export async function performAIOcrExtraction(doc, apiConfig, onProgress) {
  const { provider = 'gemini', apiKey, model } = apiConfig || {};

  if (!apiKey || !apiKey.trim()) {
    throw new Error('API_KEY_REQUIRED');
  }

  const rawFile = doc.rawFile || doc._file;
  if (!rawFile) {
    throw new Error('El archivo original no está en memoria para ser re-escaneado. Por favor, vuelva a cargar el documento.');
  }

  const isPdf = doc.nombre.toLowerCase().endsWith('.pdf') || doc.tipo === 'PDF';
  
  if (onProgress) onProgress({ step: 'RENDERING', message: 'Preparando páginas e imágenes para visión artificial...' });

  let pageImages = [];
  if (isPdf) {
    pageImages = await renderPdfPagesToImages(rawFile, 25);
  } else {
    pageImages = await renderImageFileToBase64(rawFile);
  }

  if (pageImages.length === 0) {
    throw new Error('No se pudieron extraer imágenes del documento para procesar.');
  }

  const newContenido = [];
  const seccionesSet = new Set();

  for (let idx = 0; idx < pageImages.length; idx++) {
    const pImg = pageImages[idx];
    const pageNum = pImg.pageNumber;
    const total = pImg.totalPages;

    if (onProgress) {
      onProgress({ 
        step: 'OCR_PAGE', 
        page: pageNum, 
        total,
        message: `Extrayendo texto con IA de la página ${pageNum} de ${total}...` 
      });
    }

    const ocrText = provider === 'openai'
      ? await ocrPageWithOpenAI(pImg, apiKey.trim(), model)
      : await ocrPageWithGemini(pImg, apiKey.trim(), model);

    if (ocrText && ocrText.trim().length > 0) {
      // Detectar título o primera sección relevante
      const lines = ocrText.split('\n').filter(l => l.trim().length > 0);
      let detectedSection = `Página ${pageNum}`;
      for (const line of lines.slice(0, 4)) {
        const trimmed = line.trim();
        if (/^[A-Z0-9ÁÉÍÓÚÑ\s:.-]{4,70}$/.test(trimmed) && trimmed.length < 80) {
          detectedSection = trimmed;
          break;
        }
      }
      seccionesSet.add(detectedSection);

      newContenido.push({
        seccion: detectedSection,
        pagina: `${pageNum}/${total}`,
        texto: ocrText.trim()
      });
    } else {
      newContenido.push({
        seccion: `Página ${pageNum}`,
        pagina: `${pageNum}/${total}`,
        texto: `[Página ${pageNum}: No se detectó texto legible por OCR en la imagen]`
      });
    }
  }

  const updatedDoc = {
    ...doc,
    paginas: pageImages.length,
    secciones: Array.from(seccionesSet).length > 0 ? Array.from(seccionesSet) : ['Documento Transcrito por IA'],
    contenido: newContenido,
    isScanned: false,
    ocrApplied: true,
    ocrProvider: provider,
    ocrDate: new Date().toLocaleDateString()
  };

  return updatedDoc;
}

// ─────────────────────────────────────────────
// OCR CON GEMINI VISION
// ─────────────────────────────────────────────
async function ocrPageWithGemini(pageImg, apiKey, preferredModel) {
  const modelsPool = [
    preferredModel || 'gemini-2.0-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-2.5-flash'
  ].filter((v, i, a) => a.indexOf(v) === i);

  const prompt = `Actúa como un motor de OCR y Visión Documental de máxima precisión para auditorías ISO/IEC 17025.
Transcribe fielmente TODO el texto que aparece en esta página del documento escaneado/fotografiado.

Instrucciones Críticas:
1. Transcribe exactamente todo el texto: títulos, numerales, cláusulas, listas, nombres de personas, números de documento/cédula, cargos, fechas, firmas y notas al pie.
2. Mantén la estructura y párrafos originales.
3. Si hay tablas o listas con viñetas o letras (a, b, c...), transcríbelas completas.
4. NO agregues introducciones ni explicaciones; responde ÚNICAMENTE con el texto transcrito de la página.`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
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
      temperature: 0.05
    }
  };

  let lastError = null;

  for (const model of modelsPool) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0];
        const textPart = candidate?.content?.parts?.[0]?.text;
        if (textPart) {
          return textPart.trim();
        }
      } else {
        const errText = await response.text();
        lastError = new Error(`Error en API Gemini (${model}): ${response.status} - ${errText}`);
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
  const model = preferredModel || 'gpt-4o-mini';

  const prompt = `Actúa como un motor de OCR y Visión Documental de máxima precisión para auditorías ISO/IEC 17025.
Transcribe fielmente TODO el texto que aparece en esta página del documento escaneado/fotografiado.
No agregues comentarios ni introducciones; devuelve únicamente el texto transcripto estructurado.`;

  const requestBody = {
    model,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
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
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Error en API OpenAI (${model}): ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}
