"use client";

import Input from "@/components/ui/InputField";
import TextArea from "@/components/ui/TextArea";

interface ResumeFormProps {
  resumeData: {
    name: string;
    email: string;
    skills: string;
  };
  setResumeData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      email: string;
      skills: string;
    }>
  >;
}

export default function ResumeForm({ resumeData, setResumeData }: ResumeFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setResumeData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Enter Your Details</h2>

      <form className="flex flex-col gap-4">
        <Input
          name="name"
          value={resumeData.name}
          onChange={(e) => handleChange(e as unknown as React.ChangeEvent<HTMLInputElement>)}
          placeholder="Full Name"
          className="p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
        />

        <Input
          name="email"
          value={resumeData.email}
          onChange={(e) => handleChange(e as unknown as React.ChangeEvent<HTMLInputElement>)}
          placeholder="Email Address"
          className="p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
        />

        <TextArea
          value={resumeData.skills}
          onChange={(val) => setResumeData((prev) => ({ ...prev, skills: val }))}
          placeholder="Your Skills (comma-separated)"
          rows={4}
          className="p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
        />
      </form>
    </div>
  );
}
