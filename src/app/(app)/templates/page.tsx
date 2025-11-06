"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import templates from "../../../data/templates.json";

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

  function handleSelect(t: Template) {
    // store selection so the home page / LatexPreview can pick it up
    try {
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
