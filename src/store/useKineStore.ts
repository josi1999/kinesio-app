import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  DayOfWeek,
  Exercise,
  FilterState,
  PatientData,
  PlanItem,
  PlanTemplate,
  ProfessionalProfile,
} from '../types/kine';
import { INITIAL_EXERCISES, INITIAL_TEMPLATES } from '../utils/initialExercises';
import { DEFAULT_CLINIC_LOGO } from '../assets/exerciseIllustrations';

export function getDaysForFrequency(daysPerWeek: number): DayOfWeek[] {
  switch (daysPerWeek) {
    case 1:
      return ['X'];
    case 2:
      return ['M', 'J'];
    case 3:
      return ['L', 'X', 'V'];
    case 4:
      return ['L', 'M', 'J', 'V'];
    case 5:
      return ['L', 'M', 'X', 'J', 'V'];
    case 6:
      return ['L', 'M', 'X', 'J', 'V', 'S'];
    case 7:
    default:
      return ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  }
}

const getTodayFormatted = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

const DEFAULT_PROFESSIONAL: ProfessionalProfile = {
  name: 'Lic. Martín Echeverría',
  license: 'M.N. 14.892 / M.P. 6.410',
  clinicName: 'Centro Kinésico & Rehabilitación Integral KineGen',
  specialty: 'Kinesiología Deportiva y Traumatológica',
  phone: '+54 11 4582-9910',
  email: 'consultorio@kinegen-rehab.com',
  logoBase64: DEFAULT_CLINIC_LOGO,
  signatureBase64: '',
};

const DEFAULT_PATIENT: PatientData = {
  name: 'Lucía Fernández',
  age: '34',
  diagnosis: 'Lumbalgia mecánica subaguda con inhibición de glúteo medio',
  evaScore: 4,
  evaluationDate: getTodayFormatted(),
  clinicalNotes:
    'Paciente refiere dolor lumbar bajo al permanecer más de 2 horas sentada. Presenta buena tolerancia a ejercicios de estabilización lumbopélvica en descarga.',
  precautions:
    'Realizar los ejercicios dentro de un rango libre de dolor punzante (EVA <= 3/10). Suspender si aparece irradiación hacia miembro inferior.',
};

const DEFAULT_FILTERS: FilterState = {
  search: '',
  zone: 'Todas',
  pathology: 'Todas',
  phase: 'Todas',
  objective: 'Todos',
  workType: 'Todos',
  daysPerWeek: 3,
  exercisesPerDay: 3,
};

const INITIAL_PLAN_ITEMS: PlanItem[] = [
  {
    planItemId: 'init-plan-1',
    exerciseId: INITIAL_EXERCISES[5].id,
    exercise: INITIAL_EXERCISES[5],
    sets: INITIAL_EXERCISES[5].defaultSets,
    reps: INITIAL_EXERCISES[5].defaultReps,
    rest: INITIAL_EXERCISES[5].defaultRest,
    days: ['L', 'M', 'X', 'J', 'V'],
    customNote: 'Coordinar con inhalación y exhalación profunda, sin forzar el rango final.',
  },
  {
    planItemId: 'init-plan-2',
    exerciseId: INITIAL_EXERCISES[7].id,
    exercise: INITIAL_EXERCISES[7],
    sets: INITIAL_EXERCISES[7].defaultSets,
    reps: INITIAL_EXERCISES[7].defaultReps,
    rest: INITIAL_EXERCISES[7].defaultRest,
    days: ['L', 'X', 'V'],
    customNote: 'Sostener 3 segundos arriba contrayendo glúteos sin arquear la cintura.',
  },
  {
    planItemId: 'init-plan-3',
    exerciseId: INITIAL_EXERCISES[6].id,
    exercise: INITIAL_EXERCISES[6],
    sets: INITIAL_EXERCISES[6].defaultSets,
    reps: INITIAL_EXERCISES[6].defaultReps,
    rest: INITIAL_EXERCISES[6].defaultRest,
    days: ['L', 'X', 'V'],
    customNote: 'Mantener pelvis estable como una mesa durante la extensión cruzada.',
  },
];

export interface BackupPayload {
  version: string;
  exportedAt: string;
  professional: ProfessionalProfile;
  patient: PatientData;
  exercises: Exercise[];
  currentPlan: PlanItem[];
  templates: PlanTemplate[];
  filters: FilterState;
}

interface KineStoreState {
  professional: ProfessionalProfile;
  patient: PatientData;
  exercises: Exercise[];
  currentPlan: PlanItem[];
  templates: PlanTemplate[];
  filters: FilterState;

  // Acciones Profesional
  updateProfessional: (data: Partial<ProfessionalProfile>) => void;

  // Acciones Paciente
  updatePatient: (data: Partial<PatientData>) => void;
  resetNewPatient: () => void;

  // Acciones Biblioteca y Filtros
  setFilter: (data: Partial<FilterState>) => void;
  resetFilters: () => void;
  addCustomExercise: (exercise: Omit<Exercise, 'id' | 'isCustom'>, addToPlan?: boolean) => Exercise;
  deleteCustomExercise: (id: string) => void;
  generatePlanFromFilters: () => { addedCount: number; totalMatches: number };

