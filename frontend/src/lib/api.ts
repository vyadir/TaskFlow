// Cliente HTTP para la API REST del backend.
// La URL base se configura con NEXT_PUBLIC_API_URL; por defecto apunta
// a localhost:4000 para desarrollo local.

import { Task, TaskFormData } from '@/types/task'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

// Wrapper genérico sobre fetch: añade Content-Type y lanza un Error
// con el mensaje del servidor cuando el status no es 2xx
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Request failed')
  return data as T
}

export const api = {
  // Obtiene todas las tareas; acepta filtros opcionales (status, priority, search)
  getTasks: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<Task[]>(`/api/tasks${qs}`)
  },
  // Crea una nueva tarea y devuelve el registro completo
  createTask: (data: TaskFormData) =>
    request<Task>('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),
  // Reemplaza todos los campos editables de una tarea existente
  updateTask: (id: number, data: TaskFormData) =>
    request<Task>(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  // Elimina una tarea por su ID
  deleteTask: (id: number) =>
    request<{ message: string }>(`/api/tasks/${id}`, { method: 'DELETE' }),
}
