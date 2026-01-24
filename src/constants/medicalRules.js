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
        options: [
          { text: 'Heel', next: 'ankle_q2' },
          { text: 'Heel/sole of foot', next: 'ankle_q2' },
          { text: 'Ankle', next: 'ankle_q2' },
          { text: 'Malleolus', next: 'ankle_q2' },
        ],
      },
      ankle_q2: {
        text: 'When do you feel the pain?',
        options: [
          { text: 'Morning', next: 'ankle_q3' },
          { text: 'Noon', next: 'ankle_q3' },
          { text: 'Night', next: 'ankle_q3' },
          { text: 'Every time', next: 'ankle_q3' },
        ],
      },
      ankle_q3: {
        text: 'Do you experience ankle joint stiffness?',
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
        options: [
          { text: 'Yes', next: 'ankle_achilles_q2', category: 'Achilles Tendinopathy' },
          { text: 'No', next: 'ankle_achilles_q2' },
        ],
      },
      ankle_achilles_q2: {
        text: 'How did the pain begin?',
        options: [
          {
            text: 'Sudden',
            next: 'ankle_achilles_q3',
            tags: ['Rule out Achilles tendon rupture'],
          },
          { text: 'Gradual', next: 'ankle_achilles_q3' },
        ],
      },
      // ... more Ankle rules
    },
  },
  lumbar: {
    title: 'Lumbar Region',
    startQuestionId: 'lumbar_q1',
    questions: {
      lumbar_q1: {
        text: 'Where is your pain located?',
        options: [
          { text: 'Lower back only', next: 'lumbar_q2' },
          {
            text: 'Radiates down one leg',
            next: 'lumbar_q2',
            tags: ['Rule out sciatica'],
          },
          {
            text: 'Radiates down both legs',
            next: 'lumbar_q2',
            tags: ['RED FLAG: Rule out cauda equina syndrome'],
          },
        ],
      },
      lumbar_q2: {
        text: 'How did the pain begin?',
        options: [
          {
            text: 'Sudden',
            next: 'lumbar_q3',
            tags: ['Rule out lumbar disc herniation'],
          },
          { text: 'Gradual', next: 'lumbar_q3' },
        ],
      },
      lumbar_q_redflag: {
        text: 'Are you experiencing any bowel or bladder dysfunction, such as difficulty or loss of control in urination or defecation?',
        options: [
          {
            text: 'Yes',
            next: 'lumbar_next',
            tags: ['CRITICAL RED FLAG: Cauda Equina Syndrome'],
          },
          { text: 'No', next: 'lumbar_next' },
        ],
      },
      // ... more Lumbar rules
    },
  },
  // Placeholder for others to be extracted verbatim
  cervical: { title: 'Cervical Region', startQuestionId: 'cervical_q1', questions: {} },
  shoulder: { title: 'Shoulder Region', startQuestionId: 'shoulder_q1', questions: {} },
  elbow: { title: 'Elbow Region', startQuestionId: 'elbow_q1', questions: {} },
};

export const BODY_REGIONS = [
  { id: 'ankle', name: 'Ankle', icon: 'Footprints' },
  { id: 'lumbar', name: 'Lower Back (Lumbar)', icon: 'MoveDown' },
  { id: 'cervical', name: 'Neck (Cervical)', icon: 'UserRound' },
  { id: 'shoulder', name: 'Shoulder', icon: 'Armchair' },
  { id: 'elbow', name: 'Elbow', icon: 'Activity' },
];
