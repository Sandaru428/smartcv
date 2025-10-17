"use client";
import { useEffect, useState } from "react";
import templates from "../../data/templates.json";

interface ResumeData {
  name: string;
  email: string;
  skills: string;
}

interface LatexPreviewProps {
  resumeData?: ResumeData;
  // optional explicit templateId prop (takes precedence over URL/localStorage)
  templateId?: string;
}

interface TemplateEntry {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  latexFile: string;
}

export default function LatexPreview({ resumeData, templateId }: LatexPreviewProps) {
  const [baseTemplate, setBaseTemplate] = useState<string | null>(null); // raw template with placeholders
  const [latexCode, setLatexCode] = useState<string>(""); // final interpolated output
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // helper: replace ${resumeData.key} with values from resumeData
  function interpolateTemplate(template: string, data?: ResumeData) {
    if (!template) return "";
    return template.replace(/\$\{resumeData\.([a-zA-Z0-9_]+)\}/g, (_m, key) => {
      const val = data && (data as any)[key];
      return val != null ? String(val) : "";
    });
  }

  useEffect(() => {
    let cancelled = false;

    async function loadTemplateTex(selectedId?: string) {
      setLoading(true);
      setError(null);

      // determine id: prop > URL query > localStorage
      let id = selectedId;
      if (!id && typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        id = params.get("template") || localStorage.getItem("selectedTemplateId") || undefined;
      }

      if (id) {
        const tpl = (templates as TemplateEntry[]).find((x) => x.id === id);
        if (!tpl) {
          setError(`Template with id "${id}" not found`);
          setLoading(false);
          return;
        }

        try {
          const resp = await fetch(`/api/template?id=${encodeURIComponent(id)}`);
          if (!resp.ok) {
            const text = await resp.text().catch(() => "");
            throw new Error(`Failed to fetch template file: ${resp.status}${text ? " - " + text : ""}`);
          }
          const text = await resp.text();
          if (!cancelled) {
            setBaseTemplate(text); // keep raw template (placeholders intact)
          }
        } catch (err: any) {
          if (!cancelled) setError(err?.message || "Failed to load template file");
        } finally {
          if (!cancelled) setLoading(false);
        }
      } else {
        // no template selected — provide a default base template WITH placeholders
        const defaultBase = `
\\documentclass{article}
\\begin{document}
\\section*{\${resumeData.name}}
Email: \${resumeData.email} \\\\
\\subsection*{Skills}
\${resumeData.skills}
\\end{document}
        `;
        if (!cancelled) {
          setBaseTemplate(defaultBase);
          setLoading(false);
        }
      }
    }

    loadTemplateTex(templateId);

    return () => {
      cancelled = true;
    };
  }, [templateId]);

  // recompute final latex whenever baseTemplate or resumeData changes
  useEffect(() => {
    const final = interpolateTemplate(baseTemplate ?? "", resumeData);
    setLatexCode(final);
  }, [baseTemplate, resumeData]);

  return (
    <div className="p-6 rounded-2xl shadow-sm bg-gray-100 dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-4">Generated LaTeX Code</h2>

      {loading ? (
        <div className="text-sm text-gray-600 dark:text-gray-400">Loading template...</div>
      ) : error ? (
        <div className="text-sm text-red-500">Error: {error}</div>
      ) : (
        <pre className="bg-white dark:bg-gray-900 text-green-400 text-sm p-4 rounded-lg overflow-x-auto">
          {latexCode}
        </pre>
      )}
    </div>
  );
}
