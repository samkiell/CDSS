import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * ASSESSMENT STORE
 * =================
 * Manages the patient assessment flow state with branching question engine.
 *
 * FLOW ORDER:
 * 1. biodata   → Patient confirms/edits biodata (MANDATORY - cannot be skipped)
 * 2. body-map  → Patient selects affected body region
 * 3. questions → Dynamic branching questions based on region and JSON rules
 * 4. summary   → Review all answers before AI analysis
 * 5. analyzing → AI temporal diagnosis in progress
 * 6. complete  → Final confirmation and handoff to therapist
 *
 * BIODATA SNAPSHOT:
 * The biodata is snapshotted per assessment to preserve historical accuracy.
 * Changes to biodata here do NOT update the patient's main profile/settings.
 * Each assessment stores its own copy of the biodata at the time of creation.
 *
 * ENGINE INTEGRATION:
 * The store now integrates with the branching assessment engine.
 * Engine state is stored separately and managed through dedicated actions.
 */

const useAssessmentStore = create(
  persist(
    (set, get) => ({
      // Flow now starts with 'biodata' step - this is MANDATORY
      currentStep: 'biodata', // 'biodata' | 'body-map' | 'questions' | 'summary' | 'analyzing' | 'complete'

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

      /**
       * BRANCHING ENGINE STATE
       * =======================
       * The engine state contains all question/answer tracking,
       * condition likelihood scores, and rule-out decisions.
       * This replaces the simple currentQuestionId/responses pattern.
       */
      engineState: null,

      // Legacy fields maintained for compatibility
      currentQuestionId: null,
      history: [], // Stack of question IDs for previous navigation
      responses: {}, // { questionId: answerText }
      redFlags: [], // List of tagged flags
      aiAnalysis: null, // Temporal AI diagnosis result
      isDisclaimerAccepted: false,
      files: [],

      /**
       * TRACEABILITY STATE
       * ===================
       * Full assessment trace for therapist review.
       * Stored per assessment for audit and clinical review.
       */
      assessmentTrace: null,
      submittedToTherapist: false,
      submittedAt: null,

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

        /**
         * REGION GUARDRAIL
         * =================
         * Prevent navigation to questions unless a region is selected.
         */
        if ((step === 'questions' || step === 'summary') && !state.selectedRegion) {
          console.warn('Cannot proceed without selecting a region');
          set({ currentStep: 'body-map' });
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

      /**
       * SELECT REGION
       * ==============
       * Called when patient selects a body region.
       * Initializes the assessment engine with region-specific rules.
       */
      selectRegion: (regionId) => {
        const state = get();

        // Enforce biodata confirmation before region selection
        if (!state.biodataConfirmed) {
          console.warn('Cannot select region without confirming biodata');
          set({ currentStep: 'biodata' });
          return;
        }

        set({
          selectedRegion: regionId,
          currentStep: 'questions',
          // Clear previous engine state when selecting new region
          engineState: null,
          history: [],
          responses: {},
          redFlags: [],
          aiAnalysis: null,
        });
      },

      /**
       * INITIALIZE ENGINE
       * ==================
       * Called after region selection to initialize the branching engine
       * with loaded JSON rules.
       */
      initializeEngine: (initialState) => {
        set({
          engineState: initialState,
        });
      },

      /**
       * UPDATE ENGINE STATE
       * ====================
       * Called when processing an answer through the engine.
       * Updates the full engine state including condition tracking.
       */
      updateEngineState: (newState) => {
        const { askedQuestions, redFlags: engineRedFlags } = newState;

        // Sync legacy state for backward compatibility
        const responses = {};
        askedQuestions.forEach((aq) => {
          responses[aq.questionId] = aq.answer;
        });

        set({
          engineState: newState,
          responses,
          history: askedQuestions.map((aq) => aq.questionId),
          redFlags: engineRedFlags.map((rf) => rf.redFlagText || 'Red Flag Detected'),
        });
      },

      /**
       * COMPLETE QUESTIONS
       * ===================
       * Called when all questions are answered or patient manually proceeds.
       * Moves to summary step for review before AI analysis.
       */
      completeQuestions: () => {
        set({
          currentStep: 'summary',
        });
      },

      setAiAnalysis: (analysis) => set({ aiAnalysis: analysis }),

      /**
       * LEGACY ANSWER QUESTION
       * =======================
       * Maintained for backward compatibility with existing QuestionCard.
       * New code should use updateEngineState instead.
       */
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
          currentQuestionId: nextQuestionId || null,
        });

        if (!nextQuestionId) {
          set({ currentStep: 'summary' });
        }
      },

      goBack: () => {
        const state = get();

        // If at body-map, stay there (biodata is confirmed)
        if (state.currentStep === 'body-map') {
          return;
        }

        // If at summary, go back to questions
        if (state.currentStep === 'summary') {
          set({ currentStep: 'questions' });
          return;
        }

        // If in questions with no history, go to body-map
        if (state.history.length === 0) {
          set({ currentStep: 'body-map', selectedRegion: null, engineState: null });
          return;
        }

        // Otherwise let the engine handle going back
        // For now, we just go to body-map to re-select
        set({ currentStep: 'body-map', selectedRegion: null, engineState: null });
      },

      setDisclaimerAccepted: (accepted) => set({ isDisclaimerAccepted: accepted }),

      addFile: (file) => set((state) => ({ files: [...state.files, file] })),
      removeFile: (fileName) =>
        set((state) => ({
          files: state.files.filter((f) => f.name !== fileName),
        })),

      /**
       * SET ASSESSMENT TRACE
       * =====================
       * Stores the full assessment trace for therapist review.
       * Called before submission to ensure traceability.
       */
      setAssessmentTrace: (trace) =>
        set({
          assessmentTrace: trace,
        }),

      /**
       * SUBMIT TO THERAPIST
       * =====================
       * Marks the assessment as submitted and locks answers.
       * After this, patient cannot edit their responses.
       */
      submitToTherapist: () =>
        set({
          submittedToTherapist: true,
          submittedAt: new Date().toISOString(),
          currentStep: 'complete',
        }),

      /**
       * RESET ASSESSMENT
       * =================
       * Clears all assessment state and returns to biodata step.
       * This is called when starting a new assessment.
       */
      resetAssessment: () =>
        set({
          currentStep: 'biodata',
          biodataConfirmed: false,
          biodata: null,
          selectedRegion: null,
          engineState: null,
          currentQuestionId: null,
          history: [],
          responses: {},
          redFlags: [],
          aiAnalysis: null,
          isDisclaimerAccepted: false,
          files: [],
          assessmentTrace: null,
          submittedToTherapist: false,
          submittedAt: null,
        }),
    }),
    {
      name: 'patient-assessment-storage',
    }
  )
);

export default useAssessmentStore;
