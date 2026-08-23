/**
 * AI Audit Service — Arquitectura Pura de Agentes (Gems / Custom GPTs).
 * 
 * Las instrucciones del Agente se envían DIRECTAMENTE a la API de IA (Gemini / OpenAI)
 * como System Prompt.
 * Sistema anti-429 con alternancia inteligente de modelos multicuota y reintentos automáticos.
 */

import { getAvailableGeminiModels } from './ocrService';

export async function runAIAuditAnalysis(numerales, evidenciasList, apiConfig = {}, customPrompt = '') {
  const { provider, apiKey, model } = apiConfig;

  if (!apiKey || !apiKey.trim()) {
    throw new Error('API_KEY_MISSING');
  }

  if (!numerales || numerales.length === 0) {
    throw new Error('No hay numerales seleccionados para auditar.');
  }

  if (provider === 'gemini') {
    return await runGeminiAnalysis(numerales, evidenciasList, apiKey.trim(), model || 'gemini-2.0-flash', customPrompt);
  } else if (provider === 'openai') {
    return await runOpenAIAnalysis(numerales, evidenciasList, apiKey.trim(), model || 'gpt-4o-mini', customPrompt);
  }

  throw new Error('Proveedor de IA no configurado. Seleccione Gemini u OpenAI.');
}

// ─────────────────────────────────────────────
//  GEMINI (Multi-Modelo con Auto-Recuperación 429)
// ─────────────────────────────────────────────

async function runGeminiAnalysis(numerales, evidenciasList, apiKey, modelName, customPrompt) {
  // Construir el texto consolidado de evidencias
  const evidenciasTexto = evidenciasList.map(doc => {
    const paginas = (doc.contenido || []).map(item => {
      return `[Página ${item.pagina || '?'}] ${item.texto || ''}`;
    }).join('\n');
    return `── Documento: ${doc.nombre} ──\n${paginas}`;
  }).join('\n\n');

  // Lotes equilibrados de 20 numerales
  const CHUNK_SIZE = 20;
  const chunks = [];
  for (let i = 0; i < numerales.length; i += CHUNK_SIZE) {
    chunks.push(numerales.slice(i, i + CHUNK_SIZE));
  }

  const allSubnumeralesResultados = [];

  for (let cIdx = 0; cIdx < chunks.length; cIdx++) {
    const chunkNumerales = chunks[cIdx];

    if (cIdx > 0) {
      await new Promise(resolve => setTimeout(resolve, 1200));
    }

    const chunkResult = await executeGeminiRequestWithModelRotation(chunkNumerales, evidenciasTexto, apiKey, modelName, customPrompt);
    if (chunkResult && Array.isArray(chunkResult.subnumeralesResultados)) {
      allSubnumeralesResultados.push(...chunkResult.subnumeralesResultados);
    }
  }

  return {
    subnumeralesResultados: allSubnumeralesResultados,
    resumenGlobal: { totalSubnumerales: allSubnumeralesResultados.length }
  };
}

