import React, { useRef, useState } from 'react';
import {
  Check,
  Dumbbell,
  ImagePlus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {
  BODY_ZONES,
  type BodyZone,
  EXERCISE_OBJECTIVES,
  type ExerciseObjective,
  REHAB_PHASES,
  type RehabPhase,
  WORK_TYPES,
  type WorkType,
} from '../types/kine';
import { useKineStore } from '../store/useKineStore';
import { imageFileToBase64 } from '../utils/fileHelpers';
import { createExerciseIllustration, type IllustrationSpec } from '../assets/exerciseIllustrations';

interface CustomExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

const ZONE_DEFAULT_POSE: Record<BodyZone, IllustrationSpec['pose']> = {
  Cervical: 'cervical-retraction',
  Hombro: 'shoulder-external-rotation',
  Dorsal: 'dorsal-cat-camel',
  Lumbar: 'lumbar-bird-dog',
  Cadera: 'hip-clamshell',
  Rodilla: 'knee-step-down',
  'Tobillo y Pie': 'ankle-proprioception',
};

export const CustomExerciseModal: React.FC<CustomExerciseModalProps> = ({
  isOpen,
  onClose,
  onNotify,
}) => {
  const { addCustomExercise } = useKineStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState('');
  const [zone, setZone] = useState<BodyZone>('Rodilla');
  const [pathology, setPathology] = useState('');
  const [phase, setPhase] = useState<RehabPhase>('Subaguda');
  const [objective, setObjective] = useState<ExerciseObjective>('Fuerza');
  const [workType, setWorkType] = useState<WorkType>('Concéntrico');
  const [defaultSets, setDefaultSets] = useState(3);
  const [defaultReps, setDefaultReps] = useState('12 repeticiones');
  const [defaultRest, setDefaultRest] = useState('45 seg');
  const [description, setDescription] = useState('');
  const [clinicalTips, setClinicalTips] = useState('');
  const [uploadedImage, setUploadedImage] = useState('');
  const [addDirectlyToPlan, setAddDirectlyToPlan] = useState(true);

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await imageFileToBase64(file, 640, 440, 0.85);
      setUploadedImage(base64);
      onNotify('Imagen cargada y optimizada en Base64.', 'info');
    } catch {
      onNotify('No se pudo procesar la foto seleccionada.', 'warning');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onNotify('Por favor ingresa un nombre para el ejercicio.', 'warning');
      return;
    }
    if (!description.trim()) {
      onNotify('Ingresa una explicación clara de cómo realizar el ejercicio.', 'warning');
      return;
    }

    const finalImage =
      uploadedImage ||
      createExerciseIllustration({
        id: `custom-${Date.now()}`,
        zoneLabel: zone,
        title: `${name.trim()} (${workType})`,
        accentColor: '#0f766e',
        bgTint: '#f0fdfa',
        pose: ZONE_DEFAULT_POSE[zone],
      });

    addCustomExercise(
      {
        name: name.trim(),
        zone,
        pathology: pathology.trim() || `Rehabilitación de ${zone}`,
        phase,
        objective,
        workType,
        defaultSets: Math.max(1, Number(defaultSets) || 3),
        defaultReps: defaultReps.trim() || '10 reps',
        defaultRest: defaultRest.trim() || '45 seg',
        description: description.trim(),
        clinicalTips:
          clinicalTips.trim() ||
          `Ejercicio personalizado (${workType} - Fase ${phase}).`,
        image: finalImage,
      },
      addDirectlyToPlan
    );

    onNotify(
      addDirectlyToPlan
        ? `"${name.trim()}" guardado en tu biblioteca y añadido al plan actual.`
        : `"${name.trim()}" guardado en tu biblioteca local.`,
      'success'
    );

    // Resetear formulario
    setName('');
    setPathology('');
    setDescription('');
    setClinicalTips('');
    setUploadedImage('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-exercise-modal-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-clinical-lg w-full max-w-2xl overflow-hidden my-8">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-teal-800 to-teal-700 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/15">
              <Dumbbell className="w-5 h-5 text-teal-100" />
            </div>
            <div>
              <h2 id="custom-exercise-modal-title" className="text-lg font-display font-bold">
                Módulo &ldquo;Mi Ejercicio&rdquo; — Nuevo Ejercicio Personalizado
              </h2>
              <p className="text-xs text-teal-100">
                Añade ejercicios propios con foto e indicaciones a tu biblioteca local persistente.
              </p>
            </div>
          </div>
          <button
            id="btn-close-custom-exercise-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-teal-100 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8">
              <label
                htmlFor="custom-ex-name"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1"
              >
                Nombre del Ejercicio *
              </label>
              <input
                id="custom-ex-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Sentadilla Búlgara con Control Excéntrico"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-600 outline-none"
              />
            </div>

            <div className="sm:col-span-4">
              <label
                htmlFor="custom-ex-zone"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1"
              >
                Zona del Cuerpo *
              </label>
              <select
                id="custom-ex-zone"
                value={zone}
                onChange={(e) => setZone(e.target.value as BodyZone)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-600 outline-none"
              >
                {BODY_ZONES.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="custom-ex-phase"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1"
              >
                Fase Clínica
              </label>
              <select
                id="custom-ex-phase"
                value={phase}
                onChange={(e) => setPhase(e.target.value as RehabPhase)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-600 outline-none"
              >
                {REHAB_PHASES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="custom-ex-objective"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1"
              >
                Objetivo Terapéutico
              </label>
              <select
                id="custom-ex-objective"
                value={objective}
                onChange={(e) => setObjective(e.target.value as ExerciseObjective)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-600 outline-none"
              >
                {EXERCISE_OBJECTIVES.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="custom-ex-worktype"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1"
              >
                Tipo de Trabajo
              </label>
              <select
                id="custom-ex-worktype"
                value={workType}
                onChange={(e) => setWorkType(e.target.value as WorkType)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-600 outline-none"
              >
                {WORK_TYPES.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label
                htmlFor="custom-ex-pathology"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1"
              >
                Patología Asociada
              </label>
              <input
                id="custom-ex-pathology"
                type="text"
                value={pathology}
                onChange={(e) => setPathology(e.target.value)}
                placeholder="Ej: Síndrome Patelofemoral / LCA"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-600 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="custom-ex-sets"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1"
              >
                Series
              </label>
              <input
                id="custom-ex-sets"
                type="number"
                min={1}
                max={15}
                value={defaultSets}
                onChange={(e) => setDefaultSets(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-600 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="custom-ex-reps"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1"
              >
                Repeticiones
              </label>
              <input
                id="custom-ex-reps"
                type="text"
                value={defaultReps}
                onChange={(e) => setDefaultReps(e.target.value)}
                placeholder="12 reps"
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-600 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="custom-ex-rest"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1"
              >
                Descanso
              </label>
              <input
                id="custom-ex-rest"
                type="text"
                value={defaultRest}
                onChange={(e) => setDefaultRest(e.target.value)}
                placeholder="45 seg"
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-600 outline-none"
              />
            </div>
          </div>

          {/* Explicación para el Paciente */}
          <div>
            <label
              htmlFor="custom-ex-description"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1"
            >
              Explicación Paso a Paso para el Paciente *
            </label>
            <textarea
              id="custom-ex-description"
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe en lenguaje claro y amigable la posición inicial, cómo ejecutar el movimiento y la respiración..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-600 outline-none"
            />
          </div>

          {/* Nota Técnica Profesional */}
          <div>
            <label
              htmlFor="custom-ex-clinical-tips"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1"
            >
              Criterio Biomecánico / Nota para Ficha Profesional (Opcional)
            </label>
            <input
              id="custom-ex-clinical-tips"
              type="text"
              value={clinicalTips}
              onChange={(e) => setClinicalTips(e.target.value)}
              placeholder="Ej: Controlar valgo dinámico de rodilla y mantener pelvis neutra."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-600 outline-none"
            />
          </div>

          {/* Subida de Foto / Imagen en Base64 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Foto o Ilustración del Ejercicio
              </span>
              <p className="text-xs text-slate-500">
                Puedes subir una foto desde tu dispositivo (se guarda en Base64) o usar la lámina anatómica automática de la zona.
              </p>
              <div className="pt-1 flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="custom-ex-photo-input"
                />
                <button
                  id="btn-upload-custom-ex-photo"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-teal-600 hover:text-teal-700 transition-colors"
                >
                  <ImagePlus className="w-3.5 h-3.5 text-teal-700" />
                  Subir Foto Propia
                </button>
                {uploadedImage && (
                  <button
                    type="button"
                    onClick={() => setUploadedImage('')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Quitar foto
                  </button>
                )}
              </div>
            </div>

            <div className="w-36 h-24 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
              {uploadedImage ? (
                <img
                  src={uploadedImage}
                  alt="Vista previa ejercicio"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-2">
                  <Sparkles className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-500 block leading-tight">
                    Ilustración automática ({zone})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Checkbox agregar al plan */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
            <input
              id="custom-ex-add-to-plan-checkbox"
              type="checkbox"
              checked={addDirectlyToPlan}
              onChange={(e) => setAddDirectlyToPlan(e.target.checked)}
              className="w-4 h-4 rounded text-teal-700 focus:ring-teal-500"
            />
            <span className="text-xs font-medium text-slate-700">
              Incluir este ejercicio automáticamente en el plan del paciente actual
            </span>
          </label>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-submit-custom-exercise"
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-teal-700 text-white hover:bg-teal-600 shadow-sm transition-all"
            >
              <Check className="w-4 h-4" />
              Guardar en Mi Biblioteca
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
