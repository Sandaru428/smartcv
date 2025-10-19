"use client";
import Input from "@/components/ui/InputField";
import TextArea from "@/components/ui/TextArea";

interface GeneralEntry {
  name: string;
  email: string;
  skills: string;
}

interface Props {
  data: GeneralEntry;
  onChange: (patch: Partial<GeneralEntry>) => void;
}

export default function GeneralStep({ data, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <Input
        name="name"
        value={data.name}
        onChange={(e) => onChange({ name: (e.target as HTMLInputElement).value })}
        placeholder="Full Name"
        className="p-2"
      />

      <Input
        name="email"
        value={data.email}
        onChange={(e) => onChange({ email: (e.target as HTMLInputElement).value })}
        placeholder="Email Address"
        className="p-2"
      />

      <TextArea
        value={data.skills}
        onChange={(val) => onChange({ skills: val })}
        placeholder="Your Skills (comma-separated)"
        rows={3}
        className="p-2"
      />
    </div>
  );
}

