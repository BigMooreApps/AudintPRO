/**
 * auditCyclesService.js
 * Servicio para gestión y persistencia de múltiples ciclos de auditoría ISO/IEC 17025.
 */

import { DEFAULT_AREAS, DEFAULT_NUMERALES_MAPEO } from '../data/defaultMapeo';

const STORAGE_KEY_AUDITS = 'AGENTE_PROMAX_AUDIT_CYCLES';
const STORAGE_KEY_ACTIVE_AUDIT = 'AGENTE_PROMAX_ACTIVE_AUDIT_ID';

export const AUDIT_TYPES = [
  'Auditoría Interna Anual',
  'Auditoría de Seguimiento',
  'Auditoría Extraordinaria',
  'Auditoría de Acreditación / Certificación',
  'Auditoría Específica por Proceso'
];

/**
 * Crea una nueva estructura de auditoría por defecto
 */
export function createDefaultAuditCycle(overrides = {}) {
  const currentYear = new Date().getFullYear();
  const timestamp = Date.now();

  return {
    id: `audit-${timestamp}`,
    codigo: overrides.codigo || `AUD-${currentYear}-01`,
    nombre: overrides.nombre || `Auditoría Interna ISO/IEC 17025 - Ciclo ${currentYear}`,
    tipo: overrides.tipo || 'Auditoría Interna Anual',
    laboratorio: overrides.laboratorio || 'Laboratorio de Ensayos y Calibración',
    auditorLider: overrides.auditorLider || 'Auditor Líder ISO 17025',
    fechaInicio: overrides.fechaInicio || new Date().toISOString().split('T')[0],
    fechaFin: overrides.fechaFin || '',
    estado: overrides.estado || 'EN_PROCESO', // 'EN_PROCESO' | 'CERRADA' | 'PLANIFICADA'
    observacionesGenerales: overrides.observacionesGenerales || '',
    // Datos específicos de esta auditoría
    evaluationsHistory: overrides.evaluationsHistory || {},
    evidencias: overrides.evidencias || [],
    auditResult: overrides.auditResult || null,
    // Catálogos
    areas: overrides.areas || DEFAULT_AREAS,
    mapeoNumerales: overrides.mapeoNumerales || DEFAULT_NUMERALES_MAPEO,
    createdAt: overrides.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Carga todos los ciclos de auditoría guardados en localStorage
 */
export function loadAllAuditCycles(initialFallback = null) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDITS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error al cargar ciclos de auditoría desde localStorage:', err);
  }

  // Si no hay nada guardado, crear el ciclo por defecto inicial
  const defaultAudit = createDefaultAuditCycle(initialFallback || {});
  saveAllAuditCycles([defaultAudit]);
  return [defaultAudit];
}

/**
 * Guarda todos los ciclos de auditoría en localStorage
 */
export function saveAllAuditCycles(audits) {
  try {
    localStorage.setItem(STORAGE_KEY_AUDITS, JSON.stringify(audits));
  } catch (err) {
    console.error('Error al guardar ciclos de auditoría en localStorage:', err);
  }
}

/**
 * Obtiene el ID del ciclo de auditoría activo
 */
export function getActiveAuditId(allAudits = []) {
  try {
    const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_AUDIT);
    if (activeId && allAudits.some(a => a.id === activeId)) {
      return activeId;
    }
  } catch (err) {
    console.error('Error al obtener ID de auditoría activa:', err);
  }
  return allAudits[0]?.id || null;
}

/**
 * Guarda el ID del ciclo de auditoría activo
 */
export function setActiveAuditId(auditId) {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_AUDIT, auditId);
  } catch (err) {
    console.error('Error al guardar ID de auditoría activa:', err);
  }
}
