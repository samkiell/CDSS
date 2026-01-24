/**
 * Assessment Page
 * Symptom questionnaire for diagnostic intake
 */

'use client';

import { useState } from 'react';
import { useDiagnosisStore } from '@/store';

export default function AssessmentPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const { addSymptom } = useDiagnosisStore();

  // Placeholder questions - will be loaded from database
  const steps = [
    {
      id: 'body_region',
      title: 'Where is your pain located?',
      type: 'single_choice',
      options: [
        { value: 'cervical_spine', label: 'Neck' },
        { value: 'thoracic_spine', label: 'Upper Back' },
        { value: 'lumbar_spine', label: 'Lower Back' },
        { value: 'shoulder', label: 'Shoulder' },
        { value: 'elbow', label: 'Elbow' },
        { value: 'wrist_hand', label: 'Wrist/Hand' },
        { value: 'hip', label: 'Hip' },
        { value: 'knee', label: 'Knee' },
        { value: 'ankle_foot', label: 'Ankle/Foot' },
      ],
    },
    {
      id: 'pain_duration',
      title: 'How long have you had this pain?',
      type: 'single_choice',
      options: [
        { value: 'less_than_week', label: 'Less than 1 week' },
        { value: '1_4_weeks', label: '1-4 weeks' },
        { value: '1_3_months', label: '1-3 months' },
        { value: 'more_than_3_months', label: 'More than 3 months' },
      ],
    },
    {
      id: 'pain_intensity',
      title: 'Rate your pain intensity (0-10)',
      type: 'scale',
      min: 0,
      max: 10,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Symptom Assessment</h1>
        <p className="mt-2 text-gray-600">
          Step {currentStep + 1} of {steps.length}
        </p>
        {/* Progress bar */}
        <div className="mt-4 h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          {steps[currentStep].title}
        </h2>

        {steps[currentStep].type === 'single_choice' && (
          <div className="space-y-3">
            {steps[currentStep].options.map((option) => (
              <button
                key={option.value}
                className="w-full rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-blue-500 hover:bg-blue-50"
                onClick={() => {
                  addSymptom({
                    questionId: steps[currentStep].id,
                    questionText: steps[currentStep].title,
                    questionCategory: steps[currentStep].id,
                    responseType: 'single_choice',
                    response: option.value,
                    weight: 1.0,
                  });
                  handleNext();
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {steps[currentStep].type === 'scale' && (
          <div className="space-y-4">
            <input
              type="range"
              min={steps[currentStep].min}
              max={steps[currentStep].max}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>No pain</span>
              <span>Worst pain</span>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
          >
            {currentStep === steps.length - 1 ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
