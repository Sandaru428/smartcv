"use client";
import { useEffect, useState } from "react";
import templates from "../../data/templates.json";

interface ResumeData {
  name: string;
  email: string;
  skills: string;
  [key: string]: string; // allow indexing by placeholder key
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
    return template.replace(/\$\{resumeData\.([a-zA-Z0-9_]+)\}/g, (_m: string, key: string) => {
      const val = data ? data[key] : undefined;
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
        } catch (caught: unknown) {
          const message = caught instanceof Error ? caught.message : String(caught);
          if (!cancelled) setError(message || "Failed to load template file");
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

  // new: render array of nodes with substituted values wrapped in a colored span
  function renderHighlighted(template: string, data?: ResumeData): React.ReactNode[] {
    if (!template) return [];
    const re = /\$\{resumeData\.([a-zA-Z0-9_]+)\}/g;
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let idx = 0;

    while ((match = re.exec(template)) !== null) {
      const start = match.index;
      const key = match[1];
      if (start > lastIndex) {
        nodes.push(template.slice(lastIndex, start));
      }
      const val = data ? data[key] : "";
      // variable value styled differently
      nodes.push(
        <span key={`var-${idx++}`} className="text-green-950 dark:text-green-50 font-medium">
          {val}
        </span>
      );
      lastIndex = re.lastIndex;
    }
    if (lastIndex < template.length) {
      nodes.push(template.slice(lastIndex));
    }
    return nodes;
  }

  return (
    <div className="p-6 rounded-2xl shadow-sm bg-gray-100 dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-4">Generated LaTeX Code</h2>

      {loading ? (
        <div className="text-sm text-gray-600 dark:text-gray-400">Loading template...</div>
      ) : error ? (
        <div className="text-sm text-red-500">Error: {error}</div>
      ) : (
        // added `custom-scrollbar` to apply the global scrollbar styles
        <pre className="bg-white dark:bg-gray-900 text-green-600 dark:text-green-400 text-sm p-4 rounded-lg overflow-auto max-h-[75vh] custom-scrollbar cursor-auto">
          {baseTemplate ? renderHighlighted(baseTemplate, resumeData) : latexCode}
        </pre>
      )}
    </div>
  );
}
