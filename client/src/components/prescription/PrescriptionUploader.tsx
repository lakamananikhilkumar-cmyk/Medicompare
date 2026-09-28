import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, ArrowRight, Loader2, Sparkles, X } from 'lucide-react';
import { api } from '../../lib/api';

export const PrescriptionUploader: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setErrorMessage('Please upload an image (JPEG, PNG, WebP) or PDF file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size must be under 10MB.');
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    setUploadResult(null);

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const res = await api.upload.prescription(selectedFile);
      setUploadResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload prescription. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Smart Prescription Upload</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload your prescription slip to instantly detect medicines and compare nearby pharmacy prices
            </p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
          Powered by Gemini & Supabase Storage
        </span>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center space-x-2 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!selectedFile && !uploadResult && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20'
              : 'border-slate-300 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-600 bg-slate-50/50 dark:bg-slate-800/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <UploadCloud className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Click to upload or drag & drop prescription
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Supports JPEG, PNG, WebP, or PDF up to 10MB
          </p>
        </div>
      )}

      {selectedFile && !uploadResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              {previewUrl ? (
                <img src={previewUrl} alt="Prescription preview" className="w-12 h-12 rounded object-cover border border-slate-300 dark:border-slate-600" />
              ) : (
                <FileText className="w-8 h-8 text-teal-600 dark:text-teal-400" />
              )}
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-xs">{selectedFile.name}</p>
                <p className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button
              onClick={reset}
              disabled={isUploading}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={reset}
              disabled={isUploading}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="inline-flex items-center space-x-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition shadow-sm disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Prescription</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {uploadResult && (
        <div className="space-y-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Prescription uploaded and analyzed successfully</span>
            </div>
            <button
              onClick={reset}
              className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              Upload Another
            </button>
          </div>

          {/* Matched Medicines from Catalog */}
          {uploadResult.matchedMedicines && uploadResult.matchedMedicines.length > 0 ? (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Matching Medicines in MediCompare Catalog ({uploadResult.matchedMedicines.length})
              </h4>
              <div className="space-y-2">
                {uploadResult.matchedMedicines.map((med: any) => (
                  <div
                    key={med.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center justify-between hover:border-teal-500 transition"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{med.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {med.generic_name} • {med.strength} • {med.dosage_form}
                      </p>
                      {med.lowest_price && (
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                          From ₹{Number(med.lowest_price).toFixed(2)} to ₹{Number(med.highest_price).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => navigate(`/compare/${med.id}`)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg transition"
                    >
                      <span>Compare</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Prescription uploaded. You can search directly for medicine salts in the search bar above.
              </p>
            </div>
          )}

          {/* AI Notes */}
          {uploadResult.extracted?.doctorNotes && (
            <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl text-xs text-blue-900 dark:text-blue-300">
              <span className="font-semibold">Notes from slip:</span> {uploadResult.extracted.doctorNotes}
            </div>
          )}

          {/* Mandatory Disclaimer */}
          <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
            {uploadResult.extracted?.disclaimer ||
              'Information provided by MediCompare is for general informational and educational purposes only and is not medical advice. Prescription requirements, dosage, and suitability must be verified with a qualified doctor or licensed pharmacist.'}
          </p>
        </div>
      )}
    </div>
  );
};
