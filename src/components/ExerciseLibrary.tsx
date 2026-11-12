import React, { useMemo } from 'react';
import {
  CalendarDays,
  Check,
  Dumbbell,
  Filter,
  Layers,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  BODY_ZONES,
  EXERCISE_OBJECTIVES,
  REHAB_PHASES,
  WORK_TYPES,
} from '../types/kine';
import { getDaysForFrequency, useKineStore } from '../store/useKineStore';

interface ExerciseLibraryProps {
  onOpenCustomModal: () => void;
  onNotify: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({
  onOpenCustomModal,
  onNotify,
}) => {
  const {
    exercises,
    currentPlan,
    filters,
    setFilter,
    resetFilters,
    generatePlanFromFilters,
    addExerciseToPlan,
    deleteCustomExercise,
  } = useKineStore();

  // Extraer palabras clave de patologías únicas para el selector dinámico
  const pathologyOptions = useMemo(() => {
    const set = new Set<string>();
    exercises.forEach((ex) => {
      ex.pathology.split('/').forEach((part) => {
        const clean = part.trim();
        if (clean) set.add(clean);
      });
    });
    return Array.from(set);
  }, [exercises]);

  // Filtrar la biblioteca en tiempo real
  const filteredExercises = useMemo(() => {
    const searchLower = filters.search.trim().toLowerCase();
    return exercises.filter((ex) => {
      const matchZone = filters.zone === 'Todas' || ex.zone === filters.zone;
      const matchPhase = filters.phase === 'Todas' || ex.phase === filters.phase;
      const matchObjective =
        filters.objective === 'Todos' || ex.objective === filters.objective;
      const matchWorkType =
        filters.workType === 'Todos' || ex.workType === filters.workType;
      const matchPathology =
        filters.pathology === 'Todas' ||
        ex.pathology.toLowerCase().includes(filters.pathology.toLowerCase());
      const matchSearch =
        !searchLower ||
        ex.name.toLowerCase().includes(searchLower) ||
        ex.pathology.toLowerCase().includes(searchLower) ||
        ex.description.toLowerCase().includes(searchLower) ||
        ex.zone.toLowerCase().includes(searchLower);

      return (
        matchZone &&
        matchPhase &&
        matchObjective &&
        matchWorkType &&
        matchPathology &&
        matchSearch
      );
    });
  }, [exercises, filters]);

  const activeExerciseIds = useMemo(
    () => new Set(currentPlan.map((item) => item.exerciseId)),
    [currentPlan]
  );

  const handleGeneratePlan = () => {
    const { addedCount, totalMatches } = generatePlanFromFilters();
    if (addedCount === 0) {
      onNotify(
        'No se encontraron ejercicios con esa combinación exacta de filtros. Prueba ampliar los criterios.',
        'warning'
      );
    } else {
      const daysLabel = getDaysForFrequency(filters.daysPerWeek).join(', ');
      onNotify(
        `Plan generado con ${addedCount} ejercicio(s) (de ${totalMatches} coincidencias) para ${filters.daysPerWeek} días/semana (${daysLabel}).`,
        'success'
      );
    }
  };

  const hasActiveFilters =
    filters.zone !== 'Todas' ||
    filters.pathology !== 'Todas' ||
    filters.phase !== 'Todas' ||
    filters.objective !== 'Todos' ||
    filters.workType !== 'Todos' ||
    filters.search.trim() !== '';

  return (
    <section
      aria-labelledby="library-generator-heading"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-clinical overflow-hidden flex flex-col"
    >
      {/* Cabecera de Biblioteca y Generador */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h2
              id="library-generator-heading"
              className="text-sm font-display font-bold text-slate-900"
            >
              Biblioteca Kinésica & Generador de Planes
            </h2>
            <p className="text-[11px] text-slate-500">
              {filteredExercises.length} de {exercises.length} ejercicios disponibles
            </p>
          </div>
        </div>

        <button
          id="btn-open-custom-exercise"
          type="button"
          onClick={onOpenCustomModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-teal-300" />
          <span>Mi Ejercicio</span>
        </button>
      </div>

      {/* Panel de Filtros Dinámicos y Parámetros del Generador */}
      <div className="p-5 space-y-4 border-b border-slate-100">
        {/* Buscador Rápido */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="library-search-input"
            type="text"
            value={filters.search}
            onChange={(e) => setFilter({ search: e.target.value })}
            placeholder="Buscar ejercicio por nombre, músculo, zona o patología..."
            className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
          />
          {hasActiveFilters && (
            <button
              id="btn-reset-filters"
              type="button"
              onClick={() => {
                resetFilters();
                onNotify('Filtros de búsqueda restablecidos.', 'info');
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              title="Limpiar todos los filtros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Selector rápido de Zona Anatómica en píldoras */}
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Zona del Cuerpo
          </span>
          <div className="flex flex-wrap gap-1.5">
            {['Todas', ...BODY_ZONES].map((zoneOption) => {
              const active = filters.zone === zoneOption;
              return (
                <button
                  key={zoneOption}
                  id={`filter-zone-${zoneOption.toLowerCase().replace(/\s+/g, '-')}`}
                  type="button"
                  onClick={() => setFilter({ zone: zoneOption })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {zoneOption}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selectores de Patología, Fase, Objetivo y Tipo de Trabajo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div>
            <label
              htmlFor="filter-pathology-select"
              className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1"
            >
              Patología
            </label>
            <select
              id="filter-pathology-select"
              value={filters.pathology}
              onChange={(e) => setFilter({ pathology: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-600 outline-none"
            >
              <option value="Todas">Todas</option>
              {pathologyOptions.map((pat) => (
                <option key={pat} value={pat}>
                  {pat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-phase-select"
              className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1"
            >
              Fase
            </label>
            <select
              id="filter-phase-select"
              value={filters.phase}
              onChange={(e) => setFilter({ phase: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-600 outline-none"
            >
              <option value="Todas">Todas las fases</option>
              {REHAB_PHASES.map((ph) => (
                <option key={ph} value={ph}>
                  {ph}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-objective-select"
              className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1"
            >
              Objetivo
            </label>
            <select
              id="filter-objective-select"
              value={filters.objective}
              onChange={(e) => setFilter({ objective: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-600 outline-none"
            >
              <option value="Todos">Todos</option>
              {EXERCISE_OBJECTIVES.map((obj) => (
                <option key={obj} value={obj}>
                  {obj}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-worktype-select"
              className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1"
            >
              Tipo de Trabajo
            </label>
            <select
              id="filter-worktype-select"
              value={filters.workType}
              onChange={(e) => setFilter({ workType: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-600 outline-none"
            >
              <option value="Todos">Todos</option>
              {WORK_TYPES.map((wt) => (
                <option key={wt} value={wt}>
                  {wt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Parámetros de Generación: Días por Semana + Ejercicios por Día + Botón Generar Plan */}
        <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/80 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Días a la semana */}
            <div>
              <label
                htmlFor="generator-days-per-week"
                className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-teal-900 mb-1"
              >
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5 text-teal-700" />
                  Días por Semana
                </span>
                <span className="font-mono text-xs text-teal-700">
                  {getDaysForFrequency(filters.daysPerWeek).join(' · ')}
                </span>
              </label>
              <select
                id="generator-days-per-week"
                value={filters.daysPerWeek}
                onChange={(e) => setFilter({ daysPerWeek: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-teal-300 bg-white text-slate-800 focus:border-teal-700 outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <option key={d} value={d}>
                    {d} {d === 1 ? 'día por semana' : 'días por semana'} (
                    {getDaysForFrequency(d).join(', ')})
                  </option>
                ))}
              </select>
            </div>

            {/* Ejercicios por día */}
            <div>
              <label
                htmlFor="generator-exercises-per-day"
                className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-teal-900 mb-1"
              >
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-teal-700" />
                  Ejercicios por Día
                </span>
                <span className="font-mono text-xs text-teal-700">
                  {filters.exercisesPerDay} ej./sesión
                </span>
              </label>
              <select
                id="generator-exercises-per-day"
                value={filters.exercisesPerDay}
                onChange={(e) => setFilter({ exercisesPerDay: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-teal-300 bg-white text-slate-800 focus:border-teal-700 outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 8, 10].map((count) => (
                  <option key={count} value={count}>
                    {count} {count === 1 ? 'ejercicio por sesión' : 'ejercicios por sesión'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            id="btn-generate-plan"
            type="button"
            onClick={handleGeneratePlan}
            className="w-full py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-semibold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <Sparkles className="w-4 h-4 text-teal-200" />
            <span>
              Generar Plan Automático ({Math.min(filters.exercisesPerDay, filteredExercises.length)}{' '}
              de {filteredExercises.length} disponibles)
            </span>
          </button>
        </div>
      </div>

      {/* Catálogo Visual de Ejercicios Coincidentes */}
      <div className="p-4 max-h-[520px] overflow-y-auto space-y-2.5 bg-slate-50/40">
        {filteredExercises.length === 0 ? (
          <div className="text-center py-8 px-4">
            <Dumbbell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              Sin ejercicios para estos filtros
            </p>
            <p className="text-xs text-slate-500 mt-1 mb-3">
              Puedes limpiar los filtros o agregar un ejercicio propio con el botón &ldquo;Mi Ejercicio&rdquo;.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Mostrar toda la biblioteca
            </button>
          </div>
        ) : (
          filteredExercises.map((ex) => {
            const isAlreadyInPlan = activeExerciseIds.has(ex.id);
            return (
              <div
                key={ex.id}
                className="group bg-white rounded-xl border border-slate-200/90 hover:border-teal-600/40 p-3 flex items-start gap-3 transition-all hover:shadow-sm"
              >
                <img
                  src={ex.image}
                  alt={ex.name}
                  className="w-24 h-16 rounded-lg object-cover border border-slate-100 shrink-0 bg-slate-50"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                      {ex.name}
                    </h3>
                    {ex.isCustom && (
                      <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        Propio
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {ex.pathology}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200/60">
                      {ex.zone}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700">
                      Fase {ex.phase}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-sky-50 text-sky-800">
                      {ex.objective}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-200/60">
                      {ex.workType}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <button
                    id={`btn-add-lib-ex-${ex.id}`}
                    type="button"
                    onClick={() => {
                      addExerciseToPlan(ex);
                      onNotify(`"${ex.name}" añadido al plan de ejercicios.`, 'success');
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isAlreadyInPlan
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-teal-700 text-white hover:bg-teal-600 shadow-sm'
                    }`}
                  >
                    {isAlreadyInPlan ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>En Plan</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar</span>
                      </>
                    )}
                  </button>

                  {ex.isCustom && (
                    <button
                      type="button"
                      onClick={() => {
                        deleteCustomExercise(ex.id);
                        onNotify(`Ejercicio "${ex.name}" eliminado de la biblioteca.`, 'info');
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Eliminar ejercicio personalizado"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
