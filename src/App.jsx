import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import StepNavigation from './components/StepNavigation';
import MainAreaDashboard from './components/MainAreaDashboard';
import NumeralesSection from './components/NumeralesSection';
import EvidenciasSection from './components/EvidenciasSection';
import MotorAnalisisSection from './components/MotorAnalisisSection';
import ResultadosDashboard from './components/ResultadosDashboard';
import ApiKeyModal from './components/ApiKeyModal';
import AgentManagerModal, { DEFAULT_AGENTS } from './components/AgentManagerModal';
import AuditoresModal from './components/AuditoresModal';
import MapeoModal from './components/MapeoModal';
import CompromisosModal from './components/CompromisosModal';
import AuditoriasModal from './components/AuditoriasModal';
import ConfirmDialogModal from './components/ConfirmDialogModal';
import LoginScreen from './components/LoginScreen';
import { exportAuditReportPDF } from './engine/pdfExport';
import { DEFAULT_AREAS, DEFAULT_NUMERALES_MAPEO } from './data/defaultMapeo';
import { 
  loadAllAuditCycles, 
  saveAllAuditCycles, 
  getActiveAuditId, 
  setActiveAuditId, 
  createDefaultAuditCycle 
} from './engine/auditCyclesService';

const STORAGE_KEY_AUTH_USER = 'AGENTE_PROMAX_AUTH_USER';

