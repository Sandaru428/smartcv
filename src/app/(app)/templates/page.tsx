"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import templates from "../../../data/templates.json";
import { useEffect, useRef, useState } from "react";
import DialogBox from "@/components/ui/DialogBox";
import { ResumeData } from '@/components/home/ResumeForm';

interface ProjectRow {
  id: string;
  name?: string;
  template_id?: string | null;
  data?: ResumeData | null;
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
  const [openProjectMenuId, setOpenProjectMenuId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');
  const editingRef = useRef<HTMLFormElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name?: string | null } | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  // close project menu on outside click
  useEffect(() => {
    function handleClick() {
      if (openProjectMenuId) setOpenProjectMenuId(null)
    }
    if (openProjectMenuId) {
      window.addEventListener('click', handleClick)
      return () => window.removeEventListener('click', handleClick)
    }
  }, [openProjectMenuId])

  // exit inline rename when clicking outside the editing form
  useEffect(() => {
    if (!editingProjectId) return;
    function handleOutsideClick(e: MouseEvent) {
      if (editingRef.current && editingRef.current.contains(e.target as Node)) return;
      // cancel editing without saving
      setEditingProjectId(null);
    }
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [editingProjectId]);

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

  function updateScrollButtons(el?: HTMLDivElement | null) {
    const node = el ?? scrollRef.current;
    if (!node) return;
    const { scrollLeft, scrollWidth, clientWidth } = node;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Initial state
    updateScrollButtons(el);
    const onScroll = () => updateScrollButtons(el);
    el.addEventListener('scroll', onScroll, { passive: true });
    const onResize = () => updateScrollButtons(el);
    window.addEventListener('resize', onResize);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [scrollRef.current]);

  function scrollByDir(dir: 'left' | 'right') {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.max(240, Math.round(el.clientWidth * 0.9));
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-8">
      <div>
        {projects && projects.length > 0 && (
          <div className="col-span-1 md:col-span-3">
            <h3 className="text-3xl font-bold mb-8">My Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-15 px-5">
              {projects.map((p) => (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  className="relative p-4 rounded-lg bg-white dark:bg-gray-800 shadow cursor-pointer h-32 flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  {/* More menu button */}
                  {!editingProjectId && (
                    <button
                      aria-label="Project options"
                      title="Options"
                      className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenProjectMenuId((id) => (id === p.id ? null : p.id))
                      }}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                      </svg>
                    </button>
                  )}

                  {/* Dropdown */}
                  {openProjectMenuId === p.id && (
                    <div
                      className="absolute right-2 top-9 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black/10 dark:ring-white/10 z-20 py-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="menu-dropdown-item menu-dropdown-item-inactive w-full text-left"
                        onClick={() => {
                          setEditingProjectId(p.id)
                          setRenameValue(p.name ?? 'Untitled Project')
                          setOpenProjectMenuId(null)
                        }}
                      >
                        Rename
                      </button>
                      <button
                        className="menu-dropdown-item menu-dropdown-item-inactive w-full text-left text-red-600 dark:text-red-500"
                        onClick={() => {
                          setConfirmDelete({ id: p.id, name: p.name });
                          setOpenProjectMenuId(null);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                  {/* Inline rename form */}
                  {editingProjectId === p.id ? (
                    <form
                      ref={editingRef}
                      className="flex flex-col gap-2"
                      onSubmit={async (e) => {
                        e.preventDefault()
                        const name = renameValue.trim()
                        if (!name) { setEditingProjectId(null); return }
                        try {
                          const res = await fetch(`/api/projects?id=${encodeURIComponent(p.id)}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name }),
                          })
                          if (!res.ok) throw new Error('Failed to rename')
                          const updated = await res.json()
                          setProjects((prev) => prev?.map((it) => it.id === p.id ? { ...it, name: updated?.name ?? name } : it) ?? null)
                        } catch (err) {
                          console.error(err)
                        } finally {
                          setEditingProjectId(null)
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="relative">
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              e.preventDefault()
                              setEditingProjectId(null)
                            }
                          }}
                          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 pr-9 px-2 py-1 text-sm focus:outline-none"
                          placeholder="Project name"
                        />
                        <button
                          type="submit"
                          aria-label="Save project name"
                          title="Save"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-green-400 hover:text-green-500"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="font-medium text-base truncate">{p.name ?? 'Untitled'}</div>
                  )}
                  <div className="text-sm text-gray-500 truncate">Template: {p.template_id ?? '—'}</div>
                  <div className="text-xs text-gray-400">Updated: {p.created_at ? new Date(p.created_at).toLocaleString() : ''}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <h1 className="text-3xl font-bold mb-8">Choose a Template</h1>
      {/* Horizontally scrollable template selector with arrows */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          type="button"
          aria-label="Scroll templates left"
          onClick={() => scrollByDir('left')}
          className={`hidden md:flex items-center justify-center absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/80 dark:bg-gray-900/70 shadow ring-1 ring-black/10 dark:ring-white/10 hover:bg-white dark:hover:bg-gray-900 transition ${canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700 dark:text-gray-200">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        {/* Right Arrow */}
        <button
          type="button"
          aria-label="Scroll templates right"
          onClick={() => scrollByDir('right')}
          className={`hidden md:flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/80 dark:bg-gray-900/70 shadow ring-1 ring-black/10 dark:ring-white/10 hover:bg-white dark:hover:bg-gray-900 transition ${canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700 dark:text-gray-200">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        {/* Scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-10 overflow-x-auto pb-4 mx-5 snap-x snap-mandatory custom-scrollbar"
          aria-label="Resume templates"
          role="list"
        >
          {templatesList.map((t) => (
            <div
              key={t.id}
              role="button"
              tabIndex={0}
              onClick={() => handleSelect(t)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleSelect(t)
              }}
              className="flex-none w-[300px] rounded-xl bg-gray-100 dark:bg-gray-800 shadow hover:shadow-lg cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-indigo-500 snap-start"
            >
              <div className="relative w-full" style={{ aspectRatio: '210 / 250' }}>
                <Image
                  src={t.previewImage}
                  alt={t.name}
                  fill
                  sizes="170px"
                  className="object-cover"
                  priority={false}
                />
              </div>
              <div className="p-3">
                <h2 className="font-semibold text-sm leading-snug truncate" title={t.name}>{t.name}</h2>
                <p className="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-3">{t.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <DialogBox
        open={!!confirmDelete}
        title="Delete project"
        description={
          <span>
            Are you sure you want to delete <span className="font-semibold">{confirmDelete?.name ?? 'this project'}</span>? This action cannot be undone.
          </span>
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        isConfirmLoading={deleting}
        disableCancel={deleting}
        disableBackdropClose={deleting}
        onCancel={() => { if (!deleting) setConfirmDelete(null) }}
        onConfirm={async () => {
          if (!confirmDelete) return;
          setDeleting(true)
          try {
            const res = await fetch(`/api/projects?id=${encodeURIComponent(confirmDelete.id)}`, { method: 'DELETE' })
            if (!res.ok && res.status !== 204) throw new Error('Failed to delete')
            setProjects((prev) => prev?.filter((it) => it.id !== confirmDelete.id) ?? null)
          } catch (e) {
            console.error(e)
          } finally {
            setDeleting(false)
            setConfirmDelete(null)
          }
        }}
      />
    </div>
  );
}
