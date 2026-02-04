import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * ASSESSMENT STORE
 * =================
 * Manages the patient assessment flow state.
 *
 * FLOW ORDER:
 * 1. biodata   → Patient confirms/edits biodata (MANDATORY - cannot be skipped)
 * 2. body-map  → Patient selects affected body region
 * 3. questions → Dynamic symptom questions based on region
 * 4. upload    → Supporting media/documents
 * 5. summary   → AI analysis and review
 * 6. complete  → Confirmation screen
 *
 * BIODATA SNAPSHOT:
 * The biodata is snapshotted per assessment to preserve historical accuracy.
 * Changes to biodata here do NOT update the patient's main profile/settings.
 * Each assessment stores its own copy of the biodata at the time of creation.
 */

const useAssessmentStore = create(
  persist(
    (set, get) => ({
      // Flow now starts with 'biodata' step - this is MANDATORY
      currentStep: 'biodata', // 'biodata' | 'body-map' | 'questions' | 'upload' | 'summary' | 'complete'

      /**
       * BIODATA STATE
       * ==============
       * biodataConfirmed: Boolean flag indicating if patient has confirmed biodata
       * biodata: Snapshot of patient biodata for THIS assessment only
       *
       * WHY SNAPSHOT?
       * - Preserves historical accuracy (patient's data at time of assessment)
       * - Allows edits without affecting main profile
       * - Each assessment is self-contained for audit/legal purposes
       */
      biodataConfirmed: false,
      biodata: null, // { fullName, sex, ageRange, occupation, education, notes }

      selectedRegion: null,
      currentQuestionId: null,
      history: [], // Stack of question IDs for previous navigation
      responses: {}, // { questionId: answerText }
      redFlags: [], // List of tagged flags
      aiAnalysis: null, // Temporary AI diagnosis
      isDisclaimerAccepted: false,
      files: [],

      // Actions
      setStep: (step) => {
        const state = get();

        /**
         * BIODATA GUARDRAIL
         * =================
         * Prevent navigation to any step beyond 'biodata' unless biodata is confirmed.
         * This ensures the biodata step cannot be bypassed via direct URL or state manipulation.
         */
        if (step !== 'biodata' && !state.biodataConfirmed) {
          console.warn('Cannot proceed without confirming biodata');
          set({ currentStep: 'biodata' });
          return;
        }

        set({ currentStep: step });
      },

      /**
       * CONFIRM BIODATA
       * ================
       * Called when patient confirms their biodata.
       * Creates a snapshot of the biodata for this assessment.
       * Once confirmed, patient can proceed to body-map selection.
       *
       * @param {Object} biodataSnapshot - The biodata to snapshot
       * @param {string} biodataSnapshot.fullName - Patient's full name
       * @param {string} biodataSnapshot.sex - Male / Female / Other
       * @param {string} biodataSnapshot.ageRange - Age range category
       * @param {string} biodataSnapshot.occupation - Occupation category
       * @param {string} biodataSnapshot.education - Educational background
       * @param {string} [biodataSnapshot.notes] - Optional free-text notes
       */
      confirmBiodata: (biodataSnapshot) =>
        set({
          biodata: {
            ...biodataSnapshot,
            confirmedAt: new Date().toISOString(),
          },
          biodataConfirmed: true,
          currentStep: 'body-map',
        }),

      selectRegion: (regionId, startQuestionId) => {
        const state = get();

        // Enforce biodata confirmation before region selection
        if (!state.biodataConfirmed) {
          console.warn('Cannot select region without confirming biodata');
          set({ currentStep: 'biodata' });
          return;
        }

        set({
          selectedRegion: regionId,
          currentQuestionId: startQuestionId,
          currentStep: 'questions',
          history: [],
          responses: {},
          redFlags: [],
          aiAnalysis: null,
        });
      },

      setAiAnalysis: (analysis) => set({ aiAnalysis: analysis }),

      answerQuestion: (questionId, answer, nextQuestionId, tags = []) => {
        const state = get();
        const newResponses = { ...state.responses, [questionId]: answer };
        const newRedFlags = [
          ...new Set([
            ...state.redFlags,
            ...tags.filter(
              (t) =>
                t.toLowerCase().includes('red flag') ||
                t.toLowerCase().includes('cauda equina') ||
                t.toLowerCase().includes('fracture')
            ),
          ]),
        ];

        set({
          responses: newResponses,
          redFlags: newRedFlags,
          history: [...state.history, questionId],
          currentQuestionId: nextQuestionId || 'upload', // If no next question, move to upload
        });

        if (!nextQuestionId) {
          set({ currentStep: 'upload' });
        }
      },

      goBack: () => {
        const state = get();

        // If at body-map, go back to biodata (but keep biodata confirmed so user can return)
        if (state.currentStep === 'body-map') {
          // Stay on body-map, don't go back to biodata (biodata is already confirmed)
          return;
        }

        if (state.history.length === 0) {
          set({ currentStep: 'body-map', selectedRegion: null });
          return;
        }

        const newHistory = [...state.history];
        const lastQuestionId = newHistory.pop();

        set({
          currentQuestionId: lastQuestionId,
          history: newHistory,
          currentStep: 'questions',
        });
      },

      setDisclaimerAccepted: (accepted) => set({ isDisclaimerAccepted: accepted }),

      addFile: (file) => set((state) => ({ files: [...state.files, file] })),
      removeFile: (fileName) =>
        set((state) => ({
          files: state.files.filter((f) => f.name !== fileName),
        })),

      /**
       * RESET ASSESSMENT
       * =================
       * Clears all assessment state and returns to biodata step.
       * This is called when starting a new assessment.
       */
      resetAssessment: () =>
        set({
          currentStep: 'biodata', // Reset to biodata step, not body-map
          biodataConfirmed: false,
          biodata: null,
          selectedRegion: null,
          currentQuestionId: null,
          history: [],
          responses: {},
          redFlags: [],
          aiAnalysis: null,
          isDisclaimerAccepted: false,
          files: [],
        }),
    }),
    {
      name: 'patient-assessment-storage',
    }
  )
);

export default useAssessmentStore;