  // Acciones Editor de Plan
  addExerciseToPlan: (exercise: Exercise) => void;
  updatePlanItem: (planItemId: string, data: Partial<Omit<PlanItem, 'planItemId'>>) => void;
  togglePlanItemDay: (planItemId: string, day: DayOfWeek) => void;
  swapPlanItemRandomly: (planItemId: string) => { success: boolean; newExerciseName?: string };
  removePlanItem: (planItemId: string) => void;
  movePlanItem: (planItemId: string, direction: 'up' | 'down') => void;
  clearPlan: () => void;

  // Acciones Plantillas
  saveCurrentPlanAsTemplate: (name: string, description: string) => PlanTemplate | null;
  loadTemplate: (templateId: string) => boolean;
  deleteTemplate: (templateId: string) => void;

  // Sincronización JSON
  getBackupPayload: () => BackupPayload;
  importBackupPayload: (payload: Partial<BackupPayload>) => boolean;
}

export const useKineStore = create<KineStoreState>()(
  persist(
    (set, get) => ({
      professional: DEFAULT_PROFESSIONAL,
      patient: DEFAULT_PATIENT,
      exercises: INITIAL_EXERCISES,
      currentPlan: INITIAL_PLAN_ITEMS,
      templates: INITIAL_TEMPLATES,
      filters: DEFAULT_FILTERS,

      updateProfessional: (data) =>
        set((state) => ({
          professional: { ...state.professional, ...data },
        })),

      updatePatient: (data) =>
        set((state) => ({
          patient: { ...state.patient, ...data },
        })),

      resetNewPatient: () =>
        set(() => ({
          patient: {
            name: '',
            age: '',
            diagnosis: '',
            evaScore: 0,
            evaluationDate: getTodayFormatted(),
            clinicalNotes: '',
            precautions:
              'Realizar los ejercicios de forma controlada y sin dolor agudo. Ante cualquier molestia inusual, consultar al profesional.',
          },
          currentPlan: [],
        })),

      setFilter: (data) =>
        set((state) => ({
          filters: { ...state.filters, ...data },
        })),

      resetFilters: () =>
        set((state) => ({
          filters: {
            ...DEFAULT_FILTERS,
            daysPerWeek: state.filters.daysPerWeek,
            exercisesPerDay: state.filters.exercisesPerDay,
          },
        })),

      addCustomExercise: (exerciseData, addToPlan = true) => {
        const newExercise: Exercise = {
          ...exerciseData,
          id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          isCustom: true,
        };
        set((state) => {
          const updatedExercises = [newExercise, ...state.exercises];
          const days = getDaysForFrequency(state.filters.daysPerWeek);
          const updatedPlan = addToPlan
            ? [
                ...state.currentPlan,
                {
                  planItemId: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  exerciseId: newExercise.id,
                  exercise: newExercise,
                  sets: newExercise.defaultSets,
                  reps: newExercise.defaultReps,
                  rest: newExercise.defaultRest,
                  days,
                  customNote: '',
                },
              ]
            : state.currentPlan;
          return {
            exercises: updatedExercises,
            currentPlan: updatedPlan,
          };
        });
        return newExercise;
      },

      deleteCustomExercise: (id) =>
        set((state) => ({
          exercises: state.exercises.filter((ex) => ex.id !== id),
          currentPlan: state.currentPlan.filter((item) => item.exerciseId !== id),
        })),

      generatePlanFromFilters: () => {
        const { exercises, filters } = get();
        const searchLower = filters.search.trim().toLowerCase();

        const matching = exercises.filter((ex) => {
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

        if (matching.length === 0) {
          return { addedCount: 0, totalMatches: 0 };
        }

        // Barajar ejercicios coincidentes para ofrecer variedad en cada generación
        const shuffled = [...matching].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.max(1, filters.exercisesPerDay));
        const recommendedDays = getDaysForFrequency(filters.daysPerWeek);

        const newPlanItems: PlanItem[] = selected.map((ex, idx) => ({
          planItemId: `plan-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
          exerciseId: ex.id,
          exercise: ex,
          sets: ex.defaultSets,
          reps: ex.defaultReps,
          rest: ex.defaultRest,
          days: [...recommendedDays],
          customNote: '',
        }));

        set({ currentPlan: newPlanItems });
        return { addedCount: newPlanItems.length, totalMatches: matching.length };
      },

      addExerciseToPlan: (exercise) =>
        set((state) => {
          const days = getDaysForFrequency(state.filters.daysPerWeek);
          const newItem: PlanItem = {
            planItemId: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            exerciseId: exercise.id,
            exercise,
            sets: exercise.defaultSets,
            reps: exercise.defaultReps,
            rest: exercise.defaultRest,
            days: [...days],
            customNote: '',
          };
          return { currentPlan: [...state.currentPlan, newItem] };
        }),

      updatePlanItem: (planItemId, data) =>
        set((state) => ({
          currentPlan: state.currentPlan.map((item) =>
            item.planItemId === planItemId ? { ...item, ...data } : item
          ),
        })),

      togglePlanItemDay: (planItemId, day) =>
        set((state) => ({
          currentPlan: state.currentPlan.map((item) => {
            if (item.planItemId !== planItemId) return item;
            const exists = item.days.includes(day);
            const updatedDays = exists
              ? item.days.filter((d) => d !== day)
              : [...item.days, day];
            return { ...item, days: updatedDays };
          }),
        })),

      swapPlanItemRandomly: (planItemId) => {
        const { currentPlan, exercises } = get();
        const targetItem = currentPlan.find((item) => item.planItemId === planItemId);
        if (!targetItem) return { success: false };

        const targetZone = targetItem.exercise.zone;
        const currentExerciseIds = new Set(currentPlan.map((i) => i.exerciseId));

        // Buscar primero ejercicios de la misma zona que NO estén aún en el plan
        let candidates = exercises.filter(
          (ex) => ex.zone === targetZone && !currentExerciseIds.has(ex.id)
        );

        // Si todos los de la misma zona ya están en el plan, permitir cualquiera de la misma zona distinto al actual
        if (candidates.length === 0) {
          candidates = exercises.filter(
            (ex) => ex.zone === targetZone && ex.id !== targetItem.exerciseId
          );
        }

        if (candidates.length === 0) {
          return { success: false };
        }

        const randomReplacement =
          candidates[Math.floor(Math.random() * candidates.length)];

        set((state) => ({
          currentPlan: state.currentPlan.map((item) =>
            item.planItemId === planItemId
              ? {
                  ...item,
                  exerciseId: randomReplacement.id,
                  exercise: randomReplacement,
                  sets: randomReplacement.defaultSets,
                  reps: randomReplacement.defaultReps,
                  rest: randomReplacement.defaultRest,
                }
              : item
          ),
        }));

        return { success: true, newExerciseName: randomReplacement.name };
      },

      removePlanItem: (planItemId) =>
        set((state) => ({
          currentPlan: state.currentPlan.filter((item) => item.planItemId !== planItemId),
        })),

      movePlanItem: (planItemId, direction) =>
        set((state) => {
          const index = state.currentPlan.findIndex((i) => i.planItemId === planItemId);
          if (index === -1) return state;
          const targetIndex = direction === 'up' ? index - 1 : index + 1;
          if (targetIndex < 0 || targetIndex >= state.currentPlan.length) return state;
          const copy = [...state.currentPlan];
          const [moved] = copy.splice(index, 1);
          copy.splice(targetIndex, 0, moved);
          return { currentPlan: copy };
        }),

      clearPlan: () => set({ currentPlan: [] }),

      saveCurrentPlanAsTemplate: (name, description) => {
        const { currentPlan } = get();
        if (currentPlan.length === 0 || !name.trim()) return null;

        const zones = Array.from(new Set(currentPlan.map((i) => i.exercise.zone)));
        const newTemplate: PlanTemplate = {
          id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: name.trim(),
          description:
            description.trim() ||
            `Plantilla de ${currentPlan.length} ejercicios (${zones.join(', ')})`,
          zone: zones.join(' / '),
          createdAt: getTodayFormatted(),
          items: currentPlan.map((item) => ({
            ...item,
            days: [...item.days],
          })),
        };

        set((state) => ({
          templates: [newTemplate, ...state.templates],
        }));

        return newTemplate;
      },

      loadTemplate: (templateId) => {
        const { templates } = get();
        const found = templates.find((t) => t.id === templateId);
        if (!found) return false;

        const clonedItems: PlanItem[] = found.items.map((item, idx) => ({
          ...item,
          planItemId: `plan-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
          days: [...item.days],
        }));

        set({ currentPlan: clonedItems });
        return true;
      },

      deleteTemplate: (templateId) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== templateId),
        })),

      getBackupPayload: () => {
        const state = get();
        return {
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          professional: state.professional,
          patient: state.patient,
          exercises: state.exercises,
          currentPlan: state.currentPlan,
          templates: state.templates,
          filters: state.filters,
        };
      },

      importBackupPayload: (payload) => {
        if (!payload || typeof payload !== 'object') return false;
        set((state) => ({
          professional: payload.professional
            ? { ...state.professional, ...payload.professional }
            : state.professional,
          patient: payload.patient
            ? { ...state.patient, ...payload.patient }
            : state.patient,
          exercises:
            Array.isArray(payload.exercises) && payload.exercises.length > 0
              ? payload.exercises
              : state.exercises,
          currentPlan: Array.isArray(payload.currentPlan)
            ? payload.currentPlan
            : state.currentPlan,
          templates: Array.isArray(payload.templates)
            ? payload.templates
            : state.templates,
          filters: payload.filters
            ? { ...state.filters, ...payload.filters }
            : state.filters,
        }));
        return true;
      },
    }),
    {
      name: 'kinegen-pro-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
