"use client";
import Input from "@/components/ui/InputField";

interface EducationEntry {
  school: string;
  degree: string;
  year: string;
}

interface Props {
  data: EducationEntry[];
  onChange: (next: EducationEntry[]) => void;
}

export default function EducationStep({ data, onChange }: Props) {
  const updateAt = (idx: number, patch: Partial<EducationEntry>) => {
    const next = data.map((d, i) => (i === idx ? { ...d, ...patch } : d));
    onChange(next);
  };

  const add = () => onChange([...data, { school: "", degree: "", year: "" }]);
  const remove = (idx: number) => onChange(data.filter((_, i) => i !== idx));

  return (
    <div className="flex flex-col gap-3">
      {data.map((entry, idx) => (
        <div key={idx} className="p-3 border rounded-lg bg-white dark:bg-gray-900">
          <div className="flex gap-2">
            <Input
              value={entry.school}
              onChange={(e) => updateAt(idx, { school: (e.target as HTMLInputElement).value })}
              placeholder="School"
              className="flex-1 p-2"
            />
            <Input
              value={entry.degree}
              onChange={(e) => updateAt(idx, { degree: (e.target as HTMLInputElement).value })}
              placeholder="Degree"
              className="flex-1 p-2"
            />
            <Input
              value={entry.year}
              onChange={(e) => updateAt(idx, { year: (e.target as HTMLInputElement).value })}
              placeholder="Year"
              className="w-24 p-2"
            />
          </div>

          <div className="mt-2">
            <button
              type="button"
              onClick={() => remove(idx)}
              className="text-sm text-red-500"
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <button type="button" onClick={add} className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700">
        Add Education
      </button>
    </div>
  );
}
