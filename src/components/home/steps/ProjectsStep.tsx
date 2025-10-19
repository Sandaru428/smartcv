"use client";
import Input from "@/components/ui/InputField";
import TextArea from "@/components/ui/TextArea";

interface ProjectEntry {
  title: string;
  description: string;
}

interface Props {
  data: ProjectEntry[];
  onChange: (next: ProjectEntry[]) => void;
}

export default function ProjectsStep({ data, onChange }: Props) {
  const updateAt = (idx: number, patch: Partial<ProjectEntry>) => {
    const next = data.map((d, i) => (i === idx ? { ...d, ...patch } : d));
    onChange(next);
  };

  const add = () => onChange([...data, { title: "", description: "" }]);
  const remove = (idx: number) => onChange(data.filter((_, i) => i !== idx));

  return (
    <div className="flex flex-col gap-3">
      {data.map((p, idx) => (
        <div key={idx} className="p-3 border rounded-lg bg-white dark:bg-gray-900">
          <Input
            value={p.title}
            onChange={(e) => updateAt(idx, { title: (e.target as HTMLInputElement).value })}
            placeholder="Project Title"
            className="p-2 mb-2"
          />
          <TextArea
            value={p.description}
            onChange={(val) => updateAt(idx, { description: val })}
            placeholder="Description"
            rows={3}
            className="p-2"
          />
          <div className="mt-2">
            <button type="button" onClick={() => remove(idx)} className="text-sm text-red-500">
              Remove
            </button>
          </div>
        </div>
      ))}

      <button type="button" onClick={add} className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700">
        Add Project
      </button>
    </div>
  );
}
