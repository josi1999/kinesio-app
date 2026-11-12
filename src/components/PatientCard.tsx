import React, { useState } from 'react';
import {
  Activity,
  Calendar,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Gauge,
  User,
  UserPlus,
} from 'lucide-react';
import { useKineStore } from '../store/useKineStore';

interface PatientCardProps {
  onNotify: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export function getEvaDescriptor(score: number): {
  label: string;
  clinicalDetail: string;
  badgeClass: string;
  accentColor: string;
} {
  if (score === 0) {
    return {
      label: 'Sin Dolor',
      clinicalDetail: 'Asintomático en reposo y movimiento',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      accentColor: '#10b981',
    };
  }
  if (score <= 3) {
    return {
      label: 'Dolor Leve',
      clinicalDetail: 'Molestia baja tolerable, permite carga progresiva',
      badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
      accentColor: '#14b8a6',
    };
  }
  if (score <= 6) {
    return {
      label: 'Dolor Moderado',
      clinicalDetail: 'Interfiere parcialmente con actividades funcionales',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      accentColor: '#f59e0b',
    };
  }
  if (score <= 8) {
    return {
      label: 'Dolor Intenso',
      clinicalDetail: 'Alta irritabilidad tisular, priorizar analgesia y descarga',
      badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
      accentColor: '#f97316',
    };
  }
  return {
    label: 'Dolor Severo / Máximo',
    clinicalDetail: 'Limitación funcional severa, evitar estrés mecánico',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    accentColor: '#ef4444',
  };
}

export const PatientCard: React.FC<PatientCardProps> = ({ onNotify }) => {
  const { patient, updatePatient, resetNewPatient } = useKineStore();
  const [showClinicalNotes, setShowClinicalNotes] = useState(false);

  const evaInfo = getEvaDescriptor(patient.evaScore);

  const handleNewPatient = () => {
    resetNewPatient();
    onNotify(
      'Datos del paciente y plan actual reiniciados. Tu biblioteca profesional sigue intacta.',
      'info'
    );
  };

  return (
    <section
      aria-labelledby="patient-section-heading"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-clinical overflow-hidden"
    >
      {/* Cabecera de Ficha del Paciente */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2
              id="patient-section-heading"
              className="text-sm font-display font-bold text-slate-900"
            >
              Paciente Actual & Evaluación EVA
            </h2>
            <p className="text-[11px] text-slate-500">
              Filiación clínica y nivel basal de dolor
            </p>
          </div>
        </div>

        <button
          id="patient-card-btn-new-patient"
          type="button"
          onClick={handleNewPatient}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100/80 border border-teal-200/80 transition-colors"
          title="Limpiar paciente y plan actual para iniciar una nueva atención"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Nuevo Paciente</span>
        </button>
      </div>

      {/* Formulario del Paciente */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Nombre del Paciente */}
          <div className="sm:col-span-6">
            <label
              htmlFor="patient-name-input"
              className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1"
            >
              Nombre y Apellido
            </label>
            <input
              id="patient-name-input"
              type="text"
              value={patient.name}
              onChange={(e) => updatePatient({ name: e.target.value })}
              placeholder="Ej: Lucía Fernández"
              className="w-full px-3.5 py-2 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
            />
          </div>

          {/* Edad */}
          <div className="sm:col-span-2">
            <label
              htmlFor="patient-age-input"
              className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1"
            >
              Edad
            </label>
            <input
              id="patient-age-input"
              type="number"
              min={1}
              max={120}
              value={patient.age}
              onChange={(e) => updatePatient({ age: e.target.value })}
              placeholder="34"
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
            />
          </div>

          {/* Fecha de Evaluación */}
          <div className="sm:col-span-4">
            <label
              htmlFor="patient-date-input"
              className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1"
            >
              Fecha Evaluación
            </label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="patient-date-input"
                type="date"
                value={patient.evaluationDate}
                onChange={(e) => updatePatient({ evaluationDate: e.target.value })}
                className="w-full pl-8 pr-2.5 py-2 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Diagnóstico Kinésico */}
        <div>
          <label
            htmlFor="patient-diagnosis-input"
            className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1"
          >
            Diagnóstico Kinésico / Motivo de Consulta
          </label>
          <div className="relative">
            <Activity className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              id="patient-diagnosis-input"
              type="text"
              value={patient.diagnosis}
              onChange={(e) => updatePatient({ diagnosis: e.target.value })}
              placeholder="Ej: Lumbalgia mecánica subaguda / Post-operatorio LCA..."
              className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Escala Visual Analógica del Dolor (EVA 0 a 10) */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-teal-700" />
              <label
                htmlFor="patient-eva-slider"
                className="text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Escala EVA del Dolor (0 - 10)
              </label>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${evaInfo.badgeClass}`}
              >
                <span className="font-mono text-sm">{patient.evaScore}/10</span>
                <span>•</span>
                <span>{evaInfo.label}</span>
              </span>
            </div>
          </div>

          <input
            id="patient-eva-slider"
            type="range"
            min={0}
            max={10}
            step={1}
            value={patient.evaScore}
            onChange={(e) => updatePatient({ evaScore: Number(e.target.value) })}
            className="w-full eva-slider"
            aria-label="Escala Visual Analógica del Dolor de 0 a 10"
          />

          {/* Selector numérico rápido 0 - 10 */}
          <div className="grid grid-cols-11 gap-1 pt-0.5">
            {Array.from({ length: 11 }, (_, idx) => {
              const isSelected = patient.evaScore === idx;
              return (
                <button
                  key={idx}
                  id={`btn-eva-score-${idx}`}
                  type="button"
                  onClick={() => updatePatient({ evaScore: idx })}
                  className={`py-1 rounded-lg font-mono text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-sm scale-105'
                      : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  {idx}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
            <span>0: Sin dolor</span>
            <span className="font-medium text-slate-600 text-center">
              {evaInfo.clinicalDetail}
            </span>
            <span>10: Máximo dolor</span>
          </div>
        </div>

        {/* Acordeón de Observaciones Clínicas y Precauciones */}
        <div className="border-t border-slate-100 pt-2">
          <button
            id="btn-toggle-clinical-notes"
            type="button"
            onClick={() => setShowClinicalNotes((prev) => !prev)}
            className="w-full flex items-center justify-between py-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-teal-700" />
              Evolución Clínica y Recomendaciones Generales (se incluyen en PDF)
            </span>
            {showClinicalNotes ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showClinicalNotes && (
            <div className="mt-3 space-y-3">
              <div>
                <label
                  htmlFor="patient-clinical-notes"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1"
                >
                  Observaciones de Historia Clínica (Ficha Profesional)
                </label>
                <textarea
                  id="patient-clinical-notes"
                  rows={2}
                  value={patient.clinicalNotes}
                  onChange={(e) => updatePatient({ clinicalNotes: e.target.value })}
                  placeholder="Hallazgos semiológicos, ROM articular, respuesta a la carga..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-teal-600 outline-none transition-all"
                />
              </div>
              <div>
                <label
                  htmlFor="patient-precautions"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1"
                >
                  Pautas de Alerta / Recomendaciones para el Paciente (Plan Paciente)
                </label>
                <textarea
                  id="patient-precautions"
                  rows={2}
                  value={patient.precautions}
                  onChange={(e) => updatePatient({ precautions: e.target.value })}
                  placeholder="Indicaciones generales de seguridad durante la realización domiciliaria..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-teal-600 outline-none transition-all"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
