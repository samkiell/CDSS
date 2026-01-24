/**
 * Diagnosis Store - Zustand State for Diagnosis Sessions
 * Manages the current diagnosis session state
 */

import { create } from 'zustand';

const initialState = {
  currentSession: null,
  symptoms: [],
  currentStep: 0,
  totalSteps: 0,
  affectedRegions: [],
  temporalDiagnosis: null,
  isSubmitting: false,
  error: null,
};

const useDiagnosisStore = create((set, get) => ({
  ...initialState,

  /**
   * Start a new diagnosis session
   * @param {string} patientId - Patient's user ID
   */
  startSession: (patientId) => {
    set({
      ...initialState,
      currentSession: {
        patientId,
        startedAt: new Date().toISOString(),
        status: 'in_progress',
      },
    });
  },

  /**
   * Add a symptom response
   * @param {Object} symptomResponse - Symptom response object
   */
  addSymptom: (symptomResponse) => {
    const symptoms = get().symptoms;
    set({
      symptoms: [
        ...symptoms,
        { ...symptomResponse, timestamp: new Date().toISOString() },
      ],
    });
  },

  /**
   * Update an existing symptom response
   * @param {string} questionId - Question ID to update
   * @param {Object} updates - Updates to apply
   */
  updateSymptom: (questionId, updates) => {
    const symptoms = get().symptoms;
    set({
      symptoms: symptoms.map((s) =>
        s.questionId === questionId ? { ...s, ...updates } : s,
      ),
    });
  },

  /**
   * Set affected body regions
   * @param {string[]} regions - Array of affected region codes
   */
  setAffectedRegions: (regions) => {
    set({ affectedRegions: regions });
  },

  /**
   * Navigate to specific step
   * @param {number} step - Step number
   */
  goToStep: (step) => {
    set({ currentStep: step });
  },

  /**
   * Move to next step
   */
  nextStep: () => {
    const { currentStep, totalSteps } = get();
    if (currentStep < totalSteps - 1) {
      set({ currentStep: currentStep + 1 });
    }
  },

  /**
   * Move to previous step
   */
  prevStep: () => {
    const currentStep = get().currentStep;
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

  /**
   * Set total number of steps
   * @param {number} total - Total steps
   */
  setTotalSteps: (total) => {
    set({ totalSteps: total });
  },

  /**
   * Set temporal diagnosis result
   * @param {Object} diagnosis - Diagnosis result from heuristic engine
   */
  setTemporalDiagnosis: (diagnosis) => {
    set({ temporalDiagnosis: diagnosis });
  },

  /**
   * Set submitting state
   * @param {boolean} isSubmitting
   */
  setSubmitting: (isSubmitting) => {
    set({ isSubmitting });
  },

  /**
   * Set error
   * @param {string|null} error
   */
  setError: (error) => {
    set({ error });
  },

  /**
   * Reset store to initial state
   */
  reset: () => {
    set(initialState);
  },

  /**
   * Get session summary for submission
   * @returns {Object} Session data ready for API
   */
  getSessionData: () => {
    const { currentSession, symptoms, affectedRegions, temporalDiagnosis } =
      get();
    return {
      ...currentSession,
      symptoms,
      affectedRegions,
      temporalDiagnosis,
      completedAt: new Date().toISOString(),
    };
  },
}));

export default useDiagnosisStore;
