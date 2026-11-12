export type BodyZone =
  | 'Cervical'
  | 'Hombro'
  | 'Dorsal'
  | 'Lumbar'
  | 'Cadera'
  | 'Rodilla'
  | 'Tobillo y Pie';

export type RehabPhase = 'Aguda' | 'Subaguda' | 'Fortalecimiento';

export type ExerciseObjective =
  | 'Dolor'
  | 'Movilidad'
  | 'Fuerza'
  | 'Propiocepción'
  | 'Control Motor';

export type WorkType =
  | 'Isométrico'
  | 'Concéntrico'
  | 'Excéntrico'
  | 'Estiramiento'
  | 'Movilidad Articular'
  | 'Neurodinamia'
  | 'Propioceptivo';

export type DayOfWeek = 'L' | 'M' | 'X' | 'J' | 'V' | 'S' | 'D';

export const ALL_DAYS: { key: DayOfWeek; label: string; fullName: string }[] = [
  { key: 'L', label: 'L', fullName: 'Lunes' },
  { key: 'M', label: 'M', fullName: 'Martes' },
  { key: 'X', label: 'X', fullName: 'Miércoles' },
  { key: 'J', label: 'J', fullName: 'Jueves' },
  { key: 'V', label: 'V', fullName: 'Viernes' },
  { key: 'S', label: 'S', fullName: 'Sábado' },
  { key: 'D', label: 'D', fullName: 'Domingo' },
];

export const BODY_ZONES: BodyZone[] = [
  'Cervical',
  'Hombro',
  'Dorsal',
  'Lumbar',
  'Cadera',
  'Rodilla',
  'Tobillo y Pie',
];

export const REHAB_PHASES: RehabPhase[] = [
  'Aguda',
  'Subaguda',
  'Fortalecimiento',
];

export const EXERCISE_OBJECTIVES: ExerciseObjective[] = [
  'Dolor',
  'Movilidad',
  'Fuerza',
  'Propiocepción',
  'Control Motor',
];

export const WORK_TYPES: WorkType[] = [
  'Isométrico',
  'Concéntrico',
  'Excéntrico',
  'Estiramiento',
  'Movilidad Articular',
  'Neurodinamia',
  'Propioceptivo',
];

export interface Exercise {
  id: string;
  name: string;
  zone: BodyZone;
  pathology: string;
  phase: RehabPhase;
  objective: ExerciseObjective;
  workType: WorkType;
  defaultSets: number;
  defaultReps: string;
  defaultRest: string;
  description: string;
  clinicalTips: string;
  image: string;
  isCustom?: boolean;
}

export interface PlanItem {
  planItemId: string;
  exerciseId: string;
  exercise: Exercise;
  sets: number;
  reps: string;
  rest: string;
  days: DayOfWeek[];
  customNote?: string;
}

export interface ProfessionalProfile {
  name: string;
  license: string;
  clinicName: string;
  specialty: string;
  phone: string;
  email: string;
  logoBase64: string;
  signatureBase64: string;
}

export interface PatientData {
  name: string;
  age: string;
  diagnosis: string;
  evaScore: number;
  evaluationDate: string;
  clinicalNotes: string;
  precautions: string;
}

export interface PlanTemplate {
  id: string;
  name: string;
  description: string;
  zone?: string;
  createdAt: string;
  items: PlanItem[];
}

export interface FilterState {
  search: string;
  zone: string;
  pathology: string;
  phase: string;
  objective: string;
  workType: string;
  daysPerWeek: number;
  exercisesPerDay: number;
}
