import { createClient } from '@supabase/supabase-js';
import { DEFAULT_AREAS, DEFAULT_NUMERALES_MAPEO } from '../data/defaultMapeo';

export const SUPABASE_URL = 'https://deiiaxwxlxzvsyigoexw.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlaWlheHd4bHh6dnN5aWdvZXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyNzA0MzUsImV4cCI6MjEwMjg0NjQzNX0.Pz0o72vxDYTP_vsWUw4Tp8W4yeSfZ54mHxbmoP9oXBg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Carga todos los ciclos de auditoría desde Supabase
 */
export async function fetchAuditsFromSupabase() {
  try {
    const { data: audits, error: auditsError } = await supabase
      .from('auditorias')
      .select('*')
      .order('created_at', { ascending: false });

    if (auditsError) throw auditsError;
    if (!audits || audits.length === 0) return null;

    // Para cada auditoría, obtener sus áreas, mapeo y evaluaciones
    const fullAudits = await Promise.all(
      audits.map(async (a) => {
        // Áreas
        const { data: areasData } = await supabase
          .from('areas')
          .select('*')
          .eq('auditoria_id', a.id);

        // Mapeo
        const { data: mapeoData } = await supabase
          .from('mapeo_numerales')
          .select('*')
          .eq('auditoria_id', a.id);

        // Evaluaciones
        const { data: evalData } = await supabase
          .from('evaluaciones')
          .select('*')
          .eq('auditoria_id', a.id);

        const evaluationsHistory = {};
        (evalData || []).forEach(e => {
          evaluationsHistory[e.numeral_codigo] = {
            estado: e.estado,
            comentario: e.comentario || '',
            dynamicFields: e.dynamic_fields || [],
            fecha: e.fecha || '',
            auditorConfirmado: e.auditor_confirmado,
            fechaConfirmado: e.fecha_confirmado,
            auditorNombre: e.auditor_nombre,
            fechaCompromiso: e.fecha_compromiso,
            accionPropuesta: e.accion_propuesta,
            responsableAccion: e.responsable_accion,
            estadoCompromiso: e.estado_compromiso || 'ABIERTO',
            historialTrazabilidad: e.historial_trazabilidad || []
          };
        });

        return {
          id: a.id,
          codigo: a.codigo,
          nombre: a.nombre,
          tipo: a.tipo,
          laboratorio: a.laboratorio,
          auditorLider: a.auditor_lider,
          fechaInicio: a.fecha_inicio,
          fechaFin: a.fecha_fin,
          estado: a.estado,
          observacionesGenerales: a.observaciones_generales,
          createdAt: a.created_at,
          updatedAt: a.updated_at,
          areas: (areasData && areasData.length > 0) ? areasData.map(ar => ({
            id: ar.id,
            nombre: ar.nombre,
            password: ar.password || '1',
            color: ar.color || 'indigo'
          })) : DEFAULT_AREAS,
          mapeoNumerales: (mapeoData && mapeoData.length > 0) ? mapeoData.map(m => ({
            id: m.id,
            codigo: m.codigo,
            requisito: m.requisito,
            areaIds: m.area_ids || []
          })) : DEFAULT_NUMERALES_MAPEO,
          evaluationsHistory
        };
      })
    );

    return fullAudits;
  } catch (err) {
    console.warn('Supabase fetchAudits aviso (usando fallback local):', err.message);
    return null;
  }
}

/**
 * Guarda o sincroniza un ciclo de auditoría completo en Supabase
 */
export async function syncAuditToSupabase(audit) {
  if (!audit || !audit.id) return;

  try {
    // 1. Upsert Auditoria
    await supabase.from('auditorias').upsert({
      id: audit.id,
      codigo: audit.codigo,
      nombre: audit.nombre,
      tipo: audit.tipo,
      laboratorio: audit.laboratorio,
      auditor_lider: audit.auditorLider,
      fecha_inicio: audit.fechaInicio || null,
      fecha_fin: audit.fechaFin || null,
      estado: audit.estado || 'EN_PROCESO',
      observaciones_generales: audit.observacionesGenerales || '',
      updated_at: new Date().toISOString()
    });

    // 2. Upsert Áreas
    if (audit.areas && audit.areas.length > 0) {
      const areasToUpsert = audit.areas.map(a => ({
        id: a.id,
        auditoria_id: audit.id,
        nombre: a.nombre,
        password: a.password || '1',
        color: a.color || 'indigo'
      }));
      await supabase.from('areas').upsert(areasToUpsert);
    }

    // 3. Upsert Mapeo Numerales
    if (audit.mapeoNumerales && audit.mapeoNumerales.length > 0) {
      const mapeoToUpsert = audit.mapeoNumerales.map(m => ({
        id: m.id,
        auditoria_id: audit.id,
        codigo: m.codigo,
        requisito: m.requisito,
        area_ids: m.areaIds || []
      }));
      await supabase.from('mapeo_numerales').upsert(mapeoToUpsert);
    }

    // 4. Upsert Evaluaciones
    if (audit.evaluationsHistory && Object.keys(audit.evaluationsHistory).length > 0) {
      const evalsToUpsert = Object.entries(audit.evaluationsHistory).map(([code, ev]) => ({
        auditoria_id: audit.id,
        numeral_codigo: code,
        estado: ev.estado || 'CUMPLE',
        comentario: ev.comentario || '',
        dynamic_fields: ev.dynamicFields || [],
        fecha: ev.fecha || '',
        auditor_confirmado: !!ev.auditorConfirmado,
        fecha_confirmado: ev.fechaConfirmado || null,
        auditor_nombre: ev.auditorNombre || '',
        fecha_compromiso: ev.fechaCompromiso || null,
        accion_propuesta: ev.accionPropuesta || '',
        responsable_accion: ev.responsableAccion || '',
        estado_compromiso: ev.estadoCompromiso || 'ABIERTO',
        historial_trazabilidad: ev.historialTrazabilidad || [],
        updated_at: new Date().toISOString()
      }));
      await supabase.from('evaluaciones').upsert(evalsToUpsert, { onConflict: 'auditoria_id,numeral_codigo' });
    }
  } catch (err) {
    console.warn('Supabase syncAudit aviso:', err.message);
  }
}

/**
 * Elimina una auditoría en Supabase
 */
export async function deleteAuditFromSupabase(auditId) {
  if (!auditId) return;
  try {
    await supabase.from('auditorias').delete().eq('id', auditId);
  } catch (err) {
    console.warn('Supabase deleteAudit aviso:', err.message);
  }
}
