// Tarjeta visual de una tarea individual.
// Muestra título, descripción, badges de estado/prioridad y fecha límite.
// La fecha se colorea en rojo si está vencida o en ámbar si es hoy.
// Los botones de editar/eliminar aparecen al hacer hover sobre la tarjeta.

'use client'

import { Pencil, Trash2, Calendar, Clock, CheckCircle2, Circle } from 'lucide-react'
import { Task } from '@/types/task'
import { format, isPast, isToday, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface Props {
  task:     Task
  onEdit:   (task: Task) => void
  onDelete: (task: Task) => void
}

const PRIORITY_STYLES: Record<string, { bar: string; badge: string; label: string }> = {
  high:   { bar: 'bg-red-500',    badge: 'bg-red-100 text-red-700 border-red-200',     label: 'Alta' },
  medium: { bar: 'bg-amber-400',  badge: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Media' },
  low:    { bar: 'bg-emerald-400',badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Baja' },
}

const STATUS_STYLES: Record<string, { badge: string; icon: React.ReactNode; label: string }> = {
  'todo':        { badge: 'bg-slate-100 text-slate-600 border-slate-200',     icon: <Circle        className="w-3.5 h-3.5" />, label: 'Pendiente' },
  'in-progress': { badge: 'bg-blue-100 text-blue-700 border-blue-200',        icon: <Clock         className="w-3.5 h-3.5" />, label: 'En progreso' },
  'done':        { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'Completada' },
}

export default function TaskCard({ task, onEdit, onDelete }: Props) {
  const priority = PRIORITY_STYLES[task.priority]
  const status   = STATUS_STYLES[task.status]

  const dueDateInfo = task.due_date ? (() => {
    const date = parseISO(task.due_date)
    const overdue = isPast(date) && task.status !== 'done'
    const today   = isToday(date)
    return {
      label:   format(date, 'dd MMM yyyy', { locale: es }),
      overdue,
      today,
      className: overdue
        ? 'text-red-600 font-semibold'
        : today
        ? 'text-amber-600 font-semibold'
        : 'text-slate-500',
    }
  })() : null

  return (
    <div className={`group relative bg-white rounded-2xl shadow-sm border border-slate-100
      hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden
      ${task.status === 'done' ? 'opacity-75' : ''}`}
    >
      {/* Priority bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${priority.bar}`} />

      <div className="p-5 pt-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className={`font-semibold text-slate-800 leading-snug line-clamp-2 flex-1
            ${task.status === 'done' ? 'line-through text-slate-400' : ''}`}>
            {task.title}
          </h3>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(task)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 flex-wrap mt-auto pt-3 border-t border-slate-50">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status badge */}
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${status.badge}`}>
              {status.icon}
              {status.label}
            </span>
            {/* Priority badge */}
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${priority.badge}`}>
              {priority.label}
            </span>
          </div>

          {/* Due date */}
          {dueDateInfo && (
            <span className={`flex items-center gap-1 text-xs ${dueDateInfo.className}`}>
              <Calendar className="w-3 h-3" />
              {dueDateInfo.overdue && '⚠ '}
              {dueDateInfo.label}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
