/**
 * Medical Heuristic Rules extracted from Region Documents
 * Verbatim text and branching logic.
 */

export const MEDICAL_RULES = {
  ankle: {
    title: 'Ankle Region',
    startQuestionId: 'ankle_q1',
    questions: {
      ankle_q1: {
        text: 'What region is pain present in?',
        category: 'location',
        options: [
          { text: 'Heel', next: 'ankle_q2' },
          { text: 'Heel/sole of foot', next: 'ankle_q2' },
          { text: 'Ankle', next: 'ankle_q2' },
          { text: 'Malleolus', next: 'ankle_q2' },
        ],
      },
      ankle_q2: {
        text: 'When do you feel the pain?',
        category: 'temporal',
        options: [
          { text: 'Morning', next: 'ankle_q3' },
          { text: 'Noon', next: 'ankle_q3' },
          { text: 'Night', next: 'ankle_q3' },
          { text: 'Every time', next: 'ankle_q3' },
        ],
      },
      ankle_q3: {
        text: 'Do you experience ankle joint stiffness?',
        category: 'stiffness',
        options: [
          {
            text: 'Yes',
            next: 'ankle_q3_time',
            tags: ['Rule out osteoarthritis'],
          },
          { text: 'No', next: 'ankle_achilles_q1' },
        ],
      },
      ankle_q3_time: {
        text: 'If yes, when?',
        category: 'temporal',
        options: [
          {
            text: 'Morning',
            next: 'ankle_achilles_q1',
            tags: ['Confirm osteoarthritis'],
          },
          { text: 'Noon', next: 'ankle_achilles_q1' },
          { text: 'Night', next: 'ankle_achilles_q1' },
          { text: 'Anytime', next: 'ankle_achilles_q1' },
          { text: 'Every time', next: 'ankle_achilles_q1' },
        ],
      },
      ankle_achilles_q1: {
        text: 'Do you feel the pain about 4 cm above your heel?',
        category: 'location_specific',
        options: [
          {
            text: 'Yes',
            next: 'ankle_achilles_q2',
            tags: ['Achilles Tendinopathy Indicator'],
          },
          { text: 'No', next: 'ankle_achilles_q2' },
        ],
      },
      ankle_achilles_q2: {
        text: 'How did the pain begin?',
        category: 'onset',
        options: [
          {
            text: 'Sudden',
            next: 'ankle_achilles_pop',
            tags: ['Rule out Achilles tendon rupture'],
          },
          { text: 'Gradual', next: 'ankle_achilles_pop' },
        ],
      },
      ankle_achilles_pop: {
        text: 'Did you hear a ripping or popping sensation accompanying the pain at onset?',
        category: 'mechanical',
        options: [
          {
            text: 'Yes',
            next: 'ankle_fracture_q1',
            tags: ['RED FLAG: Potential Rupture'],
          },
          { text: 'No', next: 'ankle_fracture_q1' },
        ],
      },
      ankle_fracture_q1: {
        text: 'Can you walk with the affected foot and bear weight on it?',
        category: 'function',
        options: [
          { text: 'Yes', next: 'ankle_next_region' },
          {
            text: 'No',
            next: 'ankle_next_region',
            tags: ['CRITICAL RED FLAG: Potential Fracture'],
          },
        ],
      },
      ankle_next_region: {
        text: 'Is there tenderness at the medial aspect beneath the heel / mid-foot?',
        category: 'location_specific',
        options: [
          {
            text: 'Yes',
            next: 'ankle_pain_intensity',
            tags: ['Plantar Fasciitis Indicator'],
          },
          { text: 'No', next: 'ankle_pain_intensity' },
        ],
      },
      ankle_pain_intensity: {
        text: 'On a scale of 0-10, how intense is your pain right now?',
        category: 'pain_intensity',
        options: [
          { text: '0 - No Pain', next: null },
          { text: '2 - Mild', next: null },
          { text: '4 - Moderate', next: null },
          { text: '6 - Distressing', next: null },
          { text: '8 - Severe', next: null },
          { text: '10 - Unbearable', next: null },
        ],
      },
    },
  },
  lumbar: {
    title: 'Lumbar Region',
    startQuestionId: 'lumbar_q1',
    questions: {
      lumbar_q1: {
        text: 'Where is your pain located?',
        category: 'location',
        options: [
          { text: 'Lower back only', next: 'lumbar_q2' },
          {
            text: 'Radiates down one leg',
            next: 'lumbar_q2',
            tags: ['Rule out sciatica'],
          },
          {
            text: 'Radiates down both legs',
            next: 'lumbar_q_redflag',
            tags: ['RED FLAG: Rule out cauda equina syndrome'],
          },
        ],
      },
      lumbar_q2: {
        text: 'How did the pain begin?',
        category: 'onset',
        options: [
          {
            text: 'Sudden',
            next: 'lumbar_q_redflag',
            tags: ['Rule out lumbar disc herniation'],
          },
          { text: 'Gradual', next: 'lumbar_q_redflag' },
        ],
      },
      lumbar_q_redflag: {
        text: 'Are you experiencing any bowel or bladder dysfunction, such as difficulty or loss of control in urination or defecation?',
        category: 'red_flag',
        options: [
          {
            text: 'Yes',
            next: 'lumbar_q_numb',
            tags: ['CRITICAL RED FLAG: Cauda Equina Syndrome'],
          },
          { text: 'No', next: 'lumbar_q_numb' },
        ],
      },
      lumbar_q_numb: {
        text: 'Do you experience any numbness or tingling sensation in your legs or feet?',
        category: 'neurological',
        options: [
          {
            text: 'Yes',
            next: 'lumbar_q_weak',
            tags: ['Rule out lumbar disc herniation or cauda equina'],
          },
          { text: 'No', next: 'lumbar_q_weak' },
        ],
      },
      lumbar_q_weak: {
        text: 'Have you experienced any weakness in your legs?',
        category: 'neurological',
        options: [
          { text: 'Yes', next: 'lumbar_pain_intensity', tags: ['Rule out cauda equina'] },
          { text: 'No', next: 'lumbar_pain_intensity' },
        ],
      },
      lumbar_pain_intensity: {
        text: 'On a scale of 0-10, how intense is your pain right now?',
        category: 'pain_intensity',
        options: [
          { text: '0 - No Pain', next: null },
          { text: '2 - Mild', next: null },
          { text: '4 - Moderate', next: null },
          { text: '6 - Distressing', next: null },
          { text: '8 - Severe', next: null },
          { text: '10 - Unbearable', next: null },
        ],
      },
    },
  },
  // Placeholder for others to be extracted verbatim
  cervical: {
    title: 'Cervical Region',
    startQuestionId: 'cervical_pain_intensity',
    questions: {
      cervical_pain_intensity: {
        text: 'On a scale of 0-10, how intense is your neck (cervical) pain right now?',
        category: 'pain_intensity',
        options: [
          { text: '0 - No Pain', next: null },
          { text: '2 - Mild', next: null },
          { text: '4 - Moderate', next: null },
          { text: '6 - Distressing', next: null },
          { text: '8 - Severe', next: null },
          { text: '10 - Unbearable', next: null },
        ],
      },
    },
  },
  shoulder: {
    title: 'Shoulder Region',
    startQuestionId: 'shoulder_pain_intensity',
    questions: {
      shoulder_pain_intensity: {
        text: 'On a scale of 0-10, how intense is your shoulder pain right now?',
        category: 'pain_intensity',
        options: [
          { text: '0 - No Pain', next: null },
          { text: '2 - Mild', next: null },
          { text: '4 - Moderate', next: null },
          { text: '6 - Distressing', next: null },
          { text: '8 - Severe', next: null },
          { text: '10 - Unbearable', next: null },
        ],
      },
    },
  },
  elbow: {
    title: 'Elbow Region',
    startQuestionId: 'elbow_pain_intensity',
    questions: {
      elbow_pain_intensity: {
        text: 'On a scale of 0-10, how intense is your elbow pain right now?',
        category: 'pain_intensity',
        options: [
          { text: '0 - No Pain', next: null },
          { text: '2 - Mild', next: null },
          { text: '4 - Moderate', next: null },
          { text: '6 - Distressing', next: null },
          { text: '8 - Severe', next: null },
          { text: '10 - Unbearable', next: null },
        ],
      },
    },
  },
};

export const BODY_REGIONS = [
  { id: 'ankle', name: 'Ankle', icon: 'Footprints' },
  { id: 'lumbar', name: 'Lower Back (Lumbar)', icon: 'MoveDown' },
  { id: 'cervical', name: 'Neck (Cervical)', icon: 'UserRound' },
  { id: 'shoulder', name: 'Shoulder', icon: 'Armchair' },
  { id: 'elbow', name: 'Elbow', icon: 'Activity' },
];
