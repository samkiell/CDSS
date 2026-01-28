import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAssessmentStore = create(
  persist(
    (set, get) => ({
      currentStep: 'body-map', // 'body-map' | 'questions' | 'upload' | 'summary'
      selectedRegion: null,
      currentQuestionId: null,
      history: [], // Stack of question IDs for previous navigation
      responses: {}, // { questionId: answerText }
      redFlags: [], // List of tagged flags
      aiAnalysis: null, // Temporary AI diagnosis
      isDisclaimerAccepted: false,
      files: [],

      // Actions
      setStep: (step) => set({ currentStep: step }),

      selectRegion: (regionId, startQuestionId) =>
        set({
          selectedRegion: regionId,
          currentQuestionId: startQuestionId,
          currentStep: 'questions',
          history: [],
          responses: {},
          redFlags: [],
          aiAnalysis: null,
        }),

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

      resetAssessment: () =>
        set({
          currentStep: 'body-map',
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
