"use client";

import React from "react";
import GeneralStep, { GeneralEntry } from "./steps/GeneralStep";
import EducationStep from "./steps/EducationStep";
import ProjectsStep from "./steps/ProjectsStep";
import ExperienceStep from "./steps/ExperienceStep";

interface EducationEntry {
  school: string;
  degree: string;
  year: string;
}

interface ProjectEntry {
  title: string;
  description: string;
}

interface ExperienceEntry {
  company: string;
  title: string;
  years: string;
}

export interface ResumeData {
  general: GeneralEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  experience: ExperienceEntry[];
}

interface ResumeFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  projectId?: string | null;
  setProjectId?: (id: string | null) => void;
  templateId?: string | null;
}

export default function ResumeForm({ resumeData, setResumeData, projectId, setProjectId, templateId }: ResumeFormProps) {
  const [step, setStep] = React.useState<number>(0);
  const steps = ["General", "Education", "Projects", "Experience"];

  const goNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const saveProject = async (opts?: { name?: string }) => {
    try {
      const body = {
        name: opts?.name ?? 'Untitled Project',
        // prefer explicit prop templateId passed from editor (URL-driven)
        templateId: templateId ?? null,
        data: resumeData,
        step,
      }
      const safeProjectId = projectId && projectId !== 'undefined' && projectId !== 'null' ? projectId : null

      if (safeProjectId) {
        const res = await fetch(`/api/projects?id=${encodeURIComponent(safeProjectId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          let bodyText = ''
          try {
            bodyText = await res.text()
          } catch (e) {
            bodyText = String(e)
          }
          throw new Error(`Failed to update project (status=${res.status}): ${bodyText}`)
        }
        const json = await res.json()
        return json
      } else {
        const res = await fetch(`/api/projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          let bodyText = ''
          try {
            bodyText = await res.text()
          } catch (e) {
            bodyText = String(e)
          }
          throw new Error(`Failed to create project (status=${res.status}): ${bodyText}`)
        }
        const json = await res.json()
        const id = json?.id ?? null
        if (id && setProjectId) setProjectId(id)
        return json
      }
    } catch (e) {
      console.error('Project save error', e)
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    await saveProject()
    console.log('Submitting resume data:', resumeData);
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Enter Your Details</h2>

      <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        Step {step + 1} of {steps.length}: {steps[step]}
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {step === 0 && (
          <GeneralStep
            data={
              resumeData.general && resumeData.general.length > 0
                ? resumeData.general[0]
                : {
                    name: "",
                    birthday: "",
                    gender: "",
                    address: "",
                    email: "",
                    phone: "",
                    portfolio: "",
                    linkedin: "",
                    github: "",
                    about: "",
                  }
            }
            onChange={(patch) =>
              setResumeData((prev) => {
                const nextGeneral = [...(prev.general || [])];
                if (nextGeneral.length === 0) {
                  nextGeneral[0] = {
                    name: "",
                    birthday: "",
                    gender: "",
                    address: "",
                    email: "",
                    phone: "",
                    portfolio: "",
                    linkedin: "",
                    github: "",
                    about: "",
                    ...patch,
                  };
                } else {
                  nextGeneral[0] = { ...nextGeneral[0], ...patch };
                }
                return { ...prev, general: nextGeneral };
              })
            }
          />
        )}

        {step === 1 && (
          <EducationStep
            data={resumeData.education}
            onChange={(education) => setResumeData((prev) => ({ ...prev, education }))}
          />
        )}

        {step === 2 && (
          <ProjectsStep
            data={resumeData.projects}
            onChange={(projects) => setResumeData((prev) => ({ ...prev, projects }))}
          />
        )}

        {step === 3 && (
          <ExperienceStep
            data={resumeData.experience}
            onChange={(experience) => setResumeData((prev) => ({ ...prev, experience }))}
          />
        )}

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
          >
            Back
          </button>

          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={async () => {
                // on step completion, save progress
                await saveProject()
                goNext()
              }}
              className="px-4 py-2 rounded-lg bg-emerald-500 text-white"
            >
              Next
            </button>
          ) : (
            <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white">
              Submit
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
