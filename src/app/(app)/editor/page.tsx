"use client";

import { useState } from "react";
import ResumeForm, { ResumeData } from "@/components/home/ResumeForm";
import LatexPreview from "@/components/home/LatexPreview";

export default function EditorPage() {
  const [resumeData, setResumeData] = useState<ResumeData>({
    general: [],
    education: [],
    projects: [],
    experience: [],
  });

  return (
    <main className="text-gray-900 dark:text-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">
        AI Resume Builder (LaTeX Generator)
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Left: Input form */}
        <ResumeForm resumeData={resumeData} setResumeData={setResumeData} />

        {/* Right: Live LaTeX preview */}
        <LatexPreview resumeData={resumeData} />
      </div>
    </main>
  );
}