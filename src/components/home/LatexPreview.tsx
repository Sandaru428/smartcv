"use client";

interface LatexPreviewProps {
  resumeData: {
    name: string;
    email: string;
    skills: string;
  };
}

export default function LatexPreview({ resumeData }: LatexPreviewProps) {
  const latexCode = `
\\documentclass{article}
\\begin{document}
\\section*{${resumeData.name}}
Email: ${resumeData.email} \\\\
\\subsection*{Skills}
${resumeData.skills}
\\end{document}
  `;

  return (
    <div className="p-6 rounded-2xl shadow-sm bg-gray-100 dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-4">Generated LaTeX Code</h2>
      <pre className="bg-white dark:bg-gray-900 text-green-400 text-sm p-4 rounded-lg overflow-x-auto">
        {latexCode}
      </pre>
    </div>
  );
}
