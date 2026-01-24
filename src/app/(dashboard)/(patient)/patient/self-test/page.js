import { Play } from 'lucide-react';

export default function SelfTestPage() {
  const tests = [
    {
      id: 1,
      title: 'Leg Raise Tests',
      purpose:
        'Leg raises help strengthen the core and hip muscles that support the lower back, reducing pressure and improving stability.',
      instructions: [
        'Lie flat on your back on a firm surface.',
        'Ensure both legs are straight and the toes are pointing upward.',
        'Slowly raise one leg to about 45 degrees.',
        'Observe whether the patient experiences pain, tingling or numbness.',
        'Note the angle at which the pain begins (e.g., 30, 45, 60 degrees).',
        'Slowly lower the leg back down and repeat for the other side.',
      ],
    },
    {
      id: 2,
      title: 'Arm Raise Tests',
      purpose:
        'Arm raises help strengthen the core and hip muscles that support the lower back, reducing pressure and improving stability.',
      instructions: [
        'Lie flat on your back on a firm surface.',
        'Slowly raise one leg to about 45 degrees.',
        'Slowly raise one leg to about 45 degrees while keeping the other straight.',
        'Measure whether the patient experiences pain, tingling, or numbness.',
        'Note the angle at which the pain begins (e.g., 30, 45, 60 degrees).',
        'Slowly lower the leg back down and repeat for the other side.',
      ],
    },
  ];
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-800 dark:text-gray-200">
          Guided Self-Tests
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Follow all the symptoms so we can understand your condition and make an accurate
          diagnosis.
        </p>
      </div>

      <div className="space-y-8">
        {tests.map((test) => (
          <div
            key={test.id}
            className="rounded-lg border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-8">
              <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-gray-200">
                {test.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Purpose:</span> {test.purpose}
              </p>
            </div>
            <div className="mb-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
                Instructions
              </h3>
              <ol className="space-y-2">
                {test.instructions.map((instruction, index) => (
                  <li
                    key={index}
                    className="flex gap-3 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span className="shrink-0 font-medium text-gray-600 dark:text-gray-400">
                      {index + 1}.
                    </span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex aspect-video cursor-pointer items-center justify-center rounded-lg bg-gray-700 transition hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600">
              <Play size={64} className="fill-white text-white" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
