import { useCallback, useState } from 'react';
import {
  Award,
  Building2,
  CheckCircle2,
  FileSignature,
  FileText,
  Info,
  AlertTriangle,
  Plus,
  Sparkles,
  UserCog,
} from 'lucide-react';
import { Header } from './components/Header';
import { PatientCard } from './components/PatientCard';
import { ExerciseLibrary } from './components/ExerciseLibrary';
import { PlanEditor } from './components/PlanEditor';
import { ProfessionalProfileModal } from './components/ProfessionalProfileModal';
import { CustomExerciseModal } from './components/CustomExerciseModal';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { useKineStore } from './store/useKineStore';

interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning';
}

export function App() {
  const { professional, currentPlan, exercises, templates } = useKineStore();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCustomExerciseModalOpen, setIsCustomExerciseModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfInitialMode, setPdfInitialMode] = useState<'patient' | 'professional'>('patient');
  const [toast, setToast] = useState<ToastState | null>(null);

  const handleNotify = useCallback(
    (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
      const id = Date.now();
      setToast({ id, message, type });
      setTimeout(() => {
        setToast((prev) => (prev?.id === id ? null : prev));
      }, 4200);
    },
    []
  );

  const handleOpenPdfModal = (mode: 'patient' | 'professional' = 'patient') => {
    setPdfInitialMode(mode);
    setIsPdfModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Navegación Principal y Acciones Globales */}
      <Header
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenPdfModal={() => handleOpenPdfModal('patient')}
        onNotify={handleNotify}
      />

      {/* Barra de Estado Clínico y Acceso Rápido al Perfil Profesional */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-slate-600">
            <div className="flex items-center gap-2">
              {professional.logoBase64 && (
                <img
                  src={professional.logoBase64}
                  alt="Logo consultorio"
                  className="w-6 h-6 rounded-md object-contain border border-slate-200"
                />
              )}
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                <Building2 className="w-3.5 h-3.5 text-teal-700" />
                {professional.clinicName || 'Consultorio sin nombre'}
              </span>
            </div>

            <span className="hidden md:inline text-slate-300">|</span>

            <span className="inline-flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-teal-700" />
              <span>Matrícula:</span>
              <strong className="font-mono text-slate-800">
                {professional.license || 'Pendiente'}
              </strong>
            </span>

            <span className="hidden md:inline text-slate-300">|</span>

            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="inline-flex items-center gap-1.5 font-medium text-teal-700 hover:text-teal-800 underline-offset-2 hover:underline"
            >
              <FileSignature className="w-3.5 h-3.5" />
              {professional.signatureBase64
                ? 'Firma digital configurada (Editar)'
                : 'Dibujar firma para PDFs'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCustomExerciseModalOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-teal-700" />
              <span>Agregar Mi Ejercicio ({exercises.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors"
            >
              <UserCog className="w-3.5 h-3.5" />
              <span>Configurar Consultorio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Área de Trabajo Clínica (Split Workbench) */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Columna Izquierda (5 cols): Ficha del Paciente + Biblioteca y Generador */}
          <div className="xl:col-span-5 space-y-6">
            <PatientCard onNotify={handleNotify} />
            <ExerciseLibrary
              onOpenCustomModal={() => setIsCustomExerciseModalOpen(true)}
              onNotify={handleNotify}
            />
          </div>

          {/* Columna Derecha (7 cols): Editor del Plan de Ejercicios + Exportación Dual PDF */}
          <div className="xl:col-span-7 space-y-6">
            <PlanEditor
              onOpenPdfModal={handleOpenPdfModal}
              onNotify={handleNotify}
            />

            {/* Tarjeta de Resumen de Exportación Dual */}
            <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-2xl p-5 text-white shadow-clinical flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  Documentos Clínicos Listos para Descargar
                </div>
                <h3 className="text-base font-display font-bold">
                  Generación de PDFs para Paciente e Historia Clínica
                </h3>
                <p className="text-xs text-teal-100/90 max-w-xl">
                  Imprime o envía por WhatsApp el <strong>Plan Visual para el Paciente</strong> (con ilustraciones grandes, lenguaje claro y firma) o archiva la <strong>Ficha de Registro Profesional</strong> (con escala EVA y tabla técnica dosificada).
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
                <button
                  id="cta-banner-pdf-professional"
                  type="button"
                  onClick={() => handleOpenPdfModal('professional')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
                >
                  <FileText className="w-4 h-4 text-teal-200" />
                  <span>Ficha Profesional</span>
                </button>
                <button
                  id="cta-banner-pdf-patient"
                  type="button"
                  onClick={() => handleOpenPdfModal('patient')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white text-teal-950 hover:bg-teal-50 shadow-sm transition-all"
                >
                  <FileText className="w-4 h-4 text-teal-700" />
                  <span>Plan Paciente ({currentPlan.length})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Pie de Página */}
      <footer className="bg-white border-t border-slate-200/80 py-4 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <div>
            <strong className="text-slate-700 font-display">KineGen Pro</strong> — Plataforma de Prescripción de Ejercicio Terapéutico (100% Local & Offline-First).
          </div>
          <div className="flex items-center gap-4">
            <span>Biblioteca: {exercises.length} ejercicios</span>
            <span>•</span>
            <span>Plantillas: {templates.length}</span>
            <span>•</span>
            <span>Almacenamiento persistente en navegador</span>
          </div>
        </div>
      </footer>

      {/* Modales */}
      <ProfessionalProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onNotify={handleNotify}
      />

      <CustomExerciseModal
        isOpen={isCustomExerciseModalOpen}
        onClose={() => setIsCustomExerciseModalOpen(false)}
        onNotify={handleNotify}
      />

      <PdfPreviewModal
        isOpen={isPdfModalOpen}
        initialMode={pdfInitialMode}
        onClose={() => setIsPdfModalOpen(false)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onNotify={handleNotify}
      />

      {/* Notificación Flotante (Toast) */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 max-w-md animate-bounce"
          style={{ animationIterationCount: 1, animationDuration: '0.35s' }}
        >
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-clinical-lg border text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-950 text-emerald-50 border-emerald-700'
                : toast.type === 'warning'
                ? 'bg-amber-950 text-amber-50 border-amber-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toast.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-teal-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
