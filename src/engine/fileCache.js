/**
 * Cache en memoria e IndexedDB para preservar archivos binarios (File / Blob / ArrayBuffer)
 * evitando que JSON.stringify los convierta en objetos vacíos {}.
 */

const memoryCache = new Map();

export function setCachedFile(docId, file) {
  if (!docId || !file) return;
  memoryCache.set(docId, file);
}

export function getCachedFile(docId) {
  if (!docId) return null;
  return memoryCache.get(docId) || null;
}

export function hasCachedFile(docId) {
  return memoryCache.has(docId);
}

export function removeCachedFile(docId) {
  memoryCache.delete(docId);
}

export function isTrueBlobOrFile(obj) {
  if (!obj) return false;
  if (typeof Blob !== 'undefined' && obj instanceof Blob) return true;
  if (typeof File !== 'undefined' && obj instanceof File) return true;
  if (typeof ArrayBuffer !== 'undefined' && obj instanceof ArrayBuffer) return true;
  if (typeof Uint8Array !== 'undefined' && obj instanceof Uint8Array) return true;
  if (typeof obj.arrayBuffer === 'function') return true;
  return false;
}
