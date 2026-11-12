import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import {
  Award,
  Building2,
  Check,
  Eraser,
  FileSignature,
  ImagePlus,
  Mail,
  Phone,
  RotateCcw,
  Stethoscope,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';
import { useKineStore } from '../store/useKineStore';
import { imageFileToBase64 } from '../utils/fileHelpers';
import { DEFAULT_CLINIC_LOGO } from '../assets/exerciseIllustrations';

// Compatibilidad segura ESM/CommonJS con Vite para react-signature-canvas
const ReactSignatureCanvas =
  (SignatureCanvas as unknown as { default?: typeof SignatureCanvas }).default ||
  SignatureCanvas;

interface ProfessionalProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const ProfessionalProfileModal: React.FC<ProfessionalProfileModalProps> = ({
  isOpen,
  onClose,
  onNotify,
}) => {
  const { professional, updateProfessional } = useKineStore();
  const sigCanvasRef = useRef<SignatureCanvas | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  if (!isOpen) return null;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await imageFileToBase64(file, 360, 360, 0.9);
      updateProfessional({ logoBase64: base64 });
      onNotify('Logo del consultorio actualizado y guardado en el navegador.', 'success');
    } catch {
      onNotify('No se pudo cargar la imagen seleccionada.', 'warning');
    } finally {
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleSaveSignatureFromCanvas = () => {
    if (!sigCanvasRef.current) return;
    if (sigCanvasRef.current.isEmpty()) {
      onNotify('Dibuja tu firma en el recuadro antes de guardarla.', 'warning');
      return;
    }
    const dataUrl = sigCanvasRef.current.getCanvas().toDataURL('image/png');
    updateProfessional({ signatureBase64: dataUrl });
    setIsDrawing(false);
    onNotify('Firma profesional registrada correctamente.', 'success');
  };

  const handleStrokeEnd = () => {
    if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) return;
    const dataUrl = sigCanvasRef.current.getCanvas().toDataURL('image/png');
    updateProfessional({ signatureBase64: dataUrl });
  };

  const handleClearSignature = () => {
    sigCanvasRef.current?.clear();
    updateProfessional({ signatureBase64: '' });
    setIsDrawing(true);
    onNotify('Firma eliminada del perfil.', 'info');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-prof-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-clinical-lg w-full max-w-3xl overflow-hidden my-8">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-teal-800 to-teal-700 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/15 backdrop-blur">
              <Stethoscope className="w-5 h-5 text-teal-100" />
            </div>
            <div>
              <h2 id="modal-prof-title" className="text-lg font-display font-bold">
                Perfil del Profesional y Consultorio
              </h2>
              <p className="text-xs text-teal-100">
                Estos datos, el logo y la firma se guardan automáticamente en tu navegador y se imprimen en los PDFs.
              </p>
            </div>
          </div>
          <button
            id="btn-close-profile-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-teal-100 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar configuración profesional"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Datos principales del profesional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="prof-name-input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
              >
                Nombre y Apellido del Profesional
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="prof-name-input"
                  type="text"
                  value={professional.name}
                  onChange={(e) => updateProfessional({ name: e.target.value })}
                  placeholder="Ej: Lic. Martín Echeverría"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="prof-license-input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
              >
                Matrícula Profesional (M.N. / M.P.)
              </label>
              <div className="relative">
                <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="prof-license-input"
                  type="text"
                  value={professional.license}
                  onChange={(e) => updateProfessional({ license: e.target.value })}
                  placeholder="Ej: M.N. 14.892 / M.P. 6.410"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="prof-clinic-input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
              >
                Nombre del Consultorio / Institución
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="prof-clinic-input"
                  type="text"
                  value={professional.clinicName}
                  onChange={(e) => updateProfessional({ clinicName: e.target.value })}
                  placeholder="Ej: Centro Kinésico KineGen"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="prof-specialty-input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
              >
                Especialidad / Área Clínica
              </label>
              <div className="relative">
                <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="prof-specialty-input"
                  type="text"
                  value={professional.specialty}
                  onChange={(e) => updateProfessional({ specialty: e.target.value })}
                  placeholder="Ej: Kinesiología Deportiva y Traumatológica"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="prof-phone-input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
              >
                Teléfono / WhatsApp del Consultorio
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="prof-phone-input"
                  type="text"
                  value={professional.phone}
                  onChange={(e) => updateProfessional({ phone: e.target.value })}
                  placeholder="Ej: +54 11 4582-9910"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="prof-email-input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
              >
                Correo Electrónico / Web
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="prof-email-input"
                  type="email"
                  value={professional.email}
                  onChange={(e) => updateProfessional({ email: e.target.value })}
                  placeholder="Ej: consultorio@kinegen.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Sección Logo y Firma */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2 border-t border-slate-100">
            {/* Logo en Base64 */}
            <div className="lg:col-span-5 flex flex-col justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Logo del Consultorio
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Se almacena en Base64 en `localStorage` y encabeza tus reportes PDF.
                </p>

                <div className="flex items-center justify-center h-32 rounded-xl bg-white border border-dashed border-slate-300 p-3 mb-4">
                  {professional.logoBase64 ? (
                    <img
                      src={professional.logoBase64}
                      alt="Logo del consultorio"
                      className="max-h-24 max-w-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="text-center text-xs text-slate-400">
                      Sin logo cargado
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload-input"
                />
                <button
                  id="btn-upload-clinic-logo"
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-teal-700 text-white hover:bg-teal-600 transition-colors"
                >
                  <ImagePlus className="w-3.5 h-3.5" />
                  Subir Logo
                </button>
                <button
                  id="btn-restore-default-logo"
                  type="button"
                  onClick={() => {
                    updateProfessional({ logoBase64: DEFAULT_CLINIC_LOGO });
                    onNotify('Logo institucional predeterminado restaurado.', 'info');
                  }}
                  className="inline-flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Restaurar logo por defecto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                {professional.logoBase64 && (
                  <button
                    id="btn-remove-clinic-logo"
                    type="button"
                    onClick={() => updateProfessional({ logoBase64: '' })}
                    className="inline-flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-medium rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                    title="Quitar logo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Firma interactiva react-signature-canvas */}
            <div className="lg:col-span-7 flex flex-col justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <FileSignature className="w-4 h-4 text-teal-700" />
                    Firma Manuscrita del Profesional
                  </h3>
                  {professional.signatureBase64 && !isDrawing && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" /> Firma guardada
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Dibuja tu firma en el lienzo con el mouse o pantalla táctil. Se imprimirá al pie de los planes y fichas en PDF.
                </p>

                {professional.signatureBase64 && !isDrawing ? (
                  <div className="relative flex flex-col items-center justify-center h-36 rounded-xl bg-white border border-slate-200 p-3 mb-3">
                    <img
                      src={professional.signatureBase64}
                      alt="Firma del profesional"
                      className="max-h-24 object-contain"
                    />
                    <span className="text-[11px] text-slate-400 mt-1">
                      Vista previa de la firma activa en tus reportes PDF
                    </span>
                  </div>
                ) : (
                  <div className="rounded-xl bg-white border-2 border-dashed border-teal-600/40 overflow-hidden mb-3">
                    <ReactSignatureCanvas
                      ref={sigCanvasRef}
                      penColor="#0f172a"
                      onEnd={handleStrokeEnd}
                      canvasProps={{
                        width: 420,
                        height: 140,
                        className: 'w-full h-36 cursor-crosshair touch-none',
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                {professional.signatureBase64 && !isDrawing ? (
                  <button
                    id="btn-redraw-signature"
                    type="button"
                    onClick={() => setIsDrawing(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-teal-700 text-white hover:bg-teal-600 transition-colors"
                  >
                    <FileSignature className="w-3.5 h-3.5" />
                    Volver a Dibujar Firma
                  </button>
                ) : (
                  <button
                    id="btn-save-signature"
                    type="button"
                    onClick={handleSaveSignatureFromCanvas}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-700 text-white hover:bg-teal-600 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Confirmar Firma
                  </button>
                )}

                <button
                  id="btn-clear-signature"
                  type="button"
                  onClick={handleClearSignature}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  Limpiar Firma
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pie del Modal */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <span className="text-xs text-slate-500">
            Persistencia automática activa en <code className="font-mono text-teal-700">localStorage</code>
          </span>
          <button
            id="btn-done-profile-modal"
            type="button"
            onClick={() => {
              onNotify('Datos profesionales guardados correctamente.', 'success');
              onClose();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-teal-700 text-white hover:bg-teal-600 shadow-sm transition-all"
          >
            <Check className="w-4 h-4" />
            Listo y Guardar
          </button>
        </div>
      </div>
    </div>
  );
};
