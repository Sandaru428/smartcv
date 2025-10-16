"use client";

import { useState } from "react";
import ResumeForm from "@/components/home/ResumeForm";
import LatexPreview from "@/components/home/LatexPreview";

export default function HomePage() {
  const [resumeData, setResumeData] = useState({
    name: "",
    email: "",
    skills: "",
  });

  return (
    <main className="min-h-screen text-gray-900 dark:text-gray-100 p-8">
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
