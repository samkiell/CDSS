'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Upload, X, FileText, Image as ImageIcon, Plus } from 'lucide-react';
import useAssessmentStore from '@/store/assessmentStore';

export default function SupportingMediaGrid() {
  const { files, addFile, removeFile, setStep } = useAssessmentStore();

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    selectedFiles.forEach((file) => {
      // Mock upload / store local URL
      addFile({
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      });
    });
  };

  return (
    <div className="animate-in fade-in space-y-8 duration-500">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="inline-flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          Upload Supporting Files{' '}
          <span className="text-sm font-normal text-slate-400">(Optional)</span>
        </h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Provide any X-rays, MRI scans, or clinical notes that might help with the AI
          preliminary analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {files.map((file, index) => (
          <Card
            key={index}
            className="group relative overflow-hidden border-2 border-slate-100 dark:border-slate-800"
          >
            <CardContent className="flex flex-col items-center p-4">
              <button
                onClick={() => removeFile(file.name)}
                className="absolute top-2 right-2 z-10 rounded-full bg-slate-100 p-1 text-slate-400 hover:text-red-500 dark:bg-slate-800"
              >
                <X size={16} />
              </button>
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-xl bg-blue-50 dark:bg-slate-800">
                {file.type.includes('image') ? (
                  <ImageIcon className="text-primary" />
                ) : (
                  <FileText className="text-primary" />
                )}
              </div>
              <p className="w-full truncate text-center text-sm font-semibold">
                {file.name}
              </p>
              <p className="mt-1 text-xs text-slate-400">{file.size}</p>
            </CardContent>
          </Card>
        ))}

        <label className="cursor-pointer">
          <input type="file" multiple className="hidden" onChange={handleFileChange} />
          <Card className="hover:border-primary h-full min-h-[160px] border-2 border-dashed border-slate-200 transition-all dark:border-slate-800">
            <CardContent className="flex h-full flex-col items-center justify-center space-y-2 p-4">
              <div className="bg-primary/10 text-primary rounded-full p-3">
                <Plus size={24} />
              </div>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                Add More Files
              </span>
            </CardContent>
          </Card>
        </label>
      </div>

      <div className="flex justify-center gap-4 pt-8">
        <Button
          variant="secondary"
          onClick={() => useAssessmentStore.getState().goBack()}
        >
          Previous
        </Button>
        <Button size="lg" onClick={() => setStep('summary')} className="min-w-[200px]">
          Review & Submit
        </Button>
      </div>
    </div>
  );
}
