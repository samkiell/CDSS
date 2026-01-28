'use client';

import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  Plus,
  ChevronLeft,
  AlertCircle,
  FileIcon,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { cn } from '@/lib/cn';

export default function PatientDocumentsPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', null

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      if (data.success) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('preset', 'medical_report');

    try {
      // 1. Upload to Cloudinary via our internal API
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadData.success) throw new Error(uploadData.error || 'Upload failed');

      // 2. Save metadata to our DB
      const saveRes = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: uploadData.data.url,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          category: inferCategory(file.name),
        }),
      });

      const saveData = await saveRes.json();

      if (saveData.success) {
        setUploadStatus('success');
        fetchDocuments();
      } else {
        throw new Error(saveData.error || 'Metadata save failed');
      }
    } catch (err) {
      console.error('File upload error:', err);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
      // Reset status after 3s
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  const inferCategory = (fileName) => {
    const name = fileName.toLowerCase();
    if (name.includes('x-ray') || name.includes('xray')) return 'X-Ray';
    if (name.includes('mri') || name.includes('scan')) return 'MRI';
    if (name.includes('lab') || name.includes('blood') || name.includes('result'))
      return 'Lab Results';
    if (name.includes('prescription')) return 'Prescription';
    return 'Other';
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const res = await fetch(`/api/documents?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchDocuments();
      } else {
        alert('Failed to delete document: ' + data.error);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="animate-fade-in mx-auto max-w-5xl space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/patient/dashboard"
            className="bg-card border-border hover:bg-accent rounded-full border p-2 shadow-sm transition-all"
          >
            <ChevronLeft className="text-muted-foreground h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-black tracking-tight">Medical Documents</h1>
        </div>

        <div className="relative">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
          <label htmlFor="file-upload">
            <div
              className={cn(
                'bg-primary hover:bg-primary/90 flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 font-bold text-white shadow-lg transition-all',
                isUploading && 'pointer-events-none opacity-50'
              )}
            >
              {isUploading ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Document
                </>
              )}
            </div>
          </label>
        </div>
      </div>

      {uploadStatus === 'success' && (
        <div className="bg-success/10 border-success/20 text-success animate-in slide-in-from-top-4 flex items-center gap-3 rounded-2xl border p-4">
          <CheckCircle2 className="h-5 w-5" />
          <p className="text-sm font-bold">
            Document uploaded and shared with your clinician successfully!
          </p>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="bg-destructive/10 border-destructive/20 text-destructive animate-in slide-in-from-top-4 flex items-center gap-3 rounded-2xl border p-4">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-bold">
            Failed to upload document. Please try again.
          </p>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-blue-100 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <span className="mb-1 text-2xl font-black text-blue-500">
              {documents.length}
            </span>
            <span className="text-[10px] font-black tracking-widest text-blue-600/70 uppercase">
              Total Files
            </span>
          </CardContent>
        </Card>
        <Card className="border-emerald-100 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/10">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <span className="mb-1 text-2xl font-black text-emerald-500">
              {documents.filter((d) => ['X-Ray', 'MRI'].includes(d.category)).length}
            </span>
            <span className="text-[10px] font-black tracking-widest text-emerald-600/70 uppercase">
              Imaging Reports
            </span>
          </CardContent>
        </Card>
        <Card className="border-orange-100 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-900/10">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <span className="mb-1 text-2xl font-black text-orange-500">
              {documents.filter((d) => d.category === 'Lab Results').length}
            </span>
            <span className="text-[10px] font-black tracking-widest text-orange-600/70 uppercase">
              Lab Results
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        <h2 className="text-lg font-black">Your Case Files</h2>

        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
            <p className="text-muted-foreground text-sm font-medium">
              Loading documents...
            </p>
          </div>
        ) : documents.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {documents.map((doc) => (
              <Card
                key={doc._id}
                className="group hover:border-primary/30 overflow-hidden transition-all hover:shadow-md"
              >
                <CardContent className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 shadow-inner dark:bg-slate-800">
                      <FileIcon className="h-6 w-6 text-slate-500" />
                      <div className="absolute -top-1 -right-1">
                        {doc.fileType?.includes('pdf') ? (
                          <Badge className="h-4 min-w-4 border-none bg-red-500 px-1 text-[8px] text-white">
                            PDF
                          </Badge>
                        ) : (
                          <Badge className="h-4 min-w-4 border-none bg-blue-500 px-1 text-[8px] text-white">
                            IMG
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="group-hover:text-primary text-sm leading-none font-black transition-colors">
                        {doc.fileName}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-black tracking-tighter uppercase"
                        >
                          {doc.category}
                        </Badge>
                        <span className="text-muted-foreground text-[10px] font-bold">
                          {formatFileSize(doc.fileSize)} • Added{' '}
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="group-hover:bg-primary/10 group-hover:text-primary h-9 w-9 rounded-full transition-all"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </a>
                    <a href={doc.fileUrl} download={doc.fileName}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="group-hover:bg-primary/10 group-hover:text-primary h-9 w-9 rounded-full transition-all"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(doc._id)}
                      className="hover:bg-destructive/10 hover:text-destructive h-9 w-9 rounded-full transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-slate-200 bg-slate-50/50 py-20 text-center dark:border-slate-800 dark:bg-slate-900/20">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Upload className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-black">No Medical Documents Yet</h3>
            <p className="text-muted-foreground mt-2 max-w-xs text-sm leading-relaxed font-medium">
              Upload your X-rays, MRI scans, or lab results so your clinician can review
              them alongside your assessment.
            </p>
            <label htmlFor="file-upload" className="mt-8">
              <Button
                as="div"
                className="bg-primary hover:bg-primary/90 cursor-pointer rounded-xl px-10 font-bold text-white shadow-lg transition-all"
              >
                Upload My First Document
              </Button>
            </label>
          </div>
        )}
      </div>

      <div className="bg-muted/50 border-border flex items-start gap-4 rounded-3xl border p-6">
        <div className="bg-primary/10 text-primary mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-black">Clinical Data Privacy</h4>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed font-medium">
            All uploaded documents are stored securely using medical-grade encryption.
            Only your assigned clinician and reviewing specialists have access to these
            files for diagnostic purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
