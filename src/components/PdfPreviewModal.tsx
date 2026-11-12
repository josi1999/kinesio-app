import React, { useRef, useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Download,
  FileSignature,
  FileText,
  HeartHandshake,
  Loader2,
  Printer,
  User,
  X,
} from 'lucide-react';
import { ALL_DAYS } from '../types/kine';
import { useKineStore } from '../store/useKineStore';
import { getEvaDescriptor } from './PatientCard';
import { exportElementToPdf } from '../utils/pdfExport';

interface PdfPreviewModalProps {
  isOpen: boolean;
  initialMode?: 'patient' | 'professional';
  onClose: () => void;
  onOpenProfileModal: () => void;
  onNotify: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  initialMode = 'patient',
  onClose,
  onOpenProfileModal,
  onNotify,
}) => {
  const { professional, patient, currentPlan } = useKineStore();
  const [mode, setMode] = useState<'patient' | 'professional'>(initialMode);
  const [isGenerating, setIsGenerating] = useState(false);
  const printableAreaRef = useRef<HTMLDivElement | null>(null);

  // Sincronizar modo inicial cuando se abre
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const evaDescriptor = getEvaDescriptor(patient.evaScore);
  const safePatientSlug = (patient.name || 'paciente')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const handleDownloadPdf = async () => {
    if (!printableAreaRef.current) return;
    if (currentPlan.length === 0) {
      onNotify('Agrega al menos un ejercicio al plan antes de generar el PDF.', 'warning');
      return;
    }

    setIsGenerating(true);
    try {
      const prefix = mode === 'patient' ? 'plan-kinesico' : 'ficha-clinica';
      const filename = `${prefix}-${safePatientSlug}-${patient.evaluationDate || 'hoy'}.pdf`;
      await exportElementToPdf(printableAreaRef.current, filename);
      onNotify(
        mode === 'patient'
          ? 'PDF del Plan para el Paciente descargado correctamente.'
          : 'PDF de la Ficha de Registro Profesional descargado correctamente.',
        'success'
      );
    } catch {
      onNotify('Ocurrió un error al generar el archivo PDF.', 'warning');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-900/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-studio-title"
    >
      {/* Barra Superior de Control del Estudio PDF */}
      <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-600/20 border border-teal-500/30 text-teal-300">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h2 id="pdf-studio-title" className="text-sm sm:text-base font-display font-bold">
              Estudio de Exportación Clínica PDF
            </h2>
            <p className="text-xs text-slate-400">
              Selecciona el formato de documento y descárgalo en tamaño A4 listo para enviar o archivar.
            </p>
          </div>
        </div>

        {/* Selector de Modo: Plan para el Paciente vs Ficha de Registro Profesional */}
        <div className="flex items-center rounded-xl bg-slate-800 p-1 border border-slate-700">
          <button
            id="tab-pdf-mode-patient"
            type="button"
            onClick={() => setMode('patient')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'patient'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Plan para el Paciente</span>
          </button>

          <button
            id="tab-pdf-mode-professional"
            type="button"
            onClick={() => setMode('professional')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'professional'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Ficha de Registro Profesional</span>
          </button>
        </div>

        {/* Botones de Descarga y Cierre */}
        <div className="flex items-center gap-2">
          {!professional.signatureBase64 && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenProfileModal();
              }}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-400/30 hover:bg-amber-500/25 transition-colors"
            >
              <FileSignature className="w-3.5 h-3.5" />
              <span>Dibujar Firma</span>
            </button>
          )}

          <button
            id="btn-download-pdf-document"
            type="button"
            disabled={isGenerating || currentPlan.length === 0}
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-sm disabled:opacity-50 transition-all"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generando PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>
                  Descargar PDF ({mode === 'patient' ? 'Plan Paciente' : 'Ficha Clínica'})
                </span>
              </>
            )}
          </button>

          <button
            id="btn-close-pdf-modal"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Cerrar vista previa de PDF"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Lienzo de Previsualización A4 */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-800/90">
        {/* Hoja A4 Blanca (Ancho fijo 820px para proporción óptima en html2canvas -> A4) */}
        <div
          ref={printableAreaRef}
          id="pdf-a4-sheet"
          className="w-full max-w-[820px] bg-white text-slate-900 rounded-xl shadow-2xl p-8 sm:p-10 space-y-6 self-start"
        >
          {/* =====================================================================
              MODO 1: PLAN VISUAL Y AMIGABLE PARA EL PACIENTE
             ===================================================================== */}
          {mode === 'patient' ? (
            <>
              {/* Encabezado Institucional Amigable */}
              <div className="flex items-center justify-between gap-6 pb-5 border-b-2 border-teal-700">
                <div className="flex items-center gap-4">
                  {professional.logoBase64 && (
                    <img
                      src={professional.logoBase64}
                      alt="Logo consultorio"
                      className="w-16 h-16 object-contain rounded-xl border border-slate-200 p-1 bg-white"
                    />
                  )}
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200 mb-1">
                      Guía Personalizada de Rehabilitación Domiciliaria
                    </span>
                    <h1 className="text-xl font-display font-bold text-slate-900">
                      {professional.clinicName || 'Consultorio de Kinesiología y Fisioterapia'}
                    </h1>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {professional.name}
                      {professional.license ? ` • ${professional.license}` : ''}
                      {professional.specialty ? ` • ${professional.specialty}` : ''}
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-500 shrink-0">
                  <div className="font-mono font-bold text-slate-800">
                    Fecha: {patient.evaluationDate || new Date().toISOString().split('T')[0]}
                  </div>
                  {professional.phone && <div className="mt-0.5">{professional.phone}</div>}
                  {professional.email && <div className="mt-0.5">{professional.email}</div>}
                </div>
              </div>

              {/* Resumen del Paciente en Lenguaje Claro */}
              <div className="grid grid-cols-12 gap-4 p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80">
                <div className="col-span-5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">
                    Paciente
                  </span>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {patient.name || 'Paciente sin especificar'}
                    {patient.age ? (
                      <span className="text-xs font-normal text-slate-600 ml-1.5">
                        ({patient.age} años)
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="col-span-7">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">
                    Motivo del Plan / Objetivo Terapéutico
                  </span>
                  <div className="text-sm font-semibold text-slate-800 mt-0.5">
                    {patient.diagnosis || 'Plan personalizado de readaptación y movilidad'}
                  </div>
                </div>
              </div>

              {/* Pautas de Cuidado para el Paciente */}
              {patient.precautions && (
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-950 leading-relaxed">
                    <strong className="font-bold">Recomendación importante: </strong>
                    {patient.precautions}
                  </div>
                </div>
              )}

              {/* Tarjetas Visuales con Imágenes Grandes para el Paciente */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-display font-bold uppercase tracking-wider text-slate-700">
                    Tus Ejercicios Paso a Paso ({currentPlan.length})
                  </h2>
                  <span className="text-xs text-slate-500">
                    Marca los días indicados en verde
                  </span>
                </div>

                {currentPlan.map((item, idx) => (
                  <div
                    key={item.planItemId}
                    className="rounded-2xl border-2 border-slate-200 bg-white overflow-hidden"
                  >
                    <div className="grid grid-cols-12 gap-0">
                      {/* Imagen Grande del Ejercicio */}
                      <div className="col-span-5 bg-slate-50 border-r border-slate-200 p-3 flex flex-col justify-between">
                        <img
                          src={item.exercise.image}
                          alt={item.exercise.name}
                          className="w-full h-44 object-cover rounded-xl border border-slate-200 bg-white"
                        />
                        <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-teal-800 px-1">
                          <span>Zona: {item.exercise.zone}</span>
                          <span>Objetivo: {item.exercise.objective}</span>
                        </div>
                      </div>

                      {/* Explicación Simple + Dosificación Grande + Días */}
                      <div className="col-span-7 p-4 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-teal-700 text-white text-xs font-mono font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <h3 className="text-base font-display font-bold text-slate-900">
                              {item.exercise.name}
                            </h3>
                          </div>

                          <p className="text-xs text-slate-700 leading-relaxed mt-2">
                            {item.exercise.description}
                          </p>

                          {item.customNote && (
                            <div className="mt-2 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900">
                              <strong>Nota de tu kinesiólogo:</strong> {item.customNote}
                            </div>
                          )}
                        </div>

                        {/* Cajas de Series, Repeticiones y Descanso */}
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
                            <span className="text-[10px] font-bold uppercase text-slate-500 block">
                              Series
                            </span>
                            <span className="text-sm font-mono font-bold text-teal-800">
                              {item.sets} series
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
                            <span className="text-[10px] font-bold uppercase text-slate-500 block">
                              Repeticiones
                            </span>
                            <span className="text-sm font-mono font-bold text-teal-800">
                              {item.reps}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
                            <span className="text-[10px] font-bold uppercase text-slate-500 block">
                              Descanso
                            </span>
                            <span className="text-sm font-mono font-bold text-teal-800">
                              {item.rest}
                            </span>
                          </div>
                        </div>

                        {/* Días de la Semana Visuales */}
                        <div className="pt-1 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-slate-600">
                            Días asignados:
                          </span>
                          <div className="flex items-center gap-1">
                            {ALL_DAYS.map((d) => {
                              const active = item.days.includes(d.key);
                              return (
                                <span
                                  key={d.key}
                                  className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center border ${
                                    active
                                      ? 'bg-teal-700 text-white border-teal-700'
                                      : 'bg-slate-100 text-slate-400 border-slate-200'
                                  }`}
                                >
                                  {d.label}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* =====================================================================
               MODO 2: FICHA DE REGISTRO PROFESIONAL (RESUMEN TÉCNICO CLÍNICO)
               ===================================================================== */
            <>
              {/* Encabezado Técnico de Historia Clínica */}
              <div className="flex items-start justify-between gap-6 pb-4 border-b-2 border-slate-900">
                <div className="flex items-center gap-3.5">
                  {professional.logoBase64 && (
                    <img
                      src={professional.logoBase64}
                      alt="Logo institución"
                      className="w-14 h-14 object-contain rounded-lg border border-slate-200 p-1"
                    />
                  )}
                  <div>
                    <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
                      FICHA TÉCNICA DE PRESCRIPCIÓN KINÉSICA • HISTORIA CLÍNICA
                    </div>
                    <h1 className="text-lg font-display font-bold text-slate-900 mt-0.5">
                      {professional.clinicName || 'Servicio de Kinesiología y Fisiatría'}
                    </h1>
                    <p className="text-xs text-slate-600">
                      Profesional tratante: <strong>{professional.name}</strong> ({professional.license})
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono text-xs bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-900">
                    FECHA: {patient.evaluationDate || new Date().toISOString().split('T')[0]}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    REGISTRO #{safePatientSlug.slice(0, 8).toUpperCase() || 'KINE-01'}
                  </div>
                </div>
              </div>

              {/* Bloque Técnico: Datos del Paciente + Diagnóstico + Escala EVA Inicial */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-7 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <User className="w-3.5 h-3.5 text-teal-700" />
                    Datos Clínicos del Paciente
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                    <div className="col-span-2">
                      <span className="text-slate-500 block text-[10px] uppercase">
                        Nombre y Apellido
                      </span>
                      <strong className="text-slate-900 text-sm">
                        {patient.name || 'No especificado'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Edad</span>
                      <strong className="text-slate-900 text-sm font-mono">
                        {patient.age ? `${patient.age} años` : 'S/D'}
                      </strong>
                    </div>
                  </div>
                  <div className="pt-1 border-t border-slate-200/80">
                    <span className="text-slate-500 block text-[10px] uppercase">
                      Diagnóstico Kinésico Funcional
                    </span>
                    <strong className="text-slate-900 text-xs block mt-0.5">
                      {patient.diagnosis || 'Sin diagnóstico registrado'}
                    </strong>
                  </div>
                </div>

                {/* Resumen Técnico Escala EVA Inicial */}
                <div className="col-span-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-teal-700" />
                        EVA Inicial (Dolor)
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${evaDescriptor.badgeClass}`}
                      >
                        {patient.evaScore} / 10
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 mt-2">
                      Categoría: {evaDescriptor.label}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {evaDescriptor.clinicalDetail}
                    </p>
                  </div>

                  {/* Barra técnica graduada 0-10 */}
                  <div className="mt-3">
                    <div className="grid grid-cols-11 gap-0.5">
                      {Array.from({ length: 11 }, (_, i) => (
                        <div
                          key={i}
                          className={`h-4 rounded-sm text-[9px] font-mono font-bold flex items-center justify-center ${
                            i === patient.evaScore
                              ? 'bg-slate-900 text-white'
                              : i < patient.evaScore
                              ? 'bg-teal-600/30 text-teal-950'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {i}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Evolución / Observaciones Clínicas */}
              {patient.clinicalNotes && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Observaciones Semiológicas y Evolución Clínica:
                  </span>
                  <p className="text-slate-700 leading-relaxed">{patient.clinicalNotes}</p>
                </div>
              )}

              {/* Tabla Técnica Dosificada (Sin imágenes grandes, formato ficha médica) */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-teal-700" />
                  Tabla de Dosificación Terapéutica Prescripta ({currentPlan.length} ejercicios)
                </h2>

                <div className="overflow-hidden rounded-xl border border-slate-300">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-wider">
                        <th className="py-2.5 px-2.5 font-mono">#</th>
                        <th className="py-2.5 px-3">Zona / Fase</th>
                        <th className="py-2.5 px-3">Ejercicio Prescripto & Patología</th>
                        <th className="py-2.5 px-2.5">Objetivo / Tipo</th>
                        <th className="py-2.5 px-2.5 text-center">Dosificación</th>
                        <th className="py-2.5 px-2.5 text-center">Frecuencia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs">
                      {currentPlan.map((item, idx) => (
                        <tr key={item.planItemId} className="bg-white align-top">
                          <td className="py-2.5 px-2.5 font-mono font-bold text-slate-700">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-900 block">
                              {item.exercise.zone}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Fase {item.exercise.phase}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">
                              {item.exercise.name}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {item.exercise.pathology}
                            </div>
                            <div className="text-[11px] text-teal-800 mt-1">
                              <em>Criterio:</em> {item.exercise.clinicalTips}
                            </div>
                            {item.customNote && (
                              <div className="text-[11px] text-slate-700 mt-0.5">
                                <strong>Indicación:</strong> {item.customNote}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-2.5">
                            <span className="font-semibold text-slate-800 block">
                              {item.exercise.objective}
                            </span>
                            <span className="font-mono text-[11px] text-slate-500">
                              {item.exercise.workType}
                            </span>
                          </td>
                          <td className="py-2.5 px-2.5 font-mono text-center">
                            <div className="font-bold text-slate-900">
                              {item.sets} × {item.reps}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Pausa: {item.rest}
                            </div>
                          </td>
                          <td className="py-2.5 px-2.5 text-center">
                            <span className="inline-block font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-teal-50 text-teal-900 border border-teal-200">
                              {item.days.join(' · ') || 'S/D'}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              ({item.days.length} d/sem)
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* =====================================================================
              PIE DE PÁGINA COMÚN: FIRMA DEL PROFESIONAL Y MATRÍCULA
             ===================================================================== */}
          <div className="pt-6 mt-6 border-t border-slate-200 flex items-end justify-between gap-6">
            <div className="text-[11px] text-slate-500 space-y-1 max-w-sm">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                Documento generado con KineGen Pro
              </div>
              <p>
                Prescripción de ejercicio terapéutico individualizada. Prohibida su reproducción sin supervisión kinésica profesional.
              </p>
            </div>

            {/* Bloque de Firma y Sello Profesional */}
            <div className="w-64 text-center">
              <div className="h-20 flex items-center justify-center border-b border-slate-400 mb-1.5 px-4">
                {professional.signatureBase64 ? (
                  <img
                    src={professional.signatureBase64}
                    alt="Firma del profesional"
                    className="max-h-16 object-contain"
                  />
                ) : (
                  <span className="text-[11px] italic text-slate-400">
                    (Firma manuscrita pendiente en Perfil)
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-slate-900">
                {professional.name || 'Firma del Profesional'}
              </div>
              <div className="text-[11px] text-slate-600">
                {professional.specialty || 'Kinesiólogo / Fisioterapeuta'}
              </div>
              {professional.license && (
                <div className="text-[11px] font-mono font-semibold text-teal-800 mt-0.5">
                  {professional.license}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
