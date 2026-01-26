'use client';

const patient = {
  name: 'Bola Ahmed Tinubu',
  dob: '12-03-1989',
  sex: 'Male',
};

const diagnosis = {
  possibleCondition: 'Lumbar Disc Herniation',
  painPattern: 'Strong',
  riskLevel: 'Moderate',
  aiConfidence: '85%',
  reasoning: [
    'Pain worsens while walking',
    'Improves with sitting',
    'Radiating leg symptoms',
  ],
  insight: [
    'Pain described as 2/15, but you reported “being able to walk long distance”',
    'This helps your Physiotherapist adjust questions',
  ],
};

const plan = {
  interventionType: [
    'Physical Therapy',
    'Manual Therapy',
    'Therapeutic Exercises',
    'Modalities',
  ],
  description: [
    'Physical Therapy – Targeted exercises and stretches to improve range of motion, strength, and flexibility',
    'Manual Therapy – Hands-on techniques to improve joint mobility and soft tissue function',
    'Therapeutic Exercises – Patient-specific exercises to improve strength, flexibility, and function',
  ],
  duration: ['Session duration: 30–60 mins', 'Frequency: 2–3 times per week'],
  goals: ['Reduce pain and discomfort', 'Improve range of motion and flexibility'],
  progression: [
    'Patient reports decreased pain and discomfort',
    'Patient demonstrates improved range of motion and flexibility',
  ],
  reEvaluation: [
    'Re-evaluate patient progress every 2–3 sessions',
    'Assess patient’s goals and objectives and adjust treatment plan as needed',
  ],
};

function SectionCard({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-3 text-base font-semibold text-gray-900 sm:text-lg dark:text-gray-100">
        {title}
      </h3>
      <div className="space-y-2 text-sm text-gray-700 sm:text-base dark:text-gray-300">
        {children}
      </div>
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700 sm:text-base dark:text-gray-300">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-4xl px-3 pt-5 pb-10 sm:px-6 sm:pt-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3 sm:gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
          <svg
            className="h-6 w-6 text-gray-500 dark:text-gray-300"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-100">
            Treatment Plan View
          </h1>
        </div>
      </div>

      {/* Patient Info */}
      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-3 text-base font-semibold text-gray-900 sm:text-lg dark:text-gray-100">
          Patient’s Information
        </h2>
        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3 sm:text-base">
          <div>
            <span className="font-semibold text-gray-800 dark:text-gray-200">Name:</span>{' '}
            <span className="text-gray-700 dark:text-gray-300">{patient.name}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              Date of Birth:
            </span>{' '}
            <span className="text-gray-700 dark:text-gray-300">{patient.dob}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-800 dark:text-gray-200">Sex:</span>{' '}
            <span className="text-gray-700 dark:text-gray-300">{patient.sex}</span>
          </div>
        </div>
      </div>

      {/* AI Diagnosis */}
      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-2 text-base font-semibold text-gray-900 sm:text-lg dark:text-gray-100">
          AI Preliminary Diagnosis (Provisional)
        </h2>
        <p className="mb-4 text-sm text-gray-700 sm:text-base dark:text-gray-300">
          Based on your answers, this is the likely condition. Your Therapist will confirm
          the final diagnosis.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                Possible Condition:
              </p>
              <p className="text-sm font-semibold text-cyan-600 sm:text-base dark:text-cyan-400">
                {diagnosis.possibleCondition}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                Pain Pattern Match:
              </p>
              <p className="text-sm font-semibold text-gray-900 sm:text-base dark:text-gray-100">
                {diagnosis.painPattern}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                Risk Level:
              </p>
              <p className="text-sm font-semibold text-orange-500 sm:text-base dark:text-orange-300">
                {diagnosis.riskLevel}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                Reasoning Indicator:
              </p>
              <BulletList items={diagnosis.reasoning} />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                Insight:
              </p>
              <BulletList items={diagnosis.insight} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-lg bg-cyan-50 px-4 py-3 sm:col-span-2 dark:bg-cyan-900/30">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-cyan-600 shadow-sm dark:bg-gray-800 dark:text-cyan-300">
              <span className="text-base font-semibold">{diagnosis.aiConfidence}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                AI Confidence
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Based on your answers. This will be updated by your physiotherapist.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Sections */}
      <div className="space-y-4 sm:space-y-5">
        <SectionCard title="Intervention Type">
          <BulletList items={plan.interventionType} />
        </SectionCard>

        <SectionCard title="Description">
          <BulletList items={plan.description} />
        </SectionCard>

        <SectionCard title="Duration">
          <BulletList items={plan.duration} />
        </SectionCard>

        <SectionCard title="Goals">
          <BulletList items={plan.goals} />
        </SectionCard>

        <SectionCard title="Progression Criteria">
          <BulletList items={plan.progression} />
        </SectionCard>

        <SectionCard title="Re-Evaluation Plan">
          <BulletList items={plan.reEvaluation} />
        </SectionCard>
      </div>

      {/* Footer */}
      <div className="mt-8 flex justify-end border-t border-gray-200 pt-6 text-right dark:border-gray-700">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Dr. Ajayi
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Therapist’s Name</p>
        </div>
      </div>
    </div>
  );
}
