import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  BookmarkCheck,
  BookmarkPlus,
  Calendar,
  Clock,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Layers,
  Minus,
  Plus,
  RefreshCw,
  Repeat,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { ALL_DAYS, type DayOfWeek } from '../types/kine';
import { useKineStore } from '../store/useKineStore';

interface PlanEditorProps {
  onOpenPdfModal: (initialMode?: 'patient' | 'professional') => void;
  onNotify: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const PlanEditor: React.FC<PlanEditorProps> = ({
  onOpenPdfModal,
  onNotify,
}) => {
  const {
    currentPlan,
    templates,
    updatePlanItem,
    togglePlanItemDay,
    swapPlanItemRandomly,
    removePlanItem,
    movePlanItem,
    clearPlan,
    saveCurrentPlanAsTemplate,
    loadTemplate,
    deleteTemplate,
  } = useKineStore();

  const [showSaveTemplateForm, setShowSaveTemplateForm] = useState(false);
  const [showTemplatesDrawer, setShowTemplatesDrawer] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');

  const handleSwapExercise = (planItemId: string, currentZone: string) => {
    const result = swapPlanItemRandomly(planItemId);
    if (result.success) {
      onNotify(
        `Ejercicio reemplazado por "${result.newExerciseName}" (Zona: ${currentZone}).`,
        'info'
      );
    } else {
      onNotify(
        `No hay otro ejercicio alternativo disponible en la zona ${currentZone}. Agrega uno desde "Mi Ejercicio".`,
        'warning'
      );
    }
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) {
      onNotify('Escribe un nombre para identificar la plantilla.', 'warning');
      return;
    }
    const saved = saveCurrentPlanAsTemplate(templateName, templateDesc);
    if (saved) {
      onNotify(`Plantilla "${saved.name}" guardada para futuros pacientes.`, 'success');
      setTemplateName('');
      setTemplateDesc('');
      setShowSaveTemplateForm(false);
    }
  };

  const handleSelectAllWeekdays = (planItemId: string, preset: 'LMXJV' | 'LXV' | 'ALL') => {
    const map: Record<'LMXJV' | 'LXV' | 'ALL', DayOfWeek[]> = {
      LXV: ['L', 'X', 'V'],
      LMXJV: ['L', 'M', 'X', 'J', 'V'],
      ALL: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
    };
    updatePlanItem(planItemId, { days: map[preset] });
  };