export default function App() {
  // 0. Autenticación y Control de Roles (SUPER_AUDITOR vs AUDITORES)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_AUTH_USER);
      if (savedUser) return JSON.parse(savedUser);
    } catch (e) {
      console.error('Error al cargar sesión de usuario:', e);
    }
    return null; // Si es null, muestra LoginScreen
  });

  // 1. Gestión de Ciclos de Auditoría Periódicos (Multi-Auditoría)
  const [auditCycles, setAuditCycles] = useState(() => loadAllAuditCycles());
  const [activeAuditId, setActiveAuditIdState] = useState(() => {
    const initialAudits = loadAllAuditCycles();
    return getActiveAuditId(initialAudits);
  });

  const activeAudit = auditCycles.find(a => a.id === activeAuditId) || auditCycles[0];

  // Vista activa: 'DASHBOARD' (Pantalla de Inicio) | 'AUDIT' (Flujo de 4 pasos)
  const [currentView, setCurrentView] = useState('DASHBOARD');
  const [step, setStep] = useState(1);
  
  // Estados de la auditoría activa cargados en memoria
  const [areas, setAreasState] = useState(activeAudit?.areas || DEFAULT_AREAS);
  const [mapeoNumerales, setMapeoNumeralesState] = useState(activeAudit?.mapeoNumerales || DEFAULT_NUMERALES_MAPEO);
  const [selectedAreaId, setSelectedAreaId] = useState(currentUser?.role === 'AUDITOR' ? currentUser.areaId : 'ALL');
  const [numerales, setNumerales] = useState(activeAudit?.mapeoNumerales || DEFAULT_NUMERALES_MAPEO);
  const [evidencias, setEvidencias] = useState(activeAudit?.evidencias || []);
  const [auditResult, setAuditResult] = useState(activeAudit?.auditResult || null);
  const [evaluationsHistory, setEvaluationsHistoryState] = useState(activeAudit?.evaluationsHistory || {});

  // Ref para evitar loops de sincronización
  const isSwitchingAuditRef = useRef(false);

  // Manejo de inicio y cierre de sesión
  const handleLogin = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
    } catch (e) {
      console.error('Error al guardar sesión:', e);
    }

    if (user.role === 'AUDITOR' && user.areaId) {
      setSelectedAreaId(user.areaId);
      const scopedNumerals = (activeAudit?.mapeoNumerales || mapeoNumerales).filter(n => (n.areaIds || []).includes(user.areaId));
      setNumerales(scopedNumerals.length > 0 ? scopedNumerals : mapeoNumerales);
      setIsAuditoriasModalOpen(false);
    } else {
      setSelectedAreaId('ALL');
      setNumerales(activeAudit?.mapeoNumerales || mapeoNumerales);
      // Al ingresar como Super Auditor, abrir New AU como primera vista
      setIsAuditoriasModalOpen(true);
    }

    setCurrentView('DASHBOARD');
    setStep(1);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    } catch (e) {
      console.error('Error al remover sesión:', e);
    }
    setCurrentUser(null);
  };

  // Sincronizar hacia localStorage cuando cambie el estado de la auditoría activa
  const syncActiveAuditToStorage = (updatedFields = {}) => {
    setAuditCycles(prevAudits => {
      const updatedList = prevAudits.map(audit => {
        if (audit.id === activeAuditId) {
          return {
            ...audit,
            ...updatedFields,
            updatedAt: new Date().toISOString()
          };
        }
        return audit;
      });
      saveAllAuditCycles(updatedList);
      return updatedList;
    });
  };

  // Setters con sincronización automática al ciclo de auditoría activo
  const setEvaluationsHistory = (updater) => {
    setEvaluationsHistoryState(prev => {
      const updated = typeof updater === 'function' ? updater(prev) : updater;
      syncActiveAuditToStorage({ evaluationsHistory: updated });
      return updated;
    });
  };

  const setAreas = (updater) => {
    setAreasState(prev => {
      const updated = typeof updater === 'function' ? updater(prev) : updater;
      syncActiveAuditToStorage({ areas: updated });
      return updated;
    });
  };

  const setMapeoNumerales = (updater) => {
    setMapeoNumeralesState(prev => {
      const updated = typeof updater === 'function' ? updater(prev) : updater;
      syncActiveAuditToStorage({ mapeoNumerales: updated });
      return updated;
    });
  };

  // Cambiar a otra auditoría del historial
  const handleSelectAudit = (auditId) => {
    const targetAudit = auditCycles.find(a => a.id === auditId);
    if (!targetAudit) return;

    isSwitchingAuditRef.current = true;
    setActiveAuditIdState(auditId);
    setActiveAuditId(auditId);

    // Cargar datos de la auditoría seleccionada en la app
    const loadedAreas = targetAudit.areas || DEFAULT_AREAS;
    const loadedMapeo = targetAudit.mapeoNumerales || DEFAULT_NUMERALES_MAPEO;
    setAreasState(loadedAreas);
    setMapeoNumeralesState(loadedMapeo);
    
    if (currentUser?.role === 'AUDITOR' && currentUser.areaId) {
      const scoped = loadedMapeo.filter(n => (n.areaIds || []).includes(currentUser.areaId));
      setNumerales(scoped.length > 0 ? scoped : loadedMapeo);
    } else {
      setNumerales(loadedMapeo);
    }

    setEvidencias(targetAudit.evidencias || []);
    setAuditResult(targetAudit.auditResult || null);
    setEvaluationsHistoryState(targetAudit.evaluationsHistory || {});
    setSelectedAreaId(currentUser?.role === 'AUDITOR' ? currentUser.areaId : 'ALL');
    setStep(1);

    setIsAuditoriasModalOpen(false);

    setTimeout(() => {
      isSwitchingAuditRef.current = false;
    }, 100);
  };

  // Crear una nueva auditoría
  const handleCreateAudit = (formData) => {
    const newAudit = createDefaultAuditCycle({
      codigo: formData.codigo,
      nombre: formData.nombre,
      tipo: formData.tipo,
      laboratorio: formData.laboratorio,
      auditorLider: formData.auditorLider,
      fechaInicio: formData.fechaInicio,
      fechaFin: formData.fechaFin,
      estado: formData.estado,
      observacionesGenerales: formData.observacionesGenerales,
      areas: formData.cloneFromCurrent ? areas : DEFAULT_AREAS,
      mapeoNumerales: formData.cloneFromCurrent ? mapeoNumerales : DEFAULT_NUMERALES_MAPEO,
      evaluationsHistory: {},
      evidencias: [],
      auditResult: null
    });

    const updatedAudits = [...auditCycles, newAudit];
    setAuditCycles(updatedAudits);
    saveAllAuditCycles(updatedAudits);

    handleSelectAudit(newAudit.id);
  };

  const handleUpdateAudit = (auditId, updatedData) => {
    setAuditCycles(prevAudits => {
      const updatedList = prevAudits.map(a => a.id === auditId ? { ...a, ...updatedData, updatedAt: new Date().toISOString() } : a);
      saveAllAuditCycles(updatedList);
      return updatedList;
    });
  };

  const handleDeleteAudit = (auditId) => {
    if (auditCycles.length <= 1) return;
    const remaining = auditCycles.filter(a => a.id !== auditId);
    setAuditCycles(remaining);
    saveAllAuditCycles(remaining);

    if (activeAuditId === auditId) {
      handleSelectAudit(remaining[0].id);
    }
  };

  // Estados de Modales
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isAuditoresModalOpen, setIsAuditoresModalOpen] = useState(false);
  const [isMapeoModalOpen, setIsMapeoModalOpen] = useState(false);
  const [isCompromisosModalOpen, setIsCompromisosModalOpen] = useState(false);
  const [isAuditoriasModalOpen, setIsAuditoriasModalOpen] = useState(false);
  
  const [appDialogState, setAppDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'ALERT',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    onConfirmAction: null,
    onCancelAction: null
  });

  const [agentModalState, setAgentModalState] = useState({
    isOpen: false,
    mode: 'EDIT',
    targetId: null
  });

  const [agents, setAgents] = useState(DEFAULT_AGENTS);
  const [selectedAgentId, setSelectedAgentId] = useState(DEFAULT_AGENTS[0].id);

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];
  const customPrompt = selectedAgent ? selectedAgent.instrucciones : '';

  const [apiConfig, setApiConfig] = useState({
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-2.0-flash'
  });

  const handleOpenAgentManager = (options = {}) => {
    setAgentModalState({
      isOpen: true,
      mode: options.mode || 'EDIT',
      targetId: options.targetId || selectedAgentId
    });
  };

  const handleSaveAgent = (agentData) => {
    if (agentModalState.mode === 'CREATE') {
      const newAgent = {
        ...agentData,
        id: `agent-${Date.now()}`
      };
      setAgents(prev => [...prev, newAgent]);
      setSelectedAgentId(newAgent.id);
    } else {
      setAgents(prev => prev.map(a => a.id === agentData.id ? agentData : a));
    }
  };

  const handleDeleteAgent = (agentId) => {
    if (agents.length <= 1) {
      setAppDialogState({
        isOpen: true,
        title: 'Acción No Permitida',
        message: 'No puede eliminar el único agente disponible.',
        type: 'ALERT'
      });
      return;
    }
    const remaining = agents.filter(a => a.id !== agentId);
    setAgents(remaining);
    if (selectedAgentId === agentId) {
      setSelectedAgentId(remaining[0].id);
    }
  };

  // Iniciar auditoría enfocada en un área específica desde el Dashboard
  const handleStartAuditForArea = (areaId) => {
    setSelectedAreaId(areaId);
    const areaNumerals = mapeoNumerales.filter(n => (n.areaIds || []).includes(areaId));
    setNumerales(areaNumerals.length > 0 ? areaNumerals : mapeoNumerales);
    setCurrentView('AUDIT');
    setStep(1);
  };

  const handleNavigateToAudit = () => {
    setCurrentView('AUDIT');
  };

  const handleAuditComplete = (output) => {
    setAuditResult(output);
    syncActiveAuditToStorage({ auditResult: output });

    if (output?.subnumeralesResultados) {
      const updatedHistory = { ...evaluationsHistory };
      output.subnumeralesResultados.forEach(res => {
        const estadoField = (res.dynamicFields || []).find(f => 
          f.label.toLowerCase().includes('estado') || 
          f.label.toLowerCase().includes('cumplimiento') ||
          (typeof f.value === 'string' && (f.value.toUpperCase().includes('CUMPLE') || f.value.toUpperCase().includes('NO CUMPLE')))
        );

        let est = 'CUMPLE';
        if (estadoField) {
          const val = (estadoField.value || '').toUpperCase();
          if (val.includes('NO CUMPLE')) est = 'NO CUMPLE';
          else if (val.includes('CUMPLE')) est = 'CUMPLE';
        }

        updatedHistory[res.subnumeral] = {
          subnumeral: res.subnumeral,
          requisito: res.requisito || '',
          estado: est,
          dynamicFields: res.dynamicFields || [],
          justificacion: res.requisito || '',
          comentario: updatedHistory[res.subnumeral]?.comentario || '',
          fechaCompromiso: updatedHistory[res.subnumeral]?.fechaCompromiso || '',
          accionPropuesta: updatedHistory[res.subnumeral]?.accionPropuesta || '',
          responsableAccion: updatedHistory[res.subnumeral]?.responsableAccion || '',
          estadoCompromiso: updatedHistory[res.subnumeral]?.estadoCompromiso || 'ABIERTO',
          auditorConfirmado: false,
          fecha: new Date().toLocaleDateString(),
          historialTrazabilidad: updatedHistory[res.subnumeral]?.historialTrazabilidad || [
            {
              fecha: new Date().toLocaleString(),
              tipo: 'CREACION',
              estado: 'ABIERTO',
              auditor: currentUser?.nombre || 'Auditor ISO 17025',
              comentario: 'Evaluación preliminar de IA generada.'
            }
          ]
        };
      });
      setEvaluationsHistory(updatedHistory);
    }
  };

  const handleUpdateEvaluationsHistory = (subnumeral, reviewData) => {
    setEvaluationsHistory(prev => {
      const prevItem = prev[subnumeral] || {};
      return {
        ...prev,
        [subnumeral]: {
          ...prevItem,
          estado: reviewData.estado,
          comentario: reviewData.comentario,
          fechaCompromiso: reviewData.fechaCompromiso,
          accionPropuesta: reviewData.accionPropuesta,
          responsableAccion: reviewData.responsableAccion,
          estadoCompromiso: prevItem.estadoCompromiso || 'ABIERTO',
          auditorConfirmado: reviewData.confirmado,
          fecha: new Date().toLocaleDateString()
        }
      };
    });
  };

  const handleSaveDraft = (reviews) => {
    const updated = { ...evaluationsHistory };
    Object.entries(reviews).forEach(([subnum, rev]) => {
      const prevItem = updated[subnum] || {};
      updated[subnum] = {
        ...prevItem,
        estado: rev.estado,
        comentario: rev.comentario,
        fechaCompromiso: rev.fechaCompromiso || prevItem.fechaCompromiso || '',
        accionPropuesta: rev.accionPropuesta || prevItem.accionPropuesta || '',
        responsableAccion: rev.responsableAccion || prevItem.responsableAccion || '',
        estadoCompromiso: prevItem.estadoCompromiso || 'ABIERTO',
        auditorConfirmado: rev.confirmado,
        esBorrador: true,
        fecha: new Date().toLocaleDateString()
      };
    });
    setEvaluationsHistory(updated);

    setAppDialogState({
      isOpen: true,
      title: 'Borrador Guardado con Éxito',
      message: 'Los dictámenes, fechas de compromiso y comentarios se han guardado en esta auditoría. Puede continuar editando o retomar más tarde.',
      type: 'ALERT',
      confirmText: 'Entendido'
    });
  };

  const handleSaveDefinitive = (reviews) => {
    const updated = { ...evaluationsHistory };
    let confirmadosCount = 0;
    Object.entries(reviews).forEach(([subnum, rev]) => {
      if (rev.confirmado) {
        confirmadosCount++;
        const prevItem = updated[subnum] || {};
        updated[subnum] = {
          ...prevItem,
          estado: rev.estado,
          comentario: rev.comentario,
          fechaCompromiso: rev.fechaCompromiso || prevItem.fechaCompromiso || '',
          accionPropuesta: rev.accionPropuesta || prevItem.accionPropuesta || '',
          responsableAccion: rev.responsableAccion || prevItem.responsableAccion || '',
          estadoCompromiso: prevItem.estadoCompromiso || 'ABIERTO',
          auditorConfirmado: true,
          fecha: new Date().toLocaleDateString(),
          historialTrazabilidad: prevItem.historialTrazabilidad || [
            {
              fecha: new Date().toLocaleString(),
              tipo: 'CREACION',
              estado: 'ABIERTO',
              auditor: currentUser?.nombre || 'Auditor ISO 17025',
              comentario: 'Dictamen de auditoría validado y confirmado.'
            }
          ]
        };
      }
    });
    setEvaluationsHistory(updated);

    setEvidencias([]);
    setAuditResult(null);
    syncActiveAuditToStorage({ evidencias: [], auditResult: null });

    setAppDialogState({
      isOpen: true,
      title: 'Auditoría Guardada Definitivamente',
      message: `Se han consolidado ${confirmadosCount} numerales en el Dashboard de esta auditoría. Los pasos 2, 3 y 4 se han preparado para una nueva sesión. ¿Qué desea hacer a continuación?`,
      type: 'CONFIRM',
      confirmText: '📊 Ir al Dashboard Principal',
      cancelText: '⚡ Auditar Siguientes Numerales',
      onConfirmAction: () => {
        setCurrentView('DASHBOARD');
      },
      onCancelAction: () => {
        setStep(1);
        setCurrentView('AUDIT');
      }
    });
  };

  const handleUpdateCommitment = (codigo, followupData) => {
    setEvaluationsHistory(prev => {
      const current = prev[codigo] || {};
      const historyList = current.historialTrazabilidad ? [...current.historialTrazabilidad] : [];
      
      historyList.push({
        fecha: new Date().toLocaleString(),
        tipo: 'SEGUIMIENTO',
        estado: followupData.nuevoEstadoCompromiso,
        auditor: followupData.auditor || currentUser?.nombre || 'Auditor',
        comentario: followupData.notaSeguimiento
      });

      return {
        ...prev,
        [codigo]: {
          ...current,
          estadoCompromiso: followupData.nuevoEstadoCompromiso,
          historialTrazabilidad: historyList
        }
      };
    });
  };

  // Conteo de compromisos pendientes (filtrado si es auditor de área)
  const scopedMapeo = currentUser?.role === 'AUDITOR' && currentUser.areaId
    ? mapeoNumerales.filter(n => (n.areaIds || []).includes(currentUser.areaId))
    : mapeoNumerales;

  const compromisosPendientesCount = scopedMapeo.filter(num => {
    const item = evaluationsHistory[num.codigo] || evaluationsHistory[num.id];
    return item && (item.estado === 'NO CUMPLE' || item.estado === 'OBSERVACION' || item.fechaCompromiso) && item.estadoCompromiso !== 'SUBSANADO';
  }).length;

  const handleExportPDF = () => {
    if (auditResult) {
      exportAuditReportPDF(auditResult, numerales, evidencias);
    }
  };

  const handleResetAll = () => {
    setAppDialogState({
      isOpen: true,
      title: 'Reiniciar Sesión de Auditoría',
      message: '¿Desea limpiar las evidencias y resultados temporales de esta sesión?',
      type: 'CONFIRM',
      confirmText: 'Sí, reiniciar',
      cancelText: 'Cancelar',
      onConfirmAction: () => {
        setNumerales(currentUser?.role === 'AUDITOR' ? scopedMapeo : mapeoNumerales);
        setEvidencias([]);
        setAuditResult(null);
        setStep(1);
      }
    });
  };

  // Si no hay usuario autenticado, renderizar la pantalla de Login
  if (!currentUser) {
    return <LoginScreen areas={areas} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Header Superior con Control de Roles y Botón de Logout */}
      <Header
        currentView={currentView}
        onChangeView={(view) => setCurrentView(view)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenAuditoresModal={() => setIsAuditoresModalOpen(true)}
        onOpenMapeoModal={() => setIsMapeoModalOpen(true)}
        onOpenCompromisosModal={() => setIsCompromisosModalOpen(true)}
        onOpenAuditoriasModal={() => setIsAuditoriasModalOpen(true)}
        activeAudit={activeAudit}
        compromisosPendientesCount={compromisosPendientesCount}
        onResetAll={handleResetAll}
        apiConfig={apiConfig}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* VISTA 1: DASHBOARD PRINCIPAL DE AVANCE POR ÁREAS (PANTALLA DE INICIO) */}
        {currentView === 'DASHBOARD' && (
          <MainAreaDashboard
            areas={areas}
            mapeoNumerales={mapeoNumerales}
            evaluationsHistory={evaluationsHistory}
            onStartAuditForArea={handleStartAuditForArea}
            onNavigateToAudit={handleNavigateToAudit}
            onOpenCompromisosModal={() => setIsCompromisosModalOpen(true)}
            currentUser={currentUser}
          />
        )}

        {/* VISTA 2: FLUJO DE AUDITORÍA GUIADA (4 PASOS) */}
        {currentView === 'AUDIT' && (
          <div className="space-y-6 animate-fadeIn">
            {/* 4-Step Navigation Wizard */}
            <StepNavigation
              currentStep={step}
              setStep={setStep}
              numSubnumerales={numerales.length}
              numEvidencias={evidencias.length}
              hasResults={!!auditResult}
            />

            {step === 1 && (
              <NumeralesSection
                numerales={numerales}
                setNumerales={setNumerales}
                onNextStep={() => setStep(2)}
                areas={areas}
                mapeoNumerales={mapeoNumerales}
                selectedAreaId={selectedAreaId}
                onSelectAreaId={(id) => setSelectedAreaId(id)}
                evaluationsHistory={evaluationsHistory}
                currentUser={currentUser}
              />
            )}

            {step === 2 && (
              <EvidenciasSection
                evidencias={evidencias}
                setEvidencias={(evList) => {
                  setEvidencias(evList);
                  syncActiveAuditToStorage({ evidencias: evList });
                }}
                onNextStep={() => setStep(3)}
              />
            )}

            {step === 3 && (
              <MotorAnalisisSection
                numerales={numerales}
                evidencias={evidencias}
                apiConfig={apiConfig}
                customPrompt={customPrompt}
                agents={agents}
                selectedAgentId={selectedAgentId}
                onSelectAgent={(id) => setSelectedAgentId(id)}
                onOpenAgentManager={handleOpenAgentManager}
                onDeleteAgent={handleDeleteAgent}
                onAuditComplete={handleAuditComplete}
                onGoToResults={() => setStep(4)}
                currentUser={currentUser}
              />
            )}

            {step === 4 && (
              <ResultadosDashboard
                auditResult={auditResult}
                numerales={numerales}
                evidencias={evidencias}
                selectedAgent={selectedAgent}
                onExportPDF={handleExportPDF}
                onUpdateEvaluationsHistory={handleUpdateEvaluationsHistory}
                onSaveDraft={handleSaveDraft}
                onSaveDefinitive={handleSaveDefinitive}
              />
            )}
          </div>
        )}

      </main>

      {/* MODALES DE LA APLICACIÓN */}
      <AuditoriasModal
        isOpen={isAuditoriasModalOpen}
        onClose={() => setIsAuditoriasModalOpen(false)}
        auditCycles={auditCycles}
        activeAuditId={activeAuditId}
        onSelectAudit={handleSelectAudit}
        onCreateAudit={handleCreateAudit}
        onUpdateAudit={handleUpdateAudit}
        onDeleteAudit={handleDeleteAudit}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiConfig={apiConfig}
        setApiConfig={setApiConfig}
      />

      <AgentManagerModal
        isOpen={agentModalState.isOpen}
        onClose={() => setAgentModalState({ isOpen: false, mode: 'EDIT', targetId: null })}
        mode={agentModalState.mode}
        agents={agents}
        targetId={agentModalState.targetId}
        onSaveAgent={handleSaveAgent}
      />

      <AuditoresModal
        isOpen={isAuditoresModalOpen}
        onClose={() => setIsAuditoresModalOpen(false)}
        areas={areas}
        setAreas={setAreas}
        mapeoNumerales={mapeoNumerales}
      />

      <MapeoModal
        isOpen={isMapeoModalOpen}
        onClose={() => setIsMapeoModalOpen(false)}
        mapeoNumerales={mapeoNumerales}
        setMapeoNumerales={setMapeoNumerales}
        areas={areas}
      />

      <CompromisosModal
        isOpen={isCompromisosModalOpen}
        onClose={() => setIsCompromisosModalOpen(false)}
        evaluationsHistory={evaluationsHistory}
        mapeoNumerales={mapeoNumerales}
        areas={areas}
        onUpdateCommitment={handleUpdateCommitment}
        currentUser={currentUser}
      />

      <ConfirmDialogModal
        isOpen={appDialogState.isOpen}
        onClose={() => setAppDialogState(prev => ({ ...prev, isOpen: false }))}
        title={appDialogState.title}
        message={appDialogState.message}
        type={appDialogState.type}
        confirmText={appDialogState.confirmText}
        cancelText={appDialogState.cancelText}
        onConfirm={() => {
          if (appDialogState.onConfirmAction) appDialogState.onConfirmAction();
          setAppDialogState(prev => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => {
          if (appDialogState.onCancelAction) appDialogState.onCancelAction();
          setAppDialogState(prev => ({ ...prev, isOpen: false }));
        }}
      />

    </div>
  );
}
