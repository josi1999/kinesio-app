import React, { useRef } from 'react';
import {
  Activity,
  Download,
  FileText,
  Upload,
  UserCog,
  UserPlus,
} from 'lucide-react';
import { type BackupPayload, useKineStore } from '../store/useKineStore';
import { downloadJsonFile } from '../utils/fileHelpers';

interface HeaderProps {
  onOpenProfileModal: () => void;
  onOpenPdfModal: () => void;
  onNotify: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenProfileModal,
  onOpenPdfModal,
  onNotify,
}) => {
  const {
    professional,
    currentPlan,
    exercises,
    resetNewPatient,
    getBackupPayload,
    importBackupPayload,
  } = useKineStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExportJson = () => {
    const payload = getBackupPayload();
    const dateStr = new Date().toISOString().split('T')[0];
    downloadJsonFile(payload, `kinegen-biblioteca-${dateStr}.json`);
    onNotify('Biblioteca y configuración exportadas en archivo .json.', 'success');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string) as Partial<BackupPayload>;
        const ok = importBackupPayload(parsed);
        if (ok) {
          onNotify(
            'Biblioteca, plantillas y perfil restaurados exitosamente desde el archivo .json.',
            'success'
          );
        } else {
          onNotify('El archivo JSON no contiene un formato válido de KineGen.', 'warning');
        }
      } catch {
        onNotify('Error al leer el archivo .json. Verifica que sea un backup válido.', 'warning');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleNewPatientClick = () => {
    resetNewPatient();
    onNotify(
      'Ficha lista para un Nuevo Paciente. Tu biblioteca y plantillas se mantienen intactas.',
      'info'
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Identidad de Marca + Profesional Activo */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-700 to-teal-900 flex items-center justify-center text-white shadow-sm">
            <Activity className="w-5 h-5 text-teal-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-display font-bold text-slate-900 tracking-tight">
                KineGen <span className="text-teal-700">Pro</span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                Prescripción Kinésica
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="font-medium text-slate-700">
                {professional.name || 'Profesional sin configurar'}
              </span>
              {professional.license && (
                <>
                  <span>•</span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {professional.license}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Barra de Herramientas y Sincronización */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Botón Nuevo Paciente */}
          <button
            id="header-btn-new-patient"
            type="button"
            onClick={handleNewPatientClick}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition-colors"
            title="Limpia los datos del paciente actual y el plan activo conservando tu biblioteca"
          >
            <UserPlus className="w-4 h-4 text-teal-700" />
            <span>Nuevo Paciente</span>
          </button>

          {/* Sincronización Manual: Exportar / Importar JSON */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/80 p-0.5">
            <button
              id="header-btn-export-json"
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-white hover:text-teal-700 hover:shadow-sm transition-all"
              title={`Exportar biblioteca (${exercises.length} ejercicios) y estado en JSON`}
            >
              <Download className="w-3.5 h-3.5 text-teal-700" />
              <span className="hidden md:inline">Exportar Biblioteca</span>
              <span className="md:hidden">Exportar</span>
            </button>

            <div className="w-px h-4 bg-slate-200 mx-0.5" />

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportJson}
              className="hidden"
              id="header-import-json-input"
            />
            <button
              id="header-btn-import-json"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-white hover:text-teal-700 hover:shadow-sm transition-all"
              title="Restaurar biblioteca y configuración desde un archivo .json"
            >
              <Upload className="w-3.5 h-3.5 text-sky-600" />
              <span>Importar</span>
            </button>
          </div>

          {/* Perfil Profesional (Settings) */}
          <button
            id="header-btn-profile-settings"
            type="button"
            onClick={onOpenProfileModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:border-teal-600/40 hover:bg-teal-50/40 transition-all"
          >
            <UserCog className="w-4 h-4 text-teal-700" />
            <span className="hidden sm:inline">Perfil y Firma</span>
          </button>

          {/* Exportar PDF (Plan Paciente / Ficha Profesional) */}
          <button
            id="header-btn-open-pdf"
            type="button"
            onClick={onOpenPdfModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-teal-700 text-white hover:bg-teal-600 shadow-sm transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Exportar PDF</span>
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-teal-900/60 text-teal-100">
              {currentPlan.length}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
