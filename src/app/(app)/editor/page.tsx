"use client";

import { useEffect, useState } from "react";
import ResumeForm, { ResumeData } from "@/components/home/ResumeForm";
import LatexPreview from "@/components/home/LatexPreview";
import { useSearchParams } from "next/navigation";

export default function EditorPage() {
  const search = useSearchParams();
  const templateParam = search?.get("template") || null;
  const projectParam = search?.get("projectId") || null;

  const [resumeData, setResumeData] = useState<ResumeData>({
    general: [],
    education: [],
    projects: [],
    experience: [],
  });

  const [projectId, setProjectId] = useState<string | null>(projectParam ?? null);

  useEffect(() => {
    // load project if projectParam present
    async function loadProject(id: string) {
      try {
        const res = await fetch(`/api/projects?id=${encodeURIComponent(id)}`)
        if (!res.ok) return
          const json = await res.json()

          // Debug: project payload may come in different shapes based on how Supabase returns rows.
          // Normalize possible shapes and set resume data when available.
          // Possible shapes:
          //  - { id, data: { general:..., ... }, ... }
          //  - { data: { id, data: {...} } } (wrapped)
          //  - data column stored as JSON string
          const projectRow = json?.data ?? json

          // extract the stored resume data
          let storedData = projectRow?.data ?? null

          // if storedData is a JSON string, try to parse it
          if (typeof storedData === 'string') {
            try {
              storedData = JSON.parse(storedData)
            } catch (e) {
              console.warn('Failed to parse project.data JSON string', e)
            }
          }

          // If storedData looks like a ResumeData object (has general/education/projects/experience), set it.
          if (storedData && typeof storedData === 'object' && (storedData.general || storedData.education || storedData.projects || storedData.experience)) {
            setResumeData(storedData)
          } else {
            // Sometimes the whole projectRow might actually be the saved resume object (if you saved raw)
            const maybeRaw = projectRow
            if (maybeRaw && typeof maybeRaw === 'object' && (maybeRaw.general || maybeRaw.education || maybeRaw.projects || maybeRaw.experience)) {
              setResumeData(maybeRaw as any)
            } else {
              console.warn('Project loaded but no resume data found', projectRow)
            }
          }

        // set id if available
        const pid = projectRow?.id ?? projectRow?.project_id ?? null
        if (pid) {
          setProjectId(pid)
        }
      } catch (e) {
        console.error('Failed to load project', e)
      }
    }
    if (projectParam) loadProject(projectParam)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectParam]);

  return (
    <main className="text-gray-900 dark:text-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">
        AI Resume Builder (LaTeX Generator)
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Left: Input form */}
        <ResumeForm resumeData={resumeData} setResumeData={setResumeData} projectId={projectId} setProjectId={setProjectId} templateId={templateParam} />

        {/* Right: Live LaTeX preview */}
        <LatexPreview resumeData={resumeData} templateId={templateParam ?? undefined} />
      </div>
    </main>
  );
}