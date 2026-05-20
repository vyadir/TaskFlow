// Modal de creación y edición de tareas.
// Recibe el estado del formulario desde el padre (page.tsx) para evitar
// reinicializaciones al abrir/cerrar. Cierra con Escape o clic en el backdrop.
// El foco se mueve automáticamente al campo de título al abrirse.

'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { Task, TaskFormData, Status, Priority } from '@/types/task'

interface Props {
  task:       Task | null
  open:       boolean
  onClose:    () => void
  onSave:     (data: TaskFormData) => Promise<void>
  isSaving:   boolean
  formData:   TaskFormData
  setFormData: (d: TaskFormData) => void
}

const INPUT = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'
const LABEL = 'block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5'

export default function TaskModal({ task, open, onClose, onSave, isSaving, formData, setFormData }: Props) {
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) setTimeout(() => titleRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!open) return null

  const set = (key: keyof TaskFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFormData({ ...formData, [key]: e.target.value })

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {task ? 'Editar tarea' : 'Nueva tarea'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {task ? 'Modifica los campos y guarda' : 'Completa los campos para crear'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={async (e) => { e.preventDefault(); await onSave(formData) }}
          className="px-6 py-5 space-y-4"
        >
          {/* Title */}
          <div>
            <label className={LABEL}>Título *</label>
            <input
              ref={titleRef}
              type="text"
              placeholder="¿Qué hay que hacer?"
              value={formData.title}
              onChange={set('title')}
              required
              className={INPUT}
            />
          </div>

          {/* Description */}
          <div>
            <label className={LABEL}>Descripción</label>
            <textarea
              placeholder="Detalles opcionales..."
              value={formData.description}
              onChange={set('description')}
              rows={3}
              className={`${INPUT} resize-none`}
            />
          </div>

          {/* Status + Priority row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Estado</label>
              <select value={formData.status} onChange={set('status')} className={INPUT}>
                <option value="todo">Pendiente</option>
                <option value="in-progress">En progreso</option>
                <option value="done">Completada</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Prioridad</label>
              <select value={formData.priority} onChange={set('priority')} className={INPUT}>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className={LABEL}>Fecha límite</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={set('due_date')}
              className={INPUT}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || !formData.title.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-indigo-200"
            >
              {isSaving ? 'Guardando…' : task ? 'Guardar cambios' : 'Crear tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
