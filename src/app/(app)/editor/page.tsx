import React, { Suspense } from 'react'
import EditorClient from '@/components/editor/EditorClient';

export default function EditorPage() {
  // Server component wrapper: the actual editor UI (hooks, client-only APIs)
  // The client component that uses `useSearchParams` must be rendered inside
  // a Suspense boundary to satisfy Next.js prerendering checks.
  return (
    <Suspense fallback={<div className="p-4">Loading editor...</div>}>
      <EditorClient />
    </Suspense>
  )
}