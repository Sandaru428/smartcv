"use client";
import Input from "@/components/ui/InputField";
import TextArea from "@/components/ui/TextArea";

export interface GeneralEntry {
  [key: string]: unknown; // allow indexing by string keys (fixes usage like general[0][key])
  name: string;
  role?: string;
  birthday?: string;
  gender?: string;
  address?: string;
  email: string;
  phone?: string;
  portfolio?: string;
  linkedin?: string;
  github?: string;
  about?: string;
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
        name="role"
        value={data.role || ""}
        onChange={(e) => onChange({ role: (e.target as HTMLInputElement).value })}
        placeholder="Role"
        className="p-2"
      />

      <Input
        name="birthday"
        type="date"
        value={data.birthday || ""}
        onChange={(e) => onChange({ birthday: (e.target as HTMLInputElement).value })}
        placeholder="Birthday"
        className="p-2"
      />

      <Input
        name="gender"
        value={data.gender || ""}
        onChange={(e) => onChange({ gender: (e.target as HTMLInputElement).value })}
        placeholder="Gender"
        className="p-2"
      />

      <Input
        name="address"
        value={data.address || ""}
        onChange={(e) => onChange({ address: (e.target as HTMLInputElement).value })}
        placeholder="Address"
        className="p-2"
      />

      <Input
        name="email"
        value={data.email}
        onChange={(e) => onChange({ email: (e.target as HTMLInputElement).value })}
        placeholder="Email Address"
        className="p-2"
      />

      <Input
        name="phone"
        value={data.phone || ""}
        onChange={(e) => onChange({ phone: (e.target as HTMLInputElement).value })}
        placeholder="Phone Number"
        className="p-2"
      />

      <Input
        name="portfolio"
        value={data.portfolio || ""}
        onChange={(e) => onChange({ portfolio: (e.target as HTMLInputElement).value })}
        placeholder="Portfolio Link"
        className="p-2"
      />

      <Input
        name="linkedin"
        value={data.linkedin || ""}
        onChange={(e) => onChange({ linkedin: (e.target as HTMLInputElement).value })}
        placeholder="LinkedIn"
        className="p-2"
      />

      <Input
        name="github"
        value={data.github || ""}
        onChange={(e) => onChange({ github: (e.target as HTMLInputElement).value })}
        placeholder="GitHub"
        className="p-2"
      />

      <TextArea
        value={data.about || ""}
        onChange={(val) => onChange({ about: val })}
        placeholder="About Me"
        rows={4}
        className="p-2"
      />

    </div>
  );
}