  return (
    <section
      aria-labelledby="plan-editor-heading"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-clinical overflow-hidden flex flex-col"
    >
      {/* Cabecera del Editor del Plan */}
      <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-700 text-white shadow-sm">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2
                id="plan-editor-heading"
                className="text-base font-display font-bold text-slate-900"
              >
                Editor del Plan de Ejercicios Activo
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-100 text-teal-900">
                {currentPlan.length} {currentPlan.length === 1 ? 'ejercicio' : 'ejercicios'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Personaliza series, repeticiones, descanso y días de la semana (L a D) o intercambia ejercicios por zona.
            </p>
          </div>
        </div>

        {/* Acciones de Plantillas y Limpieza */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-toggle-templates-drawer"
            type="button"
            onClick={() => {
              setShowTemplatesDrawer((prev) => !prev);
              setShowSaveTemplateForm(false);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              showTemplatesDrawer
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:border-teal-600/40'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 text-teal-600" />
            <span>Plantillas ({templates.length})</span>
          </button>

          <button
            id="btn-save-as-template"
            type="button"
            disabled={currentPlan.length === 0}
            onClick={() => {
              setShowSaveTemplateForm((prev) => !prev);
              setShowTemplatesDrawer(false);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100/80 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>Guardar como Plantilla</span>
          </button>

          {currentPlan.length > 0 && (
            <button
              id="btn-clear-current-plan"
              type="button"
              onClick={() => {
                clearPlan();
                onNotify('Se vació la lista de ejercicios del plan actual.', 'info');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/70 transition-colors"
              title="Vaciar todos los ejercicios del plan"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vaciar</span>
            </button>
          )}
        </div>
      </div>

      {/* Formulario desplegable: Guardar como Plantilla */}
      {showSaveTemplateForm && (
        <form
          onSubmit={handleSaveTemplate}
          className="px-5 py-4 bg-teal-50/70 border-b border-teal-200/80 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
              <BookmarkCheck className="w-4 h-4 text-teal-700" />
              Guardar combinación actual ({currentPlan.length} ejercicios) como Plantilla Reutilizable
            </span>
            <button
              type="button"
              onClick={() => setShowSaveTemplateForm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className="sm:col-span-5">
              <input
                id="template-name-input"
                type="text"
                required
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Nombre (Ej: Protocolo Hombro Doloroso Fase 1)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-teal-300 bg-white focus:border-teal-700 outline-none"
              />
            </div>
            <div className="sm:col-span-5">
              <input
                id="template-desc-input"
                type="text"
                value={templateDesc}
                onChange={(e) => setTemplateDesc(e.target.value)}
                placeholder="Descripción clínica breve (opcional)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-teal-300 bg-white focus:border-teal-700 outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                id="btn-confirm-save-template"
                type="submit"
                className="w-full h-full py-2 px-3 rounded-xl text-xs font-semibold bg-teal-700 text-white hover:bg-teal-600 transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Cajón desplegable: Cargar Plantillas Guardadas */}
      {showTemplatesDrawer && (
        <div className="px-5 py-4 bg-slate-100/80 border-b border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Biblioteca de Plantillas Clínicas Guardadas
            </span>
            <button
              type="button"
              onClick={() => setShowTemplatesDrawer(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {templates.length === 0 ? (
            <p className="text-xs text-slate-500 py-2">
              Aún no tienes plantillas guardadas. Usa el botón &ldquo;Guardar como Plantilla&rdquo; para almacenar tus protocolos favoritos.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-3 rounded-xl bg-white border border-slate-200/90 flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {tpl.name}
                      </h4>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                        {tpl.items.length} ej.
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {tpl.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      id={`btn-load-template-${tpl.id}`}
                      type="button"
                      onClick={() => {
                        loadTemplate(tpl.id);
                        setShowTemplatesDrawer(false);
                        onNotify(`Plantilla "${tpl.name}" aplicada al plan actual.`, 'success');
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-teal-700 text-white hover:bg-teal-600 transition-colors"
                    >
                      Aplicar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteTemplate(tpl.id);
                        onNotify(`Plantilla "${tpl.name}" eliminada.`, 'info');
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Eliminar plantilla"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lista de Tarjetas de Ejercicios en el Plan */}
      <div className="p-5 space-y-4 flex-1">
        {currentPlan.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-2xl py-14 px-6 text-center bg-slate-50/50">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-display font-bold text-slate-800">
              El Plan de Ejercicios está vacío
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
              Utiliza el panel izquierdo para filtrar por zona, patología o fase y presiona <strong>&ldquo;Generar Plan Automático&rdquo;</strong>, o carga una de tus plantillas clínicas.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {templates.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowTemplatesDrawer(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-teal-600"
                >
                  <FolderOpen className="w-4 h-4 text-teal-700" />
                  Cargar Plantilla Guardada
                </button>
              )}
            </div>
          </div>
        ) : (
          currentPlan.map((item, index) => {
            const { exercise } = item;
            return (
              <article
                key={item.planItemId}
                className="rounded-2xl border border-slate-200/90 bg-white hover:border-teal-600/30 shadow-sm transition-all overflow-hidden"
              >
                {/* Barra superior de la tarjeta del ejercicio */}
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-6 h-6 rounded-lg bg-teal-700 text-white font-mono text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      {exercise.zone}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-200/70 text-slate-700">
                      Fase {exercise.phase}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-sky-50 text-sky-800 border border-sky-200/60">
                      Objetivo: {exercise.objective}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-mono text-slate-600 bg-white border border-slate-200">
                      {exercise.workType}
                    </span>
                  </div>

                  {/* Controles de orden, Cambiar aleatorio y Eliminar */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center rounded-lg border border-slate-200 bg-white">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => movePlanItem(item.planItemId, 'up')}
                        className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                        title="Subir posición"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === currentPlan.length - 1}
                        onClick={() => movePlanItem(item.planItemId, 'down')}
                        className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                        title="Bajar posición"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Botón Cambiar por otro aleatorio de la misma zona */}
                    <button
                      id={`btn-swap-exercise-${index}`}
                      type="button"
                      onClick={() => handleSwapExercise(item.planItemId, exercise.zone)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors"
                      title={`Reemplazar por otro ejercicio aleatorio de la zona ${exercise.zone}`}
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
                      <span>Cambiar</span>
                    </button>

                    {/* Botón Eliminar ejercicio */}
                    <button
                      id={`btn-remove-exercise-${index}`}
                      type="button"
                      onClick={() => {
                        removePlanItem(item.planItemId);
                        onNotify(`"${exercise.name}" eliminado del plan.`, 'info');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
                      title="Eliminar ejercicio del plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>

                {/* Cuerpo de la tarjeta: Ilustración + Dosificación Editable */}
                <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  {/* Columna Ilustración y Descripción */}
                  <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3">
                    <div className="w-full sm:w-44 lg:w-full h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                      <img
                        src={exercise.image}
                        alt={exercise.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-display font-bold text-slate-900">
                        {exercise.name}
                      </h3>
                      <p className="text-[11px] font-medium text-teal-700 mt-0.5">
                        {exercise.pathology}
                      </p>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {exercise.description}
                      </p>
                    </div>
                  </div>

                  {/* Columna de Dosificación Editable: Series, Repeticiones, Descanso, Días (L-D), Nota */}
                  <div className="lg:col-span-7 space-y-3.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
                    {/* Series, Repeticiones y Descanso */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Series */}
                      <div>
                        <label
                          htmlFor={`plan-sets-${item.planItemId}`}
                          className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1"
                        >
                          <Layers className="w-3.5 h-3.5 text-teal-700" />
                          Series
                        </label>
                        <div className="flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden">
                          <button
                            type="button"
                            onClick={() =>
                              updatePlanItem(item.planItemId, {
                                sets: Math.max(1, item.sets - 1),
                              })
                            }
                            className="px-2.5 py-2 text-slate-600 hover:bg-slate-100 transition-colors"
                            aria-label="Disminuir series"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            id={`plan-sets-${item.planItemId}`}
                            type="number"
                            min={1}
                            max={20}
                            value={item.sets}
                            onChange={(e) =>
                              updatePlanItem(item.planItemId, {
                                sets: Math.max(1, Number(e.target.value) || 1),
                              })
                            }
                            className="w-full text-center font-mono text-sm font-bold text-slate-900 py-1.5 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updatePlanItem(item.planItemId, { sets: item.sets + 1 })
                            }
                            className="px-2.5 py-2 text-slate-600 hover:bg-slate-100 transition-colors"
                            aria-label="Aumentar series"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Repeticiones / Tiempo */}
                      <div>
                        <label
                          htmlFor={`plan-reps-${item.planItemId}`}
                          className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1"
                        >
                          <Repeat className="w-3.5 h-3.5 text-teal-700" />
                          Repeticiones / Duración
                        </label>
                        <input
                          id={`plan-reps-${item.planItemId}`}
                          type="text"
                          value={item.reps}
                          onChange={(e) =>
                            updatePlanItem(item.planItemId, { reps: e.target.value })
                          }
                          placeholder="Ej: 12 reps / 30 seg"
                          className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-xl border border-slate-200 bg-white focus:border-teal-600 outline-none"
                        />
                      </div>

                      {/* Tiempo de Descanso */}
                      <div>
                        <label
                          htmlFor={`plan-rest-${item.planItemId}`}
                          className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1"
                        >
                          <Clock className="w-3.5 h-3.5 text-teal-700" />
                          Descanso
                        </label>
                        <input
                          id={`plan-rest-${item.planItemId}`}
                          type="text"
                          value={item.rest}
                          onChange={(e) =>
                            updatePlanItem(item.planItemId, { rest: e.target.value })
                          }
                          placeholder="Ej: 45 seg"
                          className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-xl border border-slate-200 bg-white focus:border-teal-600 outline-none"
                        />
                      </div>
                    </div>

                    {/* Selector de Días de la Semana (L, M, X, J, V, S, D) */}
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                        <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-teal-700" />
                          Días de la Semana ({item.days.length} días/sem)
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSelectAllWeekdays(item.planItemId, 'LXV')}
                            className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 hover:border-teal-600 hover:text-teal-700"
                          >
                            L-X-V
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectAllWeekdays(item.planItemId, 'LMXJV')}
                            className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 hover:border-teal-600 hover:text-teal-700"
                          >
                            Lun-Vie
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectAllWeekdays(item.planItemId, 'ALL')}
                            className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 hover:border-teal-600 hover:text-teal-700"
                          >
                            Todos
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-7 gap-1.5">
                        {ALL_DAYS.map((d) => {
                          const isSelected = item.days.includes(d.key);
                          return (
                            <button
                              key={d.key}
                              id={`btn-day-${item.planItemId}-${d.key}`}
                              type="button"
                              onClick={() => togglePlanItemDay(item.planItemId, d.key)}
                              title={d.fullName}
                              className={`py-2 rounded-xl font-mono text-xs font-bold border transition-all ${
                                isSelected
                                  ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {d.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Indicación personalizada para este ejercicio */}
                    <div>
                      <label
                        htmlFor={`plan-note-${item.planItemId}`}
                        className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1"
                      >
                        Indicación Específica / Observación para el Paciente
                      </label>
                      <input
                        id={`plan-note-${item.planItemId}`}
                        type="text"
                        value={item.customNote || ''}
                        onChange={(e) =>
                          updatePlanItem(item.planItemId, { customNote: e.target.value })
                        }
                        placeholder="Ej: Realizar frente a espejo cuidando no elevar el hombro..."
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:border-teal-600 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Pie del Editor con accesos directos a los 2 formatos de PDF */}
      {currentPlan.length > 0 && (
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Exportación Clínica Dual:</span>{' '}
            Genera la guía visual para el paciente o la ficha técnica para tu historia clínica.
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="editor-btn-pdf-professional"
              type="button"
              onClick={() => onOpenPdfModal('professional')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-300 bg-white text-slate-800 hover:border-teal-700 hover:text-teal-800 transition-all"
            >
              <FileText className="w-4 h-4 text-sky-700" />
              <span>Ficha Registro Profesional (PDF)</span>
            </button>

            <button
              id="editor-btn-pdf-patient"
              type="button"
              onClick={() => onOpenPdfModal('patient')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-teal-700 text-white hover:bg-teal-600 shadow-sm transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Plan Visual para el Paciente (PDF)</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
