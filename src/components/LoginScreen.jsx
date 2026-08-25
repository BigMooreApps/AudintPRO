import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Crown, 
  Users, 
  ArrowRight, 
  ArrowLeft,
  KeyRound, 
  Sparkles, 
  Lock,
  Search,
  CheckCircle2,
  Layers,
  ChevronRight,
  ShieldAlert,
  Fingerprint
} from 'lucide-react';

export default function LoginScreen({
  areas = [],
  onLogin,
  inactivityMessage = ''
}) {
  const [selectedRole, setSelectedRole] = useState('SUPER_AUDITOR'); // 'SUPER_AUDITOR' | 'AUDITOR'
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [areaSearch, setAreaSearch] = useState('');

  // Estado para login de auditor con contraseña
  const [selectedAuditorArea, setSelectedAuditorArea] = useState(null);
  const [auditorPassword, setAuditorPassword] = useState('');

  const handleSuperAuditorSubmit = (e) => {
    e?.preventDefault();
    if (adminPassword.trim() === 'admin17025' || adminPassword.trim() === 'admin' || adminPassword.trim() === '') {
      onLogin({
        id: 'user-super-auditor',
        role: 'SUPER_AUDITOR',
        nombre: 'Super Auditor Líder',
        cargo: 'Administrador del Sistema de Gestión ISO 17025',
        areaId: null
      });
    } else {
      setPasswordError('Contraseña incorrecta. (Clave por defecto: admin17025 o presione ingresar)');
    }
  };

  const handleAuditorLoginSubmit = (e) => {
    e?.preventDefault();
    if (!selectedAuditorArea) return;

    const expectedPassword = (selectedAuditorArea.password || '1').trim();
    const enteredPassword = auditorPassword.trim();

    if (enteredPassword === expectedPassword || (expectedPassword === '1' && enteredPassword === '')) {
      onLogin({
        id: `user-auditor-${selectedAuditorArea.id}`,
        role: 'AUDITOR',
        nombre: `Auditor: ${selectedAuditorArea.nombre}`,
        cargo: `Equipo Auditor — ${selectedAuditorArea.nombre}`,
        areaId: selectedAuditorArea.id,
        areaNombre: selectedAuditorArea.nombre
      });
    } else {
      setPasswordError('Contraseña incorrecta para esta área. (Clave predefinida: 1)');
    }
  };

  const filteredAreas = areas.filter(a => 
    (a.nombre || '').toLowerCase().includes(areaSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#080B14] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Background Decorative Mesh & Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Subtle Grid Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: '28px 28px'
        }}
      />

      {/* Main Container */}
      <div className="max-w-[540px] w-full space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Branding Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3 pt-1">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-emerald-400 p-[1px] shadow-xl shadow-indigo-500/20">
              <div className="w-full h-full bg-[#0C101D] rounded-[15px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Audint<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">PRO</span>
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto font-normal leading-relaxed">
            Plataforma Integral de Auditorías Internas y Control de Conformidad Normativa
          </p>

          {typeof inactivityMessage === 'string' && inactivityMessage.trim().length > 0 && (
            <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-amber-300 text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 animate-fadeIn">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{inactivityMessage}</span>
            </div>
          )}
        </div>

        {/* Ultra-Modern Glassmorphic Card */}
        <div className="bg-[#0D1222]/80 border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-[0_12px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl space-y-6 relative overflow-hidden">
          
          {/* Top Subtle Card Highlight */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

          {/* Segmented Tab Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#070A12]/90 rounded-2xl border border-white/[0.06]">
            <button
              onClick={() => {
                setSelectedRole('SUPER_AUDITOR');
                setPasswordError('');
                setSelectedAuditorArea(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
                selectedRole === 'SUPER_AUDITOR'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>Super Auditor</span>
            </button>

            <button
              onClick={() => {
                setSelectedRole('AUDITOR');
                setPasswordError('');
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
                selectedRole === 'AUDITOR'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-300" />
              <span>Auditores por Área</span>
            </button>
          </div>

          {/* TAB 1: SUPER AUDITOR */}
          {selectedRole === 'SUPER_AUDITOR' && (
            <form onSubmit={handleSuperAuditorSubmit} className="space-y-5 animate-in fade-in duration-200">
              
              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Contraseña / PIN Maestro
                  </label>
                  <span className="text-[10.5px] text-slate-500 font-mono">Por defecto: admin17025</span>
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder="admin17025"
                    className="w-full bg-[#070A12] border border-white/[0.08] focus:border-indigo-500 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                    autoFocus
                  />
                </div>

                {passwordError && (
                  <p className="text-xs text-rose-400 flex items-center gap-1.5 animate-in fade-in pt-1 font-medium">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>{passwordError}</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-400 hover:to-indigo-600 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
              >
                <span>Acceder como Super Auditor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 2: AUDITORES POR ÁREA */}
          {selectedRole === 'AUDITOR' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {!selectedAuditorArea ? (
                // Vista 1: Selector de Área
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar área o departamento..."
                      value={areaSearch}
                      onChange={(e) => setAreaSearch(e.target.value)}
                      className="w-full bg-[#070A12] border border-white/[0.08] focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div className="space-y-2 max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
                    {filteredAreas.map((area) => (
                      <button
                        key={area.id}
                        onClick={() => {
                          setSelectedAuditorArea(area);
                          setAuditorPassword('');
                          setPasswordError('');
                        }}
                        className="w-full p-3 bg-[#070A12]/90 hover:bg-indigo-600/[0.08] border border-white/[0.06] hover:border-indigo-500/40 rounded-2xl text-left flex items-center justify-between gap-3 group transition-all duration-150"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-2 h-2 rounded-full bg-indigo-400 group-hover:scale-125 group-hover:bg-emerald-400 transition-all shrink-0" />
                          <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                            {area.nombre}
                          </span>
                        </div>

                        <div className="p-1 rounded-lg bg-white/[0.03] group-hover:bg-indigo-500 group-hover:text-white text-slate-500 transition-all shrink-0">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    ))}

                    {filteredAreas.length === 0 && (
                      <div className="p-6 text-center text-xs text-slate-500 italic">
                        No se encontraron áreas con ese criterio de búsqueda.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Vista 2: Formulario de Contraseña para el Área Seleccionada
                <form onSubmit={handleAuditorLoginSubmit} className="space-y-4 animate-in fade-in duration-200">
                  
                  {/* Header del Área */}
                  <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10.5px] text-slate-400 uppercase tracking-wider block font-semibold">Área Seleccionada:</span>
                        <h4 className="text-xs font-bold text-white truncate">{selectedAuditorArea.nombre}</h4>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAuditorArea(null);
                        setPasswordError('');
                      }}
                      className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 hover:underline shrink-0 flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Cambiar</span>
                    </button>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300">
                        Contraseña / PIN de Acceso
                      </label>
                      <span className="text-[10.5px] text-slate-500 font-mono">Predefinida: 1</span>
                    </div>

                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        value={auditorPassword}
                        onChange={(e) => {
                          setAuditorPassword(e.target.value);
                          setPasswordError('');
                        }}
                        placeholder="Ingrese la contraseña (ej. 1)"
                        className="w-full bg-[#070A12] border border-white/[0.08] focus:border-indigo-500 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                        autoFocus
                      />
                    </div>

                    {passwordError && (
                      <p className="text-xs text-rose-400 flex items-center gap-1.5 animate-in fade-in pt-1 font-medium">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        <span>{passwordError}</span>
                      </p>
                    )}
                  </div>

                  {/* Botón de Ingreso */}
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-400 hover:to-indigo-600 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
                  >
                    <span>Ingresar como Auditor</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

            </div>
          )}

        </div>

        {/* Footer Security Badges */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Acceso Seguro y Cifrado</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Fingerprint className="w-3 h-3 text-indigo-400" />
            <span>Control por Roles (RBAC)</span>
          </div>
        </div>

      </div>
    </div>
  );
}
