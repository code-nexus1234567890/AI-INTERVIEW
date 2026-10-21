"use client";

import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { FileText, CheckCircle2 } from "lucide-react";

interface ResumeProps {
  setFiles: (file: File) => void;
}

function Resume({ setFiles }: ResumeProps) {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleFileUpload = (files: File[]) => {
    if (files && files[0]) {
      setSelectedFileName(files[0].name);
      setFiles(files[0]);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3 font-sans">
      <div className="w-full mx-auto border border-dashed bg-white border-slate-300 rounded-xl overflow-hidden shadow-sm">
        <FileUpload onChange={handleFileUpload} />
      </div>

      {selectedFileName ? (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="truncate">Selected: {selectedFileName}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500">
          <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>Upload your resume (PDF) to automatically generate personalized interview questions.</span>
        </div>
      )}
    </div>
  );
}

export default Resume;
