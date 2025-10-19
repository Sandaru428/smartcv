"use client";
import Input from "@/components/ui/InputField";

interface ExperienceEntry {
  company: string;
  title: string;
  years: string;
}

interface Props {
  data: ExperienceEntry[];
  onChange: (next: ExperienceEntry[]) => void;
}

export default function ExperienceStep({ data, onChange }: Props) {
  const updateAt = (idx: number, patch: Partial<ExperienceEntry>) => {
    const next = data.map((d, i) => (i === idx ? { ...d, ...patch } : d));
    onChange(next);
  };

  const add = () => onChange([...data, { company: "", title: "", years: "" }]);
  const remove = (idx: number) => onChange(data.filter((_, i) => i !== idx));

  return (
    <div className="flex flex-col gap-3">
      {data.map((e, idx) => (
        <div key={idx} className="p-3 border rounded-lg bg-white dark:bg-gray-900">
          <div className="flex gap-2">
            <Input
              value={e.company}
              onChange={(ev) => updateAt(idx, { company: (ev.target as HTMLInputElement).value })}
              placeholder="Company"
              className="flex-1 p-2"
            />
            <Input
              value={e.title}
              onChange={(ev) => updateAt(idx, { title: (ev.target as HTMLInputElement).value })}
              placeholder="Title"
              className="flex-1 p-2"
            />
            <Input
              value={e.years}
              onChange={(ev) => updateAt(idx, { years: (ev.target as HTMLInputElement).value })}
              placeholder="Years"
              className="w-24 p-2"
            />
          </div>

          <div className="mt-2">
            <button type="button" onClick={() => remove(idx)} className="text-sm text-red-500">
              Remove
            </button>
          </div>
        </div>
      ))}

      <button type="button" onClick={add} className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700">
        Add Experience
      </button>
    </div>
  );
}
