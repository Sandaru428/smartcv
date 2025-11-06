"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import templates from "../../../data/templates.json";
import { useEffect, useState } from "react";

interface ProjectRow {
  id: string;
  name?: string;
  template_id?: string | null;
  data?: any;
  step?: number;
  created_at?: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  latexFile: string;
}

export default function TemplatesPage() {
  const router = useRouter();
  const templatesList: Template[] = templates;
  const [projects, setProjects] = useState<ProjectRow[] | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch('/api/projects')
        if (!res.ok) return
        const json = await res.json()
        setProjects(json)
      } catch (e) {
        console.error('Failed to load projects', e)
      }
    }
    loadProjects()
  }, [])

  function handleSelect(t: Template) {
    // store selection so the home page / LatexPreview can pick it up
    try {
      // clear any persisted current project so selecting a template starts a new project
      try { localStorage.removeItem('currentProjectId') } catch {}

      localStorage.setItem("selectedTemplateId", t.id);
      localStorage.setItem("selectedTemplateLatexFile", t.latexFile);
    } catch {
      // ignore storage errors
    }
    // optional: pass query param for server/client detection
    router.push(`/editor?template=${encodeURIComponent(t.id)}`);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Choose a Template</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects && projects.length > 0 && (
          <div className="col-span-1 md:col-span-3">
            <h3 className="text-2xl font-semibold mb-4">My Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow cursor-pointer"
                  onClick={() => {
                    const base = `/editor?projectId=${encodeURIComponent(p.id)}`
                    const url = p.template_id ? `${base}&template=${encodeURIComponent(p.template_id)}` : base
                    router.push(url)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      const base = `/editor?projectId=${encodeURIComponent(p.id)}`
                      const url = p.template_id ? `${base}&template=${encodeURIComponent(p.template_id)}` : base
                      router.push(url)
                    }
                  }}
                >
                  <div className="font-medium">{p.name ?? 'Untitled'}</div>
                  <div className="text-sm text-gray-500">Template: {p.template_id ?? '—'}</div>
                  <div className="text-xs text-gray-400">Updated: {p.created_at ? new Date(p.created_at).toLocaleString() : ''}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {templatesList.map((t) => (
          <div
            key={t.id}
            role="button"
            tabIndex={0}
            onClick={() => handleSelect(t)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleSelect(t);
            }}
            className="rounded-2xl overflow-hidden shadow hover:shadow-lg cursor-pointer bg-gray-100 dark:bg-gray-800 transition"
          >
            <Image
              src={t.previewImage}
              alt={t.name}
              width={800}
              height={450}
              className="w-full h-auto"
            />
            <div className="p-4">
              <h2 className="font-semibold text-lg">{t.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
