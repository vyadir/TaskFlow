// Página principal del tablero de tareas.
// Gestiona el estado global (lista de tareas, filtros, modal y toasts)
// y orquesta los componentes TaskCard, TaskModal, ConfirmDialog y Toast.

'use client'

import { useState, useEffect, useCallback, useId } from 'react'
import {
  Plus, Search, X, CheckCircle2, Clock, Circle,
  LayoutGrid, List, Loader2, AlertCircle, RefreshCw,
} from 'lucide-react'
import { Task, TaskFormData, Status, Priority } from '@/types/task'
import { api } from '@/lib/api'
import TaskCard from '@/components/TaskCard'
import TaskModal from '@/components/TaskModal'
import Toast, { ToastData } from '@/components/Toast'

const EMPTY_FORM: TaskFormData = {
  title: '', description: '', status: 'todo', priority: 'medium', due_date: '',
}

// ─── Stats card ─────────────────────────────────────────────────────────────

function StatCard({
  label, count, icon, color,
}: { label: string; count: number; icon: React.ReactNode; color: string }) {
  return (
    <div className={`flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow-sm border border-slate-100 ${color}`}>
      <div className="p-2.5 rounded-xl bg-current bg-opacity-10">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 leading-none">{count}</p>
        <p className="text-xs font-medium text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// ─── Delete confirmation dialog ──────────────────────────────────────────────

function ConfirmDialog({
  task, onConfirm, onCancel, isDeleting,
}: { task: Task; onConfirm: () => void; onCancel: () => void; isDeleting: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-scale-in">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-red-100 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="font-bold text-slate-800">Eliminar tarea</h3>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          ¿Seguro que quieres eliminar <span className="font-semibold text-slate-700">"{task.title}"</span>? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isDeleting ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function HomePage() {
  const uid = useId()

  // Data state
  const [tasks,   setTasks]   = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  // Filters
  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState<Status | ''>('')
  const [priority, setPriority] = useState<Priority | ''>('')
  const [view,     setView]     = useState<'grid' | 'list'>('grid')

  // Modal
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editTask,   setEditTask]   = useState<Task | null>(null)
  const [formData,   setFormData]   = useState<TaskFormData>(EMPTY_FORM)
  const [isSaving,   setIsSaving]   = useState(false)

  // Delete
  const [deleteTask,  setDeleteTask]  = useState<Task | null>(null)
  const [isDeleting,  setIsDeleting]  = useState(false)

  // Toasts
  const [toasts, setToasts] = useState<ToastData[]>([])

  const toast = (type: 'success' | 'error', message: string) =>
    setToasts((t) => [...t, { id: `${Date.now()}`, type, message }])

  const removeToast = useCallback((id: string) =>
    setToasts((t) => t.filter((x) => x.id !== id)), [])

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string> = {}
      if (status)   params.status   = status
      if (priority) params.priority = priority
      if (search)   params.search   = search
      setTasks(await api.getTasks(params))
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar tareas')
    } finally {
      setLoading(false)
    }
  }, [status, priority, search])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  // ── CRUD handlers ─────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditTask(null)
    setFormData(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (task: Task) => {
    setEditTask(task)
    setFormData({
      title:       task.title,
      description: task.description ?? '',
      status:      task.status,
      priority:    task.priority,
      due_date:    task.due_date?.slice(0, 10) ?? '',
    })
    setModalOpen(true)
  }

  const handleSave = async (data: TaskFormData) => {
    setIsSaving(true)
    try {
      if (editTask) {
        const updated = await api.updateTask(editTask.id, data)
        setTasks((t) => t.map((x) => (x.id === updated.id ? updated : x)))
        toast('success', 'Tarea actualizada correctamente')
      } else {
        const created = await api.createTask(data)
        setTasks((t) => [created, ...t])
        toast('success', 'Tarea creada correctamente')
      }
      setModalOpen(false)
    } catch (e: any) {
      toast('error', e.message ?? 'Error al guardar')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTask) return
    setIsDeleting(true)
    try {
      await api.deleteTask(deleteTask.id)
      setTasks((t) => t.filter((x) => x.id !== deleteTask.id))
      toast('success', 'Tarea eliminada')
      setDeleteTask(null)
    } catch (e: any) {
      toast('error', e.message ?? 'Error al eliminar')
    } finally {
      setIsDeleting(false)
    }
  }

  // ── Derived stats ─────────────────────────────────────────────────────────

  const allTasks    = tasks
  const todoCount   = tasks.filter((t) => t.status === 'todo').length
  const inProgCount = tasks.filter((t) => t.status === 'in-progress').length
  const doneCount   = tasks.filter((t) => t.status === 'done').length
  const hasFilters  = !!(status || priority || search)

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-800 leading-none">TaskFlow</h1>
              <p className="text-[11px] text-slate-400 font-medium">Gestión de tareas</p>
            </div>
          </div>

          {/* New task button */}
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-200"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva tarea</span>
            <span className="sm:hidden">Nueva</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total"       count={allTasks.length} color="text-slate-400"  icon={<LayoutGrid   className="w-5 h-5 text-slate-400"  />} />
          <StatCard label="Pendientes"  count={todoCount}        color="text-slate-400"  icon={<Circle        className="w-5 h-5 text-slate-500"  />} />
          <StatCard label="En progreso" count={inProgCount}      color="text-blue-400"   icon={<Clock         className="w-5 h-5 text-blue-500"   />} />
          <StatCard label="Completadas" count={doneCount}        color="text-emerald-400" icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} />
        </div>

        {/* ── Filter bar ── */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar tareas…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status | '')}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm cursor-pointer"
          >
            <option value="">Todos los estados</option>
            <option value="todo">Pendiente</option>
            <option value="in-progress">En progreso</option>
            <option value="done">Completada</option>
          </select>

          {/* Priority filter */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority | '')}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm cursor-pointer"
          >
            <option value="">Todas las prioridades</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>

          {/* Clear filters */}
          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setStatus(''); setPriority('') }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition shadow-sm inline-flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> Limpiar
            </button>
          )}

          {/* View toggle */}
          <div className="flex rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-2.5 transition ${view === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2.5 transition ${view === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Task list ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-sm text-slate-500">Cargando tareas…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="p-4 bg-red-100 rounded-2xl">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-700">Error al conectar con el servidor</p>
              <p className="text-sm text-slate-500 mt-1">{error}</p>
            </div>
            <button
              onClick={fetchTasks}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition"
            >
              <RefreshCw className="w-4 h-4" /> Reintentar
            </button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-indigo-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-700">
                {hasFilters ? 'Sin resultados' : '¡No hay tareas!'}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {hasFilters
                  ? 'Prueba con otros filtros o crea una nueva tarea'
                  : 'Crea tu primera tarea para empezar'}
              </p>
            </div>
            {!hasFilters && (
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
              >
                <Plus className="w-4 h-4" /> Crear tarea
              </button>
            )}
          </div>
        ) : (
          <div className={
            view === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in'
              : 'flex flex-col gap-3 animate-fade-in'
          }>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={openEdit}
                onDelete={setDeleteTask}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Modal ── */}
      <TaskModal
        task={editTask}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        isSaving={isSaving}
        formData={formData}
        setFormData={setFormData}
      />

      {/* ── Delete confirm ── */}
      {deleteTask && (
        <ConfirmDialog
          task={deleteTask}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTask(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* ── Toasts ── */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