async function executeGeminiRequestWithModelRotation(chunkNumerales, evidenciasTexto, apiKey, modelName, customPrompt) {
  const numeralesTexto = chunkNumerales.map(n => `• ${n.codigo}: ${n.requisito}`).join('\n');

  const userMessage = `A continuación tienes la información de la auditoría que debes evaluar.

═══ NUMERALES DE LA NORMA ISO/IEC 17025 A EVALUAR EN ESTE LOTE ═══
${numeralesTexto}

═══ EVIDENCIAS DOCUMENTALES CARGADAS ═══
${evidenciasTexto}

═══ TU TAREA ═══
Aplica las instrucciones de tu perfil de Agente Auditor para evaluar CADA UNO de los numerales listados arriba con base en las evidencias.

Debes responder OBLIGATORIAMENTE en formato JSON con esta estructura exacta:
{
  "subnumeralesResultados": [
    {
      "subnumeral": "4.1.1",
      "requisito": "Texto del requisito evaluado",
      "dynamicFields": [
        {
          "label": "Estado del cumplimiento",
          "value": "CUMPLE o NO CUMPLE",
          "isBadge": true
        },
        {
          "label": "Fragmento de la evidencia utilizada",
          "value": "Texto exacto citado de la evidencia...",
          "isParagraph": true
        },
        {
          "label": "Justificación técnica",
          "value": "Análisis técnico y fundamentación...",
          "isParagraph": true
        },
        {
          "label": "Nivel de confianza",
          "value": "95%",
          "isBadge": true
        }
      ]
    }
  ]
}`;

  const requestBody = {
    systemInstruction: {
      parts: [{ text: customPrompt || 'Eres un auditor experto en ISO/IEC 17025. Realiza una evaluación objetiva, técnica y detallada.' }]
    },
    contents: [
      { role: 'user', parts: [{ text: userMessage }] }
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1
    }
  };

  // Consultar dinámicamente los modelos soportados por la API key
  const availableModels = await getAvailableGeminiModels(apiKey);
  const selected = modelName || 'gemini-1.5-flash';
  
  const modelsPool = [];
  if (selected && availableModels.includes(selected)) {
    modelsPool.push(selected);
  }
  availableModels.forEach(m => {
    if (!modelsPool.includes(m)) modelsPool.push(m);
  });

  if (modelsPool.length === 0) {
    modelsPool.push('gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-pro');
  }

  let lastError = null;

  for (const currentModel of modelsPool) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${encodeURIComponent(apiKey)}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0];
        const parts = candidate?.content?.parts || [];
        const nonThoughtParts = parts.filter(p => !p.thought);
        const selectedParts = nonThoughtParts.length > 0 ? nonThoughtParts : parts;
        const textResponse = selectedParts.map(p => p.text || '').join('\n').trim();

        if (textResponse) {
          return parseGeminiResponse(textResponse, chunkNumerales);
        }
      }

      // Si es 429 (Cuota saturada del modelo específico), probar de inmediato el siguiente modelo con cuota libre
      if (response.status === 429) {
        console.warn(`Modelo ${currentModel} saturado (429). Alternando automáticamente al siguiente modelo de Google...`);
        lastError = new Error(`Límite 429 en ${currentModel}. Probando siguiente modelo...`);
        continue;
      }

      // Si es 404 o 503, intentar siguiente modelo
      if (response.status === 404 || response.status === 503) {
        console.warn(`Modelo ${currentModel} respondió con ${response.status}. Probando alternativa...`);
        continue;
      }

      const errorBody = await response.text();
      throw new Error(`Error de la API (${response.status}): ${errorBody}`);

    } catch (err) {
      lastError = err;
      // Continuar con el siguiente modelo de la lista
    }
  }

  // Si todos los modelos de Google dieron 429, hacer un último reintento tras pausa de 4 segundos con gemini-1.5-flash
  console.warn('Haciendo intento final de recuperación con gemini-1.5-flash tras pausa de 4s...');
  await new Promise(r => setTimeout(r, 4000));

  try {
    const fallbackEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const fallbackRes = await fetch(fallbackEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (fallbackRes.ok) {
      const data = await fallbackRes.json();
      const candidate = data.candidates?.[0];
      const parts = candidate?.content?.parts || [];
      const nonThoughtParts = parts.filter(p => !p.thought);
      const selectedParts = nonThoughtParts.length > 0 ? nonThoughtParts : parts;
      const textResponse = selectedParts.map(p => p.text || '').join('\n').trim();
      if (textResponse) {
        return parseGeminiResponse(textResponse, chunkNumerales);
      }
    }
  } catch (e) {
    // Ignore
  }

  throw lastError || new Error('Límite de tasa de la API de Google alcanzado (429). Por favor espere 15 segundos antes de volver a ejecutar el análisis.');
}

function parseGeminiResponse(textResponse, numerales) {
  try {
    let cleanText = textResponse.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(cleanText);
    if (parsed && Array.isArray(parsed.subnumeralesResultados)) {
      return {
        subnumeralesResultados: parsed.subnumeralesResultados,
        resumenGlobal: { totalSubnumerales: parsed.subnumeralesResultados.length }
      };
    }
  } catch (e) {
    console.warn('Error parseando JSON de Gemini. Generando fallback estructurado:', e);
  }

  return {
    subnumeralesResultados: numerales.map(num => ({
      subnumeral: num.codigo,
      requisito: num.requisito,
      dynamicFields: [
        {
          label: 'Dictamen de Auditoría',
          value: textResponse,
          isParagraph: true
        }
      ]
    })),
    resumenGlobal: { totalSubnumerales: numerales.length }
  };
}

// ─────────────────────────────────────────────
//  OPENAI
// ─────────────────────────────────────────────

async function runOpenAIAnalysis(numerales, evidenciasList, apiKey, modelName, customPrompt) {
  const evidenciasTexto = evidenciasList.map(doc => {
    const paginas = (doc.contenido || []).map(item => {
      return `[Página ${item.pagina || '?'}] ${item.texto || ''}`;
    }).join('\n');
    return `── Documento: ${doc.nombre} ──\n${paginas}`;
  }).join('\n\n');

  const numeralesTexto = numerales.map(n => `• ${n.codigo}: ${n.requisito}`).join('\n');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelName || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: (customPrompt || 'Eres un auditor experto en ISO/IEC 17025.') + '\nResponde siempre en formato JSON con la clave subnumeralesResultados.'
        },
        {
          role: 'user',
          content: `Numerales a evaluar:\n${numeralesTexto}\n\nEvidencias:\n${evidenciasTexto}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Error de OpenAI (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const textResponse = data.choices?.[0]?.message?.content;
  return parseGeminiResponse(textResponse, numerales);
}
